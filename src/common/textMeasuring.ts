import { createMutationObserver } from '../observers/mutationObserver'
import { idleWatch } from './watch'

export interface IOptionsTextWidth {
  factor: number;
}

export interface ReturnTextWidth {
  measure: () => number;
  destroy: () => void;
  get value(): ICache;
}

interface ICache {
  font: string;
  raw: string;
  factor: number;
  width: number;
}

function createObserver(input: HTMLInputElement, callback: Function): () => void
{
  const callbackWrapper = (_?: HTMLElementEventMap['input']) => callback?.()
  const mutationHandler = ({ type, attributeName }: MutationRecord) => {
    if (type !== 'attributes') return
    if (['style', 'class'].includes(attributeName!)) {
      callbackWrapper()
    }
  }

  const observer = createMutationObserver(input, mutationHandler, {
    attributeFilter: ['style', 'class'],
    attributes: true
  })

  input.addEventListener('input', callbackWrapper)

  return () => {
    input.removeEventListener('input', callbackWrapper)
    observer.disconnect()
  }
}

/**
 * Measures width of an input's text, with caching of measurements and font style.
 * Optimized to avoid redundant canvas measureText calls for unchanged text/font.
 * Returns memoized function for repeated calls.
 *
 * @param {HTMLInputElement} input - HTMLInputElement to measure text from
 * @param {IOptionsTextWidth} options - Optional scale factor for width (default 1)
 * @returns {(function(): number)} - Function that returns current text width in pixels
 */
export function useTextMeasuring(
  input: HTMLInputElement,
  options: IOptionsTextWidth = { factor: 1 }
): ReturnTextWidth {
  if (!input || input.tagName !== 'INPUT') {
    throw new TypeError('Expected HTMLInputElement')
  }

  const value: ICache = { font: '', raw: '', factor: 1, width: 0 }
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const updateFont = (): void => {
    const { fontWeight, fontSize, fontFamily } = window.getComputedStyle(input)
    const font = `${fontWeight} ${fontSize} ${fontFamily}`

    if (font !== value.font) {
      value.raw = ''
      value.font = font
      ctx.font = font
    }
  }

  const measure = (): number => {
    updateFont()

    if (input.value === value.raw && options.factor === value.factor) {
      return value.width * value.factor
    }

    value.raw = input.value
    value.factor = options.factor
    const metrics = ctx.measureText(value.raw)
    value.width = metrics.width

    return value.width * value.factor
  }

  const stopOptWatch = idleWatch(() => options.factor, measure)
  const stopValWatch = createObserver(input, measure)

  measure()

  return {
    get value() { return value },
    measure,
    destroy: () => {
      stopOptWatch()
      stopValWatch()
    }
  }
}
