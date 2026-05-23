import { useEffect } from 'react'
import { fireBadgeConfetti } from '../utils/confetti'

export default function BadgeToast({ badge }) {
  useEffect(() => {
    if (badge) fireBadgeConfetti()
  }, [badge])

  if (!badge) return null

  return (
    <div style={{
      position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, background: 'var(--bg-card)',
      border: '1px solid var(--brand-500)',
      borderRadius: 16, padding: '0.85rem 1.5rem',
      boxShadow: '0 8px 32px rgba(79,110,247,0.3)',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'slideUp 0.4s ease forwards',
      whiteSpace: 'nowrap'
    }}>
      <span style={{ fontSize: '2rem' }}>{badge.emoji}</span>
      <div>
        <p style={{ fontSize: '0.75rem', color: 'var(--brand-400)', fontWeight: 600, marginBottom: 2 }}>
          BADGE UNLOCKED
        </p>
        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {badge.label}
        </p>
      </div>
    </div>
  )
}
