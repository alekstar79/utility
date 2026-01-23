export type FeedbackFn = (result: ClipboardResult) => void;

export interface ClipboardOptions {
  /** Operation timeout in ms */
  timeout?: number;
  /** User feedback function */
  onFeedback?: FeedbackFn;
}

export interface ClipboardResult {
  /** Data */
  data: string | null;
  /** Success rate */
  success: boolean;
  /** Execution method */
  method: 'clipboard' | 'fallback';
  /** Error */
  error?: string;
  /** Metadata */
  metadata: {
    timestamp: number;
    size: number;
    duration: number;
  };
}

export interface ClipboardStats {
  operations: number;
  successRate: number;
  fallbackUsed: number;
}

/** Creates a ClipboardEvent with a fallback to Event */
const createClipboardEvent = (type: string): ClipboardEvent => {
  return typeof ClipboardEvent !== 'undefined'
    ? new ClipboardEvent(type, { bubbles: true, cancelable: true })
    : new Event(type, { bubbles: true, cancelable: true }) as ClipboardEvent
}

/** Safely installation of data in clipboardData */
const setClipboardData = (event: ClipboardEvent, text: string): void => {
  const clipboardData = event.clipboardData

  if (clipboardData) {
    clipboardData.setData('text/plain', text)
  }
}

/** Fallback copying via ClipboardEvent + DataTransfer */
const fallbackCopy = (text: string): boolean => {
  const tempDiv = document.createElement('div')

  Object.assign(tempDiv.style, {
    position: 'fixed', opacity: 0, height: 0, width: 0, top: '-9999px'
  })

  tempDiv.contentEditable = 'true'
  tempDiv.innerText = text
  document.body.appendChild(tempDiv)

  const copyEvent = createClipboardEvent('copy')
  setClipboardData(copyEvent, text)

  const success = tempDiv.dispatchEvent(copyEvent)
  document.body.removeChild(tempDiv)

  return success && copyEvent.defaultPrevented
}

/**
 * Clipboard API (100% браузеры)
 *
 * @example
 * // 1. Basic copying
 * const clipboard = new Clipboard()
 * const result1 = await clipboard.write('Hello World!')
 * console.log(result1.success, result1.method) // true, 'clipboard'
 *
 * @example
 * // 2. With custom feedback
 * await clipboard.write('https://example.com', {
 *   onFeedback: (result) => {
 *     if (result.success) {
 *       showToast(`✅ Copied ${result.metadata.size} symbols (${result.method})`)
 *     } else {
 *       showErrorToast(result.error!)
 *     }
 *   }
 * })
 *
 * @example
 * // 3. Copying from a DOM element
 * const copyLink = async (element: HTMLElement) => {
 *   const text = element.textContent || element.innerText || ''
 *   await clipboard.write(text, {
 *     timeout: 3000,
 *     onFeedback: ({ success, method }) => {
 *       console.log(`Copying ${success ? 'successfully' : 'failure'} via ${method}`)
 *     }
 *   })
 * }
 *
 * @example
 * // 4. Mass copying
 * const copyMultiple = async (texts: string[]) => {
 *   const feedback: FeedbackFn = (result) => {
 *     console.log(`${result.success ? '✅' : '❌'} ${result.data?.slice(0, 20)}... (${result.method})`)
 *   }
 *
 *   for (const text of texts) {
 *     await clipboard.write(text, { onFeedback: feedback })
 *   }
 *
 *   console.log('📊 Statistics:', clipboard.stats)
 * }
 *
 * @example
 * // 5. Reading from the buffer
 * const pastedData = await clipboard.read()
 * if (pastedData[0]?.success) {
 *   console.log('Pasted:', pastedData[0].data)
 * }
 */
export class Clipboard
{
  private readonly supportsClipboardAPI: boolean
  private readonly _stats: ClipboardStats

  constructor() {
    this.supportsClipboardAPI =
      typeof navigator !== 'undefined' && 'clipboard' in navigator &&
      typeof (navigator as any).clipboard?.writeText === 'function'

    this._stats = { operations: 0, successRate: 0, fallbackUsed: 0 }
  }

