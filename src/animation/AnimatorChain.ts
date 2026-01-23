import { TimingOptions, UpdateCallback } from '@/animation/types'
import { Animator } from '@/animation/Animator'

/**
 * Fluent animation chaining API
 *
 * @example
 * // Sequential chain
 * const chain = AnimatorChain.create(
 *   { duration: 500, iterations: 2 },
 *   { duration: 300, delay: 100 },
 *   { duration: 400 },
 * )
 *
 * await chain.animate(
 *   myElement,
 *   (state, element) => {
 *     element.style.transform = `scale(${state.progress})`
 *   }
 * )
 *
 * // In parallel
 * await Promise.all(chain.parallel(element, updateFn))
 */
export class AnimatorChain<T = unknown>
{
  private readonly timings: TimingOptions[]

  static create<T = unknown>(...timings: TimingOptions[]): AnimatorChain<T>
  {
    return new AnimatorChain(timings)
  }

  constructor(timings: TimingOptions[])
  {
    this.timings = timings
  }

  async animate(target: T, update: UpdateCallback<T>): Promise<void>
  {
    for (let i = 0; i < this.timings.length; i++) {
      const timing = this.timings[i]
      const animator = new Animator(timing)

      await animator.animate(target, (state) => {
        // Total chain progress: current animation + contribution to the chain
        const chainProgress = (i + state.progress) / this.timings.length
        return update({ ...state, progress: chainProgress }, target)
      })
    }
  }

  /**
   * Parallel animation (all at the same time)
   */
  parallel(target: T, update: UpdateCallback<T>): Promise<void>[]
  {
    return this.timings.map((timing, index) => {
      const animator = new Animator(timing)

      return animator.animate(target, (state) => {
        const chainProgress = index / this.timings.length + state.progress / this.timings.length;
        return update({ ...state, progress: chainProgress }, target)
      })
    })
  }
}
