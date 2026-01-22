export class ExtendedMap<K, V> extends Map<K, V>
{
  private getAdjacentIndex(direction: 'prev' | 'next', key: K, keys: K[]): number | undefined
  {
    const index = keys.indexOf(key)

    if (index === -1) return undefined

    return direction === 'prev'
      ? (index - 1 + keys.length) % keys.length
      : (index + 1) % keys.length
  }

  prev(key: K): V | undefined
  {
    const keys = Array.from(this.keys())
    const prevIndex = this.getAdjacentIndex('prev', key, keys)

    return typeof prevIndex !== 'undefined'
      ? this.get(keys[prevIndex])
      : undefined
  }

  next(key: K): V | undefined
  {
    const keys = Array.from(this.keys())
    const nextIndex = this.getAdjacentIndex('next', key, keys)

    return typeof nextIndex !== 'undefined'
      ? this.get(keys[nextIndex])
      : undefined
  }

  prevEntries(key: K): [K, V] | undefined
  {
    const keys = Array.from(this.keys())
    const prevIndex = this.getAdjacentIndex('prev', key, keys)
    if (typeof prevIndex === 'undefined') {
      return undefined
    }

    const prevKey = keys[prevIndex]
    const prevValue = this.get(prevKey)!

    return [prevKey, prevValue]
  }

  nextEntries(key: K): [K, V] | undefined
  {
    const keys = Array.from(this.keys())
    const nextIndex = this.getAdjacentIndex('next', key, keys)
    if (typeof nextIndex === 'undefined') {
      return undefined
    }

    const nextKey = keys[nextIndex]
    const nextValue = this.get(nextKey)!

    return [nextKey, nextValue]
  }
}

/**
 * @param {Record<PropertyKey, *>} obj - object value
 * @returns {ExtendedMap<PropertyKey, *>}
 */
export function extendedMap<K extends PropertyKey, V>(
  obj: Record<K, V>
): ExtendedMap<K, V> {
  return new ExtendedMap(Object.entries(obj) as [K, V][])
}

/**
 * @param {Record<PropertyKey, *>} obj - object value
 * @returns {Map<PropertyKey, *>}
 */
export function mapFromObject<K extends PropertyKey, V>(
  obj: Record<K, V>
): Map<K, V> {
  return new Map(Object.entries(obj) as [K, V][])
}
