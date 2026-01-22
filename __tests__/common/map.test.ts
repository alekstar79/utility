import { ExtendedMap, extendedMap, mapFromObject } from '../../src/common/map'

describe('ExtendedMap', () => {
  let map: ExtendedMap<string, number>

  beforeEach(() => {
    map = new ExtendedMap([
      ['a', 1],
      ['b', 2],
      ['c', 3],
      ['d', 4]
    ])
  })

  test('should return previous value', () => {
    expect(map.prev('b')).toBe(1)  // a <- b
    expect(map.prev('a')).toBe(4)  // d <- a (циклический)
    expect(map.prev('x')).toBeUndefined()
  })

  test('should return next value', () => {
    expect(map.next('b')).toBe(3)  // b -> c
    expect(map.next('d')).toBe(1)  // d -> a (циклический)
    expect(map.next('x')).toBeUndefined()
  })

  test('should return previous entry', () => {
    expect(map.prevEntries('b')).toEqual(['a', 1])
    expect(map.prevEntries('a')).toEqual(['d', 4])
  })

  test('should return next entry', () => {
    expect(map.nextEntries('b')).toEqual(['c', 3])
    expect(map.nextEntries('d')).toEqual(['a', 1])
  })

  test('should work with numeric keys', () => {
    const numMap = new ExtendedMap<number, string>([
      [1, 'one'],
      [2, 'two'],
      [3, 'three']
    ])

    expect(numMap.prev(2)).toBe('one')
    expect(numMap.next(3)).toBe('one')
  })

  test('should handle single item map', () => {
    const single = new ExtendedMap([['only', 42]])
    expect(single.prev('only')).toBe(42)
    expect(single.next('only')).toBe(42)
  })

  test('should handle empty map', () => {
    const empty = new ExtendedMap<string, number>()
    expect(empty.prev('any')).toBeUndefined()
    expect(empty.next('any')).toBeUndefined()
  })

  test('extendedMap factory works', () => {
    const obj = { x: 10, y: 20, z: 30 }
    const map = extendedMap(obj)

    expect(map.get('x')).toBe(10)
    expect(map.prev('y')).toBe(10)  // x <- y
    expect(map.next('z')).toBe(10)  // z -> x
  })

  test('mapFromObject factory works', () => {
    const obj = { foo: 'bar', num: 123 }
    const map = mapFromObject(obj)

    expect(map.get('foo')).toBe('bar')
    expect(map.size).toBe(2)
    // @ts-ignore
    expect(map.prev).toBeUndefined()
  })

  test('should maintain insertion order', () => {
    const ordered = new ExtendedMap([
      ['z', 3],
      ['x', 1],
      ['y', 2]
    ])

    expect(ordered.next('z')).toBe(1)  // z -> x
    expect(ordered.next('x')).toBe(2)  // x -> y
  })

  test('should work with complex values', () => {
    const complex = new ExtendedMap<string, any>([
      ['user', { name: 'John' }],
      ['config', { theme: 'dark' }],
      ['count', 42]
    ])

    expect(complex.prev('config')).toEqual({ name: 'John' })
    expect(complex.next('count')).toEqual({ name: 'John' })
  })

  test('should handle symbol keys', () => {
    const sym1 = Symbol('first')
    const sym2 = Symbol('second')

    const symMap = new ExtendedMap<symbol, string>([
      [sym1, 'first'],
      [sym2, 'second']
    ])

    expect(symMap.prev(sym2)).toBe('first')
    expect(symMap.next(sym1)).toBe('second')
  })
})
