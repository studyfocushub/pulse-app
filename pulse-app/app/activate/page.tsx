'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cursor from '@/components/Cursor'

export default function ActivatePage() {
  const router = useRouter()
  const [step, setStep] = useState<'key' | 'account'>('key')
  const [licenseKey, setLicenseKey] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function validateKey() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey }),
      })
      const data = await res.json()
      if (data.success) {
        setEmail(data.email || '')
        setStep('account')
      } else {
        setError(data.error || 'Invalid license key. Check your Gumroad email.')
      }
    } catch { setError('Something went wrong. Try again.') }
    setLoading(false)
  }

  async function createAccount() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, licenseKey }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/onboarding')
      } else {
        setError(data.error || 'Account creation failed.')
      }
    } catch { setError('Something went wrong. Try again.') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <Cursor />

      {/* Background blobs */}
      <div style={{ position: 'absolute', width: 400, height: 400, background: 'radial-gradient(#f8d8e4, transparent)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, top: -100, left: -100, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, background: 'radial-gradient(#ead4c0, transparent)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.25, bottom: -50, right: -50, pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.5s ease forwards' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#c4728a">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.314 4.217.5 7.752.5c1.61 0 3.093.698 4.248 1.798C13.155 1.198 14.638.5 16.248.5 19.783.5 23 3.314 23 7.191c0 4.105-5.37 8.863-11 14.402z"/>
            </svg>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#c4728a' }}>Pulse</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-light)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>by StudyFocus Hub</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--soft-white)', border: '1px solid var(--pink-border)', borderRadius: 24, padding: 40, boxShadow: '0 8px 40px rgba(196,114,138,0.1)' }}>

          {step === 'key' ? (
            <>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: 'var(--text-dark)', marginBottom: 8, letterSpacing: -0.5 }}>
                Activate your <em style={{ color: '#c4728a', fontStyle: 'italic' }}>Pulse</em>
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-mid)', marginBottom: 28, lineHeight: 1.6 }}>
                Enter the license key from your Gumroad purchase email to get started.
              </p>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>License key</label>
                <input
                  className="input"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={e => setLicenseKey(e.target.value)}
                  style={{ letterSpacing: 2, fontSize: 16, fontFamily: 'monospace' }}
                />
              </div>

              {error && <p style={{ fontSize: 13, color: '#e05555', marginBottom: 16, background: '#fff0f0', padding: '10px 14px', borderRadius: 10 }}>{error}</p>}

              <button className="btn-primary" onClick={validateKey} disabled={loading || !licenseKey} style={{ width: '100%', opacity: loading || !licenseKey ? 0.6 : 1 }}>
                {loading ? 'Checking...' : 'Verify key →'}
              </button>

              <p style={{ fontSize: 12, color: 'var(--text-light)', textAlign: 'center', marginTop: 20 }}>
                Don't have a key yet?{' '}
                <a href="https://gumroad.com" style={{ color: '#c4728a', textDecoration: 'none' }}>Get Pulse →</a>
              </p>
            </>
          ) : (
            <>
              <div style={{ background: 'var(--pink-light)', borderRadius: 12, padding: '10px 14px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>✅</span>
                <span style={{ fontSize: 13, color: '#c4728a', fontWeight: 500 }}>Key verified! Now create your account.</span>
              </div>

              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: 'var(--text-dark)', marginBottom: 24, letterSpacing: -0.5 }}>
                Create your account
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>Your name</label>
                  <input className="input" placeholder="e.g. Sofia" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>Email</label>
                  <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>Password</label>
                  <input className="input" type="password" placeholder="Choose a strong password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>

              {error && <p style={{ fontSize: 13, color: '#e05555', marginBottom: 16, background: '#fff0f0', padding: '10px 14px', borderRadius: 10 }}>{error}</p>}

              <button className="btn-primary" onClick={createAccount} disabled={loading || !email || !password || !name} style={{ width: '100%', opacity: loading || !email || !password || !name ? 0.6 : 1 }}>
                {loading ? 'Creating account...' : 'Start discovering your brain →'}
              </button>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-light)', marginTop: 20 }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#c4728a', textDecoration: 'none' }}>Log in</a>
        </p>
      </div>
    </div>
  )
}
