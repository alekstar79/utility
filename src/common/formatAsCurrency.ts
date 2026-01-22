/**
 * @param {number} value
 * @param {string} locale
 * @param {string} currencyCode
 * @returns {string}
 */
export function formatAsCurrency(value: number, locale: string, currencyCode: string): string
{
  return Intl.NumberFormat(
    locale,
    {
      style: 'currency',
      currency: currencyCode
    }
  )
    .format(value)
}
