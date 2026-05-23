import { RefreshCw } from 'lucide-react'

export default function RetryWeakButton({ answers, examContent, onRetry }) {
  if (!answers || !examContent) return null

  const weak = answers.filter(a => a.type === 'mcq' && !a.isCorrect)
  if (weak.length === 0) return null

  function handleRetry() {
    const weakIds = new Set(weak.map(a => a.id))
    const weakQuestions = examContent.quiz.filter(q => weakIds.has(q.id))
    onRetry(weakQuestions)
  }

  return (
    <button
      onClick={handleRetry}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '0.75rem', borderRadius: 12,
        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
        color: 'var(--warning)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <RefreshCw size={15} />
      Practice {weak.length} Weak Question{weak.length !== 1 ? 's' : ''} Only
    </button>
  )
}
