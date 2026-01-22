import { clamp } from '../../src/common/clamp'

describe('clamp', () => {
  describe('basic functionality', () => {
    it('should return value when within bounds', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(3, 1, 7)).toBe(3)
      expect(clamp(0, -5, 5)).toBe(0)
    })

    it('should clamp to min when below bounds', () => {
      expect(clamp(-1, 0, 10)).toBe(0)
      expect(clamp(-10, 5, 20)).toBe(5)
      expect(clamp(-100, -50, 0)).toBe(-50)
    })

    it('should clamp to max when above bounds', () => {
      expect(clamp(15, 0, 10)).toBe(10)
      expect(clamp(25, 5, 20)).toBe(20)
      expect(clamp(100, 0, 50)).toBe(50)
    })

    it('should handle min === max', () => {
      expect(clamp(5, 10, 10)).toBe(10)
      expect(clamp(10, 10, 10)).toBe(10)
      expect(clamp(15, 10, 10)).toBe(10)
    })
  })

  describe('edge cases', () => {
    it('should handle min > max', () => {
      expect(clamp(5, 10, 0)).toBe(0)
      expect(clamp(0, 5, 1)).toBe(1)
      expect(clamp(3, 5, 2)).toBe(2)
    })

    it('should work with large numbers', () => {
      expect(clamp(Number.MAX_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER)
      expect(clamp(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, 0)).toBe(Number.MIN_SAFE_INTEGER)
    })

    it('should handle NaN', () => {
      expect(clamp(NaN, 0, 10)).toBe(NaN)
      expect(clamp(5, NaN, 10)).toBe(NaN)
      expect(clamp(5, 0, NaN)).toBe(NaN)
    })

    it('should handle Infinity', () => {
      expect(clamp(Infinity, 0, 10)).toBe(10)
      expect(clamp(-Infinity, 0, 10)).toBe(0)
      expect(clamp(Infinity, -Infinity, Infinity)).toBe(Infinity)
    })
  })

  describe('common use cases', () => {
    it('should clamp progress (0-1)', () => {
      expect(clamp(-0.1, 0, 1)).toBe(0)
      expect(clamp(0.5, 0, 1)).toBe(0.5)
      expect(clamp(1.2, 0, 1)).toBe(1)
    })

    it('should clamp array index', () => {
      expect(clamp(-1, 0, 5)).toBe(0)
      expect(clamp(3, 0, 5)).toBe(3)
      expect(clamp(7, 0, 5)).toBe(5)
    })

    it('should clamp percentage (0-100)', () => {
      expect(clamp(-10, 0, 100)).toBe(0)
      expect(clamp(50, 0, 100)).toBe(50)
      expect(clamp(120, 0, 100)).toBe(100)
    })
  })

  describe('performance', () => {
    it('should execute without errors on repeated calls', () => {
      const iterations = 1000000

      for (let i = 0; i < iterations; i++) {
        clamp(i % 100, 0, 99)
      }

      expect(true).toBe(true)
    })
  })
})
