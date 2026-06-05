import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronDown, Globe } from 'lucide-react'
import { loadVanta, initBirds } from '../utils/vanta'

function useInView(threshold = 0.1) {
  const ref = useRef()
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

function FadeIn({ children, delay = 0, up = true }) {
  const [ref, inView] = useInView()
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : up ? 'translateY(22px)' : 'scale(0.97)',
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`
    }}>{children}</div>
  )
}

// Book + mortarboard SVG logo
function LogoMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="#92400E" />
      <rect x="6" y="17" width="10" height="12" rx="2" fill="#FFFDF2" opacity="0.95" />
      <rect x="20" y="17" width="10" height="12" rx="2" fill="#FFFDF2" opacity="0.95" />
      <rect x="16" y="17" width="4" height="12" fill="#6B3A0E" />
      <polygon points="18,6 28,11 18,16 8,11" fill="#FFFDF2" />
      <circle cx="28" cy="14" r="1.5" fill="#FFFDF2" opacity="0.6" />
      <line x1="28" y1="11" x2="28" y2="17" stroke="#FFFDF2" strokeWidth="1.5" opacity="0.6" />
    </svg>
  )
}

const C = {
  cream:  '#FFFDF2', cream2: '#FAF6E4', cream3: '#F3EDD0',
  border: '#E8E0C4', brown:  '#2C1F05', brownM: '#5C4A1E',
  brownL: '#8B7340', accent: '#92400E', accentL: '#B45309',
}

const T = {
  en: {
    nav: 'Open App',
    tag: 'Free · No credit card',
    h1a: 'Turn your notes into',
    h1b: 'an exam toolkit.',
    sub: 'Paste any lecture notes. Get quizzes, flashcards, and a full score report — in seconds.',
    cta: 'Get Started',
    ghost: 'See how it works',
    how_l: 'HOW IT WORKS',
    how_h: 'Three steps to exam ready.',
    how_s: 'No setup, no account, no friction.',
    steps: [
      { n: '01', t: 'Paste your notes', d: 'Any subject, any format. Lecture notes, textbook chapters, PDFs, images.' },
      { n: '02', t: 'AI builds your kit', d: 'LLaMA 3.3 70B writes 10 MCQs, 5 short answers and 12 flashcards from your content.' },
      { n: '03', t: 'Study and improve', d: 'Quiz yourself, flip cards, see exactly which topics need more work.' },
    ],
    feat_l: 'FEATURES',
    feat_h: 'Everything you need for exam prep.',
    feats: [
      { i: '◉', t: '10 MCQs', d: 'Easy, medium and hard difficulty. Full explanation after each answer.' },
      { i: '◎', t: 'Short Answers', d: 'AI grades your written answers 0–100 with specific feedback.' },
      { i: '◈', t: 'Flashcards', d: '3D flip cards with text-to-speech. Mark cards as mastered.' },
      { i: '◆', t: 'Score Report', d: 'Topic breakdown, weak area alerts. Export as PDF.' },
      { i: '◇', t: 'Streaks', d: 'Daily study streak, activity heatmap, 6 unlockable badges.' },
      { i: '◉', t: 'Works Offline', d: 'Install on any phone. Fully offline after first visit.' },
    ],
    faq_l: 'FAQ',
    faq_h: 'Common questions.',
    faqs: [
      { q: 'Is it completely free?', a: 'Yes. No signup required, no credit card, no limits ever.' },
      { q: 'Which subjects work?', a: 'Any subject — history, sciences, law, medicine, engineering, languages, commerce.' },
      { q: 'How is this different from Quizlet?', a: 'ExamBrain generates questions from your own notes automatically. No manual card creation. It also grades written answers with detailed AI feedback.' },
      { q: 'Does it work offline?', a: 'Yes. After your first visit the full app works offline. All sessions are saved on your device.' },
      { q: 'Can I install it on my phone?', a: 'Yes. On Android open in Chrome and tap Add to Home Screen. On iOS open in Safari, tap Share, then Add to Home Screen.' },
      { q: 'Is my data private?', a: 'Your notes never leave your device unless you choose to sign in for cloud sync. Even then, only you can see your data.' },
    ],
    cta2_h: 'Ready to study smarter?',
    cta2_s: 'No account needed to start.',
    cta2_b: 'Try ExamBrain Free',
  },
  hi: {
    nav: 'ऐप खोलें',
    tag: 'मुफ़्त · बिना क्रेडिट कार्ड',
    h1a: 'अपने नोट्स को बदलें',
    h1b: 'परीक्षा किट में।',
    sub: 'कोई भी नोट्स पेस्ट करें। क्विज़, फ्लैशकार्ड और स्कोर रिपोर्ट — सेकंडों में।',
    cta: 'शुरू करें',
    ghost: 'कैसे काम करता है',
    how_l: 'यह कैसे काम करता है',
    how_h: 'तीन आसान कदम।',
    how_s: 'कोई सेटअप नहीं, कोई अकाउंट नहीं।',
    steps: [
      { n: '01', t: 'नोट्स पेस्ट करें', d: 'कोई भी विषय। लेक्चर नोट्स, पाठ्यपुस्तक, PDF या तस्वीरें।' },
      { n: '02', t: 'AI किट बनाता है', d: 'LLaMA 3.3 70B तुरंत 10 MCQ, 5 लघु उत्तर और 12 फ्लैशकार्ड बनाता है।' },
      { n: '03', t: 'पढ़ें और सुधरें', d: 'क्विज़ दें, कार्ड पलटें, देखें कौन से टॉपिक कमज़ोर हैं।' },
    ],
    feat_l: 'विशेषताएं',
    feat_h: 'परीक्षा की तैयारी के लिए सब कुछ।',
    feats: [
      { i: '◉', t: '10 MCQ', d: 'आसान, मध्यम और कठिन। हर उत्तर के बाद स्पष्टीकरण।' },
      { i: '◎', t: 'लघु उत्तर', d: 'AI आपके उत्तरों को 0–100 में ग्रेड करता है।' },
      { i: '◈', t: 'फ्लैशकार्ड', d: '3D फ्लिप कार्ड, टेक्स्ट-टू-स्पीच और महारत ट्रैकिंग।' },
      { i: '◆', t: 'स्कोर रिपोर्ट', d: 'विषय विश्लेषण, कमज़ोर क्षेत्र, PDF एक्सपोर्ट।' },
      { i: '◇', t: 'स्ट्रीक', d: 'दैनिक अध्ययन स्ट्रीक और 6 उपलब्धि बैज।' },
      { i: '◉', t: 'ऑफलाइन काम करे', d: 'किसी भी फोन पर इंस्टॉल करें। पहली विज़िट के बाद ऑफलाइन।' },
    ],
    faq_l: 'सवाल-जवाब',
    faq_h: 'अक्सर पूछे जाने वाले सवाल।',
    faqs: [
      { q: 'क्या यह पूरी तरह मुफ़्त है?', a: 'हाँ। कोई साइनअप नहीं, कोई क्रेडिट कार्ड नहीं, कोई सीमा नहीं।' },
      { q: 'कौन से विषय काम करते हैं?', a: 'कोई भी — इतिहास, विज्ञान, कानून, चिकित्सा, इंजीनियरिंग, वाणिज्य।' },
      { q: 'Quizlet से कैसे अलग है?', a: 'ExamBrain आपके नोट्स से स्वचालित रूप से प्रश्न बनाता है। कोई मैन्युअल कार्ड नहीं।' },
      { q: 'क्या यह ऑफलाइन काम करता है?', a: 'हाँ। पहली विज़िट के बाद पूरी तरह ऑफलाइन।' },
      { q: 'क्या मेरा डेटा सुरक्षित है?', a: 'आपके नोट्स आपके डिवाइस पर ही रहते हैं जब तक आप साइन इन नहीं करते।' },
    ],
    cta2_h: 'स्मार्ट तरीके से पढ़ने के लिए तैयार?',
    cta2_s: 'शुरू करने के लिए अकाउंट नहीं चाहिए।',
    cta2_b: 'ExamBrain मुफ़्त आज़माएं',
  }
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left', padding: '1.1rem 0', gap: 16
      }}>
        <span style={{ fontSize: '0.97rem', fontWeight: 600, color: C.brown, fontFamily: 'Georgia, serif' }}>{q}</span>
        <ChevronDown size={15} color={C.brownL} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s' }} />
      </button>
      {open && (
        <p style={{ fontSize: '0.91rem', color: C.brownM, lineHeight: 1.75, paddingBottom: '1rem', paddingRight: 28, fontFamily: 'system-ui' }}>
          {a}
        </p>
      )}
    </div>
  )
}

export default function Landing({ onEnterApp }) {
  const [lang, setLang] = useState('en')
  const heroRef = useRef(null)
  const vantaEffect = useRef(null)
  const t = T[lang]
  const isDark = false // landing always light

  useEffect(() => {
    loadVanta().then(() => {
      if (heroRef.current && !vantaEffect.current) {
        vantaEffect.current = initBirds(heroRef.current, isDark)
      }
    }).catch(() => {})
    return () => { if (vantaEffect.current) { vantaEffect.current.destroy(); vantaEffect.current = null } }
  }, [])

  const S = { maxWidth: 860, margin: '0 auto', padding: '5rem 1.5rem' }
  const lbl = { fontSize: '0.66rem', letterSpacing: '0.16em', fontWeight: 700, color: C.brownL, textTransform: 'uppercase', marginBottom: '0.9rem', fontFamily: 'system-ui' }
  const H2 = { fontSize: 'clamp(1.9rem,5vw,2.8rem)', fontWeight: 700, color: C.brown, fontFamily: 'Georgia,serif', lineHeight: 1.1, marginBottom: '0.5rem' }
  const sub = { fontSize: '0.97rem', color: C.brownM, lineHeight: 1.75, fontFamily: 'system-ui', maxWidth: 500 }
  const hr = { border: 'none', borderTop: `1px solid ${C.border}`, margin: '0 1.5rem' }

  return (
    <div style={{ background: C.cream, color: C.brown, fontFamily: 'Georgia,serif', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 1.75rem', borderBottom: `1px solid ${C.border}`,
        background: 'rgba(255,253,242,0.95)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LogoMark size={30} />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: C.accent, fontFamily: 'Georgia,serif' }}>ExamBrain</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: `1px solid ${C.border}`, borderRadius: 7,
            padding: '0.3rem 0.65rem', fontSize: '0.77rem', color: C.brownL,
            cursor: 'pointer', fontFamily: 'system-ui'
          }}>
            <Globe size={12} /> {lang === 'en' ? 'हिंदी' : 'English'}
          </button>
          <button onClick={onEnterApp} style={{
            background: C.accent, color: C.cream, border: 'none',
            borderRadius: 7, padding: '0.42rem 1.1rem',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui'
          }}>{t.nav}</button>
        </div>
      </nav>

      {/* HERO with Vanta birds */}
      <section ref={heroRef} style={{ position: 'relative', overflow: 'hidden', minHeight: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,253,242,0.55)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '5rem 1.5rem 4rem', maxWidth: 720 }}>
          <p style={{ ...lbl, display: 'inline-block', background: 'rgba(255,253,242,0.8)', padding: '3px 12px', borderRadius: 99, backdropFilter: 'blur(4px)', marginBottom: '1.5rem' }}>
            {t.tag}
          </p>
          <h1 style={{
            fontSize: 'clamp(2.4rem,7.5vw,4.5rem)', fontWeight: 700,
            lineHeight: 1.05, color: C.brown, marginBottom: '1.25rem',
            fontFamily: 'Georgia,serif', letterSpacing: '-0.02em'
          }}>
            {t.h1a}<br />
            <em style={{ fontStyle: 'italic', color: C.accent }}>{t.h1b}</em>
          </h1>
          <p style={{ ...sub, margin: '0 auto 2.5rem', fontSize: '1.05rem', maxWidth: 460 }}>
            {t.sub}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onEnterApp} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: C.accent, color: C.cream, border: 'none',
              borderRadius: 9, padding: '0.9rem 1.9rem',
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui',
              boxShadow: '0 4px 20px rgba(146,64,14,0.3)',
              transition: 'transform 0.18s, box-shadow 0.18s'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(146,64,14,0.38)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(146,64,14,0.3)' }}
            >
              {t.cta} <ArrowRight size={16} />
            </button>
            <button onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} style={{
              background: 'rgba(255,253,242,0.8)', color: C.brown,
              border: `1px solid ${C.border}`, borderRadius: 9,
              padding: '0.9rem 1.75rem', fontSize: '1rem',
              cursor: 'pointer', fontFamily: 'system-ui', backdropFilter: 'blur(4px)'
            }}>{t.ghost}</button>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF BAR - Modified: Removed "No signup required" and "Works offline" */}
      <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.cream2, padding: '0.9rem 1.5rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Free forever', 'Open source', 'AI-powered'].map(s => (
            <span key={s} style={{ fontSize: '0.78rem', color: C.brownM, fontFamily: 'system-ui', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: C.accentL, display: 'inline-block' }} />
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" style={S}>
        <FadeIn>
          <p style={lbl}>{t.how_l}</p>
          <h2 style={H2}>{t.how_h}</h2>
          <p style={{ ...sub, marginBottom: '3rem' }}>{t.how_s}</p>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          {t.steps.map((s, i) => (
            <FadeIn key={s.n} delay={i * 100}>
              <div style={{
                padding: '2rem 1.5rem', height: '100%',
                background: i === 1 ? C.cream2 : C.cream,
                borderRight: i < t.steps.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <p style={{ fontSize: '2.8rem', fontWeight: 800, color: C.border, lineHeight: 1, marginBottom: 14, fontFamily: 'system-ui' }}>{s.n}</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: C.brown, marginBottom: 8, fontFamily: 'Georgia,serif' }}>{s.t}</p>
                <p style={{ fontSize: '0.87rem', color: C.brownM, lineHeight: 1.7, fontFamily: 'system-ui' }}>{s.d}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <hr style={hr} />

      {/* FEATURES */}
      <section style={S}>
        <FadeIn>
          <p style={lbl}>{t.feat_l}</p>
          <h2 style={H2}>{t.feat_h}</h2>
          <div style={{ width: 32, height: 2, background: C.accent, margin: '1rem 0 3rem' }} />
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          {t.feats.map((f, i) => (
            <FadeIn key={f.t} delay={i * 60}>
              <div
                style={{
                  padding: '1.5rem',
                  background: [0, 3].includes(i) ? C.cream2 : C.cream,
                  borderRight: (i + 1) % 3 !== 0 ? `1px solid ${C.border}` : 'none',
                  borderBottom: i < 3 ? `1px solid ${C.border}` : 'none',
                  cursor: 'default', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.cream3}
                onMouseLeave={e => e.currentTarget.style.background = [0, 3].includes(i) ? C.cream2 : C.cream}
              >
                <span style={{ fontSize: '1.2rem', color: C.accentL, display: 'block', marginBottom: 10, fontFamily: 'system-ui' }}>{f.i}</span>
                <p style={{ fontSize: '0.92rem', fontWeight: 700, color: C.brown, marginBottom: 6, fontFamily: 'Georgia,serif' }}>{f.t}</p>
                <p style={{ fontSize: '0.82rem', color: C.brownM, lineHeight: 1.65, fontFamily: 'system-ui' }}>{f.d}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <hr style={hr} />

      {/* FAQ */}
      <section style={S}>
        <FadeIn>
          <p style={lbl}>{t.faq_l}</p>
          <h2 style={{ ...H2, marginBottom: '2rem' }}>{t.faq_h}</h2>
        </FadeIn>
        <FadeIn delay={80}>
          <div style={{ maxWidth: 620 }}>
            {t.faqs.map(f => <FAQ key={f.q} q={f.q} a={f.a} />)}
          </div>
        </FadeIn>
      </section>

      <hr style={hr} />

      {/* CTA BOTTOM */}
      <section style={{ ...S, textAlign: 'center' }}>
        <FadeIn>
          <h2 style={{ ...H2, marginBottom: '0.75rem' }}>{t.cta2_h}</h2>
          <p style={{ ...sub, margin: '0 auto 2.25rem' }}>{t.cta2_s}</p>
          <button onClick={onEnterApp} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: C.accent, color: C.cream, border: 'none',
            borderRadius: 9, padding: '0.9rem 2.25rem',
            fontSize: '1rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui',
            boxShadow: '0 4px 20px rgba(146,64,14,0.25)'
          }}>{t.cta2_b} <ArrowRight size={16} /></button>
          <p style={{ fontSize: '0.78rem', color: C.brownL, marginTop: 14, fontFamily: 'system-ui' }}>
            Free · Open source on GitHub
          </p>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '1.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LogoMark size={22} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: C.accent, fontFamily: 'Georgia,serif' }}>ExamBrain</span>
          <span style={{ fontSize: '0.75rem', color: C.brownL, fontFamily: 'system-ui' }}>
            · Built by <a href="https://github.com/nikkipandey-8599" target="_blank" rel="noreferrer" style={{ color: C.brown }}>Nikki Pandey</a> · MIT License · Free forever
          </span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="https://github.com/nikkipandey-8599/exambrain" target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: C.brownL, textDecoration: 'none', fontFamily: 'system-ui' }}>GitHub</a>
          <button onClick={onEnterApp} style={{ fontSize: '0.82rem', color: C.brownL, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'system-ui' }}>Try App</button>
        </div>
      </footer>
    </div>
  )
}
