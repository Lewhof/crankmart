import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CycleMart Pricing | SA Cycling Directory',
  description: 'Affordable plans to list your bike shop, brand or event on South Africa\'s dedicated cycling directory.',
}

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="8" cy="8" r="8" fill="#D1FAE5" />
    <path d="M4.5 8l2.5 2.5L11.5 6" stroke="#065F46" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

interface ShopTier {
  name: string
  price: string
  annual?: string
  annualSave?: string
  highlight?: boolean
  features: string[]
  cta: string
}

const SHOP_TIERS: ShopTier[] = [
  {
    name: 'Free',
    price: 'R0',
    features: [
      'Basic directory listing',
      'Name, address & contact info',
      'Business type + province filter',
      'Google Maps pin',
      '1 photo',
    ],
    cta: 'Get Listed Free',
  },
  {
    name: 'Starter',
    price: 'R149/mo',
    annual: 'R1,490/yr',
    annualSave: 'save R298',
    features: [
      'Everything in Free',
      'Full business profile',
      'Up to 10 photos',
      'Brands stocked + services list',
      'Trading hours',
      'Priority in search results',
      'Website + WhatsApp link',
    ],
    cta: 'Start Starter',
  },
  {
    name: 'Pro',
    price: 'R399/mo',
    annual: 'R3,990/yr',
    annualSave: 'save R798',
    highlight: true,
    features: [
      'Everything in Starter',
      'Featured badge on listing',
      'Homepage rotating feature slot',
      'Up to 30 photos',
      'Category top placement',
      'Monthly analytics report',
      'Boost credits (1× bump/mo)',
    ],
    cta: 'Go Pro',
  },
  {
    name: 'Anchor',
    price: 'R999/mo',
    annual: 'R9,990/yr',
    annualSave: 'save R1,998',
    features: [
      'Everything in Pro',
      'Permanent homepage anchor slot',
      'Sponsored category banner',
      'Unlimited photos',
      'Dedicated account manager',
      'Priority email support',
      'Custom landing page URL',
    ],
    cta: 'Become an Anchor',
  },
]

interface EventTier {
  name: string
  price: string
  features: string[]
  cta: string
  highlight?: boolean
}

const EVENT_TIERS: EventTier[] = [
  {
    name: 'Free',
    price: 'R0',
    features: [
      'Standard event listing',
      'Title, date, venue, entry info',
      'Province + type filters',
      'Entry URL link',
    ],
    cta: 'Submit Free Event',
  },
  {
    name: 'Featured',
    price: 'R299/event',
    highlight: true,
    features: [
      'Everything in Free',
      'Featured badge on events page',
      'Highlighted in search results',
      'Social share card',
      '30-day feature window',
    ],
    cta: 'Feature My Event',
  },
  {
    name: 'Headline',
    price: 'R799/event',
    features: [
      'Everything in Featured',
      'Top-of-page banner slot',
      'Homepage event spotlight',
      'Newsletter inclusion',
      'Dedicated event detail page boost',
    ],
    cta: 'Go Headline',
  },
]

function ShopCard({ tier }: { tier: ShopTier }) {
  return (
    <div style={{
      background: tier.highlight ? '#0D1B2A' : '#fff',
      border: tier.highlight ? '2px solid var(--color-primary)' : '1.5px solid #ebebeb',
      borderRadius: 12,
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {tier.highlight && (
        <div style={{
          position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-primary)', color: '#fff',
          fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '3px 14px', borderRadius: 20, whiteSpace: 'nowrap',
        }}>
          Most Popular
        </div>
      )}
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: tier.highlight ? 'rgba(255,255,255,0.55)' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {tier.name}
        </span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, color: tier.highlight ? '#fff' : '#0D1B2A', marginBottom: 4 }}>
        {tier.price}
      </div>
      {tier.annual && (
        <div style={{ fontSize: 12, color: tier.highlight ? 'rgba(255,255,255,0.5)' : '#9a9a9a', marginBottom: 20 }}>
          or {tier.annual} ({tier.annualSave})
        </div>
      )}
      {!tier.annual && <div style={{ marginBottom: 20 }} />}
      <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {tier.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13.5, color: tier.highlight ? 'rgba(255,255,255,0.85)' : '#374151', lineHeight: 1.4 }}>
            {CHECK}
            {f}
          </li>
        ))}
      </ul>
      <Link href="/directory/register"
        style={{
          display: 'block', textAlign: 'center',
          background: tier.highlight ? 'var(--color-primary)' : '#0D1B2A',
          color: '#fff', padding: '12px 20px', borderRadius: 8,
          textDecoration: 'none', fontWeight: 700, fontSize: 14,
        }}>
        {tier.cta} →
      </Link>
    </div>
  )
}

