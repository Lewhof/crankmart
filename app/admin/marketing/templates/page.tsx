'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { PageHeader, Table, StatusPill, Button, Empty } from '@/components/admin/primitives'
import { Mail } from 'lucide-react'

interface TemplateRow {
  id: string
  name: string
  subject: string
  react_email_path: string
  is_transactional: boolean
  updated_at: string
}

export default function TemplatesPage() {
  const [rows, setRows] = useState<TemplateRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/marketing/templates')
      const data = await res.json()
      setRows(data.templates ?? [])
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })

  const tableRows = rows.map(r => ({
    id: r.id,
    cells: [
      <div key="n">
        <Link href={`/admin/marketing/templates/${r.id}`} style={{ fontWeight: 700, color: 'var(--admin-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Mail size={13} /> {r.name}
        </Link>
        <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 2 }}>{r.react_email_path}</div>
      </div>,
      <div key="s" style={{ fontSize: 13, color: 'var(--admin-text)' }}>{r.subject}</div>,
      <StatusPill key="t" label={r.is_transactional ? 'transactional' : 'marketing'} tone={r.is_transactional ? 'accent' : 'neutral'} />,
      <div key="u" style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>{fmt(r.updated_at)}</div>,
    ],
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Email templates"
        subtitle="Reusable templates backed by React Email components. Transactional = triggered (new message, listing published); marketing = campaign-scoped."
      />
      {loading ? <Empty message="Loading…" /> : (
        <Table head={['Name', 'Subject', 'Type', 'Updated']} rows={tableRows} empty="No templates yet — add one via the API." />
      )}
    </div>
  )
}
