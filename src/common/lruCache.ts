export type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  evictions: number;
}

export interface CacheOptions<TArgs extends any[]> {
  keyFn?: (args: TArgs) => string;
  maxSize?: number;
  ttl?: number;
  stats?: boolean;
}

export interface CacheAPI<TArgs extends any[] = any[]> {
  readonly size: number;
  clear(): void;
  has(args: TArgs): boolean;
  delete(args: TArgs): boolean;
  stats?: CacheStats;
}

export class LRUCache<K extends string, V>
{
  private cache = new Map<K, CacheEntry<V>>()
  private order = new Map<K, number>()
  private counter = 0

  public readonly stats: CacheStats

  constructor(
    private readonly maxSize: number,
    private readonly ttl: number
  ) {
    this.stats = { hits: 0, misses: 0, size: 0, evictions: 0 }
  }

  public get(key: K): V | undefined
  {
    const entry = this.cache.get(key)

    if (!entry || (this.ttl !== Infinity && Date.now() - entry.timestamp >= this.ttl)) {
      this.delete(key)
      return undefined
    }

    this.order.set(key, this.counter++)
    this.stats.hits++
    this.stats.size = this.cache.size
    return entry.value
  }

  public set(key: K, value: V): void
  {
    this.delete(key)

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.order.keys().next().value

      if (firstKey) {
        this.delete(firstKey)
        this.stats.evictions++
      }
    }

    this.cache.set(key, { value, timestamp: Date.now() })
    this.order.set(key, this.counter++)
    this.stats.size = this.cache.size
    this.stats.misses++
  }

  public delete(key: K): boolean
  {
    return this.cache.delete(key) && this.order.delete(key)
  }

  public clear(): void
  {
    this.cache.clear()
    this.order.clear()
    this.stats.size = 0
  }

  public has(key: K): boolean
  {
    return this.cache.has(key)
  }

  public get size(): number
  {
    return this.cache.size
  }
}
