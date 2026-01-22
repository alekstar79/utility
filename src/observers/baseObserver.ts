import type { ObserverCallback, ObserverEntry, ObserverController } from './types'

export abstract class BaseObserver<T extends ObserverEntry> implements ObserverController
{
  protected observer: MutationObserver | IntersectionObserver | ResizeObserver | null = null
  protected observedElements = new Set<Element>()
  protected callbacks = new Map<Element, ObserverCallback<T>>()
  protected options: any

  constructor(callback: ObserverCallback<T>, options?: any)
  {
    this.options = options
    this.initialize()
    this.callback = callback
  }

  protected callback: ObserverCallback<T>

  protected abstract initialize(): void

  public observe(element: Element): void
  {
    if (!element || !(element instanceof Element)) return

    if (this.observedElements.has(element)) return

    this.callbacks.set(element, this.callback)
    this.observedElements.add(element)
    this.attachElement(element)
  }

  public unobserve(element: Element): void
  {
    if (!element || !this.observedElements.has(element)) return

    if ('unobserve' in this.observer! && typeof this.observer!.unobserve === 'function') {
      this.observer!.unobserve(element)
    } else if (this.observer instanceof MutationObserver) {
      this.observedElements.delete(element)
      this.callbacks.delete(element)
      this.reobserveMutationObserver()
      return
    }

    this.observedElements.delete(element)
    this.callbacks.delete(element)
  }

  public disconnect(): void
  {
    this.observer?.disconnect()
    this.observedElements.clear()
    this.callbacks.clear()
  }

  public takeRecords(): T[]
  {
    return (this.observer as any)?.takeRecords?.() ?? []
  }

  public isObserving(element: Element): boolean
  {
    return this.observedElements.has(element)
  }

  public getObservedCount(): number
  {
    return this.callbacks.size
  }

  protected attachElement(element: Element): void
  {
    if (this.observer instanceof MutationObserver) {
      if (this.observedElements.size === 1) {
        this.observer.observe(element, this.options as MutationObserverInit)
      }
    } else {
      this.observer?.observe?.(element)
    }
  }

  protected reobserveMutationObserver(): void
  {
    if (!(this.observer instanceof MutationObserver)) return

    this.observer.disconnect()

    const firstElement = this.observedElements.values().next().value

    if (firstElement) {
      this.observer.observe(firstElement, this.options as MutationObserverInit)
    }
  }
}
