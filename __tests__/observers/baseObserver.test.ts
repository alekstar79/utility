import { BaseObserver } from '../../src/observers/baseObserver'

class TestObserver extends BaseObserver<MutationRecord>
{
  protected initialize(): void
  {
    // basic initialization; a specific observer is substituted in tests
  }
}

describe('BaseObserver', () => {
  let target: HTMLElement

  beforeEach(() => {
    document.body.innerHTML = '<div id="target"></div>'
    target = document.getElementById('target') as HTMLElement
  })

  test('наблюдает элемент и сохраняет callback', () => {
    const cb = jest.fn()
    const observer = new TestObserver(cb)

    observer.observe(target)
    expect(observer.isObserving(target)).toBe(true)
    expect(observer.getObservedCount()).toBe(1)
  })

  test('не наблюдает невалидные элементы и дубликаты', () => {
    const cb = jest.fn()
    const observer = new TestObserver(cb)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    observer.observe(null as any)
    expect(observer.getObservedCount()).toBe(0)

    observer.observe(target)
    observer.observe(target) // повторное добавление
    expect(observer.getObservedCount()).toBe(1)
  })

  test('unobserve удаляет элемент и callback', () => {
    const cb = jest.fn()
    const observer = new TestObserver(cb)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(observer as any).observer = {
      unobserve: jest.fn()
    }

    observer.observe(target)
    expect(observer.isObserving(target)).toBe(true)

    observer.unobserve(target)
    expect(observer.isObserving(target)).toBe(false)
    expect(observer.getObservedCount()).toBe(0)
  })

  test('disconnect очищает все внутренние структуры', () => {
    const cb = jest.fn()
    const observer = new TestObserver(cb)

    observer.observe(target)
    observer.disconnect()

    expect(observer.isObserving(target)).toBe(false)
    expect(observer.getObservedCount()).toBe(0)
  })

  test('takeRecords безопасно работает при отсутствии observer', () => {
    const cb = jest.fn()
    const observer = new TestObserver(cb)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(observer as any).observer = null

    const records = observer.takeRecords()
    expect(records).toEqual([])
  })
})
