'use client'
import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import Cursor from '@/components/Cursor'
import Link from 'next/link'

const INSIGHT_CONFIG: Record<string, { emoji: string; color: string }> = {
  peak_hours: { emoji: '🕐', color: '#c4728a' },
  focus_cliff: { emoji: '⏱️', color: '#be9470' },
  retention_killers: { emoji: '📉', color: '#a0745a' },
  processing_type: { emoji: '🧠', color: '#c4728a' },
  exam_performance: { emoji: '😰', color: '#be9470' },
  energy_map: { emoji: '🔋', color: '#a0745a' },
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unlocked, setUnlocked] = useState(false)
  const [daysLogged, setDaysLogged] = useState(0)

  useEffect(() => {
    fetch('/api/insights').then(r => r.json()).then(d => {
      setInsights(d.insights || [])
      setProfile(d.profile)
      setUnlocked(d.unlocked)
      setDaysLogged(d.daysLogged || 0)
      setLoading(false)
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--soft-white)', display: 'flex' }}>
      <Cursor />
      <Sidebar active="/insights" />

      <main style={{ marginLeft: 220, padding: '40px 48px', flex: 1 }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: 'var(--text-dark)', marginBottom: 6, letterSpacing: -0.5 }}>
            Your <em style={{ color: '#c4728a', fontStyle: 'italic' }}>Brain Insights</em>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-light)' }}>
            {unlocked ? 'Things about your brain nobody has ever told you.' : `Log ${7 - daysLogged} more days to unlock all 6 insights.`}
          </p>
        </div>

        {!unlocked && (
          <div style={{ background: 'linear-gradient(135deg, #fff0f4, #fdf5ef)', border: '1.5px solid var(--blush)', borderRadius: 20, padding: 28, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 40 }}>🔒</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: 'var(--text-dark)', marginBottom: 8 }}>
                Insights unlock after 7 days of logging
              </div>
              <div style={{ background: 'var(--pink-light)', borderRadius: 40, height: 6, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(90deg, #c4728a, #be9470)', height: '100%', width: `${(daysLogged / 7) * 100}%`, transition: 'width 0.4s ease', borderRadius: 40 }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 6 }}>{daysLogged}/7 days logged</p>
            </div>
            <Link href="/log" className="btn-primary" style={{ textDecoration: 'none', fontSize: 13, whiteSpace: 'nowrap' }}>Log today →</Link>
          </div>
        )}

        {/* Student type banner */}
        {profile?.studentType && (
          <div style={{ background: 'white', border: '1px solid var(--pink-border)', borderRadius: 20, padding: '20px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40 }}>🧬</div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-light)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>You are a</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#c4728a', fontWeight: 600 }}>{profile.studentType}</div>
              {profile.processingStyle && <div style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 4 }}>{profile.processingStyle} learner · {profile.focusCliff} min focus window · peaks {profile.peakHours}</div>}
            </div>
          </div>
        )}

        {/* Tips for their student type */}
        {profile?.studentType && unlocked && (
          <div style={{ background: 'white', border: '1px solid var(--pink-border)', borderRadius: 20, padding: 24, marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-dark)', marginBottom: 16 }}>💡 Tips for {profile.studentType}s</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {getTipsForType(profile.studentType).map((tip, i) => (
                <div key={i} style={{ background: 'var(--pink-light)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6 }}>
                  <span style={{ color: '#c4728a' }}>✦ </span>{tip}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {loading ? (
            [1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: 'white', border: '1px solid var(--pink-border)', borderRadius: 20, padding: 28, height: 180, opacity: 0.5 }} />
            ))
          ) : insights.length > 0 ? (
            insights.map((insight, i) => {
              const config = INSIGHT_CONFIG[insight.insightType] || { emoji: '💡', color: '#c4728a' }
              return (
                <div key={i} className="card" style={{ animation: `fadeUp 0.4s ease ${i * 0.08}s forwards`, opacity: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, background: 'var(--pink-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {config.emoji}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, color: 'var(--text-dark)', marginBottom: 4 }}>{insight.title}</div>
                      <div style={{ fontSize: 11, color: config.color, fontWeight: 500, letterSpacing: 0.8, textTransform: 'uppercase' }}>{insight.insightType.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 14 }}>{insight.description}</p>
                  <div style={{ background: 'var(--pink-light)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#c4728a', lineHeight: 1.6 }}>
                    <strong>→ </strong>{insight.actionableTip}
                  </div>
                </div>
              )
            })
          ) : unlocked ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
              <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Generating your insights... check back in a moment.</p>
            </div>
          ) : (
            [1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: 'white', border: '1px solid var(--pink-border)', borderRadius: 20, padding: 28, filter: 'blur(4px)', opacity: 0.4, height: 180 }} />
            ))
          )}
        </div>
      </main>
    </div>
  )
}

function getTipsForType(type: string): string[] {
  const tips: Record<string, string[]> = {
    'Night Processor': [
      'Do your hardest topics after 7pm — that\'s when your brain is actually ready',
      'Sleep immediately after studying. Your brain consolidates during REM sleep.',
      'Avoid reviewing in the morning — your recall will be worst then',
      'Tell people you study at night. Stop fighting your natural rhythm.',
    ],
    'Early Bird': [
      'Lock in your hardest subject before 10am every day',
      'Use afternoons for revision only — not new material',
      'Go to bed early. Your peak depends on your sleep schedule.',
      'Schedule exams in the morning whenever possible',
    ],
    'Crammer': [
      'Use spaced repetition to trick yourself into early cramming',
      'Create fake deadlines 3 days before real ones',
      'Your memory works — you just need more time. Start 5 days early.',
      'Use the Pomodoro method to simulate exam pressure daily',
    ],
    'Slow Burner': [
      'Short daily sessions beat long weekly ones for you — every time',
      'Review topics 3 times over 7 days: day 1, day 3, day 7',
      'Don\'t skip days — your retention drops fast without reinforcement',
      'Trust the process. You retain deeply once it clicks.',
    ],
    'Sprint Learner': [
      'Work in intense 20-25 min bursts then fully disconnect',
      'Never study the same subject twice in a row',
      'Your energy crashes after 90 mins — schedule breaks before that',
      'Use high-stakes environments like libraries to trigger focus mode',
    ],
    'Deep Diver': [
      'Block 2+ hour windows — you need time to get into deep focus',
      'Eliminate ALL distractions before starting. Your focus mode is fragile to enter.',
      'Once in flow, don\'t stop for small breaks — it breaks your momentum',
      'Study fewer topics per session but go much deeper on each one',
    ],
  }
  return tips[type] || ['Log more sessions to get personalised tips for your student type.']
}
