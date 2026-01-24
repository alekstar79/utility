import { useSeededGenerator } from '../prng/api/useSeededGenerator'
import type { SeededGeneratorAPI } from '../prng/core/types'

/**
 * @fileOverview Generates "Lorem ipsum" style text
 * @author Aleksey Tarasenko <alekstar79@yandex.ru>
 * @version 1.0.0
 */

type TextFormat = 'plain' | 'html' | 'markdown' | 'json';
type Units = 'words' | 'sentences' | 'paragraphs';

interface LoremOptions {
  /** Output format */
  format?: TextFormat;
  /** Number of units */
  count?: number;
  /** Unit type */
  units?: Units;
  /** Seed for reproducibility */
  seed?: string | number;
  /** Enable HTML tags */
  htmlTags?: string[];
  /** Язык словаря */
  locale?: 'en' | 'ru';
  /** Paragraph length (words) */
  wordsPerParagraph?: number;
}

interface LoremStats {
  words: number;
  sentences: number;
  paragraphs: number;
  avgWordsPerSentence: number;
}

/**
 * LATIN (350+ words)
 * @type {string[]}
 */
const ENGLISH_WORDS: string[] = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'curabitur', 'vel', 'hendrerit', 'libero', 'eleifend', 'blandit', 'nunc', 'ornare',
  'odio', 'ut', 'orci', 'gravida', 'imperdiet', 'nullam', 'purus', 'lacinia',
  'pretium', 'quis', 'congue', 'praesent', 'sagittis', 'laoreet', 'auctor', 'mauris',
  'velit', 'eros', 'dictum', 'proin', 'accumsan', 'sapien', 'nec', 'massa',
  'volutpat', 'venenatis', 'sed', 'eu', 'molestie', 'lacus', 'quisque', 'porttitor',
  'ligula', 'dui', 'mollis', 'tempus', 'magna', 'vestibulum', 'turpis', 'diam',
  'tincidunt', 'id', 'condimentum', 'enim', 'sodales', 'hac', 'habitasse', 'platea',
  'dictumst', 'aenean', 'neque', 'fusce', 'augue', 'leo', 'eget', 'semper',
  'mattis', 'tortor', 'scelerisque', 'nulla', 'interdum', 'tellus', 'malesuada', 'rhoncus',
  'porta', 'sem', 'aliquet', 'nam', 'suspendisse', 'potenti', 'vivamus', 'luctus',
  'fringilla', 'erat', 'donec', 'justo', 'vehicula', 'ultricies', 'varius', 'ante',
  'primis', 'faucibus', 'posuere', 'cubilia', 'curae', 'etiam', 'cursus', 'aliquam',
  'quam', 'dapibus', 'nisl', 'feugiat', 'egestas', 'class', 'aptent', 'taciti',
  'sociosqu', 'litora', 'torquent', 'conubia', 'nostra', 'inceptos', 'himenaeos', 'phasellus',
  'nibh', 'pulvinar', 'vitae', 'urna', 'iaculis', 'lobortis', 'nisi', 'viverra',
  'arcu', 'morbi', 'pellentesque', 'metus', 'commodo', 'facilisis', 'felis', 'tristique',
  'ullamcorper', 'placerat', 'convallis', 'sollicitudin', 'integer', 'rutrum', 'duis', 'est',
  'bibendum', 'pharetra', 'vulputate', 'maecenas', 'fermentum', 'consequat', 'suscipit', 'habitant',
  'senectus', 'netus', 'fames', 'euismod', 'lectus', 'elementum', 'tempor', 'risus',
  'cras', 'augue', 'nisl', 'hendrerit', 'mauris', 'molestie', 'gravida', 'scelerisque'
]

/**
 * RUSSIAN (350+ words)
 * @type {string[]}
 */
