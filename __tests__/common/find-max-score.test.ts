import {
  findMaxScores,
  findMaxScoresWithSelector,
  MaxScoreFinder,
  type FindMaxScoreOptions,
} from '../../src/common/findMaxScore'

describe('findMaxScores', () => {
  test('возвращает пустой массив для пустого входа', () => {
    expect(findMaxScores([])).toEqual([])
    expect(findMaxScores(null as any)).toEqual([])
    expect(findMaxScores(undefined as any)).toEqual([])
  })

  test('возвращает единственный элемент для массива из одного элемента', () => {
    const item = { id: 1, score: 42 } as const
    expect(findMaxScores([item])).toEqual([item])
  })

  test('находит все элементы с максимальным score', () => {
    const items = [
      { name: 'a', score: 10 },
      { name: 'b', score: 20 },
      { name: 'c', score: 20 },
      { name: 'd', score: 15 },
    ] as const

    expect(findMaxScores(items)).toEqual([
      { name: 'b', score: 20 },
      { name: 'c', score: 20 },
    ])
  })

  test('работает с отрицательными значениями score', () => {
    const items = [
      { id: 1, score: -5 },
      { id: 2, score: -10 },
      { id: 3, score: -5 },
    ] as const

    expect(findMaxScores(items)).toEqual([
      { id: 1, score: -5 },
      { id: 3, score: -5 },
    ])
  })

  // Custom compareFn
  test('поддерживает поиск минимума через compareFn', () => {
    const items = [
      { name: 'a', score: 10 },
      { name: 'b', score: 5 },
      { name: 'c', score: 5 },
      { name: 'd', score: 15 },
    ] as const

    const options: FindMaxScoreOptions = {
      compareFn: (current, candidate) => candidate < current,
    }

    expect(findMaxScores(items, options)).toEqual([
      { name: 'b', score: 5 },
      { name: 'c', score: 5 },
    ])
  })

  test('сохраняет порядок элементов при равных score', () => {
    const items = [
      { id: 3, score: 20 },
      { id: 1, score: 20 },
      { id: 2, score: 15 },
      { id: 4, score: 20 },
    ] as const

    expect(findMaxScores(items)).toEqual([
      { id: 3, score: 20 },
      { id: 1, score: 20 },
      { id: 4, score: 20 },
    ])
  })
})

describe('findMaxScoresWithSelector', () => {
  test('работает с вложенными объектами', () => {
    interface UserItem {
      user: {
        id: number;
        profile: {
          rating: number;
        };
      };
    }

    const items: UserItem[] = [
      { user: { id: 1, profile: { rating: 10 } } },
      { user: { id: 2, profile: { rating: 20 } } },
      { user: { id: 3, profile: { rating: 20 } } },
    ]

    const selector = (item: UserItem) => item.user.profile.rating
    expect(findMaxScoresWithSelector(items, selector)).toEqual([
      items[1],
      items[2],
    ])
  })

  test('работает с вычисляемыми значениями', () => {
    interface Product {
      price: number;
      discount: number
    }

    const products: Product[] = [
      { price: 100, discount: 10 },  // 90
      { price: 200, discount: 20 },  // 180 ← максимум
      { price: 150, discount: 20 },  // 130
    ];

    const selector = (p: Product) => p.price - p.discount
    const result = findMaxScoresWithSelector(products, selector)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(products[1])
  })

  test('пустой массив', () => {
    expect(findMaxScoresWithSelector([], () => 0 as const)).toEqual([])
  })
})

describe('MaxScoreFinder', () => {
  let items: readonly { id: number; score: number }[]

  beforeEach(() => {
    items = [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 20 },
      { id: 4, score: 15 },
    ] as const
  })

  test('кеширует результаты getMaxItems', () => {
    const finder = new MaxScoreFinder(items);

    const firstCall = finder.getMaxItems()
    const secondCall = finder.getMaxItems()

    expect(firstCall).toBe(secondCall)
    expect(firstCall).toEqual([
      { id: 2, score: 20 },
      { id: 3, score: 20 },
    ])
  })

  test('invalidateCache сбрасывает кеш и создает новый массив', () => {
    const finder = new MaxScoreFinder(items)

    const cached = finder.getMaxItems()
    finder.invalidateCache()
    const fresh = finder.getMaxItems()

    expect(cached).toEqual(fresh)
    expect(cached).not.toBe(fresh)
    expect(cached.length).toBe(2)
  })

  test('getMaxScore возвращает правильное значение', () => {
    const finder = new MaxScoreFinder(items)
    expect(finder.getMaxScore()).toBe(20)
  })

  test('getMaxScoreCount считает количество', () => {
    const finder = new MaxScoreFinder(items)
    expect(finder.getMaxScore()).toBe(20)
    expect(finder.getMaxScoreCount()).toBe(2)
  })

  test('пустой конструктор', () => {
    const finder = new MaxScoreFinder([] as const)
    expect(finder.getMaxItems()).toEqual([])
    expect(finder.getMaxScore()).toBeUndefined()
    expect(finder.getMaxScoreCount()).toBe(0)
  })

  test('не мутирует оригинальный массив', () => {
    const original = [...items]
    const finder = new MaxScoreFinder(original)
    finder.getMaxItems()

    expect(original).toEqual(items)
    expect(original).not.toBe(finder.getMaxItems())
  })
})

// Snapshot тесты для стабильности
describe('snapshots', () => {
  const items = [
    { name: 'alpha', score: 1 },
    { name: 'beta',  score: 3 },
    { name: 'gamma', score: 3 },
    { name: 'delta', score: 2 },
  ] as const

  test('findMaxScores snapshot', () => {
    expect(findMaxScores(items)).toMatchInlineSnapshot(`
      [
        {
          "name": "beta",
          "score": 3,
        },
        {
          "name": "gamma",
          "score": 3,
        },
      ]
    `)
  })
})
