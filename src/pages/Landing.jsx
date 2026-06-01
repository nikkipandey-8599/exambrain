import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronDown, Globe } from 'lucide-react'

// ── Intersection Observer hook ────────────────────────
function useInView(threshold = 0.12) {
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

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, inView] = useInView()
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      ...style
    }}>{children}</div>
  )
}

// ── Colour palette ────────────────────────────────────
const C = {
  cream:   '#FFFDF2',
  cream2:  '#FAF7E8',
  cream3:  '#F5F1DC',
  brown:   '#2C1F05',
  brownM:  '#5C4A1E',
  brownL:  '#8B7340',
  border:  '#E8E0C4',
  accent:  '#6B4F12',
}

// ── Translations ──────────────────────────────────────
const T = {
  en: {
    nav_try: 'Open App',
    hero_tag: 'Free · No signup · Works offline',
    hero_h1a: 'Turn your notes into',
    hero_h1b: 'an exam toolkit.',
    hero_sub: 'Paste your lecture notes. Get quizzes, flashcards and a full score report — in seconds.',
    hero_cta: 'Try ExamBrain',
    hero_ghost: 'See how it works',
    how_label: 'HOW IT WORKS',
    how_h2: 'Three steps.',
    how_sub: 'No setup. No account. Paste and go.',
    steps: [
      { num: '01', title: 'Paste your notes', desc: 'Any subject. Lecture notes, textbook chapters, study guides — or upload a PDF.' },
      { num: '02', title: 'AI builds your kit', desc: 'LLaMA 3.3 70B generates 10 MCQs, 5 short answers and 12 flashcards instantly.' },
      { num: '03', title: 'Study and track', desc: 'Quiz yourself, flip cards, see exactly which topics need more attention.' },
    ],
    feat_label: 'FEATURES',
    feat_h2: 'Everything for exam prep.',
    features: [
      { icon: '📝', title: '10 MCQs', desc: 'Easy to hard difficulty. 4 options, correct answer, full explanation.' },
      { icon: '✍️', title: 'Short Answers', desc: 'AI grades your written answers 0–100 with specific feedback.' },
      { icon: '🃏', title: 'Flashcards', desc: '3D flip cards with text-to-speech and mastery tracking.' },
      { icon: '📊', title: 'Score Report', desc: 'Topic breakdown, weak area alerts, one-tap PDF export.' },
      { icon: '🔥', title: 'Streaks', desc: 'Daily study streak, activity heatmap and 6 unlockable badges.' },
      { icon: '📱', title: 'Works on Phone', desc: 'Install on Android or iOS. Fully offline after first visit.' },
    ],
    faq_label: 'FAQ',
    faq_h2: 'Questions.',
    faqs: [
      { q: 'Is it completely free?', a: 'Yes. No signup, no credit card, no limits — ever.' },
      { q: 'Which subjects work?', a: 'Any subject — history, science, law, medicine, engineering, languages.' },
      { q: 'How is it different from Quizlet?', a: 'ExamBrain generates questions from your own notes automatically. No manual card creation. It also grades written answers with AI feedback.' },
      { q: 'Does it work offline?', a: 'Yes. After your first visit the app works fully offline. Sessions are saved locally on your device.' },
      { q: 'Can I install it on my phone?', a: 'Yes. On Android open in Chrome → Add to Home Screen. On iOS open in Safari → Share → Add to Home Screen.' },
    ],
    cta_h2: 'Ready to study smarter?',
    cta_sub: 'No account needed. Open and go.',
    cta_btn: 'Try ExamBrain',
    footer_built: 'Built by',
    footer_mit: 'MIT License',
    footer_free: 'Free forever',
  },
  hi: {
    nav_try: 'ऐप खोलें',
    hero_tag: 'मुफ़्त · बिना साइनअप · ऑफलाइन',
    hero_h1a: 'अपने नोट्स को बदलें',
    hero_h1b: 'परीक्षा किट में।',
    hero_sub: 'कोई भी नोट्स पेस्ट करें। क्विज़, फ्लैशकार्ड और स्कोर रिपोर्ट — सेकंडों में।',
    hero_cta: 'ExamBrain आज़माएं',
    hero_ghost: 'कैसे काम करता है',
    how_label: 'यह कैसे काम करता है',
    how_h2: 'तीन आसान कदम।',
    how_sub: 'कोई सेटअप नहीं। कोई अकाउंट नहीं।',
    steps: [
      { num: '01', title: 'नोट्स पेस्ट करें', desc: 'कोई भी विषय। लेक्चर नोट्स, पाठ्यपुस्तक या PDF अपलोड करें।' },
      { num: '02', title: 'AI किट बनाता है', desc: 'LLaMA 3.3 70B तुरंत 10 MCQ, 5 लघु उत्तर और 12 फ्लैशकार्ड बनाता है।' },
      { num: '03', title: 'पढ़ें और ट्रैक करें', desc: 'क्विज़ दें, कार्ड पलटें, देखें कौन से टॉपिक कमज़ोर हैं।' },
    ],
    feat_label: 'विशेषताएं',
    feat_h2: 'परीक्षा की तैयारी के लिए सब कुछ।',
    features: [
      { icon: '📝', title: '10 MCQ', desc: 'आसान से कठिन। 4 विकल्प, सही उत्तर, स्पष्टीकरण।' },
      { icon: '✍️', title: 'लघु उत्तर', desc: 'AI आपके उत्तरों को 0–100 में ग्रेड करता है।' },
      { icon: '🃏', title: 'फ्लैशकार्ड', desc: '3D फ्लिप कार्ड, टेक्स्ट-टू-स्पीच और महारत ट्रैकिंग।' },
      { icon: '📊', title: 'स्कोर रिपोर्ट', desc: 'विषय विश्लेषण, कमज़ोर क्षेत्र अलर्ट, PDF एक्सपोर्ट।' },
      { icon: '🔥', title: 'स्ट्रीक', desc: 'दैनिक अध्ययन स्ट्रीक और 6 उपलब्धि बैज।' },
      { icon: '📱', title: 'फोन पर काम करे', desc: 'Android या iOS पर इंस्टॉल करें। पहली विज़िट के बाद ऑफलाइन।' },
    ],
    faq_label: 'सवाल-जवाब',
    faq_h2: 'अक्सर पूछे जाने वाले सवाल।',
    faqs: [
      { q: 'क्या यह पूरी तरह मुफ़्त है?', a: 'हाँ। कोई साइनअप नहीं, कोई क्रेडिट कार्ड नहीं, कोई सीमा नहीं।' },
      { q: 'कौन से विषय काम करते हैं?', a: 'कोई भी — इतिहास, विज्ञान, कानून, चिकित्सा, इंजीनियरिंग, भाषाएं।' },
      { q: 'Quizlet से कैसे अलग है?', a: 'ExamBrain आपके नोट्स से स्वचालित रूप से प्रश्न बनाता है। कोई मैन्युअल कार्ड नहीं।' },
      { q: 'क्या यह ऑफलाइन काम करता है?', a: 'हाँ। पहली विज़िट के बाद पूरी तरह ऑफलाइन काम करता है।' },
      { q: 'क्या मैं फोन पर इंस्टॉल कर सकता हूँ?', a: 'हाँ। Chrome में खोलें → होम स्क्रीन पर जोड़ें।' },
    ],
    cta_h2: 'स्मार्ट तरीके से पढ़ने के लिए तैयार?',
    cta_sub: 'कोई अकाउंट नहीं चाहिए।',
    cta_btn: 'ExamBrain आज़माएं',
    footer_built: 'बनाया',
    footer_mit: 'MIT लाइसेंस',
    footer_free: 'हमेशा मुफ़्त',
  }
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${C.border}`, padding: '1.25rem 0' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left', gap: 16
      }}>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: C.brown, fontFamily: 'Georgia, serif' }}>{q}</span>
        <ChevronDown size={16} color={C.brownL} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && <p style={{ fontSize: '0.93rem', color: C.brownM, lineHeight: 1.75, marginTop: 10, paddingRight: 32 }}>{a}</p>}
    </div>
  )
}

export default function Landing({ onEnterApp }) {
  const [lang, setLang] = useState('en')
  const vantaRef = useRef(null)
  const vantaEffect = useRef(null)
  const t = T[lang]

  // Load Vanta birds on hero
  useEffect(() => {
    let mounted = true

    async function loadVanta() {
      // Load three.js first, then vanta
      if (!window.THREE) {
        await new Promise((res, rej) => {
          const s = document.createElement('script')
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js'
          s.onload = res; s.onerror = rej
          document.head.appendChild(s)
        })
      }
      if (!window.VANTA) {
        await new Promise((res, rej) => {
          const s = document.createElement('script')
          s.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js'
          s.onload = res; s.onerror = rej
          document.head.appendChild(s)
        })
      }
      if (mounted && vantaRef.current && window.VANTA?.BIRDS) {
        vantaEffect.current = window.VANTA.BIRDS({
          el: vantaRef.current,
          THREE: window.THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1.0,
          scaleMobile: 1.0,
          backgroundColor: 0xFFFDF2,
          color1: 0x6B4F12,
          color2: 0x8B7340,
          colorMode: 'variance',
          birdSize: 1.2,
          wingSpan: 28,
          speedLimit: 4,
          separation: 55,
          alignment: 48,
          cohesion: 48,
          quantity: 3,
        })
      }
    }

    loadVanta().catch(() => {}) // silent fail if CDN blocked

    return () => {
      mounted = false
      if (vantaEffect.current) { vantaEffect.current.destroy(); vantaEffect.current = null }
    }
  }, [])

  const sec = { padding: '5rem 1.5rem', maxWidth: 900, margin: '0 auto' }
  const label = { fontSize: '0.68rem', letterSpacing: '0.16em', fontWeight: 700, color: C.brownL, textTransform: 'uppercase', marginBottom: '1rem', fontFamily: 'system-ui, sans-serif' }
  const h2 = { fontSize: 'clamp(1.9rem, 5vw, 3rem)', fontWeight: 700, color: C.brown, lineHeight: 1.1, fontFamily: 'Georgia, "Times New Roman", serif', marginBottom: '0.5rem' }
  const sub = { fontSize: '1rem', color: C.brownM, lineHeight: 1.75, maxWidth: 480 }
  const hr = { border: 'none', borderTop: `1px solid ${C.border}`, margin: '0 1.5rem' }

  return (
    <div style={{ background: C.cream, color: C.brown, fontFamily: 'Georgia, "Times New Roman", serif', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.1rem 1.75rem', borderBottom: `1px solid ${C.border}`,
        background: 'rgba(255,253,242,0.95)', backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: C.brown }}>🧠 ExamBrain</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: `1px solid ${C.border}`,
            borderRadius: 6, padding: '0.32rem 0.65rem',
            fontSize: '0.78rem', color: C.brownL, cursor: 'pointer', fontFamily: 'system-ui'
          }}>
            <Globe size={12} /> {lang === 'en' ? 'हिंदी' : 'English'}
          </button>
          <button onClick={onEnterApp} style={{
            background: C.brown, color: C.cream, border: 'none',
            borderRadius: 7, padding: '0.45rem 1.1rem',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui'
          }}>{t.nav_try}</button>
        </div>
      </nav>

      {/* ── HERO with VANTA ── */}
      <section ref={vantaRef} style={{
        position: 'relative', padding: '7rem 1.5rem 5rem',
        textAlign: 'center', overflow: 'hidden', minHeight: 480
      }}>
        {/* Content above vanta */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ ...label, marginBottom: '1.5rem', display: 'inline-block', background: 'rgba(255,253,242,0.7)', padding: '4px 12px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
            {t.hero_tag}
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 7vw, 4.2rem)', fontWeight: 700,
            lineHeight: 1.1, color: C.brown, marginBottom: '1.25rem',
            fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.02em'
          }}>
            {t.hero_h1a}<br />
            <em style={{ fontStyle: 'italic', color: C.accent }}>{t.hero_h1b}</em>
          </h1>
          <p style={{ ...sub, margin: '0 auto 2.5rem', fontSize: '1.08rem', background: 'rgba(255,253,242,0.5)', backdropFilter: 'blur(4px)', padding: '8px 16px', borderRadius: 12, display: 'inline-block' }}>
            {t.hero_sub}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onEnterApp} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: C.brown, color: C.cream, border: 'none',
              borderRadius: 9, padding: '0.85rem 1.75rem',
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'system-ui', boxShadow: `0 4px 18px rgba(44,31,5,0.25)`,
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(44,31,5,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(44,31,5,0.25)' }}
            >
              {t.hero_cta} <ArrowRight size={16} />
            </button>
            <button onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} style={{
              background: 'rgba(255,253,242,0.8)', color: C.brown,
              border: `1px solid ${C.border}`, borderRadius: 9,
              padding: '0.85rem 1.75rem', fontSize: '1rem',
              cursor: 'pointer', fontFamily: 'system-ui', backdropFilter: 'blur(4px)'
            }}>{t.hero_ghost}</button>
          </div>
        </div>
      </section>

      <hr style={hr} />

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={sec}>
        <FadeIn>
          <p style={label}>{t.how_label}</p>
          <h2 style={h2}>{t.how_h2}</h2>
          <p style={{ ...sub, marginBottom: '3rem' }}>{t.how_sub}</p>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          {t.steps.map((s, i) => (
            <FadeIn key={s.num} delay={i * 120}>
              <div style={{
                padding: '2rem 1.5rem',
                background: i === 1 ? C.cream2 : C.cream,
                borderRight: i < 2 ? `1px solid ${C.border}` : 'none',
                height: '100%'
              }}>
                <p style={{ fontSize: '3rem', fontWeight: 800, color: C.border, lineHeight: 1, marginBottom: 16, fontFamily: 'system-ui' }}>
                  {s.num}
                </p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: C.brown, marginBottom: 8, fontFamily: 'Georgia, serif' }}>{s.title}</p>
                <p style={{ fontSize: '0.88rem', color: C.brownM, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <hr style={hr} />

      {/* ── FEATURES ── */}
      <section style={sec}>
        <FadeIn>
          <p style={label}>{t.feat_label}</p>
          <h2 style={h2}>{t.feat_h2}</h2>
          <div style={{ width: 36, height: 2, background: C.brown, margin: '1rem 0 3rem' }} />
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          {t.features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 70}>
              <div style={{
                padding: '1.5rem',
                background: [0,3].includes(i) ? C.cream2 : C.cream,
                borderRight: (i + 1) % 3 !== 0 ? `1px solid ${C.border}` : 'none',
                borderBottom: i < 3 ? `1px solid ${C.border}` : 'none',
                transition: 'background 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.cream3}
                onMouseLeave={e => e.currentTarget.style.background = [0,3].includes(i) ? C.cream2 : C.cream}
              >
                <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: 10 }}>{f.icon}</span>
                <p style={{ fontSize: '0.92rem', fontWeight: 700, color: C.brown, marginBottom: 6, fontFamily: 'Georgia, serif' }}>{f.title}</p>
                <p style={{ fontSize: '0.82rem', color: C.brownM, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <hr style={hr} />

      {/* ── FAQ ── */}
      <section style={sec}>
        <FadeIn>
          <p style={label}>{t.faq_label}</p>
          <h2 style={{ ...h2, marginBottom: '2rem' }}>{t.faq_h2}</h2>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{ maxWidth: 640 }}>
            {t.faqs.map(f => <FAQ key={f.q} q={f.q} a={f.a} />)}
          </div>
        </FadeIn>
      </section>

      <hr style={hr} />

      {/* ── CTA ── */}
      <section style={{ ...sec, textAlign: 'center' }}>
        <FadeIn>
          <h2 style={{ ...h2, marginBottom: '0.75rem' }}>{t.cta_h2}</h2>
          <p style={{ ...sub, margin: '0 auto 2rem' }}>{t.cta_sub}</p>
          <button onClick={onEnterApp} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: C.brown, color: C.cream, border: 'none',
            borderRadius: 9, padding: '0.9rem 2.2rem',
            fontSize: '1rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui',
            boxShadow: `0 4px 18px rgba(44,31,5,0.2)`
          }}>{t.cta_btn} <ArrowRight size={16} /></button>
          <p style={{ fontSize: '0.78rem', color: C.brownL, marginTop: 14, fontFamily: 'system-ui' }}>
            Free · No account · Open source on GitHub
          </p>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '1.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: C.brown }}>🧠 ExamBrain</span>
          <span style={{ fontSize: '0.78rem', color: C.brownL, fontFamily: 'system-ui' }}>
            · {t.footer_built} <a href="https://github.com/nikkipandey-8599" target="_blank" rel="noreferrer" style={{ color: C.brown }}>Nikki Pandey</a> · {t.footer_mit} · {t.footer_free}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'GitHub', href: 'https://github.com/nikkipandey-8599/exambrain' },
            { label: 'Try App', href: '#', onClick: (e) => { e.preventDefault(); onEnterApp() } },
          ].map(l => (
            <a key={l.label} href={l.href} onClick={l.onClick}
              target={l.href !== '#' ? '_blank' : undefined} rel="noreferrer"
              style={{ fontSize: '0.82rem', color: C.brownL, textDecoration: 'none', fontFamily: 'system-ui' }}>
              {l.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
