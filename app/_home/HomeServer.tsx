import HomePageFull from './HomePageFull'

async function getJson(url: string): Promise<unknown> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
    const full = url.startsWith('http') ? url : `${baseUrl}${url}`
    const res = await fetch(full, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function getNews(): Promise<unknown[]> {
  const featured = await getJson('/api/news?limit=3&featured=true')
  const arts = (featured as { articles?: unknown[] })?.articles
  if (Array.isArray(arts) && arts.length > 0) return arts
  const latest = await getJson('/api/news?limit=3')
  const arts2 = (latest as { articles?: unknown[] })?.articles
  return Array.isArray(arts2) ? arts2 : []
}

export default async function HomeServer() {
  const [listings, events, directory, newsArticles] = await Promise.all([
    getJson('/api/listings?limit=6'),
    getJson('/api/events?limit=3&upcoming=true'),
    getJson('/api/directory?limit=4&featured=true'),
    getNews(),
  ])

  const featured = Array.isArray(listings) ? listings : []
  const evs      = Array.isArray(events)   ? events   : []
  const shops    = Array.isArray((directory as { data?: unknown[] } | null)?.data)
    ? ((directory as { data: unknown[] }).data)
    : []

  return (
    <HomePageFull
      initial={{
        featured:     featured as never,
        events:       evs as never,
        shops:        shops as never,
        newsArticles: newsArticles as never,
      }}
    />
  )
}
