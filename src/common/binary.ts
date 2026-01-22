/**
 * TypeScript Array extension with binary search,
 * insertion, and deletion, strongly typed
 */

type Comparator<T> = (a: T, b: T) => number;

const defaultComparator = <T>(a: T, b: T): number =>
  a < b ? -1 : a > b ? 1 : 0;

/**
 * Binary search in a sorted array
 * @returns the index of the found element, or the bitwise negation of the index for insertion
 */
function binarySearch<T>(
  this: T[],
  target: T,
  comparator: Comparator<T> = defaultComparator
): number {
  let l = 0,
    h = this.length - 1,
    m: number,
    comparison: number

  while (l <= h) {
    m = (l + h) >>> 1
    comparison = comparator(this[m], target)

    if (comparison < 0) l = m + 1
    else if (comparison > 0) h = m - 1
    else return m
  }

  return ~l
}

/**
 * Insertion with binary search support
 * @template T
 * @param {T} target - element to insert
 * @param {boolean} allowDuplicates allow duplicates (default false)
 * @param {Comparator} comparator - comparison function
 * @returns {number} - insertion index or existing element
 */
function binaryInsert<T>(
  this: T[],
  target: T,
  allowDuplicates: boolean = false,
  comparator: Comparator<T> = defaultComparator
): number {
  let i = this.binarySearch(target, comparator)

  if (i >= 0) {
    if (!allowDuplicates) return i
  } else {
    i = ~i
  }

  this.splice(i, 0, target)

  return i
}

/**
 * Removing an element with a binary search.
 * @template T
 * @param {T} target - the element to remove
 * @param {Comparator} comparator - the comparison function
 * @returns {number} - the index of the removed element or -1 if not found
 */
function binaryDelete<T>(
  this: T[],
  target: T,
  comparator: Comparator<T> = defaultComparator
): number {
  const i = this.binarySearch(target, comparator)

  if (i >= 0) {
    this.splice(i, 1)
  }

  return i
}

// Extending the array interface with our methods
declare global {
  interface Array<T> {
    binarySearch(target: T, comparator?: Comparator<T>): number;
    binaryInsert(target: T, allowDuplicates?: boolean, comparator?: Comparator<T>): number;
    binaryDelete(target: T, comparator?: Comparator<T>): number;
  }
}

// Defining methods on a prototype
Object.defineProperty(Array.prototype, 'binarySearch', { value: binarySearch, writable: true, configurable: true })
Object.defineProperty(Array.prototype, 'binaryInsert', { value: binaryInsert, writable: true, configurable: true })
Object.defineProperty(Array.prototype, 'binaryDelete', { value: binaryDelete, writable: true, configurable: true })

export {}
