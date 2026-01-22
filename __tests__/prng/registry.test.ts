import { PRNG_INFO, createGenerator, getAlgorithmInfo, getAllAlgorithms } from '../../src/prng/algorithms'

describe('Registry & Factory', () => {
  it('all algorithms registered', () => {
    expect(getAllAlgorithms()).toEqual([
      'xorshift128',
      'mulberry32',
      'jsf32',
      'sfc32',
      'lcg'
    ])
  })

  it('PRNG_INFO complete', () => {
    expect(Object.keys(PRNG_INFO)).toEqual(getAllAlgorithms())
  })

  it('createGenerator works', () => {
    const creator = createGenerator('mulberry32')
    expect(typeof creator).toBe('function')
    const gen = creator('test')
    expect(gen.next().done).toBe(false)
  })

  it('getAlgorithmInfo works', () => {
    const info = getAlgorithmInfo('xorshift128')
    expect(info.name).toBe('Xorshift128+')
    expect(info.quality).toBe('outstanding')
  })

  it('createGenerator throws on unknown algorithm', () => {
    expect(() => createGenerator('unknown' as any)).toThrow('Unknown algorithm')
  })
})
