export function each<T extends any = any>(
  array: T[],
  fn: (value: T, index: number, array: T[]) => unknown,
  ms = 0
) {
  let tid: number, last = array.length - 1, i: number = 0

  const next = () => {
    if (i <= last) {
      fn(array[i], i, array)
      tid = window.setTimeout(next, ms)
      i++
    }
  }

  next()

  return () => {
    clearTimeout(tid)
  }
}
