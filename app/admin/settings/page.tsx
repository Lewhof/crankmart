'use client'

import { useEffect, useState } from 'react'
import { PageHeader, Card } from '@/components/admin/primitives'

interface Settings {
  [key: string]: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [testMessage, setTestMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        if (!response.ok) throw new Error('Failed to load settings')
        const data = await response.json()
        setSettings(data)
      } catch (error) {
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Failed to load settings',
        })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) throw new Error('Failed to save settings')

      setMessage({ type: 'success', text: 'Settings saved successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save settings',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testEmail) {
      setTestMessage({ type: 'error', text: 'Please enter a test email address' })
      return
    }

    setTestLoading(true)
    setTestMessage(null)

    try {
      const response = await fetch('/api/admin/settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to send test email')

      setTestMessage({ type: 'success', text: 'Test email sent successfully!' })
      setTestEmail('')
      setTimeout(() => setTestMessage(null), 3000)
    } catch (error) {
      setTestMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to send test email',
      })
    } finally {
      setTestLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ fontSize: '18px', color: 'var(--admin-text-dim)' }}>Loading settings...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Settings"
        subtitle="Configure email notifications and SMTP settings for CrankMart"
      />

      <Card padded={false}>
        <div style={{ padding: 32 }}>
        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: message.type === 'success' ? '#166534' : '#991b1b',
              fontSize: '14px',
              border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`,
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--admin-text)',
                marginBottom: '8px',
              }}
            >
              Enable Email Notifications
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={settings.email_notifications_enabled === 'true'}
                onChange={(e) =>
                  handleSettingChange('email_notifications_enabled', e.target.checked ? 'true' : 'false')
                }
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '14px', color: 'var(--admin-text-dim)' }}>Send transactional emails</span>
            </label>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--admin-text)',
                marginBottom: '8px',
              }}
            >
              SMTP Host
            </label>
            <input
              type="text"
              value={settings.smtp_host || ''}
              onChange={(e) => handleSettingChange('smtp_host', e.target.value)}
              placeholder="e.g., smtp.gmail.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--admin-text)',
                  marginBottom: '8px',
                }}
              >
                SMTP Port
              </label>
              <input
                type="number"
                value={settings.smtp_port || '587'}
                onChange={(e) => handleSettingChange('smtp_port', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--admin-text)',
                  marginBottom: '8px',
                }}
              >
                Security
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['none', 'tls', 'starttls'].map((option) => (
                  <label
                    key={option}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    <input
                      type="radio"
                      name="security"
                      value={option}
                      checked={
                        (option === 'none'     && (settings.smtp_secure === 'none'     || settings.smtp_secure === 'false')) ||
                        (option === 'tls'      && (settings.smtp_secure === 'tls'      || settings.smtp_secure === 'true'))  ||
                        (option === 'starttls' &&  settings.smtp_secure === 'starttls')
                      }
                      onChange={(e) => {
                        handleSettingChange('smtp_secure', e.target.value)
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{option.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--admin-text)',
                marginBottom: '8px',
              }}
            >
              SMTP Username
            </label>
            <input
              type="text"
              value={settings.smtp_user || ''}
              onChange={(e) => handleSettingChange('smtp_user', e.target.value)}
              placeholder="e.g., your-email@gmail.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--admin-text)',
                marginBottom: '8px',
              }}
            >
              SMTP Password
            </label>
            <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={settings.smtp_pass || ''}
                onChange={(e) => handleSettingChange('smtp_pass', e.target.value)}
                placeholder="Your SMTP password"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--admin-surface-2)',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--admin-text-dim)',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--admin-text)',
                  marginBottom: '8px',
                }}
              >
                From Name
              </label>
              <input
                type="text"
                value={settings.smtp_from_name || ''}
                onChange={(e) => handleSettingChange('smtp_from_name', e.target.value)}
                placeholder="CrankMart"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--admin-text)',
                  marginBottom: '8px',
                }}
              >
                From Email
              </label>
              <input
                type="email"
                value={settings.smtp_from_email || ''}
                onChange={(e) => handleSettingChange('smtp_from_email', e.target.value)}
                placeholder="noreply@crankmart.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: saving ? 'var(--admin-surface-2)' : 'var(--admin-accent)',
              color: '#fff',
              border: '1px solid var(--admin-accent)',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'filter 0.15s',
              opacity: saving ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!saving) (e.target as HTMLButtonElement).style.filter = 'brightness(1.1)'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.filter = 'none'
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Test Email Card */}
      <div
        style={{
          backgroundColor: 'var(--admin-surface)',
          border: '1px solid #ebebeb',
          borderRadius: '12px',
          padding: '32px',
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: 'var(--admin-text)' }}>Send Test Email</h2>
        <p style={{ color: 'var(--admin-text-dim)', margin: '0 0 20px', fontSize: '14px' }}>
          Verify your SMTP configuration by sending a test email
        </p>

        {testMessage && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: testMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: testMessage.type === 'success' ? '#166534' : '#991b1b',
              fontSize: '14px',
              border: `1px solid ${testMessage.type === 'success' ? '#86efac' : '#fca5a5'}`,
            }}
          >
            {testMessage.text}
          </div>
        )}

        <form onSubmit={handleTestEmail} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter test email address"
            required
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={testLoading}
            style={{
              padding: '10px 16px',
              backgroundColor: testLoading ? 'var(--admin-surface-2)' : 'var(--admin-accent)',
              color: '#fff',
              border: '1px solid var(--admin-accent)',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: testLoading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'filter 0.15s',
              opacity: testLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!testLoading) (e.target as HTMLButtonElement).style.filter = 'brightness(1.1)'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.filter = 'none'
            }}
          >
            {testLoading ? 'Sending...' : 'Send Test'}
          </button>
        </form>
        </div>
      </Card>
    </div>
  )
}
