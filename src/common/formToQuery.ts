type EntryData = [string, FormDataEntryValue]

const toString = (v: string | File) => typeof v === 'string' ? v : v.name || ''
const mapper = ([k, v]: EntryData) => {
  return [encodeURIComponent(k), encodeURIComponent(toString(v))].join('=')
}

export function formToQuery(form: HTMLFormElement): string
{
  return '?' + [...new FormData(form)].map(mapper).join('&')
}
