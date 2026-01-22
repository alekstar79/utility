import {
  Fullscreen,
  FullscreenState,
  FullscreenErrorCode,
  FullscreenError
} from '../../src/common/fullscreen'

const dispatchFullscreenEvent = (type: string) => {
  document.dispatchEvent(new CustomEvent(type, { bubbles: true }))
}

const setupDocumentProperties = (fullscreenElement: Element | null = null, fullscreenEnabled = true) => {
  Object.defineProperty(document, 'fullscreenElement', {
    value: fullscreenElement, writable: true, configurable: true
  })
  Object.defineProperty(document, 'fullscreenEnabled', {
    value: fullscreenEnabled, writable: true, configurable: true
  })
}

describe('Fullscreen Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Fullscreen.destroy()
    ;(Fullscreen as any).supportedAPI = null
    ;(Fullscreen as any).isInitialized = false
    ;(Fullscreen as any).eventCallbacks?.clear?.()
    setupDocumentProperties()
  })

  describe('SSR Compatibility', () => {
    test('should handle server-side rendering gracefully', () => {
      const origDocElement = document.documentElement
      const mockElement = {} as any

      Object.defineProperty(document, 'documentElement', {
        value: mockElement, writable: true, configurable: true
      })

      expect(() => Fullscreen.init()).not.toThrow()
      expect(Fullscreen.isSupported).toBe(false)
      expect(Fullscreen.state).toBe(FullscreenState.UNSUPPORTED)

      Object.defineProperty(document, 'documentElement', {
        value: origDocElement, writable: true, configurable: true
      })
    })

    test('should work correctly when document becomes available', () => {
      const origDocElement = document.documentElement
      const mockElement = {} as any

      Object.defineProperty(document, 'documentElement', {
        value: mockElement, writable: true, configurable: true
      })

      Fullscreen.init()
      expect(Fullscreen.isSupported).toBe(false)

      Object.defineProperty(document, 'documentElement', {
        value: origDocElement, writable: true, configurable: true
      })

      Fullscreen.destroy()
      Fullscreen.init()
      expect(Fullscreen.isSupported).toBe(true)
    })
  })

  describe('Real Browser API Simulation', () => {
    beforeEach(() => {
      Fullscreen.init()
      setupDocumentProperties()
    })

    test('should handle full lifecycle with async events', async () => {
      const element = document.createElement('div') as any
      element.requestFullscreen = jest.fn(() => Promise.resolve())

      const enterPromise = Fullscreen.enter(element)
      setupDocumentProperties(element)
      dispatchFullscreenEvent('fullscreenchange')

      const result = await enterPromise
      expect(result).toBe(FullscreenState.ON)

      const exitPromise = Fullscreen.exit()
      setupDocumentProperties(null)
      dispatchFullscreenEvent('fullscreenchange')

      await exitPromise
    })

    test('should handle navigationUI option', async () => {
      const element = document.createElement('div') as any
      const options = { navigationUI: 'hide' as const }
      element.requestFullscreen = jest.fn(() => Promise.resolve())

      const promise = Fullscreen.enter(element, options)
      setupDocumentProperties(element)
      dispatchFullscreenEvent('fullscreenchange')

      await promise
      expect(element.requestFullscreen).toHaveBeenCalledWith(options)
    })

    test('should handle toggle functionality', async () => {
      const element = document.createElement('div') as any
      element.requestFullscreen = jest.fn(() => Promise.resolve())

      const promise1 = Fullscreen.toggle(element)
      setupDocumentProperties(element)
      dispatchFullscreenEvent('fullscreenchange')
      await promise1

      const promise2 = Fullscreen.toggle()
      setupDocumentProperties(null)
      dispatchFullscreenEvent('fullscreenchange')
      await promise2
    })

    test('should dispatch change events to subscribers', async () => {
      const changeCallback = jest.fn()
      Fullscreen.on('change', changeCallback)

      const element = document.createElement('div') as any
      element.requestFullscreen = jest.fn(() => Promise.resolve())

      const enterPromise = Fullscreen.enter(element)
      setupDocumentProperties(element)
      dispatchFullscreenEvent('fullscreenchange')
      await enterPromise

      expect(changeCallback).toHaveBeenCalledTimes(1)

      const exitPromise = Fullscreen.exit()
      setupDocumentProperties(null)
      dispatchFullscreenEvent('fullscreenchange')
      await exitPromise

      expect(changeCallback).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Scenarios', () => {
    beforeEach(() => {
      Fullscreen.init()
    })

    test('should handle permission denied error', async () => {
      setupDocumentProperties(null, false)
      const element = document.createElement('div')
      await expect(Fullscreen.enter(element)).rejects.toThrow('Fullscreen not enabled')
    })

    test('should handle requestFullscreen throwing error', async () => {
      const element = document.createElement('div') as any
      element.requestFullscreen = jest.fn(() => {
        throw new Error('Permission denied')
      })

      const promise = Fullscreen.enter(element)
      await expect(promise).rejects.toThrow('Permission denied')
    })

    test('should handle event-based errors', async () => {
      const element = document.createElement('div') as any
      element.requestFullscreen = jest.fn()

      const promise = Fullscreen.enter(element)
      dispatchFullscreenEvent('fullscreenerror')
      await expect(promise).rejects.toThrow(FullscreenError)
    })

    test('should handle iOS video-only restriction', async () => {
      ;(Fullscreen as any).isIOS = true
      Fullscreen.destroy()
      Fullscreen.init()

      const nonVideoElement = document.createElement('div')
      await expect(Fullscreen.enter(nonVideoElement)).rejects.toMatchObject({
        code: FullscreenErrorCode.IOS_VIDEO_ONLY
      })
    })
  })

  describe('Memory and Performance', () => {
    let addListenerSpy: jest.SpyInstance
    let removeListenerSpy: jest.SpyInstance

    beforeEach(() => {
      addListenerSpy = jest.spyOn(document, 'addEventListener')
      removeListenerSpy = jest.spyOn(document, 'removeEventListener')
    })

    afterEach(() => {
      addListenerSpy.mockRestore()
      removeListenerSpy.mockRestore()
    })

    test('should not create memory leaks with multiple subscriptions', () => {
      const callbacks: jest.Mock[] = []
      for (let i = 0; i < 100; i++) {
        const callback = jest.fn()
        callbacks.push(callback)
        Fullscreen.on('change', callback)
      }

      ;(Fullscreen as any).handleChange(new Event('fullscreenchange'))
      callbacks.forEach(cb => expect(cb).toHaveBeenCalledTimes(1))

      for (let i = 0; i < 50; i++) {
        Fullscreen.off('change', callbacks[i])
      }

      ;(Fullscreen as any).handleChange(new Event('fullscreenchange'))

      for (let i = 0; i < 50; i++) {
        expect(callbacks[i]).toHaveBeenCalledTimes(1)
      }
      for (let i = 50; i < 100; i++) {
        expect(callbacks[i]).toHaveBeenCalledTimes(2)
      }
    })

    test('should cleanup event listeners properly', () => {
      Fullscreen.init()
      expect(addListenerSpy).toHaveBeenCalledTimes(2)

      Fullscreen.destroy()
      expect(removeListenerSpy).toHaveBeenCalledTimes(2)
    })

    test('should handle multiple init/destroy cycles', () => {
      for (let i = 0; i < 5; i++) {
        Fullscreen.init()
        expect(addListenerSpy).toHaveBeenCalledTimes(2)
        Fullscreen.destroy()
        expect(removeListenerSpy).toHaveBeenCalledTimes(2)
        jest.clearAllMocks()
      }
    })
  })
})
