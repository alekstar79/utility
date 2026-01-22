/**
 * Modern File API system (Pure TS + Vue/React Composable)
 * File System Access API + Fallbacks + Progress + Drag&Drop
 *
 * @example
 * // 1. Pure TS
 * const fs = createFileSystem().setReadMode('json')
 * const files = await fs.upload({ types: ['json'] })
 *
 * // 2. Framework Composable
 * const { upload, readFiles } = useFileSystem()
 *
 * // Vue 3
 * const readAs = ref('text')
 * const { upload, readFiles, updateReadMode } = useFileSystem(readAs.value)
 * updateReadMode('json', v => readAs.value = v)
 *
 * // React
 * const [readAs, setReadAs] = useState('text')
 * const { upload, updateReadMode } = useFileSystem(readAs)
 * updateReadMode('json', setReadAs)
 *
 * // Cancellation handling
 * const files = await upload({
 *   types: ['json'],
 *   onCancel: () => console.log('User canceled')
 * })
 */

export type ReadMode = 'buffer' | 'text' | 'dataURL' | 'arrayBuffer';

// FileType как union type (один раз объявляем)
export type FileType = 'json' | 'pdf' | 'txt' | 'csv';

// Framework-agnostic Composable
export interface UseFileSystemReturn {
  readAs: ReadMode;
  updateReadMode: (mode: ReadMode, setter: (mode: ReadMode) => void) => void;
  upload: (options?: FileOptions) => Promise<File[]>;
  readFiles: (options?: FileOptions, mode?: ReadMode) => Promise<(string | ArrayBuffer)[]>;
  read: (file: File, mode?: ReadMode) => Promise<string | ArrayBuffer>;
  download: (data: string | Blob | ArrayBuffer, options?: DownloadOptions) => void;
  dragDrop: (onFiles: (files: File[]) => void) => ReturnType<typeof useDragDrop>;
}

export interface FileOptions {
  multiple?: boolean;
  capture?: boolean;
  types?: FileType[];
  onCancel?: () => void;
}

export interface DownloadOptions {
  filename?: string;
  type?: FileType;
}

export interface ReadProgress {
  progress: number;
  total: number;
  loaded: number;
}

// MIME types with extensions (the only source of FileType)
export const MIME_TYPES: Record<FileType, { mime: string; ext: string }> = {
  json: { mime: 'application/json', ext: '.json' },
  pdf: { mime: 'application/pdf', ext: '.pdf' },
  txt: { mime: 'text/plain', ext: '.txt' },
  csv: { mime: 'text/csv', ext: '.csv' }
} as const;

// FileType Constants
export const FileType = {
  JSON: 'json' as const,
  PDF: 'pdf' as const,
  TXT: 'txt' as const,
  CSV: 'csv' as const
} as const;

// Universal FileReader with progress
export const readFile = <T = string | ArrayBuffer>(
  file: File,
  mode: ReadMode = 'text',
  onProgress?: (progress: ReadProgress) => void
): Promise<T> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    if (onProgress) {
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress({
            progress: e.loaded / e.total,
            loaded: e.loaded,
            total: e.total
          })
        }
      }
    }

    reader.onload = () => resolve(reader.result as T)
    reader.onerror = reject

    switch (mode) {
      case 'text':
        reader.readAsText(file)
        break;
      case 'dataURL':
        reader.readAsDataURL(file)
        break;
      case 'arrayBuffer':
        reader.readAsArrayBuffer(file)
        break;
      default:
        reader.readAsText(file)
    }
  })

