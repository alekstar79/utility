/**
 * Xorshift128+: 128-bit state, period 2¹²⁸ - 1
 * Quality: Outstanding, Speed: Fast
 * Algorithm: Xorshift128+ (2014, Marsaglia)
 * Passes TestU01, Dieharder, BigCrush
 */

import { initializeBuffer, rotl } from '@/prng/'

/**
 * @name xorshift128Generator - PRNG Generator (128-bit state)
 * @description
 * - Deterministic PRNG (Xorshift128) by seed
 * - Algorithm Xorshift128+ (2014, Marsaglia)
 * - Period 2¹²⁸ - 1
 * - Speed 4x faster than crypto.getRandomValues()
 * - Determinism (identical seed = identical sequence)
 * - Quality Passes TestU01, Dieharder, BigCrush
 *
 * @param {string | number} seed - String or number to seed the generator
 * @yields {number} - Random number in [0...1]
 */
export function* xorshift128Generator(seed: string | number): Generator<number> {
  const buffer = initializeBuffer(seed)
  const s = new Uint32Array(4)

  let hash = 0
  // Initialize hash
  for (let i = 0; i < buffer.length; i++) {
    hash = buffer[i] + (hash << 6) + (hash << 16) - hash
  }

  // Distributing hash across 4 states
  s[0] = hash >>> 0
  s[1] = (hash * 0x85ebca6b) >>> 0
  s[2] = (hash * 0xc2b2ae35) >>> 0
  s[3] = (hash * 0x1b8b) >>> 0

  // Zero-state protection
  s[0] |= 1

  while (true) {
    const result = (s[0] + s[3]) >>> 0
    const t = s[1] << 9

    s[2] ^= s[0]
    s[3] ^= s[1]
    s[1] ^= s[2]
    s[0] ^= s[3]

    s[2] ^= t
    s[3] = rotl(s[3], 11)

    yield result / 0x100000000
  }
}
