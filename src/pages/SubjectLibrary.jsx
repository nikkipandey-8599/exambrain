import { useState } from 'react'
import { BookOpen, ChevronRight, X } from 'lucide-react'
import { SUBJECT_LIBRARY, getLibraryBySubject } from '../data/subjectLibrary'
import useExamStore from '../store/examStore'
import { showToast } from '../components/Toast'

export default function SubjectLibrary({ onLoad, onClose }) {
  const [selected, setSelected] = useState(null)
  const grouped = getLibraryBySubject()
  const subjects = Object.keys(grouped)

  function handleLoad(item) {
    onLoad(item.notes, item.topic)
    onClose()
    showToast.success(`Loaded "${item.topic}" — hit Generate!`)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150,
      background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end'
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="animate-slideUp"
        style={{
          width: '100%', maxWidth: 540, margin: '0 auto',
          background: 'var(--bg-card)', borderRadius: '20px 20px 0 0',
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          border: '1px solid var(--border)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.25rem 0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>📚 Subject Library</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>Pre-built notes — no upload needed</p>
          </div>
          <button onClick={onClose} className="btn-ghost"><X size={18} /></button>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', padding: '0 1.25rem 2rem', flex: 1 }}>
          {subjects.map(subject => (
            <div key={subject} style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                {subject}
              </p>
              {grouped[subject].map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelected(selected?.id === item.id ? null : item)}
                  style={{
                    background: selected?.id === item.id ? 'rgba(79,110,247,0.08)' : 'var(--bg-secondary)',
                    border: `1px solid ${selected?.id === item.id ? 'rgba(79,110,247,0.35)' : 'var(--border)'}`,
                    borderRadius: 12, padding: '0.85rem 1rem', marginBottom: 8,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: '1.4rem' }}>{item.emoji}</span>
                      <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{item.topic}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.preview}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0, transform: selected?.id === item.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>

                  {selected?.id === item.id && (
                    <div className="animate-slideDown" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                      <pre style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: 120, overflow: 'auto', marginBottom: 10 }}>
                        {item.notes.slice(0, 300)}…
                      </pre>
                      <button
                        className="btn-primary"
                        onClick={e => { e.stopPropagation(); handleLoad(item) }}
                        style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
                      >
                        Load & Generate →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
