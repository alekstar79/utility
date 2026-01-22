import '../../src/common/binary'

describe('Array binary search extensions', () => {
  describe('binarySearch', () => {
    it('should find element in sorted array', () => {
      const arr = [1, 3, 5, 7, 9]
      expect(arr.binarySearch(5)).toBe(2)
      expect(arr.binarySearch(1)).toBe(0)
      expect(arr.binarySearch(9)).toBe(4)
    })

    it('should return bitwise negation of insertion point for missing element', () => {
      const arr = [1, 3, 5, 7, 9]
      expect(arr.binarySearch(0)).toBe(~0)  // Should insert at 0
      expect(arr.binarySearch(4)).toBe(~2)  // Should insert at 2
      expect(arr.binarySearch(10)).toBe(~5) // Should insert at 5
    })

    it('should work with custom comparator', () => {
      const arr = [{ id: 1 }, { id: 3 }, { id: 5 }]
      const comparator = (a: { id: number }, b: { id: number }) => a.id - b.id

      expect(arr.binarySearch({ id: 3 }, comparator)).toBe(1)
      expect(arr.binarySearch({ id: 4 }, comparator)).toBe(~2)
    })

    it('should handle empty array', () => {
      const arr: number[] = []
      expect(arr.binarySearch(5)).toBe(~0)
    })

    it('should handle single element array', () => {
      const arr = [5]
      expect(arr.binarySearch(5)).toBe(0)
      expect(arr.binarySearch(3)).toBe(~0)
      expect(arr.binarySearch(7)).toBe(~1)
    })

    it('should work with string arrays', () => {
      const arr = ['apple', 'banana', 'cherry']
      expect(arr.binarySearch('banana')).toBe(1)
      expect(arr.binarySearch('blueberry')).toBe(~2)
    })
  })

  describe('binaryInsert', () => {
    it('should insert element in correct position', () => {
      const arr = [1, 3, 5, 7, 9]
      const index = arr.binaryInsert(6)

      expect(index).toBe(3)
      expect(arr).toEqual([1, 3, 5, 6, 7, 9])
    })

    it('should not insert duplicates when allowDuplicates is false', () => {
      const arr = [1, 3, 5, 7, 9]
      const index = arr.binaryInsert(5, false)

      expect(index).toBe(2) // Returns existing index
      expect(arr).toEqual([1, 3, 5, 7, 9]) // Array unchanged
    })

    it('should allow duplicates when allowDuplicates is true', () => {
      const arr = [1, 3, 5, 7, 9]
      const index = arr.binaryInsert(5, true)

      expect(index).toBe(2)
      expect(arr).toEqual([1, 3, 5, 5, 7, 9])
    })

    it('should insert at beginning', () => {
      const arr = [2, 4, 6]
      const index = arr.binaryInsert(1)

      expect(index).toBe(0)
      expect(arr).toEqual([1, 2, 4, 6])
    })

    it('should insert at end', () => {
      const arr = [2, 4, 6]
      const index = arr.binaryInsert(8)

      expect(index).toBe(3)
      expect(arr).toEqual([2, 4, 6, 8])
    })

    it('should work with custom comparator', () => {
      const arr = [{ id: 1 }, { id: 3 }, { id: 5 }]
      const comparator = (a: { id: number }, b: { id: number }) => a.id - b.id;

      const index = arr.binaryInsert({ id: 4 }, false, comparator)

      expect(index).toBe(2)
      expect(arr.map(x => x.id)).toEqual([1, 3, 4, 5])
    })

    it('should handle empty array', () => {
      const arr: number[] = []
      const index = arr.binaryInsert(5)

      expect(index).toBe(0)
      expect(arr).toEqual([5])
    })
  })

  describe('binaryDelete', () => {
    it('should delete existing element', () => {
      const arr = [1, 3, 5, 7, 9]
      const index = arr.binaryDelete(5)

      expect(index).toBe(2)
      expect(arr).toEqual([1, 3, 7, 9])
    })

    it('should return -1 for non-existing element', () => {
      const arr = [1, 3, 5, 7, 9]
      const index = arr.binaryDelete(6)

      expect(index).toBe(~3) // Returns insertion point bitwise negated
      expect(arr).toEqual([1, 3, 5, 7, 9]) // Array unchanged
    })

    it('should delete first element', () => {
      const arr = [1, 3, 5, 7, 9]
      const index = arr.binaryDelete(1)

      expect(index).toBe(0)
      expect(arr).toEqual([3, 5, 7, 9])
    })

    it('should delete last element', () => {
      const arr = [1, 3, 5, 7, 9]
      const index = arr.binaryDelete(9)

      expect(index).toBe(4)
      expect(arr).toEqual([1, 3, 5, 7])
    })

    it('should work with custom comparator', () => {
      const arr = [{ id: 1 }, { id: 3 }, { id: 5 }]
      const comparator = (a: { id: number }, b: { id: number }) => a.id - b.id

      const index = arr.binaryDelete({ id: 3 }, comparator)

      expect(index).toBe(1)
      expect(arr.map(x => x.id)).toEqual([1, 5])
    })

    it('should handle empty array', () => {
      const arr: number[] = []
      const index = arr.binaryDelete(5)

      expect(index).toBe(~0) // Not found, would insert at 0
      expect(arr).toEqual([]) // Array unchanged
    })

    it('should handle single element array', () => {
      const arr = [5]
      const index = arr.binaryDelete(5)

      expect(index).toBe(0)
      expect(arr).toEqual([])

      const index2 = arr.binaryDelete(5)
      expect(index2).toBe(~0)
    })
  })

  describe('integration tests', () => {
    it('should maintain sorted order through multiple operations', () => {
      const arr: number[] = []

      arr.binaryInsert(5)
      arr.binaryInsert(2)
      arr.binaryInsert(8)
      arr.binaryInsert(1)

      expect(arr).toEqual([1, 2, 5, 8])

      arr.binaryDelete(2)
      expect(arr).toEqual([1, 5, 8])

      arr.binaryInsert(3)
      expect(arr).toEqual([1, 3, 5, 8])
    })

    it('should work with duplicate handling', () => {
      const arr: number[] = []

      arr.binaryInsert(5, true)
      arr.binaryInsert(2, true)
      arr.binaryInsert(5, true)
      arr.binaryInsert(2, true)

      expect(arr).toEqual([2, 2, 5, 5])

      arr.binaryDelete(2)
      expect(arr).toEqual([2, 5, 5])
    })

    it('should handle large arrays', () => {
      const arr: number[] = []
      const size = 1000

      for (let i = 0; i < size; i++) {
        arr.binaryInsert(Math.random())
      }

      // Verify array is sorted
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1])
      }

      // Delete some elements
      for (let i = 0; i < 100; i++) {
        const index = Math.floor(Math.random() * arr.length)
        const value = arr[index]
        arr.binaryDelete(value)
      }

      // Verify still sorted after deletions
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1])
      }
    })
  })

  describe('edge cases', () => {
    it('should handle negative numbers', () => {
      const arr = [-5, -3, -1, 0, 2, 4]
      expect(arr.binarySearch(-3)).toBe(1)
      expect(arr.binarySearch(-2)).toBe(~2)

      arr.binaryInsert(-2)
      expect(arr).toEqual([-5, -3, -2, -1, 0, 2, 4])
    })

    it('should handle floating point numbers', () => {
      const arr = [1.1, 2.2, 3.3, 4.4]
      expect(arr.binarySearch(3.3)).toBe(2)
      expect(arr.binarySearch(2.5)).toBe(~2)

      arr.binaryInsert(2.5)
      expect(arr).toEqual([1.1, 2.2, 2.5, 3.3, 4.4])
    })

    it('should handle identical elements with duplicates allowed', () => {
      const arr = [1, 1, 1]
      const index = arr.binaryInsert(1, true)
      expect(index).toBe(1) // Inserts in the middle of duplicates
      expect(arr).toEqual([1, 1, 1, 1])
    })

    it('should handle array with all same elements', () => {
      const arr = [5, 5, 5, 5]
      expect(arr.binarySearch(5)).toBe(1) // Finds one of them

      arr.binaryDelete(5)
      expect(arr).toEqual([5, 5, 5]) // Deletes one occurrence
    })
  })
})
