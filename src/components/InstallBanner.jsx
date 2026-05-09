import { Download, X } from 'lucide-react'
import { usePWAInstall } from '../hooks/usePWAInstall'

export default function InstallBanner() {
  const { showBanner, install, dismiss } = usePWAInstall()
  if (!showBanner) return null

  return (
    <div className="animate-slideUp" style={{
      position: 'fixed', top: 64, left: 12, right: 12, zIndex: 100,
      background: 'var(--brand-900)',
      border: '1px solid var(--brand-600)',
      borderRadius: 14, padding: '0.75rem 1rem',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
    }}>
      <Brain size={20} color="var(--brand-400)" />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Install ExamBrain</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Add to home screen for offline use</p>
      </div>
      <button onClick={install} style={{
        background: 'var(--brand-500)', color: 'white', border: 'none',
        borderRadius: 8, padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 600
      }}>
        <Download size={14} style={{ display: 'inline', marginRight: 4 }} />Install
      </button>
      <button onClick={dismiss} className="btn-ghost" aria-label="Dismiss install banner">
        <X size={16} />
      </button>
    </div>
  )
}
