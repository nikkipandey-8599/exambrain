import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Check, X, ChevronDown, ChevronUp, Timer } from 'lucide-react'
import useExamStore from '../store/examStore'
import { gradeShortAnswer } from '../services/gemini'
import { DIFFICULTY } from '../utils/constants'

const TIMER_SECONDS = 30

function DiffBadge({ d }) {
  const cfg = DIFFICULTY[d] || DIFFICULTY.medium
  return <span className="badge" style={{ background: cfg.bg, color: cfg.color, fontSize: '0.7rem' }}>{cfg.label}</span>
}

function TimerRing({ seconds, total }) {
  const pct = seconds / total
  const radius = 18
  const circ = 2 * Math.PI * radius
  const isUrgent = seconds <= 10
  const color = isUrgent ? 'var(--danger)' : seconds <= 20 ? 'var(--warning)' : 'var(--success)'
  return (
    <div className={isUrgent ? 'animate-timerPulse' : ''} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <svg width={44} height={44} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={22} cy={22} r={radius} fill="none" stroke="var(--bg-secondary)" strokeWidth={3} />
        <circle cx={22} cy={22} r={radius} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }} />
      </svg>
      <span style={{
        fontSize: '1rem', fontWeight: 700, color,
        position: 'absolute', width: 44, textAlign: 'center', marginLeft: -44
      }}>{seconds}</span>
    </div>
  )
}

