'use client'
import Cursor from '@/components/Cursor'

export default function LockedPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Cursor />
      <div style={{ textAlign: 'center', maxWidth: 440, animation: 'fadeUp 0.5s ease forwards' }}>
        <div style={{ fontSize: 64, marginBottom: 16, filter: 'grayscale(1)', opacity: 0.4 }}>💔</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: 'var(--text-dark)', marginBottom: 10, letterSpacing: -0.5 }}>
          Your heart stopped beating
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-mid)', marginBottom: 28, lineHeight: 1.7 }}>
          Your Pulse subscription has lapsed or been cancelled. Resubscribe to get back to your study data, insights, and AI coach.
        </p>
        <a href="https://gumroad.com" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
          Resubscribe on Gumroad →
        </a>
        <p style={{ fontSize: 12, color: 'var(--text-light)' }}>
          Already resubscribed?{' '}
          <a href="/login" style={{ color: '#c4728a', textDecoration: 'none' }}>Log in again →</a>
        </p>
      </div>
    </div>
  )
}
