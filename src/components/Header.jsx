import { Wifi, WifiOff, Brain, Sun, Moon } from 'lucide-react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import useExamStore from '../store/examStore'

export default function Header({ theme, onToggleTheme }) {
  const isOnline = useOnlineStatus()
  const { examContent } = useExamStore()

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--header-bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '0.75rem 1.25rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Brain size={22} color="var(--brand-400)" />
        <div>
          <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>ExamBrain</span>
          {examContent?.topic && (
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 1 }}>{examContent.topic}</p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Online status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isOnline
            ? <><Wifi size={14} color="var(--success)" /><span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Online</span></>
            : <><WifiOff size={14} color="var(--warning)" /><span style={{ fontSize: '0.7rem', color: 'var(--warning)' }}>Offline</span></>
          }
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', transition: 'all 0.2s'
          }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  )
}
