import type { Metadata } from 'next'
import { ConditionalLayout } from '@/components/nav/ConditionalLayout'
import Analytics from '@/components/Analytics'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import CookieBanner from '@/components/CookieBanner'
import { GeoSuggestBanner } from '@/components/GeoSuggestBanner'
import { SessionProvider } from 'next-auth/react'
import { getThemeVars, buildThemeCss } from '@/lib/theme'
import { getCountry } from '@/lib/country'
import { getCountryConfig } from '@/lib/country-config'
import './globals.css'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D1B2A',
}

export async function generateMetadata(): Promise<Metadata> {
  const country = await getCountry()
  const cfg = getCountryConfig(country)
  const title = `CrankMart — ${cfg.name}'s Cycling Marketplace`
  const desc  = `Buy and sell bikes, gear, and cycling equipment in ${cfg.name}. Browse thousands of listings for road bikes, MTB, cycling clothing and more.`
  const path  = country === 'za' ? '/za' : `/${country}`
  return {
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      title: 'CrankMart',
      statusBarStyle: 'black-translucent',
    },
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
    title,
    description: desc,
    keywords: `cycling marketplace, buy bike, sell bike, ${cfg.name}, road bike, MTB, cycling gear`,
    openGraph: {
      title,
      description: `Buy and sell bikes, gear, and cycling equipment in ${cfg.name}.`,
      url: `https://crankmart.com${path}`,
      siteName: 'CrankMart',
      type: 'website',
      images: [
        {
          url: 'https://crankmart.com/images/crankmart-og.jpg',
          width: 1200,
          height: 630,
          alt: `CrankMart - ${cfg.name}'s Cycling Marketplace`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `Buy and sell bikes, gear, and cycling equipment in ${cfg.name}.`,
      images: ['https://crankmart.com/images/crankmart-og.jpg'],
    },
    alternates: {
      canonical: `https://crankmart.com${path}`,
      languages: {
        'en-ZA': 'https://crankmart.com/za',
        'en-AU': 'https://crankmart.com/au',
      },
    },
  }
}

function buildOrganizationSchema(country: 'za' | 'au') {
  const cfg = getCountryConfig(country)
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `https://crankmart.com/#organization-${country}`,
    name: 'CrankMart',
    alternateName: `CrankMart ${country.toUpperCase()}`,
    description:
      `${cfg.name}'s dedicated online cycling marketplace and business directory. Find bike shops, cycling events, gear, coaches, clubs and services across ${cfg.name}.`,
    url: `https://crankmart.com/${country}`,
    logo: {
      '@type': 'ImageObject',
      url: 'https://crankmart.com/images/crankmart-logo.png',
      width: 400,
      height: 120,
    },
    image: 'https://crankmart.com/images/crankmart-og.jpg',
    foundingDate: '2026',
    foundingLocation: cfg.name,
    areaServed: { '@type': 'Country', name: cfg.name },
    knowsAbout: ['cycling', 'bike shops', 'MTB', 'road cycling', 'cycling events', 'cycling gear'],
    slogan: `${cfg.name}'s Cycling Marketplace`,
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
}

function buildWebsiteSchema(country: 'za' | 'au') {
  const cfg = getCountryConfig(country)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `https://crankmart.com/#website-${country}`,
    url: `https://crankmart.com/${country}`,
    name: 'CrankMart',
    description: `${cfg.name}'s cycling marketplace`,
    publisher: { '@id': `https://crankmart.com/#organization-${country}` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://crankmart.com/${country}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const theme = await getThemeVars()
  const themeCss = buildThemeCss(theme)
  const country = await getCountry()
  const cfg = getCountryConfig(country)

  return (
    <html lang={cfg.locale}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationSchema(country)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebsiteSchema(country)) }}
        />
      </head>
      <body className="bg-background text-foreground">
        <SessionProvider>
          <GoogleAnalytics />
          <Analytics />
          <ConditionalLayout geoBanner={<GeoSuggestBanner currentCountry={country} />}>
            {children}
          </ConditionalLayout>
          <CookieBanner />
        </SessionProvider>
      </body>
    </html>
  )
}
