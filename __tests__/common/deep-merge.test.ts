import { deepMerge } from '../../src/common/deepMerge'

function isPlainObject(value: any): value is Record<string, any> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  )
}

describe('deepMerge', () => {
  describe('Basic merging', () => {
    it('merges simple objects', () => {
      const result = deepMerge({ a: 1, b: 2 } as any, { b: 3, c: 4 } as any)
      expect(result).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('source overrides target', () => {
      const result = deepMerge({ name: 'old' } as any, { name: 'new' } as any)
      expect(result.name).toBe('new')
    })

    it('deep merges nested', () => {
      const result = deepMerge(
        { user: { name: 'John' } } as any,
        { user: { age: 30 } } as any
      )

      expect(result.user).toEqual({ name: 'John', age: 30 })
    })
  })

  describe('null/undefined', () => {
    it('target null → source', () => {
      const result = deepMerge(null, { a: 1 })
      expect(result).toEqual({ a: 1 })
    })

    it('source null → target', () => {
      const result = deepMerge({ a: 1 }, null)
      expect(result).toEqual({ a: 1 })
    })

    it('both null → {}', () => {
      const result = deepMerge(null, null)
      expect(result).toEqual({})
    })
  })

  describe('arrays', () => {
    it('array + array = concat', () => {
      const result = deepMerge([1, 2] as any, [3, 4] as any)
      expect(result).toEqual([1, 2, 3, 4])
    })

    it('array → object = source', () => {
      const result = deepMerge([1, 2] as any, { a: 1 } as any)
      expect(result).toEqual({ a: 1 })
    })

    it('object → array = source', () => {
      const result = deepMerge({ a: 1 } as any, [1, 2] as any)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('customizer', () => {
    it('property customizer called', () => {
      const customizer = jest.fn().mockReturnValue(undefined)
      deepMerge({ a: 1 } as any, { b: 2 } as any, customizer)
      expect(customizer).toHaveBeenCalledWith('b', undefined, 2, expect.any(Object))
    })

    it('null target customizer short-circuits', () => {
      const customizer = jest.fn().mockReturnValue({ done: true })
      const result = deepMerge(null, { b: 2 } as any, customizer)
      expect(result).toEqual({ done: true })
    })

    it('nested customizer called', () => {
      const customizer = jest.fn().mockReturnValue(undefined)
      deepMerge(
        { user: { name: 'John' } } as any,
        { user: { age: 30 } } as any,
        customizer
      )

      expect(customizer).toHaveBeenCalled()
    })

    it('array customizer', () => {
      const customizer = jest.fn().mockReturnValue(undefined)
      deepMerge([1] as any, [2] as any, customizer)
      expect(customizer).toHaveBeenCalledWith('array', [1], [2], expect.any(Object))
    })

    it('mismatch customizer', () => {
      const customizer = jest.fn().mockReturnValue(undefined)
      deepMerge([1] as any, { a: 1 } as any, customizer)
      expect(customizer).toHaveBeenCalledWith('array_mismatch', [1], { a: 1 }, expect.any(Object))
    })
  })

  describe('context', () => {
    it('path propagation', () => {
      let capturedPath = ''
      const customizer = jest.fn((_key: string, _targetVal: any, _sourceVal: any, ctx: any) => {
        capturedPath = ctx.path || ''
        return undefined
      })

      deepMerge({ config: { theme: 'dark' } } as any, { config: { size: 14 } } as any, customizer)
      expect(capturedPath).toBe('config.size')
    })

    it('parent reference is output object', () => {
      const customizer = jest.fn((_key: string, _targetVal: any, _sourceVal: any, ctx: any) => {
        expect(ctx.parent).toBeDefined()
        expect(typeof ctx.parent).toBe('object')
        return undefined
      })

      const result = deepMerge({ test: 1 } as any, { test: 2 } as any, customizer)
      expect(result.test).toBe(2)
      expect(customizer).toHaveBeenCalled()
    })
  })

  describe('recursion', () => {
    it('3-level deep merge', () => {
      const result = deepMerge(
        { a: { b: { c: 1 } } } as any,
        { a: { b: { d: 2 } } } as any
      )

      expect(result.a.b).toEqual({ c: 1, d: 2 })
    })

    it('non-plain objects replaced', () => {
      const target = { date: new Date() } as any
      const result = deepMerge(target, { date: '2023' } as any)
      expect(result.date).toBe('2023')
    })
  })

  describe('edge cases', () => {
    it('empty source preserves target', () => {
      const result = deepMerge({ a: 1 } as any, {})
      expect(result).toEqual({ a: 1 })
    })

    it('undefined values preserved', () => {
      const result = deepMerge({ a: 1 } as any, { b: undefined } as any)
      expect(result.b).toBeUndefined()
    })

    it('complex config merge', () => {
      const result = deepMerge(
        { config: { settings: { theme: 'dark' } } } as any,
        { config: { settings: { size: 14 } } } as any
      )

      expect(result.config.settings).toEqual({ theme: 'dark', size: 14 })
    })
  })

  describe('08. isPlainObject', () => {
    it('basic detection', () => {
      expect(isPlainObject({})).toBe(true)
      expect(isPlainObject([])).toBe(false)
      expect(isPlainObject(null)).toBe(false)
    })

    it('built-in rejection', () => {
      expect(isPlainObject(new Date())).toBe(false)
      expect(isPlainObject(/test/)).toBe(false)
    })
  })
})
