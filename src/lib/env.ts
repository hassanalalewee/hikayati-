/**
 * Environment variable validation.
 * Call validateEnv() in any server-side entry point to fail loudly
 * at startup if required vars are missing rather than at runtime.
 *
 * Groups:
 *   CRITICAL  — app cannot function at all without these
 *   REQUIRED  — specific feature breaks without these
 *   OPTIONAL  — graceful degradation exists
 */

interface EnvVar {
  key: string
  level: 'critical' | 'required' | 'optional'
  description: string
}

const ENV_VARS: EnvVar[] = [
  // Supabase — critical
  { key: 'NEXT_PUBLIC_SUPABASE_URL',      level: 'critical',  description: 'Supabase project URL' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', level: 'critical',  description: 'Supabase anon key' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY',     level: 'critical',  description: 'Supabase service role key (server only)' },

  // Internal security
  { key: 'INTERNAL_API_KEY',              level: 'critical',  description: 'Internal API auth key — must be changed from default' },

  // App URL
  { key: 'NEXT_PUBLIC_APP_URL',           level: 'critical',  description: 'Public app URL for redirects and links' },

  // AI services
  { key: 'GROQ_API_KEY',                  level: 'required',  description: 'Groq API key for story generation' },
  { key: 'OPENAI_API_KEY',               level: 'required',  description: 'OpenAI API key for DALL-E illustrations' },

  // Email
  { key: 'RESEND_API_KEY',               level: 'optional',  description: 'Resend API key — delivery emails skipped if missing' },

  // Payments
  { key: 'STRIPE_SECRET_KEY',            level: 'optional',  description: 'Stripe secret key — payments disabled if missing' },
  { key: 'STRIPE_WEBHOOK_SECRET',        level: 'optional',  description: 'Stripe webhook signature secret' },
]

/** Placeholder values that must be replaced before production */
const INSECURE_VALUES = new Set([
  'dev-secret-key-change-in-prod',
  'sk_test_placeholder',
  'pk_test_placeholder',
  'whsec_placeholder',
  'price_placeholder',
  '',
])

export function validateEnv(): void {
  const missing: string[]  = []
  const insecure: string[] = []

  for (const { key, level, description } of ENV_VARS) {
    const value = process.env[key]

    if (!value || INSECURE_VALUES.has(value)) {
      if (level === 'critical') {
        missing.push(`  ✗ ${key} — ${description}`)
      } else if (level === 'required' && (!value || INSECURE_VALUES.has(value))) {
        missing.push(`  ⚠ ${key} — ${description}`)
      }
    }

    // Flag default/insecure values even if present
    if (value && INSECURE_VALUES.has(value) && level !== 'optional') {
      insecure.push(`  ⚠ ${key} is using a placeholder/default value`)
    }
  }

  // Critical failures — throw to prevent startup
  const criticalMissing = missing.filter(m => m.startsWith('  ✗'))
  if (criticalMissing.length > 0) {
    throw new Error(
      `\n\n🚨 CRITICAL: Missing required environment variables:\n${criticalMissing.join('\n')}\n\n` +
      `Check your .env.local (development) or Vercel environment variables (production).\n`
    )
  }

  // Warnings — log but don't throw
  if (insecure.length > 0) {
    console.warn('\n⚠️  Environment variable warnings:\n' + insecure.join('\n') + '\n')
  }
  if (missing.length > 0) {
    console.warn('\n⚠️  Optional/required env vars not set:\n' + missing.join('\n') + '\n')
  }
}

/** Returns true if running in production Vercel environment */
export function isProduction(): boolean {
  return process.env.VERCEL_ENV === 'production'
}

/** Returns true if running in preview (Vercel branch deploys) */
export function isPreview(): boolean {
  return process.env.VERCEL_ENV === 'preview'
}
