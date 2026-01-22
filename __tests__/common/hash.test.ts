import { hash } from '../../src/common/hash'

const getHashLength = (algorithm: string): number => {
  switch (algorithm) {
    case 'SHA-1': return 20
    case 'SHA-256': return 32
    case 'SHA-384': return 48
    case 'SHA-512': return 64
    default: return 32
  }
}

const mockDigest = async (algorithm: string, data: Uint8Array) => {
  const length = getHashLength(algorithm)
  const mockHash = new Uint8Array(length)

  const seed = (data.length > 0 ? data[0] : 0) + data.length
  for (let i = 0; i < length; i++) {
    mockHash[i] = (seed + i) % 256
  }

  return mockHash.buffer
}

Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn(mockDigest)
    }
  },
  writable: true
})

describe('hash - Web Crypto API Integration Tests', () => {
  test('should hash empty string', async () => {
    const result = await hash('')
    expect(result).toHaveLength(64)  // SHA-256 = 64 hex chars
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  test('should hash simple string', async () => {
    const result = await hash('hello world')
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  test('should hash russian characters', async () => {
    const result = await hash('Привет, мир!')
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  test('should hash object', async () => {
    const obj = { a: 1, b: 2, c: 'test' }
    const result = await hash(obj)
    expect(result).toHaveLength(64)
  })

  test('should hash complex nested object', async () => {
    const obj = {
      user: { id: 1, name: 'John', active: true },
      tags: ['admin', 'vip'],
      settings: { theme: 'dark', notifications: false }
    }
    const result = await hash(obj)
    expect(result).toHaveLength(64)
  })

  test('should hash array', async () => {
    const arr = [1, 2, 3, { foo: 'bar' }]
    const result = await hash(arr)
    expect(result).toHaveLength(64)
  })

  test('should use SHA-1 algorithm', async () => {
    const result = await hash('test', 'SHA-1')
    expect(result).toHaveLength(40)  // SHA-1 = 40 hex chars
  })

  test('should use SHA-384 algorithm', async () => {
    const result = await hash('test', 'SHA-384')
    expect(result).toHaveLength(96)  // SHA-384 = 96 hex chars
  })

  test('should use SHA-512 algorithm', async () => {
    const result = await hash('test', 'SHA-512')
    expect(result).toHaveLength(128) // SHA-512 = 128 hex chars
  })

  test('should produce same hash for same input', async () => {
    const input = { foo: 'bar', num: 123 }
    const hash1 = await hash(input)
    const hash2 = await hash(input)
    expect(hash1).toBe(hash2)
  })

  test('should produce different hashes for different inputs', async () => {
    const hash1 = await hash('hello')
    const hash2 = await hash('world')
    expect(hash1).not.toBe(hash2)
  })

  test('should hash objects with different order (same JSON)', async () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = { b: 2, a: 1 }
    const hash1 = await hash(obj1)
    const hash2 = await hash(obj2)
    expect(hash1).toBe(hash2)
  })

  test('should handle null values', async () => {
    const result = await hash({ value: null })
    expect(result).toHaveLength(64)
  })

  test('should handle undefined values', async () => {
    const obj = { a: 1, b: undefined, c: 3 }
    const result = await hash(obj)
    expect(result).toHaveLength(64)
  })

  test('should handle special characters', async () => {
    const result = await hash('<>[]{}|\\"\'@#$%^&*()')
    expect(result).toHaveLength(64)
  })

  test('should produce deterministic hashes for same input', async () => {
    const result1 = await hash('123')
    const result2 = await hash('123')
    expect(result1).toBe(result2)
  })

  test('should handle large strings', async () => {
    const longString = 'a'.repeat(10000)
    const result = await hash(longString)
    expect(result).toHaveLength(64)
  })

  test('should handle Date objects', async () => {
    const date = new Date('2025-01-21')
    const result = await hash(date)
    expect(result).toHaveLength(64)
  })

  test('should handle boolean values', async () => {
    const result1 = await hash({ value: true })
    const result2 = await hash({ value: false })
    expect(result1).not.toBe(result2)
    expect(result1).toHaveLength(64)
    expect(result2).toHaveLength(64)
  })

  test('should handle mixed types', async () => {
    const obj = {
      str: 'hello',
      num: 42,
      bool: true,
      arr: [1, 'two'],
      nested: { key: 'value' }
    }
    const result = await hash(obj)
    expect(result).toHaveLength(64)
  })
})
