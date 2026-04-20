'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, PageHeader, StatCard, Button, StatusPill } from '@/components/admin/primitives'
import { Calendar, Image as ImageIcon, Link2, Users, Edit3 } from 'lucide-react'

type Summary = {
  posts: { total: number; draft: number; scheduled: number; published: number }
  profiles: number
  assets: number
  shortLinks: { total: number; clicks: number }
  upcoming: Array<{ id: string; title: string | null; body: string; scheduled_at: string; platforms: string[]; status: string }>
}

export default function SocialMediaDashboard() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [posts, profiles, assets, links] = await Promise.all([
          fetch('/api/admin/social-media/posts?limit=500', { cache: 'no-store' }).then(r => r.json()),
          fetch('/api/admin/social-media/profiles', { cache: 'no-store' }).then(r => r.json()),
          fetch('/api/admin/social-media/assets?limit=1', { cache: 'no-store' }).then(r => r.json()),
          fetch('/api/admin/social-media/short-links?limit=500', { cache: 'no-store' }).then(r => r.json()),
        ])
        const all = (posts.posts || []) as Array<{ id: string; title: string | null; body: string; scheduled_at: string; platforms: string[]; status: string }>
        const byStatus = (s: string) => all.filter(p => p.status === s).length
        const upcoming = all
          .filter(p => p.status === 'scheduled' && p.scheduled_at)
          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
          .slice(0, 6)
        const totalClicks = (links.links || []).reduce((n: number, l: { clicks: number }) => n + (l.clicks ?? 0), 0)
        setData({
          posts: { total: all.length, draft: byStatus('draft'), scheduled: byStatus('scheduled'), published: byStatus('published') },
          profiles: (profiles.profiles || []).length,
          // `assets.count` is a true SELECT COUNT(*); `assets.assets.length` is just the current page.
          assets: assets.count ?? (assets.assets || []).length,
          shortLinks: { total: (links.links || []).length, clicks: totalClicks },
          upcoming,
        })
      } finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div>
      <PageHeader
        title="Social Media"
        subtitle="Plan, compose, and schedule social content. Copy-to-clipboard publishing (v1) — direct auto-post backends pending v2 decision."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button href="/admin/social-media/compose" variant="primary"><Edit3 size={14} /> New post</Button>
            <Button href="/admin/social-media/calendar"><Calendar size={14} /> Calendar</Button>
          </div>
        }
      />

      {loading && <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>Loading…</div>}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
            <StatCard label="Posts (all)" value={data.posts.total} tone="accent" />
            <StatCard label="Scheduled" value={data.posts.scheduled} tone="warn" hint="Ready to publish" />
            <StatCard label="Drafts" value={data.posts.draft} tone="neutral" />
            <StatCard label="Published" value={data.posts.published} tone="success" />
            <StatCard label="Social profiles" value={data.profiles} hint="Feeds sameAs + footer" />
            <StatCard label="Short-link clicks" value={data.shortLinks.clicks} hint={`${data.shortLinks.total} links`} tone="accent" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 20 }}>
            <QuickLink href="/admin/social-media/profiles" icon={Users}     label="Profiles"     desc="Manage handles & footer icons" />
            <QuickLink href="/admin/social-media/assets"   icon={ImageIcon} label="Asset library" desc="Upload + tag reusable media" />
            <QuickLink href="/admin/social-media/short-links" icon={Link2}  label="Short links"  desc="UTM-tagged /s/ redirects" />
            <QuickLink href="/admin/social-media/compose"  icon={Edit3}     label="Composer"     desc="Per-platform preview" />
            <QuickLink href="/admin/social-media/calendar" icon={Calendar}  label="Calendar"     desc="Month / week / list" />
          </div>

          <Card padded={false}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--admin-border)', fontWeight: 700, fontSize: 14, color: 'var(--admin-text)' }}>
              Upcoming posts
            </div>
            {data.upcoming.length === 0 ? (
              <div style={{ padding: 24, color: 'var(--admin-text-dim)', fontSize: 13, textAlign: 'center' }}>
                No scheduled posts. <Link href="/admin/social-media/compose" style={{ color: 'var(--admin-accent)' }}>Compose one</Link>.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {data.upcoming.map((p, i) => (
                  <li key={p.id} style={{ padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--admin-border)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--admin-text)', fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title || p.body.slice(0, 80) || '(untitled)'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>
                        {new Date(p.scheduled_at).toLocaleString()} · {(p.platforms || []).join(', ') || 'no platforms'}
                      </div>
                    </div>
                    <StatusPill label={p.status} tone="warn" />
                    <Button href={`/admin/social-media/compose?id=${p.id}`} size="sm">Edit</Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

function QuickLink({ href, icon: Icon, label, desc }: { href: string; icon: React.ComponentType<{ size?: number }>; label: string; desc: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--admin-surface)',
        border: '1px solid var(--admin-border)',
        borderRadius: 10,
        padding: 14,
        display: 'flex',
        gap: 12,
        alignItems: 'center',
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'color-mix(in oklch, var(--admin-accent) 15%, transparent)', color: 'var(--admin-accent)', display: 'grid', placeItems: 'center' }}>
          <Icon size={16} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>{label}</div>
          <div style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>{desc}</div>
        </div>
      </div>
    </Link>
  )
}

