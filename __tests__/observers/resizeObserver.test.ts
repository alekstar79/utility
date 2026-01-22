import {
  ResizeObserverWrapper,
  createResizeObserver,
  createResizeObserverMultiple
} from '../../src/observers/resizeObserver'

describe('ResizeObserverWrapper', () => {
  let originalResizeObserver: typeof ResizeObserver
  let mockEntries: ResizeObserverEntry[]

  beforeAll(() => {
    originalResizeObserver = global.ResizeObserver

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(global as any).ResizeObserver = jest.fn((cb: ResizeObserverCallback) => {
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
        takeRecords: () => mockEntries,
        trigger(entries: ResizeObserverEntry[]) {
          mockEntries = entries
          cb(entries, this as unknown as ResizeObserver)
        }
      } as unknown as ResizeObserver
    })
  })

  afterAll(() => {
    global.ResizeObserver = originalResizeObserver
  })

  beforeEach(() => {
    mockEntries = []
    document.body.innerHTML = '<div id="target" style="width: 100px; height: 50px;"></div>'
  })

  test('initialize логирует ошибку, если API не поддерживается', () => {
    const original = global.ResizeObserver
    // @ts-expect-no-error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.ResizeObserver = undefined
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const observer = new ResizeObserverWrapper(() => {})
    expect(consoleSpy).toHaveBeenCalledWith('[ResizeObserver] API not supported')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((observer as any).observer).toBeNull()

    consoleSpy.mockRestore()
    global.ResizeObserver = original
  })

  test('getContentRect и getDimensions возвращают корректные значения', () => {
    const target = document.getElementById('target') as HTMLElement
    const cb = jest.fn()
    const wrapper = new ResizeObserverWrapper(cb)

    wrapper.observe(target)

    const instance = (global.ResizeObserver as unknown as jest.Mock).mock
      .results[0].value as unknown as { trigger: (e: ResizeObserverEntry[]) => void }

    const contentRect = { width: 150, height: 75 } as DOMRectReadOnly
    instance.trigger([
      { target, contentRect } as unknown as ResizeObserverEntry
    ])

    expect(wrapper.getContentRect(target)).toBe(contentRect)
    expect(wrapper.getDimensions(target)).toEqual({ width: 150, height: 75 })

    const other = document.createElement('div')
    expect(wrapper.getContentRect(other)).toBeNull()
    expect(wrapper.getDimensions(other)).toBeNull()
  })

  test('factory-функции создают обёртки и сразу подписываются', () => {
    const target = document.getElementById('target') as HTMLElement
    const cb = jest.fn()

    const single = createResizeObserver(target, cb)
    expect(single.isObserving(target)).toBe(true)

    const a = document.createElement('div')
    const b = document.createElement('div')
    const multi = createResizeObserverMultiple([a, b], cb)
    expect(multi.isObserving(a)).toBe(true)
    expect(multi.isObserving(b)).toBe(true)
  })
})

