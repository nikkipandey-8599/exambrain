import { useState, useRef } from 'react'
import { Upload, X, ChevronDown, ChevronUp, Zap, BookOpen } from 'lucide-react'
import useExamStore from '../store/examStore'
import { generateExamContent } from '../services/gemini'
import { saveSession, saveNote } from '../services/db'
import { cloudSaveSession } from '../services/supabase'
import { MAX_CHARS, MIN_CHARS, WARN_THRESHOLD, SAMPLE_NOTES } from '../utils/constants'
import { showToast } from '../components/Toast'
import NotesEditor from '../components/NotesEditor'
import SubjectLibrary from './SubjectLibrary'

const STAGES = [
  { label: 'Saving your notes…', pct: 10 },
  { label: 'Analysing concepts…', pct: 28 },
  { label: 'Generating quiz questions…', pct: 50 },
  { label: 'Building flashcards…', pct: 68 },
  { label: 'Creating short answers…', pct: 84 },
  { label: 'Finalising exam prep…', pct: 95 },
]

export default function Home({ setScreen, user }) {
  const { notes, setNotes, setExamContent, setSessionId, isGenerating, setGenerating, generateError, setGenerateError, examContent, resetAll } = useExamStore()
  const [stagePct, setStagePct] = useState(0)
  const [stageLabel, setStageLabel] = useState('')
  const [sampleOpen, setSampleOpen] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()
  const charCount = notes.length
  const nearLimit = charCount >= MAX_CHARS * WARN_THRESHOLD
  const overLimit = charCount > MAX_CHARS
  const canGenerate = charCount >= MIN_CHARS && !overLimit && !isGenerating

  function handleFile(file) {
    if (!file) return
    if (file.size > 1024 * 1024) { showToast.error('File too large. Max 1MB.'); return }
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['txt', 'md'].includes(ext)) { showToast.error('Only .txt and .md files supported.'); return }
    const reader = new FileReader()
    reader.onload = e => { setNotes(e.target.result.slice(0, MAX_CHARS)); showToast.success(`Loaded ${file.name}`) }
    reader.readAsText(file)
    setGenerateError(null)
  }

  async function handleGenerate() {
    setGenerateError(null)
    let i = 0
    const interval = setInterval(() => {
      if (i < STAGES.length) { setStageLabel(STAGES[i].label); setStagePct(STAGES[i].pct); i++ }
    }, 950)
    setGenerating(true)
    try {
      const content = await generateExamContent(notes)
      clearInterval(interval)
      setStagePct(100); setStageLabel('Done!')
      await new Promise(r => setTimeout(r, 350))
      const sid = await saveSession({ topic: content.topic, summary: content.summary })
      await saveNote(sid, notes)
      setExamContent(content)
      setSessionId(sid)
      // Cloud sync if logged in
      if (user) {
        try {
          await cloudSaveSession(user.id, sid, { topic: content.topic, summary: content.summary, examContent: content, notes, createdAt: new Date().toISOString() })
        } catch { /* silent */ }
      }
      showToast.success(`Generated ${content.quiz?.length} questions for "${content.topic}"`)
    } catch (e) {
      clearInterval(interval)
      setStagePct(0)
      const msg = e.message?.includes('API_KEY') || e.message?.includes('key')
        ? 'Invalid API key. Check your VITE_GROQ_API_KEY in .env'
        : e.message || 'Something went wrong. Please try again.'
      setGenerateError(msg)
      showToast.error('Generation failed')
    } finally { setGenerating(false) }
  }

  return (
    <div className="page animate-fadeIn" style={{ padding: '1.25rem' }}>
      {showLibrary && (
        <SubjectLibrary
          onLoad={(n, t) => { setNotes(n); setGenerateError(null) }}
          onClose={() => setShowLibrary(false)}
        />
      )}

      {/* Active session banner */}
      {examContent && (
        <div className="animate-slideDown card-hover" style={{
          background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.25)',
          borderRadius: 16, padding: '0.85rem 1rem', marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <p style={{ fontSize: '0.78rem', color: 'var(--brand-400)', fontWeight: 600, marginBottom: 2 }}>✦ Active Session</p>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{examContent.topic}</p>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <NotesEditor notes={notes} />
              <button onClick={resetAll} style={{
                fontSize: '0.75rem', color: 'var(--text-muted)', background: 'none',
                border: '1px solid var(--border-strong)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer'
              }}>New</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['📝 Quiz', 'quiz'], ['🃏 Cards', 'flashcards'], ['📊 Report', 'report']].map(([l, s]) => (
              <button key={s} onClick={() => setScreen(s)} style={{
                background: 'rgba(79,110,247,0.15)', border: '1px solid rgba(79,110,247,0.3)',
                color: 'var(--brand-400)', borderRadius: 8, padding: '0.3rem 0.75rem',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
              }}>{l}</button>
            ))}
          </div>
        </div>
      )}

      {/* Hero */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
          Study Smarter 🧠
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Paste your notes — get quizzes, flashcards & a full score report in seconds
        </p>
      </div>

      {/* Feature preview */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: '1.25rem' }}>
        {[['10 MCQs', '📝', '#4f6ef7'], ['5 Short Ans', '✍️', '#22c55e'], ['12 Cards', '🃏', '#f59e0b']].map(([l, e, c]) => (
          <div key={l} className="card animate-slideUp" style={{ textAlign: 'center', padding: '0.85rem 0.5rem', borderTop: `3px solid ${c}` }}>
            <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{e}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Subject Library CTA */}
      <button
        onClick={() => setShowLibrary(true)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.8rem 1rem', marginBottom: 10,
          background: 'linear-gradient(135deg, rgba(79,110,247,0.1), rgba(129,140,248,0.08))',
          border: '1px solid rgba(79,110,247,0.25)', borderRadius: 12, cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen size={16} color="var(--brand-400)" />
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 1 }}>📚 Subject Library</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>6 pre-built topics — try without uploading anything</p>
          </div>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--brand-400)', fontWeight: 600 }}>Browse →</span>
      </button>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => fileRef.current.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--brand-500)' : 'var(--border-strong)'}`,
          borderRadius: 14, padding: '0.9rem', marginBottom: 10,
          textAlign: 'center', cursor: 'pointer',
          background: dragOver ? 'rgba(79,110,247,0.06)' : 'transparent', transition: 'all 0.2s'
        }}
      >
        <Upload size={18} color={dragOver ? 'var(--brand-400)' : 'var(--text-muted)'} style={{ margin: '0 auto 6px', display: 'block' }} />
        <p style={{ fontSize: '0.82rem', color: dragOver ? 'var(--brand-400)' : 'var(--text-secondary)' }}>
          Drop .txt or .md file, or <span style={{ color: 'var(--brand-400)', fontWeight: 500 }}>browse</span>
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
          placeholder="Or paste your lecture notes, textbook content, or study material here…"
        />
        {notes && (
          <button onClick={() => { setNotes(''); showToast.info('Notes cleared') }} className="btn-ghost" style={{ position: 'absolute', top: 10, right: 10 }}>
            <X size={15} />
          </button>
        )}
      </div>

      {/* Char counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.75rem', color: overLimit ? 'var(--danger)' : nearLimit ? 'var(--warning)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
          {charCount > 0 && charCount < MIN_CHARS && <span style={{ color: 'var(--warning)' }}> · {MIN_CHARS - charCount} more needed</span>}
        </span>
        {charCount > 0 && (
          <div style={{ height: 4, width: 80, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden', alignSelf: 'center' }}>
            <div style={{ height: '100%', width: `${Math.min((charCount / MAX_CHARS) * 100, 100)}%`, background: overLimit ? 'var(--danger)' : nearLimit ? 'var(--warning)' : 'var(--brand-500)', borderRadius: 99, transition: 'all 0.3s' }} />
          </div>
        )}
      </div>

      {/* Error */}
      {generateError && (
        <div className="animate-slideDown" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>⚠️ {generateError}</p>
        </div>
      )}

      {/* Progress */}
      {isGenerating && (
        <div className="animate-slideDown" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--brand-400)' }} className="animate-pulseSoft">{stageLabel}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stagePct}%</p>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stagePct}%`, background: 'linear-gradient(90deg, var(--brand-500), #818cf8)' }} />
          </div>
        </div>
      )}

      <button className="btn-primary" onClick={handleGenerate} disabled={!canGenerate}>
        {isGenerating ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }} />
            Generating…
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Zap size={16} /> Generate Exam Prep
          </span>
        )}
      </button>

      {/* Sample notes */}
      <div style={{ marginTop: '1.25rem', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <button onClick={() => setSampleOpen(o => !o)} style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.85rem 1rem', background: 'var(--bg-secondary)', border: 'none',
          color: 'var(--text-secondary)', cursor: 'pointer'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>📄 Sample Notes — try without uploading</span>
          {sampleOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {sampleOpen && (
          <div className="animate-slideDown" style={{ padding: '1rem', background: 'var(--bg-card)' }}>
            <pre style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: 160, overflow: 'auto', marginBottom: 10 }}>
              {SAMPLE_NOTES.slice(0, 380)}…
            </pre>
            <button onClick={() => { setNotes(SAMPLE_NOTES); setSampleOpen(false); showToast.success('Sample notes loaded!') }} style={{
              background: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.3)',
              color: 'var(--brand-400)', borderRadius: 8, padding: '0.45rem 1rem',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
            }}>Load Sample Notes →</button>
          </div>
        )}
      </div>
    </div>
  )
}
