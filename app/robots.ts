import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Search engines
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      // AI Crawlers — CRITICAL for GEO visibility
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Googlebot-Extended', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },
      { userAgent: 'Omgilibot', allow: '/' },
      { userAgent: 'FacebookBot', allow: '/' },
      // Default: allow all, block only admin internals
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/admin', '/api/internal', '/_next/'],
      },
    ],
    sitemap: [
      'https://cyclemart.co.za/sitemap.xml',
      'https://cyclemart.co.za/sitemap-listings.xml',
      'https://cyclemart.co.za/sitemap-blog.xml',
    ],
  }
}
