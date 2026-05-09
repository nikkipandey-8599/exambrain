import { Shuffle, RotateCcw, ChevronLeft, ChevronRight, Star, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import useExamStore from '../store/examStore'

export default function Flashcards() {
  const {
    examContent, currentCardIndex, isCardFlipped, masteredCards,
    shuffledCards, isShuffled,
    nextCard, prevCard, goToCard, flipCard, markMastered, shuffleCards, resetCards
  } = useExamStore()
  const [speaking, setSpeaking] = useState(false)

  if (!examContent) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Upload notes first to view flashcards.</div>

  const cards = shuffledCards || examContent.flashcards || []
  const card = cards[currentCardIndex]
  const isMastered = card && masteredCards.has(card.id)
  const masteredCount = masteredCards.size

  function speak() {
    if (!('speechSynthesis' in window)) return
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
  }

  return (
    <div className="page animate-fadeIn" style={{ padding: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Card {currentCardIndex + 1} / {cards.length}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 2 }}>{masteredCount} of {cards.length} mastered</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={isShuffled ? resetCards : shuffleCards} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.8rem',
            borderRadius: 8, border: `1px solid ${isShuffled ? 'var(--brand-500)' : 'var(--border-strong)'}`,
            background: isShuffled ? 'rgba(79,110,247,0.1)' : 'transparent',
            color: isShuffled ? 'var(--brand-400)' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500
          }}>
            <Shuffle size={13} />{isShuffled ? 'Shuffled' : 'Shuffle'}
          </button>
          {isShuffled && (
            <button onClick={resetCards} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.75rem',
              borderRadius: 8, border: '1px solid var(--border-strong)', background: 'transparent',
              color: 'var(--text-secondary)', fontSize: '0.8rem'
            }}>
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Mastery progress */}
      <div className="progress-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="progress-fill" style={{ width: `${(masteredCount / cards.length) * 100}%`, background: 'var(--success)' }} />
      </div>

      {/* 3D Flip Card */}
      <div style={{ perspective: '1000px', marginBottom: '1rem', minHeight: 230 }}>
        <div onClick={handleFlip} style={{
          minHeight: 230, position: 'relative',
          transformStyle: 'preserve-3d',
          transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s ease', cursor: 'pointer'
        }}>
          {/* Front */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            borderRadius: 18, border: `2px solid ${isMastered ? 'var(--success)' : 'var(--border-strong)'}`,
            background: 'var(--bg-card)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '1.5rem', transition: 'border-color 0.3s'
          }}>
            <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.65rem', letterSpacing: '0.06em' }}>
              TERM / CONCEPT
            </span>
            {card?.subtopic && <p style={{ fontSize: '0.75rem', color: 'var(--brand-400)', marginBottom: 12 }}>{card.subtopic}</p>}
            <p style={{ fontSize: '1.05rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.6, color: 'var(--text-primary)' }}>{card?.front}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 20 }}>Tap to reveal answer</p>
          </div>

          {/* Back */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)', borderRadius: 18,
            border: `2px solid ${isMastered ? 'var(--success)' : 'var(--brand-500)'}`,
            background: isMastered ? 'rgba(34,197,94,0.06)' : 'rgba(79,110,247,0.06)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
          }}>
            <span className="badge" style={{ background: 'rgba(79,110,247,0.15)', color: 'var(--brand-400)', marginBottom: 16, fontSize: '0.65rem', letterSpacing: '0.06em' }}>
              ANSWER
            </span>
            <p style={{ fontSize: '1rem', textAlign: 'center', lineHeight: 1.7, color: 'var(--text-primary)' }}>{card?.back}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 20 }}>Tap to flip back</p>
          </div>
        </div>
      </div>

      {/* Action buttons row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        {/* TTS button */}
        <button onClick={speak} aria-label={speaking ? 'Stop speaking' : 'Read card aloud'} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          flex: 1, padding: '0.65rem',
          borderRadius: 12, border: `1px solid ${speaking ? 'var(--brand-500)' : 'var(--border-strong)'}`,
          background: speaking ? 'rgba(79,110,247,0.1)' : 'transparent',
          color: speaking ? 'var(--brand-400)' : 'var(--text-secondary)',
          fontWeight: 500, fontSize: '0.85rem', transition: 'all 0.2s'
        }}>
          {speaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
          {speaking ? 'Stop' : 'Read Aloud'}
        </button>

        {/* Mastered button */}
        {card && (
          <button onClick={() => markMastered(card.id)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            flex: 1, padding: '0.65rem',
            borderRadius: 12, border: `1px solid ${isMastered ? 'var(--success)' : 'var(--border-strong)'}`,
            background: isMastered ? 'rgba(34,197,94,0.1)' : 'transparent',
            color: isMastered ? 'var(--success)' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s'
          }}>
            <Star size={15} fill={isMastered ? 'currentColor' : 'none'} />
            {isMastered ? 'Mastered ✓' : 'Mark Mastered'}
          </button>
        )}
      </div>

      {/* Prev / Next */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem' }}>
        <button className="btn-secondary" onClick={prevCard} aria-label="Previous card"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <ChevronLeft size={16} /> Prev
        </button>
        <button className="btn-primary" onClick={nextCard} aria-label="Next card"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Card grid */}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Jump to card</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
        {cards.map((c, i) => {
          const isActive = i === currentCardIndex
          const isMast = masteredCards.has(c.id)
          return (
            <button key={i} onClick={() => goToCard(i)} aria-label={`Go to card ${i + 1}`} style={{
              aspectRatio: '1', borderRadius: 8, border: 'none', fontSize: '0.75rem', fontWeight: 600,
              background: isActive ? 'var(--brand-500)' : isMast ? 'rgba(34,197,94,0.15)' : 'var(--bg-secondary)',
              color: isActive ? 'white' : isMast ? 'var(--success)' : 'var(--text-secondary)',
              outline: isActive ? '2px solid var(--brand-400)' : 'none', transition: 'all 0.15s'
            }}>{i + 1}</button>
          )
        })}
      </div>
    </div>
  )
}
