import { AnimationState, Animator, AnimatorChain, Timing } from '@/animation'
import { EASING } from '@/animation/easing'

describe('Timing', () => {
  it('calculates correct progress for single iteration', () => {
    const timing = new Timing({ duration: 1000 })
    timing.update(0)
    const state = timing.update(500)
    expect(state.progress).toBeCloseTo(0.5)
    expect(state.iteration).toBe(0)
    expect(state.isComplete).toBe(false)
  })

  it('handles multiple iterations correctly', () => {
    const timing = new Timing({ duration: 500, iterations: 4 })
    timing.update(0)
    const state = timing.update(1500)
    expect(state.iteration).toBe(3)
    expect(state.isComplete).toBe(false)
  })

  it('completes on exact total duration', () => {
    const timing = new Timing({ duration: 500, iterations: 3 })
    timing.update(0)
    const state = timing.update(1500)
    expect(state.isComplete).toBe(true)
    expect(state.iteration).toBe(3)
  })

  it('AnimatorChain - sequential', async () => {
    const chain = AnimatorChain.create(
      { duration: 100 },
      { duration: 200 },
      { duration: 100 },
    )

    const updates: number[] = []
    await chain.animate({} as any, (state: AnimationState) => {
      updates.push(state.progress)
      return true
    })

    expect(updates.length).toBeGreaterThan(10)
  })

  it('Animator - single animation', async () => {
    const animator = new Animator({ duration: 100 })
    let called = 0

    await animator.animate({} as any, () => {
      called++
      return true
    })

    expect(called).toBeGreaterThan(1)
  })
})

describe('Timing - additional cases', () => {
  it('considers delay and applies easing', () => {
    const timing = new Timing({ duration: 1000, delay: 200, easing: EASING.easeInQuad })
    timing.update(0)

    const beforeDelay = timing.update(100)
    expect(beforeDelay.progress).toBe(0) // delay has not passed yet

    const mid = timing.update(700) // elapsed = 500
    // normalizedProgress = 0.5, easeInQuad -> 0.25
    expect(mid.progress).toBeCloseTo(0.25, 3)
    expect(mid.iteration).toBe(0)
    expect(mid.isComplete).toBe(false)
  })

  it('resets start and progress', () => {
    const timing = new Timing({ duration: 500 })
    timing.update(0)
    timing.update(250)

    timing.reset()
    const state = timing.update(10)
    expect(state.progress).toBe(0)
    expect(state.iteration).toBe(0)
    expect(state.isComplete).toBe(false)
  })
})

describe('Animator frame management', () => {
  let originalRaf: typeof requestAnimationFrame
  let originalCancelRaf: typeof cancelAnimationFrame
  let queue: Array<(ts: number) => void>

  beforeAll(() => {
    originalRaf = global.requestAnimationFrame
    originalCancelRaf = global.cancelAnimationFrame
  })

  beforeEach(() => {
    queue = []
    // simplified RAF: put the callback in the queue, return the id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      queue.push(cb)
      return queue.length as any
    }) as typeof requestAnimationFrame
    global.cancelAnimationFrame = jest.fn()
  })

  afterEach(() => {
    global.requestAnimationFrame = originalRaf
    global.cancelAnimationFrame = originalCancelRaf
  })

  const runNext = (ts: number) => {
    const cb = queue.shift()
    if (cb) cb(ts)
  }

  it('cancel interrupts the animation and calls cleanup', async () => {
    const animator = new Animator({ duration: 100 })
    const update = jest.fn(() => true)

    const promise = animator.animate({} as any, update)

    runNext(0)   // first frame
    expect(update).toHaveBeenCalledTimes(1)

    animator.cancel()
    runNext(16)  // next frame completes the promise due to isCancelled

    await promise
    expect(global.cancelAnimationFrame).toHaveBeenCalledTimes(1)
  })

  it('reset removes the cancel flag', async () => {
    const animator = new Animator({ duration: 100 })
    animator.cancel()
    animator.reset()

    const update = jest.fn(() => false) // finish immediately
    const promise = animator.animate({} as any, update)
    runNext(0)

    await promise
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('chain creates AnimatorChain', () => {
    const animator = new Animator({ duration: 10 })
    const chain = animator.chain({ duration: 5 }, { duration: 15 })
    expect(chain).toBeInstanceOf(AnimatorChain)
  })
})

describe('AnimatorChain parallel', () => {
  it('correctly calculates the cumulative progress for parallel', async () => {
    const chain = AnimatorChain.create(
      { duration: 100 },
      { duration: 100 }
    )

    const animateSpy = jest
      .spyOn(Animator.prototype, 'animate')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation(function (this: any, _target, fn) {
        // emulating a single frame with progress 0.5
        fn({
          progress: 0.5,
          normalizedProgress: 0.5,
          iteration: 0,
          elapsed: 50,
          isComplete: false
        }, {} as any)
        return Promise.resolve()
      })

    const updates: number[] = []
    const promises = chain.parallel({} as any, (state) => {
      updates.push(state.progress)
      return true
    })

    await Promise.all(promises)

    expect(updates).toEqual([0.25, 0.75])
    expect(animateSpy).toHaveBeenCalledTimes(2)
    animateSpy.mockRestore()
  })
})
