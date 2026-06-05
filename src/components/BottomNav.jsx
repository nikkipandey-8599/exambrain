import { PenLine, BookOpen, Layers, BarChart2, Clock, Star } from 'lucide-react'
import useExamStore from '../store/examStore'

const tabs = [
  { id: 'home',       label: 'Notes',   Icon: PenLine },
  { id: 'quiz',       label: 'Quiz',    Icon: BookOpen },
  { id: 'flashcards', label: 'Cards',   Icon: Layers },
  { id: 'report',     label: 'Report',  Icon: BarChart2 },
  { id: 'history',    label: 'History', Icon: Clock },
  { id: 'reviews',    label: 'Reviews', Icon: Star },
]

export default function BottomNav({ screen, setScreen, unseenReplies = 0 }) {
  const { examContent } = useExamStore()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 50, maxWidth: 540, margin: '0 auto'
    }}>
      {tabs.map(({ id, label, Icon }) => {
        const locked = !examContent && ['quiz','flashcards','report'].includes(id)
        const active = screen === id
        const badge = id === 'reviews' && unseenReplies > 0

        return (
          <button key={id} onClick={() => !locked && setScreen(id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, padding: '0.6rem 0.1rem',
            background: 'none', border: 'none',
            color: active ? 'var(--brand-500)' : locked ? 'var(--text-muted)' : 'var(--ink-40)',
            cursor: locked ? 'not-allowed' : 'pointer',
            borderTop: active ? '2px solid var(--brand-500)' : '2px solid transparent',
            transition: 'color 0.18s, border-color 0.18s',
            position: 'relative'
          }}>
            <div style={{ position: 'relative' }}>
              <Icon size={18} strokeWidth={active ? 2.2 : 1.7} />
              {badge && (
                <span style={{
                  position: 'absolute', top: -5, right: -7,
                  background: 'var(--danger)', color: '#fff',
                  fontSize: '0.5rem', fontWeight: 800,
                  borderRadius: 99, minWidth: 14, height: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px', fontFamily: 'system-ui'
                }}>{unseenReplies > 9 ? '9+' : unseenReplies}</span>
              )}
            </div>
            <span style={{
              fontSize: '0.52rem', fontWeight: active ? 700 : 400,
              fontFamily: 'system-ui, sans-serif', letterSpacing: '0.02em'
            }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
