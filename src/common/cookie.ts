export type CookieValue = string | number | boolean | null | undefined;

export type CookieOptions = {
  /** Decode values (default true) */
  decode?: boolean;
  /** Maximum depth of nested objects */
  maxDepth?: number;
  /** Convert numeric values */
  parseNumbers?: boolean;
  /** Convert boolean values */
  parseBooleans?: boolean;
  /** Ignore empty values */
  ignoreEmpty?: boolean;
  /** Prefix for private cookies */
  privatePrefix?: string;
}

export interface CookieStats {
  total: number;
  decoded: number;
  parsed: number;
  ignored: number;
  nested: number;
}

export interface CookieAPI<T> {
  /** Clear all cookies */
  clear(): void;
  /** Get count of cookies */
  readonly size: number;
  /** Check for cookies */
  has(key: keyof T): boolean;
  /** Delete a specific cookie */
  delete(key: keyof T): void;
  /** Get statistics */
  readonly stats: CookieStats;
  /** Get the raw values */
  readonly raw: Record<string, string>;
}

/**
 * Converts a cookies string to a typed object
 *
 * @example
 * const cookieStr = 'foo=bar; num=42; bool=true; json={"nested":{"obj":1}}; eq=E%3Dmc%5E2'
 *
 * const cookies = cookie({
 *   decode: true,
 *   parseNumbers: true,
 *   parseBooleans: true
 * })
 *
 * // Typed Usage
 * interface AppCookies {
 *   userId: number;
 *   theme: 'dark' | 'light';
 *   settings: { notifications: boolean }
 * }
 *
 * const typedCookies = cookie<AppCookies>(cookieStr)
 *
 * console.log(typedCookies.userId) // 42 (number)
 * console.log(typedCookies.theme) // 'dark'
 * console.log(typedCookies.settings.notifications) // true
 *
 * console.log(cookies.stats); // Statistics
 * cookies.clear() // Clearing
 * cookies.has('userId') // Check
 */
export function cookie<T extends Record<string, any> = Record<string, CookieValue>>(
  str: string,
  options: CookieOptions = {}
): CookieAPI<T> & T {
  const {
    decode = true,
    maxDepth = 3,
    parseNumbers = true,
    parseBooleans = true,
    ignoreEmpty = true,
    privatePrefix = '__'
  } = options;

  const rawCookies: Record<string, string> = {}
  const cookies: Partial<T> & Record<string, CookieValue> = {}
  const stats: CookieStats = { total: 0, decoded: 0, parsed: 0, ignored: 0, nested: 0 }

  // Cookie string parsing
  str.split(';').forEach((cookieStr) => {
    const trimmed = cookieStr.trim()

    if (!trimmed) return

    const [rawKey, ...rawValueParts] = trimmed.split('=')
    const key = rawKey?.trim()
    const value = rawValueParts.join('=').trim()

    if (!key || (ignoreEmpty && !value)) {
      stats.ignored++
      return
    }

    stats.total++

    const cleanKey = key.startsWith(privatePrefix)
      ? key
      : decode
        ? decodeURIComponent(key)
        : key

    const cleanValue = decode
      ? decodeURIComponent(value)
      : value

    rawCookies[cleanKey] = cleanValue

    const parsedValue = parseCookieValue(cleanValue, { parseNumbers, parseBooleans })
    stats.parsed += parsedValue !== cleanValue ? 1 : 0

    setNestedValue(cookies, cleanKey, parsedValue, maxDepth)
  })

  stats.decoded = stats.total - stats.ignored

  const api: CookieAPI<T> = {
    get size() {
      return Object.keys(cookies).length
    },

    get stats() {
      return { ...stats, nested: countNested(cookies) }
    },

    get raw() {
      return { ...rawCookies }
    },

    clear() {
      Object.keys(cookies).forEach(key => delete (cookies as any)[key])
      Object.keys(rawCookies).forEach(key => delete rawCookies[key])
      Object.assign(stats, { total: 0, decoded: 0, parsed: 0, ignored: 0, nested: 0 })
    },

    has(key: keyof T) {
      return key in cookies
    },

    delete(key: keyof T) {
      delete (cookies as any)[key]
      delete rawCookies[key as string]
    }
  }

  Object.assign(api, cookies)

  return api as CookieAPI<T> & T
}

function parseCookieValue(
  value: string,
  options: { parseNumbers: boolean; parseBooleans: boolean }
): CookieValue {
  if (options.parseNumbers && !isNaN(Number(value))) {
    return Number(value)
  }

  if (options.parseBooleans) {
    const lower = value.toLowerCase()

    if (lower === 'true') return true
    if (lower === 'false') return false
  }

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function setNestedValue<T extends Record<string, any>>(
  obj: Partial<T>,
  path: string,
  value: any,
  maxDepth: number
): void {
  if (maxDepth <= 0 || !path.includes('.')) {
    (obj as any)[path] = value
    return
  }

  const keys = path.split('.')
  let current: any = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]

    if (!(key in current)) {
      current[key] = {}
    }

    current = current[key]
  }

  current[keys[keys.length - 1]] = value
}

function countNested(obj: Record<string, any>): number {
  let count = 0

  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      count += Object.keys(value).length + countNested(value)
    }
  }

  return count
}

export function cookieStringify<T extends Record<string, any>>(cookies: T): string
{
  return Object.entries(cookies)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      const val = typeof value === 'object' ? JSON.stringify(value) : String(value)
      return `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
    })
    .join('; ')
}