function EventCard({ tier }: { tier: EventTier }) {
  return (
    <div style={{
      background: tier.highlight ? '#0D1B2A' : '#fff',
      border: tier.highlight ? '2px solid var(--color-primary)' : '1.5px solid #ebebeb',
      borderRadius: 12,
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {tier.highlight && (
        <div style={{
          position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-primary)', color: '#fff',
          fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '3px 14px', borderRadius: 20, whiteSpace: 'nowrap',
        }}>
          Best Value
        </div>
      )}
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: tier.highlight ? 'rgba(255,255,255,0.55)' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {tier.name}
        </span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, color: tier.highlight ? '#fff' : '#0D1B2A', marginBottom: 24 }}>
        {tier.price}
      </div>
      <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {tier.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13.5, color: tier.highlight ? 'rgba(255,255,255,0.85)' : '#374151', lineHeight: 1.4 }}>
            {CHECK}
            {f}
          </li>
        ))}
      </ul>
      <Link href="/events/submit"
        style={{
          display: 'block', textAlign: 'center',
          background: tier.highlight ? 'var(--color-primary)' : '#0D1B2A',
          color: '#fff', padding: '12px 20px', borderRadius: 8,
          textDecoration: 'none', fontWeight: 700, fontSize: 14,
        }}>
        {tier.cta} →
      </Link>
    </div>
  )
}

export default function PricingPage() {
  return (
    <main style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <style>{`
        .pricing-grid-4 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .pricing-grid-4 { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 1024px) {
          .pricing-grid-4 { grid-template-columns: repeat(4, 1fr); }
        }
        .pricing-grid-3 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .pricing-grid-3 { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 900px) {
          .pricing-grid-3 { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* Hero */}
      <div style={{ background: '#0D1B2A', padding: '56px 20px 48px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 12 }}>
            Pricing
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', lineHeight: 1.1 }}>
            Reach SA cyclists.<br />Grow your business.
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.7, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
            CycleMart is South Africa&apos;s dedicated cycling directory. Every rand spent here reaches people who are actively looking for bike shops, events, and services.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>

        {/* Google Ads comparison */}
        <div style={{
          background: '#fff', border: '1.5px solid #ebebeb', borderRadius: 10,
          padding: '18px 24px', margin: '32px 0 48px',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 20 }}>💡</div>
          <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
            <strong>A single Google Ads click costs R12–R45.</strong> Featured on CycleMart reaches SA cyclists for <strong>R149/mo</strong> — unlimited impressions, targeted audience, zero cost-per-click.
          </p>
        </div>

        {/* Shop section */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0D1B2A', margin: '0 0 8px' }}>
              Bike Shops & Brands
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>
              List your shop, brand, service centre, or tour operator. Monthly or annual billing.
            </p>
          </div>
          <div className="pricing-grid-4">
            {SHOP_TIERS.map(t => <ShopCard key={t.name} tier={t} />)}
          </div>
        </div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1.5px solid #ebebeb', margin: '0 0 64px' }} />

        {/* Events section */}
        <div>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0D1B2A', margin: '0 0 8px' }}>
              Cycling Events
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>
              Promote your race, sportive, or fun ride to SA&apos;s cycling community. Pay per event.
            </p>
          </div>
          <div className="pricing-grid-3">
            {EVENT_TIERS.map(t => <EventCard key={t.name} tier={t} />)}
          </div>
        </div>

        {/* FAQ / trust strip */}
        <div style={{
          marginTop: 64, background: '#fff', border: '1.5px solid #ebebeb',
          borderRadius: 12, padding: '32px 28px',
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0D1B2A', margin: '0 0 20px' }}>
            Common questions
          </h3>
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {[
              { q: 'Can I cancel anytime?', a: 'Yes. Monthly plans can be cancelled before your next billing date. No lock-in.' },
              { q: 'What payment methods?', a: 'PayFast — credit card, EFT, Instant EFT. Invoices available for annual plans.' },
              { q: 'How does the free listing work?', a: 'Free listings are permanent and never expire. Upgrade when you want more visibility.' },
              { q: 'Are events per-listing or monthly?', a: 'Events are priced per listing, not a subscription. Pay once per event you want to feature.' },
            ].map(({ q, a }) => (
              <div key={q}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0D1B2A', marginBottom: 4 }}>{q}</div>
                <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.6 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
