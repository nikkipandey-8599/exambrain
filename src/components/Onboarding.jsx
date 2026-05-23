import { useState, useEffect } from 'react'
import { X, Upload, Zap, Trophy, ArrowRight } from 'lucide-react'

const STEPS = [
  {
    icon: '📄',
    emoji_bg: 'rgba(79,110,247,0.12)',
    title: 'Paste your notes',
    desc: 'Upload any lecture notes, textbook section, or study material. Works with .txt and .md files too.',
    color: '#4f6ef7'
  },
  {
    icon: '🤖',
    emoji_bg: 'rgba(34,197,94,0.12)',
    title: 'AI generates your exam prep',
    desc: 'In seconds you get 10 MCQs, 5 short answer questions, and 12 flashcards — all from your own notes.',
    color: '#22c55e'
  },
  {
    icon: '🏆',
    emoji_bg: 'rgba(245,158,11,0.12)',
    title: 'Study smarter, score higher',
    desc: 'Quiz yourself, flip flashcards, get AI grading on written answers, and track weak topics over time.',
    color: '#f59e0b'
  }
]

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)

  function next() {
    if (animating) return
    if (step < STEPS.length - 1) {
      setAnimating(true)
      setTimeout(() => { setStep(s => s + 1); setAnimating(false) }, 200)
    } else {
      localStorage.setItem('exambrain-onboarded', '1')
      onDone()
    }
  }

  function skip() {
    localStorage.setItem('exambrain-onboarded', '1')
    onDone()
  }

  const s = STEPS[step]

  return (
    <div className="onboarding-overlay">
      <div className="animate-scaleIn" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        padding: '2rem 1.5rem',
        maxWidth: 380,
        width: '100%',
        position: 'relative'
      }}>
        {/* Skip */}
        <button onClick={skip} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'var(--bg-secondary)', border: 'none',
          borderRadius: '50%', width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', cursor: 'pointer'
        }}>
          <X size={15} />
        </button>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.75rem', justifyContent: 'center' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              height: 4, borderRadius: 99,
              width: i === step ? 24 : 8,
              background: i === step ? s.color : 'var(--border-strong)',
              transition: 'all 0.3s ease'
            }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{
          width: 88, height: 88, borderRadius: 28,
          background: s.emoji_bg,
          border: `1px solid ${s.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.8rem', margin: '0 auto 1.5rem',
          animation: animating ? 'none' : 'bounceIn 0.4s ease',
          transition: 'all 0.2s'
        }}>
          {s.icon}
        </div>

        {/* Text */}
        <h2 style={{
          fontSize: '1.25rem', fontWeight: 800,
          textAlign: 'center', marginBottom: 10,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em'
        }}>
          {s.title}
        </h2>
        <p style={{
          fontSize: '0.9rem', color: 'var(--text-secondary)',
          textAlign: 'center', lineHeight: 1.65,
          marginBottom: '2rem'
        }}>
          {s.desc}
        </p>

        {/* CTA */}
        <button onClick={next} style={{
          width: '100%', padding: '0.9rem',
          borderRadius: 14, border: 'none',
          background: s.color,
          color: 'white', fontWeight: 700, fontSize: '0.95rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: 'pointer',
          boxShadow: `0 4px 16px ${s.color}44`,
          transition: 'all 0.2s'
        }}>
          {step < STEPS.length - 1 ? (
            <><span>Next</span><ArrowRight size={16} /></>
          ) : (
            <><span>Let's go!</span><span style={{ fontSize: '1rem' }}>🚀</span></>
          )}
        </button>
      </div>
    </div>
  )
}
