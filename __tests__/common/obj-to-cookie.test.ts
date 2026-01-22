import { objToCookie } from '../../src/common/objToCookie'

describe('objToCookie', () => {
  test('should convert object to cookie string', () => {
    const obj = { foo: "bar", equation: "E=mc^2" }
    expect(objToCookie(obj)).toBe('foo=bar; equation=E%3Dmc%5E2')
  })

  test('should encode special characters', () => {
    const obj = { name: 'user name', value: 'тест=привет' }
    expect(objToCookie(obj)).toContain('name=user%20name')
    expect(objToCookie(obj)).toContain('%D1%82%D0%B5%D1%81%D1%82')
  })

  test('should handle numbers and booleans', () => {
    const obj = { count: 42, active: true, pi: 3.14 }
    expect(objToCookie(obj)).toContain('count=42')
    expect(objToCookie(obj)).toContain('active=true')
  })

  test('should handle empty object', () => {
    expect(objToCookie({})).toBe('')
  })

  test('should handle single property', () => {
    expect(objToCookie({ test: 'value' })).toBe('test=value')
  })
})
