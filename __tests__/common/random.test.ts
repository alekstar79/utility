import { random } from '../../src/common/random'

describe('random', () => {
  test('should generate random integer in range', () => {
    const result1 = random(1, 10)
    expect(result1).toBeGreaterThanOrEqual(1)
    expect(result1).toBeLessThanOrEqual(10)

    const result2 = random(5, 5)
    expect(result2).toBe(5)
  })

  test('range [0,0] returns 0', () => {
    for (let i = 0; i < 100; i++) {
      expect(random(0, 0)).toBe(0)
    }
  })

  test('range [1,1] returns 1', () => {
    for (let i = 0; i < 100; i++) {
      expect(random(1, 1)).toBe(1)
    }
  })

  test('range [-5,-1] works', () => {
    for (let i = 0; i < 100; i++) {
      const r = random(-5, -1)
      expect(r).toBeGreaterThanOrEqual(-5)
      expect(r).toBeLessThanOrEqual(-1)
    }
  })

  test('throws on invalid inputs', () => {
    expect(() => random(1.5, 10)).toThrow('integers')
    expect(() => random(NaN, 10)).toThrow('integers')
  })

  test('should throw when min > max', () => {
    expect(() => random(10, 1)).toThrow('less than or equal')
  })

  test('should work with large ranges', () => {
    const result = random(1000000, 9999999)
    expect(result).toBeGreaterThanOrEqual(1000000)
    expect(result).toBeLessThanOrEqual(9999999)
  })

  test('should generate different values', () => {
    const results: number[] = []

    for (let i = 0; i < 10; i++) {
      results.push(random(1, 10))
    }

    results.forEach(r => {
      expect(r).toBeGreaterThanOrEqual(1)
      expect(r).toBeLessThanOrEqual(10)
    })
  })
})
