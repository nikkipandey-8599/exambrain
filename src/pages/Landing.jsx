import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronDown, Globe } from 'lucide-react'

// ── Intersection Observer ─────────────────────────────
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
      transform: inView ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      ...style
    }}>{children}</div>
  )
}

// ── Translations ──────────────────────────────────────
const T = {
  en: {
    nav_try: 'Try It Free',
    hero_tag: 'Free · No signup · Works offline',
    hero_h1a: 'Turn your notes into',
    hero_h1b: 'an exam toolkit.',
    hero_sub: 'Paste any lecture notes. Get quizzes, flashcards and a full score report — in seconds.',
    hero_cta: 'Try ExamBrain',
    hero_secondary: 'See how it works',
    how_label: 'HOW IT WORKS',
    how_h2: 'Three steps.',
    how_sub: 'No setup. No account. Paste and go.',
    steps: [
      { num: '01', title: 'Paste your notes', desc: 'Any subject, any format. Lecture notes, textbook chapters, study guides.' },
      { num: '02', title: 'AI builds your kit', desc: 'LLaMA 3.3 70B generates 10 MCQs, 5 short answers and 12 flashcards.' },
      { num: '03', title: 'Study and track', desc: 'Quiz yourself, flip cards, see exactly which topics need more work.' },
    ],
    feat_label: 'FEATURES',
    feat_h2: 'Everything for exam prep.',
    features: [
      { icon: '📝', title: '10 MCQs', desc: 'Easy to hard difficulty. 4 options, correct answer, explanation.' },
      { icon: '✍️', title: 'Short Answers', desc: 'AI grades your written answers 0–100 with specific feedback.' },
      { icon: '🃏', title: 'Flashcards', desc: '3D flip cards with text-to-speech and mastery tracking.' },
      { icon: '📊', title: 'Score Report', desc: 'Topic breakdown, weak area alerts, one-tap PDF export.' },
      { icon: '🔥', title: 'Streaks', desc: 'Daily study streak, activity heatmap, 6 unlockable badges.' },
      { icon: '📱', title: 'Works on Phone', desc: 'Install on Android or iOS. Fully offline after first visit.' },
    ],
    faq_label: 'FAQ',
    faq_h2: 'Questions.',
    faqs: [
      { q: 'Is it free?', a: 'Yes, completely. No signup, no credit card, no limits.' },
      { q: 'Which subjects work?', a: 'Any subject — history, science, law, medicine, engineering, languages.' },
      { q: 'How is it different from Quizlet?', a: 'ExamBrain generates questions from your notes automatically. No manual card creation. It also grades written answers with AI.' },
      { q: 'Does it work offline?', a: 'Yes. After your first visit the app works fully offline. Sessions saved locally.' },
      { q: 'Can I install it on my phone?', a: 'Yes. On Android open in Chrome → Add to Home Screen. On iOS open in Safari → Share → Add to Home Screen.' },
    ],
    cta_h2: 'Ready to study smarter?',
    cta_sub: 'No account needed. Open and go.',
    cta_btn: 'Try ExamBrain',
    footer_built: 'Built by',
    footer_mit: 'MIT License',
    footer_free: 'Free forever',
    footer_github: 'GitHub',
    footer_try: 'Try App',
  },
  hi: {
    nav_try: 'मुफ़्त आज़माएं',
    hero_tag: 'मुफ़्त · बिना साइनअप · ऑफलाइन काम करे',
    hero_h1a: 'अपने नोट्स को बदलें',
    hero_h1b: 'परीक्षा किट में।',
    hero_sub: 'कोई भी नोट्स पेस्ट करें। क्विज़, फ्लैशकार्ड और स्कोर रिपोर्ट — सेकंडों में।',
    hero_cta: 'ExamBrain आज़माएं',
    hero_secondary: 'कैसे काम करता है',
    how_label: 'यह कैसे काम करता है',
    how_h2: 'तीन आसान कदम।',
    how_sub: 'कोई सेटअप नहीं। कोई अकाउंट नहीं।',
    steps: [
      { num: '01', title: 'नोट्स पेस्ट करें', desc: 'कोई भी विषय, कोई भी प्रारूप। लेक्चर नोट्स, पाठ्यपुस्तक अध्याय।' },
      { num: '02', title: 'AI किट बनाता है', desc: 'LLaMA 3.3 70B 10 MCQ, 5 लघु उत्तर और 12 फ्लैशकार्ड बनाता है।' },
      { num: '03', title: 'पढ़ें और ट्रैक करें', desc: 'क्विज़ दें, कार्ड पलटें, देखें कौन से टॉपिक कमज़ोर हैं।' },
    ],
    feat_label: 'विशेषताएं',
    feat_h2: 'परीक्षा की तैयारी के लिए सब कुछ।',
    features: [
      { icon: '📝', title: '10 MCQ', desc: 'आसान से कठिन। 4 विकल्प, सही उत्तर, स्पष्टीकरण।' },
      { icon: '✍️', title: 'लघु उत्तर', desc: 'AI आपके लिखित उत्तरों को 0–100 में ग्रेड करता है।' },
      { icon: '🃏', title: 'फ्लैशकार्ड', desc: '3D फ्लिप कार्ड, टेक्स्ट-टू-स्पीच और महारत ट्रैकिंग।' },
      { icon: '📊', title: 'स्कोर रिपोर्ट', desc: 'विषय विश्लेषण, कमज़ोर क्षेत्र अलर्ट, PDF एक्सपोर्ट।' },
      { icon: '🔥', title: 'स्ट्रीक', desc: 'दैनिक अध्ययन स्ट्रीक, 6 उपलब्धि बैज।' },
      { icon: '📱', title: 'फोन पर काम करे', desc: 'Android या iOS पर इंस्टॉल करें। पहली विज़िट के बाद ऑफलाइन।' },
    ],
    faq_label: 'सवाल-जवाब',
    faq_h2: 'अक्सर पूछे जाने वाले सवाल।',
    faqs: [
      { q: 'क्या यह मुफ़्त है?', a: 'हाँ, पूरी तरह मुफ़्त। कोई साइनअप नहीं, कोई क्रेडिट कार्ड नहीं।' },
      { q: 'कौन से विषय काम करते हैं?', a: 'कोई भी विषय — इतिहास, विज्ञान, कानून, चिकित्सा, इंजीनियरिंग।' },
      { q: 'Quizlet से कैसे अलग है?', a: 'ExamBrain आपके नोट्स से स्वचालित रूप से प्रश्न बनाता है। कोई मैन्युअल कार्ड नहीं।' },
      { q: 'क्या यह ऑफलाइन काम करता है?', a: 'हाँ। पहली विज़िट के बाद पूरी तरह ऑफलाइन काम करता है।' },
      { q: 'क्या मैं इसे फोन पर इंस्टॉल कर सकता हूँ?', a: 'हाँ। Android पर Chrome में खोलें → होम स्क्रीन पर जोड़ें।' },
    ],
    cta_h2: 'स्मार्ट तरीके से पढ़ने के लिए तैयार?',
    cta_sub: 'कोई अकाउंट नहीं चाहिए। सीधे शुरू करें।',
    cta_btn: 'ExamBrain आज़माएं',
    footer_built: 'बनाया',
    footer_mit: 'MIT लाइसेंस',
    footer_free: 'हमेशा मुफ़्त',
    footer_github: 'GitHub',
    footer_try: 'ऐप आज़माएं',
  }
}

