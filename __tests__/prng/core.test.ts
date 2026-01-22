import { initializeBuffer, foldBuffer, rotl } from '../../src/prng'

describe('Core Utils', () => {
  describe('initializeBuffer', () => {
    it('string → Uint8Array', () => {
      const buffer = initializeBuffer('hello')
      expect(buffer).toBeInstanceOf(Uint8Array)
      expect(buffer[0]).toBe('h'.charCodeAt(0)) // 104
    });

    it('number → 4 bytes', () => {
      const buffer = initializeBuffer(0x12345678)
      expect(buffer).toEqual(new Uint8Array([0x78, 0x56, 0x34, 0x12]))
    })
  })

  describe('foldBuffer', () => {
    it('XOR folds buffer', () => {
      const buffer = new Uint8Array([1, 2, 3, 4])
      expect(foldBuffer(buffer)).toBe(4) // 1^2^3^4 = 4
    })

    it('empty buffer → 0', () => {
      expect(foldBuffer(new Uint8Array())).toBe(0)
    })
  })

  describe('rotl', () => {
    it('rotate left 32-bit', () => {
      expect(rotl(1, 1)).toBe(2)
      expect(rotl(0x80000000, 1)).toBe(1)
    })
  })
})
