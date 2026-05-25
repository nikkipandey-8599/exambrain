import { Home, BookOpen, CreditCard, BarChart2, Clock, Lock, Star } from 'lucide-react'
import useExamStore from '../store/examStore'

const tabs = [
  { id: 'home',       label: 'Notes',    Icon: Home },
  { id: 'quiz',       label: 'Quiz',     Icon: BookOpen },
  { id: 'flashcards', label: 'Cards',    Icon: CreditCard },
  { id: 'report',     label: 'Report',   Icon: BarChart2 },
  { id: 'history',    label: 'History',  Icon: Clock },
  { id: 'reviews',    label: 'Reviews',  Icon: Star },
]

export default function BottomNav({ screen, setScreen }) {
  const { examContent } = useExamStore()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 50,
      maxWidth: 540, margin: '0 auto'
    }}>
      {tabs.map(({ id, label, Icon }) => {
        const isLocked = !examContent && (id === 'quiz' || id === 'flashcards' || id === 'report')
        const isActive = screen === id
        return (
          <button
            key={id}
            aria-label={label}
            aria-disabled={isLocked}
            onClick={(e) => { if (isLocked) { e.preventDefault(); return } setScreen(id) }}
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
              {isLocked && <Lock size={8} style={{ position: 'absolute', top: -3, right: -5, color: 'var(--text-muted)' }} />}
            </div>
            <span style={{ fontSize: '0.55rem', fontWeight: isActive ? 600 : 400 }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
