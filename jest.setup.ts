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
