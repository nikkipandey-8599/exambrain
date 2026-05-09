import { useState, useRef } from 'react'
import { Upload, X, ChevronDown, ChevronUp, Zap, BookOpen, CreditCard, BarChart2 } from 'lucide-react'
import useExamStore from '../store/examStore'
import { generateExamContent } from '../services/gemini'
import { saveSession, saveNote } from '../services/db'
import { MAX_CHARS, MIN_CHARS, WARN_THRESHOLD, MAX_FILE_SIZE, SAMPLE_NOTES } from '../utils/constants'

const STAGES = [
  { label: 'Saving your notes…', pct: 10 },
  { label: 'Analysing concepts…', pct: 30 },
  { label: 'Generating quiz questions…', pct: 55 },
  { label: 'Building flashcards…', pct: 75 },
  { label: 'Creating short answers…', pct: 88 },
  { label: 'Finalising exam prep…', pct: 96 },
]

export default function Home({ setScreen }) {
  const { notes, setNotes, setExamContent, setSessionId, isGenerating, setGenerating, generateError, setGenerateError, examContent, resetAll } = useExamStore()
  const [stagePct, setStagePct] = useState(0)
  const [stageLabel, setStageLabel] = useState('')
  const [sampleOpen, setSampleOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()
  const charCount = notes.length
  const nearLimit = charCount >= MAX_CHARS * WARN_THRESHOLD
  const overLimit = charCount > MAX_CHARS
  const canGenerate = charCount >= MIN_CHARS && !overLimit && !isGenerating

  function handleFile(file) {
    if (!file) return
    if (file.size > MAX_FILE_SIZE) { setGenerateError('File too large. Max 1MB.'); return }
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['txt', 'md'].includes(ext)) { setGenerateError('Only .txt and .md files are supported.'); return }
    const reader = new FileReader()
    reader.onload = e => setNotes(e.target.result.slice(0, MAX_CHARS))
    reader.readAsText(file)
    setGenerateError(null)
  }

  async function handleGenerate() {
    setGenerateError(null)
    let i = 0
    const interval = setInterval(() => {
      if (i < STAGES.length) {
        setStageLabel(STAGES[i].label)
        setStagePct(STAGES[i].pct)
        i++
      }
    }, 900)
    setGenerating(true)
    try {
      const content = await generateExamContent(notes)
      clearInterval(interval)
      setStagePct(100)
      setStageLabel('Done!')
      await new Promise(r => setTimeout(r, 400))
      const sid = await saveSession({ topic: content.topic, summary: content.summary })
      await saveNote(sid, notes)
      setExamContent(content)
      setSessionId(sid)
    } catch (e) {
      clearInterval(interval)
      setStagePct(0)
      const msg = e.message?.includes('API_KEY') || e.message?.includes('key')
        ? 'Invalid API key. Check your VITE_GEMINI_API_KEY in .env'
        : e.message || 'Something went wrong. Please try again.'
      setGenerateError(msg)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="page animate-fadeIn" style={{ padding: '1.25rem' }}>
      {/* Active session banner */}
      {examContent && (
        <div style={{ background: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.3)', borderRadius: 14, padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--brand-400)', fontWeight: 600, marginBottom: 4 }}>Active Session: {examContent.topic}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginBottom: 10 }}>
            {examContent.quiz?.length} MCQs · {examContent.shortAnswer?.length} Short Answers · {examContent.flashcards?.length} Flashcards
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['Quiz', 'quiz', BookOpen], ['Cards', 'flashcards', CreditCard], ['Report', 'report', BarChart2]].map(([l, s, Icon]) => (
              <button key={s} onClick={() => setScreen(s)} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'var(--brand-900)', border: '1px solid var(--brand-600)',
                color: 'var(--brand-400)', borderRadius: 8, padding: '0.35rem 0.75rem',
                fontSize: '0.8rem', fontWeight: 500
              }}>
                <Icon size={13} />{l}
              </button>
            ))}
            <button onClick={resetAll} style={{
              background: 'transparent', border: '1px solid var(--slate-700)',
              color: 'var(--slate-400)', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.8rem'
            }}>New Session</button>
          </div>
        </div>
      )}

      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4, letterSpacing: '-0.03em' }}>
        Study Smarter 🧠
      </h1>
      <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Paste your notes — get quizzes, flashcards & a full report
      </p>

      {/* Feature preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: '1.25rem' }}>
        {[['10 MCQs', '📝'], ['5 Short Ans.', '✍️'], ['12 Flashcards', '🃏']].map(([l, e]) => (
          <div key={l} className="card" style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 3 }}>{e}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--slate-300)' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
        style={{
          border: `2px dashed ${dragOver ? 'var(--brand-500)' : 'var(--slate-700)'}`,
          borderRadius: 14, padding: '0.85rem', marginBottom: 10, textAlign: 'center',
          background: dragOver ? 'rgba(79,110,247,0.08)' : 'transparent',
          transition: 'all 0.2s', cursor: 'pointer'
        }}
        onClick={() => fileRef.current.click()}
      >
        <Upload size={18} color="var(--slate-500)" style={{ margin: '0 auto 6px' }} />
        <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
          Drag & drop .txt or .md file, or <span style={{ color: 'var(--brand-400)' }}>browse</span>
        </p>
        <input ref={fileRef} type="file" accept=".txt,.md" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      </div>

      {/* Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          className="input-field"
          rows={10}
          value={notes}
          onChange={e => { setNotes(e.target.value.slice(0, MAX_CHARS)); setGenerateError(null) }}
          placeholder="Or paste your lecture notes, textbook section, or study material here…"
        />
        {notes && (
          <button onClick={() => setNotes('')} className="btn-ghost" style={{
            position: 'absolute', top: 10, right: 10
          }} aria-label="Clear notes">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Char counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.75rem', color: overLimit ? 'var(--danger)' : nearLimit ? 'var(--warning)' : 'var(--slate-500)' }}>
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
          {charCount < MIN_CHARS && charCount > 0 && <span> · {MIN_CHARS - charCount} more needed</span>}
        </span>
        {notes && <button onClick={() => setNotes('')} style={{ fontSize: '0.75rem', color: 'var(--slate-500)', background: 'none', border: 'none' }}>Clear</button>}
      </div>

      {/* Error */}
      {generateError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>⚠️ {generateError}</p>
        </div>
      )}

      {/* Progress */}
      {isGenerating && (
        <div style={{ marginBottom: '1rem' }}>
          <div className="progress-bar" style={{ marginBottom: 6 }}>
            <div className="progress-fill" style={{ width: `${stagePct}%`, background: 'var(--brand-500)', transition: 'width 0.8s ease' }} />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--brand-400)', textAlign: 'center' }} className="animate-pulseSoft">{stageLabel}</p>
        </div>
      )}

      <button className="btn-primary" onClick={handleGenerate} disabled={!canGenerate}>
        {isGenerating ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
            Generating…
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Zap size={16} /> Generate Exam Prep
          </span>
        )}
      </button>

      {/* Sample notes */}
      <div style={{ marginTop: '1.25rem', border: '1px solid var(--slate-800)', borderRadius: 14, overflow: 'hidden' }}>
        <button
          onClick={() => setSampleOpen(o => !o)}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--slate-900)', border: 'none', color: 'var(--slate-300)' }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>📄 Sample Notes (French Revolution)</span>
          {sampleOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {sampleOpen && (
          <div style={{ padding: '1rem', background: 'var(--slate-900)' }}>
            <pre style={{ fontSize: '0.75rem', color: 'var(--slate-400)', whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: 180, overflow: 'auto', marginBottom: 10 }}>
              {SAMPLE_NOTES.slice(0, 400)}…
            </pre>
            <button onClick={() => { setNotes(SAMPLE_NOTES); setSampleOpen(false) }} style={{
              background: 'var(--brand-900)', border: '1px solid var(--brand-600)',
              color: 'var(--brand-400)', borderRadius: 8, padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 600
            }}>Load Sample Notes</button>
          </div>
        )}
      </div>
    </div>
  )
}
