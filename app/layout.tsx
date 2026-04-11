import type { Metadata } from 'next'
import { ConditionalLayout } from '@/components/nav/ConditionalLayout'
import Analytics from '@/components/Analytics'
import { SessionProvider } from 'next-auth/react'
import { getThemeVars, buildThemeCss } from '@/lib/theme'
import './globals.css'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      { rel: 'icon', url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  title: 'CycleMart — South Africa\'s Cycling Marketplace',
  description: 'Buy and sell bikes, gear, and cycling equipment in South Africa. Browse thousands of listings for road bikes, MTB, cycling clothing and more.',
  keywords: 'cycling marketplace, buy bike, sell bike, South Africa, road bike, MTB, cycling gear',
  openGraph: {
    title: 'CycleMart — South Africa\'s Cycling Marketplace',
    description: 'Buy and sell bikes, gear, and cycling equipment in South Africa.',
    url: 'https://cyclemart.co.za',
    siteName: 'CycleMart',
    type: 'website',
    images: [
      {
        url: 'https://cyclemart.co.za/images/cyclemart-og.jpg',
        width: 1200,
        height: 630,
        alt: 'CycleMart - South Africa\'s Cycling Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CycleMart — South Africa\'s Cycling Marketplace',
    description: 'Buy and sell bikes, gear, and cycling equipment in South Africa.',
    images: ['https://cyclemart.co.za/images/cyclemart-og.jpg'],
  },
  alternates: {
    canonical: 'https://cyclemart.co.za',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://cyclemart.co.za/#organization',
  name: 'CycleMart',
  alternateName: 'CycleMart SA',
  description:
    "South Africa's first dedicated online cycling marketplace and business directory. Find bike shops, cycling events, gear, coaches, clubs and services across SA.",
  url: 'https://cyclemart.co.za',
  logo: {
    '@type': 'ImageObject',
    url: 'https://cyclemart.co.za/images/cyclemart-logo.png',
    width: 400,
    height: 120,
  },
  image: 'https://cyclemart.co.za/images/cyclemart-og.jpg',
  foundingDate: '2026',
  foundingLocation: 'South Africa',
  areaServed: { '@type': 'Country', name: 'South Africa' },
  knowsAbout: ['cycling', 'bike shops', 'MTB', 'road cycling', 'cycling events', 'cycling gear'],
  slogan: "SA's Cycling Marketplace",
  email: 'info@cyclemart.co.za',
  sameAs: [
    'https://www.instagram.com/cyclemartsa',
    'https://www.facebook.com/cyclemartsa',
    'https://www.tiktok.com/@cyclemartsa',
    'https://www.linkedin.com/company/cyclemart-sa',
    'https://www.youtube.com/@cyclemartsa',
    'https://twitter.com/cyclemartsa',
  ],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://cyclemart.co.za/#website',
  url: 'https://cyclemart.co.za',
  name: 'CycleMart',
  description: "South Africa's cycling marketplace",
  publisher: { '@id': 'https://cyclemart.co.za/#organization' },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://cyclemart.co.za/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const theme = await getThemeVars()
  const themeCss = buildThemeCss(theme)

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="bg-background text-foreground">
        <SessionProvider>
          <Analytics />
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </SessionProvider>
      </body>
    </html>
  )
}
