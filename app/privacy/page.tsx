import Link from 'next/link'

export const metadata = { title: 'Privacy Policy | CycleMart' }

export default function PrivacyPage() {
  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '32px 16px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', background: '#fff', borderRadius: 12, padding: '40px 32px', border: '1px solid #ebebeb' }}>
        <Link href="/" style={{ fontSize: 13, color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>← Back to CycleMart</Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a1a1a', margin: '0 0 8px' }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: '#9a9a9a', margin: '0 0 32px' }}>Last updated: March 2026</p>

        {[
          { h: 'Information We Collect', p: 'We collect information you provide when creating an account, posting listings, or contacting sellers. This includes your name, email address, location, and any photos or descriptions you upload.' },
          { h: 'How We Use Your Information', p: 'We use your information to operate the CycleMart marketplace, facilitate communication between buyers and sellers, send transactional emails (listing confirmations, messages), and improve our platform.' },
          { h: 'Information Sharing', p: 'We do not sell your personal information. Your name and general location are visible on listings you post. Your email address is never shared with other users — all communication goes through our messaging system.' },
          { h: 'Data Security', p: 'Your data is stored on secure servers with encryption in transit and at rest. Passwords are hashed and never stored in plain text. We use industry-standard security practices.' },
          { h: 'Cookies', p: 'CycleMart uses cookies for authentication and session management. We do not use third-party tracking cookies.' },
          { h: 'Your Rights', p: 'You can request deletion of your account and associated data at any time by contacting us. You may also update your profile information from your account settings.' },
          { h: 'Contact', p: 'For privacy-related queries, contact us at privacy@cyclemart.co.za.' },
        ].map(({ h, p }) => (
          <div key={h} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px' }}>{h}</h2>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{p}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
