import HomePageFull from './HomePageFull'
import { getCountry } from '@/lib/country'
import type { Country } from '@/lib/country'

async function getJson(url: string, country: Country): Promise<unknown> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
    // Append _country to the URL so the per-URL fetch cache (revalidate: 60)
    // doesn't cross-contaminate ZA and AU responses. The API ignores it.
    const sep = url.includes('?') ? '&' : '?'
    const full = `${baseUrl}${url}${sep}_country=${country}`
    const res = await fetch(full, {
      headers: { 'x-country': country },
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function getNews(country: Country): Promise<unknown[]> {
  const featured = await getJson('/api/news?limit=3&featured=true', country)
  const arts = (featured as { articles?: unknown[] })?.articles
  if (Array.isArray(arts) && arts.length > 0) return arts
  const latest = await getJson('/api/news?limit=3', country)
  const arts2 = (latest as { articles?: unknown[] })?.articles
  return Array.isArray(arts2) ? arts2 : []
}

export default async function HomeServer() {
  const country = await getCountry()
  const [listings, events, directory, newsArticles] = await Promise.all([
    getJson('/api/listings?limit=6', country),
    getJson('/api/events?limit=3&upcoming=true', country),
    getJson('/api/directory?limit=4&featured=true', country),
    getNews(country),
  ])

  const featured = Array.isArray(listings) ? listings : []
  const evs      = Array.isArray(events)   ? events   : []
  const shops    = Array.isArray((directory as { data?: unknown[] } | null)?.data)
    ? ((directory as { data: unknown[] }).data)
    : []

  return (
    <HomePageFull
      country={country}
      initial={{
        featured:     featured as never,
        events:       evs as never,
        shops:        shops as never,
        newsArticles: newsArticles as never,
      }}
    />
  )
}
