import { BookOpen, CreditCard, Upload, AlertTriangle, Download } from 'lucide-react'
import { useState } from 'react'
import useExamStore from '../store/examStore'
import { getScoreLabel, getScoreColor, getTopicAccuracy } from '../utils/helpers'

async function exportPDF(examContent, answers, overallPct, topicData) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, M = 15
  let y = 20

  const addText = (text, x, size = 11, style = 'normal', color = [15, 23, 42]) => {
    doc.setFontSize(size); doc.setFont('helvetica', style); doc.setTextColor(...color)
    doc.text(String(text), x, y)
  }
  const newLine = (n = 7) => { y += n }
  const checkPage = (need = 20) => { if (y + need > 280) { doc.addPage(); y = 20 } }

  // Header
  doc.setFillColor(79, 110, 247)
  doc.rect(0, 0, W, 28, 'F')
  doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
  doc.text('ExamBrain — Exam Report', M, 16)
  doc.setFontSize(10); doc.setFont('helvetica', 'normal')
  doc.text(`Topic: ${examContent.topic || 'N/A'}   |   Date: ${new Date().toLocaleDateString()}`, M, 24)
  y = 38

  // Score
  const scoreColor = overallPct >= 90 ? [34, 197, 94] : overallPct >= 70 ? [79, 110, 247] : overallPct >= 50 ? [245, 158, 11] : [239, 68, 68]
  addText(`Overall Score: ${overallPct}%`, M, 18, 'bold', scoreColor); newLine(10)

  const mcqAnswers = answers.filter(a => a.type === 'mcq')
  const mcqCorrect = mcqAnswers.filter(a => a.isCorrect).length
  addText(`MCQ: ${mcqCorrect}/${examContent.quiz?.length || 0} correct`, M, 11, 'normal', [71, 85, 105]); newLine(8)

  // Summary
  if (examContent.summary) {
    checkPage()
    addText('Summary', M, 13, 'bold'); newLine(6)
    doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(71, 85, 105)
    const lines = doc.splitTextToSize(examContent.summary, W - M * 2)
    doc.text(lines, M, y); y += lines.length * 5 + 6
  }

  // Topic breakdown
  checkPage(20)
  addText('Topic Breakdown', M, 13, 'bold'); newLine(8)
  topicData.forEach(t => {
    checkPage(12)
    const c = t.pct >= 70 ? [34, 197, 94] : t.pct >= 40 ? [245, 158, 11] : [239, 68, 68]
    addText(`${t.topic}`, M, 10, 'normal', [15, 23, 42])
    addText(`${t.correct}/${t.total} (${t.pct}%)`, W - M - 30, 10, 'bold', c)
    newLine(7)
    doc.setFillColor(226, 232, 240); doc.rect(M, y - 3, W - M * 2, 3, 'F')
    doc.setFillColor(...c); doc.rect(M, y - 3, (W - M * 2) * (t.pct / 100), 3, 'F')
    newLine(6)
  })

  // Question review
  checkPage(20)
  newLine(4)
  addText('Question Review', M, 13, 'bold'); newLine(8)
  answers.forEach((a, i) => {
    checkPage(16)
    const q = a.type === 'mcq'
      ? examContent.quiz?.find(q => q.id === a.id)
      : examContent.shortAnswer?.find(q => q.id === a.id)
    if (!q) return
    const icon = a.isCorrect ? '✓' : '✗'
    const c = a.isCorrect ? [34, 197, 94] : [239, 68, 68]
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...c)
    doc.text(`${i + 1}. ${icon}`, M, y)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(15, 23, 42)
    const qLines = doc.splitTextToSize(q.question, W - M * 2 - 12)
    doc.text(qLines, M + 10, y); y += qLines.length * 5 + 5
    if (a.type === 'short') {
      doc.setTextColor(79, 110, 247)
      doc.text(`Score: ${a.score}/100`, M + 10, y); y += 5
    }
    y += 2
  })

  // Flashcards
  checkPage(20)
  newLine(4)
  addText('Flashcards', M, 13, 'bold'); newLine(8)
  examContent.flashcards?.forEach((fc, i) => {
    checkPage(18)
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(79, 110, 247)
    doc.text(`Q: ${fc.front}`, M, y); newLine(6)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(71, 85, 105)
    const aLines = doc.splitTextToSize(`A: ${fc.back}`, W - M * 2)
    doc.text(aLines, M, y); y += aLines.length * 5 + 6
  })

  doc.save(`ExamBrain-${examContent.topic || 'Report'}-${new Date().toLocaleDateString()}.pdf`)
}

