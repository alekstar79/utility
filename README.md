# Utils

[![npm version](https://img.shields.io/npm/v/utils.svg)](https://www.npmjs.com/package/utils)
[![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)](https://github.com/alekstar79/utils/actions)
[![License](https://img.shields.io/npm/l/utils.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/Node-18%2B-green?style=flat-square)](https://nodejs.org)

Useful JavaScript/Typescript Utilities.

![utility](utility.svg)

<!-- TOC -->
* [Utils](#utils)
  * [Installation](#installation)
  * [Usage](#usage)
  * [List](#list)
    * [Number](#number)
    * [String](#string)
    * [Array](#array)
    * [Object](#object)
    * [Common](#common)
    * [Web API](#web-api)
    * [DOM utilities - only essential, non-trivial functions](#dom-utilities---only-essential-non-trivial-functions)
    * [Animation](#animation)
    * [PRNG](#prng)
  * [Examples](#examples)
    * [truncate](#truncate)
    * [chunk](#chunk)
    * [iterable](#iterable)
    * [deepEqual](#deepequal)
    * [pipe](#pipe)
    * [createPipe](#createpipe)
<!-- TOC -->

## Installation

```bash
yarn add @alekstar79/utils
# or
npm i @alekstar79/utils
```

## Usage

```js
import { randInt } from '@alekstar79/utils'

const int = randInt(1, 10)

console.log(int) // 6
```

## List

### Number

- `randInt(min: number, max: number)`
- `range(stop: number, start = 0, step = 1): [start, step, ...stop)`
- `decimalAdjust(type: 'round' | 'floor' | 'ceil', value: number | string, exp?: any)`
- `ceil10(value: number | string, exp: number)`
- `floor10(value: number | string, exp: number)`
- `round10(value: number | string, exp: number)`
- `randomInt(min: number, max: number)`
- `randomIntBatch(min: number, max: number, count: number)`
- `random(min: number, max: number)`
- `secureRandomInt(min: number, max: number)`
- `range(stop: number, startOrOptions?: number | RangeOptions, step?: number | RangeOptions, lazy = false)`
- `rangeStats(result: RangeResult)`
- `rangeSum(range: number[])`

### String

- `declination<T extends readonly string[]>(n: number, forms: T, options: DeclensionOptions = {})`
- `createDeclension(forms: readonly string[], options: DeclensionOptions = {})`
- `declensionForCount(count: number, forms: readonly string[], options?: DeclensionOptions)`
- `getDeclensionRule(name: string)`
- `registerDeclensionRule(name: string, rule: DeclensionRule)`
- `formatPlural(n: number, template: string, options: DeclensionOptions)`
- `randomString(options: number | RandomStringOptions)`
- `randomStrings(count: number, options: number | RandomStringOptions)`
- `getRandomStringStats(str: string, alphabet: Alphabet, isSecureUsed?: boolean)`
- `trim(str: string)`
- `truncate(str: string, max: number, end = '...')`: [example](#truncate)

### Array

  `class ExtendedArray<T> extends Array<T>`  
  `class AsyncArray<T> extends Array<T>`  
  `class MaxScoreFinder<T extends Scorable>`

- `extendedArray<T>(iterable: Iterable<T>)`
- `AsyncArray.of<T>(...items: T[])`
- `asyncIter<T>(array: Promise<any>[])`
- `chunk<T>(source: readonly T[], options: number | ChunkOptions<T>)`: [example](#chunk)
- `chunkStats<T>(chunks: readonly T[][])`
- `createChunker<T>(options: PartialChunkOptions<T> & { size: number })`
- `each<T extends any>(array: T[], fn: (value: T, index: number, array: T[]) => unknown, ms = 0)`
- `findMaxScores<T extends Scorable>(items: readonly T[], options: FindMaxScoreOptions = {})`
- `findMaxScoresWithSelector<T, S extends number>(items: T[], selector: (item: T) => S, compareFn?: (current: S, candidate: S) => boolean)`
- `shift<T>(arr: readonly T[], direction: number, n: number)`
- `shuffle<T>(array: T[], options: boolean | ShuffleOptions = false)`
- `shuffleAll<T>(arrays: T[][], options: boolean | ShuffleOptions = false)`
- `shuffleGenerator<T>(array: T[], secure = false)`
- `seededShuffle<T>(array: readonly T[], seed: string | number)`
- `sortArray<T>(array: T[], options: SortDirection | SortOptions<T> = true)`
- `sortAll<T>(arrays: T[][], options: SortDirection | SortOptions<T> = true)`

### Object

- `iterable<T extends object>(obj: T)`: makes `obj` iterable; [example](#iterable)
- `deepEqual<T extends object | Primitive>(objA: T, objB: T)`: deeply compares `objA` and `objB`
- `deepEqual<T>(objA: T, objB: T, options: DeepEqualOptions & { detailed: true })`
- `deepEqual<T>(objA: T, objB: T, options?: DeepEqualOptions)`: [example](#deepEqual)
- `shallowEqual<T>(objA: T, objB: T)`
- `deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>, customizer?: CustomizerFunction, context: MergeContext = {})`

### Common

  `class Lorem`  
  `class LRUCache<K extends string, V>`  
  `class RAFBatcher`  
  `class Watcher`  

- `cached<TFn extends (...args: any[]) => any>(fn: TFn, options?: CacheOptions<Parameters<TFn>>)`
- `createCachedFunction<TFn extends (...args: any[]) => any, TArgs extends Parameters, TResult = Awaited>(fn: TFn, options: CacheOptions = {})`
- `cachedWorker(workerFn: Parameters<typeof workerInit>[0], options?: CacheOptions<[TInput]>)`
- `clamp(value: number, min: number, max: number)`
- `curry<F extends (...args: any[]) => any>(fn: F)`
- `debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number)`
- `throttle<T extends (...args: any[]) => void>(fn: T, delayMs: number)`
- `gap(n: number | string, sep: string = ' ')`
- `getStyles(el: Element | HTMLElement, props: P, parse: boolean = false)`
- `mask(value: string | number, preset: MaskPreset)`
- `mask(value: string | number, options: Partial<MaskOptions>)`
- `mask(value: string | number, presetOrOptions?: MaskPreset | Partial<MaskOptions>)`
- `createMask(options: Partial<MaskOptions>)`
- `maskGroups(value: string | number, groupSize = 4, separator = ' ')`
- `randomColor(options: ColorOptions = {})`: returns random HexColor | string
- `randomColorPalette(count: number, options?: Omit<ColorOptions, 'count'>)`
- `loremFactory(options?: LoremOptions)`
- `ipsum(count: number, units: Units = 'words')`
- `generateWithStats(options: LoremOptions)`
- `normalizeNumber(value: any, options: NormalizeNumberOptions = {})`
- `parseDataURL(data: string)`
- `pick<T extends Record, K extends keyof T>(source: T, keys: K[], mix: Record<string, any> = {})`
- `pipe<A, R>(value: A, f1: (arg: A) => R | Promise<R>, ...fns: Array<(arg: any) => any | Promise<any>>)`: [example](#pipe)
- `createPipe<A extends any[], R>(...fns: Array<(arg: any) => any | Promise<any>>)`
- `useTextMeasuring(input: HTMLInputElement, options: IOptionsTextWidth = { factor: 1 })`
- `rafWatch<T>(source: () => T, cb: TWatchCallback<T>, options: IWatchOptions = {})`
- `idleWatch<T>(source: () => T, cb: TWatchCallback<T>, options: IWatchOptions = {})`

### Web API

  `class CancelablePromise<T> implements Promise<T>`  
  `class Clipboard`  
  `class ClipboardUtils`  
  `class ExtendedMap<K, V> extends Map<K, V>`
  `class FileSystem`  
  `class Fullscreen`

- `createIntersectionObserver(target: Element, callback: (entry: IntersectionObserverEntry) => void, options?: IntersectionObserverInit)`
- `createIntersectionObserverMultiple(targets: Element[], callback: (entry: IntersectionObserverEntry) => void, options?: IntersectionObserverInit)`
- `createMutationObserver(target: Element, callback: (entry: MutationRecord) => void, options: MutationObserverInit)`
- `createMutationObserverMultiple(targets: Element[], callback: (entry: MutationRecord) => void, options?: MutationObserverInit)`
- `createResizeObserver(target: Element, callback: (entry: ResizeObserverEntry) => void)`
- `createResizeObserverMultiple(targets: Element[], callback: (entry: ResizeObserverEntry) => void)`
- `clearBrowserCache()`
- `createFileSystem()`
- `cookie<T extends Record<string, any>>(str: string, options: CookieOptions = {})`
- `cookieStringify<T extends Record<string, any>>(cookies: T)`
- `detectBrowser()`
- `detectBrowserSync()`
- `downloadFile(data: string | Blob | ArrayBuffer, options: DownloadOptions = {})`
- `getBrowserString(browserInfo?: BrowserInfo)`
- `getPixelRatio()`
- `isFeatureSupported(feature: string, browserInfo?: BrowserInfo)`
- `pickFiles(options: FileOptions = {})`
- `readFile(file: File, mode: ReadMode = 'text', onProgress?: (progress: ReadProgress) => void)`
- `useDragDrop(onFiles: (files: File[]) => void)`
- `useFileSystem(readAs: ReadMode)`
- `mimeToExt(mime: string)`
- `extToMime(ext: string)`
- `extendedMap<K extends PropertyKey, V>(obj: Record<K, V>)`
- `formatAsCurrency(value: number, locale: string, currencyCode: string)`
- `formatBytes(bytes: number, decimals: number = 2, useBinary: boolean = true, locale: string = 'en-US')`
- `formToQuery(form: HTMLFormElement)`
- `formToObj<T>(form: HTMLFormElement)`
- `mapFromObject<K extends PropertyKey, V>(obj: Record<K, V>)`
- `objToCookie<T extends {}>(obj: T)`: JSDoc example available
- `objToQuery<T extends {}>(obj: T)`
- `queryToObj<T>(q: string)`
- `uuid(): string`: JSDoc example available
- `hash(input: string | object, algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256')`: JSDoc example available
- `workerInit<TInput = unknown, TResult = unknown>(job: WorkerJob, options: WorkerOptions = {})`: executes `fn` in [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)

### DOM utilities - only essential, non-trivial functions

- `addEventListener(target: any, eventName: string, handler: EventListener, options?: AddEventListenerOptions)`
- `clickOutside(el: HTMLElement, callback: (e: MouseEvent, el: HTMLElement) => void)`
- `createElement<T extends keyof HTMLElementTagNameMap>(tag: T, options?: {})`
- `extractCoordinates(event: InteractionEvent)`
- `getAccumulatedScroll(element: Element)`
- `getDocumentCoordinates(event: InteractionEvent)`
- `getElementCoordinates(event: InteractionEvent)`
- `getParentChain(element: Element, stopAt: Element = document.documentElement)`
- `getScrollPosition(target: Element | Window = window)`
- `isElement(value: unknown)`
- `isElementInDOM(element: Element)`
- `isScrolledToBottom(element: Element, threshold: number = 0)`
- `isScrolledToTop(element: Element, threshold: number = 0)`
- `isTouchEvent(event: Event)`
- `removeElement(element: Element | null)`
- `replaceElement(oldElement: Element | null, newElement: Element)`
- `setScrollPosition(target: Element | Window, position: ScrollOffset, smooth: boolean = false)`
- `supportsObservers()`
- `traverseDOM(root: Element, visitor: ElementVisitor, depth: number = 0)`

*Popup*

- `getScreenMetrics()`
- `calculateCenteredPosition(width: number, height: number, shiftW: number = 0, shiftH: number = 44)`
- `popup(options: PopupOptions)`

### Animation

  `class Animator`  
  `class AnimatorChain<T = unknown>`  
  `class Timing`

### [PRNG](src/prng/README.md)

- `initializeBuffer(seed: string | number)`
- `foldBuffer(buffer: Uint8Array)`
- `rotl(x: number, k: number)`
- `createGenerator(algorithm: PRNGAlgorithm)`
- `useSeededGenerator(seed: string | number, options: SeededGeneratorOptions = {})`

## Examples

### truncate

```ts
import { truncate } from '@alekstar79/utils'

const str = 'JavaScript'
const truncated = truncate(str, 4)
console.log(truncated) // Java...

const truncated2 = truncate(str, 4, '?')
console.log(truncated2) // Java?
```

### chunk

```ts
import { chunk } from '@alekstar79/utils'

const arr = [1, 2, 3, 4, 5]
const chunked = chunk(arr, 2)
console.log(chunked)
/*
  [
    [1, 2],
    [3, 4],
    [5]
  ]
*/
```

### iterable

```ts
import { iterable } from '@alekstar79/utils'

const user = {
  name: 'Harry',
  age: 32
}

const iter = iterable<typeof user>(user)
for (const v of iter) {
  console.log(v)
}
/*
  Harry
  32
*/
```

### deepEqual

```ts
import { deepEqual } from '@alekstar79/utils'

const objA = {
  name: 'Harry',
  job: {
    position: 'Chief Engineer'
  }
}
const objB = {
  name: 'Harry',
  job: {
    position: 'Chief Engineer'
  }
}
console.log(deepEqual(objA, objB)) // true

// or `new Set()`
const mapA = new Map()
mapA.set('name', 'Harry')
const job = { position: 'Chief Engineer' }
mapA.set('job', job)

const mapB = new Map()
mapB.set('name', 'Harry')
mapB.set('job', job)
console.log(equal(mapA, mapB)) // true

const mapC = new Map()
mapC.set('name', 'Harry')
mapC.set('job', { position: 'Chief Engineer' })
console.log(equal(mapB, mapC)) // false

const objC = {
  0: 'Harry',
  1: 32
}
// just for demonstration purposes
const arr = ['Harry', 32] as unknown as typeof objC
console.log(equal(objC, arr)) // false

// can be used in `React.useEffect` or `React.memo`
```

### pipe

```ts
import { pipe, createPipe } from '@alekstar79/utils'

const toUpperCase = (str) => str.toUpperCase()
const removeSpaces = (str) => str.replace(/\s/g, '')
const addExclamation = (str) => str + '!'

const format = pipe(toUpperCase, removeSpaces, addExclamation)
console.log(format('hello world')) // HELLOWORLD!
```

### createPipe

```ts
const sayHiAndSleep = async (name: string) => {
  console.log(`Hi, ${name}!`)
  await sleep(1000)
  return name.toUpperCase()
}
const askQuestionAndSleep = async (name: string) => {
  console.log(`How are you, ${name}?`)
  await sleep(1000)
  return new TextEncoder()
    .encode(name) // Uint8Array
    .toString()
    .replaceAll(',', '-')
}
const sayBi = async (name: string) => {
  console.log(`Bye, ${name}.`)
}

const speak = createPipe(sayHiAndSleep, askQuestionAndSleep, sayBi)
speak('Harry')
/*
  Hi, Harry!
  // waiting for 1s
  How are you, HARRY?
  // waiting for 1s
  Bye, 72-65-82-82-89.
*/
```
