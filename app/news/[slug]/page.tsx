import type { Metadata } from 'next'
import ArticleDetail from './ArticleDetail'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://cyclemart.co.za'
    const res = await fetch(`${BASE}/api/news/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('not found')
    const data = await res.json()
    const article = data.article
    return {
      title: `${article.title} | CycleMart News`,
      description: article.excerpt,
      openGraph: {
        title: article.title,
        description: article.excerpt,
        url: `https://cyclemart.co.za/news/${slug}`,
        siteName: 'CycleMart',
        type: 'article',
        publishedTime: article.published_at,
        authors: [article.author_name],
        ...(article.cover_image_url && { images: [{ url: article.cover_image_url, width: 1200, height: 630 }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt,
        ...(article.cover_image_url && { images: [article.cover_image_url] }),
      },
      alternates: { canonical: `https://cyclemart.co.za/news/${slug}` },
    }
  } catch {
    return { title: 'CycleMart News', description: "South Africa's cycling news and updates." }
  }
}

export default function ArticlePage() {
  return <ArticleDetail />
}