export default function Report({ setScreen }) {
  const { examContent, answers, resetQuiz } = useExamStore()
  const [exporting, setExporting] = useState(false)

  if (!examContent) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <p style={{ marginBottom: 16 }}>No results yet. Complete the quiz first.</p>
      <button className="btn-primary" onClick={() => setScreen('quiz')} style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>Start Quiz</button>
    </div>
  )

  const mcqAnswers = answers.filter(a => a.type === 'mcq')
  const shortAnswers = answers.filter(a => a.type === 'short')

  if (mcqAnswers.length + shortAnswers.length === 0) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <p style={{ marginBottom: 16 }}>Complete the quiz to see your report.</p>
      <button className="btn-primary" onClick={() => setScreen('quiz')} style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>Start Quiz</button>
    </div>
  )

  const mcqCorrect = mcqAnswers.filter(a => a.isCorrect).length
  const mcqTotal = examContent.quiz?.length || 0
  const mcqPct = mcqTotal ? Math.round((mcqCorrect / mcqTotal) * 100) : 0
  const avgShort = shortAnswers.length ? Math.round(shortAnswers.reduce((s, a) => s + (a.score || 0), 0) / shortAnswers.length) : null
  const overallPct = Math.round((mcqPct + (avgShort ?? mcqPct)) / 2)
  const scoreLabel = getScoreLabel(overallPct)
  const scoreColor = getScoreColor(overallPct)
  const topicData = getTopicAccuracy([...mcqAnswers, ...shortAnswers])
  const weakestTopic = topicData[0]

  async function handleExport() {
    setExporting(true)
    try { await exportPDF(examContent, answers, overallPct, topicData) }
    catch (e) { console.error(e) }
    finally { setExporting(false) }
  }

  return (
    <div className="page animate-fadeIn" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)' }}>Your Results</h2>
        <button onClick={handleExport} disabled={exporting} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem',
          borderRadius: 10, border: '1px solid var(--border-strong)',
          background: 'transparent', color: 'var(--text-secondary)',
          fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s'
        }}>
          <Download size={14} />
          {exporting ? 'Exporting…' : 'Export PDF'}
        </button>
      </div>

      {/* Score hero */}
      <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '4rem', fontWeight: 800, color: scoreColor, lineHeight: 1, marginBottom: 8 }}>
          {overallPct}%
        </div>
        <p style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{scoreLabel.emoji} {scoreLabel.label}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{examContent.topic}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: '1.25rem' }}>
        {[
          ['✅ Correct', `${mcqCorrect}/${mcqTotal}`, 'var(--success)'],
          ['❌ Wrong', `${mcqTotal - mcqCorrect}/${mcqTotal}`, 'var(--danger)'],
          ['📊 MCQ %', `${mcqPct}%`, 'var(--brand-400)'],
        ].map(([l, v, c]) => (
          <div key={l} className="card" style={{ textAlign: 'center', padding: '0.85rem 0.5rem' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: c }}>{v}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 3 }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Weak topic alert */}
      {weakestTopic && weakestTopic.pct < 60 && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: 10 }}>
          <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
            Focus on <strong>{weakestTopic.topic}</strong> — only {weakestTopic.pct}% accuracy
          </p>
        </div>
      )}

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
                <div className="progress-fill" style={{
                  width: `${t.pct}%`,
                  background: t.pct >= 70 ? 'var(--success)' : t.pct >= 40 ? 'var(--warning)' : 'var(--danger)'
                }} role="progressbar" aria-valuenow={t.pct} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question review */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Question Review</h3>
        {[...mcqAnswers, ...shortAnswers].map((a, i) => (
          <div key={a.id || i} style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            paddingBottom: 12, marginBottom: 12,
            borderBottom: i < mcqAnswers.length + shortAnswers.length - 1 ? '1px solid var(--border)' : 'none'
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: a.isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700,
              color: a.isCorrect ? 'var(--success)' : 'var(--danger)'
            }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <p className="line-clamp-2" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {a.type === 'mcq'
                  ? examContent.quiz?.find(q => q.id === a.id)?.question
                  : examContent.shortAnswer?.find(q => q.id === a.id)?.question}
              </p>
              {a.type === 'short' && <p style={{ fontSize: '0.75rem', color: 'var(--brand-400)', marginTop: 3 }}>⭐ {a.score}/100</p>}
            </div>
            <span style={{ fontSize: '1rem' }}>{a.isCorrect ? '✅' : '❌'}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn-primary" onClick={() => { resetQuiz(); setScreen('quiz') }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <BookOpen size={16} /> Retake Quiz
        </button>
        <button className="btn-secondary" onClick={() => setScreen('flashcards')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <CreditCard size={16} /> Study Flashcards
        </button>
        <button className="btn-ghost" onClick={() => setScreen('home')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.75rem', borderRadius: 12 }}>
          <Upload size={16} /> Upload New Notes
        </button>
      </div>
    </div>
  )
}
