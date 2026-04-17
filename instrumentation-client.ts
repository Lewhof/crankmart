// Client-side Sentry disabled pre-launch — the @sentry/nextjs SDK
// forces ~290 KB of tracing code into every page's root bundle even
// with tracesSampleRate: 0, which was showing up as 2-3 seconds of
// script-download time on real-world connections.
//
// Server-side Sentry via instrumentation.ts still catches route / API
// errors and unhandled rejections inside server components, so we keep
// the most valuable half of B7 in place. Re-enable client capture once
// we have real users and the bandwidth cost is worth the browser-side
// debugging signal.

// Stub export so Next.js instrumentation hook signature is preserved
// but the Sentry SDK is not imported into the client bundle.
export const onRouterTransitionStart = () => {}
