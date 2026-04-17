'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, RefreshCw, Eye, EyeOff, ExternalLink, AlertTriangle } from 'lucide-react'
import { PageHeader, Card, Button } from '@/components/admin/primitives'

interface PayfastConfig {
  merchant_id: string
  merchant_key: string
  passphrase: string
  sandbox: boolean
}

interface CheckResult {
  status: 'idle' | 'loading' | 'ok' | 'error'
  message: string
  details?: Record<string, unknown>
}

const FIELD_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1.5px solid #e4e4e7',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--admin-text)',
  marginBottom: 6,
  letterSpacing: '0.03em',
}

const BTN: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  padding: '10px 18px',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  border: 'none',
}

export default function PayfastAdminPage() {
  const [config, setConfig] = useState<PayfastConfig>({
    merchant_id: '',
    merchant_key: '',
    passphrase: '',
    sandbox: false,
  })
  const [showKey, setShowKey] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [check, setCheck] = useState<CheckResult>({ status: 'idle', message: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/payfast')
      .then(r => r.json())
      .then(data => {
        setConfig({
          merchant_id: data.merchant_id ?? '',
          merchant_key: data.merchant_key ?? '',
          passphrase: data.passphrase ?? '',
          sandbox: data.sandbox === 'true' || data.sandbox === true,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await fetch('/api/admin/payfast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      setSaveMsg(data.success
        ? { ok: true, text: 'Saved. Restart the server for env changes to take effect.' }
        : { ok: false, text: data.error ?? 'Save failed' }
      )
    } catch {
      setSaveMsg({ ok: false, text: 'Network error' })
    } finally {
      setSaving(false)
    }
  }

  const handleVerify = async () => {
    setCheck({ status: 'loading', message: 'Verifying merchant with PayFast…' })
    try {
      const res = await fetch('/api/admin/payfast/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (data.valid) {
        setCheck({ status: 'ok', message: data.message ?? 'Merchant verified ✓', details: data.details })
      } else {
        setCheck({ status: 'error', message: data.error ?? 'Verification failed', details: data.details })
      }
    } catch {
      setCheck({ status: 'error', message: 'Could not reach PayFast API' })
    }
  }

  const sandboxHost = 'https://sandbox.payfast.co.za'
  const liveHost    = 'https://www.payfast.co.za'
  const host        = config.sandbox ? sandboxHost : liveHost

  if (loading) return <div style={{ padding: 32, color: 'var(--admin-text-dim)' }}>Loading…</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>

      <PageHeader
        title="PayFast"
        subtitle="Manage your PayFast merchant credentials and verify your integration."
      />

      {/* Environment toggle */}
      <div style={{ background: config.sandbox ? '#FEF3C7' : '#D1FAE5', border: `1.5px solid ${config.sandbox ? '#F59E0B' : '#34D399'}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: config.sandbox ? '#92400E' : '#065F46' }}>
            {config.sandbox ? '⚠️ SANDBOX MODE' : '✅ LIVE MODE'}
          </div>
          <div style={{ fontSize: 12, color: config.sandbox ? '#B45309' : '#059669', marginTop: 2 }}>
            {config.sandbox ? `Payments go to ${sandboxHost} — no real money` : `Payments go to ${liveHost} — real transactions`}
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--admin-text)' }}>Sandbox</span>
          <div
            onClick={() => setConfig(c => ({ ...c, sandbox: !c.sandbox }))}
            style={{
              width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
              background: config.sandbox ? '#F59E0B' : 'var(--admin-border)',
              position: 'relative', transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: config.sandbox ? 23 : 3,
              width: 18, height: 18, borderRadius: 9, background: 'var(--admin-surface)',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
            }} />
          </div>
        </label>
      </div>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--admin-text)' }}>Merchant Credentials</div>

        {/* Merchant ID */}
        <div>
          <label style={LABEL_STYLE}>Merchant ID</label>
          <input
            style={FIELD_STYLE}
            placeholder="e.g. 24040660"
            value={config.merchant_id}
            onChange={e => setConfig(c => ({ ...c, merchant_id: e.target.value }))}
          />
          <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 4 }}>
            Found in your PayFast merchant account → Settings → Merchant Details
          </div>
        </div>

        {/* Merchant Key */}
        <div>
          <label style={LABEL_STYLE}>Merchant Key</label>
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...FIELD_STYLE, paddingRight: 40 }}
              type={showKey ? 'text' : 'password'}
              placeholder="Your merchant key"
              value={config.merchant_key}
              onChange={e => setConfig(c => ({ ...c, merchant_key: e.target.value }))}
            />
            <button onClick={() => setShowKey(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-dim)', padding: 4 }}>
              {showKey ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>

        {/* Passphrase */}
        <div>
          <label style={LABEL_STYLE}>Passphrase <span style={{ fontWeight: 400, color: 'var(--admin-text-dim)' }}>(optional — required for signature validation)</span></label>
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...FIELD_STYLE, paddingRight: 40 }}
              type={showPass ? 'text' : 'password'}
              placeholder="Your passphrase (if set in PayFast)"
              value={config.passphrase}
              onChange={e => setConfig(c => ({ ...c, passphrase: e.target.value }))}
            />
            <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-dim)', padding: 4 }}>
              {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : 'Save Credentials'}
          </Button>
          {saveMsg && (
            <span style={{ fontSize: 13, color: saveMsg.ok ? '#065F46' : '#991B1B', fontWeight: 600 }}>
              {saveMsg.ok ? '✓' : '✗'} {saveMsg.text}
            </span>
          )}
        </div>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 4 }}>Merchant Verification</div>
          <div style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>
            Calls the PayFast API to confirm your merchant ID + key are valid and your account is active.
          </div>
        </div>

        <div style={{ alignSelf: 'flex-start' }}>
          <Button
            variant="ghost"
            onClick={handleVerify}
            disabled={check.status === 'loading' || !config.merchant_id || !config.merchant_key}
          >
            {check.status === 'loading'
              ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Verifying…</>
              : <><RefreshCw size={14} /> Verify with PayFast</>
            }
          </Button>
        </div>

        {check.status !== 'idle' && check.status !== 'loading' && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', borderRadius: 8,
            background: check.status === 'ok' ? '#D1FAE5' : '#FEE2E2',
            border: `1px solid ${check.status === 'ok' ? '#6EE7B7' : '#FECACA'}`,
          }}>
            {check.status === 'ok'
              ? <CheckCircle size={18} style={{ color: '#065F46', flexShrink: 0, marginTop: 1 }}/>
              : <XCircle size={18} style={{ color: '#991B1B', flexShrink: 0, marginTop: 1 }}/>
            }
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: check.status === 'ok' ? '#065F46' : '#991B1B' }}>
                {check.message}
              </div>
              {check.details && (
                <pre style={{ fontSize: 11, color: 'var(--admin-text-dim)', margin: '6px 0 0', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {JSON.stringify(check.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 8 }}>ITN Webhook</div>
        <div style={{ fontSize: 12, color: 'var(--admin-text-dim)', marginBottom: 10 }}>
          This URL must be set in your PayFast merchant account → Settings → Instant Transaction Notification.
        </div>
        <div style={{ background: 'var(--admin-surface-2)', borderRadius: 7, padding: '10px 14px', fontSize: 13, fontFamily: 'monospace', color: 'var(--admin-text)', wordBreak: 'break-all' }}>
          https://crankmart.com/api/payments/payfast/itn
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm" href={`${host}/eng/account/login`}>
            <ExternalLink size={13} /> Open PayFast{config.sandbox ? ' Sandbox' : ''}
          </Button>
        </div>
      </Card>

      {/* Quick test */}
      <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 12, padding: '16px 18px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <AlertTriangle size={16} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }}/>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>Testing tips</div>
            <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 12, color: '#B45309', lineHeight: 1.8 }}>
              <li>Enable Sandbox mode above before testing to avoid real charges</li>
              <li>Sandbox test cards: use any Visa/Mastercard on the sandbox checkout</li>
              <li>ITN won&apos;t fire in sandbox unless your server is publicly accessible (crankmart.com is ✓)</li>
              <li>Check boost activation: after payment, go to <strong>/admin/boosts</strong> and confirm status = active</li>
              <li>To test live: select the cheapest boost (Bump R20), pay, verify ITN, then refund in PayFast portal</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
