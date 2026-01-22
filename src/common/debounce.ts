/**
 * Debounce function - delay execution until calls stop
 * Useful for search inputs, resize calculations
 *
 * Problem: Event fires multiple times, want to wait until it stops
 * Solution: Debounce waits for silence period before executing
 *
 * @param fn - Function to debounce
 * @param delayMs - Delay after last call before execution
 * @returns Debounced function with cancel() method
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce(search, 300)
 * input.addEventListener('input', debouncedSearch)
 * debouncedSearch.cancel() // Cancel pending execution
 * ```
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delayMs: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debounced = ((...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delayMs);
  }) as T & { cancel: () => void }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debounced
}