// File Picker with cancellation processing
export const pickFiles = async (options: FileOptions = {}): Promise<File[]> => {
  // File System Access API
  if ('showOpenFilePicker' in window) {
    try {
      const handles = await (window as any).showOpenFilePicker({
        multiple: options.multiple,
        types: options.types?.map(t => ({
          description: t.toUpperCase(),
          accept: { [MIME_TYPES[t].mime]: [] }
        })) ?? []
      })

      return Promise.all(handles.map((h: any) => h.getFile()))
    } catch (e: any) {
      if (e.name === 'AbortError') {
        options.onCancel?.()
        return []
      }
      throw e
    }
  }

  // Fallback input with cancellation
  return new Promise<File[]>(resolve => {
    const input = document.createElement('input')

    Object.assign(input, {
      type: 'file',
      multiple: options.multiple ?? false,
      accept: options.types?.map(t => MIME_TYPES[t].mime).join(',') || '*/*',
      capture: options.capture ? 'environment' : undefined,
      style: 'position:fixed;left:-9999px;top:-9999px;opacity:0;pointer-events:none'
    })

    const cleanup = () => {
      if (input.parentNode) {
        input.parentNode.removeChild(input)
      }
    }

    input.onchange = () => {
      resolve(Array.from(input.files ?? []))
      cleanup()
    }

    input.oncancel = () => {
      options.onCancel?.()
      resolve([])
      cleanup()
    }

    document.body.appendChild(input)
    input.click()
  })
}

// Download
export const downloadFile = (
  data: string | Blob | ArrayBuffer,
  options: DownloadOptions = {}
): void => {
  const blob = data instanceof Blob
    ? data
    : new Blob([String(data)], { type: MIME_TYPES[options.type ?? 'json'].mime })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  Object.assign(link, {
    href: url,
    download: `${options.filename ?? 'download'}${MIME_TYPES[options.type ?? 'json'].ext}`,
    style: 'position:fixed;left:-9999px;top:-9999px;opacity:0;pointer-events:none'
  })

  document.body.appendChild(link)
  link.click()

  Promise.resolve().then(() => {
    if (link.parentNode) {
      link.parentNode.removeChild(link)
    }

    URL.revokeObjectURL(url)
  })
}

// Drag & Drop
export const useDragDrop = (onFiles: (files: File[]) => void) => ({
  onDragOver: (e: DragEvent) => e.preventDefault(),
  onDrop: (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFiles(Array.from(e.dataTransfer?.files ?? []))
  }
})

/**
 * @class FileSystem - Main class
 */
export class FileSystem
{
  public readMode: ReadMode = 'text'

  public setReadMode(mode: ReadMode): this {
    this.readMode = mode
    return this
  }

  public getReadMode(): ReadMode {
    return this.readMode
  }

  public async upload(options: FileOptions = {}): Promise<File[]> {
    return pickFiles(options)
  }

  public async readFiles(options: FileOptions = {}): Promise<(string | ArrayBuffer)[]> {
    const files = await this.upload(options)
    return Promise.all(files.map(f => readFile(f, this.readMode)))
  }

  public read(file: File): Promise<string | ArrayBuffer> {
    return readFile(file, this.readMode)
  }

  public download(data: string | Blob | ArrayBuffer, options: DownloadOptions = {}): void {
    downloadFile(data, options)
  }

  public dragDrop(onFiles: (files: File[]) => void) {
    return useDragDrop(onFiles)
  }
}

export const createFileSystem = (): FileSystem => new FileSystem()

// Универсальный composable
export function useFileSystem(readAs: ReadMode): UseFileSystemReturn
{
  const updateReadMode = (mode: ReadMode, setter: (mode: ReadMode) => void): void => {
    setter(mode)
  }

  return {
    readAs,
    updateReadMode,
    upload: (options?: FileOptions) => pickFiles(options),
    readFiles: (options?: FileOptions, mode = readAs) =>
      pickFiles(options).then(files => Promise.all(files.map(f => readFile(f, mode)))),
    read: (file: File, mode = readAs) => readFile(file, mode),
    download: downloadFile,
    dragDrop: useDragDrop
  }
}

// Utilities
export const mimeToExt = (mime: string): string =>
  Object.values(MIME_TYPES).find(t => t.mime === mime)?.ext ?? ''

export const extToMime = (ext: string): string =>
  Object.values(MIME_TYPES).find(t => t.ext === ext)?.mime ?? 'text/plain'

// Exporting constants
export const {
  JSON: FILETYPE_JSON,
  PDF: FILETYPE_PDF,
  TXT: FILETYPE_TXT,
  CSV: FILETYPE_CSV
} = FileType
