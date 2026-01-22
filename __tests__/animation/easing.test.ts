import { EASING } from '@/animation/easing'

describe('EASING predefined functions', () => {
  const samplePoints = [0, 0.25, 0.5, 0.75, 1]

  test('linear is identity', () => {
    samplePoints.forEach((t) => {
      expect(EASING.linear(t)).toBeCloseTo(t)
    })
  })

  test('easeInQuad starts slow and ends fast', () => {
    expect(EASING.easeInQuad(0)).toBe(0)
    expect(EASING.easeInQuad(1)).toBe(1)
    expect(EASING.easeInQuad(0.25)).toBeLessThan(0.25)
    // для t < 1 значение остаётся < t, т.к. t^2 < t
    expect(EASING.easeInQuad(0.75)).toBeLessThan(0.75)
  })

  test('easeOutQuad starts fast and ends slow', () => {
    expect(EASING.easeOutQuad(0)).toBe(0)
    expect(EASING.easeOutQuad(1)).toBe(1)
    expect(EASING.easeOutQuad(0.25)).toBeGreaterThan(0.25)
    // ближе к 1 функция даёт значения ближе к 1, чем сам t
    expect(EASING.easeOutQuad(0.75)).toBeGreaterThan(0.75)
  })

  test('easeInOutQuad is symmetric around 0.5', () => {
    expect(EASING.easeInOutQuad(0)).toBe(0)
    expect(EASING.easeInOutQuad(1)).toBe(1)

    const left = EASING.easeInOutQuad(0.25)
    const right = EASING.easeInOutQuad(0.75)
    expect(left).toBeCloseTo(1 - right, 5)
  })

  test('cubic easings are monotonic and within [0,1]', () => {
    const fns = [
      EASING.easeInCubic,
      EASING.easeOutCubic,
      EASING.easeInOutCubic
    ]

    fns.forEach((fn) => {
      let prev = fn(0)
      expect(prev).toBeGreaterThanOrEqual(0)

      samplePoints.slice(1).forEach((t) => {
        const v = fn(t)
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(1)
        expect(v).toBeGreaterThanOrEqual(prev)
        prev = v
      })
    })
  })

  test('bounce easing stays within [0,1] and ends at 1', () => {
    samplePoints.forEach((t) => {
      const v = EASING.bounce(t)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    })

    expect(EASING.bounce(0)).toBeCloseTo(0)
    expect(EASING.bounce(1)).toBeCloseTo(1)
  })
})

