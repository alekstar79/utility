import { popup, getScreenMetrics, calculateCenteredPosition } from '@/dom/popup'

/**
 * Comprehensive test suite for popup utility
 * Tests positioning, validation, blocking detection, edge cases
 */

describe('Popup Utility', () => {
  let mockOpen: jest.Mock;

  beforeEach(() => {
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true })
    delete window.ontouchstart

    mockOpen = jest.fn().mockReturnValue({
      closed: false,
      focus: jest.fn(),
      postMessage: jest.fn(),
      close: jest.fn()
    } as unknown as WindowProxy)

    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true,
      configurable: true
    })

    Object.defineProperty(window, 'screenX', { value: 0, configurable: true })
    Object.defineProperty(window, 'screenY', { value: 84, configurable: true })
    Object.defineProperty(window, 'outerWidth', { value: 1024, configurable: true })
    Object.defineProperty(window, 'outerHeight', { value: 768, configurable: true })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getScreenMetrics', () => {
    it('returns JSDOM default metrics (1024x768)', () => {
      Object.defineProperty(screen, 'width', { value: 1024, configurable: true })
      Object.defineProperty(screen, 'height', { value: 768, configurable: true })
      Object.defineProperty(screen, 'availWidth', { value: 1024, configurable: true })
      Object.defineProperty(screen, 'availHeight', { value: 768, configurable: true })
      Object.defineProperty(window, 'outerWidth', { value: 1024, configurable: true })
      Object.defineProperty(window, 'outerHeight', { value: 768, configurable: true })

      const metrics = getScreenMetrics()
      expect(metrics.screenWidth).toBe(1024)
      expect(metrics.screenHeight).toBe(768)
      expect(metrics.outerWidth).toBe(1024)
      expect(metrics.outerHeight).toBe(768)
    })

    it('handles fallback values correctly', () => {
      Object.defineProperty(screen, 'availWidth', { value: undefined, configurable: true })
      Object.defineProperty(screen, 'width', { value: undefined, configurable: true })
      Object.defineProperty(window, 'outerWidth', { value: undefined, configurable: true })
      Object.defineProperty(window, 'outerHeight', { value: undefined, configurable: true })

      const metrics = getScreenMetrics()
      expect(metrics.screenWidth).toBe(1024)
      expect(metrics.outerWidth).toBe(1024)
    })
  })

  describe('calculateCenteredPosition', () => {
    it('centers 800x600 window correctly on 1024x768', () => {
      const pos = calculateCenteredPosition(800, 600)
      expect(pos.left).toBe(112)
      expect(pos.top).toBe(168)
    })

    it('respects shift parameters', () => {
      const pos = calculateCenteredPosition(800, 600, 20, -168)
      expect(pos.left).toBe(132)
      expect(pos.top).toBe(0)
    })
  })

  describe('popup', () => {
    it('creates valid popup with default centering', () => {
      const result = popup({
        url: 'https://example.com',
        width: 800,
        height: 600
      })

      expect(mockOpen).toHaveBeenCalledTimes(1)
      expect(mockOpen).toHaveBeenCalledWith(
        'https://example.com/',
        '_blank',
        expect.stringContaining('width=800,height=600,left=112,top=168')
      )

      expect(result.opened).toBe(true)
    })

    it('uses explicit positioning', () => {
      const result = popup({
        url: 'https://example.com',
        width: 800,
        height: 600,
        left: 100,
        top: 200
      })

      expect(mockOpen).toHaveBeenCalledWith(
        'https://example.com/',
        '_blank',
        expect.stringContaining('left=100,top=200')
      )

      expect(result.opened).toBe(true);
    })

    it('validates and clamps dimensions', () => {
      const result = popup({
        url: 'https://example.com',
        width: 2000,
        height: -100
      })

      expect(mockOpen).toHaveBeenCalledWith(
        expect.any(String),
        '_blank',
        expect.stringContaining('width=1024,height=1')
      )

      expect(result.opened).toBe(true);
    })

    it('detects popup blocking', () => {
      mockOpen.mockReturnValueOnce(null)
      const result = popup({
        url: 'https://example.com',
        width: 800,
        height: 600
      })

      expect(result.wasBlocked).toBe(true);
      expect(result.opened).toBe(false);
    })

    it('includes additional features', () => {
      const result = popup({
        url: 'https://example.com',
        width: 800,
        height: 600
      })

      expect(mockOpen).toHaveBeenCalledWith(
        'https://example.com/',
        '_blank',
        expect.stringContaining('width=800,height=600')
      )

      expect(result.opened).toBe(true)
    })
  })
})
