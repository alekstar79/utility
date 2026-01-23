/**
 * DOM utilities - only essential, non-trivial functions
 * TypeScript implementation with correct logic and zero dependencies
 *
 * Focused on real problems:
 * - Event coordinate calculations (multi-event type handling)
 * - Scroll offset in nested containers
 * - Safe DOM mutations and queries
 * - Performance-critical observer utilities
 *
 * Browser Support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
 */

// TYPE DEFINITIONS

/**
 * Represents a 2D point in document coordinate space
 */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * Represents scroll offset information
 */
export interface ScrollOffset {
  readonly left: number;
  readonly top: number;
}

/**
 * Visitor pattern callback for tree traversal (returns false to stop)
 */
export type ElementVisitor = (element: Element, depth: number) => boolean | void;

/**
 * Touch or mouse event
 */
export type InteractionEvent = TouchEvent | MouseEvent | PointerEvent;

/**
 * Element query result - null-safe type
 */
export type SafeElement<T extends Element = Element> = T | null;

// TYPE GUARDS AND VALIDATION

/**
 * Type guard to check if value is a valid DOM element
 */
export function isElement(value: unknown): value is Element {
  return value instanceof Element
}

/**
 * Check if element is currently attached to DOM
 */
export function isElementInDOM(element: Element): boolean {
  return document.documentElement.contains(element)
}

/**
 * Type guard for TouchEvent (handles both active touches and changed touches)
 */
export function isTouchEvent(event: Event): event is TouchEvent {
  return 'touches' in event || 'changedTouches' in event
}

/**
 * Check if browser supports modern observer APIs
 * Required: IntersectionObserver, ResizeObserver
 */
export function supportsObservers(): boolean {
  return (
    typeof IntersectionObserver !== 'undefined' &&
    typeof ResizeObserver !== 'undefined'
  )
}

// COORDINATE SYSTEM UTILITIES

/**
 * Extract actual coordinates from any interaction event type
 * Handles Touch -> MouseEvent fallback and pointer-events
 *
 * Problem: Different event types expose coordinates differently
 * Solution: Unified extraction with type-based fallbacks
 *
 * @param event - TouchEvent, MouseEvent, or PointerEvent
 * @returns Always returns valid coordinates or {0,0}
 *
 * @example
 * ```typescript
 * const coords = extractCoordinates(event)
 * // Works with touch, mouse, or pointer events
 * ```
 */
export function extractCoordinates(event: InteractionEvent): Point {
  // Try to get touches first (active touches)
  if (isTouchEvent(event) && (event as TouchEvent).touches?.length > 0) {
    const touch = (event as TouchEvent).touches[0]
    return { x: touch.clientX, y: touch.clientY }
  }

  // Fallback to changedTouches for touch end/cancel
  if (isTouchEvent(event) && (event as TouchEvent).changedTouches?.length > 0) {
    const touch = (event as TouchEvent).changedTouches[0]
    return { x: touch.clientX, y: touch.clientY }
  }

  // Handle mouse and pointer events
  if ('clientX' in event && 'clientY' in event) {
    return { x: event.clientX, y: event.clientY }
  }

  // Fallback for unsupported event types
  return { x: 0, y: 0 }
}

/**
 * Calculate accumulated scroll from element through all scrollable ancestors
 * Including support for nested containers and fixed positioned elements
 *
 * Problem: element.getBoundingClientRect() doesn't account for scroll in ancestor containers
 * Solution: Traverse parent tree, accumulating scroll offsets until fixed element
 *
 * @param element - Starting element to calculate scroll for
 * @returns Total scroll offset from window to element
 *
 * @example
 * ```typescript
 * const scroll = getAccumulatedScroll(element)
 * const absoluteX = event.clientX + scroll.left
 * const absoluteY = event.clientY + scroll.top
 * ```
 */
export function getAccumulatedScroll(element: Element): ScrollOffset {
  let left = 0
  let top = 0
  let current: Element | null = element

  while (current && (current.parentNode || (current as any).host)) {
    // Move to parent (handle ShadowDOM with .host)
    current = (current.parentNode as Element) || (current as any).host

    if (!current || current === document.documentElement) {
      break
    }

    if (!isElement(current)) {
      continue
    }

    // Add scroll from this container (if it's scrollable)
    left += current.scrollLeft ?? 0
    top += current.scrollTop ?? 0

    // Stop at fixed positioned elements (they don't participate in scroll)
    const computed = window.getComputedStyle(current)
    if (computed.position === 'fixed') {
      break
    }
  }

  // Add window scroll
  left += window.scrollX || window.pageXOffset || 0
  top += window.scrollY || window.pageYOffset || 0

  return { left, top }
}

