import { Lorem, ipsum, generateWithStats, loremFactory } from '../../src/common/lorem'

describe('Lorem Ipsum Generator', () => {
  test('should generate default words', () => {
    const lorem = new Lorem()
    const result = lorem.generate()

    expect(result).toContain('lorem')
    expect(result).toContain('ipsum')
    expect(result.split(' ').length).toBeCloseTo(100)
  })

  test('should generate exact word count', () => {
    const lorem = new Lorem({ count: 5, units: 'words' })
    const result = lorem.generate()

    expect(result.split(' ').length).toBe(5)
    expect(result).toContain('lorem')
  })

  test('should generate sentences', () => {
    const lorem = new Lorem({ count: 3, units: 'sentences' })
    const result = lorem.generate()

    expect(result.split('.').length).toBeCloseTo(4) // 3 + последняя точка
    expect(result).toMatch(/^[A-Z][^.!?]*\.[^.!?]*\.[^.!?]*\.$/)
  })

  test('should generate paragraphs', () => {
    const lorem = new Lorem({ count: 2, units: 'paragraphs' })
    const result = lorem.generate()
    expect(result.split('.').length).toBeGreaterThan(8)
    expect(result.trim()).toMatch(/^[A-Z][^.]*\.[^.]*\.[^.]*\s+/)
  })

  test('should capitalize first word', () => {
    const lorem = new Lorem({ count: 1, units: 'sentences' })
    const result = lorem.generate()

    expect(result[0]).toMatch(/[A-ZА-Я]/)
  })

  test('should add commas to long sentences', () => {
    const lorem = new Lorem({ count: 1, units: 'sentences', seed: 'commas' })
    const result = lorem.generate()

    expect(result).toContain(',')
  })

  test('should work with Russian locale', () => {
    const lorem = new Lorem({
      count: 10,
      units: 'words',
      locale: 'ru'
    })

    const result = lorem.generate()

    expect(/[а-яё]/i.test(result)).toBe(true)
    expect(result.split(' ').length).toBe(10)
  })

  test('should generate HTML format', () => {
    const lorem = new Lorem({
      count: 2,
      units: 'paragraphs',
      format: 'html'
    })
    const result = lorem.generate()

    expect(result).toContain('<p>')
    expect(result).toContain('</p>')
  })

  test('should calculate correct stats', () => {
    const lorem = new Lorem({ count: 50 })
    const text = lorem.generate()
    const stats = lorem.stats(text)

    expect(stats.words).toBeGreaterThan(40)
    expect(stats.words).toBeLessThan(60)
    expect(stats.sentences).toBeGreaterThan(0)
  })

  test('should return JSON with stats', () => {
    const lorem = new Lorem({ count: 20 })
    const json = lorem.toJSON()

    expect(json).toHaveProperty('text')
    expect(json).toHaveProperty('stats')
    expect(json).toHaveProperty('options')
    expect(json.stats.words).toBeGreaterThan(15)
  })

  test('lorem quick call works', () => {
    const result = ipsum(10, 'words')
    expect(result.split(' ').length).toBe(10)
    expect(result).toContain('lorem')
  })

  test('lorem factory works', () => {
    const lorem = loremFactory({ count: 5 })
    const result = lorem.generate()
    expect(result.split(' ').length).toBe(5)
  })

  test('ipsum function works', () => {
    const result = ipsum(3, 'sentences')
    expect(result.split('.').length).toBeCloseTo(4)
  })

  test('generateWithStats works', () => {
    const result = generateWithStats({ count: 20 })
    expect(result).toHaveProperty('text')
    expect(result).toHaveProperty('stats')
    expect(result.stats.words).toBeGreaterThan(15)
  })

  test('should reuse same seed consistently', () => {
    const lorem1 = new Lorem({ seed: 'test123', count: 10 })
    const lorem2 = new Lorem({ seed: 'test123', count: 10 })

    expect(lorem1.generate()).toBe(lorem2.generate())
  })

  test('should handle edge cases', () => {
    const lorem = new Lorem({ count: 0 })
    expect(lorem.generate()).toBeTruthy()

    const emptyStats = lorem.stats('')
    expect(emptyStats.words).toBe(0)
    expect(emptyStats.sentences).toBe(1)
  })
})
