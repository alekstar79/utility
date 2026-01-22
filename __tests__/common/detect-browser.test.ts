import {
  detectBrowser,
  detectBrowserSync,
  clearBrowserCache,
  isFeatureSupported,
  getBrowserString,
  BrowserEngine,
  BrowserBrand,
  OperatingSystem,
  DeviceType,
} from '../../src/common/detectBrowser'

let originalUserAgent: string | null = null
let originalPlatform: string | null = null

beforeAll(() => {
  originalUserAgent = (navigator as any).userAgent
  originalPlatform = (navigator as any).platform
})

beforeEach(() => {
  cleanupExtraProperties()
  forceDefineUserAgent('Mozilla/5.0 (linux) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0')
  forceDefinePlatform('Linux x86_64')
  clearBrowserCache()
})

afterEach(() => {
  if (originalUserAgent !== null) {
    forceDefineUserAgent(originalUserAgent)
  }
  if (originalPlatform !== null) {
    forceDefinePlatform(originalPlatform)
  }
  cleanupExtraProperties()
})

const forceDefineUserAgent = (value: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    value,
    writable: true,
    configurable: true,
    enumerable: true
  })
}

const forceDefinePlatform = (value: string) => {
  Object.defineProperty(navigator, 'platform', {
    value,
    writable: true,
    configurable: true,
    enumerable: true
  })
}

const forceDefineProperty = (obj: any, prop: string, value: any) => {
  Object.defineProperty(obj, prop, {
    value,
    writable: true,
    configurable: true,
    enumerable: true
  })
}

const createSecureUAData = (opts: any) => ({
  brands: opts.brands || [{ brand: 'Chromium', version: '120' }, { brand: 'Google Chrome', version: '120' }],
  mobile: opts.mobile || false,
  platform: opts.platform || 'Windows',
  platformVersion: opts.platformVersion || '10.0.0',
  architecture: 'x86',
  model: '',
  bitness: '64',
  uaFullVersion: '120.0.6099.71',
  fullVersionList: opts.brands || [{ brand: 'Chromium', version: '120' }, { brand: 'Google Chrome', version: '120' }],
  getHighEntropyValues: (_hints: string[]) => Promise.resolve({
    platformVersion: opts.platformVersion || '10.0.0',
    model: '',
    architecture: 'x86',
    bitness: '64',
    uaFullVersion: '120.0.6099.71',
    fullVersionList: opts.brands || [{ brand: 'Chromium', version: '120' }, { brand: 'Google Chrome', version: '120' }]
  } as any)
})

const setupNavigator = (userAgent: string, opts: any = {}) => {
  forceDefineUserAgent(userAgent)

  const platform = opts.platform || (
    userAgent.includes('Windows')
      ? 'Win32'
      : userAgent.includes('Mac')
        ? 'MacIntel'
        : userAgent.includes('Android')
          ? 'Linux armv8l'
          : 'Linux x86_64'
  )

  forceDefinePlatform(platform)

  if (opts.maxTouchPoints !== undefined) {
    forceDefineProperty(navigator, 'maxTouchPoints', opts.maxTouchPoints)
  }
  if (opts.userAgentData !== undefined) {
    forceDefineProperty(window, 'isSecureContext', true)
    forceDefineProperty(navigator, 'userAgentData', createSecureUAData(opts.userAgentData))
  }
  if (opts.isSecureContext !== undefined) {
    forceDefineProperty(window, 'isSecureContext', opts.isSecureContext)
  }
}

const cleanupExtraProperties = () => {
  ['maxTouchPoints', 'userAgentData', 'isSecureContext'].forEach(prop => {
    if (prop in navigator) delete (navigator as any)[prop]
    if (prop in window) delete (window as any)[prop]
  })
}

