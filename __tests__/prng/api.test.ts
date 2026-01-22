import { PRESETS, useSeededGenerator } from '../../src/prng'

describe('useSeededGenerator API', () => {
  it('default algorithm (mulberry32)', () => {
    const rng = useSeededGenerator('test')
    expect(rng.info.algorithm).toBe('mulberry32')
  })

  it('custom algorithm', () => {
    const rng = useSeededGenerator('test', { algorithm: 'xorshift128' })
    expect(rng.info.algorithm).toBe('xorshift128')
  })

  it('preset', () => {
    const rng = useSeededGenerator('test', PRESETS.PRESET_SIMULATION)
    expect(rng.info.algorithm).toBe('xorshift128')
  })

  describe('random utilities', () => {
    const rng = useSeededGenerator('test')

    it('random [0...1]', () => {
      const r = rng.random()
      expect(r).toBeGreaterThan(0)
      expect(r).toBeLessThan(1)
    })

    it('rndInt inclusive range', () => {
      expect(rng.rndInt(1, 5)).toBeGreaterThanOrEqual(1)
      expect(rng.rndInt(1, 5)).toBeLessThanOrEqual(5)
    })

    it('rndFloat [min, max]', () => {
      const r = rng.rndFloat(10, 20)
      expect(r).toBeGreaterThanOrEqual(10)
      expect(r).toBeLessThan(20)
    })

    it('rndItem from array', () => {
      const item = rng.rndItem(['A', 'B', 'C'])
      expect(['A', 'B', 'C']).toContain(item)
    })

    it('gauss distribution', () => {
      const samples: number[] = []
      for (let i = 0; i < 100; i++) {
        samples.push(rng.gauss(100, 15))
      }
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length
      expect(mean).toBeGreaterThan(90)
      expect(mean).toBeLessThan(110)
    })
  })

  it('batch generation', () => {
    const rng = useSeededGenerator('test')
    const batch = rng.batch(5)
    expect(batch).toHaveLength(5)
    batch.forEach((r: number) => {
      expect(r).toBeGreaterThan(0)
      expect(r).toBeLessThan(1)
    })
  })

  it('shuffle Fisher-Yates', () => {
    const rng = useSeededGenerator('test')
    const original = [1, 2, 3, 4, 5]
    const shuffled = rng.shuffle(original)

    expect(shuffled).toHaveLength(5)
    expect(shuffled).not.toEqual(original) // shuffled
    expect(new Set(shuffled).size).toBe(5) // no duplicates
  })
})
