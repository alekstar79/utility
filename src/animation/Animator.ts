import type { TimingOptions, UpdateCallback } from './types'
import { AnimatorChain } from './AnimatorChain'
import { Timing } from './Timing'

/**
 * Animation orchestrator
 */
export class Animator
{
  readonly timing: Timing
  private rafId: ReturnType<typeof requestAnimationFrame> | null = null
  private isCancelled: boolean = false

  constructor(options: TimingOptions)
  {
    this.timing = new Timing(options)
  }

  private cleanup()
  {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  animate<T>(
    target: T,
    update: UpdateCallback<T>,
    onComplete?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      const animateFrame = (timestamp: number) => {
        if (this.isCancelled) {
          resolve()
          return
        }

        const state = this.timing.update(timestamp)
        const continueAnimation = update(state, target) !== false

        if (state.isComplete || !continueAnimation) {
          onComplete?.()
          this.cleanup()
          resolve()
          return
        }

        this.rafId = requestAnimationFrame(animateFrame)
      }

      this.rafId = requestAnimationFrame(animateFrame)
    })
  }

  cancel()
  {
    this.isCancelled = true
    this.cleanup()
  }

  reset()
  {
    this.timing.reset()
    this.isCancelled = false
  }

  chain<T = unknown>(...timings: TimingOptions[]): AnimatorChain<T>
  {
    return new AnimatorChain(timings)
  }
}
