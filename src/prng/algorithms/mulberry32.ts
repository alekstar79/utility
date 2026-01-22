/**
 * Mulberry32: 32-bit state, period 2³² - 1
 * Quality: Good, Speed: Very Fast
 * Passes TestU01
 */

import { MULBERRY32 } from '../core/constants'
import { initializeBuffer, foldBuffer } from '@/prng/'

/**
 * @name mulberry32Generator - PRNG Generator (32-bit state)
 * @description Deterministic pseudorandom number generator
 *  using the Mulberry32 algorithm for reproducible random-like values.
 * @param {string | number} seed - String or number to seed the generator
 * @yields {number} - Random number in [0...1]
 */
export function* mulberry32Generator(seed: string | number): Generator<number> {
  let state = foldBuffer(initializeBuffer(seed))

  // Zero-state protection
  state |= 1

  while (true) {
    state ^= state >>> 15
    state = Math.imul(state, MULBERRY32.MULTIPLIER)
    state ^= state >>> 15
    yield (state >>> 0) / MULBERRY32.MAX_UINT32
  }
}
