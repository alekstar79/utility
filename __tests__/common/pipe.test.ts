import { pipe, createPipe } from '../../src/common/pipe'

describe('pipe', () => {
  test('should pipe synchronous functions', async () => {
    const addOne = (x: number) => x + 1
    const double = (x: number) => x * 2
    const result = await pipe(5, addOne, double)
    expect(result).toBe(12)  // 5 → 6 → 12
  })

  test('should handle async functions', async () => {
    const delay = (x: number) => Promise.resolve(x + 1)
    const double = (x: number) => x * 2
    const result = await pipe(5, delay, double)
    expect(result).toBe(12)
  })

  test('should work with single function', async () => {
    const addOne = (x: number) => x + 1
    const result = await pipe(5, addOne)
    expect(result).toBe(6)
  })

  test('should chain multiple async/sync functions', async () => {
    const addOne = (x: number) => x + 1
    const asyncDouble = (x: number) => Promise.resolve(x * 2)
    const toString = (x: number) => `result: ${x}`
    const result = await pipe(5, addOne, asyncDouble, toString)
    expect(result).toBe('result: 12')
  })
})

describe('createPipe', () => {
  test('should create pipe factory with sync functions', async () => {
    const addOne = (x: number) => x + 1
    const double = (x: number) => x * 2
    const pipeline = createPipe(addOne, double)
    const result = await pipeline(5)
    expect(result).toBe(12)
  })

  test('should handle async functions in factory', async () => {
    const delay = (x: number) => Promise.resolve(x + 1)
    const double = (x: number) => x * 2
    const pipeline = createPipe(delay, double)
    const result = await pipeline(5)
    expect(result).toBe(12)
  })

  test('should support multiple arguments', async () => {
    const firstFn = (arr: number[]) => arr[0]
    const double = (x: number) => x * 2
    const pipeline = createPipe(firstFn, double)
    const result = await pipeline([5, 10, 15])
    expect(result).toBe(10)
  })
})
