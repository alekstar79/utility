/**
 * JSF32: Bob Jenkins Small Fast, period ~2¹²⁷
 * Quality: Excellent, Speed: Fast
 * Author: Bob Jenkins
 * Passes: TestU01, Dieharder
 */

import { rotl, initializeBuffer } from '@/prng/'
import { JSF32_SEED } from '../core/constants'

/**
 * JSF32 pseudorandom number generator
 * @name jsf32Generator - PRNG Generator (128-bit state)
 * @param {number | string} seed - String or number to seed the generator
 * @yields {number} - Random number in [0...1]
 */
export function* jsf32Generator(seed: string | number): Generator<number> {
  const buffer = initializeBuffer(seed)
  let a = JSF32_SEED, b = 0, c = 0, d = 0

  // Инициализация из буфера
  for (let i = 0; i < buffer.length; i++) {
    b ^= buffer[i]
  }

  // Warm-up (20 итераций)
  for (let i = 0; i < 20; i++) {
    const e = (a - rotl(b, 27)) >>> 0

    a = b ^ rotl(c, 17)
    b = (c + d) >>> 0
    c = (d + e) >>> 0
    d = (e + a) >>> 0
  }

  while (true) {
    const e = (a - rotl(b, 27)) >>> 0

    a = b ^ rotl(c, 17)
    b = (c + d) >>> 0
    c = (d + e) >>> 0
    d = (e + a) >>> 0

    yield (d >>> 0) / 0x100000000
  }
}
