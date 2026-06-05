import { Moon, Sun, Flame } from 'lucide-react'
import UserMenu from './UserMenu'

// SVG logo — graduation cap with open book
function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="var(--brand-500)" />
      {/* Book */}
      <rect x="5" y="13" width="8" height="9" rx="1.5" fill="var(--parchment)" opacity="0.9" />
      <rect x="15" y="13" width="8" height="9" rx="1.5" fill="var(--parchment)" opacity="0.9" />
      <rect x="12.5" y="13" width="3" height="9" fill="var(--brand-600)" />
      {/* Cap */}
      <polygon points="14,5 22,9 14,13 6,9" fill="var(--parchment)" />
      <rect x="20.5" y="9" width="1.5" height="5" rx="0.75" fill="var(--parchment)" opacity="0.7" />
    </svg>
  )
}

export default function Header({ theme, onToggleTheme, streak, onGoHome, user, onSignOut, onShowAuth }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--header-bg)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border)',
      padding: '0.7rem 1.25rem',
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
          letterSpacing: '0.01em'
        }}>ExamBrain</span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {streak > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(180,83,9,0.1)', border: '1px solid rgba(180,83,9,0.2)',
            borderRadius: 8, padding: '0.22rem 0.55rem'
          }}>
            <Flame size={13} color="var(--brand-500)" />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--brand-500)', fontFamily: 'system-ui' }}>{streak}</span>
          </div>
        )}
        <button onClick={onToggleTheme} className="btn-ghost" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <UserMenu user={user} onSignOut={onSignOut} onShowAuth={onShowAuth} />
      </div>
    </header>
  )
}
