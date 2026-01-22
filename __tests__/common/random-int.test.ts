import { randomInt, randomIntBatch } from '../../src/common/randomInt'

describe('randomInt', () => {
  test('should generate integer in range [min, max]', () => {
    const result1 = randomInt(1, 10)
    expect(result1).toBeGreaterThanOrEqual(1)
    expect(result1).toBeLessThanOrEqual(10)

    const result2 = randomInt(5, 5)
    expect(result2).toBe(5)
  })

  test('should handle negative numbers', () => {
    const result = randomInt(-5, -1)
    expect(result).toBeGreaterThanOrEqual(-5)
    expect(result).toBeLessThanOrEqual(-1)
  })

  test('should swap min > max automatically', () => {
    const results = new Set()
    for (let i = 0; i < 100; i++) {
      const result = randomInt(5.7, 1.2)
      results.add(result)
      expect(result).toBeGreaterThanOrEqual(1)  // floor(1.2)=1
      expect(result).toBeLessThanOrEqual(6)     // ceil(5.7)=6
    }

    expect(results.size).toBeGreaterThan(1)
  })

  test('should handle decimals correctly', () => {
    const result = randomInt(1.1, 5.9)
    expect(result).toBeGreaterThanOrEqual(2)    // ceil(1.1)=2
    expect(result).toBeLessThanOrEqual(5)       // floor(5.9)=5
  })
})

describe('randomIntBatch', () => {
  test('should generate array of random integers', () => {
    const result = randomIntBatch(1, 10, 5)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(5)
    result.forEach(num => {
      expect(num).toBeGreaterThanOrEqual(1)
      expect(num).toBeLessThanOrEqual(10)
      expect(Number.isInteger(num)).toBe(true)
    })
  })

  test('should return empty array for count <= 0', () => {
    expect(randomIntBatch(1, 10, 0)).toEqual([])
    expect(randomIntBatch(1, 10, -5)).toEqual([])
  })

  test('should work with negative numbers', () => {
    const result = randomIntBatch(-10, -5, 3)
    expect(result.length).toBe(3)
    result.forEach(num => {
      expect(num).toBeGreaterThanOrEqual(-10)
      expect(num).toBeLessThanOrEqual(-5)
    })
  })
})
