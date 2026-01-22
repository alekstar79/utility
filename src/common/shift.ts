/**
 * Shifts array elements left/right by n positions (immutable).
 * - Positive direction means shift right.
 * - Negative direction means shift left.
 *
 * Features:
 * - Immutable: returns new array, original unchanged
 * - Handles large shifts via modulo optimization
 * - Optimized for performance using slice/concat
 * - Comprehensive input validation
 *
 * @example
 * shift([1, 2, 3, 4, 5], 1, 2)  // [4, 5, 1, 2, 3] - right shift
 * shift([1, 2, 3, 4, 5], -1, 2) // [3, 4, 5, 1, 2] - left shift
 *
 * @param {any[]} arr - Source array (readonly to enforce immutability)
 * @param {number} direction - Shift direction: >0 right, <0 left
 * @param {number} n - Positions to shift (absolute value used)
 * @returns {any[]} - New shifted array
 * @throws TypeError - if arr is not array
 * @throws RangeError - if n is negative or not integer
 */
export function shift<T>(arr: readonly T[], direction: number, n: number): T[]
{
  if (!Array.isArray(arr)) {
    throw new TypeError('Expected array')
  }
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError('n must be non-negative integer')
  }

  const len = arr.length
  if (n === 0 || direction === 0 || len === 0) {
    return [...arr]
  }

  const shift = n % len
  if (shift === 0) {
    return [...arr]
  }

  const start = direction > 0
    ? len - shift
    : shift

  return arr.slice(start).concat(arr.slice(0, start))
}
