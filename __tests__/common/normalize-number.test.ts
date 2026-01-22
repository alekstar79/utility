import { normalizeNumber } from '../../src/common/normalizeNumber'

describe('normalizeNumber', () => {
  test('should normalize positive numbers to 1', () => {
    expect(normalizeNumber(0.5)).toBe(1)
    expect(normalizeNumber(1)).toBe(1)
    expect(normalizeNumber(0)).toBe(1)
  })

  test('should normalize negative numbers to -1', () => {
    expect(normalizeNumber(-0.5)).toBe(-1)
    expect(normalizeNumber(-1)).toBe(-1)
  })

  test('should keep out-of-range values by default', () => {
    expect(normalizeNumber(2)).toBe(2)
    expect(normalizeNumber(-2)).toBe(-2)
  })

  test('should return NaN when keepOutOfRange=false', () => {
    expect(normalizeNumber(2, { keepOutOfRange: false })).toBeNaN()
    expect(normalizeNumber(-2, { keepOutOfRange: false })).toBeNaN()
  })

  test('should throw on invalid input', () => {
    expect(() => normalizeNumber('abc')).toThrow('valid number')
    expect(() => normalizeNumber(NaN)).toThrow('valid number')
  })

  test('validateRange throws on out-of-range', () => {
    expect(() => normalizeNumber(2, { validateRange: true })).toThrow('[-1, 1]')
    expect(normalizeNumber(0.5, { validateRange: true })).toBe(1)
  })
})
