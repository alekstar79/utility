import type { Awaited, CacheOptions, CacheAPI } from './lruCache'
import { LRUCache } from './lruCache'

/**
 * @param {(...args: any[]) => any} fn - Function
 * @param {CacheOptions} options - Options
 *
 * @example
 * interface User { id: number; name: string; }
 *
 * // Expensive API Call
 * async function fetchUser(id: number): Promise<User> {
 *   console.log(`Fetching user ${id} from API...`)
 *   return { id, name: `User ${id}` }
 * }
 *
 * const cachedFetchUser = cached(fetchUser, {
 *   maxSize: 100,
 *   ttl: 5 * 60 * 1000, // 5 minutes
 *   keyFn: ([id]) => `user:${id}`,
 *   stats: true
 * })
 *
 * // Re-calling will return from the cache
 * const user1 = await cachedFetchUser(1)
 * const user1Again = await cachedFetchUser(1) // From the cache
 *
 * console.log(cachedFetchUser.cache.stats) // Statistics
 *
 * cachedFetchUser.cache.clear() // Clearing the cache
 */
export function createCachedFunction<
  TFn extends (...args: any[]) => any,
  TArgs extends Parameters<TFn> = Parameters<TFn>,
  TResult = Awaited<ReturnType<TFn>>
>(
  fn: TFn,
  options: CacheOptions<TArgs> = {}
): TFn & { cache: CacheAPI<TArgs> } {
  const {
    keyFn = (args: TArgs) => JSON.stringify(args),
    maxSize = Infinity,
    ttl = Infinity,
    stats = false
  } = options

  const cache = maxSize === Infinity ? null : new LRUCache(maxSize, ttl)
  const useStats = stats && !!cache

  const handler: ProxyHandler<TFn> = {
    apply(_target, thisArg, args: any[]) {
      const key = keyFn(args as TArgs)

      if (cache) {
        const hit = cache.get(key)

        if (hit !== undefined) {
          return hit
        }
      }

      const result = Reflect.apply(fn, thisArg, args)

      if (result instanceof Promise) {
        return result.then(value => {
          cache?.set(key, value)
          return value
        })
      }

      cache?.set(key, result as TResult)

      return result
    }
  }

  const proxy = new Proxy(fn, handler) as any

  Object.defineProperty(proxy, 'cache', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: {
      get size() {
        return cache?.size ?? 0
      },
      clear: () => cache?.clear(),
      has: (args: TArgs) => cache?.has(keyFn(args)) ?? false,
      delete: (args: TArgs) => !!cache?.delete(keyFn(args)),
      stats: useStats ? cache!.stats : undefined
    }
  })

  return proxy as ReturnType<
    typeof createCachedFunction<TFn, TArgs, TResult>
  >
}

// A utility for type-safe use
export function cached<
  TFn extends (...args: any[]) => any
>(fn: TFn, options?: CacheOptions<Parameters<TFn>>): TFn & { cache: CacheAPI } {
  return createCachedFunction(fn, options)
}