// ── Styles ────────────────────────────────────────────
const C = {
  cream: '#FFFDF2',
  black: '#0A0A0A',
  gray: '#6B6B6B',
  lightGray: '#E8E6DC',
  accent: '#1a1a1a',
}

const S = {
  page: {
    background: C.cream,
    color: C.black,
    fontFamily: '"Times New Roman", Times, Georgia, serif',
    minHeight: '100vh',
  },
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.25rem 2rem', borderBottom: `1px solid ${C.lightGray}`,
    background: C.cream, position: 'sticky', top: 0, zIndex: 100,
  },
  section: { padding: '5rem 1.5rem', maxWidth: 900, margin: '0 auto' },
  label: {
    fontSize: '0.7rem', letterSpacing: '0.15em', fontWeight: 600,
    color: C.gray, textTransform: 'uppercase', marginBottom: '1rem',
    fontFamily: 'system-ui, sans-serif'
  },
  h2: {
    fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700,
    color: C.black, lineHeight: 1.1, marginBottom: '0.5rem',
    fontFamily: '"Times New Roman", Times, Georgia, serif',
  },
  sub: { fontSize: '1rem', color: C.gray, lineHeight: 1.7, maxWidth: 500 },
  divider: { border: 'none', borderTop: `1px solid ${C.lightGray}`, margin: '0 1.5rem' },
}

