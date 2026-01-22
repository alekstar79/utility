import { randomInt as fastRandomInt } from './randomInt'
import { secureRandomInt } from './secureRandomInt'

export type Alphabet =
  | typeof ALPHABETS[keyof typeof ALPHABETS]
  | string;

export interface RandomStringOptions {
  length?: number;
  alphabet?: Alphabet;
  noRepeat?: boolean;
  secure?: boolean;
  minUnique?: number;
}

export interface RandomStringStats {
  length: number;
  alphabetSize: number;
  usedUnique: number;
  hasRepeats: boolean;
  isSecure: boolean;
}

interface StringGeneratorContext {
  isSecure: boolean;
  alphabetSize: number;
}

// Preset Alphabets
export const ALPHABETS = {
  UPPER: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' as const,
  LOWER: 'abcdefghijklmnopqrstuvwxyz' as const,
  NUM: '0123456789' as const,
  ALPHANUM: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' as const,
  HEX: '0123456789abcdef' as const,
  READABLE: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' as const,
  URL_SAFE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_' as const,
  BASE64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/' as const
} as const

const validateAlphabet = (alphabet: Alphabet): string => {
  if (alphabet.length === 0) {
    throw new Error('Alphabet must be non-empty string')
  }
  if (alphabet.length > 256) {
    throw new Error('Alphabet length must be <= 256')
  }

  return alphabet
}

const normalizeOptions = (options: number | RandomStringOptions): Required<RandomStringOptions> => {
  const defaults: Required<RandomStringOptions> = {
    length: 10,
    alphabet: ALPHABETS.ALPHANUM,
    noRepeat: false,
    secure: false,
    minUnique: 0
  }

  return typeof options === 'number'
    ? { ...defaults, length: options }
    : { ...defaults, ...options }
}

/** Context-sensitive generator with metadata */
const generateString = (
  length: number,
  alphabet: string,
  options: Required<RandomStringOptions>,
  context: StringGeneratorContext
): { str: string; stats: Omit<RandomStringStats, 'alphabetSize'> } => {
  const { noRepeat, minUnique } = options
  const alphabetSize = alphabet.length
  const randomInt = context.isSecure ? secureRandomInt : fastRandomInt

  const usedIndices = new Set<number>()
  let uniqueCount = 0
  let result = ''

  for (let i = 0; i < length; i++) {
    let index: number

    // Minimum of unique characters
    if (minUnique && uniqueCount < minUnique && i < minUnique) {
      do {
        index = randomInt(0, alphabetSize - 1)
      } while (usedIndices.has(index))
      usedIndices.add(index)
      uniqueCount++
    } else {
      index = randomInt(0, alphabetSize - 1)
    }

    // Avoiding repetition of an adjacent character
    if (noRepeat && i > 0) {
      const lastChar = result[result.length - 1]
      const availableIndices = Array.from({ length: alphabetSize }, (_, j) => j)
        .filter(j => alphabet[j].toLowerCase() !== lastChar?.toLowerCase())

      index = availableIndices[randomInt(0, availableIndices.length - 1)]
    }

    result += alphabet[index]
  }

  const hasRepeats = /(.)\1/.test(result.toLowerCase())

  return {
    str: result,
    stats: { length, usedUnique: uniqueCount, hasRepeats, isSecure: context.isSecure }
  }
}

export const randomString = (options: number | RandomStringOptions): string => {
  const opts = normalizeOptions(options)
  const alphabet = validateAlphabet(opts.alphabet)

  if (opts.length > alphabet.length ** 4) {
    console.warn(`Long strings (${opts.length}) may have collisions with alphabet size ${alphabet.length}`)
  }
  if (opts.minUnique && opts.minUnique > alphabet.length) {
    throw new Error(`minUnique (${opts.minUnique}) cannot exceed alphabet size (${alphabet.length})`)
  }

  const context: StringGeneratorContext = {
    isSecure: opts.secure,
    alphabetSize: alphabet.length
  }

  const { str } = generateString(opts.length, alphabet, opts, context)

  return str
}

export const randomStrings = (count: number, options: number | RandomStringOptions): string[] => {
  return Array.from({ length: count }, () => randomString(options))
}

export const getRandomStringStats = (
  str: string,
  alphabet: Alphabet,
  isSecureUsed?: boolean
): RandomStringStats => {
  const uniqueChars = new Set(str)
  const hasRepeats = /(.)\1/.test(str.toLowerCase())

  return {
    length: str.length,
    alphabetSize: alphabet.length,
    usedUnique: uniqueChars.size,
    isSecure: isSecureUsed ?? false,
    hasRepeats
  }
}

/** Presets */
export const presets = {
  id: () => randomString({ length: 12, alphabet: ALPHABETS.ALPHANUM }),
  token: () => randomString({ length: 32, alphabet: ALPHABETS.URL_SAFE, secure: true }),
  code: () => randomString({ length: 6, alphabet: ALPHABETS.READABLE }),
  hex: (len: number) => randomString({ length: len, alphabet: ALPHABETS.HEX }),
  uuid4: (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = secureRandomInt(0, 15).toString(16)
      return c === 'x' ? r : ((secureRandomInt(0, 3) | 8).toString(16))
    })
  }
} as const