/**
 * Calculate point in document coordinate space from event
 * Accounts for scroll in nested containers
 *
 * Problem: event.clientX/Y doesn't account for scroll in parent containers
 * Solution: Combine event coordinates with accumulated scroll offset
 *
 * @param event - Interaction event from target element
 * @returns Point in absolute document coordinates
 *
 * @example
 * ```typescript
 * element.addEventListener('click', (event) => {
 *   const point = getDocumentCoordinates(event)
 *   console.log(`Absolute position: ${point.x}, ${point.y}`)
 * })
 * ```
 */
export function getDocumentCoordinates(event: InteractionEvent): Point {
  const target = event.target

  if (!isElement(target)) {
    return { x: 0, y: 0 }
  }

  const eventCoords = extractCoordinates(event)
  const scroll = getAccumulatedScroll(target)

  return {
    x: eventCoords.x + scroll.left,
    y: eventCoords.y + scroll.top,
  }
}

/**
 * Calculate point relative to target element (element coordinate space)
 * Useful for drawing operations, drag calculations
 *
 * Problem: Need to know position within element, not viewport or document
 * Solution: Use getBoundingClientRect to offset from element origin
 *
 * @param event - Interaction event
 * @returns Point relative to element (0,0 is element top-left)
 *
 * @example
 * ```typescript
 * canvas.addEventListener('mousemove', (event) => {
 *   const point = getElementCoordinates(event);
 *   drawPixel(point.x, point.y);
 * });
 * ```
 */
export function getElementCoordinates(event: InteractionEvent): Point {
  const target = event.target

  if (!isElement(target)) {
    return { x: 0, y: 0 }
  }

  const eventCoords = extractCoordinates(event)
  const rect = target.getBoundingClientRect()

  return {
    x: eventCoords.x - rect.left,
    y: eventCoords.y - rect.top,
  }
}

// SCROLL POSITION MANAGEMENT

/**
 * Get current scroll position (window or element)
 * Handles cross-browser compatibility quirks
 *
 * @param target - window or scrollable element (defaults to window)
 * @returns Current scroll offset
 */
export function getScrollPosition(target: Element | Window = window): ScrollOffset {
  if (target === window) {
    return {
      left: window.scrollX || window.pageXOffset || 0,
      top: window.scrollY || window.pageYOffset || 0,
    }
  }

  if (isElement(target)) {
    return {
      left: target.scrollLeft,
      top: target.scrollTop,
    }
  }

  return { left: 0, top: 0 }
}

/**
 * Set scroll position with proper boundary validation
 * Prevents invalid scroll values and handles smooth scrolling
 *
 * Problem: Setting scroll beyond container limits is silently ignored or causes issues
 * Solution: Validate bounds, clamp values, support smooth scrolling option
 *
 * @param target - Element or window to scroll
 * @param position - Target coordinates
 * @param smooth - Use smooth scroll behavior (CSS)
 *
 * @example
 * ```typescript
 * setScrollPosition(element, { top: 500, left: 0 }, true) // Smooth scroll
 * ```
 */
export function setScrollPosition(
  target: Element | Window,
  position: Partial<ScrollOffset>,
  smooth: boolean = false
): void {
  const { left = 0, top = 0 } = position

  if (target === window) {
    const maxLeft = document.documentElement.scrollWidth - window.innerWidth
    const maxTop = document.documentElement.scrollHeight - window.innerHeight

    const validLeft = Math.max(0, Math.min(left, maxLeft))
    const validTop = Math.max(0, Math.min(top, maxTop))

    if (smooth) {
      target.scrollTo({ left: validLeft, top: validTop, behavior: 'smooth' })
    } else {
      target.scrollTo(validLeft, validTop)
    }
  } else if (isElement(target)) {
    const maxLeft = target.scrollWidth - target.clientWidth
    const maxTop = target.scrollHeight - target.clientHeight

    const validLeft = Math.max(0, Math.min(left, maxLeft))
    const validTop = Math.max(0, Math.min(top, maxTop))

    target.scrollLeft = validLeft
    target.scrollTop = validTop
  }
}

/**
 * Check if element is scrolled to end (useful for infinite scroll detection)
 * Accounts for floating-point precision
 *
 * Problem: Simple comparison doesn't account for rounding errors
 * Solution: Use threshold to handle floating-point imprecision
 *
 * @param element - Scrollable element
 * @param threshold - Pixels from end to consider as "at end" (default 0)
 * @returns True if scrolled to or past threshold
 *
 * @example
 * ```typescript
 * if (isScrolledToBottom(container, 100)) {
 *   loadMoreItems()
 * }
 * ```
 */
export function isScrolledToBottom(element: Element, threshold: number = 0): boolean {
  const diff = element.scrollHeight - element.clientHeight - element.scrollTop
  return diff <= threshold
}

/**
 * Check if element is scrolled to start
 *
 * @param element - Scrollable element
 * @param threshold - Pixels from start to consider as "at start"
 * @returns True if scrolled to or before threshold
 */
export function isScrolledToTop(element: Element, threshold: number = 0): boolean {
  return element.scrollTop <= threshold
}

// DOM TRAVERSAL

