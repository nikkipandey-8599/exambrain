import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Zap, Star, Shield, Smartphone, Wifi, CheckCircle, ChevronDown } from 'lucide-react'

function useInView(threshold = 0.15) {
  const ref = useRef()
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, inView] = useInView()
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      ...style
    }}>{children}</div>
  )
}

const FEATURES = [
  { icon: '📝', title: '10 AI MCQs', desc: 'Difficulty-tagged questions with 4 plausible options, correct answers and detailed explanations.', color: '#4f6ef7' },
  { icon: '✍️', title: 'AI-Graded Short Answers', desc: 'Write your answer, get a 0–100 score with specific feedback and missed key points.', color: '#22c55e' },
  { icon: '🃏', title: '12 Smart Flashcards', desc: '3D flip animation, text-to-speech, mastery tracking and shuffle mode.', color: '#f59e0b' },
  { icon: '📊', title: 'Score Report + PDF', desc: 'Topic breakdown, weak area alerts, smart study suggestions and one-tap PDF export.', color: '#ef4444' },
  { icon: '🔥', title: 'Streak & Badges', desc: 'Daily study streak, GitHub-style activity heatmap, 6 unlockable achievement badges.', color: '#f59e0b' },
  { icon: '📱', title: 'Installs on Phone', desc: 'PWA — add to home screen on Android or iOS. Works fully offline after first visit.', color: '#22c55e' },
]

const STEPS = [
  { num: '01', title: 'Paste your notes', desc: 'Copy-paste lecture notes, textbook sections or study material. Supports .txt and .md uploads too.', color: '#4f6ef7' },
  { num: '02', title: 'AI generates in seconds', desc: 'Groq LLaMA 3.3 70B analyses your content and creates a complete exam toolkit tailored to your notes.', color: '#22c55e' },
  { num: '03', title: 'Study, quiz, repeat', desc: 'Take the quiz, flip flashcards, review your weak topics, and track your progress over time.', color: '#f59e0b' },
]

const FAQS = [
  { q: 'Is ExamBrain free?', a: 'Yes, completely free. No signup, no credit card, no limits. Just paste your notes and go.' },
  { q: 'What subjects does it work for?', a: 'Any subject — history, science, law, medicine, engineering, languages. If you have notes, ExamBrain can generate a quiz from them.' },
  { q: 'How is this different from Quizlet or Anki?', a: 'ExamBrain generates questions from YOUR notes automatically — no manual card creation. It also grades your written answers with AI and tells you exactly what to study next.' },
  { q: 'Does it work offline?', a: 'Yes. After your first visit, the app works fully offline using a service worker. Your sessions are saved locally in IndexedDB.' },
  { q: 'Can I install it on my phone?', a: 'Yes. Open exambrain.vercel.app in Chrome on Android → tap "Add to Home Screen". On iOS, open in Safari → Share → Add to Home Screen.' },
  { q: 'What AI model does it use?', a: 'Groq\'s LLaMA 3.3 70B — one of the fastest and most capable open-source models. The free tier supports 14,400 requests per day.' },
]

