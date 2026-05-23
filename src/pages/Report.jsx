import { useState, useEffect, useRef } from 'react'
import { BookOpen, CreditCard, Upload, AlertTriangle, Download, Share2 } from 'lucide-react'
import useExamStore from '../store/examStore'
import { getScoreLabel, getScoreColor, getTopicAccuracy } from '../utils/helpers'
import ShareCard from '../components/ShareCard'
import RetryWeakButton from '../components/RetryWeakButton'
import { fireConfetti } from '../utils/confetti'
import { cloudSaveResults } from '../services/supabase'

function CountUp({ target, duration = 1500, color }) {
  const [count, setCount] = useState(0)
  const ref = useRef()
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [target, duration])
  return <span style={{ color }}>{count}</span>
}

async function exportPDF(examContent, answers, overallPct, topicData) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, M = 15
  let y = 20
  const addText = (text, x, size = 11, style = 'normal', color = [15,23,42]) => {
    doc.setFontSize(size); doc.setFont('helvetica', style); doc.setTextColor(...color)
    doc.text(String(text), x, y)
  }
  const newLine = (n = 7) => { y += n }
  const checkPage = (need = 20) => { if (y + need > 280) { doc.addPage(); y = 20 } }
  doc.setFillColor(79,110,247); doc.rect(0,0,W,28,'F')
  doc.setFontSize(20); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255)
  doc.text('ExamBrain — Exam Report', M, 16)
  doc.setFontSize(10); doc.setFont('helvetica','normal')
  doc.text(`Topic: ${examContent.topic || 'N/A'}   |   Date: ${new Date().toLocaleDateString()}`, M, 24)
  y = 38
  const scoreColor = overallPct >= 90 ? [34,197,94] : overallPct >= 70 ? [79,110,247] : overallPct >= 50 ? [245,158,11] : [239,68,68]
  addText(`Overall Score: ${overallPct}%`, M, 18, 'bold', scoreColor); newLine(10)
  const mcqAnswers = answers.filter(a => a.type === 'mcq')
  const mcqCorrect = mcqAnswers.filter(a => a.isCorrect).length
  addText(`MCQ: ${mcqCorrect}/${examContent.quiz?.length || 0} correct`, M, 11, 'normal', [71,85,105]); newLine(8)
  if (examContent.summary) {
    checkPage()
    addText('Summary', M, 13, 'bold'); newLine(6)
    doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.setTextColor(71,85,105)
    const lines = doc.splitTextToSize(examContent.summary, W - M * 2)
    doc.text(lines, M, y); y += lines.length * 5 + 6
  }
  checkPage(20); addText('Topic Breakdown', M, 13, 'bold'); newLine(8)
  topicData.forEach(t => {
    checkPage(12)
    const c = t.pct >= 70 ? [34,197,94] : t.pct >= 40 ? [245,158,11] : [239,68,68]
    addText(`${t.topic}`, M, 10, 'normal', [15,23,42])
    addText(`${t.correct}/${t.total} (${t.pct}%)`, W-M-30, 10, 'bold', c)
    newLine(7)
    doc.setFillColor(226,232,240); doc.rect(M, y-3, W-M*2, 3,'F')
    doc.setFillColor(...c); doc.rect(M, y-3, (W-M*2)*(t.pct/100), 3,'F')
    newLine(6)
  })
  doc.save(`ExamBrain-${examContent.topic || 'Report'}-${new Date().toLocaleDateString()}.pdf`)
}

