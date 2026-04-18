/**
 * Adds whiteboard items during a sprint when the admin UI is behind the Coming
 * Soon gate. Run once: `npx tsx scripts/whiteboard-add.ts`.
 *
 * Scoped to country='za' because that's where Lew operates; superadmin switching
 * exposes it across both verticals.
 */
import { neon } from '@neondatabase/serverless'

const items = [
  {
    title: 'PayU payment integration (multi-region alternative to PayFast)',
    description: `Add PayU as a second payment processor. PayU supports SA (PayU Payments South Africa), Poland, Turkey, LATAM, India — covers multiple regions under one gateway, which beats stitching PayFast + Stripe + others per country. Use cases: primary processor for AU when we launch paid features there (PayU is active in AU via CheckoutHub); fallback/redundancy for PayFast in SA; future-proofs expansion into a 3rd country. Wire into the boost-initiate flow + ITN-equivalent webhook. Abstract the processor choice behind a PaymentsProvider interface so boost + subscription code doesn't branch per gateway. Confirm merchant account eligibility + fee comparison vs PayFast (PayFast is 3.5% + R3.00; PayU typically 2.6–3.4%). Country routing: select processor by listing's country at boost-initiate time.`,
    priority: 'medium',
    effort: 'l',
    categories: ['payments', 'commerce', 'ops'],
  },
  {
    title: 'Superadmin country toggle on live site',
    description: `Currently the superadmin country switcher lives only in /admin. Add a country-toggle on the public site (header or footer, superadmin-only) so the same admin can QA both verticals end-to-end without jumping into the admin panel. Reads the existing admin_country cookie; shows current country + a "Switch to AU/ZA" action. Only renders for role ∈ {admin, superadmin} — invisible to normal users. Should flip without a page reload when possible (writes cookie + triggers a refresh).`,
    priority: 'medium',
    effort: 's',
    categories: ['admin', 'ops'],
  },
  {
    title: 'Admin ticketing module (OSS/BSS pattern)',
    description: `Build a proper ticketing / case-management module in admin. Every contact-us submission, reported issue, flagged content, bug report, and support enquiry should create a ticket with id, owner, status (new / in-progress / waiting / resolved / closed), priority, category, conversation thread, assignment, SLA timer, and email-in/email-out loop. Think telco OSS/BSS: a single pane where anything actionable surfaces as a ticket. Replaces the current ad-hoc email-to-info@ pattern. Needs: tickets table + threads table, admin pages /admin/tickets (list + detail + compose), email ingress via Postmark inbound or similar, canned-response templates, CSAT rating on close.`,
    priority: 'high',
    effort: 'l',
    categories: ['admin', 'support'],
  },
  {
    title: 'Marketing hub — per-country roadmap, outreach + email campaigns in admin',
    description: `Extend /admin/marketing so the entire marketing roadmap + outreach + email campaigns are managed in-app per country (ZA + AU separately, with shared brand assets). Needs: campaign entity (name, country, status, schedule, audience), contact lists / segments per country (waitlist, verified buyers, sellers, etc.), email templates library with preview + test-send, outreach sequences (business claim, shop verification, post-purchase), scheduled campaigns with pause/resume, open/click/bounce analytics, calendar view of what's going out when. Replace ad-hoc SendGrid/Postmark sends with managed flows. Tie back into existing email-templates admin. Roadmap-level view: Gantt / timeline of upcoming launches + promos per country.`,
    priority: 'high',
    effort: 'xl',
    categories: ['marketing', 'admin'],
  },
]

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  const sql = neon(url)

  for (const item of items) {
    try {
      const r = await sql`
        INSERT INTO whiteboard_items (country, title, description, priority, status, effort, categories)
        VALUES ('za', ${item.title}, ${item.description}, ${item.priority}, 'backlog', ${item.effort}, ${item.categories})
        ON CONFLICT DO NOTHING
        RETURNING id, title
      `
      if (r.length > 0) console.log(`✓ added: ${r[0].title}`)
      else console.log(`- skipped (exists): ${item.title}`)
    } catch (e) {
      console.error(`× failed: ${item.title}`, (e as Error).message)
    }
  }
}
main()
