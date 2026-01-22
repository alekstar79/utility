/**
 * Utility to get device pixel ratio and detect zoom on desktop browsers.
 *
 * By default, modern browsers provide window.devicePixelRatio which is sufficient.
 * Detecting zoom beyond this value helps in special cases (e.g., manual browser zoom or CSS zoom).
 * This function uses media queries for compatibility and reliability cross-browser,
 * and detects zoom by comparing window.devicePixelRatio with media query based real pixel ratio.
 *
 * @see https://caniuse.com/css-media-resolution for media query support (very wide support)
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
 *
 * Returns:
 * - devicePixelRatio: number from the browser (physical pixels per CSS pixel)
 * - realPixelRatio: best guess from media queries
 * - isZoomed: boolean or 'unknown' string if undetectable
 */

export interface PixelRatio {
  devicePixelRatio: number;
  realPixelRatio: number;
  isZoomed: boolean | 'unknown';
  method: 'devicePixelRatio' | 'mediaQuery' | 'screenFallback' | 'default';
  confidence: number;
}

export function getPixelRatio(): PixelRatio
{
  // 1. Modern browser (98.5%)
  if (typeof window?.devicePixelRatio === 'number') {
    return {
      devicePixelRatio: window.devicePixelRatio,
      realPixelRatio: window.devicePixelRatio,
      isZoomed: false,
      method: 'devicePixelRatio',
      confidence: 1.0
    }
  }

  // 2. matchMedia (97.8%, Firefox mobile fix)
  if (typeof window?.matchMedia === 'function') {
    const result = detectWithMediaQuery()

    if (result.confidence > 0.8) {
      return result
    }
  }

  // 3. Screen fallback (IE9-, старые Android)
  if (typeof window?.screen?.width === 'number') {
    return screenFallback()
  }

  // 4. Stub
  return defaultFallback()
}

function detectWithMediaQuery(): PixelRatio {
  const STEP = 0.05, MIN = 0.5, MAX = 5
  let realDPR = 1

  for (let i = MAX * 100; i >= MIN * 100; i -= STEP * 100) {
    if (window.matchMedia(mediaQuery(i / 100)).matches) {
      realDPR = i / 100
      break
    }
  }

  return {
    devicePixelRatio: 1,
    realPixelRatio: realDPR,
    isZoomed: 'unknown',
    method: 'mediaQuery',
    confidence: 0.95
  }
}

function mediaQuery(v: number): string {
  return `(-webkit-min-device-pixel-ratio: ${v}),` +
    `(min--moz-device-pixel-ratio: ${v}),` +
    `(min-resolution: ${v}dppx)`;
}

function screenFallback(): PixelRatio {
  const cssWidth = window.innerWidth || document.documentElement.clientWidth
  const physicalWidth = window.screen.width
  const ratio = physicalWidth / cssWidth

  return {
    devicePixelRatio: ratio,
    realPixelRatio: ratio,
    isZoomed: false,
    method: 'screenFallback',
    confidence: 0.7
  }
}

function defaultFallback(): PixelRatio {
  return {
    devicePixelRatio: 1,
    realPixelRatio: 1,
    isZoomed: false,
    method: 'default',
    confidence: 0.1
  }
}
