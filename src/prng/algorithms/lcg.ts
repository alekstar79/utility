/**
 * LCG: Linear Congruential Generator, period 2³² - 1
 * Quality: Good, Speed: Very Fast
 * Algorithm: Park-Miller variant
 * Use only for simple tests
 */

import { LCG_CONSTANTS } from '../core/constants'
import { initializeBuffer, foldBuffer } from '@/prng/'

/**
 * LCG pseudorandom number generator
 * @name lcgGenerator - PRNG Generator (128-bit state)
 * @param {string | number} seed - String or number to seed the generator
 * @yields {number} - Random number in [0...1]
 */
export function* lcgGenerator(seed: string | number): Generator<number> {
  let state = foldBuffer(initializeBuffer(seed)) || 1

  while (true) {
    state = (Math.imul(state, LCG_CONSTANTS.MULTIPLIER) + LCG_CONSTANTS.INCREMENT!) >>> 0
    yield state / LCG_CONSTANTS.MAX_UINT32
  }
}
