/**
 * Generates a random integer between min and max inclusive.
 * Validates inputs for robustness.
 *
 * @param {number} min - Inclusive lower bound (integer)
 * @param {number} max - Inclusive upper bound (integer)
 * @returns {number} - Random integer in [min, max]
 * @throws RangeError if min > max or non-integers
 */
export function random(min: number, max: number): number
{
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new RangeError('min and max must be integers')
  }
  if (min > max) {
    throw new RangeError('min must be less than or equal to max')
  }

  return Math.floor(Math.random() * (max - min + 1)) + min
}
