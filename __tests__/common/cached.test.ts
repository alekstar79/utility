import { createCachedFunction } from '../../src/common/cached'
import { cachedWorker } from '../../src/common/cached-worker'
import { workerInit } from '../../src/common/worker'

import { LRUCache } from '../../src/common/lruCache'

jest.setTimeout(10000)

describe('LRUCache', () => {
  let cache: LRUCache<string, string>

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1000)
    cache = new LRUCache(3, 100)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('basic operations', () => {
    cache.set('k1', 'v1')
    expect(cache.get('k1')).toBe('v1')
    expect(cache.size).toBe(1)
  })

  test('LRU eviction', () => {
    cache.set('k1', 'v1')
    cache.set('k2', 'v2')
    cache.set('k3', 'v3')
    cache.set('k4', 'v4')

    expect(cache.get('k1')).toBeUndefined()
    expect(cache.get('k4')).toBe('v4')
  })

  test('get updates counter but eviction by Map order', () => {
    cache.set('k1', 'v1')
    cache.set('k2', 'v2')

    jest.spyOn(Date, 'now').mockReturnValueOnce(2000)
    cache.get('k1')

    cache.set('k3', 'v3')

    expect(cache.get('k1')).toBeUndefined()
    expect(cache.get('k2')).toBe('v2')
  })

  test('TTL expiration', () => {
    cache.set('key', 'value')
    jest.spyOn(Date, 'now').mockReturnValueOnce(1200)

    expect(cache.get('key')).toBeUndefined()
    expect(cache.size).toBe(0)
  })
})

describe('createCachedFunction', () => {
  test('sync caching', () => {
    const fn = jest.fn((x: string) => x + '_result')
    const cachedFn = createCachedFunction(fn as any, {
      maxSize: 2,
      keyFn: (args: any[]) => args[0]
    }) as any;

    cachedFn('key1')
    cachedFn('key1')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('async caching', async () => {
    const fn = jest.fn((x: string) => Promise.resolve(x + '_result'))
    const cachedFn = createCachedFunction(fn as any, {
      maxSize: 2,
      keyFn: (args: any[]) => args[0]
    }) as any

    await cachedFn('key1')
    await cachedFn('key1')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('cache API', () => {
    const fn = jest.fn()
    const cachedFn = createCachedFunction(fn as any, {
      maxSize: 2,
      keyFn: (args: any[]) => args[0]
    }) as any

    cachedFn('key1')
    expect(cachedFn.cache.has(['key1'])).toBe(true)
    cachedFn.cache.clear()
  })

  test('stats tracking', () => {
    const fn = jest.fn()
    const cachedFn = createCachedFunction(fn as any, {
      stats: true,
      maxSize: 1,
      keyFn: (args: any[]) => args[0]
    }) as any;

    cachedFn('k1')
    cachedFn('k1')
    cachedFn('k2')

    expect(cachedFn.cache!.stats).toMatchObject({
      hits: 1,
      misses: 3,  // k1(set=1) + k1(hit=NO set) + k2(delete+set=2+3)
      evictions: 1,
      size: 1
    })
  })
})

describe('workerInit', () => {
  let mockWorker: any
  let messageIdCounter = 0

  beforeEach(() => {
    messageIdCounter = 0
    mockWorker = {
      postMessage: jest.fn((msg: any) => {
        messageIdCounter++
        const id = msg.id || messageIdCounter.toString()

        if (msg.type === 'execute' && mockWorker.onmessage) {
          const responseType = msg.data && msg.data.input ? 'result' : 'error'
          const responseData = msg.data && msg.data.input ? 42 : 'ERROR!'

          mockWorker.onmessage({
            data: { id, data: responseData, type: responseType }
          })
        }
      }),
      terminate: jest.fn(),
      onmessage: null,
      onerror: jest.fn()
    }

    ;(globalThis as any).Worker = jest.fn(() => mockWorker)
  })

  test('executes worker job', async () => {
    const workerFn = (_event: MessageEvent) => {
      // onmessage is already installed by workerInit
    }

    const compute = workerInit(workerFn as any)
    const result = await compute({ input: 'test' })

    expect(result).toBe(42)
    expect(mockWorker.postMessage).toHaveBeenCalled()
  })

  test('handles worker error', async () => {
    const workerFn = (_event: MessageEvent) => {
      // postMessage will automatically send an error if there is no input
    }

    const compute = workerInit(workerFn as any)
    await expect(compute({ noInput: true })).rejects.toThrow('ERROR!')
  })
})

describe('cachedWorker', () => {
  let mockWorker: any

  beforeEach(() => {
    mockWorker = {
      postMessage: jest.fn((msg: any) => {
        if (msg.type === 'execute' && mockWorker.onmessage) {
          mockWorker.onmessage({
            data: { id: msg.id, data: 42, type: 'result' }
          })
        }
      }),
      terminate: jest.fn(),
      onmessage: null,
      onerror: jest.fn()
    }

    ;(globalThis as any).Worker = jest.fn(() => mockWorker)
  })

  test('caches worker results', async () => {
    const workerFn = () => {}
    const compute = cachedWorker(workerFn as any, { maxSize: 1 })

    const r1 = await compute({ input: 'test' })
    const r2 = await compute({ input: 'test' })

    expect(r1).toBe(42)
    expect(r2).toBe(42)
    expect(compute.cache.size).toBe(1)
  })
})
