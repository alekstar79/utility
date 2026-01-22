/**
 * Formats a number by inserting a separator between groups of digits (such as a space or a comma)
 *
 * @param {number | string} n - a number or a string representation of a number
 * @param {string} sep - a separator character (default is a space)
 * @returns {string} - a string with separated groups of digits
 *
 * @example
 * gap(1234567) // '1 234 567'
 * gap(1234567.89, ',') // '1,234,567.89'
 * gap('9876543210') // '9 876 543 210'
 */
export function gap(n: number | string, sep: string = ' '): string
{
  let str = n.toString()
  if (Number(str) === 0) {
    return '0'
  }

  const decimalMatch = str.match(/([.,])/)
  const decimalSep = decimalMatch ? decimalMatch[1] : '.'
  const parts = str.split(decimalSep)

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep)

  return parts.length > 1
    ? parts.join(decimalSep)
    : parts[0]
}
