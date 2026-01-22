export type TWatchCallback<T = any> = (newVal: T, oldVal?: T) => void;

export interface IWatchOptions {
  immediate?: boolean;
  batch?: boolean;
  deep?: boolean;
}

export interface IWatcher {
  source: () => any;
  callback: TWatchCallback;
  lastValue: any;
  deep: boolean;
}

function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object'
}

function random(length: number = 7): string {
  return Math.random().toString(36).replace('.','').substring(0, length)
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (isObject(a) && isObject(b)) {
    const ka = Object.keys(a)
    const kb = Object.keys(b)

    if (ka.length !== kb.length) {
      return false
    }

    for (const k of ka) {
      if (!deepEqual(a[k], b[k])) {
        return false
      }
    }

    return true
  }

  return false
}

export class RAFBatcher
{
  private updates: Map<string, () => void> = new Map()
  private frameId: number | null = null
  private isProcessing = false

  private process(): void
  {
    this.isProcessing = true
    this.frameId = null

    const updates = Array.from(this.updates.values())
    this.updates.clear()

    // Process all updates in batch
    updates.forEach(update => {
      try {
        update()
      } catch (error) {
        console.error('Error in batched update:', error)
      }
    })

    this.isProcessing = false

    // If new updates arrived during processing, schedule next frame
    if (this.updates.size > 0) {
      this.frameId = requestAnimationFrame(() => this.process())
    }
  }

  schedule(key: string, update: () => void): void
  {
    this.updates.set(key, update)

    if (!this.frameId && !this.isProcessing) {
      this.frameId = requestAnimationFrame(() => this.process())
    }
  }

  cancel(): void
  {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }

    this.updates.clear()
    this.isProcessing = false
  }
}

export class Watcher
{
  private batcher: RAFBatcher
  private watchers: Map<string, IWatcher> = new Map()

  constructor()
  {
    this.watch = this.watch.bind(this)
    this.destroy = this.destroy.bind(this)
    this.batcher = new RAFBatcher()
  }

  private update(): void
  {
    this.watchers.forEach((watcher, key) => {
      const newValue = watcher.source()
      const changed = watcher.deep
        ? !deepEqual(newValue, watcher.lastValue)
        : newValue !== watcher.lastValue

      if (changed) {
        const oldValue = watcher.lastValue
        watcher.lastValue = newValue

        this.batcher.schedule(key, () => {
          watcher.callback(newValue, oldValue)
        })
      }
    })
  }

  watch<T>(
    source: () => T,
    callback: (value: T, oldValue: T) => void,
    options: IWatchOptions = {}
  ): () => void {
    let lastValue = source()
    let stopped = false
    let key = random()

    if (options.immediate) {
      callback(lastValue, lastValue)
    }

    const watcher = {
      deep: Boolean(options.deep),
      source,
      callback,
      lastValue
    }

    this.watchers.set(key, watcher)

    const tick = () => {
      if (stopped) return

      this.update()
      Promise.resolve().then(() => {
        if (!stopped) tick()
      })
    }

    tick()

    return () => {
      stopped = true
      this.watchers.delete(key)
    }
  }

  destroy(): void
  {
    this.watchers.clear()
    this.batcher.cancel()
  }
}

export function rafWatch<T>(
  source: () => T,
  cb: TWatchCallback<T>,
  options: IWatchOptions = {}
): () => void {
  const { immediate = false, deep = false } = options

  let rafId: ReturnType<typeof requestAnimationFrame> | null = null
  let oldValue: any = source()

  if (immediate) {
    cb(oldValue, oldValue)
  }

  const check = () => {
    const newValue = source()
    const changed = deep
      ? !deepEqual(newValue, oldValue)
      : newValue !== oldValue

    if (changed) {
      cb(newValue, oldValue)
      oldValue = newValue
    }
  }

  const tick = () => {
    rafId = requestAnimationFrame(tick)
    check()
  }

  tick()

  return () => {
    rafId && cancelAnimationFrame(rafId)
    rafId = null
  }
}

export function idleWatch<T>(
  source: () => T,
  cb: TWatchCallback<T>,
  options: IWatchOptions = {}
): () => void {
  const { immediate = false, deep = false } = options

  let ricId: ReturnType<typeof requestIdleCallback> | null = null
  let oldValue: any = source()

  if (immediate) {
    cb(oldValue, oldValue)
  }

  const check = () => {
    const newValue = source()
    const changed = deep
      ? !deepEqual(newValue, oldValue)
      : newValue !== oldValue

    if (changed) {
      cb(newValue, oldValue)
      oldValue = newValue
    }
  }

  const tick = () => {
    ricId = requestIdleCallback(tick)
    check()
  }

  tick()

  return () => {
    ricId && cancelIdleCallback(ricId)
    ricId = null
  }
}
