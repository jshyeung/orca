import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFile, access } from 'node:fs/promises'
import { runProcess } from '@orca/process-host'
import { MacosSpeechSession } from './macos-speech-session'

vi.mock('@orca/process-host', () => ({ runProcess: vi.fn() }))
afterEach(() => {
  vi.restoreAllMocks()
})

describe('macOS speech session', () => {
  it('rejects unsupported hosts', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('linux')
    expect(() => new MacosSpeechSession()).toThrow('only available on macOS')
  })

  it('resamples recorded audio and removes the private WAV after recognition', async () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin')
    let file = ''
    vi.mocked(runProcess).mockImplementation(async (spec) => {
      file = String(spec.args?.[0])
      const wav = await readFile(file)
      expect(wav.toString('ascii', 0, 4)).toBe('RIFF')
      expect(wav.readUInt32LE(24)).toBe(16000)
      expect(wav.readUInt32LE(40)).toBe(16000 * 2)
      expect(spec.program).toMatch(/orca-speech$/)
      return { code: 0, signal: null, stdout: 'hello\n', stderr: '', timedOut: false }
    })
    const session = new MacosSpeechSession()
    session.feedAudio(new Float32Array(48000), 48000)
    expect(await session.finish()).toBe('hello')
    await expect(access(file)).rejects.toThrow()
  })

  it('removes recorded audio and surfaces permission failures', async () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin')
    let file = ''
    vi.mocked(runProcess).mockImplementation(async (spec) => {
      file = String(spec.args?.[0])
      return { code: 1, signal: null, stdout: '', stderr: 'Permission denied', timedOut: false }
    })
    const session = new MacosSpeechSession()
    session.feedAudio(new Float32Array(160), 16000)
    await expect(session.finish()).rejects.toThrow('Permission denied')
    await expect(access(file)).rejects.toThrow()
  })
})
