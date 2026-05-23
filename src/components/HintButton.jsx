import { useState } from 'react'
import { Lightbulb } from 'lucide-react'

const HINTS_PER_SESSION = 3
const HINT_KEY = 'exambrain-hints-used'

export default function HintButton({ question, options, answer, onHintUsed }) {
  const [hint, setHint] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const hintsUsed = parseInt(sessionStorage.getItem(HINT_KEY) || '0')
  const hintsLeft = HINTS_PER_SESSION - hintsUsed

  async function getHint() {
    if (hintsLeft <= 0 || loading) return
    setLoading(true)

    const levels = [
      `Give a very subtle hint for this question without mentioning the answer: "${question}". One sentence only.`,
      `Give a moderate hint that narrows it down but doesn't give away the answer: "${question}". Options: ${options?.join(', ')}. Two sentences max.`,
      `Give a strong hint that makes the answer clear but doesn't state it directly: "${question}". Answer is related to: ${answer?.split('.')[0]}. Two sentences.`
    ]

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: levels[Math.min(hintLevel, 2)] }],
          max_tokens: 100
        })
      })
      const data = await res.json()
      setHint(data.choices?.[0]?.message?.content || 'Think about the core concept.')
      setHintLevel(h => h + 1)
      sessionStorage.setItem(HINT_KEY, String(hintsUsed + 1))
      onHintUsed?.()
    } catch {
      setHint('Think about what you know about this topic.')
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
