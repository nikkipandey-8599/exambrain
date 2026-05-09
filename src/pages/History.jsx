import { useState, useEffect } from 'react'
import { Trash2, BookOpen, CreditCard, RefreshCw } from 'lucide-react'
import { getAllSessions, deleteSession, clearAllData } from '../services/db'
import { getScoreColor, formatDate } from '../utils/helpers'
import useExamStore from '../store/examStore'

export default function History({ setScreen }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmClear, setConfirmClear] = useState(false)
  const { setExamContent, setSessionId, setNotes } = useExamStore()

  async function load() {
    setLoading(true)
    const s = await getAllSessions()
    setSessions(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    await deleteSession(id)
    setSessions(s => s.filter(x => x.id !== id))
  }

  async function handleClearAll() {
    if (!confirmClear) { setConfirmClear(true); return }
    await clearAllData()
    setSessions([])
    setConfirmClear(false)
  }

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <div className="animate-spin" style={{ width: 24, height: 24, border: '2px solid var(--brand-500)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }} />
    </div>
  )

  return (
    <div className="page animate-fadeIn" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>History</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{sessions.length} sessions saved</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn-ghost" aria-label="Refresh history" style={{ padding: '0.45rem' }}>
            <RefreshCw size={16} />
          </button>
          {sessions.length > 0 && (
            <button onClick={handleClearAll} style={{
              padding: '0.45rem 0.85rem', borderRadius: 8, border: '1px solid var(--border-strong)',
              background: confirmClear ? 'rgba(239,68,68,0.1)' : 'transparent',
              color: confirmClear ? 'var(--danger)' : 'var(--text-secondary)',
              fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s'
            }}>
              {confirmClear ? 'Confirm Clear All' : 'Clear All'}
            </button>
          )}
        </div>
      </div>

      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 6 }}>No sessions yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Generate your first exam prep to see it here</p>
          <button className="btn-primary" onClick={() => setScreen('home')} style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
            Upload Notes
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sessions.map(session => {
            const score = session.score
            const scoreColor = score != null ? getScoreColor(score) : 'var(--text-muted)'
            return (
              <div key={session.id} className="card" style={{ padding: '1rem 1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{session.topic || 'Untitled Session'}</p>
                      {score != null && (
                        <span className="badge" style={{ background: `${scoreColor}22`, color: scoreColor, fontSize: '0.7rem' }}>
                          {score}%
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(session.createdAt)}</p>
                    {session.summary && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 5, lineHeight: 1.5 }} className="line-clamp-2">{session.summary}</p>
                    )}
                  </div>
                  <button onClick={() => handleDelete(session.id)} className="btn-ghost" aria-label="Delete session" style={{ padding: '0.35rem', marginLeft: 8, flexShrink: 0 }}>
                    <Trash2 size={15} color="var(--danger)" />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    <BookOpen size={11} /> {session.mcqCount || 10} MCQs
                  </span>
                  <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    <CreditCard size={11} /> {session.cardCount || 12} Cards
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
