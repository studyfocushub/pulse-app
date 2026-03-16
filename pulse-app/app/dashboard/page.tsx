'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import BeatingHeart from '@/components/BeatingHeart'
import Cursor from '@/components/Cursor'

interface DashboardData {
  user: { name: string; email: string }
  profile: { studentType: string; peakHours: string; focusCliff: number; completionPercent: number }
  streak: { current: number; longest: number }
  todayLogged: boolean
  forgetAlerts: Array<{ topic: string; subject: string; retentionPercentage: number; predictedForgetAt: string }>
  recentLogs: Array<{ topic: string; subject: string; studiedAt: string; confidenceScore: number }>
  insightsUnlocked: boolean
  daysUntilWrapped: number
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)' }}>
      <Cursor />
      <div style={{ animation: 'heartbeat 1.8s ease-in-out infinite' }}>
        <svg width="60" height="60" viewBox="0 0 200 180"><defs><radialGradient id="hg3" cx="50%" cy="38%" r="62%"><stop offset="0%" stopColor="#fad4de"/><stop offset="100%" stopColor="#c4728a"/></radialGradient></defs><path d="M100 162 C100 162 14 106 14 54 C14 29 34 14 60 14 C75 14 88 21 100 34 C112 21 125 14 140 14 C166 14 186 29 186 54 C186 106 100 162 100 162Z" fill="url(#hg3)"/></svg>
      </div>
    </div>
  )

  if (!data) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--soft-white)' }}>
      <Cursor />

      {/* Sidebar */}
      <nav style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 220, background: 'white', borderRight: '1px solid var(--pink-border)', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 6, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#c4728a"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.314 4.217.5 7.752.5c1.61 0 3.093.698 4.248 1.798C13.155 1.198 14.638.5 16.248.5 19.783.5 23 3.314 23 7.191c0 4.105-5.37 8.863-11 14.402z"/></svg>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#c4728a' }}>Pulse</span>
        </div>

        {[
          { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
          { href: '/log', label: 'Log Session', icon: '📓' },
          { href: '/insights', label: 'Brain Insights', icon: '🧠' },
          { href: '/coach', label: 'AI Coach', icon: '🤖' },
          { href: '/forget', label: 'Forget Tracker', icon: '⏰' },
          { href: '/profile', label: 'My Profile', icon: '🧬' },
          { href: '/battleplan', label: 'Exam Plan', icon: '🎯' },
          { href: '/wrapped', label: 'Weekly Wrapped', icon: '✨' },
        ].map(({ href, label, icon }) => (
          <Link key={href} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 12,
            fontSize: 13.5, color: 'var(--text-mid)',
            textDecoration: 'none', transition: 'all 0.2s',
            background: href === '/dashboard' ? 'var(--pink-light)' : 'transparent',
            color: href === '/dashboard' ? '#c4728a' : 'var(--text-mid)' as string,
            fontWeight: href === '/dashboard' ? 500 : 400,
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

      {/* Main content */}
      <main style={{ marginLeft: 220, padding: '40px 40px 40px 48px', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: 'var(--text-dark)', marginBottom: 6, letterSpacing: -0.5 }}>
              Good {getTimeOfDay()}, <em style={{ color: '#c4728a', fontStyle: 'italic' }}>{data.user.name?.split(' ')[0]}</em> 🩷
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-light)' }}>
              {data.todayLogged ? "You've logged today. Heart is happy 💗" : "Log today's session to keep your heart beating 💔"}
            </p>
          </div>
          <Link href="/log" className="btn-primary" style={{ textDecoration: 'none', fontSize: 13, padding: '11px 22px' }}>
            + Log session
          </Link>
        </div>

        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Heart card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 }}>
            <BeatingHeart size={130} streak={data.streak.current} />
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: '#c4728a', fontWeight: 600 }}>{data.streak.current}</div>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>day streak 🔥</div>
              <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>best: {data.streak.longest} days</div>
            </div>
          </div>

          {/* DNA Profile progress */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-mid)' }}>Your Study DNA</span>
              <span style={{ fontSize: 12, color: '#c4728a', fontWeight: 500 }}>{data.profile.completionPercent}% complete</span>
            </div>

            {/* Progress circle */}
            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 16px' }}>
              <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: 80, height: 80 }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--pink-light)" strokeWidth="2"/>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#c4728a" strokeWidth="2" strokeDasharray={`${data.profile.completionPercent}, 100`}/>
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 16, fontWeight: 600, color: '#c4728a', fontFamily: 'Playfair Display, serif' }}>
                {data.profile.completionPercent}%
              </div>
            </div>

            {data.profile.studentType && (
              <div style={{ background: 'var(--pink-light)', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 2 }}>You are a</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#c4728a', fontFamily: 'Playfair Display, serif' }}>{data.profile.studentType}</div>
              </div>
            )}

            {!data.insightsUnlocked && (
              <p style={{ fontSize: 11, color: 'var(--text-light)', textAlign: 'center', marginTop: 10 }}>
                Log {7 - Math.floor(data.profile.completionPercent / 14)} more days to unlock full insights
              </p>
            )}
          </div>

          {/* Quick stats */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-mid)', marginBottom: 16 }}>Your patterns</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.profile.peakHours && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>🕐 Peak hours</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#c4728a' }}>{data.profile.peakHours}</span>
                </div>
              )}
              {data.profile.focusCliff && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>⏱️ Focus cliff</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#c4728a' }}>{data.profile.focusCliff} mins</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>✨ Wrapped in</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#c4728a' }}>{data.daysUntilWrapped} days</span>
              </div>
            </div>

            <Link href="/insights" style={{ display: 'block', marginTop: 20, textAlign: 'center', fontSize: 13, color: '#c4728a', textDecoration: 'none', background: 'var(--pink-light)', padding: '10px', borderRadius: 10 }}>
              {data.insightsUnlocked ? 'View all insights →' : '🔒 Unlock after 7 days'}
            </Link>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Forget alerts */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-dark)' }}>⏰ Forget alerts</span>
              <Link href="/forget" style={{ fontSize: 12, color: '#c4728a', textDecoration: 'none' }}>See all →</Link>
            </div>

            {data.forgetAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                <p style={{ fontSize: 13, color: 'var(--text-light)' }}>You're on top of everything!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.forgetAlerts.slice(0, 3).map((alert, i) => (
                  <div key={i} style={{ background: alert.retentionPercentage < 40 ? '#fff5f5' : 'var(--pink-light)', borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dark)' }}>{alert.topic}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{alert.subject}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: alert.retentionPercentage < 40 ? '#e05555' : '#c4728a' }}>{alert.retentionPercentage}%</div>
                      <div style={{ fontSize: 10, color: 'var(--text-light)' }}>retained</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent sessions */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-dark)' }}>📓 Recent sessions</span>
              <Link href="/log" style={{ fontSize: 12, color: '#c4728a', textDecoration: 'none' }}>+ New →</Link>
            </div>

            {data.recentLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📝</div>
                <p style={{ fontSize: 13, color: 'var(--text-light)' }}>No sessions yet. Log your first one!</p>
                <Link href="/log" className="btn-primary" style={{ textDecoration: 'none', fontSize: 13, marginTop: 12, display: 'inline-block' }}>Log now →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.recentLogs.slice(0, 4).map((log, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--pink-border)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dark)' }}>{log.topic}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{log.subject} · {new Date(log.studiedAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(s => (
                        <div key={s} style={{ width: 8, height: 8, borderRadius: '50%', background: s <= log.confidenceScore ? '#c4728a' : 'var(--pink-light)' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
