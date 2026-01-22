export type { ObserverEntry, ObserverCallback, ObserverController } from './types'

/**
 * @example
 * import {
 *   createMutationObserver,
 *   createIntersectionObserver,
 *   createResizeObserver
 * } from './index.js'
 *
 * const target = document.getElementById('target')!
 *
 * // MutationObserver
 * const mutObs = createMutationObserver(target, (entry) => {
 *   console.log('DOM changed:', entry.type)
 * }, { childList: true, subtree: true })
 *
 * // IntersectionObserver
 * const intObs = createIntersectionObserver(target, (entry) => {
 *   console.log('Intersecting:', entry.isIntersecting)
 * }, { threshold: 0.5 })
 *
 * // ResizeObserver
 * const resObs = createResizeObserver(target, (entry) => {
 *   console.log('Dimensions:', resObs.getDimensions(target))
 * })
 *
 * // Multiple elements
 * const elements = document.querySelectorAll('.item');
 * const multiMutObs = createMutationObserverMultiple(
 *   Array.from(elements),
 *   (entry) => console.log('Mutated')
 * )
 *
 * // Cleanup
 * mutObs.disconnect()
 * intObs.unobserve(target)
 * resObs.disconnect()
 */

export { BaseObserver } from './baseObserver.ts'

export {
  MutationObserverWrapper,
  createMutationObserver,
  createMutationObserverMultiple
} from './mutationObserver'

export {
  IntersectionObserverWrapper,
  createIntersectionObserver,
  createIntersectionObserverMultiple
} from './intersectionObserver'

export {
  ResizeObserverWrapper,
  createResizeObserver,
  createResizeObserverMultiple
} from './resizeObserver'
