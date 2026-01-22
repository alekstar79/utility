import { objToQuery } from '../../src/common/objToQuery'

describe('objToQuery', () => {
  test('should convert object to query string', () => {
    const obj = { foo: 'bar', num: 42 }
    expect(objToQuery(obj)).toBe('?foo=bar&num=42')
  })

  test('should encode special characters', () => {
    const obj = { test: 'тест=привет', space: 'hello world' }
    expect(objToQuery(obj)).toContain('%D1%82%D0%B5%D1%81%D1%82')
    expect(objToQuery(obj)).toContain('space=hello+world')
  })

  test('should handle different data types', () => {
    const obj = { bool: true, zero: 0, pi: 3.14 }
    expect(objToQuery(obj)).toBe('?bool=true&zero=0&pi=3.14')
  })

  test('should return "?" for empty object', () => {
    expect(objToQuery({})).toBe('?')
  })

  test('should handle single property', () => {
    expect(objToQuery({ key: 'value' })).toBe('?key=value')
  })
})
