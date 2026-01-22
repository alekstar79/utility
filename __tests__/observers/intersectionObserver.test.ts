import {
  IntersectionObserverWrapper,
  createIntersectionObserver,
  createIntersectionObserverMultiple
} from '../../src/observers/intersectionObserver'

describe('IntersectionObserverWrapper', () => {
  let originalIntersectionObserver: typeof IntersectionObserver
  let mockEntries: IntersectionObserverEntry[]

  beforeAll(() => {
    originalIntersectionObserver = global.IntersectionObserver

    // A simple implementation of IntersectionObserver for tests,
    // which allows you to manage the results using a closure.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(global as any).IntersectionObserver = jest.fn((cb: IntersectionObserverCallback) => {
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
        takeRecords: () => mockEntries,
        trigger(entries: IntersectionObserverEntry[]) {
          mockEntries = entries
          cb(entries, this as unknown as IntersectionObserver)
        }
      } as unknown as IntersectionObserver
    })
  })

  afterAll(() => {
    global.IntersectionObserver = originalIntersectionObserver
  })

  beforeEach(() => {
    mockEntries = []
    document.body.innerHTML = '<div id="target"></div>'
  })

  test('initialize логирует ошибку, если API не поддерживается', () => {
    const original = global.IntersectionObserver
    // @ts-expect-no-error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.IntersectionObserver = undefined
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const observer = new IntersectionObserverWrapper(() => {})
    expect(consoleSpy).toHaveBeenCalledWith('[IntersectionObserver] API not supported')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((observer as any).observer).toBeNull()

    consoleSpy.mockRestore()
    global.IntersectionObserver = original
  })

  test('isIntersecting возвращает true только для целевого элемента', () => {
    const target = document.getElementById('target') as HTMLElement
    const callback = jest.fn()
    const wrapper = new IntersectionObserverWrapper(callback)

    wrapper.observe(target)

    const other = document.createElement('div')
    document.body.appendChild(other)

    const instance = (global.IntersectionObserver as unknown as jest.Mock).mock
      .results[0].value as unknown as { trigger: (e: IntersectionObserverEntry[]) => void }

    instance.trigger([
      { target, isIntersecting: true, intersectionRatio: 0.5 } as unknown as IntersectionObserverEntry,
      { target: other, isIntersecting: false, intersectionRatio: 0 } as unknown as IntersectionObserverEntry
    ])

    expect(wrapper.isIntersecting(target)).toBe(true)
    expect(wrapper.isIntersecting(other)).toBe(false)
  })

  test('getIntersectionRatio возвращает ratio или 0', () => {
    const target = document.getElementById('target') as HTMLElement
    const callback = jest.fn()
    const wrapper = new IntersectionObserverWrapper(callback)

    wrapper.observe(target)

    const instance = (global.IntersectionObserver as unknown as jest.Mock).mock
      .results[0].value as unknown as { trigger: (e: IntersectionObserverEntry[]) => void }

    instance.trigger([
      { target, isIntersecting: true, intersectionRatio: 0.75 } as unknown as IntersectionObserverEntry
    ])

    expect(wrapper.getIntersectionRatio(target)).toBe(0.75)

    const other = document.createElement('div')
    expect(wrapper.getIntersectionRatio(other)).toBe(0)
  })

  test('factory-функции создают обёртки и сразу подписываются', () => {
    const target = document.getElementById('target') as HTMLElement
    const cb = jest.fn()

    const single = createIntersectionObserver(target, cb)
    expect(single.isObserving(target)).toBe(true)

    const a = document.createElement('div')
    const b = document.createElement('div')
    const multi = createIntersectionObserverMultiple([a, b], cb)
    expect(multi.isObserving(a)).toBe(true)
    expect(multi.isObserving(b)).toBe(true)
  })
})