export default function Report({ setScreen, onRecordStudy, user }) {
  const { examContent, answers, sessionId, resetQuiz, setExamContent } = useExamStore()
  const [exporting, setExporting] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [confettiFired, setConfettiFired] = useState(false)

  const mcqAnswers = answers.filter(a => a.type === 'mcq')
  const shortAnswers = answers.filter(a => a.type === 'short')

  if (!examContent) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <p style={{ marginBottom: 16 }}>No results yet. Complete the quiz first.</p>
      <button className="btn-primary" onClick={() => setScreen('quiz')} style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>Start Quiz</button>
    </div>
  )

  if (mcqAnswers.length + shortAnswers.length === 0) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <p style={{ marginBottom: 16 }}>Complete the quiz to see your report.</p>
      <button className="btn-primary" onClick={() => setScreen('quiz')} style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>Start Quiz</button>
    </div>
  )

  const mcqCorrect = mcqAnswers.filter(a => a.isCorrect).length
  const mcqTotal = examContent.quiz?.length || 0
  const mcqPct = mcqTotal ? Math.round((mcqCorrect / mcqTotal) * 100) : 0
  const avgShort = shortAnswers.length ? Math.round(shortAnswers.reduce((s,a) => s+(a.score||0), 0) / shortAnswers.length) : null
  const overallPct = Math.round((mcqPct + (avgShort ?? mcqPct)) / 2)
  const scoreLabel = getScoreLabel(overallPct)
  const scoreColor = getScoreColor(overallPct)
  const topicData = getTopicAccuracy([...mcqAnswers, ...shortAnswers])
  const weakestTopic = topicData[0]

  useEffect(() => {
    if (!confettiFired) {
      setConfettiFired(true)
      fireConfetti(overallPct)
      onRecordStudy?.(mcqAnswers.length + shortAnswers.length, overallPct)
      // Cloud sync results if logged in
      if (user && sessionId) {
        cloudSaveResults(user.id, sessionId, answers).catch(() => {})
      }
    }
  }, [])

  // Retry weak questions — filter exam content to only weak Qs
  function handleRetryWeak(weakQuestions) {
    const weakContent = { ...examContent, quiz: weakQuestions }
    setExamContent(weakContent)
    resetQuiz()
    setScreen('quiz')
  }

  const suggestions = []
  if (weakestTopic && weakestTopic.pct < 60) suggestions.push(`Revisit ${weakestTopic.topic} — only ${weakestTopic.pct}% accuracy`)
  if (mcqPct < 70) suggestions.push('Redo the MCQ quiz with Timed Mode for exam pressure practice')
  if (shortAnswers.length < examContent.shortAnswer?.length) suggestions.push('Complete all short answer questions for full AI grading')
  suggestions.push('Review all flashcards and mark weak ones — then reshuffle and test again')

  async function handleExport() {
    setExporting(true)
    try { await exportPDF(examContent, answers, overallPct, topicData) }
    catch(e) { console.error(e) }
    finally { setExporting(false) }
  }

  return (
    <div className="page animate-fadeIn" style={{ padding: '1.25rem' }}>
      {showShare && (
        <ShareCard examContent={examContent} overallPct={overallPct} mcqCorrect={mcqCorrect} mcqTotal={mcqTotal} topicData={topicData} onClose={() => setShowShare(false)} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)' }}>Your Results</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowShare(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.45rem 0.85rem', borderRadius: 10, border: '1px solid var(--brand-500)', background: 'rgba(79,110,247,0.1)', color: 'var(--brand-400)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
            <Share2 size={13} /> Share
          </button>
          <button onClick={handleExport} disabled={exporting} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.45rem 0.85rem', borderRadius: 10, border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
            <Download size={13} />{exporting ? 'Exporting…' : 'PDF'}
          </button>
        </div>
      </div>

      {/* Score hero */}
      <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>
          <CountUp target={overallPct} color={scoreColor} />
          <span style={{ color: scoreColor }}>%</span>
        </div>
        <p style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{scoreLabel.emoji} {scoreLabel.label}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{examContent.topic}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: '1.25rem' }}>
        {[
          ['✅', `${mcqCorrect}/${mcqTotal}`, 'Correct', 'var(--success)'],
          ['❌', `${mcqTotal-mcqCorrect}/${mcqTotal}`, 'Wrong', 'var(--danger)'],
          ['📊', `${mcqPct}%`, 'MCQ', 'var(--brand-400)'],
        ].map(([e, v, l, c]) => (
          <div key={l} className="card" style={{ textAlign: 'center', padding: '0.85rem 0.5rem' }}>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: c }}>{v}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{e} {l}</p>
          </div>
        ))}
      </div>

      {/* Weak topic alert */}
      {weakestTopic && weakestTopic.pct < 60 && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1rem', display: 'flex', gap: 10 }}>
          <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
            Focus on <strong>{weakestTopic.topic}</strong> — only {weakestTopic.pct}% accuracy
          </p>
        </div>
      )}

      {/* Study suggestions */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.85rem', color: 'var(--text-primary)' }}>🎯 What to Study Next</h3>
        {suggestions.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(79,110,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-400)', flexShrink: 0 }}>{i+1}</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</p>
          </div>
        ))}
      </div>

      {/* Topic breakdown */}
      {topicData.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Topic Breakdown</h3>
          {topicData.map(t => (
            <div key={t.topic} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>{t.topic}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.correct}/{t.total}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${t.pct}%`, background: t.pct >= 70 ? 'var(--success)' : t.pct >= 40 ? 'var(--warning)' : 'var(--danger)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question review */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Question Review</h3>
        {[...mcqAnswers, ...shortAnswers].map((a, i) => (
          <div key={a.id||i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingBottom: 12, marginBottom: 12, borderBottom: i < mcqAnswers.length+shortAnswers.length-1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: a.isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: a.isCorrect ? 'var(--success)' : 'var(--danger)' }}>{i+1}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {a.type === 'mcq' ? examContent.quiz?.find(q => q.id === a.id)?.question : examContent.shortAnswer?.find(q => q.id === a.id)?.question}
              </p>
              {a.type === 'short' && <p style={{ fontSize: '0.75rem', color: 'var(--brand-400)', marginTop: 3 }}>⭐ {a.score}/100</p>}
            </div>
            <span>{a.isCorrect ? '✅' : '❌'}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* ── PHASE 4: Retry Weak Questions ── */}
        <RetryWeakButton answers={answers} examContent={examContent} onRetry={handleRetryWeak} />

        <button className="btn-primary" onClick={() => { resetQuiz(); setScreen('quiz') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <BookOpen size={16} /> Retake Full Quiz
        </button>
        <button className="btn-secondary" onClick={() => setScreen('flashcards')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <CreditCard size={16} /> Study Flashcards
        </button>
        <button className="btn-ghost" onClick={() => setScreen('home')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.75rem', borderRadius: 12 }}>
          <Upload size={16} /> Upload New Notes
        </button>
      </div>
    </div>
  )
}
