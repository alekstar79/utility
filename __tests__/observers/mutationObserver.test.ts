import {
  MutationObserverWrapper,
  createMutationObserver,
  createMutationObserverMultiple
} from '../../src/observers/mutationObserver'

describe('MutationObserverWrapper', () => {
  let target: HTMLElement

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"><span id="target"></span></div>'
    target = document.getElementById('target') as HTMLElement
  })

  test('initialize логирует ошибку, если API не поддерживается', () => {
    const original = global.MutationObserver
    // @ts-expect-no-error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.MutationObserver = undefined
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // конструктор вызовет initialize
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const observer = new MutationObserverWrapper(() => {})

    expect(consoleSpy).toHaveBeenCalledWith('[MutationObserver] API not supported')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((observer as any).observer).toBeNull()

    consoleSpy.mockRestore()
    global.MutationObserver = original
  })

  test('createMutationObserver вызывает callback при изменении', async () => {
    const callback = jest.fn()

    const observer = createMutationObserver(target, callback)

    target.textContent = 'changed'
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(callback).toHaveBeenCalled()

    observer.disconnect()
  })

  test('createMutationObserverMultiple наблюдает несколько элементов', async () => {
    const callback = jest.fn()
    const a = document.createElement('div')
    const b = document.createElement('div')
    document.body.append(a, b)

    const observer = createMutationObserverMultiple(
      [a, b],
      callback,
      { childList: true }
    )

    a.textContent = '1'
    b.textContent = '2'
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(callback).toHaveBeenCalled()

    observer.disconnect()
  })
})

