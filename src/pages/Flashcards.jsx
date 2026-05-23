import { Shuffle, RotateCcw, ChevronLeft, ChevronRight, Star, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import useExamStore from '../store/examStore'
import { useKeyboard } from '../hooks/useKeyboard'
import { haptic } from '../utils/haptics'
import { showToast } from '../components/Toast'
import EmptyState from '../components/EmptyState'

export default function Flashcards({ setScreen }) {
  const { examContent, currentCardIndex, isCardFlipped, masteredCards, shuffledCards, isShuffled,
    nextCard, prevCard, goToCard, flipCard, markMastered, shuffleCards, resetCards } = useExamStore()
  const [speaking, setSpeaking] = useState(false)

  useKeyboard({
    ' ': () => { flipCard(); haptic('light') },
    ArrowRight: () => { nextCard(); haptic('light') },
    ArrowLeft: () => { prevCard(); haptic('light') },
    'm': () => { if (card) { markMastered(card.id); haptic('success') } }
  })

  if (!examContent) return (
    <div className="page">
      <EmptyState icon="🃏" title="No flashcards yet" desc="Upload your notes and generate exam prep to get 12 AI-powered flashcards." action={() => setScreen('home')} actionLabel="Upload Notes →" />
    </div>
  )

  const cards = shuffledCards || examContent.flashcards || []
  const card = cards[currentCardIndex]
  const isMastered = card && masteredCards.has(card.id)
  const masteredCount = masteredCards.size

  function speak() {
    if (!('speechSynthesis' in window)) { showToast.error('Text-to-speech not supported on this browser'); return }
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    const text = isCardFlipped ? card?.back : card?.front
    if (!text) return
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.95
    utt.onend = () => setSpeaking(false)
    utt.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utt)
  }

  function handleFlip() {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false) }
    flipCard()
    haptic('light')
  }

  function handleMastered() {
    if (!card) return
    const wasMastered = masteredCards.has(card.id)
    markMastered(card.id)
    haptic(wasMastered ? 'light' : 'success')
    if (!wasMastered) showToast.success('Card mastered! ⭐')
  }

  return (
    <div className="page animate-fadeIn" style={{ padding: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Card {currentCardIndex + 1} / {cards.length}
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--success)', marginTop: 2 }}>
            {masteredCount}/{cards.length} mastered
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={isShuffled ? resetCards : shuffleCards} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.85rem',
            borderRadius: 8, border: `1px solid ${isShuffled ? 'var(--brand-500)' : 'var(--border-strong)'}`,
            background: isShuffled ? 'rgba(79,110,247,0.1)' : 'transparent',
            color: isShuffled ? 'var(--brand-400)' : 'var(--text-secondary)',
            fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <Shuffle size={13} />{isShuffled ? 'Shuffled' : 'Shuffle'}
          </button>
          {isShuffled && (
            <button onClick={resetCards} style={{
              padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-strong)',
              background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer'
            }}><RotateCcw size={13} /></button>
          )}
        </div>
      </div>

      {/* Mastery progress */}
      <div className="progress-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="progress-fill" style={{ width: `${(masteredCount / cards.length) * 100}%`, background: 'var(--success)' }} />
      </div>

      {/* Keyboard hint */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {[['Space', 'flip'], ['← →', 'navigate'], ['M', 'master']].map(([k, a]) => (
          <span key={k} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: 4, alignItems: 'center' }}>
            <kbd style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', borderRadius: 4, padding: '1px 6px', fontSize: '0.68rem', fontFamily: 'monospace' }}>{k}</kbd>
            {a}
          </span>
        ))}
      </div>

      {/* 3D Flip Card */}
      <div style={{ perspective: '1000px', marginBottom: '1rem', minHeight: 230 }}>
        <div onClick={handleFlip} style={{
          minHeight: 230, position: 'relative', transformStyle: 'preserve-3d',
          transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
          cursor: 'pointer'
        }}>
          {/* Front */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            borderRadius: 20, border: `2px solid ${isMastered ? 'var(--success)' : 'var(--border-strong)'}`,
            background: 'var(--bg-card)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '1.75rem', transition: 'border-color 0.3s'
          }}>
            <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.65rem', letterSpacing: '0.07em' }}>
              TERM / CONCEPT
            </span>
            {card?.subtopic && <p style={{ fontSize: '0.75rem', color: 'var(--brand-400)', marginBottom: 12, fontWeight: 500 }}>{card.subtopic}</p>}
            <p style={{ fontSize: '1.05rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.65, color: 'var(--text-primary)' }}>{card?.front}</p>
            <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 20 }}>Tap to reveal · Space</p>
          </div>
          {/* Back */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)', borderRadius: 20,
            border: `2px solid ${isMastered ? 'var(--success)' : 'var(--brand-500)'}`,
            background: isMastered ? 'rgba(34,197,94,0.05)' : 'rgba(79,110,247,0.05)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.75rem'
          }}>
            <span className="badge" style={{ background: 'rgba(79,110,247,0.12)', color: 'var(--brand-400)', marginBottom: 16, fontSize: '0.65rem', letterSpacing: '0.07em' }}>
              ANSWER
            </span>
            <p style={{ fontSize: '1rem', textAlign: 'center', lineHeight: 1.7, color: 'var(--text-primary)' }}>{card?.back}</p>
            <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 20 }}>Tap to flip back</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <button onClick={speak} aria-label="Read aloud" style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '0.65rem', borderRadius: 12,
          border: `1px solid ${speaking ? 'var(--brand-500)' : 'var(--border-strong)'}`,
          background: speaking ? 'rgba(79,110,247,0.1)' : 'transparent',
          color: speaking ? 'var(--brand-400)' : 'var(--text-secondary)',
          fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
        }}>
          {speaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
          {speaking ? 'Stop' : 'Read Aloud'}
        </button>
        {card && (
          <button onClick={handleMastered} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '0.65rem', borderRadius: 12,
            border: `1px solid ${isMastered ? 'var(--success)' : 'var(--border-strong)'}`,
            background: isMastered ? 'rgba(34,197,94,0.1)' : 'transparent',
            color: isMastered ? 'var(--success)' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <Star size={15} fill={isMastered ? 'currentColor' : 'none'} />
            {isMastered ? 'Mastered ✓' : 'Master (M)'}
          </button>
        )}
      </div>

      {/* Prev/Next */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem' }}>
        <button className="btn-secondary" onClick={() => { prevCard(); haptic('light') }} aria-label="Previous"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <ChevronLeft size={16} /> Prev
        </button>
        <button className="btn-primary" onClick={() => { nextCard(); haptic('light') }} aria-label="Next"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Grid */}
      <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 8 }}>Jump to card</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
        {cards.map((c, i) => (
          <button key={i} onClick={() => { goToCard(i); haptic('light') }} aria-label={`Card ${i+1}`} style={{
            aspectRatio: '1', borderRadius: 8, border: 'none', fontSize: '0.75rem', fontWeight: 600,
            background: i === currentCardIndex ? 'var(--brand-500)' : masteredCards.has(c.id) ? 'rgba(34,197,94,0.15)' : 'var(--bg-secondary)',
            color: i === currentCardIndex ? 'white' : masteredCards.has(c.id) ? 'var(--success)' : 'var(--text-secondary)',
            outline: i === currentCardIndex ? '2px solid var(--brand-400)' : 'none',
            cursor: 'pointer', transition: 'all 0.15s'
          }}>{i+1}</button>
        ))}
      </div>
    </div>
  )
}
