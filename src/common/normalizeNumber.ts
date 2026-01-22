export interface NormalizeNumberOptions {
  validateRange?: boolean;
  keepOutOfRange?: boolean;
}

/**
 * A universal normalization function with settings.
 * Normalizes a number to 1 or -1 depending on its range,
 * returns the original value if it is outside the range [-1, 1]
 * @param {number} value - numerical value for normalization
 * @param {NormalizeNumberOptions} options - settings
 * @returns 1 for the range [0, 1], -1 for the range [-1, 0], or the original value
 */
export function normalizeNumber(value: any, options: NormalizeNumberOptions = {})
{
  const { validateRange = false, keepOutOfRange = true } = options

  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('The parameter must be a valid number')
  }

  const isInRange = Math.abs(value) <= 1

  // If validation is enabled and the value is out of range, throw an error
  if (validateRange && !isInRange) {
    throw new Error('The value must be in the range [-1, 1]')
  }

  // If the value is in range, normalize it, otherwise return the original (if allowed)
  return isInRange ? Math.sign(value) || 1 : (keepOutOfRange ? value : NaN)
}
