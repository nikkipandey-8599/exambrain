import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Check, X, ChevronDown, ChevronUp, Timer } from 'lucide-react'
import useExamStore from '../store/examStore'
import { gradeShortAnswer } from '../services/gemini'
import { DIFFICULTY } from '../utils/constants'
import HintButton from '../components/HintButton'
import EmptyState from '../components/EmptyState'
import { useKeyboard } from '../hooks/useKeyboard'
import { haptic } from '../utils/haptics'
import { showToast } from '../components/Toast'

const TIMER_SECONDS = 30

function DiffBadge({ d }) {
  const cfg = DIFFICULTY[d] || DIFFICULTY.medium
  return <span className="badge" style={{ background: cfg.bg, color: cfg.color, fontSize: '0.7rem' }}>{cfg.label}</span>
}

function TimerRing({ seconds, total }) {
  const pct = seconds / total
  const r = 18, circ = 2 * Math.PI * r
  const isUrgent = seconds <= 10
  const color = isUrgent ? 'var(--danger)' : seconds <= 20 ? 'var(--warning)' : 'var(--success)'
  return (
    <div className={isUrgent ? 'animate-timerPulse' : ''} style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={44} height={44} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        <circle cx={22} cy={22} r={r} fill="none" stroke="var(--bg-secondary)" strokeWidth={3} />
        <circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }} />
      </svg>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color, zIndex: 1 }}>{seconds}</span>
    </div>
  )
}

