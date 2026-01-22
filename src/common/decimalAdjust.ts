/**
 * Adjusts a number to the specified digit.
 * @see [decimal-adjusting](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Math/round)
 * @param {"round" | "floor" | "ceil"} type Type of adjustment.
 * @param {number | string[]} value Number.
 * @param {number} exp Exponent (decimal logarithm of the adjustment base).
 * @returns {number} Adjusted value.
 * @example
 *
 * // Round to nearest
 * Math.round10(55.55, -1) // 55.6
 * Math.round10(55.549, -1) // 55.5
 * Math.round10(55, 1) // 60
 * Math.round10(54.9, 1) // 50
 * Math.round10(-55.55, -1) // -55.5
 * Math.round10(-55.551, -1) // -55.6
 * Math.round10(-55, 1) // -50
 * Math.round10(-55.1, 1) // -60
 * Math.round10(1.005, -2) // 1.01 -- compare this result with the result of Math.round(1.005*100)/100 above
 * // Round down
 * Math.floor10(55.59, -1) // 55.5
 * Math.floor10(59, 1) // 50
 * Math.floor10(-55.51, -1) // -55.6
 * Math.floor10(-51, 1) // -60
 * // Round up
 * Math.ceil10(55.51, -1) // 55.6
 * Math.ceil10(51, 1) // 60
 * Math.ceil10(-55.59, -1) // -55.5
 * Math.ceil10(-59, 1) // -50
 */
export function decimalAdjust(type: 'round' | 'floor' | 'ceil', value: number | string, exp?: any): number
{
  if (!['round', 'floor', 'ceil'].includes(type)) {
    throw new TypeError("The type of decimal adjustment must be one of 'round', 'floor', or 'ceil'.")
  }

  // if the degree is undefined or equal to zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](+value)
  }

  value = +value
  exp = +exp

  // if the value is not a number or the power is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN
  }

  // fraction digit shift [magnitude, exponent]
  let parts = value.toString().split('e')
  value = Math[type](+`${parts[0]}e${parts[1] ? +parts[1] - exp : -exp}`)

  // reverse shift [magnitude, exponent]
  parts = value.toString().split('e')
  value = +`${parts[0]}e${parts[1] ? +parts[1] + exp : exp}`

  return value
}

// Decimal rounding to the nearest
export function round10(value: number | string, exp: number) {
  return decimalAdjust('round', value, exp)
}

// Decimal rounding down
export function floor10(value: number | string, exp: number) {
  return decimalAdjust('floor', value, exp)
}

// Decimal rounding up
export function ceil10(value: number | string, exp: number) {
  return decimalAdjust('ceil', value, exp)
}
