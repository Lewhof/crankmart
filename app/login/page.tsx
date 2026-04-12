'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  const callbackUrl = searchParams.get('callbackUrl') || '/browse'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })
      if (!result) {
        setError('Sign in failed. Please try again.')
        setLoading(false)
        return
      }
      if (result.error) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }
      // Success — hard navigate to ensure session cookie is picked up
      window.location.href = callbackUrl
    } catch (err) {
      setError('An error occurred. Please try again.')
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
        .input-wrap input { width: 100%; height: 46px; padding: 0 42px 0 42px; border: 1.5px solid #e4e4e7; border-radius: 8px; font-size: 14px; color: #1a1a1a; background: #fff; outline: none; transition: border-color .15s; }
        .input-wrap input:focus { border-color: #0D1B2A; }
        .input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #9a9a9a; pointer-events: none; }
        .input-end { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9a9a9a; padding: 4px; }
        .btn-primary { width: 100%; height: 48px; background: var(--color-primary); color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; transition: background .15s; }
        .btn-primary:hover { background: #1e2d5a; }
        .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
        .btn-google { width: 100%; height: 48px; background: #fff; color: #1a1a1a; border: 1.5px solid #e4e4e7; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background .15s; }
        .btn-google:hover { background: #f5f5f5; }
        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .divider-line { flex: 1; height: 1px; background: #ebebeb; }
        .divider-text { font-size: 12px; color: #9a9a9a; font-weight: 600; white-space: nowrap; }
        .error-box { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #DC2626; margin-bottom: 16px; }
        .success-box { background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #065F46; margin-bottom: 16px; }
        .auth-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #9a9a9a; }
        .auth-footer a { color: #0D1B2A; font-weight: 700; text-decoration: none; }
        .forgot-link { font-size: 12px; color: #0D1B2A; font-weight: 600; text-decoration: none; float: right; }
      `}</style>

      <div className="auth-card">
        <div className="auth-logo">🚲 CycleMart</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your account</p>

        {registered && (
          <div className="success-box">Account created — you can now sign in.</div>
        )}
        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label htmlFor="password" style={{ margin: 0 }}>Password</label>
              <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="input-end" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">or continue with</span>
          <div className="divider-line" />
        </div>

        <button className="btn-google" onClick={() => signIn('google', { callbackUrl })}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
          Continue with Google
        </button>

        <div className="auth-footer">
          Don't have an account? <Link href="/register">Create one</Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
