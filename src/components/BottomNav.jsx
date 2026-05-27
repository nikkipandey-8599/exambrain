import { Home, BookOpen, CreditCard, BarChart2, Clock, Lock, Star } from 'lucide-react'
import useExamStore from '../store/examStore'

const tabs = [
  { id: 'home',       label: 'Notes',   Icon: Home },
  { id: 'quiz',       label: 'Quiz',    Icon: BookOpen },
  { id: 'flashcards', label: 'Cards',   Icon: CreditCard },
  { id: 'report',     label: 'Report',  Icon: BarChart2 },
  { id: 'history',    label: 'History', Icon: Clock },
  { id: 'reviews',    label: 'Reviews', Icon: Star },
]

export default function BottomNav({ screen, setScreen, unseenReplies = 0 }) {
  const { examContent } = useExamStore()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--nav-bg)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--border)', display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 50, maxWidth: 540, margin: '0 auto'
    }}>
      {tabs.map(({ id, label, Icon }) => {
        const isLocked = !examContent && (id === 'quiz' || id === 'flashcards' || id === 'report')
        const isActive = screen === id
        const showBadge = id === 'reviews' && unseenReplies > 0

        return (
          <button
            key={id}
            aria-label={label}
            onClick={() => { if (!isLocked) setScreen(id) }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '0.55rem 0.1rem',
              background: 'transparent', border: 'none',
              color: isActive ? 'var(--brand-400)' : isLocked ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              borderTop: isActive ? '2px solid var(--brand-400)' : '2px solid transparent',
              transition: 'color 0.2s', position: 'relative'
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={17} />
              {isLocked && (
                <Lock size={8} style={{ position: 'absolute', top: -3, right: -5, color: 'var(--text-muted)' }} />
              )}
              {/* Notification badge */}
              {showBadge && (
                <div style={{
                  position: 'absolute', top: -5, right: -7,
                  background: 'var(--danger)', color: 'white',
                  fontSize: '0.5rem', fontWeight: 800,
                  borderRadius: 99, minWidth: 14, height: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  animation: 'pulse 2s infinite'
                }}>
                  {unseenReplies > 9 ? '9+' : unseenReplies}
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.55rem', fontWeight: isActive ? 600 : 400 }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
