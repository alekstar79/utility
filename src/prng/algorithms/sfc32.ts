/**
 * SFC32: Simple Fast Chaotic, period ~2²⁵⁶
 * Quality: Excellent, Speed: Very Fast
 * Author: Chris Doty-Humphrey
 * Passes TestU01
 */

import { initializeBuffer } from '@/prng/'

/**
 * SFC32 pseudorandom number generator
 * @name sfc32Generator - PRNG Generator (128-bit state)
 * @param {string | number} seed - String or number to seed the generator
 * @yields {number} - Random number in [0...1]
 */
export function* sfc32Generator(seed: string | number): Generator<number> {
  const buffer = initializeBuffer(seed)
  let a = 0xdeadbeef, b = 0xcafebabe, c = 0x1337beef, counter = 1

  // Initialize from buffer
  for (let i = 0; i < buffer.length; i++) {
    a ^= buffer[i]
    b += buffer[i]
  }

  // Warm-up (12 iterations)
  for (let i = 0; i < 12; i++) {
    const t = (a + b + counter++) >>> 0

    a = b ^ (b >>> 9)
    b = c + (c << 3)
    c = (c << 21) | (c >>> 11)
    c += t
  }

  while (true) {
    const t = (a + b + counter++) >>> 0

    a = b ^ (b >>> 9)
    b = c + (c << 3)
    c = (c << 21) | (c >>> 11)
    c += t

    yield (t >>> 0) / 0x100000000
  }
}
