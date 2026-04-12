import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Use CrankMart | South Africa\'s Cycling Marketplace',
  description: 'Everything you need to know about buying, selling, and finding cycling gear on CrankMart. Step-by-step guides for listings, messages, events, and more.',
}

const sections = [
  {
    id: 'buying',
    emoji: '🔍',
    title: 'Finding & Buying Gear',
    color: 'var(--color-primary)',
    steps: [
      {
        title: 'Browse or Search',
        body: 'Head to Browse to explore all listings, or use the search bar to find something specific. Filter by category (Bikes, Components, Clothing, etc.), price range, and location to narrow results.',
      },
      {
        title: 'View a Listing',
        body: 'Click any listing to see full details — photos, description, condition, location, and asking price. Check the seller\'s profile to see their rating and other active listings.',
      },
      {
        title: 'Contact the Seller',
        body: 'Use the "Contact Seller" button on any listing to send a message. All messages stay inside CrankMart — your personal contact details are never shared automatically. Negotiate, ask questions, or arrange a viewing.',
      },
      {
        title: 'Arrange the Deal',
        body: 'CrankMart is a marketplace — payment and handover happen directly between buyer and seller. Always meet in a safe, public place. Inspect the item before paying. Use EFT for large purchases and only pay once you\'re happy.',
      },
      {
        title: 'Save Listings',
        body: 'See something you\'re not ready to buy yet? Hit the bookmark icon to save it to your account. You\'ll get notified if the price drops or the listing is about to expire.',
      },
    ],
  },
  {
    id: 'selling',
    emoji: '💰',
    title: 'Selling Your Gear',
    color: '#16803c',
    steps: [
      {
        title: 'Create an Account',
        body: 'You need a free CrankMart account to post listings. Register with your email address — takes under a minute. No subscription fees, ever.',
      },
      {
        title: 'Post a Listing',
        body: 'Click "Sell" in the top navigation. Follow the 4-step process: choose a category, fill in the details (title, description, condition, price), upload photos, and set your location.',
      },
      {
        title: 'Add Great Photos',
        body: 'Listings with clear photos sell faster. Take shots from multiple angles in good natural light. Include close-ups of any wear or damage — honest listings build trust and reduce time-wasters.',
      },
      {
        title: 'Set the Right Price',
        body: 'Browse similar sold listings to gauge market value. Be realistic — overpriced gear sits unsold. You can always edit your price later from your account dashboard.',
      },
      {
        title: 'Manage Your Listing',
        body: 'From your account, you can edit details, mark as sold, renew an expiring listing, or delete it. Listings are active for 30 days and can be renewed for free.',
      },
      {
        title: 'Respond Quickly',
        body: 'Buyers move on fast. Check your messages regularly and respond promptly. The quickest reply usually gets the sale.',
      },
    ],
  },
  {
    id: 'directory',
    emoji: '🏪',
    title: 'Business Directory',
    color: '#9333ea',
    steps: [
      {
        title: 'Find a Local Bike Shop',
        body: 'The Directory lists cycling businesses across South Africa — bike shops, service centres, coaching services, tour operators, and more. Filter by location or category to find what\'s near you.',
      },
      {
        title: 'View Business Profiles',
        body: 'Each business profile shows their services, contact details, operating hours, location, and website. Some profiles include special offers for CrankMart users.',
      },
      {
        title: 'List Your Business',
        body: 'Own a cycling-related business? Get listed for free. Click "List Your Business" and fill in your details. Your listing goes live once reviewed by our team (usually within 24 hours).',
      },
    ],
  },
  {
    id: 'events',
    emoji: '🚴',
    title: 'Cycling Events',
    color: '#b45309',
    steps: [
      {
        title: 'Browse Upcoming Events',
        body: 'The Events section lists races, sportives, group rides, charity events, and cycling festivals across South Africa. Filter by date or location to find events near you.',
      },
      {
        title: 'Submit an Event',
        body: 'Organising a cycling event? Submit it for free. Include date, location, distance, entry details, and a link to your registration page. Events are reviewed and usually published within 24 hours.',
      },
    ],
  },
  {
    id: 'account',
    emoji: '👤',
    title: 'Your Account',
    color: '#0891b2',
    steps: [
      {
        title: 'Dashboard Overview',
        body: 'Your account dashboard shows all your active listings, saved items, messages, and listing history. Access it from the user icon in the top navigation.',
      },
      {
        title: 'Messages',
        body: 'All buyer/seller conversations live in your Messages tab. You\'ll see a notification badge when you have unread messages. Conversations are tied to listings, so context is always visible.',
      },
      {
        title: 'Saved Listings',
        body: 'Your saved listings are stored under the Saved tab. If a saved listing drops in price or is renewed, you\'ll be notified by email.',
      },
      {
        title: 'Listing History',
        body: 'See all your past listings — active, expired, and sold. Renew or repost any past listing with one click, pre-filled with your original details.',
      },
    ],
  },
  {
    id: 'safety',
    emoji: '🔒',
    title: 'Staying Safe',
    color: '#dc2626',
    steps: [
      {
        title: 'Meet in Public',
        body: 'Always meet buyers or sellers in a well-lit, public place — a coffee shop, bike shop, or busy car park. Never invite strangers to your home or go to theirs alone.',
      },
      {
        title: 'Inspect Before You Pay',
        body: 'Test ride the bike if possible. Check serial numbers haven\'t been tampered with. Verify components match the listing. Don\'t pay until you\'re satisfied.',
      },
      {
        title: 'Watch for Scams',
        body: 'Be cautious if a seller insists on upfront payment with no viewing, offers a price that seems too good to be true, or only communicates outside CrankMart. If something feels off, trust your gut.',
      },
      {
        title: 'Secure Payment',
        body: 'EFT (bank transfer) is the safest payment method for high-value items. Get a receipt. Never pay cash before seeing and testing the item. Avoid cryptocurrency payments.',
      },
      {
        title: 'Report a Problem',
        body: 'If you encounter a suspicious listing or user, use the report button on the listing or message. Our team reviews all reports promptly.',
      },
    ],
  },
]

