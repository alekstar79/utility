/**
 * Formatting the number of bytes into a readable format with support for options
 */
export function formatBytes(
  bytes: number,
  decimals: number = 2,
  useBinary: boolean = true,
  locale: string = 'en-US'
): string {
  if (bytes === 0) return '0 B'

  // Use base 1024 (binary) or 1000 (decimal)
  const base = useBinary ? 1024 : 1000
  const units = useBinary
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  // Calculating the unit index
  const index = Math.floor(Math.log(bytes) / Math.log(base))
  const value = bytes / Math.pow(base, index)

  // Formatting a number with decimals precision, taking into account the locale
  const formatted = value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return `${formatted} ${units[index]}`
}
