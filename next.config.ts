import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.blob.core.windows.net' },
    ],
  },
  // Required for @react-pdf/renderer server-side rendering
  serverExternalPackages: ['@react-pdf/renderer'],
}

export default withSentryConfig(nextConfig, {
  org:     'hikayati',
  project: 'hikayati',
  silent:  true,
  disableLogger: true,
})
