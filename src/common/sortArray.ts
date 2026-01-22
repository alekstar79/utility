/**
 * Types of sorting
 */
export type SortDirection = 'asc' | 'desc' | boolean;
export type SortStability = 'stable' | 'unstable';
export type SortMode = 'quick' | 'merge' | 'stable';

/**
 * Sorting options
 */
export interface SortOptions<T = any> {
  direction?: SortDirection;
  stability?: SortStability;
  mode?: SortMode;
  mutate?: boolean;
  key?: keyof T | ((item: T) => any);
}

/**
 * Universal comparator
 */
export type CompareFn<T> = (a: T, b: T) => number;

/**
 * Merge Sort (guaranteed stable, O(n log n))
 */
const mergeSort = <T>(array: T[], compareFn: CompareFn<T>): T[] => {
  if (array.length <= 1) return array

  const mid = array.length >> 1
  const left = mergeSort(array.slice(0, mid), compareFn)
  const right = mergeSort(array.slice(mid), compareFn)

  let i = 0, j = 0, result: T[] = []

  while (i < left.length && j < right.length) {
    result.push(compareFn(left[i], right[j]) <= 0 ? left[i++] : right[j++])
  }

  return result.concat(left.slice(i)).concat(right.slice(j))
}

/**
 * Normalization of options
 */
const normalizeSortOptions = <T>(
  options: SortDirection | SortOptions<T> = true
): Required<SortOptions<T>> => {
  const isDirection = typeof options === 'boolean' || typeof options === 'string'
  const opts = isDirection ? {} : options as SortOptions<T>

  return {
    direction: isDirection ? (options ? 'asc' : 'desc') : (opts.direction ?? 'asc'),
    stability: opts.stability ?? 'stable',
    mode: opts.mode ?? 'quick',
    mutate: !!opts.mutate,
    key: opts.key
  } as Required<SortOptions<T>>
}

/**
 * Universal Sort API
 */
export function sortArray<T>(
  array: T[],
  options: SortDirection | SortOptions<T> = true
): T[] {
  const opts = normalizeSortOptions(options)

  if (!Array.isArray(array) || array.length <= 1) {
    return opts.mutate ? array : [...array]
  }

  const asc = opts.direction === 'asc'
  const target = opts.mutate ? array : [...array]

  // type guard for key
  const compareFn: CompareFn<T> = opts.key
    ? ((a: T, b: T): number => {
      const keyA = (opts.key as (item: T) => any)(a)
      const keyB = (opts.key as (item: T) => any)(b)

      if (typeof keyA === 'number' && typeof keyB === 'number') {
        return asc ? keyA - keyB : keyB - keyA
      }

      return asc
        ? String(keyA).localeCompare(String(keyB))
        : String(keyB).localeCompare(String(keyA))
    })
    : ((a: T, b: T): number => {
      if (typeof a === 'number' && typeof b === 'number') {
        return asc ? (a as number) - (b as number) : (b as number) - (a as number)
      }

      return asc
        ? String(a).localeCompare(String(b))
        : String(b).localeCompare(String(a))
    })

  return opts.mode === 'merge'
    ? mergeSort(target, compareFn)
    : target.sort(compareFn)
}

/**
 * Batch sort
 */
export const sortAll = <T>(arrays: T[][], options: SortDirection | SortOptions<T> = true): T[][] =>
  arrays.map(arr => sortArray(arr, options))

/**
 * Presets
 */
export const presets = {
  numbers: <T extends number[]>(arr: T, asc = true) => sortArray(arr, { direction: asc ? 'asc' : 'desc' }),
  strings: <T extends string[]>(arr: T, asc = true) => sortArray(arr, { direction: asc ? 'asc' : 'desc' }),
  stable: <T>(arr: T[], asc = true) => sortArray(arr, { stability: 'stable', direction: asc ? 'asc' : 'desc' }),
  objects: <T extends Record<string, any>>(arr: T[], key: keyof T, asc = true) =>
    sortArray(arr, { direction: asc ? 'asc' : 'desc', key } as SortOptions<T>)
} as const
