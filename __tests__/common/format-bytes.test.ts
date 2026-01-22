import { formatBytes } from '../../src/common/formatBytes'

describe('formatBytes', () => {
  test('форматирует 0 байт', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  test('formats small values (< 1 KiB)', () => {
    expect(formatBytes(42)).toBe('42.00 B')
    expect(formatBytes(999)).toBe('999.00 B')
  })

  test('formats KiB → MiB transitions', () => {
    expect(formatBytes(1024)).toBe('1.00 KiB')
    expect(formatBytes(1024 * 1024)).toBe('1.00 MiB')
  })

  test('formats KB → MB (decimal) transitions', () => {
    expect(formatBytes(1000, 2, false)).toBe('1.00 KB')
    expect(formatBytes(1000 * 1000, 2, false)).toBe('1.00 MB')
  })

  test('applies the decimals parameter', () => {
    expect(formatBytes(1234, 0)).toBe('1 KiB')
    expect(formatBytes(1234, 1)).toBe('1.2 KiB')
    expect(formatBytes(1234, 3)).toBe('1.205 KiB')  // 1234/1024 = 1.205078
  })

  test('supports different locales', () => {
    expect(formatBytes(1234, 1, true, 'de-DE')).toBe('1,2 KiB')
    expect(formatBytes(1234, 1, true, 'ru-RU')).toBe('1,2 KiB')  // KiB is not translated
    expect(formatBytes(1234567, 0, true, 'fr-FR')).toBe('1 MiB')
  })

  test('binary vs decimal difference', () => {
    expect(formatBytes(1048576, 2, true)).toBe('1.00 MiB')
    expect(formatBytes(1000000, 2, false)).toBe('1.00 MB')
  })

  test('formats terabytes and higher', () => {
    expect(formatBytes(1024 ** 4)).toBe('1.00 TiB')   // binary = TiB (1,099,511,627,776)
    expect(formatBytes(1000 ** 4)).toBe('931.32 GiB') // decimal = 1TB → 931.32 GiB
    expect(formatBytes(1024 ** 5)).toBe('1.00 PiB')
  })

  test('does not support negative values', () => {
    expect(formatBytes(-42)).toBe('NaN undefined')
    expect(formatBytes(-1024)).toBe('NaN undefined')
  })

  test('handles very large numbers', () => {
    expect(formatBytes(Number.MAX_SAFE_INTEGER)).toBe('8.00 PiB')
  })

  test('precise transitions between units', () => {
    expect(formatBytes(1023)).toBe('1,023.00 B')
    expect(formatBytes(1024)).toBe('1.00 KiB')
    expect(formatBytes(1024 * 1023)).toBe('1,023.00 KiB')
  })

  test('handles YiB/YB', () => {
    expect(formatBytes(Math.pow(1024, 8))).toBe('1.00 YiB');
    expect(formatBytes(Math.pow(1000, 8), 2, false)).toBe('1.00 YB')
  })

  describe('snapshots', () => {
    test('different combinations of parameters', () => {
      expect(formatBytes(123456)).toMatchInlineSnapshot(`"120.56 KiB"`)
      expect(formatBytes(123456, 0, false)).toMatchInlineSnapshot(`"123 KB"`)
      expect(formatBytes(123456, 1, true, 'de-DE')).toMatchInlineSnapshot(`"120,6 KiB"`)
    })
  })
})
