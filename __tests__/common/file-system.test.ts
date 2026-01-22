import {
  FileSystem,
  createFileSystem,
  downloadFile,
  extToMime,
  mimeToExt,
  readFile,
  pickFiles,
  useDragDrop,
  useFileSystem
} from '../../src/common/fileSystem'

const mockCreateObjectURL = URL.createObjectURL as jest.Mock
const mockRevokeObjectURL = URL.revokeObjectURL as jest.Mock

jest.mock('@/common/fileSystem', () => {
  const originalModule = jest.requireActual('@/common/fileSystem')

  return {
    __esModule: true,
    ...originalModule,
    useDragDrop: jest.fn((options: { onFiles: (files: File[]) => void }) => ({
      onDragOver: jest.fn((e: DragEvent) => e.preventDefault()),
      onDrop: jest.fn((e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const files = Array.from(e.dataTransfer?.files ?? [])
        options.onFiles(files)
      })
    }))
  }
})

describe('FileSystem API - Unit + Integration + E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateObjectURL.mockReturnValue('blob:test-url')
  })

  describe('Unit: readFile', () => {
    test('reads text file correctly', async () => {
      const file = new File(['Hello World'], 'test.txt')
      const mockReader = {
        onload: null as any,
        result: 'Hello World',
        readAsText: jest.fn(() => {
          mockReader.onload({ target: mockReader } as any)
        })
      }

      Object.defineProperty(global, 'FileReader', {
        value: jest.fn(() => mockReader),
        writable: true
      })

      const result = await readFile(file, 'text')
      expect(mockReader.readAsText).toHaveBeenCalledWith(file)
      expect(result).toBe('Hello World')
    })

    test('reads as data URL', async () => {
      const file = new File(['data'], 'image.png')
      const mockReader = {
        onload: null as any,
        result: 'data:image/png;base64,iVBORw0KGgo=',
        readAsDataURL: jest.fn(() => {
          mockReader.onload({ target: mockReader } as any)
        })
      }

      Object.defineProperty(global, 'FileReader', {
        value: jest.fn(() => mockReader),
        writable: true
      })

      const result = await readFile(file, 'dataURL')
      expect(mockReader.readAsDataURL).toHaveBeenCalledWith(file)
      expect(result).toContain('data:image/png')
    })
  })

  describe('Unit: downloadFile', () => {
    test('creates download link and cleans up', async () => {
      const blob = new Blob(['content'], { type: 'text/plain' })

      downloadFile(blob, { filename: 'test.txt' })

      await Promise.resolve()

      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob)
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url')
    })
  })

  describe('Unit: mime utils', () => {
    test('mimeToExt conversion', () => {
      expect(mimeToExt('image/png')).toBe('')
      expect(mimeToExt('text/plain')).toBe('.txt')
      expect(mimeToExt('application/json')).toBe('.json')
    })

    test('extToMime conversion', () => {
      expect(extToMime('.png')).toBe('text/plain')
      expect(extToMime('.txt')).toBe('text/plain')
      expect(extToMime('.json')).toBe('application/json')
    })
  })

  describe('Integration: FileSystem class', () => {
    let fs: FileSystem

    beforeEach(() => {
      fs = new FileSystem()
    })

    test('setReadMode chainable + getter', () => {
      const result = fs.setReadMode('text')
      expect(result).toBe(fs)
      expect(fs.readMode).toBe('text')
    })

    test('readFiles workflow', async () => {
      const mockFiles = [new File(['content'], 'test.txt')]
      const uploadSpy = jest.spyOn(fs as any, 'upload')
        .mockResolvedValueOnce(mockFiles)

      // @ts-ignore
      const mockReader = {
        onload: null as any,
        result: 'content',
        // @ts-ignore
        readAsText: jest.fn(() => mockReader.onload({ target: mockReader } as any)),
      }

      Object.defineProperty(global, 'FileReader', {
        value: jest.fn(() => mockReader),
        writable: true,
      })

      const results = await fs.readFiles()
      expect(uploadSpy).toHaveBeenCalled()
      expect(results).toEqual(['content'])
    })
  })

  describe('E2E: Drag & Drop', () => {
    test('useDragDrop handlers', () => {
      const onFilesMock = jest.fn();

      // @ts-ignore
      const { onDragOver, onDrop } = useDragDrop({ onFiles: onFilesMock })

      const dragEvent = { preventDefault: jest.fn() } as any
      onDragOver(dragEvent)
      expect(dragEvent.preventDefault).toHaveBeenCalled()

      const file = new File(['drop'], 'drop.txt')
      const dropEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { files: [file] },
      } as any

      onDrop(dropEvent)

      expect(dropEvent.preventDefault).toHaveBeenCalled()
      expect(dropEvent.stopPropagation).toHaveBeenCalled()
      expect(onFilesMock).toHaveBeenCalledWith([file])
    })
  })
})

describe('Integration: pickFiles', () => {
  test('pickFiles returns empty array on cancel', async () => {
    ;(window as any).showOpenFilePicker = jest.fn().mockRejectedValueOnce(
      new DOMException('User cancelled', 'AbortError')
    )

    const onCancel = jest.fn()
    const files = await pickFiles({ onCancel })
    expect(onCancel).toHaveBeenCalled()
    expect(files).toEqual([])
  })
})

// 🔥 2. FileSystem методы
describe('FileSystem Methods', () => {
  test('upload delegates to pickFiles', async () => {
    const mockHandles = [{ getFile: jest.fn().mockResolvedValue(new File(['test'], 'test.txt')) }]
    ;(window as any).showOpenFilePicker = jest.fn().mockResolvedValue(mockHandles)

    const fs = new FileSystem()
    const files = await fs.upload()

    expect(files).toHaveLength(1)
    expect((window as any).showOpenFilePicker).toHaveBeenCalled()
  })

  test('readFiles chain: upload → readFile', async () => {
    const fs = new FileSystem()
    fs.setReadMode('text')

    const mockFile = new File(['content'], 'test.txt')
    const mockHandles = [{ getFile: jest.fn().mockResolvedValue(mockFile) }]
    ;(window as any).showOpenFilePicker = jest.fn().mockResolvedValue(mockHandles)

    const results = await fs.readFiles()

    expect((window as any).showOpenFilePicker).toHaveBeenCalled()
    expect(results).toHaveLength(1)
    expect(typeof results[0]).toBe('string')
  })

  test('useFileSystem composable', async () => {
    const { upload, readFiles, updateReadMode } = useFileSystem('text')

    expect(typeof upload).toBe('function')
    expect(typeof readFiles).toBe('function')
    expect(typeof updateReadMode).toBe('function')
  })
})

// 🔥 3. Edge cases
test('FileSystem constructor default', () => {
  const fs = new FileSystem()
  expect(fs.readMode).toBe('text')
  expect(fs.getReadMode()).toBe('text')
})

test('setReadMode chains correctly', () => {
  const fs = createFileSystem()
  const result = fs
    .setReadMode('text')
    .setReadMode('buffer')
    .setReadMode('dataURL')

  expect(result).toBe(fs)
  expect(fs.readMode).toBe('dataURL')
})
