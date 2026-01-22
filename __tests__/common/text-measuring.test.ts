import { ReturnTextWidth, useTextMeasuring } from '../../src/common/textMeasuring'

describe('useTextMeasuring', () => {
  let input: HTMLInputElement
  let instance: ReturnTextWidth
  let mockMeasureText: jest.Mock
  let mockCtx: any

  beforeAll(() => {
    mockMeasureText = jest.fn().mockReturnValue({ width: 42 })
    mockCtx = { font: '', measureText: mockMeasureText }

    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: () => mockCtx,
      writable: true
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
    input = document.createElement('input')
    input.value = 'test'
    document.body.appendChild(input)
    mockMeasureText.mockReturnValue({ width: 42 })

    Object.defineProperty(window, 'getComputedStyle', {
      value: jest.fn().mockReturnValue({
        fontWeight: 'normal',
        fontSize: '16px',
        fontFamily: 'Arial'
      } as any),
      writable: true
    })
  })

  afterEach(() => {
    if (instance?.destroy) instance.destroy()
    if (input?.parentNode) document.body.removeChild(input)

    Object.defineProperty(window, 'getComputedStyle', {
      value: window.getComputedStyle.bind(window),
      writable: true
    })
  })

  afterAll(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: HTMLCanvasElement.prototype.getContext,
      writable: true
    })
  })

  // ★★★ ВСЕ 15 СТАРЫХ ТЕСТОВ ★★★
  test('initial measure returns cached value', () => {
    instance = useTextMeasuring(input)
    const width1 = instance.measure()
    const width2 = instance.measure()
    expect(width1).toBe(42)
    expect(width2).toBe(42)
    expect(mockMeasureText).toHaveBeenCalledTimes(1)
  })

  test('updates cache on text change', () => {
    instance = useTextMeasuring(input)
    instance.measure()
    input.value = 'new text'
    mockMeasureText.mockReturnValueOnce({ width: 100 })
    const updatedWidth = instance.measure()
    expect(updatedWidth).toBe(100)
    expect(mockMeasureText).toHaveBeenCalledWith('new text')
  })

  test('font change invalidates cache', () => {
    instance = useTextMeasuring(input)
    instance.measure()
    ;(window.getComputedStyle as jest.Mock).mockReturnValueOnce({
      fontWeight: 'bold',
      fontSize: '24px',
      fontFamily: 'Arial'
    })
    mockMeasureText.mockReturnValueOnce({ width: 84 })
    const newWidth = instance.measure()
    expect(newWidth).toBe(84)
  })

  test('factor scaling works correctly', () => {
    instance = useTextMeasuring(input, { factor: 2 })
    const width = instance.measure()
    expect(width).toBe(84)
  })

  test('value proxy getter', () => {
    instance = useTextMeasuring(input)
    const cache1 = instance.value
    const cache2 = instance.value
    expect(cache1.width).toBe(42)
    expect(cache1 === cache2).toBe(true)
    cache1.width = 100
    expect(cache2.width).toBe(100)
  })

  test('value getter reflects internal changes', () => {
    instance = useTextMeasuring(input)
    instance.measure()
    input.value = 'longer'
    mockMeasureText.mockReturnValueOnce({ width: 120 })
    instance.measure()
    expect(instance.value.width).toBe(120)
    expect(instance.value.raw).toBe('longer')
  })

  test('validation throws correctly', () => {
    expect(() => useTextMeasuring(null as any)).toThrow(TypeError)
    expect(() => useTextMeasuring(document.createElement('div') as any)).toThrow(TypeError)
  })

  test('proxy updates reflect immediately', () => {
    instance = useTextMeasuring(input)
    expect(instance.value.width).toBe(42)
    input.value = 'new'
    mockMeasureText.mockReturnValueOnce({ width: 88 })
    instance.measure()
    expect(instance.value.width).toBe(88)
    expect(instance.value.raw).toBe('new')
  })

  test('proxy is same object identity', () => {
    instance = useTextMeasuring(input)
    expect(instance.value).toBe(instance.value)
  })

  test('direct proxy updates work', () => {
    instance = useTextMeasuring(input)
    instance.value.width = 100
    expect(instance.value.width).toBe(100)
  })

  test('createObserver registers correctly', () => {
    const mockAddEventListener = jest.spyOn(input, 'addEventListener')
    useTextMeasuring(input)
    expect(mockAddEventListener).toHaveBeenCalledWith('input', expect.any(Function))
  })

  test('createObserver input event works', () => {
    const mockAddEventListener = jest.spyOn(input, 'addEventListener')
    const mockObserve = jest.spyOn(MutationObserver.prototype, 'observe')
    useTextMeasuring(input)
    expect(mockAddEventListener).toHaveBeenCalledWith('input', expect.any(Function))
    expect(mockObserve).toHaveBeenCalledWith(input, {
      attributes: true,
      attributeFilter: ['style', 'class']
    })
  })

  test('createObserver cleanup works', () => {
    const mockRemoveEventListener = jest.spyOn(input, 'removeEventListener')
    const mockDisconnect = jest.spyOn(MutationObserver.prototype, 'disconnect')
    instance = useTextMeasuring(input)
    instance.destroy()
    expect(mockRemoveEventListener).toHaveBeenCalledWith('input', expect.any(Function))
    expect(mockDisconnect).toHaveBeenCalled()
  })

  test('should return numeric width value', () => {
    const measurer = useTextMeasuring(input, { factor: 1 })
    expect(typeof measurer.measure()).toBe('number')
    expect(measurer.measure()).toBeGreaterThan(0)
    expect(typeof measurer.destroy).toBe('function')
    expect(measurer.value).toBeDefined()
    measurer.destroy()
  })

  test('should handle empty input', () => {
    const emptyInput = document.createElement('input')
    emptyInput.value = ''
    const measurer = useTextMeasuring(emptyInput)
    expect(measurer.measure()).toBeGreaterThanOrEqual(0)
  })
})
