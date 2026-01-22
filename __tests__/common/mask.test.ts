import {
  mask,
  createMask,
  maskGroups,
  isMasked,
  PRESET_MASKS
} from '../../src/common/mask'

describe('String Masking Functions', () => {
  test('should mask string with default settings', () => {
    expect(mask('1234567890')).toBe('******7890')
    expect(mask(1234567890)).toBe('******7890')
  })

  test('should apply preset masks', () => {
    expect(mask('1234567890', 'phone')).toBe('******7890')
    expect(mask('user@example.com', 'email')).toHaveLength(16)
    expect(mask('1234567890123456', 'card')).toHaveLength(16)
    expect(mask('123-45-6789', 'ssn')).toContain('6789')
  })

  test('should mask by position', () => {
    expect(mask('1234567890', { position: 'start', count: 4 })).toBe('1234******')
    expect(mask('1234567890', { position: 'end', count: 4 })).toBe('******7890')
    expect(mask('1234567890', { position: 'middle', count: 4 })).toMatch(/12\**\d{2}/)
    expect(mask('1234567890', { position: 'full' })).toBe('**********')
  })

  test('should handle custom mask character', () => {
    expect(mask('1234567890', { mask: '#', count: 4 })).toBe('######7890')
    expect(mask('hello world', { mask: '-', count: 3, position: 'start' })).toBe('hel--------')
  })

  test('should mask spaces option', () => {
    const result1 = mask('123 456 7890', { maskSpaces: true })
    expect(result1).toHaveLength(12)
    expect(result1.endsWith('7890')).toBe(true)
    expect(mask('123 456 7890', { maskSpaces: false })).toContain('7890')
  })

  test('createMask factory works', () => {
    const phoneMask = createMask('phone')
    const cardMask = createMask({ count: 4, position: 'end' })
    expect(phoneMask('1234567890')).toBe('******7890')
    expect(cardMask('1234567890123456')).toMatch(/(.{8})\**\d{4}/)
  })

  test('maskGroups works', () => {
    expect(maskGroups('1234567890123456')).toContain('9012 3456')
    expect(maskGroups('12345678', 3, '-')).toContain('**3')
  })

  test('isMasked validation works', () => {
    expect(isMasked('******7890')).toBe(true)
    expect(isMasked('user@example.com')).toBe(false)
    expect(isMasked('##abc##')).toBe(true)
    expect(isMasked('abc')).toBe(false)
  })

  test('should validate options', () => {
    expect(() => mask('123', { count: -1 })).toThrow('count must be >= 0')
    expect(() => mask('123', { mask: '' })).toThrow('mask character cannot be empty')
  })

  test('should handle edge cases', () => {
    expect(mask('')).toBe('')
    expect(mask('', { count: 4 })).toBe('')
    expect(mask('abc', { count: 10 })).toBe('abc')
    // @ts-ignore
    expect(mask(null)).toBe('')
    // @ts-ignore
    expect(mask(undefined)).toBe('')
  })

  test('should handle long strings', () => {
    const long = '12345678901234567890'
    expect(mask(long, { count: 4 })).toMatch(/\**\d{4}$/)
  })

  test('preset masks match configuration', () => {
    expect(PRESET_MASKS.phone).toEqual({
      mask: '*',
      count: 4,
      position: 'end',
      maskSpaces: true
    })
    expect(PRESET_MASKS.card).toHaveProperty('separator', ' **** ')
  })

  test('should work with separator grouping', () => {
    expect(mask('1234567890123456', {
      count: 4,
      position: 'end',
      separator: ' **** '
    })).toContain(' **** ')
  })

  test('different count values', () => {
    expect(mask('1234567890', { count: 0 })).toBe('1234567890')
    expect(mask('1234567890', { count: 2 })).toBe('********90')
    expect(mask('1234567890', { count: 6 })).toBe('****567890')
  })
})
