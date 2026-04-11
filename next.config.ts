import type { NextConfig } from "next"

const nextConfig: NextConfig = {
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
      { protocol: 'http', hostname: '*' },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cyclemart.co.za',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3099',
        pathname: '/uploads/**',
      },
    ],
    // Allow relative /uploads/ paths served by nginx
    domains: ['cyclemart.co.za', 'localhost'],
  },
}

export default nextConfig
