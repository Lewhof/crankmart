import { NextRequest, NextResponse } from 'next/server'

// Dynamic import for cheerio
async function getCheerio() {
  const { load } = await import('cheerio')
  return load
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid URL' },
        { status: 400 }
      )
    }

    // Fetch the URL
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: 400 }
      )
    }

    const html = await response.text()
    const load = await getCheerio()
    const $ = load(html)

    // Extract data from common bike marketplace patterns
    let title = ''
    let price = ''
    let description = ''
    const images: string[] = []

    // Try common meta tags first
    title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="title"]').attr('content') ||
      $('h1').first().text() ||
      ''

    description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('article').text() ||
      $('[data-testid="description"]').text() ||
      ''

    // Try to find price in common locations
    const priceText =
      $('[data-testid*="price"]').first().text() ||
      $('[class*="price"]').first().text() ||
      $('span:contains("R$")').first().text() ||
      $('span:contains("ZAR")').first().text() ||
      ''

    // Extract numeric price
    const priceMatch = priceText.match(/[\d,]+(?:\.\d{2})?/)
    if (priceMatch) {
      price = priceMatch[0].replace(/,/g, '')
    }

    // Extract images
    $('img').each((_, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src')
      if (src && images.length < 5) {
        // Handle relative URLs
        if (src.startsWith('/')) {
          src = new URL(src, url).toString()
        } else if (!src.startsWith('http')) {
          try {
            src = new URL(src, url).toString()
          } catch {
            // Skip if can't resolve
            return
          }
        }
        images.push(src)
      }
    })

    return NextResponse.json({
      title: title.trim().slice(0, 255),
      price: price || '',
      description: description.trim().slice(0, 1000),
      images: images.slice(0, 5),
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to import from URL',
        title: '',
        price: '',
        description: '',
        images: [],
      },
      { status: 200 } // Return 200 with empty data to handle gracefully on frontend
    )
  }
}
