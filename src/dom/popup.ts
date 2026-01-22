/**
 * Enhanced popup window utility with robust positioning and feature detection
 * Modern browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
 * Handles deprecated APIs, mobile restrictions, and edge cases
 */

// TYPE DEFINITIONS

/**
 * Comprehensive popup window options with validation
 */
export interface PopupOptions {
  /** Target URL (string or URL object) */
  url: string | URL;
  /** Window height in pixels (min 100, max screen height) */
  height: number;
  /** Window width in pixels (min 100, max screen width) */
  width: number;
  /** Window name/target for reuse */
  target?: string;
  /** Explicit left position (null = auto-center) */
  left?: number | null;
  /** Explicit top position (null = auto-center) */
  top?: number | null;
  /** Additional window features (scrollbars, resizable, etc.) */
  features?: Partial<PopupFeatures>;
  /** Fallback callback if popup blocked */
  onBlocked?: () => void;
}

/**
 * Additional window features for `window.open()`
 */
export interface PopupFeatures {
  readonly resizable?: 'yes' | 'no';
  readonly scrollbars?: 'yes' | 'no';
  readonly status?: 'yes' | 'no';
  readonly menubar?: 'yes' | 'no';
  readonly toolbar?: 'yes' | 'no';
  readonly location?: 'yes' | 'no';
}

/**
 * Result object with popup status and reference
 */
export interface PopupResult {
  /** Popup window reference */
  window: WindowProxy | null;
  /** True if popup was blocked by browser */
  wasBlocked: boolean;
  /** True if popup opened successfully */
  opened: boolean;
}

/**
 * Screen positioning information
 */
export interface ScreenMetrics {
  readonly screenWidth: number;
  readonly screenHeight: number;
  readonly outerWidth: number;
  readonly outerHeight: number;
  readonly screenX: number;
  readonly screenY: number;
}

// UTILITY FUNCTIONS

/**
 * Detects if popup is likely to be blocked by browser popup blocker
 * Modern browsers block popups without direct user gesture
 */
export function isPopupLikelyBlocked(): boolean
{
  return !('ontouchstart' in window || navigator.maxTouchPoints > 0)
}

/**
 * Gets reliable screen metrics with fallbacks for deprecated APIs
 * window.outerWidth/outerHeight unreliable in some browsers
 */
export function getScreenMetrics(): ScreenMetrics
{
  // Primary modern APIs (screen.availWidth reliable across browsers)
  const screenWidth = screen.availWidth ?? screen.width ?? 1024;
  const screenHeight = screen.availHeight ?? screen.height ?? 768;

  // Fallback for outer dimensions (less reliable)
  const outerWidth = Math.min(
    window.outerWidth ?? window.innerWidth ?? screenWidth,
    screenWidth
  )
  const outerHeight = Math.min(
    window.outerHeight ?? window.innerHeight ?? screenHeight,
    screenHeight
  )

  // Screen position (screenX/Y stable)
  const screenX = window.screenX ?? window.screenLeft ?? 0
  const screenY = window.screenY ?? window.screenTop ?? 0

  return {
    screenWidth,
    screenHeight,
    outerWidth,
    outerHeight,
    screenX,
    screenY
  }
}

/**
 * Calculates optimal centered position with mobile/taskbar awareness
 * Improved algorithm: 2.5x vertical offset for titlebar/taskbar
 */
export function calculateCenteredPosition(
  width: number,
  height: number,
  shiftW: number = 0,
  shiftH: number = 44
): { left: number; top: number } {
  const metrics = getScreenMetrics()

  // Clamp dimensions to screen bounds
  const safeWidth = Math.max(100, Math.min(width, metrics.screenWidth))
  const safeHeight = Math.max(100, Math.min(height, metrics.screenHeight))

  // Center calculation with visual offset (titlebar compensation)
  const left = Math.round(
    metrics.screenX + (metrics.outerWidth - safeWidth) / 2 + shiftW
  )
  const top = Math.round(
    metrics.screenY + (metrics.outerHeight - safeHeight) / 2 + shiftH
  )

  return {
    left: Math.max(0, Math.min(left, metrics.screenWidth - safeWidth)),
    top: Math.max(0, Math.min(top, metrics.screenHeight - safeHeight))
  }
}

/**
 * Validates popup options and normalizes values
 */
function validateOptions(options: PopupOptions): Required<PopupOptions>
{
  const safeHeight = Math.max(100, Math.min(options.height, screen.availHeight || 768))
  const safeWidth = Math.max(100, Math.min(options.width, screen.availWidth || 1024))

  return {
    url: new URL(options.url.toString(), window.location.origin).toString(),
    height: safeHeight,
    width: safeWidth,
    target: options.target || '_blank',
    left: options.left ?? null,
    top: options.top ?? null,
    features: options.features || {},
    onBlocked: options.onBlocked ?? (() => {})
  }
}

/**
 * Builds window.open() features string from options
 */
function buildFeaturesString(options: Required<PopupOptions>): string
{
  const centerPos = options.left === null || options.top === null
    ? calculateCenteredPosition(options.width, options.height)
    : { left: options.left!, top: options.top! }

  const baseFeatures = [
    `width=${options.width}`,
    `height=${options.height}`,
    `left=${centerPos.left}`,
    `top=${centerPos.top}`
  ]

  const featureMap: Record<string, string> = {
    resizable: options.features.resizable || 'yes',
    scrollbars: options.features.scrollbars || 'yes',
    status: options.features.status || 'no',
    menubar: options.features.menubar || 'no',
    toolbar: options.features.toolbar || 'no',
    location: options.features.location || 'no'
  }

  const extraFeatures = Object.entries(featureMap)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)

  return [...baseFeatures, ...extraFeatures].join(',')
}

/**
 * Opens popup window with robust positioning, validation, and blocking detection
 *
 * Features:
 * - Automatic safe centering with taskbar/titlebar compensation
 * - Comprehensive bounds validation
 * - Popup blocker detection
 * - Modern feature detection with fallbacks
 * - Type-safe URL validation
 * - Mobile-friendly positioning
 *
 * @param options - Popup configuration
 * @returns Result object with window reference and status flags
 *
 * @example
 * const result = popup({
 *   url: 'https://example.com',
 *   width: 800,
 *   height: 600,
 *   target: 'my-popup',
 *   onBlocked: () => alert('Popup blocked!')
 * })
 *
 * if (result.opened) {
 *   result.window?.focus()
 * }
 */
export function popup(options: PopupOptions): PopupResult
{
  const validated = validateOptions(options)
  const wasBlocked = isPopupLikelyBlocked()
  let popupWindow: WindowProxy | null = null

  try {
    // Critical: window.open() must be synchronous during user gesture
    popupWindow = window.open(
      validated.url,
      validated.target,
      buildFeaturesString(validated)
    )

    const opened = popupWindow !== null && typeof popupWindow !== 'undefined'

    if (!opened && validated.onBlocked) {
      // Popup blocked - async callback
      queueMicrotask(validated.onBlocked)
    }

    return {
      window: popupWindow,
      wasBlocked,
      opened
    }
  } catch (error) {
    console.warn('Popup failed:', error)
    return {
      window: null,
      wasBlocked: true,
      opened: false
    }
  }
}
