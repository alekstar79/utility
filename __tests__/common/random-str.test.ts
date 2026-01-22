import {
  randomString,
  randomStrings,
  getRandomStringStats,
  presets,
  ALPHABETS
} from '../../src/common/randomStr'

describe('randomString', () => {
  test('should generate default alphanumeric string', () => {
    const str = randomString(10)
    expect(str).toHaveLength(10)
    expect(str).toMatch(/^[A-Za-z0-9]+$/)
  })

  test('should use custom length', () => {
    const str1 = randomString(5)
    const str2 = randomString({ length: 20 })
    expect(str1).toHaveLength(5)
    expect(str2).toHaveLength(20)
  })

  test('should use custom alphabet', () => {
    const str = randomString({ length: 10, alphabet: ALPHABETS.HEX })
    expect(str).toMatch(/^[0-9abcdef]{10}$/)
  })

  test('should respect noRepeat option', () => {
    const str = randomString({ length: 5, alphabet: ALPHABETS.NUM, noRepeat: true })
    expect(str.length).toBe(5)
    expect(str).not.toMatch(/(.)\1/)
  })

  test('should throw on invalid minUnique', () => {
    expect(() => randomString({
      length: 10,
      alphabet: ALPHABETS.NUM,
      minUnique: 11
    })).toThrow('alphabet size')
  })
})

describe('randomStrings', () => {
  test('should generate multiple strings', () => {
    const strings = randomStrings(3, 5)
    expect(strings).toHaveLength(3)
    strings.forEach(str => expect(str).toHaveLength(5))
  })
})

describe('getRandomStringStats', () => {
  test('should calculate correct stats', () => {
    const str = 'aabbcc'
    const stats = getRandomStringStats(str, ALPHABETS.LOWER)
    expect(stats).toEqual({
      length: 6,
      alphabetSize: 26,
      usedUnique: 3,
      hasRepeats: true,
      isSecure: false
    })
  })
})

describe('presets', () => {
  test('should generate preset strings', () => {
    expect(presets.id()).toHaveLength(12)
    expect(presets.code()).toHaveLength(6)
    expect(presets.token()).toHaveLength(32)

    const hex = presets.hex(8)
    expect(hex).toHaveLength(8)
    expect(hex).toMatch(/^[0-9abcdef]{8}$/)
  })

  test('uuid4 should have correct format', () => {
    const uuid = presets.uuid4()
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })
})
