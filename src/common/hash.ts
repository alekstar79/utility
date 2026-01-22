/**
 * @description Universal hash function for a string of arbitrary data
 * with an optional SHA-1, SHA-256, SHA-384, or SHA-512 algorithm.
 * Uses the Web Crypto API: crypto.subtle.digest.
 * Compatibility: ES6+, Web Crypto is supported by all modern browsers and Node.js 18+.
 *
 * @example
 * const obj = { a: 1, b: [2, 3], c: { foo: 'bar' } }
 * const hashValue = await hash(obj)
 * // '79f2004818357f37635ae76481e2654130f56a0ce55e05ecc0d3c455cafdff60'
 *
 * @param {string | Object} input - string or object that is automatically serialized to JSON
 * @param {'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'} algorithm - hashing algorithm (default 'SHA-256')
 * @returns {string} - hex string with hash
 *
 * @see [caniuse.com](https://caniuse.com/webcrypto)
 */
export async function hash(
  input: string | object,
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256'
): Promise<string> {
  const rawStr = typeof input === 'string' ? input : JSON.stringify(input)
  const data = new TextEncoder().encode(rawStr)
  const hashBuffer = await crypto.subtle.digest(algorithm, data)

  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
