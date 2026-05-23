import { Moon, Sun, Zap } from 'lucide-react'
import UserMenu from './UserMenu'

export default function Header({ theme, onToggleTheme, streak, onGoHome, user, onSignOut, onShowAuth }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--header-bg)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '0.75rem 1.25rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <button
        onClick={onGoHome}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-400)', letterSpacing: '-0.02em' }}>
          🧠 ExamBrain
        </span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {streak > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 8, padding: '0.25rem 0.6rem'
          }}>
            <Zap size={12} color="var(--warning)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--warning)' }}>{streak}</span>
          </div>
        )}
        <button onClick={onToggleTheme} className="btn-ghost" aria-label="Toggle theme" style={{ padding: '0.4rem' }}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <UserMenu user={user} onSignOut={onSignOut} onShowAuth={onShowAuth} />
      </div>
    </header>
  )
}
