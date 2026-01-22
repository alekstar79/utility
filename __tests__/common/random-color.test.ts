import { randomColor, isValidColor, randomColorPalette } from '../../src/common/randomColor'

describe('randomColor', () => {
  test('should generate valid hex color by default', () => {
    const color = randomColor() as string
    expect(isValidColor(color)).toBe(true)
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  test('should generate array for count > 1', () => {
    const colors = randomColor({ count: 3 }) as string[]
    expect(Array.isArray(colors)).toBe(true)
    expect(colors.length).toBe(3)
    colors.forEach(color => expect(isValidColor(color)).toBe(true))
  })

  test('should support different formats', () => {
    expect(randomColor({ format: 'rgb' })).toMatch(/^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/)
    expect(randomColor({ format: 'rgba' })).toMatch(/^rgba\(\d{1,3}, \d{1,3}, \d{1,3}, [0-1]\.\d{3}\)$/)
    const hexAlpha = randomColor({ format: 'hex-alpha' }) as string
    expect(hexAlpha).toMatch(/^#[0-9A-Fa-f]{8}$/)
  })

  test('should respect luminance constraints', () => {
    const darkColors = randomColor({ luminance: 'dark', count: 10 }) as string[]
    const avgLuminance = darkColors.reduce((sum, color) => {
      const [r, g, b] = [parseInt(color.slice(1,3),16), parseInt(color.slice(3,5),16), parseInt(color.slice(5,7),16)]
      return sum + (0.299*r + 0.587*g + 0.114*b) / 255
    }, 0) / darkColors.length

    expect(avgLuminance).toBeLessThan(0.3)
  })
})

describe('isValidColor', () => {
  test('should validate correct hex colors', () => {
    expect(isValidColor('#FF5733')).toBe(true)
    expect(isValidColor('#ffffff')).toBe(true)
  })

  test('should reject invalid colors', () => {
    expect(isValidColor('#FF573')).toBe(false)  // too short
    expect(isValidColor('#gg5733')).toBe(false) // invalid chars
    expect(isValidColor('rgb(255,0,0)')).toBe(false)
  })
})

describe('randomColorPalette', () => {
  test('should generate palette', () => {
    const palette = randomColorPalette(5)
    expect(Array.isArray(palette)).toBe(true)
    expect(palette.length).toBe(5)
    palette.forEach(color => expect(isValidColor(color)).toBe(true))
  })
})
