import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, MessageSquareText } from 'lucide-react'
import { supabase } from '../services/supabase'
import { showToast } from '../components/Toast'

const ADMIN_EMAIL = 'nikkipandey392@gmail.com'

const RATING_LABELS = {
  yes: '😊 Helpful',
  somewhat: '😐 Somewhat',
  no: '🙁 Not helpful',
}

export default function AdminFeedback({ user }) {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL

  const loadFeedback = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false)
      return
    }

    setRefreshing(true)

    const { data, error } = await supabase
      .from('generation_feedback')
      .select('id, user_id, session_topic, rating, comment, created_at')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      showToast.error('Could not load feedback: ' + error.message)
    } else {
      setFeedback(data || [])
    }

    setLoading(false)
    setRefreshing(false)
  }, [isAdmin])

  useEffect(() => {
    loadFeedback()
  }, [loadFeedback])

  if (!isAdmin) {
    return (
      <div className="page" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <h2>Access denied</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          This page is only available to the administrator.
        </p>
      </div>
    )
  }

  const counts = {
    yes: feedback.filter(item => item.rating === 'yes').length,
    somewhat: feedback.filter(item => item.rating === 'somewhat').length,
    no: feedback.filter(item => item.rating === 'no').length,
  }

  return (
    <div className="page animate-fadeIn" style={{ padding: '1.1rem 1rem 6rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
      }}>
        <div>
          <p style={{
            color: 'var(--brand-500)',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Admin dashboard
          </p>
          <h1 style={{
            color: 'var(--text-primary)',
            fontFamily: 'Georgia, serif',
            fontSize: '1.5rem',
          }}>
            User Feedback
          </h1>
        </div>

        <button
          onClick={loadFeedback}
          disabled={refreshing}
          aria-label="Refresh feedback"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0.55rem 0.75rem',
            borderRadius: 9,
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            cursor: refreshing ? 'wait' : 'pointer',
          }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        marginBottom: 18,
      }}>
        {[
          { label: 'Helpful', value: counts.yes },
          { label: 'Somewhat', value: counts.somewhat },
          { label: 'Not helpful', value: counts.no },
        ].map(item => (
          <div key={item.label} style={{
            padding: '0.8rem 0.45rem',
            textAlign: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
          }}>
            <p style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}>
              {item.value}
            </p>
            <p style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
            }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <h2 style={{
          fontSize: '0.95rem',
          color: 'var(--text-primary)',
          fontWeight: 700,
        }}>
          Submissions
        </h2>
        <span style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
        }}>
          {feedback.length} shown · Latest 200 max
        </span>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>
          Loading feedback…
        </p>
      ) : feedback.length === 0 ? (
        <div style={{
          padding: '2rem 1rem',
          textAlign: 'center',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
        }}>
          <MessageSquareText size={28} color="var(--text-muted)" />
          <p style={{
            color: 'var(--text-primary)',
            fontWeight: 600,
            marginTop: 10,
          }}>
            No feedback yet
          </p>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            marginTop: 5,
          }}>
            User responses will appear here after they submit feedback.
          </p>
        </div>
      ) : (
        feedback.map(item => (
          <article key={item.id} style={{
            padding: '1rem',
            marginBottom: 10,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
              marginBottom: 9,
            }}>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--brand-500)',
              }}>
                {RATING_LABELS[item.rating] || item.rating}
              </span>

              <span style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
              }}>
                {new Date(item.created_at).toLocaleString('en-IN')}
              </span>
            </div>

            <p style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 5,
            }}>
              {item.session_topic || 'Untitled study topic'}
            </p>

            {item.comment ? (
              <p style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}>
                {item.comment}
              </p>
            ) : (
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
              }}>
                No additional comment.
              </p>
            )}
          </article>
        ))
      )}
    </div>
  )
}
