import { sortArray, sortAll, presets } from '../../src/common/sortArray'

describe('sortArray', () => {
  test('should sort numbers ascending by default', () => {
    const arr = [3, 1, 4, 1, 5]
    expect(sortArray(arr)).toEqual([1, 1, 3, 4, 5])
  })

  test('should sort descending with false', () => {
    const arr = [3, 1, 4, 1, 5]
    expect(sortArray(arr, false)).toEqual([5, 4, 3, 1, 1])
  })

  test('should handle small arrays and empty', () => {
    expect(sortArray([])).toEqual([])
    expect(sortArray([1])).toEqual([1])
  })

  test('should not mutate original when mutate=false (default)', () => {
    const arr = [3, 1, 2]
    const result = sortArray(arr)
    expect(result).not.toBe(arr)
    expect(arr).toEqual([3, 1, 2])
    expect(result).toEqual([1, 2, 3])
  })

  test('should mutate original when mutate=true', () => {
    const arr = [3, 1, 2]
    const result = sortArray(arr, { mutate: true })
    expect(result).toBe(arr)
    expect(arr).toEqual([1, 2, 3])
  })
})

describe('sort modes and stability', () => {
  describe('sort modes and stability', () => {
    test('should use merge sort (stable)', () => {
      const arr = [{ id: 1, val: 'a' }, { id: 2, val: 'a' }]
      const result = sortArray(arr, { mode: 'merge', key: (item: any) => item.id })
      expect(result).toEqual([{ id: 1, val: 'a' }, { id: 2, val: 'a' }])
    })
  })

  test('should sort strings lexicographically', () => {
    expect(sortArray(['banana', 'apple', 'cherry'])).toEqual(['apple', 'banana', 'cherry'])
  })
})

describe('key sorting and options object', () => {
  test('should sort by custom key function', () => {
    const items = [
      { name: 'item1', priority: 3 },
      { name: 'item2', priority: 1 },
      { name: 'item3', priority: 2 }
    ]
    const result = sortArray(items, { key: (item: any) => item.priority })
    expect(result[0]).toHaveProperty('name', 'item2')
  })
})

describe('sortAll and presets', () => {
  test('sortAll should sort multiple arrays', () => {
    const arrays = [[3, 1], [6, 4, 2]]
    expect(sortAll(arrays)).toEqual([[1, 3], [2, 4, 6]])
  })

  test('presets should work correctly', () => {
    expect(presets.numbers([3, 1, 2])).toEqual([1, 2, 3])
    expect(presets.strings(['c', 'a', 'b'])).toEqual(['a', 'b', 'c'])
  })
})
