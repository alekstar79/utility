import { trim } from '../../src/common/trim'

describe('trim', () => {
  test('should trim leading/trailing spaces', () => {
    expect(trim('  hello  ')).toBe('hello')
    expect(trim('   world   ')).toBe('world')
  })

  test('should replace multiple spaces with single', () => {
    expect(trim('hello   world')).toBe('hello world')
    expect(trim('a  b   c')).toBe('a b c')
  })

  test('should handle mixed whitespace', () => {
    expect(trim('  hello \n world \t ')).toBe('hello world')
    expect(trim('\n\t  multi  \n\tline  \t\n')).toBe('multi line')
  })

  test('should handle edge cases', () => {
    expect(trim('')).toBe('')
    expect(trim('   ')).toBe('')
    expect(trim('hello')).toBe('hello')
    expect(trim(' a ')).toBe('a')
  })

  test('should handle only tabs/newlines', () => {
    expect(trim('\t\n hello \r\n')).toBe('hello')
    expect(trim('\t   \n')).toBe('')
  })
})
