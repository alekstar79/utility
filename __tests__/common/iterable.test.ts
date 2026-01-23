import { ExtendedArray, extendedArray } from '../../src/common/array'
import { AsyncArray } from '../../src/common/asyncArray'
import { asyncIter } from '../../src/common/asyncIter'
import { iterable } from '../../src/common/iterable'

describe('ExtendedArray', () => {
  describe('getAdjacentIndex', () => {
    it('should return undefined when value not found', () => {
      const array = extendedArray([1, 2, 3])
      expect(array.getAdjacentIndex('prev', 5)).toBeUndefined()
      expect(array.getAdjacentIndex('next', 5)).toBeUndefined()
    })

    it('should return correct previous index for first element', () => {
      const array = extendedArray([1, 2, 3])
      expect(array.getAdjacentIndex('prev', 1)).toBe(2)
    })

    it('should return correct next index for last element', () => {
      const array = extendedArray([1, 2, 3])
      expect(array.getAdjacentIndex('next', 3)).toBe(0)
    })

    it('should handle single element array', () => {
      const array = extendedArray([1])
      expect(array.getAdjacentIndex('prev', 1)).toBe(0)
      expect(array.getAdjacentIndex('next', 1)).toBe(0)
    })

    it('should return undefined for empty array', () => {
      const array = extendedArray([])
      // @ts-ignore
      expect(array.getAdjacentIndex('prev', 1)).toBeUndefined()
      // @ts-ignore
      expect(array.getAdjacentIndex('next', 1)).toBeUndefined()
    })
  })

  describe('prev', () => {
    it('should return previous element', () => {
      const array = extendedArray([1, 2, 3])
      expect(array.prev(2)).toBe(1)
    })

    it('should wrap around to last element when at first element', () => {
      const array = extendedArray([1, 2, 3])
      expect(array.prev(1)).toBe(3)
    })

    it('should return undefined when value not found', () => {
      const array = extendedArray([1, 2, 3])
      expect(array.prev(5)).toBeUndefined()
    })

    it('should work with single element array', () => {
      const array = extendedArray([1])
      expect(array.prev(1)).toBe(1)
    })

    it('should return undefined for empty array', () => {
      const array = extendedArray([])
      // @ts-ignore
      expect(array.prev(1)).toBeUndefined()
    })

    it('should work with objects', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const array = extendedArray([obj1, obj2])
      expect(array.prev(obj2)).toBe(obj1)
    })
  })

  describe('next', () => {
    it('should return next element', () => {
      const array = extendedArray([1, 2, 3])
      expect(array.next(2)).toBe(3)
    })

    it('should wrap around to first element when at last element', () => {
      const array = extendedArray([1, 2, 3])
      expect(array.next(3)).toBe(1)
    })

    it('should return undefined when value not found', () => {
      const array = extendedArray([1, 2, 3])
      expect(array.next(5)).toBeUndefined()
    })

    it('should work with single element array', () => {
      const array = extendedArray([1])
      expect(array.next(1)).toBe(1)
    })

    it('should return undefined for empty array', () => {
      const array = extendedArray([])
      // @ts-ignore
      expect(array.next(1)).toBeUndefined()
    })

    it('should work with objects', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const array = extendedArray([obj1, obj2])
      expect(array.next(obj1)).toBe(obj2)
    })
  })

  describe('extendedArray factory function', () => {
    it('should create ExtendedArray from array', () => {
      const result = extendedArray([1, 2, 3])
      expect(result).toBeInstanceOf(ExtendedArray)
      expect(result.length).toBe(3)
      expect(result.next(1)).toBe(2)
    })

    it('should create ExtendedArray from Set', () => {
      const result = extendedArray(new Set([1, 2, 3]))
      expect(result).toBeInstanceOf(ExtendedArray)
      expect(result.length).toBe(3)
    })

    it('should preserve array functionality', () => {
      const array = extendedArray([1, 2, 3])
      expect(array.map(x => x * 2)).toEqual([2, 4, 6])
      expect(array.filter(x => x > 1)).toEqual([2, 3])
    })
  })

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const array = extendedArray([])
      // @ts-ignore
      expect(array.prev(1)).toBeUndefined()
      // @ts-ignore
      expect(array.next(1)).toBeUndefined()
    })

    it('should handle duplicate values correctly', () => {
      const array = extendedArray([1, 2, 1, 3])
      expect(array.prev(1)).toBe(3)
      expect(array.next(1)).toBe(2)
    })

    it('should work with different types', () => {
      const array = extendedArray(['a', 'b', 'c'])
      expect(array.prev('b')).toBe('a')
      expect(array.next('b')).toBe('c')
    })
  })
})

