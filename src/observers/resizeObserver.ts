import { BaseObserver } from './baseObserver'

export class ResizeObserverWrapper extends BaseObserver<ResizeObserverEntry>
{
  protected initialize(): void
  {
    if (typeof ResizeObserver === 'undefined') {
      console.error('[ResizeObserver] API not supported')
      return
    }

    this.observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target as Element
        const callback = this.callbacks.get(target)
        callback?.(entry)
      })
    })
  }

  public getContentRect(element: Element)
  {
    const entries = this.takeRecords()
    const entry = entries.find(e => e.target === element)

    return entry?.contentRect ?? null
  }

  public getDimensions(element: Element): { width: number; height: number } | null
  {
    const rect = this.getContentRect(element)

    return rect
      ? { width: rect.width, height: rect.height }
      : null
  }
}

export function createResizeObserver(
  target: Element,
  callback: (entry: ResizeObserverEntry) => void
): ResizeObserverWrapper {
  const observer = new ResizeObserverWrapper(callback)
  observer.observe(target)
  return observer
}

export function createResizeObserverMultiple(
  targets: Element[],
  callback: (entry: ResizeObserverEntry) => void
): ResizeObserverWrapper {
  const observer = new ResizeObserverWrapper(callback)
  targets.forEach(target => observer.observe(target))
  return observer
}
