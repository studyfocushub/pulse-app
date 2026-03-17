'use client'
import { useState, useEffect, useRef } from 'react'
import { Sidebar } from '@/components/Sidebar'
import Cursor from '@/components/Cursor'

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date }

const STARTER_QUESTIONS = [
  'Should I study tonight?',
  'Why do I keep forgetting what I study?',
  'How should I prep for my exam next week?',
  'What\'s my worst study habit?',
  'Which subject should I study first today?',
  'Am I studying enough?',
]

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/coach/history').then(r => r.json()).then(d => {
      setProfile(d.profile)
      if (d.messages?.length > 0) {
        setMessages(d.messages.map((m: any) => ({ ...m, timestamp: new Date(m.createdAt) })))
      } else {
        // Welcome message
        setMessages([{
          role: 'assistant',
          content: `Hey${d.profile?.name ? ` ${d.profile.name}` : ''}! 👋 I'm your personal AI study coach. I know your study patterns, your peak hours, and how your brain works. Ask me anything — I'll answer based on YOUR data, not generic advice.`,
          timestamp: new Date()
        }])
      }
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: new Date() }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Try again!', timestamp: new Date() }])
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--soft-white)', display: 'flex' }}>
      <Cursor />
      <Sidebar active="/coach" />

      <main style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* Header */}
        <div style={{ padding: '28px 40px 20px', borderBottom: '1px solid var(--pink-border)', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, background: 'var(--pink-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤖</div>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: 'var(--text-dark)', letterSpacing: -0.3 }}>
                Your <em style={{ color: '#c4728a', fontStyle: 'italic' }}>AI Study Coach</em>
              </h1>
              <p style={{ fontSize: 12, color: 'var(--text-light)' }}>Answers based on YOUR data. Not generic advice.</p>
            </div>
            <div style={{ marginLeft: 'auto', background: 'var(--pink-light)', borderRadius: 40, padding: '6px 14px', fontSize: 12, color: '#c4728a', fontWeight: 500 }}>
              {profile?.studentType || 'Loading...'}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Starter questions */}
          {messages.length <= 1 && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 10, letterSpacing: 0.5 }}>TRY ASKING</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {STARTER_QUESTIONS.map(q => (
                  <button key={q} onClick={() => send(q)}
                    style={{ background: 'white', border: '1.5px solid var(--pink-mid)', borderRadius: 40, padding: '8px 14px', fontSize: 12.5, color: 'var(--text-mid)', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeUp 0.3s ease forwards' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 32, height: 32, background: 'var(--pink-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginRight: 10, flexShrink: 0, marginTop: 4 }}>🤖</div>
              )}
              <div style={{
                maxWidth: '70%', padding: '13px 18px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? 'linear-gradient(135deg, #c4728a, #be9470)' : 'white',
                color: msg.role === 'user' ? 'white' : 'var(--text-dark)',
                fontSize: 14, lineHeight: 1.65,
                border: msg.role === 'assistant' ? '1px solid var(--pink-border)' : 'none',
                boxShadow: msg.role === 'assistant' ? '0 2px 12px rgba(196,114,138,0.08)' : '0 2px 12px rgba(196,114,138,0.25)',
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: 'var(--pink-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
              <div style={{ background: 'white', border: '1px solid var(--pink-border)', borderRadius: '18px 18px 18px 4px', padding: '13px 18px', display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#c4728a', opacity: 0.4, animation: `fadeUp 0.8s ease ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 40px 24px', background: 'white', borderTop: '1px solid var(--pink-border)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask anything about your study patterns..."
              rows={1}
              style={{ flex: 1, background: 'var(--pink-light)', border: '1.5px solid transparent', borderRadius: 16, padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-dark)', outline: 'none', resize: 'none', lineHeight: 1.5, transition: 'all 0.2s' }}
              onFocus={e => { e.target.style.borderColor = '#e0a0b4'; e.target.style.background = 'white' }}
              onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'var(--pink-light)' }}
            />
            <button className="btn-primary" onClick={() => send()} disabled={!input.trim() || loading}
              style={{ padding: '12px 20px', opacity: !input.trim() || loading ? 0.5 : 1, flexShrink: 0 }}>
              Send →
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 8 }}>Press Enter to send · Shift+Enter for new line</p>
        </div>
      </main>
    </div>
  )
}
