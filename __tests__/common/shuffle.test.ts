import { shuffle, shuffleAll, shuffleGenerator, shuffleStats, presets, seededShuffle } from '../../src/common/shuffle'

describe('shuffle basic and copy/secure options', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('returns the original array if the length is ≤ 1', () => {
    const arr: number[] = [1]
    expect(shuffle(arr)).toBe(arr) // returns the same ref without a copy
    expect(shuffle([], true)).toEqual([]) // copy=true for an empty array
  })

  test('copy=true does not mutate the original, rounds>=1', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1)
    const src = [1, 2, 3]
    const out = shuffle(src, { copy: true, rounds: 2 })

    expect(out).not.toBe(src)
    expect(src).toEqual([1, 2, 3])
    expect(out).toHaveLength(3)
    expect(randomSpy).toHaveBeenCalled()
  })

  test('secure uses crypto.getRandomValues', () => {
    const cryptoSpy = jest.spyOn(global.crypto, 'getRandomValues')
      .mockImplementation((arr: any) => {
        // filling with increasing numbers for determinism
        for (let i = 0; i < arr.length; i++) arr[i] = i + 1
        return arr
      })

    const src = [1, 2, 3, 4]
    const out = shuffle(src, { secure: true })

    expect(out).toHaveLength(4)
    expect(cryptoSpy).toHaveBeenCalled()
  })
})

describe('shuffle helpers', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('shuffleAll encrypts each subarray', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
    const data = [[1, 2], [3, 4]]
    const [a, b] = shuffleAll(data, { copy: true })
    expect(a).toHaveLength(2)
    expect(b).toHaveLength(2)
  })

  test('shuffleGenerator returns elements of a shuffled array', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
    const gen = shuffleGenerator([1, 2, 3])
    expect(Array.from(gen)).toHaveLength(3)
  })

  test('shuffleStats counts the order and cycles', () => {
    const original = [1, 2, 3]
    const shuffledSame = [1, 2, 3]
    const stats = shuffleStats(shuffledSame, original, { secure: false, rounds: 1 })

    expect(stats.originalOrder).toBe(true)
    expect(stats.cycles).toBe(3)
    expect(stats.algorithm).toBe('fisher-yates')
  })
})

describe('presets and seededShuffle', () => {
  test('presets return an array', () => {
    const arr = [1, 2, 3]
    expect(presets.ui(arr)).toHaveLength(3)
    expect(presets.cards(arr)).toHaveLength(3)
    expect(presets.secure(arr)).toHaveLength(3)
    expect(presets.train(arr)).toHaveLength(3)
  })

  test('seededShuffle детерминирован по seed', () => {
    const src = [1, 2, 3, 4]
    const genA = seededShuffle(src, 'seed')
    const genB = seededShuffle(src, 'seed')
    const genC = seededShuffle(src, 'other')

    const a1 = genA.next().value
    const a2 = genA.next().value
    const b1 = genB.next().value
    const b2 = genB.next().value
    const c1 = genC.next().value

    expect(a1).toEqual(b1)
    expect(a2).toEqual(b2)
    expect(c1).not.toEqual(a1)
  })
})
