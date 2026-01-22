import { BaseObserver } from './baseObserver'

export class IntersectionObserverWrapper extends BaseObserver<IntersectionObserverEntry>
{
  private intersectionObserver: IntersectionObserver | null = null

  protected initialize(): void
  {
    if (typeof IntersectionObserver === 'undefined') {
      console.error('[IntersectionObserver] API not supported')
      return
    }

    const options = this.options || {
      root: null,
      rootMargin: '0px',
      threshold: 0
    }

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target as Element
        const callback = this.callbacks.get(target)
        callback?.(entry)
      })
    }, options)

    this.observer = this.intersectionObserver
  }

  public isIntersecting(element: Element): boolean
  {
    const entries = this.takeRecords()

    return entries.some(
      entry => entry.target === element && entry.isIntersecting
    )
  }

  public getIntersectionRatio(element: Element): number
  {
    const entries = this.takeRecords()
    const entry = entries.find(e => e.target === element)

    return entry?.intersectionRatio ?? 0
  }
}

export function createIntersectionObserver(
  target: Element,
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserverWrapper {
  const observer = new IntersectionObserverWrapper(callback, options)
  observer.observe(target)
  return observer
}

export function createIntersectionObserverMultiple(
  targets: Element[],
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserverWrapper {
  const observer = new IntersectionObserverWrapper(callback, options)
  targets.forEach(target => observer.observe(target))
  return observer
}