  get isSupported(): boolean {
    return this.supportsClipboardAPI || true
  }

  get stats(): ClipboardStats {
    return {
      ...this._stats,
      successRate: this._stats.operations > 0 ? 1 : 0
    }
  }

  async write(text: string, options: ClipboardOptions = {}): Promise<ClipboardResult> {
    return this.writeImpl(text, options)
  }

  async read(): Promise<ClipboardResult[]> {
    return this.readImpl()
  }

  async clear(): Promise<void> {
    if (this.supportsClipboardAPI) {
      await (navigator as any).clipboard.clear()
    }
  }

  private async writeImpl(
    text: string,
    options: ClipboardOptions = {}
  ): Promise<ClipboardResult> {
    this._stats.operations++

    const start = performance.now()
    const { timeout = 5000, onFeedback } = options

    let method: ClipboardResult['method'] = 'fallback'

    // Clipboard API (priority 1)
    if (this.supportsClipboardAPI) {
      try {
        await Promise.race([
          (navigator as any).clipboard.writeText(text),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ])

        method = 'clipboard'
      } catch {
        // Seamless fallback
      }
    }

    // Fallback (priority 2)
    if (method === 'fallback') {
      const success = fallbackCopy(text)

      if (!success) {
        const result: ClipboardResult = {
          data: null,
          success: false,
          method: 'fallback',
          error: 'Fallback failed',
          metadata: {
            timestamp: Date.now(),
            size: 0,
            duration: Math.round(performance.now() - start)
          }
        }

        onFeedback?.(result)

        return result
      }

      this._stats.fallbackUsed++
    }

    const result: ClipboardResult = {
      data: text,
      success: true,
      method,
      metadata: {
        timestamp: Date.now(),
        size: text.length,
        duration: Math.round(performance.now() - start)
      }
    }

    onFeedback?.(result)

    return result
  }

  private async readImpl(): Promise<ClipboardResult[]> {
    this._stats.operations++

    if (!this.supportsClipboardAPI) {
      return [{
        data: null,
        success: false,
        method: 'fallback',
        error: 'Read not supported',
        metadata: { timestamp: Date.now(), size: 0, duration: 0 }
      }]
    }

    try {
      const text = await (navigator as any).clipboard.readText()

      return [{
        data: text,
        success: true,
        method: 'clipboard',
        metadata: {
          timestamp: Date.now(),
          size: text.length,
          duration: 0
        }
      }]
    } catch {
      return [{
        data: null,
        success: false,
        method: 'clipboard',
        error: 'Read failed',
        metadata: {
          timestamp: Date.now(),
          size: 0,
          duration: 0
        }
      }]
    }
  }
}

/**
 * Typical Clipboard Usage Scenarios
 *
 * @example
 * // Initialization
 * const clipboard = new Clipboard()
 * const utils = new ClipboardUtils(clipboard)
 *
 * @example
 * // 1. Copy the current URL
 * await utils.copyCurrentUrl() // Will change the title to '✅ Copied'
 *
 * @example
 * // 2. Copy selected text
 * await utils.copySelection()
 *
 * @example
 * // 3. Copy the content of an element
 * await utils.copyElement(document.querySelector('.code-block')!)
 *
 * @example
 * // 4. Mass copying
 * await utils.copyMultiple(['URL1', 'URL2', 'URL3'])
 *
 * @example
 * // 5. Markdown link
 * await utils.copyMarkdownLink('https://example.com', 'Example')
 *
 * @example
 * // 6. Automatic button binding
 * utils.autoBindCopyButtons('.copy-btn', (btn) => btn.dataset.targetText || '')
 *
 * @example
 * // 7. Copy the table to CSV
 * await utils.copyTableToCsv(document.querySelector('table')!)
 *
 * @example
 * // 8. Insert and process
 * utils.pasteAndProcess((text) => {
 *   console.log('Text inserted:', text)
 * })
 */
export class ClipboardUtils
{
  private clipboard: Clipboard

