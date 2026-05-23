import { useState } from 'react'
import { Edit3, Save, X, Check } from 'lucide-react'
import useExamStore from '../store/examStore'
import { showToast } from './Toast'

export default function NotesEditor({ notes }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(notes || '')
  const { setNotes } = useExamStore()

  function handleSave() {
    setNotes(draft)
    setEditing(false)
    showToast.success('Notes updated!')
  }

  function handleCancel() {
    setDraft(notes || '')
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(notes || ''); setEditing(true) }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)',
          color: 'var(--brand-400)', borderRadius: 8, padding: '0.35rem 0.75rem',
          fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
        }}
      >
        <Edit3 size={12} /> Edit Notes
      </button>
    )
  }

  return (
    <div className="animate-slideDown" style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '1rem', marginTop: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Edit your notes</p>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={handleSave} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'var(--brand-500)', color: 'white', border: 'none',
            borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
          }}><Check size={12} /> Save</button>
          <button onClick={handleCancel} className="btn-ghost"><X size={14} /></button>
        </div>
      </div>
      <textarea
        className="input-field"
        rows={8}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        style={{ fontSize: '0.82rem', lineHeight: 1.7 }}
        placeholder="Edit your notes here…"
      />
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
        💡 Save notes then hit "Generate Exam Prep" again to refresh your quiz.
      </p>
    </div>
  )
}
