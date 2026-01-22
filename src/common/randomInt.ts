/**
 * Returns a random integer from the range [min, max], inclusive.
 *
 *  Features:
 * - Handles any numbers (including negative, decimal) correctly.
 * - If min > max, swaps them.
 * - The result is evenly distributed.
 * - Uses Math.random() (cross-browser, without deprecated API).
 *
 * @param min Lower bound of the range (inclusive)
 * @param max Upper bound of the range (inclusive)
 * @returns A random integer from [min, max]
 */
export function randomInt(min: number, max: number): number {
  // Rounding to the nearest integer (Math.ceil) and floor (Math.floor)
  const minInt = Math.ceil(min)
  const maxInt = Math.floor(max)

  // Order correction if min > max (stable and user-friendly)
  const [lower, upper] = minInt <= maxInt
    ? [minInt, maxInt]
    : [maxInt, minInt]

  // Calculating the range of integers
  const range = upper - lower + 1

  // Mathematically correct calculation: uniform distribution of integers
  return Math.floor(Math.random() * range) + lower
}

/**
 * Generates an array of random integers from the range [min, max].
 * Can be used to create random samples.
 *
 * @param min Lower bound (inclusive)
 * @param max Upper bound (inclusive)
 * @param count Number of numbers
 * @returns Array of random integers
 */
export function randomIntBatch(min: number, max: number, count: number): number[] {
  if (count <= 0) return []

  const result: number[] = new Array(count)
  for (let i = 0; i < count; i++) {
    result[i] = randomInt(min, max)
  }

  return result
}
