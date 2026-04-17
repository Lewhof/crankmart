'use client'

import { useState } from 'react'
import { Eye, X } from 'lucide-react'
import { PageHeader, Card, Button } from '@/components/admin/primitives'
import {
  newMessageEmail,
  listingPublishedEmail,
  listingExpiryReminderEmail,
  shopClaimTouch1Email,
  shopClaimTouch2Email,
  shopClaimTouch3Email,
  shopVerifiedEmail,
  eventOrganizerTouch1Email,
  eventVerifiedEmail,
  boostRenewalEmail,
  adListingInviteEmail,
} from '@/lib/email-templates'

const BASE = 'https://crankmart.com'

const SAMPLE = {
  businessName:  'Cape Town Cycles',
  city:          'Cape Town',
  ownerName:     'Johan van Niekerk',
  organiserName: 'Sarah Botha',
  eventTitle:    'Cape Town Cycle Tour 2026',
  eventDate:     '9 March 2026',
  listingTitle:  'Trek Marlin 7 2023 — R18,500',
  tier:          'Pro',
  expiresAt:     '30 April 2026',
  sellerName:    'Pieter Joubert',
  buyerName:     'Liz Swart',
  claimUrl:      `${BASE}/directory/claim?token=sample`,
  previewUrl:    `${BASE}/directory/cape-town-cycles`,
  listingUrl:    `${BASE}/browse/trek-marlin-7`,
  dashboardUrl:  `${BASE}/account/my-listing`,
  eventUrl:      `${BASE}/events/cape-town-cycle-tour-2026`,
  editUrl:       `${BASE}/events/manage/sample-token`,
  renewUrl:      `${BASE}/pricing`,
  reviewUrl:     `${BASE}/browse/trek-marlin-7`,
  inboxUrl:      `${BASE}/account?tab=messages`,
  unsubscribeUrl: `${BASE}/unsubscribe?sample=1`,
  messagePreview: 'Hi, is the Trek Marlin still available? Can we arrange a viewing this weekend?',
}

interface Template {
  id: string
  name: string
  trigger: string
  generate: () => string
}

