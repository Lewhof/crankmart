import { permanentRedirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ serial: string }>
  searchParams: Promise<{ brand?: string }>
}

/**
 * Legacy detail — /check/[serial] is now /community/check/[serial]. Carry the
 * brand query through so cached search engine + share links land identically.
 */
export default async function CheckSerialRedirect({ params, searchParams }: PageProps) {
  const { serial } = await params
  const { brand } = await searchParams
  const qs = brand ? `?brand=${encodeURIComponent(brand)}` : ''
  permanentRedirect(`/community/check/${encodeURIComponent(serial)}${qs}`)
}
