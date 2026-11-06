import { useState } from 'react'
import { supabase } from '../services/supabase'
import { showToast } from './Toast'

const OPTIONS = [
  { value: 'yes', label: 'Yes', emoji: '😊' },
  { value: 'somewhat', label: 'Somewhat', emoji: '😐' },
  { value: 'no', label: 'No', emoji: '🙁' },
]

export default function GenerationFeedback({ user, topic }) {
  const [rating, setRating] = useState('')
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!rating || !user?.id || saving) return

    setSaving(true)

    const { error } = await supabase
      .from('generation_feedback')
      .insert({
        user_id: user.id,
        session_topic: topic || null,
        rating,
        comment: comment.trim() || null,
      })

    setSaving(false)

    if (error) {
      showToast.error('Could not submit feedback. Please try again.')
      return
    }

    setSubmitted(true)
    showToast.success('Thanks for your feedback!')
  }

  if (dismissed) return null

  return (
    <section
      style={{
        margin: '0.85rem 1rem',
        padding: '1rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
      }}
    >
      {submitted ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{
            color: 'var(--text-primary)',
            fontWeight: 700,
            margin: '0 0 8px',
          }}>
            Thank you for helping improve ExamBrain!
          </p>

          <button
            onClick={() => setDismissed(true)}
            style={{
              border: '1px solid var(--border-strong)',
              borderRadius: 8,
              padding: '0.45rem 0.9rem',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 8,
          }}>
            <div>
              <p style={{
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                margin: 0,
              }}>
                Was this study kit helpful?
              </p>

              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                margin: '4px 0 0',
              }}>
                Your optional feedback helps us improve ExamBrain.
              </p>
            </div>

            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss feedback"
              style={{
                border: 0,
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1.2rem',
              }}
            >
              ×
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginTop: 12,
          }}>
            {OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRating(option.value)}
                aria-pressed={rating === option.value}
                style={{
                  padding: '0.6rem 0.35rem',
                  borderRadius: 9,
                  border: `1px solid ${
                    rating === option.value
                      ? 'var(--brand-500)'
                      : 'var(--border-strong)'
                  }`,
                  background: rating === option.value
                    ? 'var(--brand-glow)'
                    : 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                <span style={{
                  display: 'block',
                  fontSize: '1.1rem',
                  marginBottom: 3,
                }}>
                  {option.emoji}
                </span>
                {option.label}
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={e => setComment(e.target.value.slice(0, 500))}
            rows={2}
            maxLength={500}
            placeholder="Anything we could improve? (optional)"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              marginTop: 10,
              padding: '0.65rem 0.75rem',
              borderRadius: 9,
              border: '1px solid var(--border-strong)',
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              resize: 'vertical',
            }}
          />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
          }}>
            <button
              onClick={() => setDismissed(true)}
              style={{
                border: 0,
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.5rem 0',
              }}
            >
              Maybe later
            </button>

            <button
              onClick={handleSubmit}
              disabled={!rating || saving}
              style={{
                border: 0,
                borderRadius: 8,
                padding: '0.55rem 1rem',
                background: 'var(--brand-500)',
                color: '#fff',
                cursor: !rating || saving ? 'not-allowed' : 'pointer',
                opacity: !rating || saving ? 0.55 : 1,
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              {saving ? 'Sending…' : 'Send feedback'}
            </button>
          </div>
        </>
      )}
    </section>
  )
}
