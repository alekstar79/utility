/**
 * @param {Promise[]} array
 * @return {Object}
 * @example
 *
 * ;(async () => {
 *    const a = [1,2,3,4,5].map(item => Promise.resolve(item))
 *
 *    for await (const task of asyncIter(a)) {
 *        console.log(task)
 *    }
 * })()
 */
export function asyncIter<T>(array: Promise<any>[]): AsyncIterable<T>
{
  return {
    async *[Symbol.asyncIterator]()
    {
      while (array.length) {
        yield await array.shift()
      }
    }
  }
}
