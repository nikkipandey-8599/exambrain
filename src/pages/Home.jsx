import { useState, useRef, useEffect } from 'react'
import { Upload, X, ChevronDown, ChevronUp, Zap, BookOpen } from 'lucide-react'
import useExamStore from '../store/examStore'
import { generateExamContent } from '../services/gemini'
import { saveSession, saveNote } from '../services/db'
import { cloudSaveSession } from '../services/supabase'
import { MAX_CHARS, MIN_CHARS, WARN_THRESHOLD, SAMPLE_NOTES } from '../utils/constants'
import { showToast } from '../components/Toast'
import NotesEditor from '../components/NotesEditor'
import SubjectLibrary from './SubjectLibrary'
import { parseFile, SUPPORTED_TYPES, MAX_FILE_SIZE_MB } from '../services/fileParser'

const STAGES = [
  { label: 'Reading your notes…',       pct: 12 },
  { label: 'Identifying key concepts…', pct: 30 },
  { label: 'Writing quiz questions…',   pct: 52 },
  { label: 'Building flashcards…',      pct: 70 },
  { label: 'Crafting short answers…',   pct: 85 },
  { label: 'Almost ready…',             pct: 96 },
]

export default function Home({ setScreen, user }) {
  const { notes, setNotes, setExamContent, setSessionId, isGenerating, setGenerating,
          generateError, setGenerateError, examContent, resetAll } = useExamStore()
  const [stagePct, setStagePct] = useState(0)
  const [stageLabel, setStageLabel] = useState('')
  const [sampleOpen, setSampleOpen] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [parsing, setParsing] = useState(false)
  const fileRef = useRef()

  const charCount = notes.length
  const nearLimit = charCount >= MAX_CHARS * WARN_THRESHOLD
  const overLimit = charCount > MAX_CHARS
  const canGenerate = charCount >= MIN_CHARS && !overLimit && !isGenerating && !parsing

  async function handleFile(file) {
    if (!file) return
    setGenerateError(null)
    setParsing(true)
    const ext = file.name.split('.').pop().toLowerCase()
    const isImage = ['png','jpg','jpeg','webp'].includes(ext)
    showToast.info(isImage ? 'Reading image with OCR…' : `Parsing ${file.name}…`)
    try {
      const text = await parseFile(file)
      setNotes(text.slice(0, MAX_CHARS))
      showToast.success(`Loaded ${file.name}${text.length > MAX_CHARS ? ' (truncated)' : ''}`)
    } catch (e) {
      showToast.error(e.message || 'Could not read file')
      setGenerateError(e.message)
    } finally { setParsing(false) }
  }

  async function handleGenerate() {
    setGenerateError(null)
    let i = 0
    const iv = setInterval(() => {
      if (i < STAGES.length) { setStageLabel(STAGES[i].label); setStagePct(STAGES[i].pct); i++ }
    }, 950)
    setGenerating(true)
    try {
      const content = await generateExamContent(notes)
      clearInterval(iv)
      setStagePct(100); setStageLabel('Done!')
      await new Promise(r => setTimeout(r, 300))
      const sid = await saveSession({ topic: content.topic, summary: content.summary })
      await saveNote(sid, notes)
      setExamContent(content)
      setSessionId(sid)
      if (user) {
        cloudSaveSession(user.id, sid, {
          topic: content.topic, summary: content.summary,
          examContent: content, notes,
          createdAt: new Date().toISOString()
        }).catch(() => {})
      }
      showToast.success(`Ready — ${content.quiz?.length} questions on "${content.topic}"`)
    } catch (e) {
      clearInterval(iv); setStagePct(0)
      const msg = e.message?.includes('key') ? 'API key error — check Vercel env vars' : e.message || 'Something went wrong'
      setGenerateError(msg)
      showToast.error('Generation failed')
    } finally { setGenerating(false) }
  }

  return (
    <div className="page animate-fadeIn">

      {showLibrary && (
        <SubjectLibrary
          onLoad={(n) => { setNotes(n); setGenerateError(null) }}
          onClose={() => setShowLibrary(false)}
        />
      )}

      {/* ── ACTIVE SESSION ── */}
      {examContent && (
        <div className="animate-slideDown" style={{
          margin: '1rem 1rem 0', padding: '1rem',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 14, borderLeft: '3px solid var(--brand-500)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'system-ui', marginBottom: 3 }}>
                Current Session
              </p>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Georgia, serif' }}>{examContent.topic}</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <NotesEditor notes={notes} />
              <button onClick={resetAll} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontFamily: 'system-ui' }}>New</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['Quiz', 'quiz'], ['Cards', 'flashcards'], ['Report', 'report']].map(([l, s]) => (
              <button key={s} onClick={() => setScreen(s)} style={{
                flex: 1, background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)', borderRadius: 8, padding: '0.45rem',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.18s', fontFamily: 'system-ui'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-400)'; e.currentTarget.style.color = 'var(--brand-500)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >{l}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── HERO STRIP (no vanta — just styled) ── */}
      {!examContent && (
        <div style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          padding: '2rem 1.25rem 1.5rem',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(146,64,14,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -20, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(146,64,14,0.05)', pointerEvents: 'none' }} />
          <h1 style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Georgia, serif', marginBottom: 6, lineHeight: 1.2, position: 'relative' }}>
            Study Smarter.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: 300, fontFamily: 'system-ui', position: 'relative' }}>
            Paste your notes and get a complete exam toolkit — quizzes, flashcards, score report.
          </p>
        </div>
      )}

      {/* ── STATS ROW ── */}
      {!examContent && (
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, borderBottom: '1px solid var(--border)' }}>
          {[
            { label: '20 MCQs', sub: 'Easy → Hard' },
            { label: '7 Answers', sub: 'AI-graded' },
            { label: '20 Cards', sub: '3D flip' },
          ].map((s, i) => (
            <div key={s.label} className="animate-slideUp" style={{
              padding: '0.9rem 0.5rem', textAlign: 'center',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              background: 'var(--bg-card)'
            }}>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Georgia, serif' }}>{s.label}</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'system-ui' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ padding: '1.25rem' }}>

        {/* Subject Library */}
        <button onClick={() => setShowLibrary(true)} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.85rem 1rem', marginBottom: 12,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s'
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-400)'; e.currentTarget.style.boxShadow = '0 2px 12px var(--brand-glow)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={16} color="var(--brand-500)" />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'system-ui', marginBottom: 1 }}>Subject Library</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'system-ui' }}>6 ready-made topics — no upload needed</p>
            </div>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--brand-500)', fontFamily: 'system-ui', fontWeight: 600 }}>Browse</span>
        </button>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          onClick={() => !parsing && fileRef.current.click()}
          style={{
            border: `1.5px dashed ${dragOver ? 'var(--brand-500)' : 'var(--border-strong)'}`,
            borderRadius: 12, padding: '1rem', marginBottom: 10,
            textAlign: 'center', cursor: parsing ? 'not-allowed' : 'pointer',
            background: dragOver ? 'rgba(146,64,14,0.04)' : 'transparent',
            transition: 'all 0.2s'
          }}
        >
          {parsing ? (
            <div>
              <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid var(--border-strong)', borderTopColor: 'var(--brand-500)', borderRadius: '50%', margin: '0 auto 8px' }} />
              <p className="animate-pulseSoft" style={{ fontSize: '0.82rem', color: 'var(--brand-500)', fontFamily: 'system-ui' }}>Parsing file…</p>
            </div>
          ) : (
            <div>
              <Upload size={17} color={dragOver ? 'var(--brand-500)' : 'var(--text-muted)'} style={{ display: 'block', margin: '0 auto 6px' }} />
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'system-ui' }}>
                Drop a file or <span style={{ color: 'var(--brand-500)', fontWeight: 600 }}>browse</span>
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', marginBottom: 4 }}>
                {Object.entries(SUPPORTED_TYPES).map(([ext]) => (
                  <span key={ext} style={{ fontSize: '0.62rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 5, padding: '1px 5px', color: 'var(--text-muted)', fontFamily: 'system-ui' }}>
                    .{ext}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'system-ui' }}>Max {MAX_FILE_SIZE_MB}MB · Images use OCR</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt,.md,.rtf,.csv,.json,.png,.jpg,.jpeg,.webp" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        </div>

        {/* Textarea */}
        <div style={{ position: 'relative', marginBottom: 6 }}>
          <textarea className="input-field" rows={9}
            value={notes}
            onChange={e => { setNotes(e.target.value.slice(0, MAX_CHARS)); setGenerateError(null) }}
            placeholder="Or paste your lecture notes, textbook content, or study material here…"
          />
          {notes && (
            <button onClick={() => { setNotes(''); showToast.info('Notes cleared') }} className="btn-ghost" style={{ position: 'absolute', top: 8, right: 8 }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Char counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: overLimit ? 'var(--danger)' : nearLimit ? 'var(--warning)' : 'var(--text-muted)', fontFamily: 'system-ui' }}>
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            {charCount > 0 && charCount < MIN_CHARS && <span style={{ color: 'var(--warning)' }}> · {MIN_CHARS - charCount} more needed</span>}
          </span>
          {charCount > 0 && (
            <div style={{ width: 72, height: 3, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((charCount / MAX_CHARS) * 100, 100)}%`, background: overLimit ? 'var(--danger)' : nearLimit ? 'var(--warning)' : 'var(--brand-500)', borderRadius: 99, transition: 'all 0.3s' }} />
            </div>
          )}
        </div>

        {/* Error */}
        {generateError && (
          <div className="animate-slideDown" style={{ background: 'rgba(139,26,26,0.07)', border: '1px solid rgba(139,26,26,0.2)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--danger)', fontFamily: 'system-ui' }}>{generateError}</p>
          </div>
        )}

        {/* Progress */}
        {isGenerating && (
          <div className="animate-slideDown" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <p className="animate-pulseSoft" style={{ fontSize: '0.8rem', color: 'var(--brand-500)', fontFamily: 'system-ui' }}>{stageLabel}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'system-ui' }}>{stagePct}%</p>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stagePct}%` }} />
            </div>
          </div>
        )}

        <button className="btn-primary" onClick={handleGenerate} disabled={!canGenerate}>
          {isGenerating || parsing ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span className="animate-spin" style={{ display: 'inline-block', width: 15, height: 15, border: '2px solid rgba(255,253,242,0.4)', borderTopColor: '#FFFDF2', borderRadius: '50%' }} />
              {parsing ? 'Parsing…' : 'Generating…'}
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Zap size={15} /> Generate Exam Prep
            </span>
          )}
        </button>

        {/* Sample notes */}
        <div style={{ marginTop: '1.25rem', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <button onClick={() => setSampleOpen(o => !o)} style={{
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.8rem 1rem', background: 'var(--bg-secondary)', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'system-ui', fontSize: '0.82rem'
          }}>
            <span>Sample notes — try without uploading</span>
            {sampleOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {sampleOpen && (
            <div className="animate-slideDown" style={{ padding: '1rem', background: 'var(--bg-card)' }}>
              <pre style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: 140, overflow: 'auto', marginBottom: 10, fontFamily: 'system-ui' }}>
                {SAMPLE_NOTES.slice(0, 350)}…
              </pre>
              <button onClick={() => { setNotes(SAMPLE_NOTES); setSampleOpen(false); showToast.success('Sample notes loaded') }} style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)',
                color: 'var(--text-secondary)', borderRadius: 8, padding: '0.4rem 0.9rem',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui'
              }}>Load sample</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
