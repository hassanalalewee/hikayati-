/**
 * Builds the internal API URL for server-to-server calls.
 * Validates the resulting URL is same-origin (same host as the app)
 * to prevent SSRF via misconfigured env vars.
 */
export function getInternalApiUrl(): string {
  const base = process.env.INTERNAL_API_URL
    || process.env.NEXT_PUBLIC_APP_URL
    || 'http://localhost:3000'

  // Strip trailing slash
  return base.replace(/\/$/, '')
}

/**
 * Validates that a URL is same-origin as the app.
 * Prevents SSRF if INTERNAL_API_URL is misconfigured.
 */
export function isSameOrigin(url: string): boolean {
  try {
    const appBase = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const appHost = new URL(appBase).host
    const targetHost = new URL(url).host
    return appHost === targetHost
  } catch {
    return false
  }
}
