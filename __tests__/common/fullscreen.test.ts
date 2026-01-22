import {
  Fullscreen,
  FullscreenState,
  FullscreenErrorCode,
  FullscreenError
} from '../../src/common/fullscreen'

const dispatchFullscreenEvent = (type: string) => {
  document.dispatchEvent(new CustomEvent(type, { bubbles: true }))
}

describe('Fullscreen API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Fullscreen.destroy()

    ;(Fullscreen as any).supportedAPI = null
    ;(Fullscreen as any).isInitialized = false
    ;(Fullscreen as any).eventCallbacks?.clear?.()

    Object.defineProperty(document, 'fullscreenElement', {
      value: null, writable: true, configurable: true
    })
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: true, writable: true, configurable: true
    })
  })

  describe('FullscreenState enum', () => {
    test('should have correct enum values', () => {
      expect(FullscreenState.UNSUPPORTED).toBe('unsupported')
      expect(FullscreenState.OFF).toBe('off')
      expect(FullscreenState.ON).toBe('on')
    })
  })

  describe('FullscreenErrorCode enum', () => {
    test('should have correct enum values', () => {
      expect(FullscreenErrorCode.NOT_SUPPORTED).toBe('NOT_SUPPORTED')
      expect(FullscreenErrorCode.USER_GESTURE_REQUIRED).toBe('USER_GESTURE_REQUIRED')
      expect(FullscreenErrorCode.IOS_VIDEO_ONLY).toBe('IOS_VIDEO_ONLY')
      expect(FullscreenErrorCode.PERMISSION_DENIED).toBe('PERMISSION_DENIED')
    })
  })

  describe('Initialization', () => {
    test('should initialize successfully with supported API', () => {
      Fullscreen.init()
      expect(Fullscreen.isSupported).toBe(true)
    })

    test('should handle initialization when document is undefined', () => {
      const origDoc = global.document
      delete (global as any).document

      expect(() => Fullscreen.init()).not.toThrow()

      ;(global as any).document = origDoc
      Fullscreen.init()
    })

    test('should detect iOS correctly', () => {
      ;(Fullscreen as any).isIOS = true
      expect((Fullscreen as any).isIOS).toBe(true)
    })
  })

  describe('API Detection', () => {
    beforeEach(() => {
      Fullscreen.destroy()
      ;(Fullscreen as any).supportedAPI = null
      ;(Fullscreen as any).isInitialized = false
    })

    test('should prefer standard API when available', () => {
      Fullscreen.init()
      expect((Fullscreen as any).supportedAPI?.request).toBe('requestFullscreen')
    })

    test('should handle no supported API', () => {
      ;['requestFullscreen', 'webkitRequestFullscreen', 'mozRequestFullScreen', 'msRequestFullscreen']
        .forEach(api => {
          Object.defineProperty(Element.prototype, api, {
            get() { return undefined },
            configurable: true
          })
        })

      const mockElement = {} as any
      const origDocumentElement = document.documentElement
      Object.defineProperty(document, 'documentElement', {
        value: mockElement,
        writable: true,
        configurable: true
      })

      Fullscreen.init()
      expect(Fullscreen.isSupported).toBe(false)

      Object.defineProperty(document, 'documentElement', {
        value: origDocumentElement,
        writable: true,
        configurable: true
      })
    })
  })

  describe('Enter Fullscreen', () => {
    beforeEach(() => {
      Fullscreen.init()
      ;(Fullscreen as any).isIOS = false
    })

    test('should enter fullscreen successfully', async () => {
      const element = document.createElement('div') as any
      element.requestFullscreen = jest.fn()

      Object.defineProperty(document, 'fullscreenElement', {
        value: element,
        writable: true,
        configurable: true
      })

      const promise = Fullscreen.enter(element)
      dispatchFullscreenEvent('fullscreenchange')

      const result = await promise
      expect(element.requestFullscreen).toHaveBeenCalled()
      expect(result).toBe(FullscreenState.ON)
    })

    test('should allow video elements on iOS', async () => {
      ;(Fullscreen as any).isIOS = true
      const video = document.createElement('video') as any
      video.requestFullscreen = jest.fn()

      Object.defineProperty(document, 'fullscreenElement', {
        value: video,
        writable: true,
        configurable: true
      })

      const promise = Fullscreen.enter(video)
      dispatchFullscreenEvent('fullscreenchange')

      const result = await promise
      expect(video.requestFullscreen).toHaveBeenCalled()
      expect(result).toBe(FullscreenState.ON)
    })

    test('should handle request errors', async () => {
      const element = document.createElement('div') as any
      element.requestFullscreen = jest.fn()

      const promise = Fullscreen.enter(element)
      dispatchFullscreenEvent('fullscreenerror')

      await expect(promise).rejects.toThrow(FullscreenError)
    })
  })

  describe('Exit Fullscreen', () => {
    beforeEach(() => Fullscreen.init())

    test('should exit fullscreen successfully', async () => {
      Object.defineProperty(document, 'exitFullscreen', {
        value: jest.fn(),
        writable: true,
        configurable: true
      })

      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true
      })

      const promise = Fullscreen.exit()
      dispatchFullscreenEvent('fullscreenchange')

      await promise
      expect((document as any).exitFullscreen).toHaveBeenCalled()
    })
  })

  describe('Toggle Fullscreen', () => {
    beforeEach(() => {
      Fullscreen.init()
      ;(Fullscreen as any).isIOS = false
    })

    test('should enter when currently off', async () => {
      const element = document.createElement('div') as any
      element.requestFullscreen = jest.fn()

      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        writable: true,
        configurable: true
      })

      const promise = Fullscreen.toggle(element)
      Object.defineProperty(document, 'fullscreenElement', {
        value: element,
        writable: true,
        configurable: true
      })
      dispatchFullscreenEvent('fullscreenchange')

      const result = await promise
      expect(element.requestFullscreen).toHaveBeenCalled()
      expect(result).toBe(FullscreenState.ON)
    })

    test('should exit when currently on', async () => {
      Object.defineProperty(document, 'exitFullscreen', {
        value: jest.fn(),
        writable: true,
        configurable: true
      })

      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true
      })

      const promise = Fullscreen.toggle()
      dispatchFullscreenEvent('fullscreenchange')

      await promise
    })
  })

  describe('State Management', () => {
    beforeEach(() => Fullscreen.init())

    test('should return correct state when fullscreen is off', () => {
      expect(Fullscreen.state).toBe(FullscreenState.OFF)
    })

    test('should return correct state when fullscreen is on', () => {
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true
      })
      expect(Fullscreen.state).toBe(FullscreenState.ON)
    })

    test('should return current element when in fullscreen', () => {
      const element = document.createElement('div')
      Object.defineProperty(document, 'fullscreenElement', {
        value: element,
        writable: true,
        configurable: true
      })
      expect(Fullscreen.element).toBe(element)
    })

    test('should check if fullscreen is enabled', () => {
      expect(Fullscreen.isEnabled).toBe(true)
    })
  })

  describe('Event Handling', () => {
    beforeEach(() => Fullscreen.init())

    test('should subscribe and unsubscribe to change events', () => {
      const callback = jest.fn()
      const unsubscribe = Fullscreen.on('change', callback)
      ;(Fullscreen as any).handleChange(new Event('fullscreenchange'))
      expect(callback).toHaveBeenCalled()
      callback.mockClear()
      unsubscribe()
      ;(Fullscreen as any).handleChange(new Event('fullscreenchange'))
      expect(callback).not.toHaveBeenCalled()
    })

    test('should subscribe and unsubscribe to error events', () => {
      const callback = jest.fn()
      const unsubscribe = Fullscreen.on('error', callback)
      ;(Fullscreen as any).handleError(new Event('fullscreenerror'))
      expect(callback).toHaveBeenCalled()
      callback.mockClear()
      unsubscribe()
      ;(Fullscreen as any).handleError(new Event('fullscreenerror'))
      expect(callback).not.toHaveBeenCalled()
    })

    test('should call multiple callbacks for same event', () => {
      const cb1 = jest.fn(), cb2 = jest.fn()
      Fullscreen.on('change', cb1)
      Fullscreen.on('change', cb2)
      ;(Fullscreen as any).handleChange(new Event('fullscreenchange'))
      expect(cb1).toHaveBeenCalled()
      expect(cb2).toHaveBeenCalled()
    })
  })

  describe('Info Method', () => {
    test('should return correct info object', () => {
      Fullscreen.init()
      const info = Fullscreen.info()
      expect(info.state).toBe(FullscreenState.OFF)
      expect(info.element).toBeNull()
    })
  })

  describe('Cleanup', () => {
    test('should cleanup event listeners', () => {
      const spy = jest.spyOn(document, 'removeEventListener')
      Fullscreen.init()
      Fullscreen.destroy()
      expect(spy).toHaveBeenCalled()
    })

    test('should not cleanup when not initialized', () => {
      const spy = jest.spyOn(document, 'removeEventListener')
      Fullscreen.destroy()
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('FullscreenError Class', () => {
    test('should create error with correct properties', () => {
      const error = new FullscreenError(FullscreenErrorCode.USER_GESTURE_REQUIRED, 'Test')
      expect(error.code).toBe(FullscreenErrorCode.USER_GESTURE_REQUIRED)
      expect(error.message).toBe('Test')
      expect(error.name).toBe('FullscreenError')
    })

    test('should handle all error codes', () => {
      const codes = [
        FullscreenErrorCode.NOT_SUPPORTED,
        FullscreenErrorCode.USER_GESTURE_REQUIRED,
        FullscreenErrorCode.IOS_VIDEO_ONLY,
        FullscreenErrorCode.PERMISSION_DENIED,
      ];

      codes.forEach(code => {
        const error = new FullscreenError(code, 'Test')
        expect(error.code).toBe(code)
      })
    })
  })
})
