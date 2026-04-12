'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

type Status = 'idle' | 'loading' | 'sent' | 'error'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }

      setStatus('sent')
    } catch {
      setErrorMsg('Could not connect to the server. Please check your connection and try again.')
      setStatus('error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <style>{`
        .auth-card { background: #fff; border-radius: 12px; border: 1px solid #ebebeb; padding: 32px; width: 100%; max-width: 420px; }
        .auth-logo { font-size: 22px; font-weight: 800; color: #0D1B2A; margin-bottom: 24px; text-align: center; }
        .input-wrap { position: relative; margin: 16px 0; }
        .input-wrap input { width: 100%; height: 46px; padding: 0 14px 0 42px; border: 1.5px solid #e4e4e7; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
        .input-wrap input:focus { border-color: #0D1B2A; }
        .input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #9a9a9a; pointer-events: none; }
        .btn-primary { width: 100%; height: 48px; background: var(--color-primary); color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .success-box { background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 14px; font-size: 13px; color: #065F46; text-align: center; }
        .error-box { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 14px; font-size: 13px; color: #991B1B; text-align: center; }
      `}</style>
      <div className="auth-card">
        <div className="auth-logo">CycleMart</div>
        <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9a9a9a', fontSize: 13, textDecoration: 'none', marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back to sign in
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>Reset password</h1>
        <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 24 }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {status === 'sent' ? (
          <div className="success-box">
            Check your inbox — a reset link is on its way. It expires in 1 hour.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
              />
            </div>
            {status === 'error' && (
              <div className="error-box" style={{ marginBottom: 12 }}>{errorMsg}</div>
            )}
            <button type="submit" className="btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
