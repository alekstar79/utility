import { gap } from '../../src/common/gap'

describe('gap - Number Formatting with Separators', () => {
  test('should format positive integers with default space separator', () => {
    expect(gap(1234567)).toBe('1 234 567')
    expect(gap(1234)).toBe('1 234')
    expect(gap(123)).toBe('123')
  })

  test('should format zero correctly', () => {
    expect(gap(0)).toBe('0')
    expect(gap('0')).toBe('0')
    expect(gap(0, ',')).toBe('0')
  })

  test('should format numbers with decimal parts', () => {
    expect(gap(1234567.89)).toBe('1 234 567.89')
    expect(gap(1234.5)).toBe('1 234.5')
    expect(gap('1234567,89')).toBe('1 234 567,89')
  })

  test('should preserve original decimal separator', () => {
    expect(gap('1234,56')).toBe('1 234,56')
    expect(gap('9876543.21')).toBe('9 876 543.21')
    expect(gap('1,234.56')).toBe('1,234.56')
    expect(gap('1234567.89', ',')).toBe('1,234,567.89')
  })

  test('should work with custom separators', () => {
    expect(gap(1234567, ',')).toBe('1,234,567')
    expect(gap(1234567.89, ',')).toBe('1,234,567.89')
    expect(gap('9876543210', '.')).toBe('9.876.543.210')
  })

  test('should handle string inputs correctly', () => {
    expect(gap('1234567')).toBe('1 234 567')
    expect(gap('1234567.89')).toBe('1 234 567.89')
    expect(gap('-1234567')).toBe('-1 234 567')
  })

  test('should handle negative numbers', () => {
    expect(gap(-1234567)).toBe('-1 234 567')
    expect(gap('-1234567.89')).toBe('-1 234 567.89')
    expect(gap('-1234,56')).toBe('-1 234,56')
  })

  test('should handle small numbers without grouping', () => {
    expect(gap(123)).toBe('123')
    expect(gap(12)).toBe('12')
    expect(gap(1)).toBe('1')
    expect(gap('123')).toBe('123')
  })

  test('should handle numbers with leading zeros', () => {
    expect(gap('001234567')).toBe('001 234 567')  // Строка со 0
    expect(gap(1234567)).toBe('1 234 567')       // Обычное число
  })

  test('should handle very large numbers', () => {
    expect(gap('9876543210987654321')).toBe('9 876 543 210 987 654 321')
    expect(gap(1234567890123)).toBe('1 234 567 890 123')
  })

  test('should handle edge cases with decimals only', () => {
    expect(gap(1)).toBe('1')
    expect(gap('0')).toBe('0')
    expect(gap(0.001)).toBe('0.001')
    expect(gap('0.001')).toBe('0.001')
    expect(gap('-0')).toBe('0')
    expect(gap('.123')).toBe('.123')
    expect(gap('0.123')).toBe('0.123')
    expect(gap(',123')).toBe(',123')
  })

  test('should handle unicode separators', () => {
    expect(gap(1234567, ' ')).toBe('1 234 567')
    expect(gap(1234567, ' ')).toBe('1 234 567')
  })

  test('should handle malformed inputs gracefully', () => {
    expect(gap(NaN as any)).toBe('NaN')
    expect(gap(Infinity as any)).toBe('Infinity')
  })

  test('should preserve decimal part formatting', () => {
    expect(gap('1234.5678')).toBe('1 234.5678')
    expect(gap('1234,5678')).toBe('1 234,5678')
    expect(gap('1234.56')).toBe('1 234.56')
  })

  test('should work with different locale decimal separators', () => {
    expect(gap('1.234,56')).toBe('1.234,56')
    expect(gap('1234,56789')).toBe('1 234,56789')
  })

  test('should format numbers with exactly 3 digits', () => {
    expect(gap(123)).toBe('123')
    expect(gap(1234)).toBe('1 234')
  })
})
