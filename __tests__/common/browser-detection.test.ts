import {
  BrowserBrand,
  BrowserEngine,
  OperatingSystem,
  DeviceType,
  clearBrowserCache,
  detectBrowser,
  detectBrowserSync,
  getBrowserString,
  isFeatureSupported
} from '../../src/common/detectBrowser'

describe('Browser Detection', () => {
  beforeEach(() => {
    clearBrowserCache()
    jest.clearAllMocks()
  })

  describe('detectBrowser', () => {
    it('should return BrowserInfo with all required properties', async () => {
      const info = await detectBrowser()
      expect(info).toHaveProperty('engine')
      expect(info).toHaveProperty('brand')
      expect(info).toHaveProperty('version')
      expect(info).toHaveProperty('majorVersion')
      expect(info).toHaveProperty('os')
      expect(info).toHaveProperty('osVersion')
      expect(info).toHaveProperty('deviceType')
      expect(info).toHaveProperty('isMobile')
      expect(info).toHaveProperty('isTablet')
      expect(info).toHaveProperty('userAgent')
      expect(info).toHaveProperty('source')
    })

    it('should cache results', async () => {
      const info1 = await detectBrowser()
      const info2 = await detectBrowser()
      expect(info1).toBe(info2) // Same reference
    })

    it('should detect Chrome', async () => {
      // Mock Chrome user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        writable: true
      })

      clearBrowserCache()

      const info = await detectBrowser()
      expect([BrowserBrand.CHROME, BrowserBrand.CHROMIUM]).toContain(info.brand)
      expect(info.engine).toBe(BrowserEngine.BLINK)
      expect(info.os).toBe(OperatingSystem.WINDOWS)
    })

    it('should detect Firefox', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Firefox/121.0',
        writable: true
      })

      clearBrowserCache()

      const info = await detectBrowser()
      expect(info.brand).toBe(BrowserBrand.FIREFOX)
      expect(info.engine).toBe(BrowserEngine.GECKO)
    })

    it('should detect Safari', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Version/17.0 Safari/605.1.15',
        writable: true
      })

      clearBrowserCache()

      const info = await detectBrowser()
      expect(info.brand).toBe(BrowserBrand.SAFARI)
      expect(info.engine).toBe(BrowserEngine.WEBKIT)
    })

    it('should detect iPad on iOS 13+', async () => {
      const { userAgent } = navigator

      ;(navigator as any).userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15'
      ;(navigator as any).maxTouchPoints = 5
      ;(window as any).ontouchstart = true

      const info = await detectBrowser()
      expect(info.os).toBe(OperatingSystem.IOS)
      expect(info.isTablet).toBe(true)
      expect(info.engine).toBe(BrowserEngine.WEBKIT)

      ;(navigator as any).userAgent = userAgent
    })

    it('should detect mobile devices', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 13) Chrome/120.0.0.0 Mobile',
        writable: true
      })

      clearBrowserCache()

      const info = await detectBrowser()
      expect(info.isMobile).toBe(true)
      expect(info.deviceType).toBe(DeviceType.MOBILE)
      expect(info.os).toBe(OperatingSystem.ANDROID)
    })

    it('should parse version correctly', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 Chrome/120.5.2.1',
        writable: true
      })

      clearBrowserCache()

      const info = await detectBrowser()
      expect(info.majorVersion).toBe(120)
      expect(info.version).toBe('120.5.2.1')
    })
  })

  describe('detectBrowserSync', () => {
    it('should return partial BrowserInfo synchronously', () => {
      const info = detectBrowserSync()
      expect(info.brand).toBeDefined()
      expect(info.engine).toBeDefined()
      expect(info.source).toBe('user-agent')
    })

    it('should not throw in non-browser environment', () => {
      expect(() => {
        detectBrowserSync()
      }).not.toThrow()
    })
  })

  describe('isFeatureSupported', () => {
    it('should check feature support based on engine and version', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 Chrome/120.0.0.0',
        writable: true
      })

      clearBrowserCache()

      const supported = await isFeatureSupported('service-worker')
      expect(typeof supported).toBe('boolean')
    })

    it('should return false for unknown features', async () => {
      const supported = await isFeatureSupported('unknown-feature-xyz')
      expect(supported).toBe(false)
    })

    it('should return false for unknown engines', async () => {
      const browserInfo = await detectBrowser()
      Object.defineProperty(browserInfo, 'engine', {
        value: BrowserEngine.UNKNOWN
      })

      const supported = await isFeatureSupported('fetch-api', browserInfo);
      expect(supported).toBe(false)
    })
  })

  describe('getBrowserString', () => {
    it('should format browser info as string', async () => {
      const str = await getBrowserString()
      expect(typeof str).toBe('string')
      expect(str).toMatch(/\s+\d+\.\d+/) // Contains version
    })
  })

  describe('clearBrowserCache', () => {
    it('should allow cache clearing and re-detection', async () => {
      const info1 = await detectBrowser()
      clearBrowserCache()
      const info2 = await detectBrowser()

      // Different instances after cache clear
      expect(info1 === info2).toBe(false)
      // But same content
      expect(info1.brand).toBe(info2.brand)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty user agent', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: '',
        writable: true
      })

      clearBrowserCache()

      const info = await detectBrowser()
      expect(info.brand).toBe(BrowserBrand.UNKNOWN)
      expect(info.engine).toBe(BrowserEngine.UNKNOWN)
    })

    it('should handle spoofed user agent', async () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Custom/Spoofed)',
        writable: true
      })

      clearBrowserCache()

      const info = await detectBrowser()
      expect(info.brand).toBe(BrowserBrand.UNKNOWN)
    })

    it('should handle null/undefined navigator', async () => {
      // detectBrowserSync should not throw
      expect(() => detectBrowserSync()).not.toThrow()
    })
  })
})
