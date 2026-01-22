export interface CurryedFn extends Function {
  (...args: any[]): any;
}

export function curry<F extends (...args: any[]) => any>(fn: F): CurryedFn {
  return function curried(this: ThisParameterType<F>, ...args: any[]): CurryedFn | any
  {
    if (args.length >= fn.length) {
      return fn.apply(this, args.slice(0, fn.length))
    }

    return curried.bind(this, ...args)
  }
}
