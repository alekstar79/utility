/**
 * Universal word declension system (Russian/English/etc)
 * Compatibility: ES5+ (100% caniuse.com), no deprecated API
 * Architecture: Factory + Presets + Internationalization
 */

type GrammarRule = 'russian' | 'english' | 'custom' | (string & {});
type PluralForm = 0 | 1 | 2;

interface DeclensionRule {
  /** A function for determining the plural form */
  getPluralForm: (n: number) => PluralForm;
  /** Rule description */
  description?: string;
}

interface DeclensionOptions {
  /** Declension rule */
  rule?: GrammarRule;
  /** Custom function for determining the plural form */
  customRule?: (n: number) => PluralForm;
  /** Include a number in the result */
  includeNumber?: boolean;
}

/** Built-in declension rules */
const DECLENSION_RULES: Record<GrammarRule, DeclensionRule> = {
  russian: {
    description: 'Russian pluralization (1 item, 2-4 items, 5+ items)',
    getPluralForm: (n: number): PluralForm => {
      // Bitwise operations instead of modulus
      const mod10 = ((n >>> 0) % 10) >>> 0;
      const mod100 = ((n >>> 0) % 100) >>> 0;

      // Form 1 (one, 21, 31, ..., but not 11)
      if (mod10 === 1 && mod100 !== 11) return 0
      // Form 2 (two, three, four, 22-24, 32-34, ..., but not 12-14)
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 1
      // Form 3 (zero, five, ..., 11-19, 25-30, ...)
      return 2
    }
  },

  english: {
    description: 'English pluralization (1 item, 0/2+ items)',
    getPluralForm: (n: number): PluralForm => {
      // English: only singular (1) and plural (not 1)
      return n === 1 ? 0 : 1
    }
  },

  custom: {
    getPluralForm: (_n: number): PluralForm => 2, // Placeholder
    description: 'Custom pluralization rule'
  }
}

/** Validation of input data */
const validateDeclensionInput = (n: number, forms: readonly string[]): void => {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`[declination] The number must be a non-negative integer, received: ${n}`)
  }
  if (!Array.isArray(forms) || forms.length < 2) {
    throw new Error(`[declination] An array of 2+ declension options is required, and the following was received: ${forms.length}`)
  }
  if (forms.length > 6) {
    console.warn(`[declination] Used ${forms.length} variants (2-6 recommended)`)
  }
}

/** Getting a form */
const getFormSafe = (forms: readonly string[], index: PluralForm): string => {
  return forms[Math.min(index, forms.length - 1)] || forms[forms.length - 1]
}

/**
 * The main declension function
 * @param {number} n - the number (non-negative integer)
 * @param {string[]} forms - the variants of the word [one, two, many] with a minimum of 2
 * @param {DeclensionOptions} options - additional options
 * @returns the declined form, optionally with a number
 *
 * @example
 * declination(5, ['комментарий','комментария','комментариев'])
 * // 'комментариев'
 *
 * declination(21, ['комментарий','комментария','комментариев'], { includeNumber: true })
 * // '21 комментарий'
 *
 * declination(2, ['like', 'likes'], { rule: 'english' })
 * // 'likes'
 */
export function declination<T extends readonly string[]>(
  n: number,
  forms: T,
  options: DeclensionOptions = {}
): string {
  validateDeclensionInput(n, forms)

  const {
    rule = 'russian',
    customRule,
    includeNumber = false
  } = options

  // Choosing a rule
  let pluralForm: PluralForm

  if (customRule) {
    pluralForm = customRule(n) as PluralForm
  } else {
    let declensionRule: DeclensionRule | undefined = customRules.get(rule)

    if (!declensionRule) {
      declensionRule = DECLENSION_RULES[rule as GrammarRule]
    }
    if (!declensionRule) {
      throw new Error(`[declination] Unknown declination rule: ${rule}`)
    }

    pluralForm = declensionRule.getPluralForm(n)
  }

  // Getting a fallback option
  const form = getFormSafe(forms, pluralForm)

  // Adding a number if required
  return includeNumber
    ? `${n} ${form}`
    : form
}

/**
 * Factory for creating a declension function with fixed parameters
 * Convenient for React/Vue components
 *
 * @example
 * const declineComments = createDeclension(
 *  ['комментарий', 'комментария', 'комментариев'],
 *  { includeNumber: true }
 * )
 * declineComments(5)   // '5 комментариев'
 * declineComments(21)  // '21 комментарий'
 */
export function createDeclension(
  forms: readonly string[],
  options: DeclensionOptions = {}
): (n: number) => string {
  validateDeclensionInput(0, forms) // One-time validation

  return (n: number) => declination(n, forms, options)
}

/**
 * Extended version for arrays (for lists with the desired number of elements)
 * @example
 * const items = ['item1', 'item2', 'item3'];
 * declensionForCount(items.length, ['элемент', 'элемента', 'элементов'], { includeNumber: true })
 * // '3 элемента'
 */
export function declensionForCount(
  count: number,
  forms: readonly string[],
  options?: DeclensionOptions
): string {
  return declination(count, forms, options)
}

/**
 * Full-featured formatter with interpolation
 * @example
 * formatPlural(5, 'У вас есть {count} {word}', {
 *   words: ['сообщение', 'сообщения', 'сообщений']
 * })
 * // 'У вас есть 5 сообщений'
 */
export function formatPlural(
  n: number,
  template: string,
  options: DeclensionOptions & { words: readonly string[] } = {} as any
): string {
  const { words, ...declensionOpts } = options

  if (!words) {
    throw new Error('[formatPlural] The words parameter is required')
  }

  const declined = declination(n, words, {
    includeNumber: false,
    ...declensionOpts
  })

  return template
    .replace('{count}', String(n))
    .replace('{word}', declined)
    .replace('{plural}', declined)
}

/**
 * Registration of custom declension rules
 */
const customRules = new Map<string, DeclensionRule>()

export function registerDeclensionRule(name: string, rule: DeclensionRule): void {
  customRules.set(name, rule)
}

export function getDeclensionRule(name: string): DeclensionRule | undefined {
  return customRules.get(name) || DECLENSION_RULES[name as GrammarRule]
}

/** Types to export */
export type {
  GrammarRule,
  PluralForm,
  DeclensionRule,
  DeclensionOptions
}

/** Exporting rules */
export { DECLENSION_RULES }
