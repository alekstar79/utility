type ChunkDirection = 'forward' | 'backward';
type ChunkFillStrategy = 'none' | 'duplicate' | 'pad';

export interface ChunkOptions<T> {
  /** Chunk size (required) */
  size: number;
  /** Chunk direction: forward (default) | backward */
  direction?: ChunkDirection;
  /** Strategy for filling incomplete chunks */
  fill?: ChunkFillStrategy;
  /** Value to fill when fill='pad' */
  padValue?: T;
  /** Invert the order of chunks */
  reverse?: boolean;
  /** Group by key/function */
  groupBy?: keyof T | ((item: T, index: number) => string | number);
}

export interface PartialChunkOptions<T> {
  size?: number;
  direction?: ChunkDirection;
  fill?: ChunkFillStrategy;
  padValue?: T;
  reverse?: boolean;
  groupBy?: keyof T | ((item: T, index: number) => string | number);
}

export interface ChunkStats {
  totalChunks: number;
  totalItems: number;
  fullChunks: number;
  partialChunks: number;
  avgChunkSize: number;
}

/**
 * Spliting the array into chunks
 *
 * @example
 * const numbers = [1,2,3,4,5,6,7,8,9]
 *
 * // Basic usage
 * const basic = chunk(numbers, 3) // [[1,2,3],[4,5,6],[7,8,9]]
 *
 * // Padding
 * const padded = chunk(numbers, {
 *   size: 3,
 *   fill: 'pad',
 *   padValue: 0
 * }) // [[1,2,3],[4,5,6],[7,8,9],[0,0,0]]
 *
 * // Reverse chunking
 * const backward = chunk(numbers, {
 *   size: 4,
 *   direction: 'backward'
 * }) // [[5,6,7,8],[1,2,3,4]]
 *
 * // Grouping + chunks
 * const users = [
 *   { id: 1, cat: 'A' }, { id: 2, cat: 'B' },
 *   { id: 3, cat: 'A' }, { id: 4, cat: 'B' }
 * ]
 * const grouped = chunk(users, {
 *   size: 2,
 *   groupBy: 'cat'
 * }) // Groups A and B, each with 2 members
 *
 * console.log(chunkStats(basic))
 */
export function chunk<T>(
  source: readonly T[],
  options: number | ChunkOptions<T>
): T[][] {
  const opts = typeof options === 'number'
    ? { size: options }
    : options

  const {
    size,
    direction = 'forward',
    fill = 'none',
    padValue,
    reverse = false,
    groupBy
  } = opts

  // Validation
  if (!Number.isSafeInteger(size) || size <= 0) {
    throw new Error('Chunk size must be a positive integer')
  }

  if (!source.length) return []

  // Grouping by key
  let groupedData: T[][]
  if (groupBy) {
    const groups = new Map<string | number, T[]>()

    source.forEach((item, index) => {
      const key = typeof groupBy === 'function'
        ? groupBy(item, index)
        : (item as any)[groupBy!]

      if (!groups.has(key)) {
        groups.set(key, [])
      }

      groups.get(key)!.push(item)
    })

    groupedData = Array.from(groups.values())
  } else {
    groupedData = [Array.from(source)]
  }

  // Basic chunking logic
  const result: T[][] = []

  for (const group of groupedData) {
    const data = reverse ? [...group].reverse() : [...group]

    if (direction === 'backward') {
      for (let i = data.length; i > 0; i -= size) {
        const chunkSlice = data.slice(Math.max(0, i - size), i)
        result.unshift(fillChunk(chunkSlice, size, fill, padValue))
      }
    } else {
      for (let i = 0; i < data.length; i += size) {
        const chunkSlice = data.slice(i, i + size)
        result.push(fillChunk(chunkSlice, size, fill, padValue))
      }
    }
  }

  return reverse ? result.reverse() : result
}

function fillChunk<T>(
  chunk: T[],
  size: number,
  fill: ChunkFillStrategy,
  padValue?: T
): T[] {
  if (chunk.length === size || fill === 'none') return chunk

  const filled = [...chunk]
  const missing = size - chunk.length

  switch (fill) {
    case 'duplicate':
      const lastItem = chunk[chunk.length - 1]
      if (lastItem !== undefined) {
        for (let i = 0; i < missing; i++) {
          filled.push(lastItem);
        }
      }
      break;
    case 'pad':
      if (padValue !== undefined) {
        for (let i = 0; i < missing; i++) {
          filled.push(padValue);
        }
      }
      break
  }

  return filled
}

/**
 * Utility for obtaining chunk statistics
 */
export function chunkStats<T>(
  chunks: readonly T[][]
): ChunkStats {
  const totalChunks = chunks.length
  const totalItems = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const avgChunkSize = totalChunks ? totalItems / totalChunks : 0
  const firstChunkSize = chunks[0]?.length || 0
  const fullChunks = chunks.filter(c => c.length === firstChunkSize).length

  return {
    totalChunks,
    totalItems,
    fullChunks,
    partialChunks: totalChunks - fullChunks,
    avgChunkSize
  }
}

/**
 * Creates a chancer function with pre-installed options
 */
export function createChunker<T>(
  options: PartialChunkOptions<T> & { size: number }
): (arr: readonly T[]) => T[][] {
  return (arr: readonly T[]) => chunk(arr, {
    size: options.size,
    direction: options.direction,
    fill: options.fill,
    padValue: options.padValue,
    reverse: options.reverse,
    groupBy: options.groupBy
  } as ChunkOptions<T>)
}