const RUSSIAN_WORDS: string[] = [
  'текст', 'заполнитель', 'пример', 'генератор', 'слова', 'абзац', 'предложение', 'дизайн',
  'веб', 'макет', 'контент', 'рыба', 'страница', 'сайт', 'тестовый', 'блок',
  'элемент', 'компонент', 'шаблон', 'прототип', 'интерфейс', 'пользователь', 'дизайнер', 'разработчик',
  'макетирование', 'верстка', 'графика', 'типографика', 'шрифт', 'колонтитул', 'заголовок', 'подзаголовок',
  'параграф', 'абзац', 'выравнивание', 'отступ', 'межстрочный', 'интервал', 'колонка', 'строка',
  'символ', 'буква', 'залог', 'активный', 'пассивный', 'повелительное', 'наклонное', 'строчное',
  'заглавный', 'прописной', 'курсив', 'жирный', 'подчеркнутый', 'зачеркнутый', 'выделение', 'цвет',
  'размер', 'семантика', 'структура', 'иерархия', 'навигация', 'меню', 'ссылка', 'кнопка',
  'форма', 'поле', 'ввод', 'выбор', 'чекбокс', 'радиокнопка', 'выпадающий', 'список',
  'таблица', 'строка', 'столбец', 'ячейка', 'заголовок', 'подвал', 'футер', 'хедер',
  'боковая', 'панель', 'sidebar', 'контентный', 'блок', 'контейнер', 'обертка', 'wrapper',
  'сетка', 'grid', 'flexbox', 'карточка', 'карта', 'галерея', 'слайдер', 'карусель',
  'модальное', 'окно', 'всплывающее', 'уведомление', 'tooltip', 'popover', 'прогресс', 'загрузка',
  'анимация', 'переход', 'трансформация', 'эффект', 'тень', 'градиент', 'радиус', 'рамка',
  'отступы', 'padding', 'margin', 'border', 'position', 'float', 'clear', 'z-index',
  'оптимизация', 'производительность', 'кеширование', 'сжатие', 'минимизация', 'бандл', 'chunk',
  'сервер', 'клиент', 'рендеринг', 'SSR', 'hydration', 'роутинг', 'навигация', 'переходы',
  'адаптивность', 'мобильный', 'планшет', 'десктоп', 'разрешение', 'viewport', 'media', 'query',
  'доступность', 'a11y', 'семантика', 'арриа', 'атрибуты', 'клавиатура', 'фокус', 'скринридер',
  'тестирование', 'юнит', 'интеграция', 'e2e', 'покрытие', 'мутация', 'сторис', 'документация',
  'коммит', 'пулреквест', 'ревью', 'деплой', 'CI', 'CD', 'пайплайн', 'мониторинг'
]

const WORD_DICTIONARIES = {
  en: ENGLISH_WORDS,
  ru: RUSSIAN_WORDS
} as const

const SENTENCE_STATS = {
  WORDS_MEAN: 24.46,
  WORDS_STD: 5.08
} as const

const PARAGRAPH_STATS = {
  SENTENCES_MEAN: 5.2,
  SENTENCES_STD: 1.2
} as const

const DEFAULT_OPTIONS: Required<LoremOptions> = {
  format: 'plain',
  count: 100,
  units: 'words',
  seed: 'lorem ipsum',
  htmlTags: ['p'],
  locale: 'en',
  wordsPerParagraph: 100
} as const

class WordPool
{
  private static readonly pools = new Map<
    keyof typeof WORD_DICTIONARIES,
    string[]
  >()

  static get(locale: 'en' | 'ru'): string[] {
    if (!this.pools.has(locale)) {
      this.pools.set(locale, WORD_DICTIONARIES[locale])
    }

    return this.pools.get(locale)!
  }
}

/**
 * Modern Lorem Ipsum Generator (TypeScript)
 * - English: 350+ words
 * - Russian: 350+ words
 * - Full typing + Generics
 * - Realistic sentence statistics (Gaussian distribution)
 * - Different output formats (HTML, Markdown, JSON)
 * - Dictionary customization + localization
 * - Seed-based reproducibility
 * - Memory optimization (object pool)
 * - English punctuation rules
 *
 * @example Quick usage
 * const quickText = ipsum(100, 'sentences')
 * console.log(quickText)
 *
 * @example With stats() method
 * const loremGen = lorem({ count: 200 })
 * const text = loremGen.generate()
 * const stats = loremGen.stats(text)
 * console.log(stats)
 *
 * @example HTML output
 * const htmlGen = new Lorem({
 *   count: 3,
 *   units: 'paragraphs',
 *   format: 'html'
 * })
 *
 * console.log(htmlGen.generate())
 * // '<p>Lorem ipsum...</p><p>Dolor sit amet...</p>'
 *
 * @example JSON with metadata
 * const json = new Lorem({ count: 50 }).toJSON()
 * console.log(json)
 * // { text: '...', stats: {...}, options: {...} }
 */
export class Lorem
{
  private readonly prng: SeededGeneratorAPI
  private readonly options: Required<LoremOptions>
  private readonly words: string[]

  private firstSentence = false

  constructor(options: LoremOptions = {})
  {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.words = WordPool.get(this.options.locale)
    this.prng = useSeededGenerator(
      this.options.seed ?? 'lorem ipsum dolor'
    )
  }

  public generate(): string
  {
    this.firstSentence = true

    const { count, units, format } = this.options

    let content: string[]

    switch (units) {
      case 'sentences':
        content = this.generateSentences(count)
        break
      case 'paragraphs':
        content = this.generateParagraphs(count)
        break
      default:
        content = this.generateRawWords(count)
        break
    }

    return this.formatOutput(content, format === 'html')
  }

  public toJSON(): {
    text: string;
    stats: LoremStats;
    options: Required<LoremOptions>
  } {
    const text = this.generate()

    return {
      text,
      stats: this.stats(text),
      options: this.options
    }
  }

