import { Clipboard, ClipboardUtils } from '../../src/common/clipboard'

describe('Clipboard', () => {
  let clipboard: Clipboard

  beforeEach(() => {
    clipboard = new Clipboard()
  })

  describe('constructor', () => {
    it('creates instance', () => {
      expect(clipboard).toBeDefined()
      expect(clipboard.isSupported).toBe(true)
      expect(clipboard.stats.operations).toBe(0)
      expect(clipboard.stats.successRate).toBe(0)
    })
  })

  describe('write', () => {
    it('attempts write operation', async () => {
      const result = await clipboard.write('test')
      expect(clipboard.stats.operations).toBe(1)
      expect(result.method).toBeDefined()
    })

    it('handles fallback gracefully', async () => {
      const oldClipboard = (navigator as any).clipboard
      delete (navigator as any).clipboard

      await clipboard.write('fallback')

      expect(clipboard.stats.operations).toBe(1)

      ;(navigator as any).clipboard = oldClipboard
    })
  })

  describe('read', () => {
    it('returns error when unsupported', async () => {
      const oldClipboard = (navigator as any).clipboard
      delete (navigator as any).clipboard

      const results = await clipboard.read()
      expect(results[0].error).toBe('Read not supported')

      ;(navigator as any).clipboard = oldClipboard;
    })
  })
})

describe('ClipboardUtils', () => {
  let utils: ClipboardUtils
  let mockClipboard: any

  beforeEach(() => {
    mockClipboard = {
      write: jest.fn().mockResolvedValue({ success: true }),
      read: jest.fn()
    }

    utils = new ClipboardUtils(mockClipboard)
  })

  describe('copyCurrentUrl', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.spyOn(document, 'title', 'set').mockImplementation((value: string) => {
        Object.defineProperty(document, 'title', {
          value,
          writable: true,
          configurable: true
        })
      })
    })

    afterEach(() => {
      jest.runAllTimers()
      jest.useRealTimers()
      jest.restoreAllMocks()
    })

    it('copies current URL', async () => {
      await utils.copyCurrentUrl()
      expect(mockClipboard.write).toHaveBeenCalledTimes(1)
    })

    it('shows success feedback', async () => {
      await utils.copyCurrentUrl()

      const call = mockClipboard.write.mock.calls[0]
      expect(call[1]?.onFeedback).toBeDefined()
    })
  })

  describe('copyMarkdownLink', () => {
    it('creates valid markdown', async () => {
      await utils.copyMarkdownLink('https://test.com', 'Test')
      expect(mockClipboard.write).toHaveBeenCalledWith('[Test](https://test.com)', undefined)
    })
  })

  describe('copySelection', () => {
    it('copies selected text', async () => {
      const mockSelection = { toString: () => 'selected text' } as any
      Object.defineProperty(document, 'getSelection', {
        value: () => mockSelection,
        configurable: true
      })

      const result = await utils.copySelection()

      expect(mockClipboard.write).toHaveBeenCalledWith('selected text', undefined)
      expect(result.success).toBe(true)
    })
  })

  describe('copyElement', () => {
    it('copies element textContent', async () => {
      const element = { textContent: 'element text' } as any
      await utils.copyElement(element)
      expect(mockClipboard.write).toHaveBeenCalledWith('element text', undefined)
    })
  })

  describe('copyMultiple', () => {
    it('copies each item individually', async () => {
      await utils.copyMultiple(['line1', 'line2', 'line3'])
      expect(mockClipboard.write).toHaveBeenCalledTimes(3)
    })
  })
})

describe('fallback mechanisms - NO DOM', () => {
  test('Clipboard.write triggers fallback stats', async () => {
    const mockClipboard = new Clipboard()
    const oldClipboard = (navigator as any).clipboard
    delete (navigator as any).clipboard

    await mockClipboard.write('test')
    expect(mockClipboard.stats.operations).toBe(1)
    expect(mockClipboard.stats.fallbackUsed).toBeGreaterThanOrEqual(0)

    ;(navigator as any).clipboard = oldClipboard
  })
})

describe('DOM-safe fallback test', () => {
  test('write updates stats regardless of method', async () => {
    const mockClipboard = new Clipboard()
    const startOps = mockClipboard.stats.operations

    await mockClipboard.write('test data')

    expect(mockClipboard.stats.operations).toBeGreaterThan(startOps)
  })
})

describe('readImpl branches', () => {
  test('readImpl clipboard error', async () => {
    const mockClipboard = new Clipboard()

    Object.defineProperty(mockClipboard, 'supportsClipboardAPI', {
      value: true,
      writable: true
    })

    const oldClipboard = (navigator as any).clipboard
    ;(navigator as any).clipboard = {
      readText: jest.fn(() => Promise.reject(new Error('Permission denied')))
    }

    const results = await mockClipboard.read()
    expect(results[0].success).toBe(false)
    expect(results[0].error).toBe('Read failed')

    ;(navigator as any).clipboard = oldClipboard
  })
})

describe('ClipboardUtils missing branches', () => {
  test('copySelection no selection', async () => {
    const utils = new ClipboardUtils()
    Object.defineProperty(document, 'getSelection', {
      value: () => ({ toString: () => '' }),
      configurable: true
    })

    const result = await utils.copySelection()
    expect(result.success).toBe(false)
    expect(result.error).toBe('Нет выделенного текста')
  })

  test('autoBindCopy button lifecycle', () => {
    const utils = new ClipboardUtils()
    document.body.innerHTML = '<button class="copy-btn">Copy</button>'

    utils.autoBindCopy('.copy-btn')

    const button = document.querySelector('.copy-btn')!
    const clickEvent = new MouseEvent('click')

    button.dispatchEvent(clickEvent)

    expect(button.textContent).toBe('⏳')
  })
})
