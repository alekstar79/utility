/**
 * Universal deep equality checker
 * Compatibility: ES6+ (100% caniuse.com), no deprecated API
 */

export type Primitive = string | number | boolean | null | undefined | symbol | bigint;
export type ComparisonMode = 'strict' | 'loose' | 'shallow';

export interface DeepEqualOptions {
  mode?: ComparisonMode;
  ignoreUndefined?: boolean;
  maxDepth?: number;
  detailed?: boolean;
}

export interface DeepEqualResult {
  equal: boolean;
  differences?: Array<{
    path: string;
    expected: unknown;
    actual: unknown;
  }>;
}

/** Global visited set for cyclic links */
let visitedA: unknown[] = []
let visitedB: unknown[] = []

/** Checking primitives */
const isPrimitiveEqual = (a: Primitive, b: Primitive, mode: ComparisonMode): boolean => {
  if (mode === 'strict') return Object.is(a, b)
  return a == b
}

/** Comparing arrays */
const compareArrays = (
  arrA: unknown[],
  arrB: unknown[],
  options: Required<DeepEqualOptions>,
  path: string
): DeepEqualResult => {
  if (arrA.length !== arrB.length) {
    return { equal: false, differences: [{ path, expected: arrA.length, actual: arrB.length }] }
  }

  for (let i = 0; i < arrA.length; i++) {
    const result = _deepEqual(arrA[i], arrB[i], options, `${path}[${i}]`, 1)
    if (!result.equal) return result
  }

  return { equal: true }
}

/**
 * The main deep comparison function
 * Supports: objects, arrays, Map, Set, Date, primitives, circular references
 */
export function deepEqual<T extends object | Primitive>(
  objA: T,
  objB: T
): boolean;
export function deepEqual<T>(
  objA: T,
  objB: T,
  options: DeepEqualOptions & { detailed: true }
): DeepEqualResult;
export function deepEqual<T>(
  objA: T,
  objB: T,
  options?: DeepEqualOptions
): boolean | DeepEqualResult {
  visitedA = []
  visitedB = []

  const opts: Required<DeepEqualOptions> = {
    ...options,
    mode: options?.mode ?? 'strict',
    ignoreUndefined: options?.ignoreUndefined ?? false,
    maxDepth: options?.maxDepth ?? 20,
    detailed: !!options?.detailed
  }

  const result = _deepEqual(objA, objB, opts, '', 0)
  visitedA = []
  visitedB = []

  return opts.detailed ? result : result.equal
}

/** Recursive implementation */
function _deepEqual(
  a: unknown,
  b: unknown,
  options: Required<DeepEqualOptions>,
  path: string,
  depth: number
): DeepEqualResult {
  if (depth >= options.maxDepth!) {
    return {
      equal: false,
      differences: [{
        path,
        expected: '[MaxDepthExceeded]',
        actual: '[MaxDepthExceeded]'
      }]
    }
  }


  if (Object.is(a, b)) return { equal: true }

  // Primitives
  const isAPrimitive = a === null || b === null || (typeof a !== 'object' && typeof a !== 'function')
  const isBPrimitive = a === null || b === null || (typeof b !== 'object' && typeof b !== 'function')

  if (isAPrimitive || isBPrimitive) {
    const equal = isPrimitiveEqual(a as Primitive, b as Primitive, options.mode)
    return {
      equal,
      differences: equal ? [] : [{ path, expected: a, actual: b }]
    }
  }

  // Cyclic links
  if (visitedA.includes(a) || visitedB.includes(b)) {
    return { equal: true }
  }

  visitedA.push(a)
  visitedB.push(b)

  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    return compareArrays(a as [], b as [], options, path)
  }

  // Map
  if (a instanceof Map && b instanceof Map) {
    if ((a as Map<any, any>).size !== (b as Map<any, any>).size) {
      return { equal: false, differences: [{ path, expected: (a as Map<any, any>).size, actual: (b as Map<any, any>).size }] }
    }

    for (const [key, valueA] of (a as Map<any, any>)) {
      const valueB = (b as Map<any, any>).get(key)
      const result = _deepEqual(valueA, valueB, options, `${path}[${String(key)}]`, depth + 1)
      if (!result.equal) return result
    }

    return { equal: true }
  }

  // Set
  if (a instanceof Set && b instanceof Set) {
    if ((a as Set<any>).size !== (b as Set<any>).size) {
      return { equal: false, differences: [{ path, expected: (a as Set<any>).size, actual: (b as Set<any>).size }] }
    }

    for (const value of (a as Set<any>)) {
      const found = Array.from(b as Set<any>).find(item => Object.is(item, value))
      const result = _deepEqual(value, found, options, `${path}[${String(value)}]`, depth + 1)
      if (!result.equal) return result
    }

    return { equal: true }
  }

  // Date
  if (a instanceof Date && b instanceof Date) {
    const equal = Object.is((a as Date).getTime(), (b as Date).getTime())
    return { equal, differences: equal ? [] : [{ path, expected: a, actual: b }] }
  }

  // Ordinary objects
  const objA = a as Record<string | symbol, any>
  const objB = b as Record<string | symbol, any>

  const keysA = Reflect.ownKeys(objA)
  const keysB = Reflect.ownKeys(objB)

  if (keysA.length !== keysB.length) {
    if (!options.ignoreUndefined) {
      return {
        equal: false,
        differences: [{
          path,
          expected: keysA.length,
          actual: keysB.length
        }]
      }
    }
  }

  for (const key of keysA) {
    const keyStr = key as string | symbol
    const hasKeyB = Reflect.has(objB, keyStr)

    if (!hasKeyB && !options.ignoreUndefined) {
      return {
        equal: false,
        differences: [{
          path: `${path}${typeof key === 'string' ? `.${key}` : `[${String(key)}]`}`,
          expected: objA[keyStr],
          actual: undefined
        }]
      }
    }

    const result = _deepEqual(
      objA[keyStr],
      hasKeyB ? objB[keyStr] : undefined,
      options,
      `${path}${typeof key === 'string' ? `.${key}` : `[${String(key)}]`}`,
      depth + 1
    )

    if (!result.equal) return result
  }

  return { equal: true }
}

/**
 * Quick shallow comparison
 */
export function shallowEqual<T>(objA: T, objB: T): boolean
{
  const keysA = Reflect.ownKeys(objA as object)
  const keysB = Reflect.ownKeys(objB as object)

  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    if (!Object.is((objA as any)[keysA[i]], (objB as any)[keysB[i]])) {
      return false
    }
  }

  return true
}
