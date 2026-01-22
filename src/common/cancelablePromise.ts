export interface CancelError extends Error {
  readonly code: 'CANCELLED';
  readonly silent: boolean;
}

export interface CancelablePromiseOptions {
  /** Do not throw an error when canceling */
  silent?: boolean;
  /** Cancellation timeout in ms */
  timeout?: number;
  /** Signal for external cancellation */
  signal?: AbortSignal | undefined;
}

export interface CancelablePromiseStatus {
  readonly isCancelled: boolean;
  readonly isSettled: boolean;
  readonly listenerCount: number;
}

/**
 * Cancelable Promise
 *
 * @example
 * // 1. Executor с AbortSignal
 * const task = new CancelablePromise((signal) =>
 *   fetch('/api/data', { signal })
 * )
 * task.cancel() // ❌ Cancelled
 *
 * @example
 * // 2. Cancellation with timeout
 * const slowTask = new CancelablePromise(async (signal) => {
 *   // Simulating a long operation
 *   await new Promise(r => setTimeout(r, 5000))
 * }, { timeout: 2000 })
 * slowTask.onTimeout(() => console.log('Timeout'))
 *
 * @example
 * // 3. Chainable API
 * fetch('/api')
 *   .then(res => res.json())
 *   .then(data => new CancelablePromise(resolve => setTimeout(() => resolve(data), 1000)))
 *   .cancelAfter(500)
 *
 * @example
 * // 4. Race with cancellation
 * const [winner] = await CancelablePromise.race([
 *   slowApiCall(),
 *   fastApiCall()
 * ])
 *
 * @example
 * // 5. AbortController integration
 * const controller = new AbortController()
 * const task = new CancelablePromise((signal) =>
 *   fetch('/api/heavy', { signal: AbortSignal.any([signal, controller.signal]) })
 * )
 * controller.abort() // Cancellation from outside
 *
 * @example
 * // Promise wrapper
 * const apiCall = fetch('/api').then(r => r.json())
 * const cancelable = new CancelablePromise(apiCall)
 * cancelable.cancelAfter(5000)
 */
export class CancelablePromise<T> implements Promise<T> {
  private promise: Promise<T>
  private readonly abortController = new AbortController()
  private readonly options: CancelablePromiseOptions
  private _isCancelled = false
  private _isSettled = false
  private readonly cancelListeners: Array<(reason: CancelError) => void> = []
  private readonly timeoutListeners: Array<() => void> = []
  private readonly statusListeners: Array<(status: CancelablePromiseStatus) => void> = []

  constructor(
    input: Promise<T> | T | ((signal: AbortSignal) => Promise<T> | T),
    optionsParam?: CancelablePromiseOptions
  ) {

    this.options = {
      silent: false,
      timeout: 0,
      signal: undefined,
      ...optionsParam
    }

    // External AbortSignal
    if (this.options.signal) {
      this.options.signal.addEventListener(
        'abort',
        () => this.cancel(),
        { once: true, signal: this.abortController.signal }
      )
    }

    if (typeof input === 'function') {
      // Executor
      this.promise = new Promise<T>((resolve, reject) => {
        try {
          const result = (
            input as (signal: AbortSignal) => Promise<T> | T
          )(this.abortController.signal)

          Promise.resolve(result)
            .then(resolve, reject)
            .finally(() => {
              this._isSettled = true
              this.notifyStatus()
            })
        } catch (error) {
          reject(error);
          this._isSettled = true
          this.notifyStatus()
        }
      })
    } else {
      // Promise/value
      this.promise = Promise
        .resolve(input)
        .finally(() => {
          this._isSettled = true
          this.notifyStatus()
        }) as Promise<T>
    }

    // Auto-timeout
    if (this.options.timeout && this.options.timeout > 0) {
      setTimeout(() => {
        if (!this._isCancelled && !this._isSettled) {
          this.cancel()
          this.timeoutListeners.forEach(cb => cb())
        }
      }, this.options.timeout)
    }
  }

  /** Cancellation (chainable) */
  public cancel(): this {
    if (this._isCancelled || this._isSettled) return this

    this._isCancelled = true
    this.abortController.abort()

    const error: CancelError = Object.freeze({
      code: 'CANCELLED' as const,
      silent: !!this.options.silent,
      name: 'CancelError',
      message: this.options.silent ? 'Cancelled (silent)' : 'Promise was cancelled',
      stack: new Error().stack
    })

    this.cancelListeners.forEach(cb => cb(error))
    this.notifyStatus()
    return this
  }

  /** Cancellation after a delay */
  public cancelAfter(ms: number): this {
    setTimeout(() => this.cancel(), ms)
    return this
  }

  /** Checking for cancellation */
  public get isCancelled(): boolean {
    return this._isCancelled
  }

  /** Promise status */
  public get status(): CancelablePromiseStatus {
    return Object.freeze({
      isCancelled: this._isCancelled,
      isSettled: this._isSettled,
      listenerCount: this.cancelListeners.length
    })
  }

  /** Subscription to cancel */
  public onCancel(fn: (reason: CancelError) => void): () => void {
    this.cancelListeners.push(fn)

    return () => {
      const i = this.cancelListeners.indexOf(fn)
      if (i > -1) {
        this.cancelListeners.splice(i, 1)
      }
    }
  }

  /** Timeout subscription */
  public onTimeout(fn: () => void): () => void {
    this.timeoutListeners.push(fn)

    return () => {
      const i = this.timeoutListeners.indexOf(fn)
      if (i > -1) {
        this.timeoutListeners.splice(i, 1)
      }
    }
  }

  /** Subscribe to the status */
  public onStatus(fn: (status: CancelablePromiseStatus) => void): () => void {
    this.statusListeners.push(fn)

    fn(this.status)

    return () => {
      const i = this.statusListeners.indexOf(fn)
      if (i > -1) {
        this.statusListeners.splice(i, 1)
      }
    }
  }

  private notifyStatus(): void {
    this.statusListeners.forEach(fn => fn(this.status))
  }

  // Promise<T> implementation
  public then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected)
  }

  public catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined
  ): Promise<T | TResult> {
    return this.promise.catch(onrejected)
  }

  public finally<TFn extends () => any>(onfinally?: TFn | null | undefined): Promise<T> {
    return this.promise.finally(onfinally)
  }

  [Symbol.toStringTag] = 'CancelablePromise'

  /** Race with cancellation of losers */
  public static race<T>(promises: Iterable<CancelablePromise<T>>): CancelablePromise<T> {
    const controller = new AbortController()

    const cancelOthers = () => {
      for (const p of promises) {
        p.cancel()
      }
    }

    const wrappedPromises = Array.from(promises)
      .map(p => {
        p.onCancel(cancelOthers)
        return p
      })

    return new CancelablePromise<T>(
      Promise.race(wrappedPromises.map(p => p.promise)),
      { signal: controller.signal }
    )
  }

  /** AllSettled with cancellation */
  public static allSettled<T extends readonly unknown[]>(
    promises: T
  ): CancelablePromise<{ -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>> }> {
    return new CancelablePromise(Promise.allSettled(promises) as any)
  }
}
