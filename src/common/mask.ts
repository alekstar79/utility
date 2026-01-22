/**
 * String masking
 * Compatibility: ES3+ (100% caniuse.com), no deprecated API
 * Architecture: Factory + Variants + Presets
 */

type MaskCharacter = string;
type MaskPosition = 'start' | 'end' | 'middle' | 'full';
type MaskPreset = 'phone' | 'email' | 'card' | 'ssn';

interface MaskOptions {
  /** The masking symbol */
  mask: MaskCharacter;
  /** Number of characters to display */
  count: number;
  /** Position of visible characters */
  position?: MaskPosition;
  /** Mask spaces */
  maskSpaces?: boolean;
  /** Group Separator */
  separator?: string;
}

/** Preset masks */
const PRESET_MASKS: Record<MaskPreset, MaskOptions> = {
  phone: { mask: '*', count: 4, position: 'end' as const, maskSpaces: true },
  email: { mask: '*', count: 2, position: 'start' as const, maskSpaces: false },
  card: { mask: '*', count: 4, position: 'end' as const, separator: ' **** ' },
  ssn: { mask: '*', count: 4, position: 'end' as const }
}

/** Safe conversion to a string */
const toStringSafe = (value: unknown): string => String(value || '')

/** Checking the validity of options */
const validateMaskOptions = (opts: Required<MaskOptions>): void => {
  if (opts.count < 0) throw new Error('count must be >= 0')
  if (opts.mask.length === 0) throw new Error('mask character cannot be empty')
}

/** Applying a mask to a string */
const applyMask = (
  str: string,
  maskChar: MaskCharacter,
  count: number,
  position: MaskPosition = 'end',
  maskSpaces: boolean = true
): string => {
  if (count >= str.length) return str.padStart(str.length, maskChar)

  let masked: string

  switch (position) {
    case 'start':
      masked = str.slice(0, count).padEnd(str.length, maskChar)
      break
    case 'end':
      masked = str.slice(-count).padStart(str.length, maskChar)
      break
    case 'middle':
      const half = Math.floor(count / 2)
      masked = str.slice(0, half) + maskChar.repeat(str.length - count) + str.slice(-half)
      break
    case 'full':
      masked = maskChar.repeat(str.length)
      break
    default:
      masked = str.slice(-count).padStart(str.length, maskChar)
  }

  return maskSpaces ? masked.replace(/\s/g, maskChar) : masked
}

/**
 * Universal masking function
 * @param value - a string or number to mask
 * @param preset - masking settings
 * @returns a masked string
 * @example mask('1234567890') // '******7890'
 * @example mask('user@example.com', { count: 5 }) // 'u****@*****'
 */
export function mask(value: string | number, preset: MaskPreset): string
export function mask(value: string | number, options: Partial<MaskOptions>): string
export function mask(value: string | number, presetOrOptions?: MaskPreset | Partial<MaskOptions>): string
export function mask(value: string | number, presetOrOptions?: MaskPreset | Partial<MaskOptions>): string {
  const str = toStringSafe(value)

  if (!presetOrOptions) {
    return applyMask(str, '*', 4)
  }

  // Preset mask
  if (typeof presetOrOptions === 'string' && presetOrOptions in PRESET_MASKS) {
    const preset = PRESET_MASKS[presetOrOptions as MaskPreset]
    return applyMask(str, preset.mask, preset.count, preset.position, preset.maskSpaces ?? true)
  }

  const opts: Required<MaskOptions> = {
    mask: '*',
    count: 4,
    position: 'end',
    maskSpaces: true,
    separator: '',
    ...(presetOrOptions as Partial<MaskOptions>)
  }

  validateMaskOptions(opts)
  let result = applyMask(str, opts.mask, opts.count, opts.position, opts.maskSpaces)

  // Grouping for cards
  if (opts.separator && str.length > 8) {
    result = result.replace(/(.{4})(.{4})/g, `$1${opts.separator}$2`)
  }

  return result
}

/**
 * Mask factory - for repeated use
 * @param preset - mask settings
 * @returns a masking function with fixed settings
 */
export function createMask(preset: MaskPreset): (value: string | number) => string
export function createMask(options: Partial<MaskOptions>): (value: string | number) => string
export function createMask(
  presetOrOptions: MaskPreset | Partial<MaskOptions>
): (value: string | number) => string {
  return (value: string | number) => mask(value, presetOrOptions)
}

/** Disguise with groups */
export function maskGroups(
  value: string | number,
  groupSize = 4,
  separator = ' '
): string {
  const str = toStringSafe(value)
  const masked = mask(str, { count: groupSize * 2, position: 'end' })
  return masked.replace(
    new RegExp(`(.{${groupSize}})(.{${groupSize}})?`, 'g'),
    `$1${separator}$2`
  )
}

/** Validation of the result */
export function isMasked(value: string): boolean {
  return /^[*#\-_]{2,}/.test(value)
}

/** Exporting types and presets */
export type {
  MaskCharacter,
  MaskPosition,
  MaskPreset,
  MaskOptions
}

export { PRESET_MASKS }
