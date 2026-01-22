import {
  mulberry32Generator,
  xorshift128Generator,
  sfc32Generator,
  lcgGenerator,
  jsf32Generator
} from '../../src/prng/algorithms'

describe.each([
  ['mulberry32', mulberry32Generator],
  ['xorshift128', xorshift128Generator],
  ['sfc32', sfc32Generator],
  ['lcg', lcgGenerator],
  ['jsf32', jsf32Generator]
])('PRNG: %s', (_, generator) => {
  describe('basic functionality', () => {
    it('never returns exactly 0 or 1', () => {
      const gen = generator('test')
      for (let i = 0; i < 100; i++) {
        const r = gen.next().value as number
        expect(r).toBeGreaterThan(0)
        expect(r).toBeLessThan(1)
      }
    })

    it('deterministic (same seed = same sequence)', () => {
      const gen1 = generator('seed')
      const gen2 = generator('seed')
      for (let i = 0; i < 10; i++) {
        expect(gen1.next().value).toBeCloseTo(gen2.next().value as number, 10)
      }
    })

    it('different seeds → different sequences', () => {
      const gen1 = generator('seed1')
      const gen2 = generator('seed2')

      const seq1_1 = gen1.next().value as number
      const seq1_2 = gen1.next().value as number
      const seq1_3 = gen1.next().value as number

      const seq2_1 = gen2.next().value as number
      const seq2_2 = gen2.next().value as number
      const seq2_3 = gen2.next().value as number

      expect(seq1_1 !== seq2_1 || seq1_2 !== seq2_2 || seq1_3 !== seq2_3).toBe(true)
    })
  })
})
