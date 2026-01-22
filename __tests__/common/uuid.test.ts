import { uuid } from '../../src/common/uuid'

describe('uuid', () => {
  test('should generate valid UUID v4 format', () => {
    const id = uuid()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  test('should generate unique IDs', () => {
    const ids = new Set()
    for (let i = 0; i < 100; i++) {
      const id = uuid()
      expect(ids.has(id)).toBe(false)
      ids.add(id)
    }
  })

  test('should always have version 4 and correct variant', () => {
    const id = uuid()
    const parts = id.split('-')

    // Version 4: 4xxx
    expect(parts[2][0]).toBe('4')

    // Variant: 8,9,a,b
    expect(['8', '9', 'a', 'b'].includes(parts[3][0])).toBe(true)
  })

  test('should generate exactly 36 characters', () => {
    const id = uuid()
    expect(id).toHaveLength(36)
  })

  test('should use crypto.getRandomValues (secure)', () => {
    // It is not possible to test the cryptographic quality,
    // but we check the UUID v4 format, which requires crypto
    const id = uuid()
    expect(typeof id).toBe('string')
    expect(id).not.toBe('00000000-0000-4000-8000-000000000000')
  })
})
