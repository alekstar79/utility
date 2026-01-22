export function pick<
  T extends Record<string, any>,
  K extends keyof T
>(
  source: T,
  keys: K[],
  mix: Record<string, any> = {}
): Pick<T, K> & typeof mix {
  return Object.assign(keys.reduce((acc, record) => ({
    ...acc, ...(record in source && { [record]: source[record] })
  }), {} as Pick<T, K>), mix)
}
