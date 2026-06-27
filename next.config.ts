import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      // DALL-E 3 uses multiple Azure blob storage hostnames
      { protocol: 'https', hostname: '*.blob.core.windows.net' },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  org:     'hikayati',
  project: 'hikayati',
  silent:  true,          // suppress build output noise
  disableLogger: true,
})
