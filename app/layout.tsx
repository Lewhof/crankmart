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
  title: 'CrankMart — South Africa\'s Cycling Marketplace',
  description: 'Buy and sell bikes, gear, and cycling equipment in South Africa. Browse thousands of listings for road bikes, MTB, cycling clothing and more.',
  keywords: 'cycling marketplace, buy bike, sell bike, South Africa, road bike, MTB, cycling gear',
  openGraph: {
    title: 'CrankMart — South Africa\'s Cycling Marketplace',
    description: 'Buy and sell bikes, gear, and cycling equipment in South Africa.',
    url: 'https://crankmart.com',
    siteName: 'CrankMart',
    type: 'website',
    images: [
      {
        url: 'https://crankmart.com/images/crankmart-og.jpg',
        width: 1200,
        height: 630,
        alt: 'CrankMart - South Africa\'s Cycling Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CrankMart — South Africa\'s Cycling Marketplace',
    description: 'Buy and sell bikes, gear, and cycling equipment in South Africa.',
    images: ['https://crankmart.com/images/crankmart-og.jpg'],
  },
  alternates: {
    canonical: 'https://crankmart.com',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://crankmart.com/#organization',
  name: 'CrankMart',
  alternateName: 'CrankMart SA',
  description:
    "South Africa's first dedicated online cycling marketplace and business directory. Find bike shops, cycling events, gear, coaches, clubs and services across SA.",
  url: 'https://crankmart.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://crankmart.com/images/crankmart-logo.png',
    width: 400,
    height: 120,
  },
  image: 'https://crankmart.com/images/crankmart-og.jpg',
  foundingDate: '2026',
  foundingLocation: 'South Africa',
  areaServed: { '@type': 'Country', name: 'South Africa' },
  knowsAbout: ['cycling', 'bike shops', 'MTB', 'road cycling', 'cycling events', 'cycling gear'],
  slogan: "SA's Cycling Marketplace",
  email: 'info@crankmart.com',
  sameAs: [
    'https://www.instagram.com/crankmartsa',
    'https://www.facebook.com/crankmartsa',
    'https://www.tiktok.com/@crankmartsa',
    'https://www.linkedin.com/company/crankmart-sa',
    'https://www.youtube.com/@crankmartsa',
    'https://twitter.com/crankmartsa',
  ],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://crankmart.com/#website',
  url: 'https://crankmart.com',
  name: 'CrankMart',
  description: "South Africa's cycling marketplace",
  publisher: { '@id': 'https://crankmart.com/#organization' },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://crankmart.com/search?q={search_term_string}',
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
