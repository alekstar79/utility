type PromiseResult = Promise<{ value: any; done: boolean; }>

export class AsyncArray<T> extends Array<T>
{
  constructor(...items: T[])
  {
    if (items.length === 1 && typeof items[0] === 'number' && items[0] >= 0) {
      super(items[0] as unknown as T)
    } else {
      super(...items)
    }
  }

  static of<T>(...items: T[]): AsyncArray<T>
  {
    const array = new AsyncArray<T>()

    for (const item of items) {
      array.push(item)
    }

    return array
  }

  [Symbol.asyncIterator]()
  {
    const length = this.length
    let i = 0

    return {
      next: (): PromiseResult => new Promise(resolve => {
        setTimeout(() => {
          const done = i >= length
          const value = done ? undefined : this[i]

          i++

          resolve({ value, done })
        })
      })
    }
  }
}
