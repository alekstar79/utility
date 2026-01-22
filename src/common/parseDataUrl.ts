export interface ParsedUrlData {
  type: string | null;
  data: string | null;
}

/**
 * Parses a Data URL string into its MIME type and base64 data parts.
 * Supports optional base64 or URL-encoded data detection.
 *
 * @param {string} data - The Data URL string to parse.
 * @returns An object containing the extracted MIME type (or null) and the data string (or null if invalid).
 */
export function parseDataURL(data: string): ParsedUrlData
{
  // Regex to capture mime type and data, supporting both base64 and plain data
  const regex = /^data:([\w/+.-]+\/[\w.+-]+)?(?:;charset=[\w-]+)?(;base64)?,(.*)$/
  const match = data.match(regex)

  if (!match) {
    return { type: null, data: null }
  }

  const [, mimeType = null, isBase64, rawData] = match

  try {
    // Decode URI component only if not base64 (which is not percent-encoded)
    const decodedData = isBase64 ? rawData : decodeURIComponent(rawData)
    return { type: mimeType, data: decodedData }
  } catch {
    // Fail gracefully if decoding fails
    return { type: mimeType, data: null }
  }
}
