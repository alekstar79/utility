import { BaseObserver } from './baseObserver'

export class MutationObserverWrapper extends BaseObserver<MutationRecord>
{
  protected override initialize(): void
  {
    if (typeof MutationObserver === 'undefined') {
      console.error('[MutationObserver] API not supported')
      return
    }

    this.observer = new MutationObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target as Element
        const callback = this.callbacks.get(target)
        callback?.(entry)
      })
    })
  }
}

export function createMutationObserver(
  target: Element,
  callback: (entry: MutationRecord) => void,
  options: MutationObserverInit = {
    childList: true,
    attributes: true,
    subtree: true,
    characterData: false
  }
): MutationObserverWrapper {
  const observer = new MutationObserverWrapper(callback, options)
  observer.observe(target)
  return observer
}

export function createMutationObserverMultiple(
  targets: Element[],
  callback: (entry: MutationRecord) => void,
  options?: MutationObserverInit
): MutationObserverWrapper {
  const observer = new MutationObserverWrapper(callback, options)
  targets.forEach(target => observer.observe(target))
  return observer
}
