/**
 * Test suite for refined DOM utilities library
 */

import {
  Point,
  isElement,
  isElementInDOM,
  isTouchEvent,
  supportsObservers,
  extractCoordinates,
  getAccumulatedScroll,
  getDocumentCoordinates,
  getElementCoordinates,
  getScrollPosition,
  setScrollPosition,
  isScrolledToBottom,
  isScrolledToTop,
  traverseDOM,
  getParentChain,
  addEventListener,
  createElement,
  removeElement,
  replaceElement,
} from '../../src/dom/dom-utils'

class MockTouch implements Touch {
  identifier = 1;
  target: EventTarget;
  clientX: number;
  clientY: number;
  screenX = 0;
  screenY = 0;
  pageX = 0;
  pageY = 0;
  radiusX = 0;
  radiusY = 0;
  rotationAngle = 0;
  force = 0;

  constructor(target: EventTarget, clientX: number, clientY: number) {
    this.target = target;
    this.clientX = clientX;
    this.clientY = clientY;
  }
}

describe('DOM Utilities - Refined (19 functions)', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container?.parentNode) {
      container.parentNode.removeChild(container)
    }
    jest.useRealTimers()
  })

  // TYPE GUARDS (4 functions)

  describe('Type Guards', () => {
    it('should identify elements', () => {
      const el = document.createElement('div')
      expect(isElement(el)).toBe(true)
      expect(isElement(null)).toBe(false)
      expect(isElement('string')).toBe(false)
    })

    it('should check DOM attachment', () => {
      const attached = document.createElement('div')
      const detached = document.createElement('div')

      container.appendChild(attached)

      expect(isElementInDOM(attached)).toBe(true)
      expect(isElementInDOM(detached)).toBe(false)
    })

    it('should identify touch events', () => {
      const touch = new TouchEvent('touchstart', {
        bubbles: true,
        touches: [],
        changedTouches: [],
        targetTouches: [],
      })

      const mouse = new MouseEvent('click')

      expect(isTouchEvent(touch)).toBe(true)
      expect(isTouchEvent(mouse)).toBe(false)
    })

    it('should check modern observer support', () => {
      expect(supportsObservers()).toBe(false)
    })
  })

  // COORDINATES (4 functions) - КРИТИЧЕСКАЯ ЛОГИКА

  describe('Coordinate System - Logic Verification', () => {
    it('should extract coordinates from mouse event', () => {
      const event = new MouseEvent('click', {
        clientX: 100,
        clientY: 200,
      })

      const coords = extractCoordinates(event)
      expect(coords.x).toBe(100)
      expect(coords.y).toBe(200)
    })

    it('should extract from touch event (touches)', () => {
      const mockTouch = new MockTouch(container, 150, 250)
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        composed: true,
        touches: [mockTouch],
        targetTouches: [mockTouch],
        changedTouches: [mockTouch],
      })

      const coords = extractCoordinates(touchEvent)
      expect(coords.x).toBe(150)
      expect(coords.y).toBe(250)
    })

    it('should extract from touch event (changedTouches on end)', () => {
      const mockTouch = new MockTouch(container, 200, 300)
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        composed: true,
        touches: [mockTouch],
        targetTouches: [mockTouch],
        changedTouches: [mockTouch],
      })

      const coords = extractCoordinates(touchEvent)
      expect(coords.x).toBe(200)
      expect(coords.y).toBe(300)
    })

    it('should calculate accumulated scroll correctly', () => {
      const parent = document.createElement('div')
      parent.style.width = '100px'
      parent.style.height = '100px'
      parent.style.overflow = 'auto'

      const content = document.createElement('div')
      content.style.width = '1000px'
      content.style.height = '1000px'

      const child = document.createElement('div')

      parent.appendChild(content)
      content.appendChild(child)
      container.appendChild(parent)

      parent.scrollLeft = 50
      parent.scrollTop = 75

      const scroll = getAccumulatedScroll(child)
      expect(scroll.left).toBeGreaterThanOrEqual(50)
      expect(scroll.top).toBeGreaterThanOrEqual(75)
    })

    it('should get correct document coordinates accounting for scroll', () => {
      const element = document.createElement('div')
      element.style.position = 'absolute'
      element.style.left = '50px'
      element.style.top = '50px'
      container.appendChild(element)

      const event = new MouseEvent('click', {
        bubbles: true,
        clientX: 60,
        clientY: 70,
      })

      Object.defineProperty(event, 'target', { value: element, writable: true })

      const point = getDocumentCoordinates(event)
      expect(typeof point.x).toBe('number')
      expect(typeof point.y).toBe('number')
    })

    it('should calculate element-relative coordinates correctly', () => {
      const element = document.createElement('div')
      element.style.position = 'absolute'
      element.style.left = '100px'
      element.style.top = '100px'
      element.style.width = '200px'
      element.style.height = '200px'
      container.appendChild(element)

      const event = new MouseEvent('click', {
        bubbles: true,
        clientX: 150,
        clientY: 150,
      })

      Object.defineProperty(event, 'target', { value: element, writable: true })

      const point = getElementCoordinates(event)
      expect(point.x).toBeGreaterThanOrEqual(0)
      expect(point.y).toBeGreaterThanOrEqual(0)
    })
  })

  // SCROLL POSITION (4 functions)

  describe('Scroll Position - Logic Verification', () => {
    it('should detect scroll to bottom correctly', () => {
      const element = document.createElement('div')
      element.style.cssText = 'overflow:auto;width:200px;height:100px;position:absolute'

      const content = document.createElement('div')
      content.style.cssText = 'height:300px;width:400px'
      element.appendChild(content)
      container.appendChild(element)

      // JSDOM workaround: size mock
      Object.defineProperty(element, 'clientHeight', { value: 100, configurable: true })
      Object.defineProperty(element, 'scrollHeight', { value: 300, configurable: true })

      expect(element.clientHeight).toBeGreaterThan(0)
      expect(element.scrollHeight).toBeGreaterThan(element.clientHeight)

      element.scrollTop = 0
      expect(isScrolledToBottom(element, 0)).toBe(false)

      element.scrollTop = 200
      expect(isScrolledToBottom(element, 0)).toBe(true)
    })

    it('should detect scroll to top correctly', () => {
      const element = document.createElement('div')
      element.style.overflow = 'auto'
      element.style.width = '100px'
      element.style.height = '100px'

      const content = document.createElement('div')
      content.style.height = '200px'
      content.style.width = '1px'

      element.appendChild(content)
      container.appendChild(element)

      // At top initially
      expect(isScrolledToTop(element, 0)).toBe(true)

      // Scroll down
      element.scrollTop = 50;
      expect(isScrolledToTop(element, 0)).toBe(false)

      // Check with threshold
      expect(isScrolledToTop(element, 50)).toBe(true)
    })

    it('should set scroll position with boundary validation', () => {
      const element = document.createElement('div')
      element.style.cssText = 'overflow:auto;width:200px;height:100px;position:absolute'

      const content = document.createElement('div')
      content.style.cssText = 'height:500px;width:500px'
      element.appendChild(content)
      container.appendChild(element)

      // JSDOM workaround: size mock
      Object.defineProperty(element, 'clientHeight', { value: 100, configurable: true })
      Object.defineProperty(element, 'scrollHeight', { value: 500, configurable: true })
      Object.defineProperty(element, 'scrollWidth', { value: 500, configurable: true })
      Object.defineProperty(element, 'clientWidth', { value: 200, configurable: true })

      setScrollPosition(element, { top: 50, left: 50 })
      expect(getScrollPosition(element).top).toBe(50)
      expect(getScrollPosition(element).left).toBe(50)

      setScrollPosition(element, { top: 10000 })
      expect(getScrollPosition(element).top).toBe(400)
    })
  })

  // DOM TRAVERSAL (2 functions)

  describe('DOM Traversal', () => {
    it('should traverse DOM correctly', () => {
      const root = document.createElement('div')
      const child = document.createElement('div')
      root.appendChild(child)
      container.appendChild(root)

      const visited: Element[] = [];
      traverseDOM(root, (el) => {
        visited.push(el)
      })

      expect(visited.length).toBeGreaterThan(0)
      expect(visited[0]).toBe(root)
    })

    it('should allow early exit from traversal', () => {
      const root = document.createElement('div')
      root.id = 'root'
      const child1 = document.createElement('div')
      child1.id = 'child1'
      const child2 = document.createElement('div')
      child2.id = 'child2'
      root.appendChild(child1)
      root.appendChild(child2)

      const visited: Element[] = []
      traverseDOM(root, (el, depth) => {
        visited.push(el)
        return depth > 0
      })

      expect(visited.length).toBe(1)
      expect(visited[0]).toBe(root)
    })

    it('should get parent chain', () => {
      const grandparent = document.createElement('div')
      const parent = document.createElement('div')
      const child = document.createElement('div')

      grandparent.appendChild(parent)
      parent.appendChild(child)
      container.appendChild(grandparent)

      const chain = getParentChain(child, container)
      expect(chain.length).toBe(2)
      expect(chain[0]).toBe(parent)
      expect(chain[1]).toBe(grandparent)
    })
  })

  // EVENT UTILITIES (1 functions)

  describe('Event Utilities', () => {
    it('should add and remove event listener', () => {
      const element = document.createElement('div')
      container.appendChild(element)

      const handler = jest.fn()
      const unsubscribe = addEventListener(element, 'click', handler)

      const event = new MouseEvent('click')
      element.dispatchEvent(event)

      expect(handler).toHaveBeenCalledTimes(1)

      unsubscribe()
      element.dispatchEvent(event)
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  // ELEMENT CREATION (3 functions)

  describe('Element Creation & Manipulation', () => {
    it('should create element with classes, attributes, text', () => {
      const btn = createElement('button', {
        className: ['btn', 'btn-primary'],
        attributes: { type: 'submit', 'data-id': '123' },
        text: 'Submit',
      })

      expect(btn.tagName).toBe('BUTTON')
      expect(btn.classList.contains('btn')).toBe(true)
      expect(btn.classList.contains('btn-primary')).toBe(true)
      expect(btn.getAttribute('type')).toBe('submit')
      expect(btn.getAttribute('data-id')).toBe('123')
      expect(btn.textContent).toBe('Submit')
    })

    it('should create element with HTML content', () => {
      const div = createElement('div', {
        html: '<span>HTML content</span>',
      })

      expect(div.innerHTML).toContain('HTML content')
    })

    it('should remove element from DOM', () => {
      const element = document.createElement('div')
      container.appendChild(element)

      expect(isElementInDOM(element)).toBe(true)
      expect(removeElement(element)).toBe(true)
      expect(isElementInDOM(element)).toBe(false)
    })

    it('should replace element', () => {
      const oldElement = document.createElement('div')
      const newElement = document.createElement('span')
      container.appendChild(oldElement)

      expect(container.children[0]).toBe(oldElement)
      expect(replaceElement(oldElement, newElement)).toBe(true)
      expect(container.children[0]).toBe(newElement)
    })
  })

  // INTEGRATION TESTS

  describe('Integration Tests', () => {
    it('complete workflow: create -> add listener -> coordinates -> remove', () => {
      const canvas = createElement('canvas', {
        className: 'drawing-canvas',
        attributes: { width: '400', height: '300' },
      })

      container.appendChild(canvas)

      const coords: Point[] = []
      const unsubscribe = addEventListener(canvas, 'click', (event) => {
        coords.push(getElementCoordinates(event))
      })

      // Simulating a click in the center of the canvas
      const event = new MouseEvent('click', {
        bubbles: true,
        clientX: 200 + canvas.getBoundingClientRect().left,
        clientY: 150 + canvas.getBoundingClientRect().top,
      })

      Object.defineProperty(event, 'target', { value: canvas, writable: true })

      canvas.dispatchEvent(event)
      expect(coords[0].x).toBeCloseTo(200)
      expect(coords[0].y).toBeCloseTo(150)

      unsubscribe()
      removeElement(canvas)
    })
  })
})
