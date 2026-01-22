/** Full range options */
export interface RangeOptions {
  start?: number;
  stop: number;
  step?: number;
  lazy?: boolean;
  inclusive?: boolean;
}

/** Partial options for factory */
export interface RangeLazyOptions {
  lazy?: boolean;
  inclusive?: boolean;
}

export type RangeResult = number[] | Generator<number>;

export interface RangeStats {
  length: number;
  isInfinite: boolean;
  stepDirection: 'forward' | 'backward' | 'zero';
}

const calculateRangeLength = (start: number, stop: number, step: number): number => {
  if (step === 0) {
    throw new Error('Step cannot be zero')
  }

  return Math.floor(Math.abs(stop - start) / Math.abs(step))
}

const validateRange = (start: number, stop: number, step: number): void => {
  if (step === 0) throw new Error('Step cannot be zero')
  if (Number.isNaN(start) || Number.isNaN(stop) || Number.isNaN(step)) {
    throw new Error('Range parameters must be finite numbers')
  }

  const maxLength = 1_000_000
  const length = calculateRangeLength(start, stop, step)

  if (length > maxLength) {
    throw new RangeError(`Range too large (${length} elements)`)
  }
}

/** Universal range */
export const range = (
  stop: number,
  startOrOptions?: number | RangeOptions,
  step?: number | RangeOptions,
  lazy = false
): RangeResult => {
  let start = 0
  let currentStep = 1
  let inclusive = false
  let finalLazy = lazy

  // Handling the options object
  if (typeof startOrOptions === 'object' && startOrOptions !== undefined && 'stop' in startOrOptions) {
    const opts = startOrOptions as RangeOptions
    start = opts.start ?? 0
    currentStep = opts.step ?? 1
    inclusive = !!opts.inclusive
    finalLazy = !!opts.lazy
  } else if (typeof step === 'object' && step !== undefined && 'stop' in step) {
    const opts = step as RangeOptions
    start = startOrOptions ?? 0
    currentStep = opts.step ?? 1
    inclusive = !!opts.inclusive
    finalLazy = !!opts.lazy
  } else {
    start = startOrOptions ?? 0
    currentStep = step ?? 1
  }

  validateRange(start, stop, currentStep)

  const end = inclusive ? stop + currentStep : stop

  // Lazy Generator
  if (finalLazy) {
    return function* () {
      let current = start

      while (currentStep > 0 ? current < end : current > end) {
        yield current
        current += currentStep
      }
    }()
  }

  // Array
  if (currentStep === 0 || calculateRangeLength(start, end, currentStep) <= 0) {
    return []
  }

  const length = calculateRangeLength(start, end, currentStep)
  const result = new Array(length)

  for (let i = 0; i < length; i++) {
    result[i] = start + i * currentStep
  }

  return result
}

/** Factory functions */
export const ranges = {
  // range(stop, start, step, lazy)
  from0: (stop: number, lazy = false): RangeResult => range(stop, 0, 1, lazy),
  progress: (steps: number, lazy = false): RangeResult =>
    range(1 + 1 / steps, 0, 1 / steps, lazy),

  infinite: function* (start = 0, step = 1): Generator<number> {
    let current = start

    while (true) {
      yield current
      current += step
    }
  },

  ofLength: (length: number, start = 0, step = 1, lazy = false): RangeResult =>
    range(start + length * step, start, step, lazy)
} as const

export const rangeStats = (result: RangeResult): RangeStats => {
  if (Symbol.iterator in Object(result)) {
    const gen = result as Generator<number>
    const first = gen.next().value
    const second = gen.next().value

    if (first === undefined) {
      return { length: 0, isInfinite: false, stepDirection: 'zero' }
    }
    if (second === undefined) {
      return { length: 1, isInfinite: false, stepDirection: 'zero' }
    }

    const direction = second > first ? 'forward' : 'backward'

    return {
      length: Infinity,
      isInfinite: true,
      stepDirection: direction
    }
  }

  return {
    length: (result as number[]).length,
    isInfinite: false,
    stepDirection: 'forward'
  }
}

export const rangeSum = (range: number[]): number => {
  let sum = 0

  for (let i = 0; i < range.length; i++) {
    sum += range[i]
  }

  return sum
}
