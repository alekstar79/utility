export type StyleValue = string | number | boolean | null

function parseStyleValue(value: string): StyleValue
{
  if (!value) return null

  const lower = value.toLowerCase()

  if (lower === 'true') return true
  if (lower === 'false') return false

  const match = value.match(/^(-?[\d.]+)(px|em|rem|%|vh|vw)?$/i)
  if (match) {
    const num = parseFloat(match[1])
    if (!isNaN(num)) return num
  }

  return value
}

export function getStyles<
  P extends string[] | Record<string, string>,
  ResultKeys extends PropertyKey = P extends string[]
    ? P[number]
    : P[keyof P]
>(
  el: Element | HTMLElement,
  props: P,
  parse: boolean = false
): Record<ResultKeys, StyleValue> {
  const computed = window.getComputedStyle(el)
  const result = {} as Record<ResultKeys, StyleValue>

  if (Array.isArray(props)) {
    for (const prop of props) {
      result[prop as ResultKeys] = parse
        ? parseStyleValue(computed.getPropertyValue(prop).trim())
        : computed.getPropertyValue(prop).trim()
    }
  } else {
    for (const originalProp in props) {
      const renamedKey = props[originalProp]
      const rawValue = computed.getPropertyValue(originalProp).trim()
      result[renamedKey as ResultKeys] = parse
        ? parseStyleValue(rawValue)
        : rawValue
    }
  }

  return result
}
