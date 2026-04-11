'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, MapPin } from 'lucide-react'

const PROVINCES = ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape']

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', province: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Registration failed')
        return
      }
      router.push('/login?registered=true')
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <style>{`
        .auth-card { background: #fff; border-radius: 12px; border: 1px solid #ebebeb; padding: 32px; width: 100%; max-width: 420px; }
        .auth-logo { font-size: 22px; font-weight: 800; color: #0D1B2A; margin-bottom: 24px; text-align: center; }
        .auth-title { font-size: 22px; font-weight: 800; color: #1a1a1a; margin-bottom: 4px; }
        .auth-sub { font-size: 14px; color: #9a9a9a; margin-bottom: 24px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 13px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
        .input-wrap { position: relative; }
        .input-wrap input, .input-wrap select { width: 100%; height: 46px; padding: 0 14px 0 42px; border: 1.5px solid #e4e4e7; border-radius: 8px; font-size: 14px; color: #1a1a1a; background: #fff; outline: none; transition: border-color .15s; appearance: none; }
        .input-wrap input:focus, .input-wrap select:focus { border-color: #0D1B2A; }
        .input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #9a9a9a; pointer-events: none; z-index: 1; }
        .input-end { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9a9a9a; padding: 4px; }
        .btn-primary { width: 100%; height: 48px; background: var(--color-primary); color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; transition: background .15s; }
        .btn-primary:hover { background: #1e2d5a; }
        .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .divider-line { flex: 1; height: 1px; background: #ebebeb; }
        .divider-text { font-size: 12px; color: #9a9a9a; font-weight: 600; }
        .error-box { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #DC2626; margin-bottom: 16px; }
        .auth-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #9a9a9a; }
        .auth-footer a { color: #0D1B2A; font-weight: 700; text-decoration: none; }
        .pw-hint { font-size: 11px; color: #9a9a9a; margin-top: 5px; }
        .terms { font-size: 12px; color: #9a9a9a; text-align: center; margin-top: 16px; line-height: 1.5; }
        .terms a { color: #0D1B2A; text-decoration: none; font-weight: 600; }
      `}</style>

      <div className="auth-card">
        <div className="auth-logo">🚲 CycleMart</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join the South African cycling community</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input type="text" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
          </div>

          <div className="field">
            <label>Email</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
              <button type="button" className="input-end" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="pw-hint">At least 8 characters</div>
          </div>

          <div className="field">
            <label>Province</label>
            <div className="input-wrap">
              <MapPin size={16} className="input-icon" />
              <select value={form.province} onChange={e => set('province', e.target.value)} required>
                <option value="">Select your province</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="terms">
          By signing up you agree to our <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>
        </div>

        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
