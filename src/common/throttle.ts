/**
 * Throttle function - execute at most once per delay
 * Uses setTimeout for consistent delays
 *
 * Problem: Some operations (scroll, resize) fire hundreds of times/sec
 * Solution: Throttle to execute max once per N milliseconds
 *
 * @param fn - Function to throttle
 * @param delayMs - Minimum milliseconds between calls
 * @returns Throttled function
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle(handleScroll, 100)
 * window.addEventListener('scroll', throttledScroll)
 * ```
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delayMs: number
): T {
  let lastCall = 0
  let pendingTimeoutId: ReturnType<typeof setTimeout> | null = null

  return ((...args: any[]) => {
    const now = Date.now()

    // If enough time has passed, execute immediately
    if (now - lastCall >= delayMs) {
      fn(...args)
      lastCall = now
      if (pendingTimeoutId) {
        clearTimeout(pendingTimeoutId)
        pendingTimeoutId = null
      }
    } else if (!pendingTimeoutId) {
      // Schedule execution for later
      const remaining = delayMs - (now - lastCall)
      pendingTimeoutId = setTimeout(() => {
        fn(...args)
        lastCall = Date.now()
        pendingTimeoutId = null
      }, remaining)
    }
  }) as T
}
