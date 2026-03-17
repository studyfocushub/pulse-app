'use client'
import Link from 'next/link'

export function Sidebar({ active }: { active: string }) {
  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/log', label: 'Log Session', icon: '📓' },
    { href: '/insights', label: 'Brain Insights', icon: '🧠' },
    { href: '/coach', label: 'AI Coach', icon: '🤖' },
    { href: '/forget', label: 'Forget Tracker', icon: '⏰' },
    { href: '/profile', label: 'My Profile', icon: '🧬' },
    { href: '/battleplan', label: 'Exam Plan', icon: '🎯' },
    { href: '/wrapped', label: 'Weekly Wrapped', icon: '✨' },
  ]
  return (
    <nav style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 220, background: 'white', borderRight: '1px solid var(--pink-border)', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 6, zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#c4728a"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.314 4.217.5 7.752.5c1.61 0 3.093.698 4.248 1.798C13.155 1.198 14.638.5 16.248.5 19.783.5 23 3.314 23 7.191c0 4.105-5.37 8.863-11 14.402z"/></svg>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#c4728a' }}>Pulse</span>
      </div>
      {links.map(({ href, label, icon }) => (
        <Link key={href} href={href} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 12,
          fontSize: 13.5, textDecoration: 'none', transition: 'all 0.2s',
          background: active === href ? 'var(--pink-light)' : 'transparent',
          color: active === href ? '#c4728a' : 'var(--text-mid)',
          fontWeight: active === href ? 500 : 400,
        }}>
          <span>{icon}</span> {label}
        </Link>
      ))}
      <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--pink-border)' }}>
        <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, fontSize: 13, color: 'var(--text-light)', textDecoration: 'none' }}>
          ⚙️ Settings
        </Link>
      </div>
    </nav>
  )
}
