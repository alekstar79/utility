import { decimalAdjust, round10, floor10, ceil10 } from '../../src/common/decimalAdjust'

describe('decimalAdjust', () => {
  describe('Basic functionality', () => {
    it('rounds positive numbers to 1 decimal place', () => {
      expect(decimalAdjust('round', 55.55, -1)).toBe(55.6)
      expect(decimalAdjust('round', 55.549, -1)).toBe(55.5)
    })

    it('rounds positive numbers to 2 decimal places', () => {
      expect(decimalAdjust('round', 1.005, -2)).toBe(1.01)
      expect(decimalAdjust('round', 1.0049, -2)).toBe(1.00)
    })

    it('floors positive numbers', () => {
      expect(decimalAdjust('floor', 55.59, -1)).toBe(55.5)
      expect(decimalAdjust('floor', 59, 1)).toBe(50)
    })

    it('ceils positive numbers', () => {
      expect(decimalAdjust('ceil', 55.51, -1)).toBe(55.6)
      expect(decimalAdjust('ceil', 51, 1)).toBe(60)
    })

    it('rounds negative numbers correctly', () => {
      expect(decimalAdjust('round', -55.55, -1)).toBe(-55.5)
      expect(decimalAdjust('round', -55.549, -1)).toBe(-55.5)
    })

    it('floors negative numbers towards negative infinity', () => {
      expect(decimalAdjust('floor', -55.51, -1)).toBe(-55.6)
      expect(decimalAdjust('floor', -51, 1)).toBe(-60)
    })

    it('ceils negative numbers towards positive infinity', () => {
      expect(decimalAdjust('ceil', -55.59, -1)).toBe(-55.5)
      expect(decimalAdjust('ceil', -59, 1)).toBe(-50)
    })

    it('handles whole numbers', () => {
      expect(decimalAdjust('round', 55, 1)).toBe(60)
      expect(decimalAdjust('round', 54.9, 1)).toBe(50)
    })
  })

  describe('Helper functions', () => {
    it('round10 matches decimalAdjust', () => {
      expect(round10(55.55, -1)).toBe(55.6)
      expect(round10(-55.55, -1)).toBe(-55.5)
      expect(round10(1.005, -2)).toBe(1.01)
    })

    it('floor10 matches decimalAdjust', () => {
      expect(floor10(55.59, -1)).toBe(55.5)
      expect(floor10(-55.51, -1)).toBe(-55.6)
      expect(floor10(59, 1)).toBe(50)
    })

    it('ceil10 matches decimalAdjust', () => {
      expect(ceil10(55.51, -1)).toBe(55.6)
      expect(ceil10(-55.59, -1)).toBe(-55.5)
      expect(ceil10(51, 1)).toBe(60)
    })

    it('round10 handles edge cases', () => {
      expect(round10(0, -1)).toBe(0)
      expect(round10(-0, -1)).toBe(0)
      expect(round10('55.55', -1)).toBe(55.6)
    })

    it('floor10 handles edge cases', () => {
      expect(floor10(0.999, -2)).toBe(0.99)
      expect(floor10('59', 1)).toBe(50)
    })

    it('ceil10 handles edge cases', () => {
      expect(ceil10(0.001, -2)).toBe(0.01)
      expect(ceil10('-59', 1)).toBe(-50)
    })
  })

  describe('EXP=0 and undefined', () => {
    it('exp=undefined uses standard Math.*', () => {
      expect(decimalAdjust('round', 55.55)).toBe(56)
      expect(decimalAdjust('floor', 55.55)).toBe(55)
      expect(decimalAdjust('ceil', 55.55)).toBe(56)
    })

    it('exp=0 uses standard Math.*', () => {
      expect(decimalAdjust('round', 55.55, 0)).toBe(56)
      expect(decimalAdjust('floor', 55.55, 0)).toBe(55)
    })

    it('exp=0 works with strings', () => {
      expect(decimalAdjust('round', '55.55', 0)).toBe(56)
      expect(decimalAdjust('floor', '55.55', 0)).toBe(55)
    })

    it('negative numbers with exp=0', () => {
      expect(decimalAdjust('round', -55.55, 0)).toBe(-56)
      expect(decimalAdjust('floor', -55.55, 0)).toBe(-56)
    })
  })

  describe('Invalid inputs', () => {
    it('returns NaN for NaN value', () => {
      expect(decimalAdjust('round', NaN, -1)).toBe(NaN)
      expect(decimalAdjust('floor', NaN, 1)).toBe(NaN)
    })

    it('returns NaN for non-number exp', () => {
      expect(decimalAdjust('round', 55.55, NaN)).toBe(NaN)
      expect(decimalAdjust('round', 55.55, 'abc')).toBe(NaN)
    })

    it('returns NaN for non-integer exp', () => {
      expect(decimalAdjust('round', 55.55, 1.5)).toBe(NaN)
      expect(decimalAdjust('round', 55.55, 0.1)).toBe(NaN)
    })

    it('throws TypeError for invalid type', () => {
      expect(() => decimalAdjust('invalid' as any, 55.55, -1))
        .toThrow("The type of decimal adjustment must be one of 'round', 'floor', or 'ceil'.")
    })
  })

  describe('STRING INPUTS (4 теста)', () => {
    it('parses numeric strings', () => {
      expect(decimalAdjust('round', '55.55', -1)).toBe(55.6)
      expect(decimalAdjust('floor', '-55.51', -1)).toBe(-55.6)
    })

    it('handles scientific notation strings', () => {
      expect(decimalAdjust('round', '5.55e1', -1)).toBe(55.5)
      expect(decimalAdjust('floor', '5.959e1', 1)).toBe(50)
    })

    it('ignores non-numeric strings as NaN', () => {
      expect(decimalAdjust('round', 'abc', -1)).toBe(NaN)
    })
  })

  describe('Zero and small numbers', () => {
    it('handles exact zero', () => {
      expect(decimalAdjust('round', 0, -5)).toBe(0)
      expect(decimalAdjust('round', -0, -5)).toBe(0)
    })

    it('handles very small numbers', () => {
      expect(decimalAdjust('round', 0.000123, -3)).toBe(0.000)
      expect(decimalAdjust('ceil', 0.000123, -3)).toBe(0.001)
    })

    it('handles rounding 0.5 cases', () => {
      expect(decimalAdjust('round', 0.5, 0)).toBe(1)
      expect(decimalAdjust('round', -0.5, 0)).toBe(-0)
    })

    it('precision with small decimals', () => {
      expect(decimalAdjust('round', 0.0001, -3)).toBe(0)
      expect(decimalAdjust('ceil', 0.0001, -3)).toBe(0.001)
    })
  })

  describe('Large exponents', () => {
    it('handles large negative exponents', () => {
      expect(decimalAdjust('round', 123.456, -3)).toBe(123.456)
      expect(decimalAdjust('floor', 999.999, -2)).toBe(999.99)
    })

    it('handles large positive exponents', () => {
      expect(decimalAdjust('round', 123.456, 2)).toBe(100)
      expect(decimalAdjust('ceil', 123.456, 3)).toBe(1000)
    })

    it('boundary cases with large exp', () => {
      expect(decimalAdjust('round', 999.999, -5)).toBe(999.99900)
      expect(decimalAdjust('floor', 0.99999, -4)).toBe(0.9999)
    })
  })

  describe('MDN example verification', () => {
    it('matches MDN round10 examples exactly', () => {
      expect(round10(55.55, -1)).toBe(55.6)
      expect(round10(1.005, -2)).toBe(1.01)
      expect(round10(-55.551, -1)).toBe(-55.6)
    })

    it('matches MDN floor10 examples', () => {
      expect(floor10(55.59, -1)).toBe(55.5)
      expect(floor10(-55.51, -1)).toBe(-55.6)
    })

    it('matches MDN ceil10 examples', () => {
      expect(ceil10(55.51, -1)).toBe(55.6)
      expect(ceil10(-55.59, -1)).toBe(-55.5)
    })
  })
})
