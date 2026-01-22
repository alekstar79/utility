/**
 * Initializing Uint8Array from seed
 */
export const initializeBuffer = (seed: string | number): Uint8Array => {
  if (typeof seed === 'string') {
    return new Uint8Array(new TextEncoder().encode(seed))
  }

  return new Uint8Array([
    seed & 0xFF,
    (seed >> 8) & 0xFF,
    (seed >> 16) & 0xFF,
    (seed >> 24) & 0xFF
  ])
}

/**
 * XOR folding buffers → number
 */
export const foldBuffer = (buffer: Uint8Array): number => {
  let state = 0

  for (let i = 0; i < buffer.length; i++) {
    state ^= buffer[i]
  }

  return state >>> 0
}

/**
 * Rotate left (used in Xorshift, JSF32)
 */
export const rotl = (x: number, k: number): number =>
  ((x << k) | (x >>> (32 - k))) >>> 0