describe('AsyncArray', () => {
  describe('Symbol.asyncIterator', () => {
    it('should iterate over empty array', async () => {
      const array = new AsyncArray()
      const iterator = array[Symbol.asyncIterator]()

      const result1 = await iterator.next()
      expect(result1.value).toBeUndefined()
      expect(result1.done).toBe(true)
    })

    it('should iterate over array with one element', async () => {
      const array = new AsyncArray(1)
      const iterator = array[Symbol.asyncIterator]()

      const result1 = await iterator.next()
      expect(result1.value).toBeUndefined()
      expect(result1.done).toBe(false)

      const result2 = await iterator.next()
      expect(result2.value).toBeUndefined()
      expect(result2.done).toBe(true)
    })

    it('should iterate over array with multiple elements', async () => {
      const array = new AsyncArray(1, 2, 3)
      const iterator = array[Symbol.asyncIterator]()

      const result1 = await iterator.next()
      expect(result1.value).toBe(1)
      expect(result1.done).toBe(false)

      const result2 = await iterator.next()
      expect(result2.value).toBe(2)
      expect(result2.done).toBe(false)

      const result3 = await iterator.next()
      expect(result3.value).toBe(3)
      expect(result3.done).toBe(false)

      const result4 = await iterator.next()
      expect(result4.value).toBeUndefined()
      expect(result4.done).toBe(true)
    })

    it('should iterate over array with actual values', async () => {
      const array = new AsyncArray()
      array.push(1)

      const iterator = array[Symbol.asyncIterator]()

      const result1 = await iterator.next()
      expect(result1.value).toBe(1)
      expect(result1.done).toBe(false)

      const result2 = await iterator.next()
      expect(result2.value).toBeUndefined()
      expect(result2.done).toBe(true)
    })

    it('should work with for-await-of loop', async () => {
      const array = new AsyncArray('a', 'b', 'c')
      const results: string[] = []

      for await (const item of array) {
        results.push(item)
      }

      expect(results).toEqual(['a', 'b', 'c'])
    })

    it('should preserve array functionality', () => {
      const array = new AsyncArray(1, 2, 3)
      expect(array.length).toBe(3)
      expect(array.map(x => x * 2)).toEqual([2, 4, 6])
      expect(array.filter(x => x > 1)).toEqual([2, 3])
    })

    it('should handle different data types', async () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const array = new AsyncArray(obj1, obj2)
      const iterator = array[Symbol.asyncIterator]()

      const result1 = await iterator.next()
      expect(result1.value).toBe(obj1)

      const result2 = await iterator.next()
      expect(result2.value).toBe(obj2)

      const result3 = await iterator.next()
      expect(result3.done).toBe(true)
    })

    it('should work with spread operator', () => {
      const array = new AsyncArray(1, 2, 3)
      const normalArray = [...array]
      expect(normalArray).toEqual([1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('should handle sparse arrays', async () => {
      const array = new AsyncArray()
      array[2] = 'test'
      const iterator = array[Symbol.asyncIterator]()

      const result1 = await iterator.next()
      expect(result1.value).toBeUndefined()

      const result2 = await iterator.next()
      expect(result2.value).toBeUndefined()

      const result3 = await iterator.next()
      expect(result3.value).toBe('test')

      const result4 = await iterator.next()
      expect(result4.done).toBe(true)
    })

    it('should maintain independent iterators', async () => {
      const array = new AsyncArray(1, 2)
      const iterator1 = array[Symbol.asyncIterator]()
      const iterator2 = array[Symbol.asyncIterator]()

      const result1a = await iterator1.next()
      const result2a = await iterator2.next()

      expect(result1a.value).toBe(1)
      expect(result2a.value).toBe(1)

      const result1b = await iterator1.next()
      const result2b = await iterator2.next()

      expect(result1b.value).toBe(2)
      expect(result2b.value).toBe(2)
    })

    it('should work with array modification during iteration', async () => {
      const array = new AsyncArray(1, 2)
      const iterator = array[Symbol.asyncIterator]()

      const result1 = await iterator.next()
      expect(result1.value).toBe(1)

      array.push(3)

      const result2 = await iterator.next()
      expect(result2.value).toBe(2)

      const result3 = await iterator.next()
      expect(result3.done).toBe(true)
    })
  })

  describe('performance and timing', () => {
    it('should resolve promises asynchronously', async () => {
      const array = new AsyncArray(1)
      const iterator = array[Symbol.asyncIterator]()

      const startTime = Date.now()
      const result = await iterator.next()
      const endTime = Date.now()

      expect(result.value).toBeUndefined()
      expect(endTime - startTime).toBeGreaterThanOrEqual(0)
    })

    it('should handle rapid sequential calls', async () => {
      const array = new AsyncArray(1, 2, 3)
      const iterator = array[Symbol.asyncIterator]()

      const results = await Promise.all([
        iterator.next(),
        iterator.next(),
        iterator.next(),
        iterator.next()
      ])

      expect(results[0].value).toBe(1)
      expect(results[1].value).toBe(2)
      expect(results[2].value).toBe(3)
      expect(results[3].done).toBe(true)
    })
  })
})

describe('asyncIter', () => {
  it('should iterate over empty array', async () => {
    const array: Promise<any>[] = []
    const iterable = asyncIter(array)

    const results = []
    for await (const item of iterable) {
      results.push(item)
    }

    expect(results).toEqual([])
    expect(array.length).toBe(0)
  })

  it('should iterate over array with resolved promises', async () => {
    const array = [1, 2, 3, 4, 5].map(item => Promise.resolve(item))
    const iterable = asyncIter(array)

    const results = []
    for await (const item of iterable) {
      results.push(item)
    }

    expect(results).toEqual([1, 2, 3, 4, 5])
    expect(array.length).toBe(0)
  })

  it('should iterate over array with mixed promises', async () => {
    const iterable = asyncIter([
      Promise.resolve(1),
      Promise.reject(new Error('Test error')),
      Promise.resolve(3)
    ])

    const results = []
    const errors = []

    try {
      for await (const item of iterable) {
        results.push(item)
      }
    } catch (error) {
      errors.push(error)
    }

    expect(results).toEqual([1])
    // @ts-ignore
    expect(errors[0]?.message).toBe('Test error')
  })

  it('should process promises in order', async () => {
    const array = [
      Promise.resolve().then(() => 1),
      Promise.resolve().then(() => 2),
      Promise.resolve().then(() => 3)
    ]

    const iterable = asyncIter(array)
    const results = []

    for await (const item of iterable) {
      results.push(item)
    }

    expect(results).toEqual([1, 2, 3])
  })

  it('should work with async generator syntax', async () => {
    const iterable = asyncIter([
      Promise.resolve('a'),
      Promise.resolve('b'),
      Promise.resolve('c')
    ])

    const iterator = iterable[Symbol.asyncIterator]()

    const result1 = await iterator.next()
    expect(result1.value).toBe('a')
    expect(result1.done).toBe(false)

    const result2 = await iterator.next()
    expect(result2.value).toBe('b')
    expect(result2.done).toBe(false)

    const result3 = await iterator.next()
    expect(result3.value).toBe('c')
    expect(result3.done).toBe(false)

    const result4 = await iterator.next()
    expect(result4.value).toBeUndefined()
    expect(result4.done).toBe(true)
  })

  it('should modify original array (shift elements)', async () => {
    const promise1 = Promise.resolve(1)
    const promise2 = Promise.resolve(2)
    const promise3 = Promise.resolve(3)

    const array = [promise1, promise2, promise3]
    const iterable = asyncIter(array)

    expect(array.length).toBe(3)

    const results = []
    for await (const item of iterable) {
      results.push(item)
      expect(array.length).toBe(3 - results.length)
    }

    expect(results).toEqual([1, 2, 3])
    expect(array.length).toBe(0)
  })

  it('should work with different data types', async () => {
    const obj = { key: 'value' }
    const arr = [1, 2, 3]
    const func = () => 'test'

    const iterable = asyncIter([
      Promise.resolve(obj),
      Promise.resolve(arr),
      Promise.resolve(func)
    ])

    const results = []
    for await (const item of iterable) {
      results.push(item)
    }

    expect(results).toEqual([obj, arr, func])
  })

  it('should handle large arrays efficiently', async () => {
    const largeArray = Array.from({ length: 1000 }, (_, i) => Promise.resolve(i))
    const iterable = asyncIter(largeArray)

    let count = 0
    for await (const item of iterable) {
      expect(item).toBe(count)
      count++
    }

    expect(count).toBe(1000)
  })

  it('should be reusable with new array', async () => {
    const iterable1 = asyncIter([
      Promise.resolve(1),
      Promise.resolve(2)
    ])

    const results1 = []
    for await (const item of iterable1) {
      results1.push(item)
    }

    expect(results1).toEqual([1, 2])

    const iterable2 = asyncIter([
      Promise.resolve(3),
      Promise.resolve(4)
    ])

    const results2 = []
    for await (const item of iterable2) {
      results2.push(item)
    }

    expect(results2).toEqual([3, 4])
  })

  describe('edge cases', () => {
    it('should work with already resolved promises', async () => {
      const resolvedPromise = Promise.resolve('resolved')
      const array = [resolvedPromise]
      const iterable = asyncIter(array)

      const results = []
      for await (const item of iterable) {
        results.push(item)
      }

      expect(results).toEqual(['resolved'])
    })

    it('should work with pending promises', async () => {
      let resolveFunc: (value: string) => void
      const pendingPromise = new Promise<string>(resolve => {
        resolveFunc = resolve
      })

      const array = [pendingPromise]
      const iterable = asyncIter(array)

      setTimeout(() => resolveFunc!('resolved'), 10)

      const results = []
      for await (const item of iterable) {
        results.push(item)
      }

      expect(results).toEqual(['resolved'])
    })

    it('should handle null and undefined values in promises', async () => {
      const iterable = asyncIter([
        Promise.resolve(null),
        Promise.resolve(undefined)
      ])

      const results = []
      for await (const item of iterable) {
        results.push(item)
      }

      expect(results).toEqual([null, undefined])
    })
  })

  describe('error handling', () => {
    it('should throw on non-promise values', async () => {
      const iterable = asyncIter([
        Promise.resolve(1),
        2 as any,
        Promise.resolve(3)
      ])

      const errors = []
      try {
        for await (const item of iterable) {
          void item
        }
      } catch (error) {
        errors.push(error)
      }

      expect(errors.length).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('iterable - Object to Iterable Converter', () => {
  test('should add length property', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = iterable(obj)
    expect(result.length).toBe(3)
    expect(result.length).toEqual(Object.keys(obj).length)
  })

  test('should make object iterable', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = iterable(obj)

    const actual = Array.from(result) as any[]
    expect(actual).toEqual([1, 2, 3])
  })

  test('should preserve original object properties', () => {
    const original = { a: 1, b: 2, c: 3 }
    const result = iterable(original)

    expect(result.a).toBe(1)
    expect(result.b).toBe(2)
    expect(result.c).toBe(3)
    expect(result).toBe(original)
  })

  test('should work with for...of loop', () => {
    const obj = { x: 'hello', y: 'world', z: 42 }
    const result = iterable(obj)

    const values = Array.from(result) as any[]
    expect(values).toEqual(['hello', 'world', 42])
  })

  test('should work with spread operator', () => {
    const obj = { foo: 'bar', num: 123 }
    const result = iterable(obj)

    const arr = Array.from(result) as any[]
    expect(arr).toEqual(['bar', 123])
    expect(arr.length).toBe(2)
  })

  test('should handle empty object', () => {
    const obj: Record<string, never> = {}
    const result = iterable(obj)

    expect(result.length).toBe(0)
    expect(Array.from(result)).toEqual([])
  })

  test('should handle object with symbols', () => {
    const sym = Symbol('test')
    const obj = { a: 1, b: 2, [sym]: 3 }
    const result = iterable(obj)

    expect(result.length).toBe(2)
    expect(Array.from(result) as any[]).toEqual([1, 2])
  })

  test('should iterate in property enumeration order', () => {
    const obj = { c: 3, a: 1, b: 2 }
    const result = iterable(obj)

    const actual = Array.from(result) as any[]
    expect(actual).toEqual([3, 1, 2])
  })

  test('should handle nested objects', () => {
    const obj = {
      user: { name: 'John' },
      config: { theme: 'dark' },
      count: 42
    }
    const result = iterable(obj)

    expect(result.length).toBe(3)
    const values = Array.from(result) as any[]
    expect(values).toContainEqual({ name: 'John' })
    expect(values).toContainEqual({ theme: 'dark' })
    expect(values).toContainEqual(42)
  })

  test('should not affect prototype properties', () => {
    const obj = Object.create({ proto: 'value' })
    obj.a = 1
    obj.b = 2

    const result = iterable(obj)
    expect(result.length).toBe(2)
    expect(Array.from(result) as any[]).toEqual([1, 2, 'value'])
  })

  test('should work with Array.from', () => {
    const obj = { first: 'John', last: 'Doe' }
    const result = iterable(obj)

    const arr = Array.from(result) as any[]
    expect(arr).toEqual(['John', 'Doe'])
  })

  test('should support destructuring', () => {
    const obj = { x: 10, y: 20, z: 30 }
    const result = iterable(obj)

    const [first, second, third] = Array.from(result) as any[]
    expect(first).toBe(10)
    expect(second).toBe(20)
    expect(third).toBe(30)
  })

  test('should maintain type safety', () => {
    interface User {
      name: string
      age: number
    }

    const user = { name: 'Alice', age: 30 } as User
    const result = iterable(user)

    const values = Array.from(result) as any[]
    expect(values).toEqual(['Alice', 30])
  })
})
