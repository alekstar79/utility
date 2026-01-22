import { truncate } from '../../src/common/truncate'

describe('truncate', () => {
  test('should truncate long strings', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
    expect(truncate('123456789', 3)).toBe('123...')
  })

  test('should return original if shorter than max', () => {
    expect(truncate('hi', 5)).toBe('hi')
    expect(truncate('abc', 3)).toBe('abc')
  })

  test('should handle custom end string', () => {
    expect(truncate('hello world', 5, '>>')).toBe('hello>>')
    expect(truncate('short', 10, '***')).toBe('short')
  })

  test('should handle edge cases', () => {
    expect(truncate('', 5)).toBe('')
    expect(truncate('a', 0)).toBe('a...')
    expect(truncate('', 0)).toBe('')
  })

  test('should protect max <= 3', () => {
    expect(truncate('123456', 1)).toBe('123...')
    expect(truncate('abcdef', 2)).toBe('abc...')
    expect(truncate('long text', 0)).toBe('lon...')
  })
})
