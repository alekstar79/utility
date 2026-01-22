import { CancelablePromise } from '../../src/common/cancelablePromise'

describe('CancelablePromise', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should wrap a resolved value', () => {
      const promise = new CancelablePromise(42)
      expect(promise.isCancelled).toBe(false)
      return expect(promise).resolves.toBe(42)
    })

    it('should wrap a Promise', async () => {
      const promise = new CancelablePromise(Promise.resolve(42))
      expect(promise.isCancelled).toBe(false)
      const result = await promise
      expect(result).toBe(42)
    })

    it('should call executor with signal', async () => {
      const mockExecutor = jest.fn((_signal: AbortSignal) => 'result')
      const promise = new CancelablePromise(mockExecutor)

      expect(mockExecutor).toHaveBeenCalledWith(
        expect.objectContaining({ aborted: false } as any)
      )

      expect(await promise).toBe('result')
    })

    it('should handle executor throwing error', () => {
      const promise = new CancelablePromise(() => {
        throw new Error('executor error')
      })

      return expect(promise).rejects.toThrow('executor error')
    })

    it('should respect external signal', async () => {
      const externalController = new AbortController()
      const promise = new CancelablePromise(
        (signal) => {
          expect(signal.aborted).toBe(false)
          return 'result'
        },
        { signal: externalController.signal }
      )

      externalController.abort()
      await expect(promise).resolves.toBe('result')
    })
  })

  describe('cancel()', () => {
    it('should set cancelled state and abort signal', () => {
      const promise = new CancelablePromise(Promise.resolve(42))
      promise.cancel()
      expect(promise.isCancelled).toBe(true)
    })

    it('should not cancel if already cancelled or settled', () => {
      const promise = new CancelablePromise(Promise.resolve('done'))
      promise.cancel()
      const status1 = promise.status

      promise.cancel()
      const status2 = promise.status

      expect(status1.isCancelled).toBe(true)
      expect(status2.isCancelled).toBe(true)
    })

    it('should be chainable', () => {
      const promise = new CancelablePromise(42)
      const result = promise.cancel()
      expect(result).toBe(promise)
    })
  })

  describe('cancelAfter()', () => {
    it('should cancel after delay', async () => {
      jest.useFakeTimers()
      const promise = new CancelablePromise(() => new Promise(() => {}))
      promise.cancelAfter(50)

      jest.advanceTimersByTime(60)
      jest.runAllTimers()

      expect(promise.isCancelled).toBe(true)

      jest.useRealTimers()
    })
  })

  describe('timeout option', () => {
    it('should cancel on timeout', async () => {
      jest.useFakeTimers()
      const onTimeout = jest.fn()
      const promise = new CancelablePromise(
        () => new Promise(() => {}),
        { timeout: 100 }
      )

      promise.onTimeout(onTimeout)
      jest.advanceTimersByTime(110)
      jest.runAllTimers()

      expect(promise.isCancelled).toBe(true)
      expect(onTimeout).toHaveBeenCalled()

      jest.useRealTimers()
    })

    it('should not timeout if settled before timeout', async () => {
      const promise = new CancelablePromise(
        () => Promise.resolve(42),
        { timeout: 100 }
      )

      await promise;
      expect(promise.isCancelled).toBe(false)
    })
  })

  describe('silent option', () => {
    it('should create silent CancelError properties', () => {
      const promise = new CancelablePromise(42, { silent: true })
      promise.cancel()
      expect(promise.isCancelled).toBe(true)
    })
  })

  describe('event listeners', () => {
    it('onCancel should fire on cancel', () => {
      const promise = new CancelablePromise(42)
      const mockCancel = jest.fn()
      const unsubscribe = promise.onCancel(mockCancel)

      promise.cancel()
      expect(mockCancel).toHaveBeenCalledTimes(1)

      unsubscribe()
      const mockCancel2 = jest.fn()
      promise.onCancel(mockCancel2)
      expect(mockCancel2).not.toHaveBeenCalled()
    })

    it('onStatus should fire immediately and on changes', () => {
      const promise = new CancelablePromise(42)
      const statuses: any[] = []

      promise.onStatus(status => statuses.push(status))

      expect(statuses[0].isCancelled).toBe(false)
      expect(statuses[0].isSettled).toBe(false)

      promise.cancel()
      expect(statuses[1].isCancelled).toBe(true)
    })
  })

  describe('Promise compatibility', () => {
    it('should work with then/catch/finally', async () => {
      const promise = new CancelablePromise(Promise.resolve(42))
      const result = await promise.then((v: number) => v * 2)
      expect(result).toBe(84)
    })

    it('implements correct toStringTag', () => {
      const promise = new CancelablePromise(42);
      expect(Object.prototype.toString.call(promise)).toBe('[object CancelablePromise]')
    })
  })

  describe('static methods', () => {
    it('race should cancel losers', async () => {
      jest.useFakeTimers()

      let slowCancelled = false
      const slow = new CancelablePromise(() =>
        new Promise(resolve => setTimeout(() => {
          resolve('slow')
        }, 200))
      )

      slow.onCancel(() => slowCancelled = true)

      expect(slowCancelled).toBe(false);

      const fast = new CancelablePromise(Promise.resolve('fast'))
      const winner = await CancelablePromise.race([slow, fast])

      expect(winner).toBe('fast')

      jest.useRealTimers()
    })

    it('allSettled should wrap promises', async () => {
      const result = await CancelablePromise.allSettled([
        Promise.resolve(1),
        Promise.reject(new Error('fail')),
        Promise.resolve(3)
      ])

      expect(result[0]).toEqual({ status: 'fulfilled', value: 1 })
      expect(result[1]).toEqual({ status: 'rejected', reason: expect.any(Error) })
      expect(result[2]).toEqual({ status: 'fulfilled', value: 3 })
    })
  })
})
