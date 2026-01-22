import { pick } from '../../src/common/pick'

interface User {
  name: string
  age: number
  email: string
  role: string
}

describe('pick', () => {
  const user: User = { name: 'John', age: 30, email: 'john@example.com', role: 'admin' }

  test('should pick existing keys', () => {
    const result = pick(user, ['name', 'age'] as (keyof User)[])
    expect(result).toEqual({ name: 'John', age: 30 })
  })

  test('should ignore non-existing keys', () => {
    const result = pick(user, ['name', 'missing'] as (keyof User)[])
    expect(result).toEqual({ name: 'John' })
  })

  test('should merge with mix object', () => {
    const result = pick(user, ['name'], { extra: 'value', role: 'guest' })
    expect(result).toEqual({ name: 'John', extra: 'value', role: 'guest' })
  })

  test('should handle empty keys array', () => {
    const result = pick(user, [] as (keyof User)[])
    expect(result).toEqual({})
  })

  test('mix overrides picked values', () => {
    const result = pick(user, ['name', 'role'], { role: 'user' })
    expect(result).toEqual({ name: 'John', role: 'user' })
  })
})
