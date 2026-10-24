import { afterEach, describe, expect, it, vi } from 'vitest'

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

  it('offers a system-managed engine without downloadable files on macOS', async () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin')
    vi.resetModules()
    const { getCatalogModel, isLocalSpeechModel } = await import('./model-catalog')
    const model = getCatalogModel('macos-native')
    expect(model?.provider).toBe('macos-native')
    expect(model?.downloadFiles).toBeUndefined()
    expect(model && isLocalSpeechModel(model)).toBe(false)
  })
})
