import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const result = await db.execute(sql.raw(`SELECT website, name FROM businesses WHERE slug = '${slug.replace(/'/g, "''")}'`))
    const rows = Array.isArray(result.rows) ? result.rows : (Array.isArray(result) ? result : [])
    const business = rows[0] as any
    if (!business?.website) return NextResponse.json({ scraped: null })

    const url = business.website.startsWith('http') ? business.website : `https://${business.website}`

    // Fetch website HTML with timeout
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)

    const html = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CycleMartBot/1.0; +https://cyclemart.co.za)',
        'Accept': 'text/html',
      }
    }).then(r => r.text()).finally(() => clearTimeout(timer))

    // Extract useful meta tags + content
    const extract = (pattern: RegExp) => {
      const m = html.match(pattern)
      return m ? m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim() : null
    }

    const metaDesc = extract(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{10,300})["']/i)
      || extract(/<meta[^>]+content=["']([^"']{10,300})["'][^>]+name=["']description["']/i)
    const ogDesc = extract(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{10,300})["']/i)
      || extract(/<meta[^>]+content=["']([^"']{10,300})["'][^>]+property=["']og:description["']/i)
    const ogImage = extract(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || extract(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    const title = extract(/<title>([^<]{5,150})<\/title>/i)
    const phone = html.match(/(?:tel:|call us|phone)[:\s]*([+\d\s().-]{9,18})/i)?.[1]?.trim()
      || html.match(/(?:0[1-9]\d[\s-]?\d{3}[\s-]?\d{4})/)?.[0]

    // Extract social links
    const facebook = extract(/href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'?\s]+)/i)
    const instagram = extract(/href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'?\s]+)/i)
    const twitter = extract(/href=["'](https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^"'?\s]+)/i)

    // Extract hours if present
    const hoursMatch = html.match(/(?:mon|monday)[^<]{0,200}(?:fri|friday|sat|saturday)[^<]{0,200}(?:\d{1,2}[:.]\d{2}|\d{1,2}\s*(?:am|pm))/i)
    const hours = hoursMatch ? hoursMatch[0].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200) : null

    return NextResponse.json({
      scraped: {
        description: ogDesc || metaDesc,
        bannerImage: ogImage,
        pageTitle: title,
        phone: phone || null,
        facebook: facebook || null,
        instagram: instagram || null,
        twitter: twitter || null,
        hours: hours || null,
        scrapedAt: new Date().toISOString(),
        sourceUrl: url,
      }
    })
  } catch (error: any) {
    console.error('Scrape error:', error.message)
    return NextResponse.json({ scraped: null, error: error.message })
  }
}
