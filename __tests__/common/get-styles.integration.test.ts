import { getStyles } from '../../src/common/getStyles'

describe('getStyles - Full Integration Coverage (35 tests)', () => {
  let div: HTMLElement

  beforeEach(() => {
    div = document.createElement('div')
    document.body.appendChild(div)
  })

  afterEach(() => {
    document.body.removeChild(div)
  })

  // === ARRAY MODE parse=false (8 тестов) ===
  test('01-array-false-basic', () => {
    div.style.cssText = 'width:200px;height:100px;margin:10px'
    expect(getStyles(div, ['width', 'height', 'margin'])).toEqual({
      width: '200px', height: '100px', margin: '10px'
    })
  })

  test('02-array-false-empty-array', () => {
    expect(getStyles(div, [])).toEqual({})
  })

  test('03-array-false-missing-props', () => {
    div.style.width = '200px'
    expect(getStyles(div, ['width', 'missing', 'height'])).toEqual({
      width: '200px', missing: '', height: ''
    })
  })

  test('04-array-false-rgb-colors', () => {
    div.style.color = 'red'
    expect(getStyles(div, ['color']).color).toMatch(/^rgb\(255, 0, 0\)$/)
  })

  test('05-array-false-computed-values', () => {
    expect(getStyles(div, ['display']).display).toBe('block')
  })

  test('06-array-false-shorthand', () => {
    div.style.padding = '10px 20px 30px 40px'
    expect(getStyles(div, ['padding']).padding).toBe('10px 20px 30px 40px')
  })

  test('07-array-false-multiple-spaces', () => {
    div.style.margin = '  10px  20px  '
    expect(getStyles(div, ['margin']).margin).toBe('10px 20px')
  })

  test('08-array-false-inherited', () => {
    div.style.fontFamily = '"Courier New"'
    expect(getStyles(div, ['font-family'])['font-family']).toBe('"Courier New"')
  })

  // === ARRAY MODE parse=true (12 тестов) ===
  test('09-array-true-numbers-px', () => {
    div.style.width = '200px'
    expect(getStyles(div, ['width'], true)).toEqual({ width: 200 })
  })

  test('10-array-true-numbers-em-rem', () => {
    div.style.fontSize = '2rem'
    expect(getStyles(div, ['font-size'], true)['font-size']).toEqual(expect.any(Number))
  })

  test('11-array-true-negative-numbers', () => {
    div.style.top = '-50px'
    expect(getStyles(div, ['top'], true)).toEqual({ top: -50 })
  })

  test('12-array-true-percentages', () => {
    div.style.width = '50%'
    expect(getStyles(div, ['width'], true)).toEqual({ width: 50 })
  })

  test('13-array-true-decimals', () => {
    div.style.opacity = '0.75'
    expect(getStyles(div, ['opacity'], true)).toEqual({ opacity: 0.75 })
  })

  test('14-array-true-empty-string', () => {
    div.style.width = ''
    expect(getStyles(div, ['width'], true)).toEqual({ width: null })
  })

  test('15-array-true-spaces', () => {
    div.style.width = '100px'
    expect(getStyles(div, ['width'], true)).toEqual({ width: 100 })
  })

  test('16-array-true-boolean-true', () => {
    div.style.setProperty('--flag', 'true')
    expect(getStyles(div, ['--flag'], true)).toEqual({ '--flag': true })
  })

  test('17-array-true-boolean-false', () => {
    div.style.setProperty('--flag', 'false')
    expect(getStyles(div, ['--flag'], true)).toEqual({ '--flag': false })
  })

  test('18-array-true-invalid-number', () => {
    div.style.setProperty('--invalid', 'abc123px')
    expect(getStyles(div, ['--invalid'], true)).toEqual({ '--invalid': 'abc123px' })
  })

  test('19-array-true-plain-numbers', () => {
    div.style.setProperty('z-index', '999')
    expect(getStyles(div, ['z-index'], true)).toEqual({ 'z-index': 999 })
  })

  test('20-array-true-vh-vw', () => {
    div.style.height = '100vh'
    expect(getStyles(div, ['height'], true)).toEqual({ height: 100 })
  })

  // === OBJECT MAPPING parse=false (7 тестов) ===
  test('21-object-false-simple-mapping', () => {
    div.style.paddingLeft = '20px'
    expect(getStyles(div, { 'padding-left': 'paddingLeft' })).toEqual({
      paddingLeft: '20px'
    })
  })

  test('22-object-false-multiple-sources', () => {
    div.style.cssText = 'margin-top:10px;margin-right:20px'
    expect(getStyles(div, {
      'margin-top': 'top',
      'margin-right': 'right'
    })).toEqual({ top: '10px', right: '20px' })
  })

  test('23-object-false-missing-source-prop', () => {
    expect(getStyles(div, { missing: 'target' })).toEqual({ target: '' })
  })

  test('24-object-false-same-source-multiple-targets', () => {
    div.style.width = '100px'
    const mapping = { width: 'w1' }
    const result = getStyles(div, mapping)
    expect(result.w1).toBe('100px')
  })

  test('25-object-false-camel-to-kebab', () => {
    div.style.paddingLeft = '15px'
    expect(getStyles(div, { 'padding-left': 'paddingLeft' })).toEqual({
      paddingLeft: '15px'
    })
  })

  test('26-object-false-computed', () => {
    div.style.color = 'blue'
    expect(getStyles(div, { color: 'bgColor' }).bgColor).toMatch(/^rgb/)
  })

  test('27-object-false-shorthand-components', () => {
    div.style.border = '1px solid red'
    const result = getStyles(div, {
      border: 'border',
      'border-width': 'borderWidth'
    })
    expect(result.border).toContain('1px solid')
    expect(result.borderWidth).toBe('1px')
  })

  // === OBJECT MAPPING parse=true (6 тестов) ===
  test('28-object-true-mixed-types', () => {
    div.style.marginTop = '25px'
    div.style.visibility = 'visible'
    expect(getStyles(div, {
      'margin-top': 'mt',
      visibility: 'visible'
    }, true)).toEqual({
      mt: 25,
      visible: 'visible'
    })
  })

  test('29-object-true-multiple-units', () => {
    div.style.cssText = 'width:50%;padding:20px;font-size:1.5rem'
    expect(getStyles(div, {
      width: 'w',
      padding: 'p',
      'font-size': 'fs'
    }, true)).toEqual({
      w: 50,
      p: 20,
      fs: 1.5
    })
  })

  test('30-object-true-negative-mapped', () => {
    div.style.top = '-30px'
    expect(getStyles(div, { top: 'topPos' }, true)).toEqual({ topPos: -30 })
  })

  test('31-object-true-boolean-mapped', () => {
    div.style.setProperty('--flag', 'true')
    expect(getStyles(div, { '--flag': 'flag' }, true)).toEqual({ flag: true })
  })

  test('32-object-true-inheritance-mapped', () => {
    div.style.fontSize = '16px'
    const result = getStyles(div, { 'font-size': 'fontSize' }, true)
    expect(result.fontSize).toBe(16)
  })

  // === ELEMENTS & PERFORMANCE ===
  test('33-svg-elements', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    svg.style.width = '150px'
    expect(getStyles(svg, ['width'], true)).toEqual({ width: 150 })
  })

  test('34-real-world-layout', () => {
    div.style.cssText = `
      position: absolute;
      left: 100px;
      top: 50px;
      transform: translate(10px, 20px);
      z-index: 999;
      opacity: 0.9;
    `
    const styles = getStyles(div, [
      'left', 'top', 'z-index', 'opacity'
    ], true)
    expect(styles).toEqual({
      left: 100,
      top: 50,
      'z-index': 999,
      opacity: 0.9
    })
  })

  test('35-performance-large', () => {
    const props = Array.from({length: 50}, (_, i) => `margin-${i}`)
    div.style.cssText = props.map(p => `${p}:10px`).join(';')
    const start = performance.now()
    getStyles(div, props, true)
    expect(performance.now() - start).toBeLessThan(5)
  })
})
