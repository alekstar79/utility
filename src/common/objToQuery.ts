export const objToQuery = <T extends {}>(obj: T) => '?' + new URLSearchParams(obj).toString()
