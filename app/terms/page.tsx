import Link from 'next/link'

export const metadata = { title: 'Terms of Service | CycleMart' }

export default function TermsPage() {
  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '32px 16px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', background: '#fff', borderRadius: 12, padding: '40px 32px', border: '1px solid #ebebeb' }}>
        <Link href="/" style={{ fontSize: 13, color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>← Back to CycleMart</Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a1a1a', margin: '0 0 8px' }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: '#9a9a9a', margin: '0 0 32px' }}>Last updated: March 2026</p>

        {[
          { h: 'Acceptance of Terms', p: 'By using CycleMart, you agree to these Terms of Service. CycleMart is a free classifieds platform connecting cyclists in South Africa. We do not facilitate payments or take commissions.' },
          { h: 'User Accounts', p: 'You must provide accurate information when registering. You are responsible for keeping your account credentials secure. One account per person. You must be 18 years or older to post listings.' },
          { h: 'Listings', p: 'Listings must be for cycling-related items only. Listings must be accurate — no misleading descriptions or photos. Prohibited items include counterfeit goods, stolen property, and anything illegal under South African law. CycleMart reserves the right to remove any listing without notice.' },
          { h: 'Transactions', p: 'CycleMart does not process payments. All transactions are conducted directly between buyers and sellers. We are not responsible for any disputes, fraud, or losses arising from transactions between users. Always meet in safe, public locations and exercise caution.' },
          { h: 'Content', p: 'You retain ownership of content you upload. By posting on CycleMart, you grant us a licence to display that content on the platform. Do not post content that is offensive, illegal, or infringes on third-party rights.' },
          { h: 'Limitation of Liability', p: 'CycleMart is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from use of the platform.' },
          { h: 'Changes to Terms', p: 'We may update these terms from time to time. Continued use of CycleMart after changes constitutes acceptance of the updated terms.' },
          { h: 'Governing Law', p: 'These terms are governed by the laws of South Africa. Any disputes will be resolved in South African courts.' },
          { h: 'Contact', p: 'For terms-related queries, contact us at legal@cyclemart.co.za.' },
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