// ── FAQ Item ──────────────────────────────────────────
function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${C.lightGray}`, padding: '1.25rem 0' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left', gap: 16
      }}>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: C.black, fontFamily: '"Times New Roman", Times, serif' }}>{q}</span>
        <ChevronDown size={16} color={C.gray} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <p style={{ fontSize: '0.95rem', color: C.gray, lineHeight: 1.7, marginTop: 10, paddingRight: 32 }}>{a}</p>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────
export default function Landing({ onEnterApp, onShowAuth }) {
  const [lang, setLang] = useState('en')
  const t = T[lang]

  function scrollTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

  return (
    <div style={S.page}>

      {/* Nav */}
      <nav style={S.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: C.black, letterSpacing: '-0.01em' }}>
            🧠 ExamBrain
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: `1px solid ${C.lightGray}`,
              borderRadius: 6, padding: '0.35rem 0.7rem',
              fontSize: '0.78rem', color: C.gray, cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif'
            }}
          >
            <Globe size={12} /> {lang === 'en' ? 'हिंदी' : 'English'}
          </button>

          <button
            onClick={onEnterApp}
            style={{
              background: C.black, color: C.cream,
              border: 'none', borderRadius: 6, padding: '0.5rem 1.1rem',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif', letterSpacing: '0.01em'
            }}
          >
            {t.nav_try}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '6rem 1.5rem 4rem', maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <p style={{ ...S.label, marginBottom: '1.5rem' }}>{t.hero_tag}</p>
        </FadeIn>
        <FadeIn delay={100}>
          <h1 style={{
            fontSize: 'clamp(2.4rem, 7vw, 4.5rem)', fontWeight: 700,
            lineHeight: 1.08, color: C.black, marginBottom: '1.5rem',
            fontFamily: '"Times New Roman", Times, Georgia, serif',
            letterSpacing: '-0.02em'
          }}>
            {t.hero_h1a}<br />
            <span style={{ fontStyle: 'italic' }}>{t.hero_h1b}</span>
          </h1>
        </FadeIn>
        <FadeIn delay={200}>
          <p style={{ ...S.sub, margin: '0 auto 2.5rem', fontSize: '1.1rem' }}>
            {t.hero_sub}
          </p>
        </FadeIn>
        <FadeIn delay={300}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onEnterApp} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: C.black, color: C.cream,
              border: 'none', borderRadius: 8, padding: '0.85rem 1.75rem',
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif'
            }}>
              {t.hero_cta} <ArrowRight size={16} />
            </button>
            <button onClick={() => scrollTo('how')} style={{
              background: 'none', color: C.black,
              border: `1px solid ${C.lightGray}`, borderRadius: 8,
              padding: '0.85rem 1.75rem', fontSize: '1rem',
              cursor: 'pointer', fontFamily: 'system-ui, sans-serif'
            }}>
              {t.hero_secondary}
            </button>
          </div>
        </FadeIn>
      </section>

      <hr style={S.divider} />

      {/* How it works */}
      <section id="how" style={S.section}>
        <FadeIn>
          <p style={S.label}>{t.how_label}</p>
          <h2 style={S.h2}>{t.how_h2}</h2>
          <p style={{ ...S.sub, marginBottom: '3rem' }}>{t.how_sub}</p>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
          {t.steps.map((s, i) => (
            <FadeIn key={s.num} delay={i * 100}>
              <div style={{
                padding: '1.75rem', border: `1px solid ${C.lightGray}`,
                borderRadius: 12, background: C.cream
              }}>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, color: C.lightGray, marginBottom: 12, fontFamily: 'system-ui', lineHeight: 1 }}>
                  {s.num}
                </p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: C.black, marginBottom: 8, fontFamily: '"Times New Roman", Times, serif' }}>
                  {s.title}
                </p>
                <p style={{ fontSize: '0.88rem', color: C.gray, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      {/* Features */}
      <section style={S.section}>
        <FadeIn>
          <p style={S.label}>{t.feat_label}</p>
          <h2 style={S.h2}>{t.feat_h2}</h2>
          <div style={{ width: 40, height: 2, background: C.black, margin: '1rem 0 3rem' }} />
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          {t.features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 80}>
              <div style={{
                padding: '1.5rem', border: `1px solid ${C.lightGray}`,
                background: i % 2 === 0 ? C.cream : '#FAF8ED'
              }}>
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: 10 }}>{f.icon}</span>
                <p style={{ fontSize: '0.92rem', fontWeight: 700, color: C.black, marginBottom: 6, fontFamily: '"Times New Roman", Times, serif' }}>
                  {f.title}
                </p>
                <p style={{ fontSize: '0.82rem', color: C.gray, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      {/* FAQ */}
      <section style={S.section}>
        <FadeIn>
          <p style={S.label}>{t.faq_label}</p>
          <h2 style={{ ...S.h2, marginBottom: '2rem' }}>{t.faq_h2}</h2>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{ maxWidth: 640 }}>
            {t.faqs.map(f => <FAQ key={f.q} q={f.q} a={f.a} />)}
          </div>
        </FadeIn>
      </section>

      <hr style={S.divider} />

      {/* CTA */}
      <section style={{ ...S.section, textAlign: 'center' }}>
        <FadeIn>
          <h2 style={{ ...S.h2, marginBottom: '0.75rem' }}>{t.cta_h2}</h2>
          <p style={{ ...S.sub, margin: '0 auto 2rem' }}>{t.cta_sub}</p>
          <button onClick={onEnterApp} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: C.black, color: C.cream,
            border: 'none', borderRadius: 8, padding: '0.9rem 2rem',
            fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif'
          }}>
            {t.cta_btn} <ArrowRight size={16} />
          </button>
          <p style={{ fontSize: '0.78rem', color: C.gray, marginTop: 12, fontFamily: 'system-ui' }}>
            Free · No account needed · Open source
          </p>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.lightGray}`, padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: C.black }}>🧠 ExamBrain</span>
          <span style={{ fontSize: '0.78rem', color: C.gray, fontFamily: 'system-ui' }}>· {t.footer_built} <a href="https://github.com/nikkipandey-8599" target="_blank" rel="noreferrer" style={{ color: C.black }}>Nikki Pandey</a> · {t.footer_mit} · {t.footer_free}</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: t.footer_github, href: 'https://github.com/nikkipandey-8599/exambrain' },
            { label: t.footer_try, href: '#', onClick: onEnterApp },
          ].map(l => (
            <a key={l.label} href={l.href} onClick={l.onClick} target={l.href !== '#' ? '_blank' : undefined} rel="noreferrer"
              style={{ fontSize: '0.82rem', color: C.gray, textDecoration: 'none', fontFamily: 'system-ui' }}>
              {l.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
