import { useState, useEffect } from 'react'
import { Trash2, RefreshCw, BookOpen, CreditCard } from 'lucide-react'
import { getAllSessions, deleteSession, clearAllData } from '../services/db'
import { getScoreColor, formatDate } from '../utils/helpers'
import { showToast } from '../components/Toast'
import EmptyState from '../components/EmptyState'
import PushNotifToggle from '../components/PushNotifToggle'

function StudyHeatmap({ heatmap }) {
  const days = []
  for (let i = 51; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push({ key, count: heatmap[key] || 0 })
  }
  const weeks = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i+7))

  return (
    <div>
      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Study Activity</p>
      <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map(d => (
              <div key={d.key} title={`${d.key}: ${d.count} session${d.count!==1?'s':''}`} style={{
                width: 11, height: 11, borderRadius: 3, flexShrink: 0,
                background: d.count === 0 ? 'var(--bg-secondary)' : d.count === 1 ? 'rgba(79,110,247,0.35)' : d.count === 2 ? 'rgba(79,110,247,0.65)' : 'var(--brand-500)',
                transition: 'background 0.2s', cursor: 'default'
              }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Less</span>
        {[0,1,2,3].map(l => (
          <div key={l} style={{ width: 10, height: 10, borderRadius: 2, background: l===0 ? 'var(--bg-secondary)' : `rgba(79,110,247,${0.2+l*0.27})` }} />
        ))}
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  )
}

function BadgesSection({ badgeIds }) {
  const ALL = [
    { id:'first', label:'First Session', emoji:'🎯' },
    { id:'streak3', label:'3 Day Streak', emoji:'🔥' },
    { id:'streak7', label:'7 Day Streak', emoji:'⚡' },
    { id:'perfect', label:'Perfect Score', emoji:'🏆' },
    { id:'sessions10', label:'10 Sessions', emoji:'📚' },
    { id:'sessions25', label:'25 Sessions', emoji:'🎓' },
  ]
  const earned = ALL.filter(b => badgeIds.includes(b.id))
  const locked = ALL.filter(b => !badgeIds.includes(b.id))
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Badges</p>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{earned.length}/{ALL.length} earned</span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {ALL.map(b => {
          const isEarned = badgeIds.includes(b.id)
          return (
            <div key={b.id} title={b.label} style={{
              width: 46, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', cursor: 'default',
              background: isEarned ? 'rgba(245,158,11,0.1)' : 'var(--bg-secondary)',
              border: `1px solid ${isEarned ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`,
              filter: isEarned ? 'none' : 'grayscale(1) opacity(0.25)',
              transition: 'all 0.2s',
              transform: isEarned ? 'scale(1)' : 'scale(0.9)'
            }}>{b.emoji}</div>
          )
        })}
      </div>
    </div>
  )
}

export default function History({ setScreen }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmClear, setConfirmClear] = useState(false)
  const [heatmap, setHeatmap] = useState({})
  const [badgeIds, setBadgeIds] = useState([])
  const streak = parseInt(localStorage.getItem('exambrain-streak') || '0')

  async function load() {
    setLoading(true)
    const s = await getAllSessions()
    setSessions(s)
    setHeatmap(JSON.parse(localStorage.getItem('exambrain-heatmap') || '{}'))
    setBadgeIds(JSON.parse(localStorage.getItem('exambrain-badges') || '[]'))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    await deleteSession(id)
    setSessions(s => s.filter(x => x.id !== id))
    showToast.success('Session deleted')
  }

  async function handleClearAll() {
    if (!confirmClear) { setConfirmClear(true); return }
    await clearAllData()
    setSessions([]); setConfirmClear(false)
    showToast.info('All data cleared')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
      <div className="animate-spin" style={{ width: 24, height: 24, border: '2px solid var(--brand-500)', borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  )

  return (
    <div className="page animate-fadeIn" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <PushNotifToggle />
      <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>History</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {streak > 0 && <span>🔥 {streak} day streak · </span>}{sessions.length} sessions
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn-ghost" style={{ padding: '0.45rem' }}><RefreshCw size={14} /></button>
          {sessions.length > 0 && (
            <button onClick={handleClearAll} style={{
              padding: '0.45rem 0.85rem', borderRadius: 8,
              border: `1px solid ${confirmClear ? 'var(--danger)' : 'var(--border-strong)'}`,
              background: confirmClear ? 'rgba(239,68,68,0.08)' : 'transparent',
              color: confirmClear ? 'var(--danger)' : 'var(--text-secondary)',
              fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
            }}>{confirmClear ? 'Confirm?' : 'Clear All'}</button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem', overflowX: 'auto' }}>
        <StudyHeatmap heatmap={heatmap} />
      </div>
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <BadgesSection badgeIds={badgeIds} />
      </div>

      {sessions.length === 0 ? (
        <EmptyState icon="📭" title="No sessions yet" desc="Generate your first exam prep to see your history and activity here." action={() => setScreen('home')} actionLabel="Get Started →" />
      ) : (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sessions.map((session, idx) => {
            const score = session.score
            const scoreColor = score != null ? getScoreColor(score) : 'var(--text-muted)'
            return (
              <div key={session.id} className="card card-hover animate-slideUp" style={{ padding: '1rem 1.1rem', animationDelay: `${idx * 50}ms` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{session.topic || 'Untitled'}</p>
                      {score != null && <span className="badge" style={{ background: `${scoreColor}22`, color: scoreColor, fontSize: '0.7rem' }}>{score}%</span>}
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatDate(session.createdAt)}</p>
                    {session.summary && <p className="line-clamp-2" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 5, lineHeight: 1.5 }}>{session.summary}</p>}
                  </div>
                  <button onClick={() => handleDelete(session.id)} className="btn-ghost" style={{ padding: '0.35rem', marginLeft: 8, flexShrink: 0 }}>
                    <Trash2 size={14} color="var(--danger)" />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    <BookOpen size={10} style={{ marginRight: 3 }} />{session.mcqCount || 10} MCQs
                  </span>
                  <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    <CreditCard size={10} style={{ marginRight: 3 }} />{session.cardCount || 12} Cards
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
