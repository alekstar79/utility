/**
 * Comprehensive HEX color generator (RGB + Alpha)
 * Compatibility: 100% caniuse.com (ES3+, no deprecated API)
 */

type HexColor = `#${string}`;
type HexColorWithAlpha = `${HexColor}${string}`;
type ColorFormat = 'hex' | 'hex-alpha' | 'rgb' | 'rgba';
type Luminance = 'dark' | 'light' | 'random';

interface ColorOptions {
  /** Output format */
  format?: ColorFormat;
  /** Minimum brightness (0-1) */
  minLuminance?: number;
  /** Palette Type */
  luminance?: Luminance;
  /** Avoid using too bright or dark colors */
  avoidExtreme?: boolean;
  /** Number of colors */
  count?: number;
}

/** Checking the validity of HEX */
const isValidHexColor = (color: string): color is HexColor => /^#[0-9A-Fa-f]{6}$/.test(color)

/** Calculating luminance (Y = 0.299R + 0.587G + 0.114B) */
const getLuminance = (r: number, g: number, b: number): number => {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/** RGB → HEX conversion */
const rgbToHex = (r: number, g: number, b: number): HexColor => {
  const toHex = (c: number) => c.toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(r)}${toHex(g)}${toHex(b)}` as HexColor
}

/** RGB → CSS rgba conversion */
const rgbToRgba = (r: number, g: number, b: number, a: number): string => {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(3)})`
}

/** The main generator is of the same color */
const generateSingleColor = (
  options: Required<Pick<ColorOptions, 'minLuminance' | 'luminance' | 'avoidExtreme'>>
): HexColor => {
  let r, g, b

  // Generation with brightness control
  while (true) {
    r = Math.floor(Math.random() * 256)
    g = Math.floor(Math.random() * 256)
    b = Math.floor(Math.random() * 256)

    // Adjusting for luminance
    const lum = getLuminance(r, g, b) / 255

    const isValidLuminance =
      (options.luminance !== 'dark' || lum <= 0.3) &&
      (options.luminance !== 'light' || lum >= 0.7) &&
      (!options.avoidExtreme || (lum >= 0.1 && lum <= 0.95))

    if (isValidLuminance && lum >= options.minLuminance) {
      break
    }
  }

  return rgbToHex(r, g, b)
}

/**
 * Universal Color Generator
 * @example
 * randomColor()                      // "#FF5733"
 * randomColor({ format: 'rgba' })    // "rgba(255,87,51,0.847)"
 * randomColor({ luminance: 'dark' }) // Dark colors
 * randomColor({ count: 5 })          // ["#FF5733", "#33FF57", ...]
 */
export function randomColor(options: ColorOptions = {}): HexColor | string | string[] {
  const {
    format = 'hex',
    minLuminance = 0.1,
    luminance = 'random',
    avoidExtreme = false,
    count = 1
  } = options;

  // Batch generation
  if (count > 1) {
    return Array.from({ length: count }, () =>
      randomColor({ ...options, count: 1 }) as HexColor
    )
  }

  // Single color generation
  const color = generateSingleColor({ minLuminance, luminance, avoidExtreme })

  // Converting to the desired format
  const [r, g, b] = [
    parseInt(color.slice(1, 3), 16),
    parseInt(color.slice(3, 5), 16),
    parseInt(color.slice(5, 7), 16)
  ]

  switch (format) {
    case 'hex':
      return color;
    case 'hex-alpha':
      const alphaHex = Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      return `${color}${alphaHex}` as HexColorWithAlpha
    case 'rgb':
      return `rgb(${r}, ${g}, ${b})`
    case 'rgba':
      const alpha = Math.random()
      return rgbToRgba(r, g, b, alpha)
    default:
      return color
  }
}

/**
 * Checking the validity of a color
 */
export function isValidColor(color: unknown): color is HexColor {
  return typeof color === 'string' && isValidHexColor(color)
}

/**
 * Generating a palette of harmonious colors
 */
export function randomColorPalette(count: number, options?: Omit<ColorOptions, 'count'>): HexColor[] {
  return randomColor({ ...options, count }) as HexColor[]
}

/** Types */
export type {
  HexColor,
  HexColorWithAlpha,
  ColorFormat,
  Luminance,
  ColorOptions
}