export default function HowToPage() {
  return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh', padding: '0 0 80px' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #111 0%, #1a1a2e 100%)',
        padding: '60px 16px 48px',
        textAlign: 'center',
      }}>
        <Link href="/" style={{ fontSize: 13, color: '#6a6a6a', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
          ← Back to CrankMart
        </Link>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-1px' }}>
          How to Use CrankMart
        </h1>
        <p style={{ fontSize: 16, color: '#9a9a9a', margin: '0 auto 32px', maxWidth: 520, lineHeight: 1.6 }}>
          Everything you need to buy, sell, and discover cycling gear in South Africa.
        </p>

        {/* Jump links */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 700, margin: '0 auto' }}>
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{
              background: '#1e1e1e',
              border: '1px solid #2e2e2e',
              color: '#ccc',
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span>{s.emoji}</span> {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '48px 16px 0' }}>
        {sections.map((section, si) => (
          <div key={section.id} id={section.id} style={{ marginBottom: 56 }}>

            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 40, height: 40,
                background: section.color + '20',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}>
                {section.emoji}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1a1a1a', margin: 0, letterSpacing: '-0.5px' }}>
                {section.title}
              </h2>
            </div>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {section.steps.map((step, i) => (
                <div key={i} style={{
                  background: '#fff',
                  border: '1px solid #ebebeb',
                  borderRadius: 12,
                  padding: '20px 24px',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: section.color,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>
                      {step.title}
                    </div>
                    <p style={{ fontSize: 14, color: '#4a4a4a', lineHeight: 1.7, margin: 0 }}>
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {si < sections.length - 1 && (
              <div style={{ height: 1, background: '#e5e5e5', marginTop: 40 }} />
            )}
          </div>
        ))}

        {/* CTA block */}
        <div style={{
          background: 'linear-gradient(135deg, #111 0%, #1a1a2e 100%)',
          borderRadius: 16,
          padding: '40px 32px',
          textAlign: 'center',
          marginTop: 16,
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>Ready to get started?</h2>
          <p style={{ fontSize: 14, color: '#9a9a9a', margin: '0 0 24px' }}>Post your first listing in under 3 minutes. It&apos;s completely free.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/sell" style={{
              background: 'var(--color-primary)',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
            }}>
              Sell Something →
            </Link>
            <Link href="/browse" style={{
              background: '#1e1e1e',
              border: '1px solid #2e2e2e',
              color: '#ccc',
              padding: '12px 28px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
            }}>
              Browse Listings
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
