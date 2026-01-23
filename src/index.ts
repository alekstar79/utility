// number
export { decimalAdjust, ceil10, floor10, round10 } from '@/common/decimalAdjust'
export { randomInt, randomIntBatch } from '@/common/randomInt'
export { random } from '@/common/random'
export { secureRandomInt } from '@/common/secureRandomInt'
export type { RangeOptions, RangeLazyOptions, RangeStats, RangeResult } from '@/common/range'
export { range, rangeStats, rangeSum, ranges } from '@/common/range'

// string
export type {
  DeclensionOptions,
  DeclensionRule,
  GrammarRule,
  PluralForm
} from '@/common/declination'

export {
  declination,
  createDeclension,
  declensionForCount,
  getDeclensionRule,
  registerDeclensionRule,
  formatPlural
} from '@/common/declination'

export type { RandomStringOptions, RandomStringStats } from '@/common/randomStr'
export { randomString, randomStrings, getRandomStringStats, presets } from '@/common/randomStr'
export { trim } from '@/common/trim'
export { truncate } from '@/common/truncate'

// array
export { ExtendedArray, extendedArray } from '@/common/array'
export { AsyncArray } from '@/common/asyncArray'
export { asyncIter } from '@/common/asyncIter'
export type { ChunkOptions, ChunkStats } from '@/common/chunk'
export { chunk, chunkStats, createChunker } from '@/common/chunk'
export { each } from '@/common/each'
export type { FindMaxScoreOptions, Scorable } from '@/common/findMaxScore'
export { MaxScoreFinder, findMaxScores, findMaxScoresWithSelector } from '@/common/findMaxScore'
export { shift } from '@/common/shift'
export type { ShuffleOptions, ShuffleStats } from '@/common/shuffle'
export { shuffle, shuffleAll, shuffleGenerator, seededShuffle } from '@/common/shuffle'
export type { SortOptions, SortDirection, SortStability, SortMode } from '@/common/sortArray'
export { sortArray, sortAll } from '@/common/sortArray'

// object
export { iterable } from '@/common/iterable'
export type { ComparisonMode, DeepEqualOptions, DeepEqualResult } from '@/common/equal'
export { deepEqual, shallowEqual } from '@/common/equal'
export { deepMerge } from '@/common/deepMerge'

// common
export { cached, createCachedFunction } from '@/common/cached'
export { cachedWorker } from '@/common/cached-worker'
export { clamp } from '@/common/clamp'
export { curry } from '@/common/curry'
export { debounce } from '@/common/debounce'
export { gap } from '@/common/gap'
export { getStyles } from '@/common/getStyles'
export type { MaskCharacter, MaskPosition, MaskPreset, MaskOptions } from '@/common/mask'
export { PRESET_MASKS, mask, createMask } from '@/common/mask'
export type { HexColor, HexColorWithAlpha, ColorOptions, ColorFormat, Luminance } from '@/common/randomColor'
export { randomColor, randomColorPalette, isValidColor } from '@/common/randomColor'
export { Lorem, lorem, loremFactory, ipsum, generateWithStats } from '@/common/lorem'
export type { CacheAPI, CacheEntry, CacheOptions, CacheStats } from '@/common/lruCache'
export { LRUCache } from '@/common/lruCache'
export type { NormalizeNumberOptions } from '@/common/normalizeNumber'
export { normalizeNumber } from '@/common/normalizeNumber'
export type { ParsedUrlData } from '@/common/parseDataUrl'
export { parseDataURL } from '@/common/parseDataUrl'
export { pick } from '@/common/pick'
export { pipe, createPipe } from '@/common/pipe'
export type { IOptionsTextWidth, ReturnTextWidth } from '@/common/textMeasuring'
export { useTextMeasuring } from '@/common/textMeasuring'
export { throttle } from '@/common/throttle'
export type { TWatchCallback, IWatchOptions, IWatcher } from '@/common/watch'
export { RAFBatcher, Watcher, rafWatch, idleWatch } from '@/common/watch'

// web api
export type { CancelablePromiseOptions, CancelablePromiseStatus, CancelError } from '@/common/cancelablePromise'
export { CancelablePromise } from '@/common/cancelablePromise'
export type { ClipboardStats, ClipboardOptions, ClipboardResult } from '@/common/clipboard'
export { Clipboard, ClipboardUtils } from '@/common/clipboard'

export {
  createIntersectionObserver,
  createIntersectionObserverMultiple
} from './observers/intersectionObserver'

export {
  createMutationObserver,
  createMutationObserverMultiple
} from './observers/mutationObserver'

export {
  createResizeObserver,
  createResizeObserverMultiple
} from './observers/resizeObserver'

export {
  detectBrowser,
  detectBrowserSync,
  clearBrowserCache,
  getBrowserString,
  isFeatureSupported
} from '@/common/detectBrowser'

export type {
  DownloadOptions,
  ReadMode,
  ReadProgress,
  FileOptions,
  UseFileSystemReturn
} from '@/common/fileSystem'

export {
  FileSystem,
  createFileSystem,
  downloadFile,
  pickFiles,
  readFile,
  useFileSystem,
  useDragDrop,
  mimeToExt,
  extToMime
} from '@/common/fileSystem'

export { ExtendedMap, extendedMap, mapFromObject } from '@/common/map'
export type { FullscreenInfo, FullscreenOptions, SupportedAPI } from '@/common/fullscreen'
export { Fullscreen } from '@/common/fullscreen'
export { formatAsCurrency } from '@/common/formatAsCurrency'
export { formatBytes } from '@/common/formatBytes'
export { objToCookie } from '@/common/objToCookie'
export { objToQuery } from '@/common/objToQuery'
export { formToQuery } from '@/common/formToQuery'
export { formToObj } from '@/common/formToObj'
export { queryToObj } from '@/common/queryToObj'
export type { PixelRatio } from '@/common/pixelRatio'
export { getPixelRatio } from '@/common/pixelRatio'
export type { CookieAPI, CookieOptions, CookieStats } from '@/common/cookie'
export { cookie, cookieStringify } from '@/common/cookie'
export { uuid } from '@/common/uuid'
export { hash } from '@/common/hash'
export type { WorkerMessage, WorkerOptions, WorkerJob } from '@/common/worker'
export { workerInit } from '@/common/worker'

// dom
export {
  addEventListener,
  clickOutside,
  createElement,
  extractCoordinates,
  getAccumulatedScroll,
  getDocumentCoordinates,
  getElementCoordinates,
  getParentChain,
  getScrollPosition,
  isElement,
  isElementInDOM,
  isScrolledToBottom,
  isScrolledToTop,
  isTouchEvent,
  removeElement,
  replaceElement,
  setScrollPosition,
  supportsObservers,
  traverseDOM
} from '@/dom/dom-utils'

export type { PopupOptions, PopupFeatures, PopupResult, ScreenMetrics } from '@/dom/popup'
export { getScreenMetrics, calculateCenteredPosition, popup } from '@/dom/popup'

// animation
export type { AnimationState, EasingFn, TimingOptions } from '@/animation/types'
export { Animator, AnimatorChain, Timing, EASING } from '@/animation'

// prng
export type {
  PRNGAlgorithm,
  PRNGFunctionGenerator,
  GeneratorConfig,
  SeededGeneratorOptions,
  SeededGeneratorAPI,
  PRNGConstants
} from '@/prng/core/types'

export { initializeBuffer, foldBuffer, rotl } from '@/prng/core/utils'
export { PRNG_ALGORITHMS, createGenerator } from '@/prng/algorithms'
export { useSeededGenerator } from '@/prng/api/useSeededGenerator'