const TEMPLATES: Template[] = [
  {
    id: 'new-message',
    name: 'New Message',
    trigger: 'When a buyer sends a message to a seller',
    generate: () => newMessageEmail({
      sellerName: SAMPLE.sellerName,
      buyerName: SAMPLE.buyerName,
      listingTitle: SAMPLE.listingTitle,
      messagePreview: SAMPLE.messagePreview,
      listingUrl: SAMPLE.listingUrl,
      inboxUrl: SAMPLE.inboxUrl,
    }),
  },
  {
    id: 'listing-published',
    name: 'Listing Published',
    trigger: 'When a seller\'s listing goes live',
    generate: () => listingPublishedEmail({
      sellerName: SAMPLE.sellerName,
      listingTitle: SAMPLE.listingTitle,
      listingUrl: SAMPLE.listingUrl,
    }),
  },
  {
    id: 'listing-expiry',
    name: 'Listing Expiry Reminder',
    trigger: 'When a listing is 5 days from expiring',
    generate: () => listingExpiryReminderEmail({
      sellerName: SAMPLE.sellerName,
      listingTitle: SAMPLE.listingTitle,
      listingUrl: SAMPLE.listingUrl,
      renewUrl: SAMPLE.renewUrl,
      expiresAt: SAMPLE.expiresAt,
    }),
  },
  {
    id: 'shop-claim-1',
    name: 'Shop Outreach — Touch 1',
    trigger: 'First outreach email when admin sends claim invite',
    generate: () => shopClaimTouch1Email({
      businessName: SAMPLE.businessName,
      city: SAMPLE.city,
      claimUrl: SAMPLE.claimUrl,
      previewUrl: SAMPLE.previewUrl,
      unsubscribeUrl: SAMPLE.unsubscribeUrl,
    }),
  },
  {
    id: 'shop-claim-2',
    name: 'Shop Outreach — Touch 2',
    trigger: 'Follow-up if touch 1 not actioned after 7 days',
    generate: () => shopClaimTouch2Email({
      businessName: SAMPLE.businessName,
      city: SAMPLE.city,
      claimUrl: SAMPLE.claimUrl,
      unsubscribeUrl: SAMPLE.unsubscribeUrl,
    }),
  },
  {
    id: 'shop-claim-3',
    name: 'Shop Outreach — Touch 3',
    trigger: 'Final reminder 14 days after touch 1',
    generate: () => shopClaimTouch3Email({
      businessName: SAMPLE.businessName,
      claimUrl: SAMPLE.claimUrl,
      unsubscribeUrl: SAMPLE.unsubscribeUrl,
    }),
  },
  {
    id: 'shop-verified',
    name: 'Shop Verified',
    trigger: 'Sent to owner after successfully claiming a listing',
    generate: () => shopVerifiedEmail({
      ownerName: SAMPLE.ownerName,
      businessName: SAMPLE.businessName,
      dashboardUrl: SAMPLE.dashboardUrl,
      listingUrl: SAMPLE.previewUrl,
    }),
  },
  {
    id: 'event-organiser-touch1',
    name: 'Event Organiser — Touch 1',
    trigger: 'When an event is scraped and organiser email is known',
    generate: () => eventOrganizerTouch1Email({
      eventTitle: SAMPLE.eventTitle,
      organiserName: SAMPLE.organiserName,
      eventDate: SAMPLE.eventDate,
      editUrl: SAMPLE.editUrl,
      unsubscribeUrl: SAMPLE.unsubscribeUrl,
    }),
  },
  {
    id: 'event-verified',
    name: 'Event Verified',
    trigger: 'When admin verifies an event listing',
    generate: () => eventVerifiedEmail({
      organiserName: SAMPLE.organiserName,
      eventTitle: SAMPLE.eventTitle,
      eventUrl: SAMPLE.eventUrl,
      editUrl: SAMPLE.editUrl,
    }),
  },
  {
    id: 'boost-renewal',
    name: 'Boost Renewal Reminder',
    trigger: 'Sent 7 days before a boost expires',
    generate: () => boostRenewalEmail({
      businessName: SAMPLE.businessName,
      tier: SAMPLE.tier,
      expiresAt: SAMPLE.expiresAt,
      renewUrl: SAMPLE.renewUrl,
    }),
  },
  {
    id: 'ad-listing-invite',
    name: 'Ad Listing Invite',
    trigger: 'Invite shop owners to review a relevant classified listing',
    generate: () => adListingInviteEmail({
      businessName: SAMPLE.businessName,
      listingTitle: SAMPLE.listingTitle,
      reviewUrl: SAMPLE.reviewUrl,
      unsubscribeUrl: SAMPLE.unsubscribeUrl,
    }),
  },
]

export default function EmailTemplatesPage() {
  const [preview, setPreview] = useState<Template | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Email Templates"
        subtitle={`${TEMPLATES.length} templates — previewed with sample data`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {TEMPLATES.map(t => (
          <Card key={t.id}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 120 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--admin-text-dim)', lineHeight: 1.5 }}>{t.trigger}</div>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <Button variant="ghost" size="sm" onClick={() => setPreview(t)}>
                  <Eye size={13} /> Preview
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {preview && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setPreview(null)}
        >
          <div
            style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, width: '100%', maxWidth: 680, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--admin-text)' }}>{preview.name}</div>
                <div style={{ fontSize: 12, color: 'var(--admin-text-dim)', marginTop: 2 }}>{preview.trigger}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>
                <X size={14} />
              </Button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <iframe
                srcDoc={preview.generate()}
                style={{ width: '100%', height: '100%', border: 'none', minHeight: 500 }}
                title={preview.name}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