/**
 * Traverse DOM tree depth-first with visitor pattern
 * Allows early exit with return false
 *
 * @param root - Root element
 * @param visitor - Callback called for each element
 * @param depth - Current depth (used internally)
 *
 * @example
 * ```typescript
 * traverseDOM(container, (el, depth) => {
 *   if (depth > 3) return false // Stop deep traversal
 *   console.log(el.tagName)
 * })
 * ```
 */
export function traverseDOM(
  root: Element,
  visitor: ElementVisitor,
  depth: number = 0
): void {
  if (!isElement(root)) return

  const shouldContinue = visitor(root, depth)
  if (shouldContinue === false) return

  for (const child of Array.from(root.children)) {
    traverseDOM(child, visitor, depth + 1)
  }
}

/**
 * Get all parent elements up to document root
 * Useful for context menu or breadcrumb generation
 *
 * @param element - Starting element
 * @param stopAt - Stop traversal at this element (defaults to document)
 * @returns Array of parents (closest first)
 */
export function getParentChain(
  element: Element,
  stopAt: Element = document.documentElement
): Element[] {
  const chain: Element[] = []
  let current = element.parentElement

  while (current && current !== stopAt) {
    chain.push(current)
    current = current.parentElement
  }

  return chain
}

// EVENT UTILITIES (Listener management with cleanup)

/**
 * Attach event listener with automatic cleanup function
 * Prevents memory leaks from listeners
 *
 * @param target - Element or Window
 * @param eventName - Event name (e.g., 'click', 'scroll')
 * @param handler - Event handler
 * @param options - EventListener options (capture, passive)
 * @returns Function to remove listener
 *
 * @example
 * ```typescript
 * const unsubscribe = addEventListener(window, 'scroll', handleScroll)
 * // Later:
 * unsubscribe()
 * ```
 */
export function addEventListener<K extends keyof WindowEventMap>(
  target: Window,
  eventName: K,
  handler: (this: Window, event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions
): () => void

export function addEventListener<K extends keyof DocumentEventMap>(
  target: Document,
  eventName: K,
  handler: (this: Document, event: DocumentEventMap[K]) => void,
  options?: AddEventListenerOptions
): () => void

export function addEventListener<K extends keyof HTMLElementEventMap>(
  target: Element,
  eventName: K,
  handler: (this: Element, event: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions
): () => void

export function addEventListener(
  target: any,
  eventName: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): () => void {
  target.addEventListener(eventName, handler, options)

  return () => {
    target.removeEventListener(eventName, handler, options)
  }
}

// ELEMENT CREATION AND MANIPULATION

/**
 * Create element with classes, attributes, and content
 *
 * @param tag - HTML tag name
 * @param options - Configuration
 * @returns Created element
 *
 * @example
 * ```typescript
 * const btn = createElement('button', {
 *   className: 'btn btn-primary',
 *   attributes: { type: 'submit', disabled: 'true' },
 *   text: 'Submit'
 * })
 * ```
 */
export function createElement<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  options?: {
    className?: string | string[];
    attributes?: Record<string, string>;
    text?: string;
    html?: string;
  }
): HTMLElementTagNameMap[T] {
  const element = document.createElement(tag)

  if (options?.className) {
    const classes = Array.isArray(options.className)
      ? options.className
      : [options.className]
    element.classList.add(...classes)
  }

  if (options?.attributes) {
    Object.entries(options.attributes)
      .forEach(([key, value]) => {
        element.setAttribute(key, value)
      })
  }

  if (options?.text) {
    element.textContent = options.text
  } else if (options?.html) {
    element.innerHTML = options.html
  }

  return element
}

/**
 * Remove element from DOM
 *
 * @param element - Element to remove
 * @returns True if element was removed
 */
export function removeElement(element: Element | null): boolean {
  if (!element?.parentNode) return false
  element.parentNode.removeChild(element)
  return true
}

/**
 * Replace element with another
 *
 * @param oldElement - Element to replace
 * @param newElement - Replacement element
 * @returns True if replacement was successful
 */
export function replaceElement(
  oldElement: Element | null,
  newElement: Element
): boolean {
  if (!oldElement?.parentNode) return false
  oldElement.parentNode.replaceChild(newElement, oldElement)
  return true
}

/**
 * A function for tracking clicks outside the specified element.
 *
 * @param {HTMLElement} el - Element outside which of the click will be tracked.
 * @param {(e: MouseEvent, el: HTMLElement) => void} callback - The callback function.
 */
export function clickOutside(el: HTMLElement, callback: (e: MouseEvent, el: HTMLElement) => void)
{
  const check = (e: MouseEvent, target: HTMLElement) => {
    if (el !== target && !el.contains(target)) {
      callback(e, target)
    }
  }

  document.body.addEventListener('pointerdown', e => {
    const target = e.target as HTMLElement

    if (target.shadowRoot?.children.length) {
      return check(e, e.composedPath()[0] as HTMLElement)
    }

    check(e, target)
  })
}
