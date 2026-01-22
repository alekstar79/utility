import { throttle } from '../../src/common/throttle'

describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('should execute immediately on first call', () => {
    const mockFn = jest.fn()
    const throttled = throttle(mockFn, 100)

    throttled('first')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('first')
  })

  test('should throttle rapid calls', () => {
    const mockFn = jest.fn()
    const throttled = throttle(mockFn, 100)

    throttled('call1')
    throttled('call2')
    throttled('call3')

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  test('should execute second call after delay', () => {
    const mockFn = jest.fn()
    const throttled = throttle(mockFn, 100)

    throttled('first')
    throttled('second')

    expect(mockFn).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenCalledWith('second')
  })

  test('should cancel pending timeout on immediate execution', () => {
    const mockFn = jest.fn()
    const throttled = throttle(mockFn, 100)

    throttled('first')
    jest.advanceTimersByTime(150)
    throttled('second')

    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  test('should support multiple arguments', () => {
    const mockFn = jest.fn()
    const throttled = throttle(mockFn, 100)

    throttled('a', 1, true)
    expect(mockFn).toHaveBeenCalledWith('a', 1, true)
  })
})
