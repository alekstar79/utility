import { declination, createDeclension, formatPlural, registerDeclensionRule } from '@/common/declination'

describe('declination function tests', () => {
  afterEach(() => {
    jest.resetModules()
  })

  test('Russian declination basic cases', () => {
    expect(declination(0, ['комментарий', 'комментария', 'комментариев'])).toBe('комментариев')
    expect(declination(1, ['комментарий', 'комментария', 'комментариев'])).toBe('комментарий')
    expect(declination(2, ['комментарий', 'комментария', 'комментариев'])).toBe('комментария')
    expect(declination(5, ['комментарий', 'комментария', 'комментариев'])).toBe('комментариев')
    expect(declination(11, ['комментарий', 'комментария', 'комментариев'])).toBe('комментариев')
    expect(declination(21, ['комментарий', 'комментария', 'комментариев'])).toBe('комментарий')
    expect(declination(25, ['комментарий', 'комментария', 'комментариев'])).toBe('комментариев')
  })

  test('Include number option', () => {
    expect(declination(5, ['комментарий', 'комментария', 'комментариев'], { includeNumber: true })).toBe('5 комментариев')
    expect(declination(21, ['комментарий', 'комментария', 'комментариев'], { includeNumber: true })).toBe('21 комментарий')
  })

  test('English declination', () => {
    expect(declination(1, ['like', 'likes'], { rule: 'english' })).toBe('like')
    expect(declination(0, ['like', 'likes'], { rule: 'english' })).toBe('likes')
    expect(declination(5, ['like', 'likes'], { rule: 'english' })).toBe('likes')
  })

  test('Custom rule', () => {
    const customRule = (n: number) => (n % 2 === 0 ? 0 : 1)
    expect(declination(2, ['even', 'odd'], { customRule })).toBe('even')
    expect(declination(3, ['even', 'odd'], { customRule })).toBe('odd')
  })

  test('Create declension factory', () => {
    const decline = createDeclension(['яблоко', 'яблока', 'яблок'], { includeNumber: true })
    expect(decline(1)).toBe('1 яблоко')
    expect(decline(3)).toBe('3 яблока')
    expect(decline(5)).toBe('5 яблок')
  })

  test('formatPlural replaces tokens correctly', () => {
    expect(formatPlural(5, 'У вас {count} {word}', { words: ['сообщение', 'сообщения', 'сообщений'] })).toBe('У вас 5 сообщений')
    expect(formatPlural(1, 'Есть {count} {word}', { words: ['файл', 'файла', 'файлов'] })).toBe('Есть 1 файл')
  })

  test('Register and get custom rule', () => {
    const polishRule = { getPluralForm: (n: number) => (n === 1 ? 0 : 1), description: 'Polish' }
    registerDeclensionRule('polish', polishRule);
    expect(declination(1, ['plik', 'pliki'], { rule: 'polish' })).toBe('plik')
    expect(declination(2, ['plik', 'pliki'], { rule: 'polish' })).toBe('pliki')
    expect(polishRule).toBeDefined()
  })

  test('Register and get custom rule', () => {
    const polishRule = {
      getPluralForm: (n: number) => (n === 1 ? 0 : 1) as 0 | 1 | 2,
      description: 'Polish'
    }

    registerDeclensionRule('polish', polishRule)

    expect(declination(1, ['plik', 'pliki'], { rule: 'polish' })).toBe('plik')
    expect(declination(2, ['plik', 'pliki'], { rule: 'polish' })).toBe('pliki')

    expect(polishRule.description).toBe('Polish')
  })

  test('Throws error for invalid number', () => {
    expect(() => declination(-1 as any, ['one', 'two'])).toThrow()
    expect(() => declination(1.5 as any, ['one', 'two'])).toThrow()
  })

  test('Throws error for invalid forms', () => {
    expect(() => declination(1, [] as any)).toThrow()
    expect(() => declination(1, ['only_one'])).toThrow()
  })

  test('Fallback for fewer forms', () => {
    expect(declination(5, ['сообщение', 'сообщения'])).toBe('сообщения')
  })

  test('Large numbers (edge case)', () => {
    expect(declination(101, ['один', 'два', 'много'])).toBe('один')
    expect(declination(125, ['один', 'два', 'много'])).toBe('много')
  })

  test('Zero forms fallback', () => {
    expect(declination(0, ['ноль', 'один', 'много'])).toBe('много')
  })
})
