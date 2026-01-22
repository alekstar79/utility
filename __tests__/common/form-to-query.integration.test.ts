import { formToQuery } from '../../src/common/formToQuery'

describe('formToQuery Integration Tests', () => {
  let formElement: HTMLFormElement

  beforeEach(() => {
    formElement = document.createElement('form')
    document.body.appendChild(formElement)
  })

  afterEach(() => {
    document.body.removeChild(formElement)
  })

  test('should convert simple form to query string', () => {
    formElement.innerHTML = `
      <input name="username" value="john doe">
      <input name="age" value="30">
    `
    expect(formToQuery(formElement)).toBe('?username=john%20doe&age=30')
  })

  test('should handle special characters correctly', () => {
    formElement.innerHTML = `
      <input name="search" value="hello world & more">
      <input name="category" value="tech+news">
      <input name="price" value="99.99">
    `
    expect(formToQuery(formElement)).toBe('?search=hello%20world%20%26%20more&category=tech%2Bnews&price=99.99')
  })

  test('should handle russian characters', () => {
    formElement.innerHTML = `
      <input name="city" value="Ульяновск">
      <input name="query" value="тест поиска">
    `
    expect(formToQuery(formElement)).toBe('?city=%D0%A3%D0%BB%D1%8C%D1%8F%D0%BD%D0%BE%D0%B2%D1%81%D0%BA&query=%D1%82%D0%B5%D1%81%D1%82%20%D0%BF%D0%BE%D0%B8%D1%81%D0%BA%D0%B0')
  })

  test('should handle textarea with newlines', () => {
    formElement.innerHTML = `
      <textarea name="description">Multi
line
description</textarea>
    `
    expect(formToQuery(formElement)).toBe('?description=Multi%0Aline%0Adescription')
  })

  test('should handle select element', () => {
    formElement.innerHTML = `
      <select name="framework">
        <option value="react">React</option>
        <option value="vue" selected>Vue.js</option>
        <option value="svelte">Svelte</option>
      </select>
    `
    expect(formToQuery(formElement)).toBe('?framework=vue')
  })

  test('should handle checkboxes (only checked values)', () => {
    formElement.innerHTML = `
    <input type="checkbox" name="notify" value="email" checked>
    <input type="checkbox" name="notify" value="sms">
    <input type="checkbox" name="notify" value="push" checked>
  `
    expect(formToQuery(formElement)).toBe('?notify=email&notify=push')
  })

  test('should handle radio buttons', () => {
    formElement.innerHTML = `
      <input type="radio" name="payment" value="card" checked>
      <input type="radio" name="payment" value="paypal">
      <input type="radio" name="payment" value="crypto">
    `
    expect(formToQuery(formElement)).toBe('?payment=card')
  })

  test('should handle empty form', () => {
    expect(formToQuery(formElement)).toBe('?')
  })

  test('should ignore fields without name', () => {
    formElement.innerHTML = `
      <input value="ignored">
      <input name="visible" value="seen">
      <input name="" value="empty-name">
    `
    expect(formToQuery(formElement)).toBe('?visible=seen')
  })

  test('should ignore disabled fields', () => {
    formElement.innerHTML = `
      <input name="enabled" value="visible">
      <input name="disabled" value="hidden" disabled>
    `
    expect(formToQuery(formElement)).toBe('?enabled=visible')
  })

  test('should preserve order of fields', () => {
    formElement.innerHTML = `
      <input name="z" value="z-first">
      <input name="a" value="a-second">
      <input name="m" value="m-third">
    `
    expect(formToQuery(formElement)).toBe('?z=z-first&a=a-second&m=m-third')
  })

  test('should handle boolean checkbox values', () => {
    formElement.innerHTML = `
      <input type="checkbox" name="active" checked>
      <input type="checkbox" name="beta" value="true" checked>
    `
    expect(formToQuery(formElement)).toBe('?active=on&beta=true')
  })

  test('should handle multiple fields with same name (all preserved)', () => {
    formElement.innerHTML = `
      <input name="color" value="red">
      <input name="color" value="green">
      <input name="color" value="blue">
    `
    expect(formToQuery(formElement)).toBe('?color=red&color=green&color=blue')
  })

  test('should handle complex nested names', () => {
    formElement.innerHTML = `
      <input name="user[name]" value="John Doe">
      <input name="user[email]" value="john@example.com">
      <input name="filters[price][min]" value="10">
    `
    expect(formToQuery(formElement)).toBe('?user%5Bname%5D=John%20Doe&user%5Bemail%5D=john%40example.com&filters%5Bprice%5D%5Bmin%5D=10')
  })
})
