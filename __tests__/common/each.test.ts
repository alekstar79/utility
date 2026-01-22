import { each } from '../../src/common/each'

describe('each - asynchronous iteration of an array', () => {
  let mockFn: jest.Mock
  let cancelFn: (() => void) | null

  beforeEach(() => {
    mockFn = jest.fn()
    cancelFn = null
    jest.useFakeTimers()
  })

  afterEach(() => {
    if (cancelFn) cancelFn()
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Basic usage', () => {
    it('calls a callback for each element', () => {
      const arr = [1, 2, 3]
      cancelFn = each(arr, mockFn)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenNthCalledWith(1, 1, 0, arr)

      jest.runAllTimers()
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('passes the correct arguments', () => {
      const arr = ['a', 'b']
      cancelFn = each(arr, mockFn)

      expect(mockFn).toHaveBeenNthCalledWith(1, 'a', 0, arr)
      jest.runAllTimers()
      expect(mockFn).toHaveBeenNthCalledWith(2, 'b', 1, arr)
    })

    it('empty array → does not cause', () => {
      const arr: number[] = []
      cancelFn = each(arr, mockFn)
      jest.runAllTimers()
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('returns the cancel function', () => {
      const cancel = each([1], mockFn)
      expect(typeof cancel).toBe('function')
    })
  })

  describe('Delay', () => {
    it('ms=0 → everything through timers', () => {
      const arr = [1, 2, 3]
      cancelFn = each(arr, mockFn, 0)
      jest.runAllTimers()
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('ms=100 → delay between calls', () => {
      const arr = [1, 2]
      cancelFn = each(arr, mockFn, 100)

      expect(mockFn).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(99)
      expect(mockFn).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(1)
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('negative ms → as 0', () => {
      const arr = [1, 2]
      cancelFn = each(arr, mockFn, -1)
      jest.runAllTimers()
      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('Cancel', () => {
    it('canceling stops the iteration', () => {
      const arr = [1, 2, 3]
      cancelFn = each(arr, mockFn, 50)

      expect(mockFn).toHaveBeenCalledTimes(1)
      cancelFn!()
      jest.runAllTimers()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('multiple cancellations are safe', () => {
      const arr = [1, 2]
      cancelFn = each(arr, mockFn)

      expect(mockFn).toHaveBeenCalledTimes(1)
      cancelFn!()
      cancelFn!()
      jest.runAllTimers()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('safe after completion', () => {
      const arr = [1]
      cancelFn = each(arr, mockFn)
      jest.runAllTimers()
      expect(() => cancelFn!()).not.toThrow()
    })
  })

  describe('Edge cases', () => {
    it('it works without a window', () => {
      const originalWindow = (global as any).window
      delete (global as any).window

      const cancel = each([1], mockFn)
      ;(global as any).window = originalWindow
      expect(typeof cancel).toBe('function')
    })

    it('array mutation', () => {
      const arr = [1, 2, 3]
      each(arr, (v, i, a) => { a[i] = v * 2; })
      jest.runAllTimers()
      expect(arr).toEqual([2, 4, 6])
    })

    it('setTimeout errors don\'t break', () => {
      const realTimeout = window.setTimeout
      ;(window.setTimeout as any) = () => 123 as any

      const cancel = each([1], mockFn)
      window.setTimeout = realTimeout
      expect(typeof cancel).toBe('function')
    })

    it('TypeScript types', () => {
      const arr: number[] = [1, 2]
      const fn = jest.fn((_: number) => {})
      each(arr, fn)
      expect(fn).toHaveBeenCalled()
    })
  })

  describe('Memory', () => {
    it('no timer leaks', () => {
      each([1], mockFn)
      jest.runAllTimers()
      expect(jest.getTimerCount()).toBe(0)
    })

    it('clearTimeout after cancellation', () => {
      cancelFn = each([1, 2], mockFn)
      cancelFn!()
      jest.runAllTimers()
      expect(jest.getTimerCount()).toBe(0)
    })

    it('empty array → no timers', () => {
      each([], mockFn)
      expect(jest.getTimerCount()).toBe(0)
    })

    it('large arrays work', () => {
      const arr = new Array(10).fill(0)
      cancelFn = each(arr, mockFn)
      jest.runAllTimers()
      expect(mockFn).toHaveBeenCalledTimes(10)
    })
  })
})
