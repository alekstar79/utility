/**
 * Types for working with objects that contain score
 */
export interface Scorable {
  score: number;
}

export interface FindMaxScoreOptions {
  /**
   * Custom predicate for filtering before finding the maximum
   * Improves performance when working with large arrays
   */
  filter?: (item: unknown) => item is Scorable;
  /**
   * Custom function for comparing score
   * Allows you to select based on alternative criteria (max/min)
   */
  compareFn?: (current: number, candidate: number) => boolean;
}

/**
 * Finds all array elements with the maximum score value
 *
 * Complexity: O(n) single pass
 * Memory: O(k) where k = number of elements with max score
 *
 * @param items - the original array of objects with score
 * @param options - configuration options
 * @returns an array of elements with the maximum score
 *
 * @example
 * const items = [
 *   { name: 'a', score: 10 },
 *   { name: 'b', score: 20 },
 *   { name: 'c', score: 20 }
 * ];
 * findMaxScores(items); // [{ name: 'b', score: 20 }, { name: 'c', score: 20 }]
 */
export function findMaxScores<T extends Scorable>(
  items: readonly T[],
  options: FindMaxScoreOptions = {}
): T[] {
  const { compareFn = (current, candidate) => candidate > current } = options

  // Edge case: empty array
  if (!items || items.length === 0) return []

  // Single pass: find the maximum and collect the results
  let maxScore = items[0].score
  const results: T[] = [items[0]]

  for (let i = 1; i < items.length; i++) {
    const item = items[i]

    if (compareFn(maxScore, item.score)) {
      maxScore = item.score
      results.length = 0
      results.push(item)
    } else if (item.score === maxScore) {
      results.push(item)
    }
  }

  return results
}

/**
 * Version with support for custom score selector
 * Useful when score is inside nested object
 */
export function findMaxScoresWithSelector<T, S extends number>(
  items: readonly T[],
  selector: (item: T) => S,
  compareFn?: (current: S, candidate: S) => boolean
): T[] {
  const compare = compareFn ?? ((current: S, candidate: S) => candidate > current)

  if (!items || items.length === 0) {
    return []
  }

  let maxScore = selector(items[0])
  const results: T[] = [items[0]]

  for (let i = 1; i < items.length; i++) {
    const item = items[i]
    const score = selector(item)

    if (compare(maxScore, score)) {
      maxScore = score
      results.length = 0
      results.push(item)
    } else if (score === maxScore) {
      results.push(item)
    }
  }

  return results
}

/**
 * Full-featured implementation with edge case handling
 */
export class MaxScoreFinder<T extends Scorable> {
  private readonly items: readonly T[]
  private cached: T[] | null = null
  private isDirty = true

  constructor(items: readonly T[]) {
    this.items = Object.freeze([...items])
  }

  /**
   * Get elements with the maximum score (with caching)
   */
  getMaxItems(): readonly T[] {
    if (!this.isDirty && this.cached !== null) {
      return this.cached
    }

    this.cached = findMaxScores(this.items)
    this.isDirty = false
    return this.cached
  }

  /**
   * Get the maximum score without creating a new array
   */
  getMaxScore(): number | undefined {
    return this.items.length > 0
      ? Math.max(...this.items.map((i) => i.score))
      : undefined
  }

  /**
   * Get the number of items with the maximum score
   */
  getMaxScoreCount(): number {
    return this.getMaxItems().length
  }

  /**
   * Invalidate the cache (if you need to reuse it)
   */
  invalidateCache(): void {
    this.isDirty = true
    this.cached = null
  }
}
