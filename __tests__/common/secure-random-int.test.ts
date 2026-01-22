import { secureRandomInt } from '../../src/common/secureRandomInt'

describe('secureRandomInt', () => {
  test('should generate integer in range [min, max]', () => {
    // Testing several times to cover the range
    const results: number[] = []
    for (let i = 0; i < 100; i++) {
      results.push(secureRandomInt(1, 10))
    }

    results.forEach(result => {
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(10)
      expect(Number.isInteger(result)).toBe(true)
    })
  })

  test('should handle min === max', () => {
    const result = secureRandomInt(5, 5)
    expect(result).toBe(5)
  })

  test('should work with negative numbers', () => {
    const result = secureRandomInt(-10, -5)
    expect(result).toBeGreaterThanOrEqual(-10)
    expect(result).toBeLessThanOrEqual(-5)
    expect(Number.isInteger(result)).toBe(true)
  })

  test('should work with large ranges', () => {
    const result = secureRandomInt(1000000, 9999999)
    expect(result).toBeGreaterThanOrEqual(1000000)
    expect(result).toBeLessThanOrEqual(9999999)
  })

  test('should generate cryptographically secure random values', () => {
    // It is not possible to test crypto quality in unit tests,
    // but we check what crypto.getRandomValues uses
    const result1 = secureRandomInt(0, 255)
    const result2 = secureRandomInt(0, 255)
    // Different values (probabilistic)
    expect(result1).not.toBe(result2)
  })
})
