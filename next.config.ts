import type { NextConfig } from "next"
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this app — without this, Next.js 16
  // walks up and picks the parent crankmart/package-lock.json as root,
  // which breaks tailwindcss resolution.
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.trailforks.com' },
      { protocol: 'https', hostname: 'trailforks.com' },
      { protocol: 'https', hostname: '*.komoot.com' },
      { protocol: 'https', hostname: 'static.wixstatic.com' },
      { protocol: 'https', hostname: '*.wixstatic.com' },
      { protocol: 'https', hostname: '*.cloudfront.net' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'mtbtrailssa.co.za' },
      { protocol: 'https', hostname: '*.mtbtrailssa.co.za' },
      { protocol: 'https', hostname: '3riverstrails.co.za' },
      { protocol: 'https', hostname: 'mtbroutes.co.za' },
      { protocol: 'https', hostname: '*.sabie.co.za' },
      { protocol: 'https', hostname: 'www.sabie.co.za' },
      { protocol: 'https', hostname: '*.hollatrails.co.za' },
      { protocol: 'https', hostname: '*.gibagorge.co.za' },
      { protocol: 'https', hostname: '*.karkloof*.co.za' },
      { protocol: 'https', hostname: 'wolwespruit.co.za' },
      { protocol: 'https', hostname: 'cradlemoon.co.za' },
      { protocol: 'https', hostname: '*.camelroc.co.za' },
      { protocol: 'https', hostname: '*.mankele.co.za' },
      { protocol: 'https', hostname: 'birdhiking.co.za' },
      { protocol: 'https', hostname: 'tranquilitas.com' },
      { protocol: 'https', hostname: '*.tranquilitas.com' },
      { protocol: 'https', hostname: 'images.squarespace-cdn.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'public.blob.vercel-storage.com' },
      { protocol: 'http', hostname: '*' },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'crankmart.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'dev.crankmart.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3099',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  org: 'crankmart',
  project: 'crankmart-web',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: true,
  },
})
