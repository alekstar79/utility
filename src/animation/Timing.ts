import { AnimationState, EasingFn, TimingOptions } from '@/animation/types'

/**
 * High-performance timing engine
 */
export class Timing
{
  private startTime: number | null = null
  public readonly duration: number
  public readonly delay: number
  public readonly iterations: number
  public readonly easing: EasingFn | null

  constructor(options: TimingOptions)
  {
    this.duration = options.duration
    this.delay = options.delay ?? 0
    this.iterations = options.iterations ?? 1
    this.easing = options.easing ?? null
  }

  update(timestamp: number): AnimationState
  {
    if (this.startTime == null) {
      this.startTime = timestamp

      return {
        progress: 0,
        normalizedProgress: 0,
        iteration: 0,
        elapsed: 0,
        isComplete: false,
      }
    }

    const elapsed = Math.max(0, timestamp - this.startTime - this.delay)
    const totalDuration = this.duration * this.iterations

    if (elapsed >= totalDuration) {
      return {
        progress: 1,
        normalizedProgress: 1,
        iteration: this.iterations,
        elapsed,
        isComplete: true
      }
    }

    const rawProgress = elapsed / this.duration
    const iteration = Math.floor(rawProgress)
    const normalizedProgress = rawProgress % 1

    const easedProgress = this.easing
      ? this.easing(normalizedProgress)
      : normalizedProgress

    return {
      progress: easedProgress,
      normalizedProgress: rawProgress % 1,
      iteration,
      elapsed,
      isComplete: false,
    }
  }

  reset()
  {
    this.startTime = null
  }
}
