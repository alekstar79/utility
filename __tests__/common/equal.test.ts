import { deepEqual, shallowEqual } from '../../src/common/equal'

describe('deepEqual - universal deep comparison', () => {
  describe('01. PRIMITIVES (6)', () => {
    it('strict: Object.is equality', () => {
      expect(deepEqual(42, 42)).toBe(true)
      expect(deepEqual('test', 'test')).toBe(true)
      expect(deepEqual(null, null)).toBe(true)
      expect(deepEqual(undefined, undefined)).toBe(true)
      expect(deepEqual(0, -0)).toBe(false)
      expect(deepEqual(NaN, NaN)).toBe(true)
    })

    // any типы для loose mode
    it('loose: == equality', () => {
      expect((deepEqual as any)(0, '0', { mode: 'loose' })).toBe(true)
      expect((deepEqual as any)('', 0, { mode: 'loose' })).toBe(true)
      expect((deepEqual as any)(null, undefined, { mode: 'loose' })).toBe(true)
    })

    // any типы
    it('primitive vs object → false', () => {
      expect(deepEqual(42 as any, { value: 42 })).toBe(false)
      expect(deepEqual('test' as any, ['test'])).toBe(false)
    })

    it('symbols и bigint', () => {
      const sym1 = Symbol('test')
      const sym2 = Symbol('test')
      expect(deepEqual(sym1 as any, sym2 as any)).toBe(false)
      expect(deepEqual(1n, 1n)).toBe(true)
      expect(deepEqual(1n as any, 1)).toBe(false)
    })

    it('ignoreUndefined is working', () => {
      expect((deepEqual as any)({ a: 1 }, { a: 1, b: undefined }, { ignoreUndefined: true })).toBe(true)
    })

    it('detailed mode returns the differences', () => {
      const result = deepEqual(1, 2, { detailed: true }) as any
      expect(result.equal).toBe(false)
      expect(result.differences).toHaveLength(1)
      expect(result.differences[0].path).toBe('')
    })
  })

  describe('02. ARRAYS (4)', () => {
    it('equal arrays', () => {
      expect(deepEqual([1, 2], [1, 2])).toBe(true)
      expect(deepEqual([1, { a: 1 }], [1, { a: 1 }])).toBe(true)
    })

    it('different length → false', () => {
      expect(deepEqual([1, 2], [1])).toBe(false)
    })

    it('different elements', () => {
      expect(deepEqual([1, 2], [1, 3])).toBe(false)
      expect(deepEqual([1, 2], [2, 1])).toBe(false)
    })

    it('empty arrays', () => {
      expect(deepEqual([], [])).toBe(true)
      expect(deepEqual([], [1])).toBe(false)
    })
  })

  describe('03. OBJECTS (5)', () => {
    it('equal objects', () => {
      expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true)
      expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true)
    })

    it('different keys', () => {
      expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
      expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false)
    })

    it('symbol keys', () => {
      const sym = Symbol('key')
      const obj1 = { [sym]: 1 }
      const obj2 = { [sym]: 1 }
      expect(deepEqual(obj1, obj2)).toBe(true)
    })

    it('ignoreUndefined skips undefined', () => {
      expect((deepEqual as any)({ a: 1, b: undefined }, { a: 1 }, { ignoreUndefined: true })).toBe(true)
    })

    it('different values', () => {
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false)
    })
  })

  describe('04. MAP/SET/DATE (5)', () => {
    it('Date time comparison', () => {
      const d1 = new Date(2023, 0, 1)
      const d2 = new Date(2023, 0, 1)
      expect(deepEqual(d1, d2)).toBe(true)
      const d3 = new Date(2023, 0, 2)
      expect(deepEqual(d1, d3)).toBe(false)
    })

    it('Map content comparison', () => {
      expect(deepEqual(new Map([['a', 1]]), new Map([['a', 1]]))).toBe(true)
      expect(deepEqual(new Map([['a', 1]]), new Map([['a', 2]]))).toBe(false)
    })

    it('Set element comparison', () => {
      expect(deepEqual(new Set([1, 2]), new Set([1, 2]))).toBe(true)
      expect(deepEqual(new Set([1]), new Set([2]))).toBe(false)
    })

    it('Set vs Array → false', () => {
      expect(deepEqual(new Set([1, 2]) as any, [1, 2])).toBe(false)
    })

    it('empty collections', () => {
      expect(deepEqual(new Map(), new Map())).toBe(true)
      expect(deepEqual(new Set(), new Set())).toBe(true)
    })
  })

  describe('05. CIRCULAR REFERENCES (3)', () => {
    it('cyclic links', () => {
      const obj: any = { a: 1 }
      obj.self = obj
      expect(deepEqual(obj, obj)).toBe(true)
    })

    it('different cyclic objects', () => {
      const obj1: any = { a: 1 }
      obj1.self = obj1
      const obj2: any = { a: 1 }
      obj2.self = obj2
      expect(deepEqual(obj1, obj2)).toBe(true)
    })

    it('loop + regular object', () => {
      const obj1: any = { a: 1 }
      obj1.self = obj1
      expect(deepEqual(obj1, { a: 1 })).toBe(false)
    })
  })

  describe('06. MAX DEPTH (2)', () => {
    it('deep objects > maxDepth → false', () => {
      const obj1 = { a: { b: { c: { d: 1 } } } }
      const obj2 = { a: { b: { c: { d: 1 } } } }
      expect(deepEqual(obj1, obj2, { maxDepth: 2 } as any)).toBe(false)
    })

    it('default maxDepth = 20', () => {
      expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true)
    })
  })

  describe('07. SHALLOW EQUAL (3)', () => {
    it('shallowEqual basic', () => {
      expect(shallowEqual({ a: 1 }, { a: 1 })).toBe(true)
      expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false)
    })

    it('shallowEqual different keys', () => {
      expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    })

    it('shallowEqual arrays of the first level', () => {
      expect(shallowEqual([1, 2], [1, 2])).toBe(true)
      expect(shallowEqual([1, 2], [1, { b: 2 }])).toBe(false)
    })
  })
})
