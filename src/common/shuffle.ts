import { mulberry32Generator } from '@/prng'

/**
 * Shuffle options
 */
export interface ShuffleOptions {
  /** Cryptographic Strength */
  secure?: boolean;
  /** Copy instead of mutating the original */
  copy?: boolean;
  /** Number of mixes (1 = Fisher-Yates) */
  rounds?: number;
}

interface NormalizedShuffleOptions {
  secure: boolean;
  copy: boolean;
  rounds: number;
}

/**
 * Shuffle statistics
 */
export interface ShuffleStats {
  algorithm: 'fisher-yates';
  isSecure: boolean;
  rounds: number;
  originalOrder: boolean;
  cycles: number;
}

/**
 * Fisher-Yates (in-place)
 */
const fisherYatesInPlace = <T>(array: T[], secure: boolean): void => {
  let m = array.length

  if (secure) {
    const rng = new Uint8Array(m)

    while (m) {
      crypto.getRandomValues(rng.subarray(0, m))
      const i = rng[m - 1] % m
      m -= 1

      const temp = array[m]
      array[m] = array[i]
      array[i] = temp
    }
  } else {
    while (m) {
      const i = Math.floor(Math.random() * m--);
      [array[m], array[i]] = [array[i], array[m]]
    }
  }
}

const normalizeShuffleOptions = (
  options: boolean | ShuffleOptions | undefined
): NormalizedShuffleOptions => {
  const isBoolean = typeof options === 'boolean'
  const opts = options as ShuffleOptions | undefined
  const isObject = opts && typeof opts === 'object'

  return {
    secure: Boolean(isObject ? opts!.secure : false),
    copy: isBoolean ? options : Boolean(isObject ? opts!.copy : false),
    rounds: Math.max(1, (isObject ? opts!.rounds : 1) ?? 1)
  }
}

/**
 * Universal shuffle API
 */
export function shuffle<T>(
  array: T[],
  options: boolean | ShuffleOptions = false
): T[] {
  if (!Array.isArray(array) || array.length <= 1) {
    return options === true ? [...array] : array
  }

  const opts = normalizeShuffleOptions(options)
  const target = opts.copy ? [...array] : array

  // Multiple rounds (for extra randomness)
  for (let r = 0; r < opts.rounds; r++) {
    fisherYatesInPlace(target, opts.secure);
  }

  return target;
}

/**
 * Batch shuffle (array of arrays)
 */
export const shuffleAll = <T>(
  arrays: T[][],
  options: boolean | ShuffleOptions = false
): T[][] => arrays.map(arr => shuffle(arr, options))

/**
 * Lazy shuffle generator
 */
export function* shuffleGenerator<T>(array: T[], secure = false): Generator<T> {
  const shuffled = shuffle(array, { copy: true, secure })
  yield* shuffled
}

/**
 * Shuffle statistics
 */
export const shuffleStats = <T>(
  shuffled: T[],
  original: T[],
  options: ShuffleOptions
): ShuffleStats => {
  const isSameOrder = shuffled.every((item, i) => item === original[i])

  // Counting permutation cycles
  const cycles = new Set<number>()

  for (let i = 0; i < shuffled.length; i++) {
    const visited = new Set()
    let pos = i

    while (!visited.has(pos)) {
      visited.add(pos)

      const targetIndex = original.indexOf(shuffled[pos] as unknown as T)
      if (targetIndex === -1) break

      pos = targetIndex
    }

    cycles.add(i)
  }

  return {
    algorithm: 'fisher-yates',
    isSecure: !!options.secure,
    rounds: options.rounds ?? 1,
    originalOrder: isSameOrder,
    cycles: cycles.size
  }
}

/**
 * Presets functions
 */
export const presets = {
  /** Cards/Dice (safe) */
  cards: <T>(deck: T[]) => shuffle(deck, { secure: true }),
  /** UI elements (fast) */
  ui: <T>(elements: T[]) => shuffle(elements, false),
  /** Crypto tokens */
  secure: <T>(data: T[]) => shuffle(data, { secure: true, rounds: 2 }),
  /** Training set */
  train: <T>(dataset: T[]) => shuffle(dataset, { copy: true, secure: true })
} as const

/**
 * Reproducible shuffle generatot by seed
 */
export function* seededShuffle<T>(array: readonly T[], seed: string | number): Generator<T[]>
{
  const rng = mulberry32Generator(seed)
  const original = [...array]

  while (true) {
    const shuffled = [...original]
    let m = original.length

    while (m) {
      const i = (rng.next().value * m--) | 0;
      [shuffled[m], shuffled[i]] = [shuffled[i], shuffled[m]]
    }

    yield shuffled
  }
}
