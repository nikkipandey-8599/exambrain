import { Flame } from 'lucide-react'
import UserMenu from './UserMenu'

function Logo() {
  return (
    <img src="/icon-96.png" alt="ExamBrain logo"
      width={28} height={28}
      style={{ borderRadius: 8, display: 'block', flexShrink: 0 }}
    />
  )
}

export default function Header({ streak, onGoHome, user, onSignOut, onShowAuth }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--header-bg)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border)',
      padding: '0.65rem 1.25rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <button onClick={onGoHome} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <Logo />
        <span style={{
          fontSize: '1rem', fontWeight: 700,
          color: 'var(--brand-500)',
          fontFamily: 'Georgia, serif',
        }}>ExamBrain</span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {streak > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(146,64,14,0.1)', border: '1px solid rgba(146,64,14,0.2)',
            borderRadius: 8, padding: '0.22rem 0.55rem'
          }}>
            <Flame size={13} color="var(--brand-500)" />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--brand-500)', fontFamily: 'system-ui' }}>{streak}</span>
          </div>
        )}
        <UserMenu user={user} onSignOut={onSignOut} onShowAuth={onShowAuth} />
      </div>
    </header>
  )
}