// ─── MCQ ────────────────────────────────────────────────────────────────────
function MCQQuestion({ q, pendingSelect, submittedAnswer, onSelect, onSubmit, timedMode, onTimeUp }) {
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const timerRef = useRef()
  const submitted = !!submittedAnswer

  // Reset explanation when question changes
  useEffect(() => { setShowExplanation(false) }, [q.id])

  // Timer
  useEffect(() => {
    if (!timedMode || submitted) return
    setTimeLeft(TIMER_SECONDS)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); onTimeUp(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [q.id, timedMode])

  useEffect(() => {
    if (submitted) clearInterval(timerRef.current)
  }, [submitted])

  return (
    <div className="animate-slideUp">
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <DiffBadge d={q.difficulty} />
          <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{q.subtopic}</span>
        </div>
        {timedMode && !submitted && (
          <div style={{ position: 'relative', width: 44, height: 44 }}>
            <TimerRing seconds={timeLeft} total={TIMER_SECONDS} />
          </div>
        )}
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.55, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
        {q.question}
      </h2>

      {q.options.map(opt => {
        let bg = 'var(--bg-card)', border = 'var(--border-strong)', color = 'var(--text-primary)'
        if (submitted) {
          if (opt === q.answer) { bg = 'rgba(34,197,94,0.1)'; border = 'var(--success)'; color = 'var(--success)' }
          else if (opt === submittedAnswer.selected) { bg = 'rgba(239,68,68,0.1)'; border = 'var(--danger)'; color = 'var(--danger)' }
          else { color = 'var(--text-muted)'; border = 'var(--border)' }
        } else if (opt === pendingSelect) {
          bg = 'rgba(79,110,247,0.1)'; border = 'var(--brand-500)'
        }
        return (
          <div key={opt} onClick={() => !submitted && onSelect(opt)} style={{
            padding: '0.85rem 1rem', borderRadius: 12,
            border: `1px solid ${border}`, background: bg, color,
            marginBottom: 8, cursor: submitted ? 'default' : 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            transition: 'all 0.2s', userSelect: 'none'
          }}>
            <span style={{ fontSize: '0.9rem' }}>{opt}</span>
            {submitted && opt === q.answer && <Check size={16} color="var(--success)" />}
            {submitted && opt === submittedAnswer.selected && opt !== q.answer && <X size={16} color="var(--danger)" />}
          </div>
        )
      })}

      {/* Submit button — only shows after selecting, before submitting */}
      {pendingSelect && !submitted && (
        <button className="btn-primary" onClick={onSubmit} style={{ marginTop: 4 }}>
          Submit Answer
        </button>
      )}

      {/* Result banner */}
      {submitted && (
        <div style={{
          background: submittedAnswer.isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${submittedAnswer.isCorrect ? 'var(--success)' : 'var(--danger)'}`,
          borderRadius: 12, padding: '0.75rem 1rem', marginTop: 8
        }}>
          <p style={{ fontWeight: 600, color: submittedAnswer.isCorrect ? 'var(--success)' : 'var(--danger)', fontSize: '0.9rem', marginBottom: 4 }}>
            {submittedAnswer.isCorrect ? '✅ Correct!' : `❌ Incorrect. Answer: ${q.answer}`}
          </p>
          <button onClick={() => setShowExplanation(s => !s)} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem',
            display: 'flex', alignItems: 'center', gap: 4, padding: 0, cursor: 'pointer'
          }}>
            {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showExplanation ? 'Hide' : 'Show'} explanation
          </button>
          {showExplanation && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
              {q.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Short Answer ─────────────────────────────────────────────────────────
// KEY FIX: key={q.id} on this component forces full remount on question change
// so text state always resets to '' automatically
function ShortQuestion({ q, submittedAnswer, onGrade }) {
  const [text, setText] = useState('')
  const [grading, setGrading] = useState(false)
  const [gradingError, setGradingError] = useState(false)
  const submitted = !!submittedAnswer

  async function handleSubmit() {
    if (!text.trim()) return
    if (text.trim().length < 10) {
      onGrade({ id: q.id, type: 'short', score: 10, isCorrect: false, feedback: 'Answer too short — write at least a sentence.', missedPoints: q.keyPoints, userAnswer: text, subtopic: q.subtopic })
      return
    }
    setGrading(true)
    setGradingError(false)
    try {
      const result = await gradeShortAnswer(q.question, q.modelAnswer, q.keyPoints, text)
      onGrade({ id: q.id, type: 'short', ...result, userAnswer: text, subtopic: q.subtopic })
    } catch {
      setGradingError(true)
    } finally {
      setGrading(false)
    }
  }

  return (
    <div className="animate-slideUp">
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <DiffBadge d={q.difficulty} />
        <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{q.subtopic}</span>
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.55, marginBottom: '1rem', color: 'var(--text-primary)' }}>
        {q.question}
      </h2>

      <textarea
        className="input-field"
        rows={5}
        value={submitted ? submittedAnswer.userAnswer : text}
        onChange={e => { if (!submitted && !grading) setText(e.target.value) }}
        disabled={submitted || grading}
        placeholder="Type your answer here…"
      />

      {gradingError && (
        <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 6 }}>
          Grading failed. Please try again.
        </p>
      )}

      {!submitted && (
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!text.trim() || grading}
          style={{ marginTop: 10 }}
        >
          {grading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span className="animate-spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
              AI Grading…
            </span>
          ) : 'Submit Answer'}
        </button>
      )}

      {submitted && (
        <div style={{ marginTop: 12 }}>
          {/* Score card */}
          <div style={{
            background: submittedAnswer.score >= 70 ? 'rgba(34,197,94,0.1)' : submittedAnswer.score >= 40 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${submittedAnswer.score >= 70 ? 'var(--success)' : submittedAnswer.score >= 40 ? 'var(--warning)' : 'var(--danger)'}`,
            borderRadius: 12, padding: '0.85rem 1rem', marginBottom: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>⭐ {submittedAnswer.score}/100</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: submittedAnswer.score >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                {submittedAnswer.score >= 70 ? 'Good Answer!' : 'Partially Correct'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {submittedAnswer.feedback}
            </p>
          </div>

          {/* Missed points */}
          {submittedAnswer.missedPoints?.length > 0 && (
            <div className="card" style={{ marginBottom: 10 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--warning)', marginBottom: 8 }}>Missed key points:</p>
              {submittedAnswer.missedPoints.map((p, i) => (
                <p key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>• {p}</p>
              ))}
            </div>
          )}

          {/* Model answer */}
          <div className="card">
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand-400)', marginBottom: 8 }}>Model Answer:</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{q.modelAnswer}</p>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Key Points:</p>
            {q.keyPoints.map((kp, i) => (
              <p key={i} style={{ fontSize: '0.8rem', color: 'var(--success)', marginBottom: 3 }}>✓ {kp}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Quiz Page ───────────────────────────────────────────────────────
export default function Quiz() {
  const {
    examContent, quizMode, setQuizMode,
    currentQuestionIndex, answers, setAnswer,
    nextQuestion, prevQuestion, goToQuestion,
    quizComplete, resetQuiz
  } = useExamStore()

  const [pendingSelect, setPendingSelect] = useState(null)
  const [timedMode, setTimedMode] = useState(false)

  // Clear pendingSelect whenever question changes
  useEffect(() => { setPendingSelect(null) }, [currentQuestionIndex, quizMode])

  const handleTimeUp = useCallback(() => {
    const questions = quizMode === 'mcq' ? examContent?.quiz : examContent?.shortAnswer
    const q = questions?.[currentQuestionIndex]
    if (!q) return
    setAnswer({ id: q.id, type: 'mcq', selected: null, isCorrect: false, subtopic: q.subtopic, timedOut: true })
  }, [currentQuestionIndex, quizMode, examContent, setAnswer])

  if (!examContent) return (
    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <p>Upload notes first to start a quiz.</p>
    </div>
  )

  const questions = quizMode === 'mcq' ? examContent.quiz : examContent.shortAnswer
  const total = questions?.length || 0
  const q = questions?.[currentQuestionIndex]
  const currentAnswer = answers.find(a => a.id === q?.id)
  const correctCount = answers.filter(a => a.type === 'mcq' && a.isCorrect).length

  // Next button: for MCQ need submitted answer OR pending; for short need submitted
  const canGoNext = quizMode === 'mcq'
    ? !!(currentAnswer || pendingSelect)
    : !!currentAnswer

  if (quizComplete) {
    const mcqPct = Math.round((correctCount / (examContent.quiz?.length || 1)) * 100)
    const shortDone = answers.filter(a => a.type === 'short').length
    return (
      <div className="page animate-slideUp" style={{ padding: '3rem 1.25rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 8, color: 'var(--text-primary)' }}>Quiz Complete!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>MCQ: {mcqPct}% · {shortDone} short answers graded</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: '0 auto' }}>
          <button className="btn-primary" onClick={resetQuiz}>Retake Quiz</button>
          <button className="btn-secondary" style={{ width: '100%' }} onClick={resetQuiz}>Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page animate-fadeIn" style={{ padding: '1.25rem' }}>

      {/* Mode toggle */}
      <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 12, padding: 4, marginBottom: '1rem', border: '1px solid var(--border)' }}>
        {[['mcq', `MCQ (${examContent.quiz?.length})`], ['short', `Short (${examContent.shortAnswer?.length})`]].map(([m, l]) => (
          <button key={m} onClick={() => setQuizMode(m)} style={{
            flex: 1, padding: '0.5rem', borderRadius: 9, border: 'none', fontSize: '0.8rem', fontWeight: 600,
            background: quizMode === m ? 'var(--brand-500)' : 'transparent',
            color: quizMode === m ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.2s', cursor: 'pointer'
          }}>{l}</button>
        ))}
      </div>

      {/* Timed mode toggle — MCQ only */}
      {quizMode === 'mcq' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1rem', padding: '0.65rem 1rem',
          background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Timer size={15} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>Timed Mode</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>30s per question</span>
          </div>
          <button
            onClick={() => setTimedMode(t => !t)}
            aria-label="Toggle timed mode"
            style={{
              width: 44, height: 26, borderRadius: 99, border: 'none',
              background: timedMode ? 'var(--brand-500)' : 'var(--border-strong)',
              position: 'relative', transition: 'background 0.25s', cursor: 'pointer'
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: 'white',
              position: 'absolute', top: 3,
              left: timedMode ? 21 : 3, transition: 'left 0.25s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }} />
          </button>
        </div>
      )}

      {/* Progress bar + dots */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Question {currentQuestionIndex + 1} of {total}
          </span>
          {quizMode === 'mcq' && (
            <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>✓ {correctCount} correct</span>
          )}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentQuestionIndex + 1) / total) * 100}%`, background: 'var(--brand-500)' }} />
        </div>
        {/* Answer dots */}
        <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
          {questions.map((qq, i) => {
            const a = answers.find(ans => ans.id === qq?.id)
            let bg = 'var(--border-strong)'
            if (i === currentQuestionIndex) bg = 'var(--brand-500)'
            else if (a) bg = a.isCorrect ? 'var(--success)' : 'var(--danger)'
            return (
              <div
                key={i}
                onClick={() => goToQuestion(i)}
                title={`Question ${i + 1}`}
                style={{
                  width: i === currentQuestionIndex ? 14 : 10,
                  height: i === currentQuestionIndex ? 14 : 10,
                  borderRadius: '50%', background: bg,
                  cursor: 'pointer', transition: 'all 0.2s',
                  flexShrink: 0
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Question — key=q.id forces full remount on question change, fixing all stale state bugs */}
      {quizMode === 'mcq' ? (
        <MCQQuestion
          key={q?.id}
          q={q}
          pendingSelect={pendingSelect}
          submittedAnswer={currentAnswer}
          onSelect={setPendingSelect}
          timedMode={timedMode}
          onTimeUp={handleTimeUp}
          onSubmit={() => {
            if (!pendingSelect) return
            setAnswer({
              id: q.id, type: 'mcq',
              selected: pendingSelect,
              isCorrect: pendingSelect === q.answer,
              subtopic: q.subtopic
            })
            setPendingSelect(null)
          }}
        />
      ) : (
        // key=q.id resets ShortQuestion text state automatically on every question change
        <ShortQuestion
          key={q?.id}
          q={q}
          submittedAnswer={currentAnswer}
          onGrade={result => setAnswer(result)}
        />
      )}

      {/* Navigation — always visible, extra bottom margin so it clears the bottom nav */}
      <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem', marginBottom: '1rem' }}>
        <button
          className="btn-secondary"
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            if (quizMode === 'mcq' && pendingSelect && !currentAnswer) {
              setAnswer({ id: q.id, type: 'mcq', selected: pendingSelect, isCorrect: pendingSelect === q.answer, subtopic: q.subtopic })
              setPendingSelect(null)
            }
            nextQuestion()
          }}
          disabled={!canGoNext}
          style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          {currentQuestionIndex === total - 1 ? 'Finish' : 'Next'} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}