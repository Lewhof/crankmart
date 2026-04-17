'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

/**
 * GA4 with Consent Mode v2. The tag loads on every non-admin pageview, but
 * all storage is denied by default — no pageviews, no ad signals, no cookies
 * beyond the anonymous consent-mode ping. When the cookie banner (B5) accepts
 * analytics, it calls `gtag('consent', 'update', { analytics_storage: 'granted' })`
 * and GA4 starts recording normally.
 */
export default function GoogleAnalytics() {
  const pathname = usePathname()

  if (!GA_ID) return null
  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      <Script
        id="ga4-consent-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              wait_for_update: 500
            });
          `,
        }}
      />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              anonymize_ip: true,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  )
}
