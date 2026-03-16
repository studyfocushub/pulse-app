'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cursor from '@/components/Cursor'

const QUESTIONS = [
  {
    id: 'study_time',
    question: 'When do you naturally feel most alert?',
    emoji: '🕐',
    options: ['Early morning (6-9am)', 'Late morning (9am-12pm)', 'Afternoon (12-5pm)', 'Evening (5-9pm)', 'Night (9pm+)']
  },
  {
    id: 'focus_duration',
    question: 'How long can you genuinely focus before your mind wanders?',
    emoji: '⏱️',
    options: ['Under 15 minutes', '15-25 minutes', '25-40 minutes', '40-60 minutes', 'Over an hour']
  },
  {
    id: 'retention_style',
    question: 'When do you best remember what you studied?',
    emoji: '🧠',
    options: ['Right after studying', 'A few hours later', 'The next morning after sleep', 'A day or two later', 'I rarely feel like I remember']
  },
  {
    id: 'learning_style',
    question: 'You understand something better when...',
    emoji: '💡',
    options: ['You see a real example first then the theory', 'You get the concept first then examples', 'You draw or visualise it', 'You explain it out loud to yourself', 'You make notes and summaries']
  },
  {
    id: 'exam_feeling',
    question: 'In exams, what happens most often?',
    emoji: '😰',
    options: ['I blank out even when I studied', 'I remember things after the exam ends', 'I do better than expected', 'I perform about as well as I studied', 'I panic and rush through it']
  },
  {
    id: 'study_habit',
    question: 'How do you usually study before a big exam?',
    emoji: '📚',
    options: ['Cram everything the night before', 'Start 2-3 days before', 'Spread it over a week+', 'I do small sessions daily', 'I barely study and hope for the best']
  },
  {
    id: 'distraction',
    question: 'What kills your focus most?',
    emoji: '📱',
    options: ['Phone notifications', 'Background noise', 'Hunger or tiredness', 'Studying something I hate', 'Anxiety about other things']
  },
  {
    id: 'technique',
    question: 'Which study technique feels most natural?',
    emoji: '✍️',
    options: ['Flashcards and quizzing myself', 'Re-reading and highlighting', 'Practice problems', 'Mind maps and diagrams', 'Writing summaries']
  },
  {
    id: 'energy_pattern',
    question: 'Your energy through the day is usually...',
    emoji: '🔋',
    options: ['High in the morning, drops by afternoon', 'Slow start, peaks in the afternoon', 'Pretty consistent all day', 'Low until evening then surges', 'Unpredictable, depends on the day']
  },
  {
    id: 'biggest_struggle',
    question: 'Your biggest study struggle right now is...',
    emoji: '🎯',
    options: ['Actually starting (procrastination)', 'Staying focused once I start', 'Remembering what I studied', 'Performing in actual exams', 'Managing time across multiple subjects']
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const progress = ((currentQ) / QUESTIONS.length) * 100
  const q = QUESTIONS[currentQ]

  function selectOption(option: string) {
    setSelected(option)
  }

  async function next() {
    if (!selected) return
    const newAnswers = { ...answers, [q.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      // All done - save and generate profile
      setLoading(true)
      try {
        const res = await fetch('/api/onboarding/save-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers }),
        })
        const data = await res.json()
        if (data.success) {
          router.push('/dashboard')
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', gap: 24 }}>
        <Cursor />
        <div style={{ animation: 'heartbeat 1.8s ease-in-out infinite' }}>
          <svg width="80" height="80" viewBox="0 0 200 180">
            <defs>
              <radialGradient id="hg2" cx="50%" cy="38%" r="62%">
                <stop offset="0%" stopColor="#fad4de"/><stop offset="100%" stopColor="#c4728a"/>
              </radialGradient>
            </defs>
            <path d="M100 162 C100 162 14 106 14 54 C14 29 34 14 60 14 C75 14 88 21 100 34 C112 21 125 14 140 14 C166 14 186 29 186 54 C186 106 100 162 100 162Z" fill="url(#hg2)"/>
          </svg>
        </div>
        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: 'var(--text-dark)' }}>Building your Study DNA...</p>
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>This takes a few seconds 🧬</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)', display: 'flex', flexDirection: 'column', padding: 24, position: 'relative' }}>
      <Cursor />

      {/* Background blobs */}
      <div style={{ position: 'fixed', width: 500, height: 500, background: 'radial-gradient(#f8d8e4, transparent)', borderRadius: '50%', filter: 'blur(90px)', opacity: 0.25, top: -150, left: -150, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: 400, height: 400, background: 'radial-gradient(#ead4c0, transparent)', borderRadius: '50%', filter: 'blur(90px)', opacity: 0.2, bottom: -100, right: -100, pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ maxWidth: 600, margin: '0 auto', width: '100%', paddingTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#c4728a"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.314 4.217.5 7.752.5c1.61 0 3.093.698 4.248 1.798C13.155 1.198 14.638.5 16.248.5 19.783.5 23 3.314 23 7.191c0 4.105-5.37 8.863-11 14.402z"/></svg>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#c4728a' }}>Pulse</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>{currentQ + 1} of {QUESTIONS.length}</span>
        </div>

        {/* Progress bar */}
        <div style={{ background: 'var(--pink-light)', borderRadius: 40, height: 4, marginBottom: 48, overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(90deg, #c4728a, #be9470)', height: '100%', width: `${progress}%`, transition: 'width 0.4s ease', borderRadius: 40 }} />
        </div>

        {/* Question */}
        <div key={currentQ} style={{ animation: 'fadeUp 0.4s ease forwards' }}>
          <div style={{ fontSize: 48, marginBottom: 16, textAlign: 'center' }}>{q.emoji}</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: 'var(--text-dark)', textAlign: 'center', marginBottom: 36, lineHeight: 1.3, letterSpacing: -0.5 }}>
            {q.question}
          </h2>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {q.options.map((option) => (
              <button
                key={option}
                onClick={() => selectOption(option)}
                style={{
                  background: selected === option ? 'linear-gradient(135deg, #c4728a, #be9470)' : 'white',
                  color: selected === option ? 'white' : 'var(--text-mid)',
                  border: `1.5px solid ${selected === option ? 'transparent' : 'var(--pink-mid)'}`,
                  borderRadius: 14,
                  padding: '16px 20px',
                  fontSize: 14,
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  fontFamily: 'DM Sans, sans-serif',
                  boxShadow: selected === option ? '0 4px 20px rgba(196,114,138,0.3)' : 'none',
                  transform: selected === option ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Next button */}
          <button
            className="btn-primary"
            onClick={next}
            disabled={!selected}
            style={{ width: '100%', marginTop: 28, opacity: selected ? 1 : 0.4 }}
          >
            {currentQ === QUESTIONS.length - 1 ? 'Build my Study DNA 🧬' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
