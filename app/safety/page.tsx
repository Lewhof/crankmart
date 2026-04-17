import type { Metadata } from 'next'
import Link from 'next/link'
import { buildAlternates } from '@/lib/hreflang'

export const metadata: Metadata = {
  title: 'Trust & Safety — CrankMart',
  description:
    'How CrankMart keeps the marketplace safe: moderation process, reporting, scam spotting, meet-up advice, and how we handle disputes and appeals.',
  alternates: buildAlternates('/safety'),
}

const sections: Array<{ heading: string; body: React.ReactNode }> = [
  {
    heading: 'How we moderate listings',
    body: (
      <>
        <p>
          Every new listing is queued for moderation before it appears in public browse results. Our team reviews
          for obvious fraud, duplicated images, misleading titles, and items that violate our terms (e.g. stolen
          goods, counterfeit, weapons, non-cycling items).
        </p>
        <p>
          We aim to clear the moderation queue within <strong>24 hours</strong>. If a listing sits longer, our
          admins are paged automatically so nothing slips through the cracks.
        </p>
      </>
    ),
  },
  {
    heading: 'Reporting a listing or user',
    body: (
      <>
        <p>
          Every listing has a <strong>Report</strong> button. Use it if you see something that breaks our rules —
          fake photos, obvious price-gouging, a bike you recognise as stolen, or harassment in messages.
        </p>
        <p>
          Reports go straight to the moderation queue. We confirm receipt by email, investigate within 24 hours,
          and let you know the outcome. Repeat offenders are banned and listings are removed.
        </p>
      </>
    ),
  },
  {
    heading: 'Spotting a scam',
    body: (
      <>
        <p>A genuine CrankMart seller will:</p>
        <ul>
          <li>Be willing to meet in person at a public place.</li>
          <li>Provide detailed photos — not just stock or press shots.</li>
          <li>Answer specific questions about the bike (service history, serial number, upgrades).</li>
          <li>Accept verified payment at handover, not a wire transfer before you&apos;ve seen the bike.</li>
        </ul>
        <p>
          If a deal feels off, it usually is. Walk away. A bike at half the going rate is either stolen or a scam.
          Never send a deposit to an account you can&apos;t trace. Never ship a bike without cleared funds.
        </p>
      </>
    ),
  },
  {
    heading: 'Meeting up safely',
    body: (
      <>
        <ul>
          <li>Meet during daylight hours, in a busy public space (a bike shop or café is ideal).</li>
          <li>Bring a friend for high-value items.</li>
          <li>Bring the VIN / serial number of any bike you&apos;re selling so the buyer can verify it.</li>
          <li>Test-ride only with proof of funds or a held deposit.</li>
          <li>Don&apos;t feel pressured to close on the spot. If something feels wrong, walk.</li>
        </ul>
      </>
    ),
  },
  {
    heading: 'Disputes and appeals',
    body: (
      <>
        <p>
          If a deal goes sideways, message us with the conversation thread and any proof (photos of the bike on
          arrival, proof of payment, etc.). We mediate in good faith and can intervene where our own rules were
          broken.
        </p>
        <p>
          If your listing was removed or your account suspended and you think it&apos;s in error, reply to the
          notification email or write to <a href="mailto:safety@crankmart.com">safety@crankmart.com</a>. We review
          every appeal within 48 hours and reinstate in full where appropriate.
        </p>
      </>
    ),
  },
  {
    heading: 'Data and privacy',
    body: (
      <>
        <p>
          Your data is yours. You can export everything we hold about you at any time from your account page,
          and you can delete your account (anonymising messages to preserve the other party&apos;s context) with one
          click. Full details in our <Link href="/privacy">privacy policy</Link>.
        </p>
      </>
    ),
  },
]

export default function SafetyPage() {
  return (
    <main style={{ maxWidth: 720, margin: '48px auto 96px', padding: '0 20px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1, margin: '0 0 12px' }}>Trust &amp; Safety</h1>
      <p style={{ fontSize: 16, color: '#4b5563', lineHeight: 1.6, margin: '0 0 32px' }}>
        CrankMart is a community of real SA cyclists buying and selling with each other. Here&apos;s how we keep
        it that way — and what to do when something goes wrong.
      </p>

      {sections.map(s => (
        <section key={s.heading} style={{ margin: '32px 0' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px', color: '#0D1B2A' }}>{s.heading}</h2>
          <div style={{ fontSize: 15, lineHeight: 1.65, color: '#374151' }}>{s.body}</div>
        </section>
      ))}

      <div style={{ marginTop: 48, padding: '20px 22px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 14, color: '#6b7280' }}>
        Something we missed? Email <a href="mailto:safety@crankmart.com" style={{ color: '#0D1B2A', fontWeight: 700 }}>safety@crankmart.com</a>.
      </div>
    </main>
  )
}
