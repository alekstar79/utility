import { formatAsCurrency } from '../../src/common/formatAsCurrency'

describe('formatAsCurrency', () => {
  test('formats USD in the en-US locale', () => {
    expect(formatAsCurrency(1234.56, 'en-US', 'USD')).toBe('$1,234.56')
  })

  test('formats EUR in the en-US locale', () => {
    expect(formatAsCurrency(1234.56, 'en-US', 'EUR')).toBe('€1,234.56')
  })

  test('formats RUB in the ru-RU locale', () => {
    expect(formatAsCurrency(1234.56, 'ru-RU', 'RUB')).toBe('1\xa0234,56\xa0₽')
  })

  test('formats EUR in de-DE locale', () => {
    expect(formatAsCurrency(1234.56, 'de-DE', 'EUR')).toBe('1.234,56\xa0€')
  })

  test('formats JPY in ja-JP locale', () => {
    expect(formatAsCurrency(123456, 'ja-JP', 'JPY')).toBe('￥123,456')
  })

  test('GBP in en-GB locale', () => {
    expect(formatAsCurrency(1234.56, 'en-GB', 'GBP')).toBe('£1,234.56')
  })

  test('CHF in de-CH locale', () => {
    expect(formatAsCurrency(1234.56, 'de-CH', 'CHF')).toBe('CHF\xa01’234.56')
  });

  test('BRL in pt-BR locale', () => {
    expect(formatAsCurrency(1234.56, 'pt-BR', 'BRL')).toBe('R$\xa01.234,56')
  })

  test('processes zero', () => {
    expect(formatAsCurrency(0, 'en-US', 'USD')).toBe('$0.00')
  })

  test('handles negative values', () => {
    expect(formatAsCurrency(-1234.56, 'en-US', 'USD')).toBe('-$1,234.56')
  })

  test('handles very small values', () => {
    expect(formatAsCurrency(0.01, 'en-US', 'USD')).toBe('$0.01')
  })

  test('handles large values', () => {
    expect(formatAsCurrency(1234567.89, 'en-US', 'USD')).toBe('$1,234,567.89')
  })

  test('processes an invalid currency code with a generic symbol ¤', () => {
    expect(formatAsCurrency(1000, 'en-US', 'XXX')).toBe('¤1,000.00')
  })

  test('processes an invalid locale', () => {
    const result = formatAsCurrency(1000, 'invalid-locale', 'USD')
    expect(result).toContain('$')
  })

  // Snapshot тесты
  describe('snapshot tests', () => {
    test('USD snapshot', () => {
      expect(formatAsCurrency(1234.56, 'en-US', 'USD')).toMatchInlineSnapshot(`"$1,234.56"`)
    })

    test('RUB snapshot', () => {
      expect(formatAsCurrency(1234.56, 'ru-RU', 'RUB')).toMatchInlineSnapshot(`"1\xa0234,56\xa0₽"`)
    })

    test('CHF snapshot', () => {
      expect(formatAsCurrency(1234.56, 'de-CH', 'CHF')).toMatchInlineSnapshot(`"CHF\xa01’234.56"`)
    })
  })
})