export default function Landing({ onEnterApp }) {
  const [openFaq, setOpenFaq] = useState(null)

  // Smooth scroll to section
  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ background: '#020617', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 1.5rem', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 1100, margin: '0 auto', width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#4f6ef7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🧠</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>ExamBrain</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => scrollTo('features')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.875rem', cursor: 'pointer', padding: '0.4rem 0.6rem', display: 'none' }}>Features</button>
          <button onClick={onEnterApp} style={{
            background: '#4f6ef7', color: 'white', border: 'none',
            borderRadius: 10, padding: '0.5rem 1.1rem',
            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(79,110,247,0.4)',
            transition: 'all 0.2s'
          }}>
            Try Free →
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* ── HERO ── */}
        <section style={{ paddingTop: '5rem', paddingBottom: '4rem', textAlign: 'center' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.25)', borderRadius: 99, padding: '0.35rem 1rem', marginBottom: '1.75rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Free · No signup · Works offline</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.25rem', maxWidth: 800, margin: '0 auto 1.25rem' }}>
            Turn your notes into{' '}
            <span style={{ background: 'linear-gradient(135deg, #4f6ef7, #818cf8, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              AI-powered exam prep
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 2.5rem' }}>
            Paste your lecture notes → get 10 MCQs, 5 short answers, 12 flashcards and a full score report in seconds. Completely free.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <button onClick={onEnterApp} style={{
              background: 'linear-gradient(135deg, #4f6ef7, #6366f1)',
              color: 'white', border: 'none', borderRadius: 14,
              padding: '0.9rem 2rem', fontWeight: 700, fontSize: '1rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 32px rgba(79,110,247,0.4)', transition: 'all 0.2s'
            }}>
              <Zap size={18} /> Start for Free
            </button>
            <button onClick={() => scrollTo('how-it-works')} style={{
              background: 'transparent', color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14,
              padding: '0.9rem 2rem', fontWeight: 600, fontSize: '1rem',
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              See how it works
            </button>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {[['🆓 Free forever', '#22c55e'], ['📱 Works on phone', '#4f6ef7'], ['⚡ Results in seconds', '#f59e0b'], ['🔒 No signup needed', '#94a3b8']].map(([t, c]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#94a3b8' }}>
                <span style={{ color: c }}>{t.split(' ')[0]}</span>
                <span>{t.split(' ').slice(1).join(' ')}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── MOCK APP PREVIEW ── */}
        <FadeIn>
          <section style={{ marginBottom: '5rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(79,110,247,0.15), rgba(34,197,94,0.08))',
              border: '1px solid rgba(79,110,247,0.2)',
              borderRadius: 28, padding: '2.5rem 2rem',
              maxWidth: 480, width: '100%', position: 'relative'
            }}>
              {/* App header mock */}
              <div style={{ background: '#0f172a', borderRadius: 14, padding: '0.75rem 1rem', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#4f6ef7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🧠</div>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>ExamBrain</p>
                    <p style={{ fontSize: '0.65rem', color: '#64748b', margin: 0 }}>Artificial Intelligence</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>Online</span>
                </div>
              </div>
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                {[['10', 'MCQs', '#4f6ef7'], ['5', 'Short Ans', '#22c55e'], ['12', 'Cards', '#f59e0b']].map(([n, l, c]) => (
                  <div key={l} style={{ background: '#0f172a', borderRadius: 10, padding: '0.75rem 0.5rem', textAlign: 'center', borderTop: `3px solid ${c}` }}>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: c, margin: 0 }}>{n}</p>
                    <p style={{ fontSize: '0.65rem', color: '#64748b', margin: 0 }}>{l}</p>
                  </div>
                ))}
              </div>
              {/* Score card */}
              <div style={{ background: '#0f172a', borderRadius: 14, padding: '1.25rem', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', margin: 0 }}>Quiz Score</p>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(34,197,94,0.12)', color: '#22c55e', padding: '2px 10px', borderRadius: 99, fontWeight: 600 }}>Excellent!</span>
                </div>
                <p style={{ fontSize: '3rem', fontWeight: 900, color: '#22c55e', margin: '0 0 8px' }}>87%</p>
                <div style={{ height: 6, background: '#1e293b', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '87%', background: 'linear-gradient(90deg,#22c55e,#4ade80)', borderRadius: 99 }} />
                </div>
              </div>
              {/* Topic bars */}
              {[['Causes of Revolution', 92, '#22c55e'], ['Key Figures', 76, '#4f6ef7'], ['Reign of Terror', 58, '#f59e0b']].map(([t, p, c]) => (
                <div key={t} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{t}</span>
                    <span style={{ fontSize: '0.78rem', color: c, fontWeight: 600 }}>{p}%</span>
                  </div>
                  <div style={{ height: 5, background: '#1e293b', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p}%`, background: c, borderRadius: 99, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" style={{ paddingBottom: '5rem' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4f6ef7', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>How it works</p>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>Three steps to exam ready</h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>No setup, no account, no friction. Paste and go.</p>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {STEPS.map((s, i) => (
              <FadeIn key={s.num} delay={i * 100}>
                <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 20, padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                  <span style={{ fontSize: '3rem', fontWeight: 900, color: s.color, opacity: 0.15, position: 'absolute', top: 16, right: 20 }}>{s.num}</span>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>
                    {['📄','⚡','🎯'][i]}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, color: '#f1f5f9' }}>{s.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" style={{ paddingBottom: '5rem' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#22c55e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Features</p>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>Everything you need to ace exams</h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>Built for students who actually want to learn, not just memorise.</p>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 60}>
                <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 18, padding: '1.5rem', transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + '66'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.transform = 'translateY(0)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.85rem' }}>{f.icon}</div>
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6, color: '#f1f5f9' }}>{f.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <FadeIn>
          <section style={{ marginBottom: '5rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(79,110,247,0.12), rgba(34,197,94,0.08))',
              border: '1px solid rgba(79,110,247,0.2)',
              borderRadius: 24, padding: '3rem 2rem',
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, textAlign: 'center'
            }}>
              {[['Free', 'Always, no hidden costs', '#22c55e'], ['0s', 'Signup time needed', '#4f6ef7'], ['27', 'Features built', '#f59e0b'], ['100%', 'Works offline', '#ef4444']].map(([n, l, c]) => (
                <div key={n}>
                  <p style={{ fontSize: '2.5rem', fontWeight: 900, color: c, marginBottom: 6 }}>{n}</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{l}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* ── FAQ ── */}
        <section style={{ paddingBottom: '5rem' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>FAQ</p>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>Common questions</h2>
            </div>
          </FadeIn>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((faq, i) => (
              <FadeIn key={i} delay={i * 50}>
                <div style={{ background: '#0f172a', border: '1px solid', borderColor: openFaq === i ? 'rgba(79,110,247,0.4)' : '#1e293b', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem 1.25rem', background: 'none', border: 'none', color: '#f1f5f9',
                    fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', gap: 12
                  }}>
                    <span>{faq.q}</span>
                    <ChevronDown size={16} color="#64748b" style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 1.25rem 1.1rem' }}>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <FadeIn>
          <section style={{ marginBottom: '5rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
              border: '1px solid rgba(79,110,247,0.3)',
              borderRadius: 28, padding: '3.5rem 2rem', textAlign: 'center',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(79,110,247,0.08)', top: -100, right: -80 }} />
              <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(34,197,94,0.06)', bottom: -80, left: -60 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>
                  Ready to study smarter?
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem', maxWidth: 420, margin: '0 auto 2rem' }}>
                  Join students who are already using ExamBrain to prepare faster and score higher.
                </p>
                <button onClick={onEnterApp} style={{
                  background: 'linear-gradient(135deg, #4f6ef7, #6366f1)',
                  color: 'white', border: 'none', borderRadius: 14,
                  padding: '1rem 2.5rem', fontWeight: 700, fontSize: '1.05rem',
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 8px 32px rgba(79,110,247,0.4)', transition: 'all 0.2s'
                }}>
                  Start for Free <ArrowRight size={18} />
                </button>
                <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: 14 }}>No signup · No credit card · Free forever</p>
              </div>
            </div>
          </section>
        </FadeIn>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.1rem' }}>🧠</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>ExamBrain</span>
          </div>
       {/* Product Hunt Badge - ADDED HERE */}
          <a href="https://www.producthunt.com/products/exambrain?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-exambrain" target="_blank" rel="noopener noreferrer"><img alt="ExamBrain - Turn your notes into quizzes &amp; flashcards with AI | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1156388&amp;theme=neutral&amp;t=1779861592409"></a>
          <p style={{ color: '#475569', fontSize: '0.82rem' }}>
            Built by <a href="https://github.com/nikkipandey-8599" style={{ color: '#4f6ef7', textDecoration: 'none' }}>Nikki Pandey</a> · MIT License · Free forever
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {[['GitHub', 'https://github.com/nikkipandey-8599/exambrain'], ['Try App', '#']].map(([l, h]) => (
              <a key={l} href={h} onClick={l === 'Try App' ? (e) => { e.preventDefault(); onEnterApp() } : undefined}
                style={{ color: '#64748b', fontSize: '0.82rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color='#f1f5f9'}
                onMouseLeave={e => e.target.style.color='#64748b'}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
