import { selectAlgorithm, recommendAlgorithm, compareAlgorithms } from '../../src/prng'

describe('Selector', () => {
  it.each([
    ['speed', 'mulberry32'],
    ['quality', 'xorshift128'],
    ['period', 'sfc32'],
    ['balanced', 'sfc32']
  ])('selectAlgorithm(%s) → %s', (priority, expected) => {
    expect(selectAlgorithm(priority as any)).toBe(expected)
  })

  it.each([
    ['game-shuffle', 'mulberry32'],
    ['procedural-generation', 'sfc32'],
    ['monte-carlo', 'xorshift128'],
    ['unknown', 'sfc32']
  ])('recommendAlgorithm(%s) → %s', (useCase, expected) => {
    expect(recommendAlgorithm(useCase)).toBe(expected)
  })

  it('compareAlgorithms returns table', () => {
    const table = compareAlgorithms()
    expect(table).toContain('| Algorithm')
  })
})
