export interface MergeContext {
  path?: string;
  parent?: Record<string, any>;
  [key: string]: any;
}

type CustomizerFunction = (
  key: string,
  targetValue: any,
  sourceValue: any,
  context: MergeContext
) => any

/**
 * Deep merging of two objects with customizer support
 * @template T - Type of the resulting object
 * @param target - Target object (base)
 * @param source - Source object (data to merge)
 * @param customizer - Custom processing function
 * @param context - Merge context (used inside recursion)
 * @returns Object of type T with merged data
 * @see [deep-merge](https://labex.io/ru/tutorials/javascript-deep-merge-objects-28266)
 */
export function deepMerge<T extends Record<string, any>>(
  target: T | null | undefined,
  source: Partial<T> | null | undefined,
  customizer?: CustomizerFunction | null,
  context: MergeContext = {}
): T {
  const nullishResult = handleNullishValues(target, source, customizer, context)
  if (nullishResult !== undefined) {
    return nullishResult
  }

  if (areBothArrays(target, source)) {
    return mergeArrays(target, source, customizer, context) as T
  }

  if (hasArrayMismatch(target, source)) {
    return handleArrayMismatch(target, source, customizer, context) as T
  }

  return mergePlainObjects(target as T, source as Partial<T>, customizer, context)
}

/**
 * Handle null or undefined values with customizer support
 */
function handleNullishValues<T>(
  target: T | null | undefined,
  source: Partial<T> | null | undefined,
  customizer?: CustomizerFunction | null,
  context: MergeContext = {}
): T | undefined {
  if (!target || typeof target !== 'object') {
    return processNullishTarget(target, source, customizer, context)
  }

  if (!source || typeof source !== 'object') {
    return processNullishSource(target, source, customizer, context)
  }

  return undefined
}

/**
 * Process when target is nullish
 */
function processNullishTarget<T>(
  target: T | null | undefined,
  source: Partial<T> | null | undefined,
  customizer?: CustomizerFunction | null,
  context: MergeContext = {}
): T | undefined {
  if (customizer) {
    const result = customizer('root', target, source, context)
    if (result !== undefined) {
      return result as T
    }
  }

  return (source as T) || ({} as T)
}

/**
 * Process when source is nullish
 */
function processNullishSource<T>(
  target: T,
  source: Partial<T> | null | undefined,
  customizer?: CustomizerFunction | null,
  context: MergeContext = {}
): T | undefined {
  if (customizer) {
    const result = customizer('root', target, source, context)
    if (result !== undefined) {
      return result as T
    }
  }

  return target
}

/**
 * Check if both values are arrays
 */
function areBothArrays(target: any, source: any): boolean
{
  return Array.isArray(target) && Array.isArray(source)
}

/**
 * Check for array/object type mismatch
 */
function hasArrayMismatch(target: any, source: any): boolean
{
  return Array.isArray(target) || Array.isArray(source)
}

/**
 * Merge two arrays with customizer support
 */
function mergeArrays<T>(
  target: any,
  source: any,
  customizer?: CustomizerFunction | null,
  context: MergeContext = {}
): T {
  if (customizer) {
    const customResult = customizer('array', target, source, context)
    if (customResult !== undefined) {
      return customResult as T
    }
  }

  return [...target, ...source] as unknown as T
}

/**
 * Handle array/object type mismatch
 */
function handleArrayMismatch<T>(
  target: T,
  source: T,
  customizer?: CustomizerFunction | null,
  context: MergeContext = {}
): T {
  if (customizer) {
    const customResult = customizer('array_mismatch', target, source, context)
    if (customResult !== undefined) {
      return customResult as T
    }
  }

  return source
}

/**
 * Merge two plain objects recursively
 */
function mergePlainObjects<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
  customizer?: CustomizerFunction | null,
  context: MergeContext = {}
): T {
  const output: T = { ...target } as T

  for (const key of Object.keys(source)) {
    const targetValue = target[key as keyof T]
    const sourceValue = source[key as keyof T]

    const newContext: MergeContext = {
      ...context,
      path: context.path ? `${context.path}.${key}` : key,
      parent: output
    }

    output[key as keyof T] = mergeProperty(
      key,
      targetValue,
      sourceValue,
      customizer,
      newContext
    )
  }

  return output
}

/**
 * Merge individual property with customizer support
 */
function mergeProperty(
  key: string,
  targetValue: any,
  sourceValue: any,
  customizer?: CustomizerFunction | null,
  context: MergeContext = {}
): any {
  // Apply custom merge logic if provided
  if (customizer) {
    const customResult = customizer(key, targetValue, sourceValue, context)
    if (customResult !== undefined) {
      return customResult
    }
  }

  // Recursive merge for nested objects
  if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
    return deepMerge(
      targetValue,
      sourceValue,
      customizer,
      context
    )
  }

  return sourceValue !== undefined
    ? sourceValue
    : targetValue
}

/**
 * Checks whether a value is a plain object (plain object)
 * Distinguishes objects from arrays, Date, RegExp, and other built-in types
 */
function isPlainObject(value: any): value is Record<string, any>
{
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  )
}
