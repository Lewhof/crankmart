'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <h1 style={{ fontSize: 22, marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ color: '#666', marginBottom: 16 }}>
              Our team has been notified. Please try again in a moment.
            </p>
            <a href="/" style={{ color: '#EA580C', textDecoration: 'none', fontWeight: 600 }}>
              Back to CrankMart →
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
