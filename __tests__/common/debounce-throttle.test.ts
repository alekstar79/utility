import { debounce } from '../../src/common/debounce'
import { throttle } from '../../src/common/throttle'

describe('Debounce/Throtllle Utilities - Refined (2 functions)', () => {
  describe('Event Utilities', () => {
    it('should throttle function calls', () => {
      jest.useFakeTimers()
      const fn = jest.fn()
      const throttled = throttle(fn, 100)

      throttled()
      expect(fn).toHaveBeenCalledTimes(1)

      throttled()
      throttled()
      expect(fn).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(2)
      jest.useRealTimers()
    })

    it('should debounce function calls', () => {
      jest.useFakeTimers()
      const fn = jest.fn();
      const debounced = debounce(fn, 100)

      debounced()
      debounced()
      debounced()
      expect(fn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
      jest.useRealTimers()
    })

    it('should allow canceling debounced calls', () => {
      jest.useFakeTimers()
      const fn = jest.fn()
      const debounced = debounce(fn, 100)

      debounced()
      debounced.cancel()
      jest.advanceTimersByTime(100)
      expect(fn).not.toHaveBeenCalled()
      jest.useRealTimers()
    })
  })
})
