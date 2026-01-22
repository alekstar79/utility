import type { CacheOptions } from './lruCache'

import { createCachedFunction } from './cached'
import { workerInit } from './worker'

export const cachedWorker = <TInput = unknown, TResult = unknown>(
  workerFn: Parameters<typeof workerInit<TInput, TResult>>[0],
  options?: CacheOptions<[TInput]>
) => createCachedFunction(workerInit(workerFn), options)
