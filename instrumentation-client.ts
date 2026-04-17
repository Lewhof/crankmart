import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Pre-launch: error capture only — no perf traces, no replay recording.
  // Replays kept an always-armed DOM recorder that cost hundreds of KB of JS
  // and 2-3 /monitoring POSTs per pageview. Turn on at launch if needed.
  tracesSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  replaysSessionSampleRate: 0,
  sendDefaultPii: false,
  beforeSend(event) {
    if (event.user) {
      delete event.user.email
      delete event.user.ip_address
    }
    if (event.request?.headers) {
      delete event.request.headers.cookie
      delete event.request.headers.authorization
    }
    return event
  },
  // No replayIntegration — that SDK stays loaded even at 0 sample rate.
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
