import { formToObj } from '../../src/common/formToObj'

describe('formToObj Integration Tests', () => {
  let formElement: HTMLFormElement

  beforeEach(() => {
    formElement = document.createElement('form')
    document.body.appendChild(formElement)
  })

  afterEach(() => {
    document.body.removeChild(formElement)
    jest.clearAllMocks()
  })

  test('should convert simple form to object', () => {
    formElement.innerHTML = `
      <input name="username" value="john_doe">
      <input name="email" value="john@example.com">
      <input name="age" value="30">
    `

    const result = formToObj<{
      username: string
      email: string
      age: string
    }>(formElement)

    expect(result).toEqual({
      username: 'john_doe',
      email: 'john@example.com',
      age: '30'
    })
  })

  test('should handle textarea values', () => {
    formElement.innerHTML = `
      <textarea name="bio">Software developer from Ulyanovsk</textarea>
      <input name="experience" value="5">
    `

    const result = formToObj<{
      bio: string
      experience: string
    }>(formElement)

    expect(result).toEqual({
      bio: 'Software developer from Ulyanovsk',
      experience: '5'
    })
  })

  test('should handle select elements', () => {
    formElement.innerHTML = `
      <select name="language">
        <option value="ts">TypeScript</option>
        <option value="js" selected>JavaScript</option>
        <option value="py">Python</option>
      </select>
      <input name="framework" value="React">
    `

    const result = formToObj<{
      language: string
      framework: string
    }>(formElement)

    expect(result).toEqual({
      language: 'js',
      framework: 'React'
    })
  })

  test('should handle checkboxes', () => {
    formElement.innerHTML = `
      <input type="checkbox" name="hobbies" value="coding" checked>
      <input type="checkbox" name="hobbies" value="gaming">
      <input type="checkbox" name="hobbies" value="reading" checked>
      <input name="notify" type="checkbox" checked>
    `

    const result = formToObj<{
      hobbies: string[]
      notify: string
    }>(formElement)

    expect(result).toEqual({
      hobbies: 'reading',
      notify: 'on'
    })
  })

  test('should handle radio buttons', () => {
    formElement.innerHTML = `
      <input type="radio" name="payment" value="card" checked>
      <input type="radio" name="payment" value="paypal">
      <input type="radio" name="payment" value="crypto">
      <input name="amount" value="100">
    `

    const result = formToObj<{
      payment: string
      amount: string
    }>(formElement)

    expect(result).toEqual({
      payment: 'card',
      amount: '100'
    })
  })

  test('should handle multiple checkboxes with array notation', () => {
    formElement.innerHTML = `
      <input type="checkbox" name="skills[]" value="typescript" checked>
      <input type="checkbox" name="skills[]" value="nodejs" checked>
      <input type="checkbox" name="skills[]" value="react">
    `

    const result = formToObj<{
      'skills[]': string
    }>(formElement)

    expect(result).toEqual({
      'skills[]': 'nodejs'
    })
  })

  test('should ignore fields without name attribute', () => {
    formElement.innerHTML = `
      <input value="ignored">
      <input name="included" value="visible">
      <input name="" value="empty-name">
    `

    const result = formToObj<{
      included: string
    }>(formElement)

    expect(result).toEqual({
      included: 'visible'
    })
  })

  test('should handle empty form', () => {
    const result = formToObj<{}>(formElement)
    expect(result).toEqual({})
  })

  test('should handle form with disabled fields', () => {
    formElement.innerHTML = `
      <input name="enabled" value="visible">
      <input name="disabled" value="hidden" disabled>
    `

    const result = formToObj<{
      enabled: string
    }>(formElement)

    expect(result).toEqual({
      enabled: 'visible'
    })
  })

  test('should handle numeric values', () => {
    formElement.innerHTML = `
      <input name="price" value="99.99">
      <input name="quantity" value="10">
      <input name="zero" value="0">
    `

    const result = formToObj<{
      price: string
      quantity: string
      zero: string
    }>(formElement)

    expect(result).toEqual({
      price: '99.99',
      quantity: '10',
      zero: '0'
    })
  })

  test('should preserve exact FormData behavior with duplicate names', () => {
    formElement.innerHTML = `
      <input name="color" value="red">
      <input name="color" value="green">
      <input name="color" value="blue">
    `

    const result = formToObj<{
      color: string
    }>(formElement)

    expect(result).toEqual({
      color: 'blue'
    })
  })

  test('should work with nested form structure', () => {
    formElement.innerHTML = `
      <input name="user[name]" value="John">
      <input name="user[email]" value="john@example.com">
      <input name="settings[theme]" value="dark">
    `

    const result = formToObj<any>(formElement)

    expect(result).toEqual({
      'user[name]': 'John',
      'user[email]': 'john@example.com',
      'settings[theme]': 'dark'
    })
  })

  test('type safety should work with strict typing', () => {
    formElement.innerHTML = `
      <input name="username" value="testuser">
      <input name="active" value="1">
    `

    interface UserForm {
      username: string
      active: string
    }

    const result = formToObj<UserForm>(formElement)

    expect(result.username).toBe('testuser')
    expect(result.active).toBe('1')
  })
})