function MCQQuestion({ q, pendingSelect, submittedAnswer, onSelect, onSubmit, timedMode, onTimeUp }) {
  const [showExplanation, setShowExplanation] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const timerRef = useRef()
  const submitted = !!submittedAnswer

  useEffect(() => { setShowExplanation(false); setHintUsed(false) }, [q.id])

  useEffect(() => {
    if (!timedMode || submitted) return
    setTimeLeft(TIMER_SECONDS)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); onTimeUp(); return 0 } return t - 1 })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [q.id, timedMode])

  useEffect(() => { if (submitted) clearInterval(timerRef.current) }, [submitted])

  // Keyboard: 1-4 to select option
  useKeyboard(submitted ? {} : {
    '1': () => !submitted && onSelect(q.options[0]),
    '2': () => !submitted && onSelect(q.options[1]),
    '3': () => !submitted && onSelect(q.options[2]),
    '4': () => !submitted && onSelect(q.options[3]),
    'Enter': () => { if (pendingSelect && !submitted) onSubmit() }
  })

  return (
    <div className="animate-slideUp">
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <DiffBadge d={q.difficulty} />
          <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{q.subtopic}</span>
        </div>
        {timedMode && !submitted && <TimerRing seconds={timeLeft} total={TIMER_SECONDS} />}
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.6, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
        {q.question}
      </h2>

      {q.options.map((opt, idx) => {
        let bg = 'var(--bg-card)', border = 'var(--border-strong)', color = 'var(--text-primary)'
        if (submitted) {
          if (opt === q.answer) { bg = 'rgba(34,197,94,0.1)'; border = 'var(--success)'; color = 'var(--success)' }
          else if (opt === submittedAnswer.selected) { bg = 'rgba(239,68,68,0.1)'; border = 'var(--danger)'; color = 'var(--danger)' }
          else { color = 'var(--text-muted)'; border = 'var(--border)' }
        } else if (opt === pendingSelect) { bg = 'rgba(79,110,247,0.1)'; border = 'var(--brand-500)' }

        return (
          <div key={opt} className="mcq-option" onClick={() => { if (!submitted) { onSelect(opt); haptic('light') } }} style={{
            padding: '0.85rem 1rem', borderRadius: 12,
            border: `1px solid ${border}`, background: bg, color,
            marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)', userSelect: 'none'
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: 16 }}>{idx+1}</span>
              <span style={{ fontSize: '0.9rem' }}>{opt}</span>
            </div>
            {submitted && opt === q.answer && <Check size={16} color="var(--success)" />}
            {submitted && opt === submittedAnswer.selected && opt !== q.answer && <X size={16} color="var(--danger)" />}
          </div>
        )
      })}

      {!submitted && <HintButton question={q.question} options={q.options} answer={q.answer} onHintUsed={() => setHintUsed(true)} />}

      {pendingSelect && !submitted && (
        <button className="btn-primary" onClick={onSubmit} style={{ marginTop: 12 }}>
          Submit Answer {hintUsed && <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>(assisted)</span>}
        </button>
      )}

      {submitted && (
        <div style={{
          background: submittedAnswer.isCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${submittedAnswer.isCorrect ? 'var(--success)' : 'var(--danger)'}`,
          borderRadius: 12, padding: '0.85rem 1rem', marginTop: 10
        }}>
          <p style={{ fontWeight: 600, color: submittedAnswer.isCorrect ? 'var(--success)' : 'var(--danger)', fontSize: '0.9rem', marginBottom: 4 }}>
            {submittedAnswer.isCorrect ? '✅ Correct!' : `❌ Answer: ${q.answer}`}
          </p>
          <button onClick={() => setShowExplanation(s => !s)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, padding: 0, cursor: 'pointer' }}>
            {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showExplanation ? 'Hide' : 'Show'} explanation
          </button>
          {showExplanation && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>{q.explanation}</p>}
        </div>
      )}
    </div>
  )
}

function ShortQuestion({ q, submittedAnswer, onGrade }) {
  const [text, setText] = useState('')
  const [grading, setGrading] = useState(false)
  const [gradingError, setGradingError] = useState(false)
  const submitted = !!submittedAnswer

  async function handleSubmit() {
    if (!text.trim()) return
    if (text.trim().length < 10) {
      onGrade({ id: q.id, type: 'short', score: 10, isCorrect: false, feedback: 'Answer too short.', missedPoints: q.keyPoints, userAnswer: text, subtopic: q.subtopic })
      return
    }
    setGrading(true); setGradingError(false)
    try {
      const result = await gradeShortAnswer(q.question, q.modelAnswer, q.keyPoints, text)
      onGrade({ id: q.id, type: 'short', ...result, userAnswer: text, subtopic: q.subtopic })
      haptic(result.isCorrect ? 'success' : 'error')
    } catch { setGradingError(true); showToast.error('Grading failed — try again') }
    finally { setGrading(false) }
  }

  return (
    <div className="animate-slideUp">
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <DiffBadge d={q.difficulty} />
        <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{q.subtopic}</span>
      </div>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.6, marginBottom: '1rem', color: 'var(--text-primary)' }}>{q.question}</h2>
      <textarea className="input-field" rows={5}
        value={submitted ? submittedAnswer.userAnswer : text}
        onChange={e => { if (!submitted && !grading) setText(e.target.value) }}
        disabled={submitted || grading}
        placeholder="Type your answer here…" />
      {!submitted && (
        <button className="btn-primary" onClick={handleSubmit} disabled={!text.trim() || grading} style={{ marginTop: 10 }}>
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
          <div style={{
            background: submittedAnswer.score >= 70 ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
            border: `1px solid ${submittedAnswer.score >= 70 ? 'var(--success)' : 'var(--warning)'}`,
            borderRadius: 12, padding: '0.85rem 1rem', marginBottom: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>⭐ {submittedAnswer.score}/100</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: submittedAnswer.score >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                {submittedAnswer.score >= 70 ? 'Good Answer!' : 'Partially Correct'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{submittedAnswer.feedback}</p>
          </div>
          {submittedAnswer.missedPoints?.length > 0 && (
            <div className="card" style={{ marginBottom: 10 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--warning)', marginBottom: 8 }}>Missed key points:</p>
              {submittedAnswer.missedPoints.map((p,i) => <p key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>• {p}</p>)}
            </div>
          )}
          <div className="card">
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand-400)', marginBottom: 8 }}>Model Answer:</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{q.modelAnswer}</p>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Key Points:</p>
            {q.keyPoints.map((kp,i) => <p key={i} style={{ fontSize: '0.8rem', color: 'var(--success)', marginBottom: 3 }}>✓ {kp}</p>)}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Quiz({ setScreen }) {
  const { examContent, quizMode, setQuizMode, currentQuestionIndex, answers, setAnswer, nextQuestion, prevQuestion, goToQuestion, quizComplete, resetQuiz } = useExamStore()
  const [pendingSelect, setPendingSelect] = useState(null)
  const [timedMode, setTimedMode] = useState(false)

  useEffect(() => { setPendingSelect(null) }, [currentQuestionIndex, quizMode])

  const handleTimeUp = useCallback(() => {
    const questions = quizMode === 'mcq' ? examContent?.quiz : examContent?.shortAnswer
    const q = questions?.[currentQuestionIndex]
    if (!q) return
    setAnswer({ id: q.id, type: 'mcq', selected: null, isCorrect: false, subtopic: q.subtopic, timedOut: true })
    showToast.error("Time's up!")
    haptic('error')
  }, [currentQuestionIndex, quizMode, examContent, setAnswer])

  if (!examContent) return (
    <div className="page">
      <EmptyState icon="📝" title="No quiz yet" desc="Upload your notes and generate exam prep to get 10 AI-powered quiz questions." action={() => setScreen('home')} actionLabel="Upload Notes →" />
    </div>
  )

  const questions = quizMode === 'mcq' ? examContent.quiz : examContent.shortAnswer
  const total = questions?.length || 0
  const q = questions?.[currentQuestionIndex]
  const currentAnswer = answers.find(a => a.id === q?.id)
  const correctCount = answers.filter(a => a.type === 'mcq' && a.isCorrect).length
  const canGoNext = quizMode === 'mcq' ? !!(currentAnswer || pendingSelect) : !!currentAnswer

  useKeyboard({
    ArrowRight: () => { if (canGoNext) { if (quizMode==='mcq' && pendingSelect && !currentAnswer) { setAnswer({id:q.id,type:'mcq',selected:pendingSelect,isCorrect:pendingSelect===q.answer,subtopic:q.subtopic}); setPendingSelect(null) } nextQuestion(); haptic('light') } },
    ArrowLeft: () => { prevQuestion(); haptic('light') }
  })

  if (quizComplete) {
    const mcqPct = Math.round((correctCount/(examContent.quiz?.length||1))*100)
    const shortDone = answers.filter(a=>a.type==='short').length
    return (
      <div className="page animate-bounceIn" style={{ padding:'3rem 1.25rem', textAlign:'center' }}>
        <div style={{ fontSize:'3.5rem', marginBottom:16 }}>🎉</div>
        <h2 style={{ fontWeight:800, fontSize:'1.5rem', marginBottom:8, color:'var(--text-primary)' }}>Quiz Complete!</h2>
        <p style={{ color:'var(--text-secondary)', marginBottom:'2rem' }}>MCQ Score: {mcqPct}% · {shortDone} short answers graded</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:300, margin:'0 auto' }}>
          <button className="btn-primary" onClick={() => { setScreen('report') }}>See Full Report 📊</button>
          <button className="btn-secondary" style={{ width:'100%' }} onClick={resetQuiz}>Retake Quiz</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page animate-fadeIn" style={{ padding: '1.25rem' }}>
      {/* Mode toggle */}
      <div style={{ display:'flex', background:'var(--bg-secondary)', borderRadius:12, padding:4, marginBottom:'1rem', border:'1px solid var(--border)' }}>
        {[['mcq',`MCQ (${examContent.quiz?.length})`],['short',`Short (${examContent.shortAnswer?.length})`]].map(([m,l]) => (
          <button key={m} onClick={() => setQuizMode(m)} style={{
            flex:1, padding:'0.5rem', borderRadius:9, border:'none', fontSize:'0.8rem', fontWeight:600,
            background: quizMode===m ? 'var(--brand-500)' : 'transparent',
            color: quizMode===m ? 'white' : 'var(--text-secondary)',
            transition:'all 0.2s', cursor:'pointer'
          }}>{l}</button>
        ))}
      </div>

      {/* Timed mode */}
      {quizMode === 'mcq' && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', padding:'0.65rem 1rem', background:'var(--bg-secondary)', borderRadius:12, border:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Timer size={15} color="var(--text-secondary)" />
            <span style={{ fontSize:'0.85rem', fontWeight:500, color:'var(--text-primary)' }}>Timed Mode</span>
            <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>30s / question</span>
          </div>
          <button onClick={() => setTimedMode(t=>!t)} aria-label="Toggle timed mode" style={{
            width:44, height:26, borderRadius:99, border:'none',
            background: timedMode ? 'var(--brand-500)' : 'var(--border-strong)',
            position:'relative', transition:'background 0.25s', cursor:'pointer'
          }}>
            <div style={{ width:20, height:20, borderRadius:'50%', background:'white', position:'absolute', top:3, left: timedMode?21:3, transition:'left 0.25s', boxShadow:'0 1px 4px rgba(0,0,0,0.25)' }} />
          </button>
        </div>
      )}

      {/* Progress */}
      <div style={{ marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>Question {currentQuestionIndex+1} of {total}</span>
          {quizMode==='mcq' && <span style={{ fontSize:'0.8rem', color:'var(--success)', fontWeight:500 }}>✓ {correctCount} correct</span>}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width:`${((currentQuestionIndex+1)/total)*100}%`, background:'linear-gradient(90deg,var(--brand-500),#818cf8)' }} />
        </div>
        <div style={{ display:'flex', gap:5, marginTop:10, flexWrap:'wrap' }}>
          {questions.map((qq,i) => {
            const a = answers.find(ans => ans.id===qq?.id)
            let bg = 'var(--border-strong)'
            if (i===currentQuestionIndex) bg='var(--brand-500)'
            else if (a) bg=a.isCorrect?'var(--success)':'var(--danger)'
            return <div key={i} onClick={() => goToQuestion(i)} title={`Q${i+1}`} style={{ width:i===currentQuestionIndex?14:10, height:i===currentQuestionIndex?14:10, borderRadius:'50%', background:bg, cursor:'pointer', transition:'all 0.2s', flexShrink:0 }} />
          })}
        </div>
      </div>

      {/* Question */}
      {quizMode==='mcq' ? (
        <MCQQuestion key={q?.id} q={q} pendingSelect={pendingSelect} submittedAnswer={currentAnswer}
          onSelect={setPendingSelect} timedMode={timedMode} onTimeUp={handleTimeUp}
          onSubmit={() => { if(!pendingSelect) return; setAnswer({id:q.id,type:'mcq',selected:pendingSelect,isCorrect:pendingSelect===q.answer,subtopic:q.subtopic}); haptic(pendingSelect===q.answer?'success':'error'); setPendingSelect(null) }} />
      ) : (
        <ShortQuestion key={q?.id} q={q} submittedAnswer={currentAnswer} onGrade={r=>setAnswer(r)} />
      )}

      {/* Nav */}
      <div style={{ display:'flex', gap:10, marginTop:'1.5rem', marginBottom:'1rem' }}>
        <button className="btn-secondary" onClick={()=>{prevQuestion();haptic('light')}} disabled={currentQuestionIndex===0}
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <ChevronLeft size={16}/> Prev
        </button>
        <button className="btn-primary"
          onClick={() => { if(quizMode==='mcq' && pendingSelect && !currentAnswer){setAnswer({id:q.id,type:'mcq',selected:pendingSelect,isCorrect:pendingSelect===q.answer,subtopic:q.subtopic});setPendingSelect(null)} nextQuestion();haptic('light') }}
          disabled={!canGoNext}
          style={{ flex:2, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          {currentQuestionIndex===total-1?'Finish':'Next'} <ChevronRight size={16}/>
        </button>
      </div>

      {/* Keyboard hints */}
      <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:4 }}>
        {[['1-4','select'],['Enter','submit'],['← →','navigate']].map(([k,a]) => (
          <span key={k} style={{ fontSize:'0.68rem', color:'var(--text-muted)', display:'flex', gap:3, alignItems:'center' }}>
            <kbd style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-strong)', borderRadius:4, padding:'1px 5px', fontSize:'0.65rem', fontFamily:'monospace' }}>{k}</kbd>{a}
          </span>
        ))}
      </div>
    </div>
  )
}
