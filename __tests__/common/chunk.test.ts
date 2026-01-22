import { chunk, chunkStats, createChunker } from '../../src/common/chunk'

describe('chunk', () => {
  describe('basic functionality', () => {
    it('should chunk array by size', () => {
      const result = chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)
      expect(result).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ])
    })

    it('should handle empty array', () => {
      const result = chunk([], 3)
      expect(result).toEqual([])
    })

    it('should throw error for invalid size', () => {
      expect(() => chunk([1, 2, 3], 0))
        .toThrow('Chunk size must be a positive integer')
      expect(() => chunk([1, 2, 3], -1))
        .toThrow('Chunk size must be a positive integer')
      expect(() => chunk([1, 2, 3], 1.5))
        .toThrow('Chunk size must be a positive integer')
    })

    it('should handle size larger than array', () => {
      const result = chunk([1, 2, 3], 10)
      expect(result).toEqual([[1, 2, 3]])
    })
  })

  describe('direction', () => {
    it('should chunk forward (default)', () => {
      const result = chunk([1, 2, 3, 4, 5, 6, 7, 8], 3)
      expect(result).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8]
      ])
    })

    it('should chunk backward', () => {
      const result = chunk([1, 2, 3, 4, 5, 6, 7, 8], { size: 3, direction: 'backward' })
      expect(result).toEqual([
        [1, 2],      // 0-2
        [3, 4, 5],   // 3-5
        [6, 7, 8]    // 6-8
      ])
    })
  })

  describe('fill strategies', () => {
    it('should not fill incomplete chunks (default)', () => {
      const result = chunk([1, 2, 3, 4, 5], 3)
      expect(result).toEqual([[1, 2, 3], [4, 5]])
    })

    it('should duplicate last item', () => {
      const result = chunk([1, 2, 3, 4, 5], { size: 3, fill: 'duplicate' })
      expect(result).toEqual([[1, 2, 3], [4, 5, 5]])
    })

    it('should pad with value', () => {
      const result = chunk([1, 2, 3, 4, 5], {
        size: 3,
        fill: 'pad',
        padValue: 0
      })

      expect(result).toEqual([[1, 2, 3], [4, 5, 0]])
    })

    it('should ignore padValue when fill=duplicate', () => {
      const result = chunk([1, 2, 3], {
        size: 4,
        fill: 'duplicate',
        padValue: 999
      })

      expect(result).toEqual([[1, 2, 3, 3]])
    })

    it('should ignore fill when chunk is full', () => {
      const result = chunk([1, 2, 3, 4, 5, 6], { size: 3, fill: 'pad', padValue: 0 })
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]])
    })
  })

  describe('reverse option', () => {
    it('should reverse chunks (forward)', () => {
      const result = chunk([1, 2, 3, 4, 5, 6], { size: 2, reverse: true })
      expect(result).toEqual([
        [2, 1],  // reversed [1,2]
        [4, 3],  // reversed [3,4]
        [6, 5]   // reversed [5,6]
      ])
    })

    it('should reverse chunks (backward)', () => {
      const result = chunk([1, 2, 3, 4, 5, 6], {
        size: 2,
        direction: 'backward',
        reverse: true
      })

      expect(result).toEqual([
        [2, 1],  // reversed [1,2]
        [4, 3],  // reversed [3,4]
        [6, 5]   // reversed [5,6]
      ])
    })
  })

  describe('groupBy', () => {
    it('should group by object key', () => {
      const users = [
        { id: 1, cat: 'A' },
        { id: 2, cat: 'B' },
        { id: 3, cat: 'A' },
        { id: 4, cat: 'B' }
      ]

      const result = chunk(users, { size: 2, groupBy: 'cat' })
      expect(result).toEqual([
        [{ id: 1, cat: 'A' }, { id: 3, cat: 'A' }],
        [{ id: 2, cat: 'B' }, { id: 4, cat: 'B' }]
      ])
    })

    it('should group by function', () => {
      const numbers = [1, 2, 3, 4, 5, 6]
      const result = chunk(numbers, {
        size: 2,
        groupBy: (n) => (n % 2 === 0 ? 'even' : 'odd')
      })

      expect(result).toEqual([
        [1, 3],  // odd
        [5],
        [2, 4],  // even
        [6]
      ])
    })

    it('should chunk groups independently', () => {
      const data = [
        { id: 1, type: 'A' },
        { id: 2, type: 'B' },
        { id: 3, type: 'A' },
        { id: 4, type: 'B' },
        { id: 5, type: 'A' }
      ]

      const result = chunk(data, { size: 2, groupBy: 'type' })
      expect(result).toEqual([
        [{ id: 1, type: 'A' }, { id: 3, type: 'A' }],
        [{ id: 5, type: 'A' }],
        [{ id: 2, type: 'B' }, { id: 4, type: 'B' }]
      ])
    })
  })

  describe('combinations', () => {
    it('should combine backward + reverse + fill', () => {
      const result = chunk([1, 2, 3, 4], {
        size: 3,
        direction: 'backward',
        reverse: true,
        fill: 'pad',
        padValue: 0
      })

      expect(result).toEqual([
        [3, 2, 1],
        [4, 0, 0]
      ])
    })
  })
})

describe('chunkStats', () => {
  it('should return correct statistics', () => {
    const chunks = [[1, 2, 3], [4, 5], [6]]
    const stats = chunkStats(chunks)
    expect(stats).toEqual({
      totalChunks: 3,
      totalItems: 6,
      fullChunks: 1,
      partialChunks: 2,
      avgChunkSize: 2
    })
  })

  it('should handle empty chunks', () => {
    const stats = chunkStats([])
    expect(stats).toEqual({
      totalChunks: 0,
      totalItems: 0,
      fullChunks: 0,
      partialChunks: 0,
      avgChunkSize: 0
    })
  })

  it('should handle all full chunks', () => {
    const stats = chunkStats([[1, 2], [3, 4]])
    expect(stats).toEqual({
      totalChunks: 2,
      totalItems: 4,
      fullChunks: 2,
      partialChunks: 0,
      avgChunkSize: 2
    })
  })
})

describe('createChunker', () => {
  it('should create reusable chunker with options', () => {
    const chunker = createChunker({ size: 3, fill: 'pad', padValue: 0 })
    const result = chunker([1, 2, 3, 4, 5])
    expect(result).toEqual([[1, 2, 3], [4, 5, 0]])
  })

  it('should reuse options consistently', () => {
    const chunker = createChunker({ size: 2, direction: 'backward' })
    expect(chunker([1, 2, 3, 4])).toEqual([
      [1, 2],
      [3, 4]
    ])

    expect(chunker([5, 6])).toEqual([[5, 6]])
  })

  it('should support groupBy in chunker', () => {
    const users = [
      { id: 1, cat: 'A' },
      { id: 2, cat: 'B' },
      { id: 3, cat: 'A' }
    ]

    const chunker = createChunker({ size: 2, groupBy: 'cat' })
    const result = chunker(users)
    expect(result).toEqual([
      [{ id: 1, cat: 'A' }, { id: 3, cat: 'A' }],
      [{ id: 2, cat: 'B' }]
    ])
  })
})
