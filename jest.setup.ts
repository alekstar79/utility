import { TextEncoder, TextDecoder } from 'util'
import '@testing-library/jest-dom'

// TextEncoder/TextDecoder
;(global as any).TextEncoder = TextEncoder
;(global as any).TextDecoder = TextDecoder

// Mock requestIdleCallback
;(global as any).requestIdleCallback = (cb: Function) => {
  return setTimeout(() => cb({ didTimeout: false }), 0)
}

;(global as any).cancelIdleCallback = (id: any) => {
  clearTimeout(id)
}

// URL.createObjectURL и revokeObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  configurable: true,
  writable: true,
  value: jest.fn((_: Blob) => `blob:mock`)
})

Object.defineProperty(URL, 'revokeObjectURL', {
  configurable: true,
  writable: true,
  value: jest.fn()
})

if (typeof global.Intl === 'undefined') {
  global.Intl = require('intl')
}

// Mock HTMLElement properties needed for fullscreen API
Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
  writable: true,
  value: jest.fn(),
})

Object.defineProperty(HTMLElement.prototype, 'webkitRequestFullscreen', {
  writable: true,
  value: jest.fn(),
})

Object.defineProperty(HTMLElement.prototype, 'mozRequestFullScreen', {
  writable: true,
  value: jest.fn(),
})

Object.defineProperty(HTMLElement.prototype, 'msRequestFullscreen', {
  writable: true,
  value: jest.fn(),
})

// Mock Event class
// Object.defineProperty(global, 'Event', {
//   value: class Event {
//     type: string;
//
//     constructor(type: string) {
//       this.type = type;
//     }
//   },
//   writable: true,
// })

// Object.defineProperty(global, 'navigator', {
//   value: {
//     userAgent: 'Mozilla/5.0',
//   },
//   writable: true,
// })

// class MockWorker {
//   public onmessage: ((event: any) => void) | null = null
//   public onerror: ((event: any) => void) | null = null
//
//   constructor() {
//     if (!(MockWorker as any).instances) {
//       (MockWorker as any).instances = []
//     }
//
//     (MockWorker as any).instances.push(this)
//   }
//
//   postMessage(data: any) {
//     setTimeout(() => {
//       if (this.onmessage) {
//         this.onmessage({ data })
//       }
//     }, 0)
//   }
//
//   terminate() {
//     this.onmessage = null
//     this.onerror = null
//   }
//
//   simulateMessage(response: any) {
//     if (this.onmessage) {
//       this.onmessage({ data: response })
//     }
//   }
//
//   simulateError(error: Error) {
//     if (this.onerror) {
//       this.onerror({ error })
//     }
//   }
// }

// (global as any).Worker = MockWorker

// class MockBlob {
//   constructor(public parts: any[], public options: any) {}
//   get size() { return 0; }
//   get type() { return this.options?.type || ''; }
//   arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); }
//   stream() { return new ReadableStream(); }
//   text() { return Promise.resolve(''); }
//   slice() { return new MockBlob([], {}); }
// }

// global.Blob = MockBlob as any

// FileReader
// ;(global as any).FileReader = jest.fn(() => {
//   const reader: any = {
//     onload: null,
//     onerror: null,
//     result: null,
//     readyState: FileReader.DONE
//   }
//
//   reader.readAsText = jest.fn((_: File) => {
//     setImmediate(() => {
//       reader.result = 'Hello World'
//       if (reader.onload) reader.onload({ target: reader } as any)
//     })
//   })
//
//   reader.readAsDataURL = jest.fn((file: File) => {
//     setImmediate(() => {
//       reader.result = `data:${file.type};base64,${btoa('data')}`
//       if (reader.onload) reader.onload({ target: reader } as any)
//     });
//   })
//
//   return reader
// })

// DataTransfer и DragEvent
// class MockDataTransfer {
//   files: FileList = { length: 0, item: () => null } as any;
//   items: DataTransferItemList = {
//     length: 0,
//     add: jest.fn(),
//     clear: jest.fn(),
//     remove: jest.fn(),
//     [Symbol.iterator]: () => [] as any
//   } as any;
//   types: string[] = [];
//   setData = jest.fn()
//   getData = jest.fn(() => '')
//   clearData = jest.fn()
// }

// (global as any).DataTransfer = MockDataTransfer;
// (global as any).DragEvent = class extends Event {
//   dataTransfer = new MockDataTransfer()
//   constructor(type: string) { super(type) }
// }

// Object.defineProperty(HTMLInputElement.prototype, 'showPicker', {
//   configurable: true,
//   writable: true,
//   value: jest.fn().mockResolvedValue(document.createElement('input'))
// })

// Подавляем jsdom warnings (navigation, scrollTo, etc.)
// const { error: consoleError } = console
// console.error = (...args: any[]) => {
//   const message = args[0]?.toString?.() || ''
//   if (message.includes('Not implemented') || message.includes('navigation')) {
//     return
//   }
//   consoleError.call(console, ...args)
// }
