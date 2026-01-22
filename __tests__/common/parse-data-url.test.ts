import { parseDataURL } from '../../src/common/parseDataUrl.ts'

describe('parseDataURL', () => {
  it('parses valid base64 data URL with image type', () => {
    const input = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA';
    const result = parseDataURL(input)
    expect(result.type).toBe('image/png')
    expect(result.data).toBe('iVBORw0KGgoAAAANSUhEUgAA')
  })

  it('parses valid non-base64 data URL with text type', () => {
    const input = 'data:text/plain;charset=UTF-8,Hello%20World'
    const result = parseDataURL(input)
    expect(result.type).toBe('text/plain')
    expect(result.data).toBe('Hello World')
  })

  it('returns nulls on invalid data URL', () => {
    const input = 'not-a-data-url'
    const result = parseDataURL(input)
    expect(result.type).toBeNull()
    expect(result.data).toBeNull()
  })

  it('returns null for data if decoding fails', () => {
    const input = 'data:text/plain,%E0%A4%A';
    const result = parseDataURL(input);
    expect(result.type).toBe('text/plain')
    expect(result.data).toBeNull()
  })

  test('should return null for invalid data URL', () => {
    const result = parseDataURL('invalid-data-url')
    expect(result).toEqual({ type: null, data: null })
  })

  it('supports data URLs without MIME type', () => {
    const input = 'data:;base64,SGVsbG8=';
    const result = parseDataURL(input);
    expect(result.type).toBeNull();
    expect(result.data).toBe('SGVsbG8=')
  })
})
