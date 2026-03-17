'use client'
import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import Cursor from '@/components/Cursor'
import Link from 'next/link'

export default function ForgetPage() {
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/forget/predictions').then(r => r.json()).then(d => {
      setPredictions(d.predictions || [])
      setLoading(false)
    })
  }, [])

  async function markReviewed(id: number) {
    await fetch('/api/forget/reviewed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setPredictions(prev => prev.filter(p => p.id !== id))
  }

  const urgent = predictions.filter(p => p.retentionPercentage < 40)
  const soon = predictions.filter(p => p.retentionPercentage >= 40 && p.retentionPercentage < 65)
  const ok = predictions.filter(p => p.retentionPercentage >= 65)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--soft-white)', display: 'flex' }}>
      <Cursor />
      <Sidebar active="/forget" />

      <main style={{ marginLeft: 220, padding: '40px 48px', flex: 1 }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: 'var(--text-dark)', marginBottom: 6, letterSpacing: -0.5 }}>
            <em style={{ color: '#c4728a', fontStyle: 'italic' }}>Forget</em> Tracker
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Based on YOUR retention patterns — not a generic algorithm.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12, animation: 'heartbeat 1.8s ease-in-out infinite' }}>⏰</div>
            <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Calculating your forget predictions...</p>
          </div>
        ) : predictions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 20, border: '1px solid var(--pink-border)' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🧠✨</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: 'var(--text-dark)', marginBottom: 8 }}>You're on top of everything!</h2>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 20 }}>Log more sessions and Pulse will predict when you might forget topics based on YOUR brain.</p>
            <Link href="/log" className="btn-primary" style={{ textDecoration: 'none', fontSize: 13 }}>Log a session →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Urgent */}
            {urgent.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e05555' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#e05555' }}>Review NOW — forgetting fast</span>
                  <span style={{ background: '#fff0f0', color: '#e05555', fontSize: 11, padding: '3px 10px', borderRadius: 20 }}>{urgent.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {urgent.map(p => <PredictionCard key={p.id} prediction={p} onReviewed={markReviewed} urgency="high" />)}
                </div>
              </div>
            )}

            {/* Soon */}
            {soon.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#be9470' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#be9470' }}>Review soon</span>
                  <span style={{ background: '#fdf5ef', color: '#be9470', fontSize: 11, padding: '3px 10px', borderRadius: 20 }}>{soon.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {soon.map(p => <PredictionCard key={p.id} prediction={p} onReviewed={markReviewed} urgency="medium" />)}
                </div>
              </div>
            )}

            {/* OK */}
            {ok.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c4728a' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-mid)' }}>Looking good</span>
                  <span style={{ background: 'var(--pink-light)', color: '#c4728a', fontSize: 11, padding: '3px 10px', borderRadius: 20 }}>{ok.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ok.map(p => <PredictionCard key={p.id} prediction={p} onReviewed={markReviewed} urgency="low" />)}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function PredictionCard({ prediction: p, onReviewed, urgency }: { prediction: any; onReviewed: (id: number) => void; urgency: 'high' | 'medium' | 'low' }) {
  const colors = { high: { bg: '#fff5f5', border: '#ffd0d0', bar: '#e05555' }, medium: { bg: '#fdf5ef', border: '#f0d8c0', bar: '#be9470' }, low: { bg: 'var(--pink-light)', border: 'var(--blush)', bar: '#c4728a' } }
  const c = colors[urgency]

  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-dark)', marginBottom: 2 }}>{p.topic}</div>
        <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 10 }}>{p.subject} · Studied {new Date(p.studiedAt).toLocaleDateString()}</div>
        {/* Retention bar */}
        <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 40, height: 4, overflow: 'hidden', width: 200 }}>
          <div style={{ background: c.bar, height: '100%', width: `${p.retentionPercentage}%`, borderRadius: 40 }} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>{p.retentionPercentage}% estimated retention</p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontFamily: 'Playfair Display, serif', fontWeight: 600, color: c.bar }}>{p.retentionPercentage}%</div>
        <button onClick={() => onReviewed(p.id)}
          style={{ marginTop: 8, background: c.bar, color: 'white', border: 'none', borderRadius: 40, padding: '6px 14px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
          ✓ Reviewed
        </button>
      </div>
    </div>
  )
}
