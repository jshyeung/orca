import { afterEach, describe, expect, it, vi } from 'vitest'
import os from 'node:os'

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
})

describe('macOS speech catalog visibility', () => {
  it.each(['linux', 'win32'] as const)('hides the system engine on %s', async (platform) => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue(platform)
    vi.resetModules()
    const { getCatalogModel } = await import('./model-catalog')
    expect(getCatalogModel('macos-native')).toBeUndefined()
  })

  it.each(['24.6.0', '23.0.0', 'unknown'])(
    'hides the engine on unsupported Darwin %s',
    async (release) => {
      vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin')
      vi.spyOn(os, 'release').mockReturnValue(release)
      const { getCatalogModel } = await import('./model-catalog')
      expect(getCatalogModel('macos-native')).toBeUndefined()
    }
  )

  it.each(['25.0.0', '26.0.0'])('offers a system-managed engine on Darwin %s', async (release) => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin')
    vi.spyOn(os, 'release').mockReturnValue(release)
    vi.resetModules()
    const { getCatalogModel, isLocalSpeechModel } = await import('./model-catalog')
    const model = getCatalogModel('macos-native')
    expect(model?.provider).toBe('macos-native')
    expect(model?.downloadFiles).toBeUndefined()
    expect(model && isLocalSpeechModel(model)).toBe(false)
  })
})
