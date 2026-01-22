/**
 * Typed Pipe (mixed sync/async)
 * Works with Promise | T automatically
 */
export function pipe<A, R>(
  value: A,
  f1: (arg: A) => R | Promise<R>,
  ...fns: Array<(arg: any) => any | Promise<any>>
): Promise<R> {
  return fns.reduce(
    (promise, fn) => promise.then(fn),
    Promise.resolve(f1(value))
  ) as Promise<R>
}

/**
 * Factory Pipe version
 */
export function createPipe<A extends any[], R>(
  ...fns: Array<(arg: any) => any | Promise<any>>
): (...args: A) => Promise<R> {
  return async (...args: A) => {
    let result: any = args[0]

    for (const fn of fns) {
      result = await fn(result)
    }

    return result as R
  }
}
