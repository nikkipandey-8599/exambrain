// ── Score helpers ─────────────────────────────────────
export function getScoreLabel(pct) {
  if (pct >= 90) return { label: 'Excellent', emoji: '🏆' }
  if (pct >= 75) return { label: 'Good',      emoji: '👍' }
  if (pct >= 55) return { label: 'Keep Going', emoji: '📚' }
  return { label: 'Needs Work', emoji: '💪' }
}

export function getScoreColor(pct) {
  if (pct >= 75) return 'var(--success)'
  if (pct >= 55) return 'var(--brand-500)'
  if (pct >= 35) return 'var(--warning)'
  return 'var(--danger)'
}

export function getTopicAccuracy(answers) {
  const map = {}
  answers.forEach(a => {
    const t = a.subtopic || 'General'
    if (!map[t]) map[t] = { correct: 0, total: 0 }
    map[t].total++
    if (a.isCorrect) map[t].correct++
  })
  return Object.entries(map)
    .map(([topic, { correct, total }]) => ({
      topic, correct, total,
      pct: Math.round((correct / total) * 100)
    }))
    .sort((a, b) => a.pct - b.pct)
}

// ── Shuffle array (required by examStore) ─────────────
export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Strict offline grader ─────────────────────────────
export function gradeOffline(userAnswer, modelAnswer, keyPoints) {
  const answer = (userAnswer || '').toLowerCase().trim()

  if (answer.length < 15) {
    return {
      score: 0, isCorrect: false,
      feedback: 'Answer is too short. Please write a complete response.',
      missedPoints: keyPoints
    }
  }

  const words = answer.split(/\s+/).filter(w => w.length > 1)
  const uniqueWords = new Set(words)
  if (words.length > 3 && uniqueWords.size / words.length < 0.3) {
    return {
      score: 0, isCorrect: false,
      feedback: 'Answer appears to be random text. Please provide a genuine response.',
      missedPoints: keyPoints
    }
  }

  let matched = 0
  const missed = []
  keyPoints.forEach(kp => {
    const kpWords = kp.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const matchCount = kpWords.filter(w => answer.includes(w)).length
    const matchRatio = kpWords.length > 0 ? matchCount / kpWords.length : 0
    if (matchRatio >= 0.6) matched++
    else missed.push(kp)
  })

  const ratio = keyPoints.length > 0 ? matched / keyPoints.length : 0
  const modelWords = [...new Set((modelAnswer || '').toLowerCase().split(/\s+/).filter(w => w.length > 4))]
  const modelMatchRatio = modelWords.length > 0 ? modelWords.filter(w => answer.includes(w)).length / modelWords.length : 0
  const combinedRatio = (ratio * 0.7) + (modelMatchRatio * 0.3)
  let score = Math.round(combinedRatio * 100)
  if (combinedRatio < 0.2) score = Math.min(score, 15)

  const isCorrect = score >= 70
  let feedback = ''
  if (score >= 85) feedback = 'Excellent — covers the key points well.'
  else if (score >= 70) feedback = 'Good — addresses most important points.'
  else if (score >= 50) feedback = 'Partial credit — some points missed.'
  else if (score >= 20) feedback = 'Too vague or incomplete. Review the key concepts.'
  else feedback = 'Does not address the question. Study this topic again.'

  return { score, isCorrect, feedback, missedPoints: missed }
}

// ── Format helpers ────────────────────────────────────
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export function formatDuration(ms) {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}
