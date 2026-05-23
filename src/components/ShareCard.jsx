import { useState } from 'react'
import { Share2, Download, X } from 'lucide-react'
import { getScoreColor, getScoreLabel } from '../utils/helpers'

export default function ShareCard({ examContent, overallPct, mcqCorrect, mcqTotal, topicData, onClose }) {
  const [sharing, setSharing] = useState(false)
  const scoreColor = getScoreColor(overallPct)
  const label = getScoreLabel(overallPct)

  async function handleShare(download = false) {
    setSharing(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const el = document.getElementById('share-card-inner')
      const canvas = await html2canvas(el, {
        scale: 2, useCORS: true, backgroundColor: '#0f172a'
      })
      
      if (download) {
        const a = document.createElement('a')
        a.download = `ExamBrain-${examContent?.topic || 'Result'}.png`
        a.href = canvas.toDataURL()
        a.click()
      } else {
        canvas.toBlob(async (blob) => {
          const file = new File([blob], 'exambrain-result.png', { type: 'image/png' })
          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `I scored ${overallPct}% on ExamBrain!`,
              text: `Just aced ${examContent?.topic} with ${overallPct}% — try ExamBrain for AI-powered exam prep!`,
              files: [file]
            })
          } else {
            // Fallback: download
            const a = document.createElement('a')
            a.download = 'exambrain-result.png'
            a.href = canvas.toDataURL()
            a.click()
          }
        })
      }
    } catch (e) { console.error(e) }
    finally { setSharing(false) }
  }

  const weakTopic = topicData?.[0]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '1.25rem'
    }}>
      {/* Card to capture */}
      <div id="share-card-inner" style={{
        width: 340, borderRadius: 20,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        border: '1px solid rgba(79,110,247,0.4)',
        padding: '1.75rem', marginBottom: 16,
        fontFamily: 'Inter, sans-serif'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#4f6ef7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🧠</div>
          <div>
            <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em' }}>EXAMBRAIN</p>
            <p style={{ color: '#64748b', fontSize: 11 }}>AI Exam Prep</p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ color: '#64748b', fontSize: 11 }}>{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 72, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
            {overallPct}%
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginTop: 6 }}>
            {label.emoji} {label.label}
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{examContent?.topic}</p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: '1.25rem' }}>
          {[
            ['✅', mcqCorrect, 'Correct'],
            ['❌', mcqTotal - mcqCorrect, 'Wrong'],
            ['📊', `${Math.round((mcqCorrect/mcqTotal)*100)}%`, 'MCQ']
          ].map(([e, v, l]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '0.6rem', textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>{e} {l}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>{v}</p>
            </div>
          ))}
        </div>

        {/* Topic bars */}
        {topicData?.slice(0, 3).map(t => (
          <div key={t.topic} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{t.topic}</span>
              <span style={{ fontSize: 11, color: t.pct >= 70 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>{t.pct}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: `${t.pct}%`, borderRadius: 99, background: t.pct >= 70 ? '#22c55e' : t.pct >= 40 ? '#f59e0b' : '#ef4444' }} />
            </div>
          </div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#475569' }}>exambrain.vercel.app · AI-powered exam prep</p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, width: 340 }}>
        <button onClick={() => handleShare(false)} disabled={sharing} style={{
          flex: 2, padding: '0.85rem', borderRadius: 12, border: 'none',
          background: '#4f6ef7', color: 'white', fontWeight: 600, fontSize: '0.9rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer'
        }}>
          <Share2 size={16} />{sharing ? 'Sharing…' : 'Share Result'}
        </button>
        <button onClick={() => handleShare(true)} disabled={sharing} style={{
          flex: 1, padding: '0.85rem', borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'transparent', color: '#94a3b8', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.85rem'
        }}>
          <Download size={14} /> Save
        </button>
      </div>

      <button onClick={onClose} style={{
        marginTop: 12, background: 'none', border: 'none',
        color: '#64748b', fontSize: '0.85rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6
      }}>
        <X size={14} /> Close
      </button>
    </div>
  )
}
