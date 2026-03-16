'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cursor from '@/components/Cursor'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function login() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/dashboard')
      } else if (data.error === 'subscription_lapsed') {
        router.push('/locked')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch { setError('Something went wrong') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <Cursor />
      <div style={{ position: 'absolute', width: 400, height: 400, background: 'radial-gradient(#f8d8e4, transparent)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, top: -100, left: -100, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, background: 'radial-gradient(#ead4c0, transparent)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.25, bottom: -50, right: -50, pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.5s ease forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#c4728a"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.314 4.217.5 7.752.5c1.61 0 3.093.698 4.248 1.798C13.155 1.198 14.638.5 16.248.5 19.783.5 23 3.314 23 7.191c0 4.105-5.37 8.863-11 14.402z"/></svg>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#c4728a' }}>Pulse</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-light)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>by StudyFocus Hub</p>
        </div>

        <div style={{ background: 'var(--soft-white)', border: '1px solid var(--pink-border)', borderRadius: 24, padding: 40, boxShadow: '0 8px 40px rgba(196,114,138,0.1)' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: 'var(--text-dark)', marginBottom: 8, letterSpacing: -0.5 }}>
            Welcome <em style={{ color: '#c4728a', fontStyle: 'italic' }}>back</em>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-mid)', marginBottom: 28, lineHeight: 1.6 }}>Your brain data is waiting.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>Email</label>
              <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
            </div>
          </div>

          {error && <p style={{ fontSize: 13, color: '#e05555', marginBottom: 16, background: '#fff0f0', padding: '10px 14px', borderRadius: 10 }}>{error}</p>}

          <button className="btn-primary" onClick={login} disabled={loading || !email || !password} style={{ width: '100%', opacity: loading || !email || !password ? 0.6 : 1 }}>
            {loading ? 'Logging in...' : 'Log in →'}
          </button>

          <p style={{ fontSize: 12, color: 'var(--text-light)', textAlign: 'center', marginTop: 20 }}>
            New to Pulse?{' '}
            <Link href="/activate" style={{ color: '#c4728a', textDecoration: 'none' }}>Activate your key →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
