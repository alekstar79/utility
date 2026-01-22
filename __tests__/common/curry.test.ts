import { curry, type CurryedFn } from '../../src/common/curry'

describe('curry function', () => {
  const add = (a: number, b: number, c: number, d: number): number => a + b + c + d
  const concat = (a: string, b: string, c: string): string => a + b + c
  const multiply = (a: number, b: number): number => a * b

  describe('basic currying', () => {
    it('fully applies all arguments at once', () => {
      const curriedAdd = curry(add)
      const result = curriedAdd(1, 2, 3, 4)
      expect(result).toBe(10)
    })

    it('partially applies arguments step by step', () => {
      const curriedAdd = curry(add)
      const addAB = curriedAdd(1, 2)
      const addABC = addAB(3)
      const result = addABC(4)
      expect(result).toBe(10)
    })

    it('returns bound function when not fully applied', () => {
      const curriedAdd = curry(add)
      const partial = curriedAdd(1)
      expect(partial).toBeInstanceOf(Function)
      expect(partial.length).toBe(0)
    })
  })

  describe('different arity functions', () => {
    it('works with 2-argument functions', () => {
      const curriedMultiply = curry(multiply)
      const double = curriedMultiply(2)
      expect(double(5)).toBe(10)
      expect(curriedMultiply(3, 4)).toBe(12)
    })

    it('works with 3-argument functions', () => {
      const curriedConcat = curry(concat)
      const addHello = curriedConcat('Hello, ')
      const addSpace = addHello('world')
      expect(addSpace('!')).toBe('Hello, world!')
    })

    it('works with 1-argument functions (no-op)', () => {
      const identity = (x: number) => x
      const curriedIdentity = curry(identity)
      expect(curriedIdentity(42)).toBe(42)
    })
  })

  describe('this binding', () => {
    it('preserves this context', () => {
      const obj = {
        value: 10,
        add: function(this: any, a: number, b: number) {
          return this.value + a + b
        }
      }

      const curriedAdd = curry(obj.add)
      const result = curriedAdd.call(obj, 1, 2)
      expect(result).toBe(13)
    })

    it('preserves this with partial application', () => {
      const obj = {
        value: 10,
        add: function(this: any, a: number, b: number, c: number) {
          return this.value + a + b + c
        }
      }

      const curriedAdd = curry(obj.add)
      const partial = curriedAdd.call(obj, 1)
      const result = partial.call(obj, 2, 3)
      expect(result).toBe(16)
    })
  })

  describe('function length detection', () => {
    it('bound functions always have length 0', () => {
      const fn4args = (_a: number, _b: number, _c: number, _d: number) => 0
      const fn2args = (_a: number, _b: number) => 0

      const curried4 = curry(fn4args)
      const curried2 = curry(fn2args)

      expect(curried4(1, 2, 3).length).toBe(0)
      expect(curried2(1).length).toBe(0)
    })

    it('handles functions with length=0', () => {
      const noArgs = function() { return 'no args'; }
      const curried = curry(noArgs)
      expect(curried()).toBe('no args')
      expect(curried.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('ignores extra arguments gracefully', () => {
      const zeroArgs = function() { return 42; }
      const curried = curry(zeroArgs)
      expect(curried()).toBe(42)
      expect(curried(1, 2, 3)).toBe(42)
    })

    it('partial functions always have length 0', () => {
      const curriedAdd = curry(add)
      const partial = curriedAdd(1, 2, 3)
      expect(partial.length).toBe(0)
      expect(partial(4)).toBe(10)
    })

    it('supports mixed application patterns', () => {
      const curriedAdd = curry(add)
      expect(curriedAdd(1)(2, 3, 4)).toBe(10)
      expect(curriedAdd(1, 2)(3, 4)).toBe(10)
      expect(curriedAdd(1)(2)(3)(4)).toBe(10)
    })

    it('maintains chainable curried functions', () => {
      const curriedAdd = curry(add)
      const step1 = curriedAdd(1)
      const step2 = step1(2)
      const step3 = step2(3)
      expect(step3(4)).toBe(10)
      expect(step3).toBeInstanceOf(Function)
    })
  })

  describe('type safety', () => {
    it('preserves return type inference', () => {
      const safeAdd = curry((a: number, b: number) => a + b)
      const addFive = safeAdd(5)
      expect(addFive(3)).toBe(8)
    })

    it('CurryedFn type is callable', () => {
      const curried = curry(add)
      const partial: CurryedFn = curried(1)
      expect(partial).toBeInstanceOf(Function)
    })
  })

  describe('performance & correctness', () => {
    it('curry vs direct call performance equivalence', () => {
      const curriedAdd = curry(add)
      const directResult = add(1, 2, 3, 4)
      const curriedResult = curriedAdd(1, 2, 3, 4)
      expect(curriedResult).toBe(directResult)
    })

    it('multiple curry calls work independently', () => {
      const curry1 = curry(add)(1)
      const curry2 = curry(add)(2)
      expect(curry1(2, 3, 4)).toBe(10)
      expect(curry2(1, 3, 4)).toBe(10)
    })
  })
})
