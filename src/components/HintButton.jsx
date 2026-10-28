import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { authHeaders } from '../utils/authHeader'

const HINTS_PER_SESSION = 3
const HINT_KEY = 'exambrain-hints-used'

export default function HintButton({ question, options, answer, onHintUsed }) {
  const [hint, setHint] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [hintError, setHintError] = useState(null)
  const hintsUsed = parseInt(sessionStorage.getItem(HINT_KEY) || '0')
  const hintsLeft = HINTS_PER_SESSION - hintsUsed

  async function getHint() {
    if (hintsLeft <= 0 || loading) return
    setLoading(true)
    setHintError(null)

    const levels = [
      `Give a very subtle hint for this question without mentioning the answer: "${question}". One sentence only.`,
      `Give a moderate hint that narrows it down but doesn't give away the answer: "${question}". Options: ${options?.join(', ')}. Two sentences max.`,
      `Give a strong hint that makes the answer clear but doesn't state it directly: "${question}". Answer is related to: ${answer?.split('.')[0]}. Two sentences.`
    ]

    try {
      // Goes through the server so the key stays private and fallback providers apply
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({
          messages: [{ role: 'user', content: levels[Math.min(hintLevel, 2)] }],
          temperature: 0.5,
          max_tokens: 150,
          json: false
        })
      })
      const data = await res.json().catch(() => null)

      // A failed request shows the server's message and does NOT use up a hint
      if (!res.ok) {
        const fallbacks = {
          401: 'Please sign in again to get hints.',
          429: 'You are sending requests too quickly. Please wait a moment.',
          503: 'Hints are temporarily unavailable. Please try again soon.'
        }
        setHintError(data?.error?.message || fallbacks[res.status] || 'Could not get a hint. Please try again.')
        return
      }

      setHint(data?.choices?.[0]?.message?.content || 'Think about the core concept.')
      setHintLevel(h => h + 1)
      sessionStorage.setItem(HINT_KEY, String(hintsUsed + 1))
      onHintUsed?.()
    } catch {
      setHintError('Could not reach ExamBrain. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 10 }}>
      {hint && (
        <div style={{
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 10, padding: '0.7rem 1rem', marginBottom: 8
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600, marginBottom: 3 }}>
            💡 Hint {hintLevel}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{hint}</p>
        </div>
      )}
      {hintError && (
        <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginBottom: 8, lineHeight: 1.4 }}>
          {hintError}
        </p>
      )}
      {hintsLeft > 0 ? (
        <button onClick={getHint} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: '1px solid rgba(245,158,11,0.4)',
          color: 'var(--warning)', borderRadius: 8, padding: '0.45rem 0.9rem',
          fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer'
        }}>
          <Lightbulb size={14} />
          {loading ? 'Getting hint…' : `Get Hint (${hintsLeft} left)`}
        </button>
      ) : (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No hints left this session</p>
      )}
    </div>
  )
}
