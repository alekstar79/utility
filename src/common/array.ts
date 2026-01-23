export class ExtendedArray<T> extends Array<T>
{
  constructor(...items: T[])
  {
    super(...items)
    Object.setPrototypeOf(this, ExtendedArray.prototype)
  }

  getAdjacentIndex(direction: 'prev' | 'next', value: T): number | undefined
  {
    if (this.length === 0) return undefined

    const index = this.indexOf(value)
    if (index === -1) {
      return undefined
    }

    return direction === 'prev'
      ? (index - 1 + this.length) % this.length
      : (index + 1) % this.length
  }

  prev(current: T): T | undefined
  {
    const prevIndex = this.getAdjacentIndex('prev', current)

    return typeof prevIndex !== 'undefined'
      ? this[prevIndex]
      : undefined
  }

  next(current: T): T | undefined
  {
    const nextIndex = this.getAdjacentIndex('next', current)

    return typeof nextIndex !== 'undefined'
      ? this[nextIndex]
      : undefined
  }
}

/**
 * @param {Iterable} iterable - Array Like value
 * @returns {ExtendedArray}
 */
export function extendedArray<T>(iterable: Iterable<T>): ExtendedArray<T>
{
  const array = new ExtendedArray<T>()

  for (const item of iterable) {
    array.push(item)
  }

  return array
}
