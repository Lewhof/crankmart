import { MetadataRoute } from 'next'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

const BASE = 'https://cyclemart.co.za'

// City browse pages (per Elon spec 2026-03-28)
const CITY_SLUGS = [
  'cape-town',
  'johannesburg',
  'durban',
  'pretoria',
  'stellenbosch',
  'port-elizabeth',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/directory`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/events`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/classifieds`, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE}/list`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  // City landing pages
  const cityPages: MetadataRoute.Sitemap = CITY_SLUGS.map(city => ({
    url: `${BASE}/directory/${city}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Category landing pages
  const CATEGORY_SLUGS = [
    'bike-shops',
    'online-retailers',
    'brands',
    'mechanics',
    'coaches',
    'event-organisers',
    'bike-hire',
  ]
  const categoryPages: MetadataRoute.Sitemap = CATEGORY_SLUGS.map(category => ({
    url: `${BASE}/directory/category/${category}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  try {
    // Business directory listings (only active)
    const businesses = await db.execute(sql.raw(`
      SELECT slug, updated_at
      FROM businesses
      WHERE listing_status = 'active'
      ORDER BY updated_at DESC
      LIMIT 2000
    `))
    const businessPages: MetadataRoute.Sitemap = ((businesses.rows ?? businesses) as any[]).map(b => ({
      url: `${BASE}/directory/${b.slug}`,
      changeFrequency: 'weekly' as const,
      lastModified: b.updated_at ? new Date(b.updated_at) : undefined,
      priority: 0.8,
    }))

    // Blog / news articles
    const articles = await db.execute(sql.raw(`
      SELECT slug, published_at, updated_at
      FROM news_articles
      WHERE status = 'approved'
      ORDER BY published_at DESC
      LIMIT 500
    `))
    const blogPages: MetadataRoute.Sitemap = ((articles.rows ?? articles) as any[]).map(a => ({
      url: `${BASE}/news/${a.slug}`,
      changeFrequency: 'monthly' as const,
      lastModified: a.updated_at ? new Date(a.updated_at) : (a.published_at ? new Date(a.published_at) : undefined),
      priority: 0.7,
    }))

    // Events
    const events = await db.execute(sql.raw(`
      SELECT slug, updated_at
      FROM events
      WHERE status IN ('verified','pending_review')
      ORDER BY updated_at DESC
      LIMIT 500
    `))
    const eventPages: MetadataRoute.Sitemap = ((events.rows ?? events) as any[]).map(e => ({
      url: `${BASE}/events/${e.slug}`,
      changeFrequency: 'weekly' as const,
      lastModified: e.updated_at ? new Date(e.updated_at) : undefined,
      priority: 0.8,
    }))

    return [
      ...staticPages,
      ...cityPages,
      ...categoryPages,
      ...businessPages,
      ...blogPages,
      ...eventPages,
    ]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    // Return static + city + category pages even if DB fails
    return [...staticPages, ...cityPages, ...categoryPages]
  }
}
