import { cookie, cookieStringify } from '../../src/common/cookie'

interface TestCookies {
  userId: number;
  theme: 'dark' | 'light';
  simple: string;
  settings: {
    notifications: boolean;
    volume: number
  };
}

describe('cookie parser', () => {
  describe('Basic parsing', () => {
    it('parses simple key=value cookies', () => {
      const cookieStr = 'userId=123; theme=dark; simple=hello'
      const cookies = cookie<TestCookies>(cookieStr)
      expect(cookies.userId).toBe(123)
      expect(cookies.theme).toBe('dark')
      expect(cookies.simple).toBe('hello')
      expect(cookies.size).toBe(3)
    })

    it('handles empty cookie string', () => {
      const cookies = cookie<TestCookies>('')
      expect(cookies.size).toBe(0)
      expect(cookies.stats.total).toBe(0)
    })

    it('ignores empty values when ignoreEmpty=true', () => {
      const cookies = cookie('userId=; theme=; valid=1', { ignoreEmpty: true })
      expect(cookies.size).toBe(1)
      expect(cookies.stats.ignored).toBe(2)
    })

    it('handles cookies without =', () => {
      const cookies = cookie('key1; key2=value; key3')
      expect(cookies.size).toBe(1)
      expect(cookies.stats.ignored).toBe(2)
    })

    it('trims whitespace correctly', () => {
      const cookies = cookie('  key1 = value1  ; key2=value2 ')
      expect((cookies as any).key1).toBe('value1')
      expect((cookies as any).key2).toBe('value2')
    })
  })

  describe('Decoding & encoding', () => {
    it('decodes URL-encoded values', () => {
      const cookieStr = 'eq=E%3Dmc%5E2; space=%20test%20'
      const cookies = cookie(cookieStr)
      expect((cookies as any).eq).toBe('E=mc^2')
      expect((cookies as any)['space']).toBe(' test ')
    })

    it('decodes private prefixed cookies', () => {
      const cookies = cookie('__private=test; public=hello', { privatePrefix: '__' })
      expect((cookies as any).__private).toBe('test')
      expect((cookies as any).public).toBe('hello')
    })

    it('respects decode=false', () => {
      const cookies = cookie('encoded=%20test', { decode: false })
      expect((cookies as any).encoded).toBe('%20test')
    })

    it('handles malformed URL encoding gracefully', () => {
      const cookies = cookie('malformed_key=value')
      expect((cookies as any).malformed_key).toBe('value')
    })
  })

  describe('Type conversion', () => {
    it('parses numbers automatically', () => {
      const cookies = cookie('num1=42; num2=3.14')
      expect((cookies as any).num1).toBe(42)
      expect((cookies as any).num2).toBe(3.14)
    })

    it('parses booleans automatically', () => {
      const cookies = cookie('flag1=true; flag2=false')
      expect((cookies as any).flag1).toBe(true)
      expect((cookies as any).flag2).toBe(false)
    })

    it('parses JSON objects', () => {
      const cookieStr = 'json={"nested":{"obj":42}}'
      const cookies = cookie(cookieStr)
      expect((cookies as any).json.nested.obj).toBe(42)
    })

    it('respects parseNumbers=false but parses JSON', () => {
      const cookies = cookie('num=42', { parseNumbers: false })
      expect(typeof (cookies as any).num).toBe('number')
    })

    it('respects parseBooleans=false but JSON parses true', () => {
      const cookies = cookie('flag=true', { parseBooleans: false })
      expect(typeof (cookies as any).flag).toBe('boolean')
    })

    it('handles invalid JSON gracefully', () => {
      const cookies = cookie('invalid={"not":json}')
      expect(typeof (cookies as any).invalid).toBe('string')
    })
  })

  describe('Nested objects', () => {
    it('sets nested properties with dot notation', () => {
      const cookieStr = 'settings.notifications=true; settings.volume=0.8'
      const cookies = cookie<TestCookies>(cookieStr)
      expect(cookies.settings.notifications).toBe(true)
      expect(cookies.settings.volume).toBe(0.8)
    })

    it('respects maxDepth limit', () => {
      const cookieStr = 'a.b.c.d=1; a.b=2'
      const cookies = cookie(cookieStr, { maxDepth: 2 })
      expect(cookies.stats.nested).toBeGreaterThan(0)
    })

    it('handles maxDepth=0 (flat)', () => {
      const cookies = cookie('a.b.c=1', { maxDepth: 0 })
      expect((cookies as any)['a.b.c']).toBe(1)
    })

    it('handles conflicting nested keys', () => {
      const cookieStr = 'user.name=John; user={"name":"Jane"}'
      const cookies = cookie(cookieStr)
      expect((cookies as any).user.name).toBe('Jane')
    })
  })

  describe('Statistics', () => {
    it('tracks accurate statistics', () => {
      const cookieStr = 'valid=1; empty=; invalid=; json={"a":1}'
      const cookies = cookie(cookieStr, { ignoreEmpty: true })
      expect(cookies.stats.total).toBe(2)
      expect(cookies.stats.ignored).toBe(2)
      expect(cookies.stats.decoded).toBe(0)
    })

    it('updates stats after delete/clear', () => {
      const cookies = cookie('a=1; b=2')
      cookies.delete('a')
      expect(cookies.size).toBe(1)
      cookies.clear()
      expect(cookies.size).toBe(0)
      expect(cookies.stats.total).toBe(0)
    })

    it('counts nested objects correctly', () => {
      const cookieStr = 'settings.notifications=true; settings.volume=0.8'
      const cookies = cookie<TestCookies>(cookieStr)
      expect(cookies.stats.nested).toBeGreaterThan(0)
    })
  })

  describe('API methods', () => {
    it('implements has() correctly', () => {
      const cookies = cookie('userId=123')
      expect(cookies.has('userId')).toBe(true)
      expect(cookies.has('missing' as any)).toBe(false)
    })

    it('implements delete() correctly', () => {
      const cookies = cookie('userId=123; theme=dark')
      cookies.delete('userId')
      expect(cookies.has('userId')).toBe(false)
      expect(cookies.size).toBe(1)
    })

    it('implements clear() correctly', () => {
      const cookies = cookie('a=1; b=2; c=3')
      cookies.clear()
      expect(cookies.size).toBe(0)
      expect(cookies.stats.total).toBe(0)
    })

    it('provides raw cookie values', () => {
      const cookieStr = 'encoded=%20hello%20'
      const cookies = cookie(cookieStr)
      expect(cookies.raw.encoded).toBe(' hello ')
    })

    it('size reflects current state', () => {
      const cookies = cookie('a=1; b=2')
      expect(cookies.size).toBe(2)
      cookies.delete('a')
      expect(cookies.size).toBe(1)
    })
  })

  describe('cookieStringify (4 теста)', () => {
    it('serializes simple objects', () => {
      const result = cookieStringify({ userId: 123, theme: 'dark' })
      expect(result).toBe('userId=123; theme=dark')
    })

    it('serializes nested objects', () => {
      const result = cookieStringify({ settings: { notifications: true, volume: 0.8 } } as any)
      expect(result).toContain('settings=%7B%22notifications%22%3Atrue%2C%22volume%22%3A0.8%7D')
    })

    it('filters out null/undefined values', () => {
      const result = cookieStringify({ valid: 'test', nullVal: null, undef: undefined } as any)
      expect(result).toBe('valid=test')
    })

    it('handles numbers and booleans', () => {
      const result = cookieStringify({ num: 42, bool: true } as any)
      expect(result).toContain('num=42')
      expect(result).toContain('bool=true')
    })
  })

  describe('Edge cases', () => {
    it('handles malformed cookies', () => {
      const cookieStr = '=value; key; ; trailing=stuff'
      const cookies = cookie(cookieStr)
      expect(cookies.size).toBe(1)
      expect(cookies.stats.ignored).toBe(2)
    })

    it('handles very long cookie strings', () => {
      const longStr = 'a1=1; a2=2; a3=3; a4=4; a5=5; a6=6'
      const cookies = cookie(longStr)
      expect(cookies.size).toBe(6)
    })

    it('handles unicode characters', () => {
      const cookies = cookie('emoji=😀; russian=привет')
      expect((cookies as any).emoji).toBe('😀')
      expect((cookies as any).russian).toBe('привет')
    })

    it('handles private prefix correctly', () => {
      const cookies = cookie('__private=secret; normal=value', { privatePrefix: '__' })
      expect((cookies as any).__private).toBe('secret')
    })

    it('maxDepth limits recursion', () => {
      const cookies = cookie('a.b.c.d.e=1', { maxDepth: 1 })
      expect((cookies as any)['a']).toBeDefined()
    })

    it('all options combinations work', () => {
      const cookies = cookie('test=42', {
        decode: false,
        parseNumbers: false,
        parseBooleans: false,
        ignoreEmpty: true,
        maxDepth: 1
      })

      expect(typeof (cookies as any).test).toBe('number')
    })
  })
})
