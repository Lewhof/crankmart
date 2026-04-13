import { MetadataRoute } from 'next'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { getCountry, getRoutingMode, type Country } from '@/lib/country'

const BASE = 'https://crankmart.com'

// City browse pages (per Elon spec 2026-03-28)
const CITY_SLUGS = [
  'cape-town',
  'johannesburg',
  'durban',
  'pretoria',
  'stellenbosch',
  'port-elizabeth',
]

const CATEGORY_SLUGS = [
  'bike-shops',
  'online-retailers',
  'brands',
  'mechanics',
  'coaches',
  'event-organisers',
  'bike-hire',
]

function prefix(country: Country): string {
  return getRoutingMode() === 'implicit-za' ? '' : `/${country}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const country = await getCountry()
  const p = prefix(country)

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}${p || '/'}`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}${p}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}${p}/directory`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}${p}/events`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}${p}/classifieds`, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE}${p}/list`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}${p}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}${p}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const cityPages: MetadataRoute.Sitemap = CITY_SLUGS.map(city => ({
    url: `${BASE}${p}/directory/${city}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryPages: MetadataRoute.Sitemap = CATEGORY_SLUGS.map(category => ({
    url: `${BASE}${p}/directory/category/${category}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  try {
    const businesses = await db.execute(sql`
      SELECT slug, updated_at
      FROM businesses
      WHERE listing_status = 'active' AND country = ${country}
      ORDER BY updated_at DESC
      LIMIT 2000
    `)
    const businessPages: MetadataRoute.Sitemap = ((businesses.rows ?? businesses) as any[]).map(b => ({
      url: `${BASE}${p}/directory/${b.slug}`,
      changeFrequency: 'weekly' as const,
      lastModified: b.updated_at ? new Date(b.updated_at) : undefined,
      priority: 0.8,
    }))

    const articles = await db.execute(sql`
      SELECT slug, published_at, updated_at
      FROM news_articles
      WHERE status = 'approved' AND country = ${country}
      ORDER BY published_at DESC
      LIMIT 500
    `)
    const blogPages: MetadataRoute.Sitemap = ((articles.rows ?? articles) as any[]).map(a => ({
      url: `${BASE}${p}/news/${a.slug}`,
      changeFrequency: 'monthly' as const,
      lastModified: a.updated_at ? new Date(a.updated_at) : (a.published_at ? new Date(a.published_at) : undefined),
      priority: 0.7,
    }))

    const events = await db.execute(sql`
      SELECT slug, updated_at
      FROM events
      WHERE status IN ('verified','pending_review') AND country = ${country}
      ORDER BY updated_at DESC
      LIMIT 500
    `)
    const eventPages: MetadataRoute.Sitemap = ((events.rows ?? events) as any[]).map(e => ({
      url: `${BASE}${p}/events/${e.slug}`,
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
    return [...staticPages, ...cityPages, ...categoryPages]
  }
}