  constructor(clipboardInstance?: Clipboard) {
    this.clipboard = clipboardInstance ?? new Clipboard()
  }

  /**
   * Copies the current page URL
   */
  async copyCurrentUrl(options?: ClipboardOptions): Promise<ClipboardResult> {
    return this.clipboard.write(window.location.href, {
      onFeedback: (result) => {
        if (result.success) {
          document.title = '✅ Скопировано | ' + document.title
          setTimeout(() => document.title = document.title.replace('✅ Скопировано | ', ''), 2000)
        }
        options?.onFeedback?.(result)
      },
      ...options
    })
  }

  /**
   * Copies the selected text
   */
  async copySelection(options?: ClipboardOptions): Promise<ClipboardResult> {
    const selection = document.getSelection()
    const text = selection?.toString()?.trim()

    if (!text) {
      return {
        data: null,
        success: false,
        method: 'fallback',
        error: 'Нет выделенного текста',
        metadata: {
          timestamp: Date.now(),
          size: 0,
          duration: 0
        }
      }
    }

    return this.clipboard.write(text, options);
  }

  /**
   * Copies the content of the element
   */
  async copyElement(element: HTMLElement, options?: ClipboardOptions): Promise<ClipboardResult> {
    const text = element.textContent || element.innerText || ''
    return this.clipboard.write(text.trim(), options)
  }

  /**
   * Copies multiple texts sequentially with a pause
   */
  async copyMultiple(texts: string[], options?: ClipboardOptions): Promise<ClipboardResult[]> {
    const results: ClipboardResult[] = []
    const feedback = options?.onFeedback

    for (const [index, text] of texts.entries()) {
      const result = await this.clipboard.write(text, {
        onFeedback: (r) => {
          feedback?.(r)
        }
      })

      results.push(result)

      if (index < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return results
  }

  /**
   * Puts from the buffer and performs the action
   */
  async pasteAndProcess(processor: (text: string) => void): Promise<void> {
    const results = await this.clipboard.read()
    const text = results[0]?.data

    if (text) {
      processor(text)
    }
  }

  /**
   * Copies as Markdown link format
   */
  async copyMarkdownLink(url: string, title: string, options?: ClipboardOptions): Promise<ClipboardResult> {
    return this.clipboard.write(`[${title}](${url})`, options)
  }

  /**
   * Automatic binding of clipboard functionality
   */
  autoBindCopy(selector: string, getTextFn?: (el: HTMLElement) => string): void {
    document.querySelectorAll<HTMLElement>(selector).forEach(el => {
      el.addEventListener('click', async (e) => {
        e.preventDefault()

        const text = getTextFn?.(el)
          || el.dataset.text
          || el.textContent
          || el.getAttribute('href')
          || ''

        if (!text) return

        el.textContent = '⏳'
        el.setAttribute('aria-disabled', 'true')

        const result = await this.clipboard.write(text)

        el.textContent = result.success ? '✅' : '❌'
        setTimeout(() => {
          el.textContent = '📋'
          el.removeAttribute('aria-disabled')

          if ('disabled' in el) {
            el.disabled = false
          }
        }, 1500)
      })
    })
  }

  /**
   * Copies the contents of the table to CSV
   */
  async copyTableToCsv(table: HTMLTableElement, options?: ClipboardOptions): Promise<ClipboardResult> {
    let csv = ''

    const headerRow = table.querySelector('thead tr')
    if (headerRow) {
      csv += Array.from(headerRow.querySelectorAll('th, td'))
        .map(cell => `"${cell.textContent?.trim().replace(/"/g, '""') || ''}"`)
        .join(',') + '\n'
    }

    const rows = table.querySelectorAll('tbody tr')
    for (const row of Array.from(rows)) {
      csv += Array.from(row.querySelectorAll('td'))
        .map(cell => `"${cell.textContent?.trim().replace(/"/g, '""') || ''}"`)
        .join(',') + '\n'
    }

    return this.clipboard.write(csv.trim(), options)
  }
}
