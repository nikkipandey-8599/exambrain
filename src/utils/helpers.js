import { SCORE_LABELS } from './constants'

export function getScoreLabel(pct) {
  return SCORE_LABELS.find(s => pct >= s.min) || SCORE_LABELS[SCORE_LABELS.length - 1]
}

export function getScoreColor(pct) {
  if (pct >= 90) return '#22c55e'
  if (pct >= 70) return '#4f6ef7'
  if (pct >= 50) return '#f59e0b'
  return '#ef4444'
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
    .map(([topic, v]) => ({ topic, ...v, pct: Math.round((v.correct / v.total) * 100) }))
    .sort((a, b) => a.pct - b.pct)
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function gradeOffline(userAnswer, modelAnswer, keyPoints = []) {
  const ua = userAnswer.toLowerCase()
  const ma = modelAnswer.toLowerCase()
  const words = ma.split(/\s+/).filter(w => w.length > 4)
  const matched = words.filter(w => ua.includes(w))
  const score = Math.round(clamp((matched.length / Math.max(words.length, 1)) * 100, 0, 100))
  return {
    score,
    isCorrect: score >= 70,
    feedback: score >= 70 ? 'Good answer - key concepts present.' : 'Missing some key concepts from the model answer.',
    missedPoints: keyPoints.slice(Math.floor(keyPoints.length * (score / 100)))
  }
}
