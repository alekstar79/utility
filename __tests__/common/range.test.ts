import { range, ranges, rangeStats, rangeSum } from '../../src/common/range'

describe('range', () => {
  test('simple default sequences', () => {
    expect(range(5)).toEqual([0, 1, 2, 3, 4])
    expect(range(5, 1, 2)).toEqual([1, 3])
  })

  test('inclusive and negative step', () => {
    expect(range(3, { stop: 3, start: 1, step: 1, inclusive: true })).toEqual([1, 2, 3])
    expect(range(0, { stop: 0, start: 3, step: -1, inclusive: true })).toEqual([3, 2, 1, 0])
  })

  test('lazy generator', () => {
    const gen = range(3, { stop: 3, start: 1, step: 1, lazy: true })
    expect(Array.from(gen)).toEqual([1, 2])
  })

  test('options object in the second and third arguments', () => {
    expect(range(4, { stop: 4, start: 2, step: 1 })).toEqual([2, 3])
    expect(range(4, 2, { stop: 4, step: 1, inclusive: true })).toEqual([2, 3, 4])
  })

  test('validation: step=0, NaN, and too long length', () => {
    expect(() => range(1, 0, 0)).toThrow('Step cannot be zero')
    expect(() => range(NaN)).toThrow('Range parameters must be finite numbers')
    expect(() => range(1_000_002)).toThrow('Range too large')
  })
})

describe('ranges helpers', () => {
  test('from0 и progress', () => {
    expect(ranges.from0(3)).toEqual([0, 1, 2])
    expect(ranges.progress(4)).toEqual([0, 0.25, 0.5, 0.75, 1])
  })

  test('infinite and ofLength', () => {
    const inf = ranges.infinite(5, 2)
    const values = []
    for (const n of inf) {
      values.push(n)
      if (values.length >= 3) break
    }

    expect(values).toEqual([5, 7, 9])
    expect(ranges.ofLength(3, 10, 2)).toEqual([10, 12, 14])
  })
})

describe('rangeStats and rangeSum', () => {
  test('generator statistics', () => {
    function* finite() { yield 0; yield 1 }
    const finiteStats = rangeStats(finite())
    expect(finiteStats).toEqual({ length: Infinity, isInfinite: true, stepDirection: 'forward' })

    const infiniteStats = rangeStats(ranges.infinite())
    expect(infiniteStats.isInfinite).toBe(true)
    expect(infiniteStats.length).toBe(Infinity)
    expect(infiniteStats.stepDirection).toBe('forward')
  })

  test('statistics for a generator with 1 element', () => {
    function* single() { yield 5 }
    expect(rangeStats(single())).toEqual({ length: 1, isInfinite: false, stepDirection: 'zero' })
  })

  test('rangeSum summarizes the values', () => {
    const arr = range(5) as number[]
    expect(rangeSum(arr)).toBe(10)
  })
})