describe('browserDetection', () => {
  describe('01. CLIENT HINTS', () => {
    it('Chrome Client Hints → client-hints source', async () => {
      setupNavigator('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36', {
        userAgentData: {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows'
        }
      })

      const info = await detectBrowser()
      expect(info.source).toBe('client-hints')
      expect(info.brand).toBe(BrowserBrand.CHROME)
    })

    it('empty Client Hints → UA fallback', async () => {
      setupNavigator('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36')
      const info = await detectBrowser()
      expect(info.source).toBe('user-agent')
      expect(info.brand).toBe(BrowserBrand.CHROME)
    })

    it('Client Hints без brands → UA fallback', async () => {
      setupNavigator('', {
        userAgentData: {
          brands: [],
          mobile: false,
          platform: 'Windows'
        }
      })

      const info = await detectBrowser()
      expect(info.source).toBe('user-agent')
    })

    it('Client Hints с undefined → UA fallback', async () => {
      forceDefineProperty(navigator, 'userAgentData', undefined)
      setupNavigator('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36')
      const info = await detectBrowser()
      expect(info.source).toBe('user-agent')
    })
  })

  describe('02. BROWSER DETECTION', () => {
    const cases: [string, BrowserBrand, BrowserEngine][] = [
      ['Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36', BrowserBrand.CHROME, BrowserEngine.BLINK],
      ['Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Edg/120 Safari/537.36', BrowserBrand.EDGE, BrowserEngine.BLINK],
      ['Mozilla/5.0 (Windows NT 10.0; rv:120.0) Gecko/20100101 Firefox/120.0', BrowserBrand.FIREFOX, BrowserEngine.GECKO],
      ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.1 Safari/605.1.15', BrowserBrand.SAFARI, BrowserEngine.WEBKIT],
      ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) OPR/106.0.0.0 Chrome/120 Safari/537.36', BrowserBrand.OPERA, BrowserEngine.BLINK],

      // ✅ V9 FINAL FIX: Специальный setupNavigator БЕЗ isSecureContext для CriOS
      ['Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1', BrowserBrand.CRIOS, BrowserEngine.BLINK],

      ['Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36', BrowserBrand.CHROME, BrowserEngine.BLINK],
      ['Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36', BrowserBrand.CHROME, BrowserEngine.BLINK],
      ['Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Version/16.0 Safari/605.1.15', BrowserBrand.SAFARI, BrowserEngine.WEBKIT],
      ['Mozilla/5.0 (Unknown UA)', BrowserBrand.UNKNOWN, BrowserEngine.UNKNOWN]
    ]

    cases.forEach(([ua, brand, engine], i) => {
      it(`browser #${i + 1}: ${brand}`, async () => {
        if (i === 5) {
          cleanupExtraProperties()
          forceDefineUserAgent(ua)
          forceDefinePlatform('iPhone')
        } else {
          setupNavigator(ua)
        }

        const info = await detectBrowser()
        expect(info.brand).toBe(brand)
        expect(info.engine).toBe(engine)
      })
    })
  })

  describe('03. OS DETECTION (5)', () => {
    it('Windows NT 10.0 → Windows', async () => {
      setupNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
      const info = await detectBrowser()
      expect(info.os).toBe(OperatingSystem.WINDOWS)
    })

    it('Mac OS X 10_15_7 → macOS', async () => {
      setupNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
      const info = await detectBrowser()
      expect(info.os).toBe(OperatingSystem.MACOS)
    })

    it('Android 13 → Android (not Linux)', async () => {
      setupNavigator('Mozilla/5.0 (Linux; Android 13; SM-G998B)')
      const info = await detectBrowser()
      expect(info.os).toBe(OperatingSystem.ANDROID)
    })

    it('iPhone → iOS', async () => {
      setupNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')
      const info = await detectBrowser()
      expect(info.os).toBe(OperatingSystem.IOS)
    })

    it('Client Hints platform=macOS', async () => {
      setupNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', {
        userAgentData: {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          platform: 'macOS',
          platformVersion: '14.0'
        }
      })

      const info = await detectBrowser()
      expect(info.os).toBe(OperatingSystem.MACOS)
    })
  })

  describe('04. DEVICE TYPE (4)', () => {
    it('iPhone → MOBILE', async () => {
      setupNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')
      const info = await detectBrowser()
      expect(info.deviceType).toBe(DeviceType.MOBILE)
    })

    it('Android tablet → TABLET', async () => {
      setupNavigator('Mozilla/5.0 (Linux; Android 13; SM-T870)', { maxTouchPoints: 5 })
      const info = await detectBrowser()
      expect(info.deviceType).toBe(DeviceType.TABLET)
    })

    it('Client Hints mobile=true', async () => {
      setupNavigator('Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36', {
        userAgentData: {
          brands: [{ brand: 'Chrome', version: '120' }],
          mobile: true,
          platform: 'Android'
        }
      })

      const info = await detectBrowser()
      expect(info.isMobile).toBe(true)
    })

    it('Desktop by default', async () => {
      setupNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
      const info = await detectBrowser()
      expect(info.deviceType).toBe(DeviceType.DESKTOP)
    })
  })

  describe('05. VERSION PARSING', () => {
    it('Chrome/120 → majorVersion=120', async () => {
      setupNavigator('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120.0.6099.71 Safari/537.36')
      const info = await detectBrowser()
      expect(info.majorVersion).toBe(120)
    })

    it('Firefox/120 → majorVersion=120', async () => {
      setupNavigator('Mozilla/5.0 (Windows NT 10.0; rv:120.0) Gecko/20100101 Firefox/120.0')
      const info = await detectBrowser()
      expect(info.majorVersion).toBe(120)
    })
  })

  describe('06. SYNCHRONOUS API', () => {
    it('detectBrowserSync без window', () => {
      const originalWindow = global.window
      delete (global as any).window
      const info = detectBrowserSync()
      ;(global as any).window = originalWindow
      expect(info.brand).toBe(BrowserBrand.UNKNOWN)
    })

    it('detectBrowserSync Chrome', () => {
      setupNavigator('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36')
      const info = detectBrowserSync()
      expect(info.brand).toBe(BrowserBrand.CHROME)
    })
  })

  describe('07. FEATURE SUPPORT', () => {
    it('Chrome 120 → web-workers=true', async () => {
      setupNavigator('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36')
      const supported = await isFeatureSupported('web-workers')
      expect(supported).toBe(true)
    })

    it('Chrome 3 → web-workers=false', async () => {
      setupNavigator('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/3 Safari/537.36')
      const supported = await isFeatureSupported('web-workers')
      expect(supported).toBe(false)
    })

    it('unknown feature=false', async () => {
      setupNavigator('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36')
      const supported = await isFeatureSupported('non-existent-feature')
      expect(supported).toBe(false)
    })
  })

  describe('08. CACHING & UTILS', () => {
    it('memoization возвращает тот же объект', async () => {
      setupNavigator('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36')
      const info1 = await detectBrowser()
      const info2 = await detectBrowser()
      expect(info1).toBe(info2)
    })

    it('clearBrowserCache сбрасывает', async () => {
      setupNavigator('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36')
      const info1 = await detectBrowser()
      clearBrowserCache()
      const info2 = await detectBrowser()
      expect(info1).not.toBe(info2)
    })

    it('getBrowserString Chrome+Windows', async () => {
      setupNavigator('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36')
      const str = await getBrowserString()
      expect(str).toContain('Chrome')
      expect(str).toContain('Windows')
    })
  })

  describe('09. EDGE CASES', () => {
    it('no navigator → UNKNOWN', async () => {
      const originalNav = global.navigator
      delete (global as any).navigator
      const info = await detectBrowser()
      ;(global as any).navigator = originalNav
      expect(info.brand).toBe(BrowserBrand.UNKNOWN)
    })

    it('non-secure context → UA fallback', async () => {
      setupNavigator('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36', {
        isSecureContext: false
      })

      const info = await detectBrowser()
      expect(info.source).toBe('user-agent')
    })

    it('iPadOS touch detection', async () => {
      setupNavigator('Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15', {
        maxTouchPoints: 5
      })

      const info = await detectBrowser()
      expect(info.deviceType).toBe(DeviceType.TABLET)
    })
  })
})
