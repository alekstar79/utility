import { queryToObj } from '../../src/common/queryToObj'

interface QueryParams {
  foo: string
  num: string
}

describe('queryToObj', () => {
  test('should parse simple query string', () => {
    const params = queryToObj<QueryParams>('?foo=bar&num=42')
    expect(params).toEqual({ foo: 'bar', num: '42' })
  })

  test('should parse full URL', () => {
    const params = queryToObj<QueryParams>('https://example.com?foo=bar&num=42')
    expect(params).toEqual({ foo: 'bar', num: '42' })
  })

  test('should handle decoded special characters', () => {
    const params: Record<string, string> = queryToObj('?test=%D1%82%D0%B5%D1%81%D1%82&space=%20world')
    expect(params.test).toBe('тест')
    expect(params.space).toBe(' world')
  })

  test('should handle empty query', () => {
    const params: Record<string, string> = queryToObj('https://example.com')
    expect(params).toEqual({})
  })

  test('should handle multiple same keys', () => {
    const params: Record<string, string> = queryToObj('?id=1&id=2&name=test')
    expect(params.id).toBe('2')
    expect(params.name).toBe('test')
  })
})