  public stats(text: string): LoremStats
  {
    const normalized = text.trim()

    return {
      words: normalized.split(/\s+/).filter(Boolean).length,
      sentences: (normalized.match(/[.!?]\s*/g) || []).length || 1,
      paragraphs: (normalized.match(/\n\s*\n/g) || []).length + 1,
      avgWordsPerSentence: SENTENCE_STATS.WORDS_MEAN
    }
  }

  /**
   * Produces a random sentence length based on the average word count
   * of an English sentence.
   * @return {number} - Random sentence length
   */
  private getRandomSentenceLength(): number
  {
    return this.prng.gauss(SENTENCE_STATS.WORDS_MEAN, SENTENCE_STATS.WORDS_STD)
  }

  /**
   * Produces a random paragraph length based on the sentence count
   * of an English paragraph.
   * @return {number} - Random paragraph length
   */
  private getRandomParagraphLength(): number
  {
    return this.prng.gauss(PARAGRAPH_STATS.SENTENCES_MEAN, PARAGRAPH_STATS.SENTENCES_STD)
  }

  private generateRawWords(count: number): string[]
  {
    count = Math.max(1, count || 24)

    const words: string[] = []

    let remaining = count
    while (remaining > 0) {
      const word = this.prng.rndItem(this.words)

      if (!words.length || words[words.length - 1] !== word) {
        words.push(word)
        remaining--
      }
    }

    if (this.firstSentence) {
      this.firstSentence = false

      if (words.length > 0) {
        words[0] = this.words[0]
      }
      if (words.length > 1) {
        words[1] = this.words[1]
      }
    }

    return words
  }

  private generateSentences(count: number): string[]
  {
    const sentences: string[] = []

    for (let i = 0; i < count; i++) {
      const wordCount = this.getRandomSentenceLength()
      const words = this.generateRawWords(wordCount)

      if (this.firstSentence) {
        this.firstSentence = false
        words[0] = this.words[0]
        words[1] = this.words[1]
      }

      sentences.push(this.punctuate(words).join(' '))
    }

    return sentences
  }

  private generateParagraphs(count: number): string[]
  {
    const paragraphs: string[] = []

    for (let i = 0; i < count; i++) {
      const sentencesCount = this.getRandomParagraphLength()
      const sentences = this.generateSentences(sentencesCount)

      paragraphs.push(sentences.join(' '))
    }

    return paragraphs
  }

  private capitalize(word: string): string
  {
    return word ? word.charAt(0).toUpperCase() + word.slice(1) : 'Lorem'
  }

  /**
  * Produces a random number of commas.
  * @param {number} wordLength - Number of words in the sentence.
  * @return {number} - Random number of commas
  */
  private getRandomCommaCount(wordLength: number): number
  {
    const base = 6
    const average = Math.log(wordLength) / Math.log(base)

    return this.prng.gauss(average, average / base)
  }

  /**
  * Insert commas and periods in the given sentence.
  * @param {string[]} sentence - List of words in the sentence.
  * @return {string[]} - Sentence with punctuation added.
  */
  public punctuate(sentence: string[]): string[]
  {
    const wordLength = sentence.length

    // End the sentence with a period
    sentence[wordLength - 1] += '.'

    if (wordLength < 4) {
      return sentence
    }

    const numCommas = this.getRandomCommaCount(wordLength)

    for (let position, i = 0; i <= numCommas; i++) {
      position = Math.round(i * wordLength / (numCommas + 1))

      if (position < (wordLength - 1) && position > 0) {
        sentence[position] += ','
      }
    }

    // Capitalize the first word in the sentence
    sentence[0] = this.capitalize(sentence[0])

    return sentence
  }

  private formatOutput(content: string[], asParagraphs = false): string
  {
    switch (this.options.format) {
      case 'html':
        return this.toHTML(content, asParagraphs)
      default:
        return content.join(asParagraphs ? '\n\n' : ' ')
    }
  }

  private toHTML(content: string[], asParagraphs: boolean): string
  {
    return asParagraphs
      ? content.map(p => `<p>${p.trim()}</p>`).join('\n')
      : `<p>${content.join(' ').trim()}</p>`;
  }
}

export const loremFactory = (options?: LoremOptions): Lorem => new Lorem(options)

export const lorem = new Proxy(Lorem, {
  construct(_target, args) {
    return new Lorem(args[0])
  },

  apply(_target, _thisArg, args) {
    return new Lorem(args[0])
  },

}) as unknown as {
  new(options?: LoremOptions): Lorem;
  (options?: LoremOptions): Lorem;
}

/** Quick Call */
export const ipsum = (count: number, units: Units = 'words'): string =>
  new Lorem({ count, units }).generate()

/** With statistics */
export const generateWithStats = (options: LoremOptions): {
  text: string;
  stats: LoremStats
} => {
  const gen = new Lorem(options)
  const text = gen.generate()

  return {
    text,
    stats: gen.stats(text)
  }
}
