'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cursor from '@/components/Cursor'
import { Sidebar } from '@/components/Sidebar'

const TECHNIQUES = [
  { id: 'flashcards', label: 'Flashcards', emoji: '🃏' },
  { id: 'rereading', label: 'Re-reading', emoji: '📖' },
  { id: 'practice', label: 'Practice problems', emoji: '✍️' },
  { id: 'mindmap', label: 'Mind map', emoji: '🗺️' },
  { id: 'notes', label: 'Writing notes', emoji: '📝' },
  { id: 'video', label: 'Watching videos', emoji: '🎥' },
  { id: 'teaching', label: 'Teaching myself', emoji: '🗣️' },
  { id: 'past_papers', label: 'Past papers', emoji: '📄' },
]

const TIME_SLOTS = ['Early morning', 'Morning', 'Afternoon', 'Evening', 'Late night']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function LogPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    subject: '',
    topic: '',
    technique: '',
    durationMinutes: 30,
    confidenceScore: 3,
    energyBefore: 3,
    energyAfter: 3,
    timeOfDay: '',
    dayOfWeek: DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1],
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!form.subject || !form.topic || !form.technique || !form.timeOfDay) {
      setError('Please fill in all fields'); return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/sessions/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        setError(data.error || 'Failed to save session')
      }
    } catch { setError('Something went wrong') }
    setLoading(false)
  }

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', gap: 20 }}>
      <Cursor />
      <div style={{ fontSize: 60 }}>💗</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--text-dark)' }}>Session logged!</h2>
      <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Your heart is happy. Returning to dashboard...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--soft-white)', display: 'flex' }}>
      <Cursor />
      <Sidebar active="/log" />

      <main style={{ marginLeft: 220, padding: '40px 48px', flex: 1, maxWidth: 700 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: 'var(--text-dark)', marginBottom: 6, letterSpacing: -0.5 }}>
            Log a <em style={{ color: '#c4728a', fontStyle: 'italic' }}>study session</em>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-light)' }}>30 seconds. Your brain will thank you later.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Subject + Topic */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Subject</label>
              <input className="input" placeholder="e.g. Biology" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Topic</label>
              <input className="input" placeholder="e.g. Cell Respiration Chapter 4" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} />
            </div>
          </div>

          {/* Technique */}
          <div className="card">
            <label style={{ ...labelStyle, display: 'block', marginBottom: 14 }}>Technique used</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {TECHNIQUES.map(t => (
                <button key={t.id} onClick={() => setForm({ ...form, technique: t.id })}
                  style={{
                    background: form.technique === t.id ? 'linear-gradient(135deg, #c4728a, #be9470)' : 'var(--pink-light)',
                    color: form.technique === t.id ? 'white' : 'var(--text-mid)',
                    border: 'none', borderRadius: 12, padding: '12px 8px',
                    fontSize: 12, fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.2s', textAlign: 'center',
                    boxShadow: form.technique === t.id ? '0 4px 16px rgba(196,114,138,0.3)' : 'none',
                  }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{t.emoji}</div>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="card">
            <label style={{ ...labelStyle, display: 'block', marginBottom: 8 }}>Duration: <strong style={{ color: '#c4728a' }}>{form.durationMinutes} minutes</strong></label>
            <input type="range" min={5} max={180} step={5} value={form.durationMinutes}
              onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#c4728a' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>
              <span>5 min</span><span>1 hour</span><span>3 hours</span>
            </div>
          </div>

          {/* Scores */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <ScoreSelector label="Confidence after" emoji="🎯" value={form.confidenceScore} onChange={v => setForm({ ...form, confidenceScore: v })} />
            <ScoreSelector label="Energy before" emoji="🔋" value={form.energyBefore} onChange={v => setForm({ ...form, energyBefore: v })} />
            <ScoreSelector label="Energy after" emoji="⚡" value={form.energyAfter} onChange={v => setForm({ ...form, energyAfter: v })} />
          </div>

          {/* Time + Day */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 10 }}>Time of day</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {TIME_SLOTS.map(t => (
                  <button key={t} onClick={() => setForm({ ...form, timeOfDay: t })}
                    style={{ background: form.timeOfDay === t ? 'var(--pink-light)' : 'transparent', border: `1.5px solid ${form.timeOfDay === t ? '#c4728a' : 'var(--pink-border)'}`, borderRadius: 10, padding: '8px 12px', fontSize: 13, color: form.timeOfDay === t ? '#c4728a' : 'var(--text-mid)', fontFamily: 'DM Sans, sans-serif', textAlign: 'left', transition: 'all 0.2s' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 10 }}>Day</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DAYS.map(d => (
                  <button key={d} onClick={() => setForm({ ...form, dayOfWeek: d })}
                    style={{ background: form.dayOfWeek === d ? 'var(--pink-light)' : 'transparent', border: `1.5px solid ${form.dayOfWeek === d ? '#c4728a' : 'var(--pink-border)'}`, borderRadius: 10, padding: '8px 12px', fontSize: 13, color: form.dayOfWeek === d ? '#c4728a' : 'var(--text-mid)', fontFamily: 'DM Sans, sans-serif', textAlign: 'left', transition: 'all 0.2s' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p style={{ fontSize: 13, color: '#e05555', background: '#fff0f0', padding: '10px 14px', borderRadius: 10 }}>{error}</p>}

          <button className="btn-primary" onClick={submit} disabled={loading} style={{ width: '100%', padding: 16, fontSize: 15, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Saving...' : 'Save session 💗'}
          </button>
        </div>
      </main>
    </div>
  )
}

function ScoreSelector({ label, emoji, value, onChange }: { label: string; emoji: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <label style={{ ...labelStyle, display: 'block', marginBottom: 10 }}>{emoji} {label}</label>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} onClick={() => onChange(s)}
            style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: s <= value ? '#c4728a' : 'var(--pink-light)', color: s <= value ? 'white' : 'var(--text-light)', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif' }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-mid)', letterSpacing: 0.2 }
