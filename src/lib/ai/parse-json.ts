/**
 * Robustly extract and parse a JSON object or array from an LLM response.
 * Handles control characters inside string values without corrupting structure.
 */
export function extractJson<T>(text: string, arrayMode = false): T {
  const opener = arrayMode ? '[' : '{'
  const closer = arrayMode ? ']' : '}'

  const start = text.indexOf(opener)
  const end = text.lastIndexOf(closer)
  if (start === -1 || end === -1) throw new Error(`No JSON ${opener}...${closer} found in response`)

  let raw = text.slice(start, end + 1)

  // Fix control characters ONLY inside JSON string values
  // Walk the string tracking whether we're inside a quoted value
  let result = ''
  let inString = false
  let escaped = false

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]

    if (escaped) {
      result += ch
      escaped = false
      continue
    }

    if (ch === '\\' && inString) {
      result += ch
      escaped = true
      continue
    }

    if (ch === '"') {
      inString = !inString
      result += ch
      continue
    }

    if (inString) {
      // Replace bare control characters with safe escape sequences
      const code = ch.charCodeAt(0)
      if (code < 0x20) {
        if (code === 0x0a) { result += '\\n'; continue }
        if (code === 0x0d) { result += '\\r'; continue }
        if (code === 0x09) { result += '\\t'; continue }
        // Skip other control chars
        continue
      }
    }

    result += ch
  }

  return JSON.parse(result) as T
}
