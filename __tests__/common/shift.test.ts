import { shift } from '../../src/common/shift.ts'

describe('shift', () => {
  // Basic functionality
  test.each([
    [[1,2,3,4,5], 1, 2, [4,5,1,2,3]],      // right 2
    [[1,2,3,4,5], -1, 2, [3,4,5,1,2]],     // left 2
    [[1,2,3], 1, 1, [3,1,2]],              // right 1
    [['a','b','c'], -1, 1, ['b','c','a']], // left 1 strings
  ])('basic: %p shift(dir=%i,n=%i)', (arr, dir, n, expected) => {
    expect(shift<number | string>(arr, dir, n)).toEqual(expected)
  })

  // Edge cases
  test.each([
    [[], 1, 5, []],                        // empty
    [[1], 1, 10, [1]],                     // single + large n
    [[1,2,3], 1, 3, [1,2,3]],              // full cycle
    [[1,2,3], 1, 7, [3,1,2]],              // modulo 7%3=1
    [[1,2,3], 0, 5, [1,2,3]],              // zero direction
    [[1,2,3], 1, 0, [1,2,3]],              // zero positions
  ])('edges: %p shift(dir=%i,n=%i)', (arr, dir, n, expected) => {
    expect(shift<number>(arr, dir, n)).toEqual(expected)
  })

  // Generic types
  test('objects', () => {
    const obj = [{ id: 1 }, { id: 2 }]
    expect(shift(obj, 1, 1)).toEqual([{ id: 2 }, { id: 1 }])
  })

  test('immutable', () => {
    const original = [1, 2, 3]
    shift(original, 1, 1)
    expect(original).toEqual([1, 2, 3]) // unchanged
  })

  // Validation
  test.each([
    null, undefined, 'string', 42, true, ({})
  ])('throws TypeError: %p', (input: any) => {
    expect(() => shift(input, 1, 1)).toThrow(TypeError)
  })

  test.each([-1, -2.5, NaN, Infinity])('throws RangeError: n=%p', (n) => {
    expect(() => shift([1,2], 1, n)).toThrow(RangeError)
  })

  // Performance edge cases
  test('large arrays', () => {
    const large = Array(1000).fill(0).map((_, i) => i)
    const result = shift(large, 1, 333)
    expect(result.length).toBe(1000)
    expect(result[0]).toBe(667)
  })
})
