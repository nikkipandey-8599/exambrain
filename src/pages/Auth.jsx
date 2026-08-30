import { trackSignIn, trackSignUp } from '../utils/analytics'
import { useState, useEffect, useRef } from 'react'
import {
  signInWithGoogle, signInWithGitHub, signInWithDiscord,
  signUpWithEmail, signInWithEmail, resetPassword
} from '../services/supabase'
import { showToast } from '../components/Toast'
import { loadVanta } from '../utils/vanta'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

const C = {
  cream:  '#FFFDF2', cream2: '#FAF6E4', cream3: '#F3EDD0',
  border: '#E8E0C4', brown:  '#2C1F05', brownM: '#5C4A1E',
  brownL: '#8B7340', accent: '#92400E',
}

export default function Auth({ onBack, mandatory = false }) {
  const [tab, setTab] = useState('signin')         // 'signin' | 'signup'
  const [mode, setMode] = useState('oauth')         // 'oauth' | 'email'
  const [loading, setLoading] = useState(null)

  // email form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const vantaRef = useRef(null)
  const vantaEffect = useRef(null)

  const isSignUp = tab === 'signup'

  useEffect(() => {
    loadVanta().then(() => {
      if (vantaRef.current && !vantaEffect.current) {
        vantaEffect.current = window.VANTA?.NET?.({
          el: vantaRef.current,
          THREE: window.THREE,
          mouseControls: true, touchControls: true,
          color: 0x92400E,
          backgroundColor: 0xFFFDF2,
          points: 9, maxDistance: 22, spacing: 16,
          showDots: true,
        })
      }
    }).catch(() => {})
    return () => { if (vantaEffect.current) { vantaEffect.current.destroy(); vantaEffect.current = null } }
  }, [])

  // Reset email form when switching tabs
  function switchTab(t) {
    setTab(t)
    setEmail('')
    setPassword('')
    setForgotSent(false)
  }

  // ── OAuth handlers ────────────────────────────────────
  async function handleGoogle() {
    setLoading('google')
    const { error } = await signInWithGoogle()
    if (error) { showToast.error('Google sign-in failed. Try again.'); setLoading(null) }
  }

  async function handleGitHub() {
    setLoading('github')
    const { error } = await signInWithGitHub()
    if (error) { showToast.error('GitHub sign-in failed. Try again.'); setLoading(null) }
  }

  async function handleDiscord() {
    setLoading('discord')
    const { error } = await signInWithDiscord()
    if (error) { showToast.error('Discord sign-in failed. Try again.'); setLoading(null) }
  }

  // ── Email handlers ────────────────────────────────────
  async function handleEmailSubmit(e) {
    e.preventDefault()
    if (!email || !password) return

    setLoading('email')
    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(email, password)
        if (error) throw error
        showToast.success('Check your email to confirm your account!')
        trackSignUp?.('email')
      } else {
        const { error } = await signInWithEmail(email, password)
        if (error) throw error
        trackSignIn?.('email')
      }
    } catch (err) {
      const msg = err.message || 'Something went wrong'
      if (msg.includes('Invalid login')) {
        showToast.error('Wrong email or password.')
      } else if (msg.includes('already registered')) {
        showToast.error('Email already in use. Try signing in.')
      } else if (msg.includes('Password should')) {
        showToast.error('Password must be at least 6 characters.')
      } else {
        showToast.error(msg)
      }
    } finally {
      setLoading(null)
    }
  }

  async function handleForgotPassword() {
    if (!email) { showToast.error('Enter your email address first.'); return }
    setLoading('forgot')
    const { error } = await resetPassword(email)
    setLoading(null)
    if (error) { showToast.error('Could not send reset email. Try again.'); return }
    setForgotSent(true)
    showToast.success('Password reset email sent!')
  }

  const Spinner = () => (
    <span style={{
      width: 17, height: 17, border: '2px solid rgba(44,31,5,0.2)',
      borderTopColor: C.accent, borderRadius: '50%',
      display: 'inline-block', animation: 'spin 0.7s linear infinite'
    }} />
  )

  // ── Shared input style ────────────────────────────────
  const inputStyle = {
    width: '100%', padding: '0.72rem 0.85rem',
    borderRadius: 10, border: `1px solid ${C.border}`,
    background: C.cream, color: C.brown,
    fontSize: '0.88rem', fontFamily: 'system-ui',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  return (
    <div ref={vantaRef} style={{
      position: 'fixed', inset: 0, zIndex: 200, overflow: 'hidden',
      background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,253,242,0.6)', backdropFilter: 'blur(1px)', zIndex: 0 }} />

      <div className="animate-scaleIn" style={{
        position: 'relative', zIndex: 1,
        background: C.cream2, border: `1px solid ${C.border}`,
        borderRadius: 20, padding: '2rem 1.75rem',
        width: '100%', maxWidth: 390,
        boxShadow: '0 24px 64px rgba(44,31,5,0.12)',
        maxHeight: '95vh', overflowY: 'auto',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img src="/icon-96.png" alt="ExamBrain" width={52} height={52}
            style={{ borderRadius: 14, display: 'block', margin: '0 auto 10px' }} />
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: C.brown, fontFamily: 'Georgia,serif', marginBottom: 4 }}>
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p style={{ fontSize: '0.83rem', color: C.brownL, fontFamily: 'system-ui', lineHeight: 1.5 }}>
            {isSignUp
              ? 'Join ExamBrain and start studying smarter.'
              : 'Sign in to access your sessions and history.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: C.cream3,
          borderRadius: 10, padding: 3, marginBottom: '1.5rem',
          border: `1px solid ${C.border}`
        }}>
          {[['signin', 'Sign In'], ['signup', 'Sign Up']].map(([id, label]) => (
            <button key={id} onClick={() => switchTab(id)} style={{
              flex: 1, padding: '0.5rem', borderRadius: 8, border: 'none',
              background: tab === id ? C.cream2 : 'transparent',
              color: tab === id ? C.brown : C.brownL,
              fontSize: '0.85rem', fontWeight: tab === id ? 700 : 500,
              cursor: 'pointer', fontFamily: 'system-ui',
              boxShadow: tab === id ? '0 1px 4px rgba(44,31,5,0.1)' : 'none',
              transition: 'all 0.2s'
            }}>{label}</button>
          ))}
        </div>

        {/* Benefits — only on signup */}
        {isSignUp && (
          <div className="animate-slideDown" style={{
            background: C.cream, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: '0.9rem', marginBottom: '1.25rem'
          }}>
            {[
              ['Cloud sync', 'Access sessions on any device'],
              ['Study history', 'Track progress over time'],
              ['Private & secure', 'Only you see your data'],
            ].map(([t, d]) => (
              <div key={t} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.accent, marginTop: 7, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: C.brown, fontFamily: 'system-ui', marginBottom: 1 }}>{t}</p>
                  <p style={{ fontSize: '0.74rem', color: C.brownL, fontFamily: 'system-ui' }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Mode toggle: OAuth ↔ Email ─────────────────── */}
        <div style={{
          display: 'flex', background: C.cream3,
          borderRadius: 8, padding: 3, marginBottom: '1.25rem',
          border: `1px solid ${C.border}`
        }}>
          {[['oauth', 'Social Login'], ['email', 'Email & Password']].map(([id, label]) => (
            <button key={id} onClick={() => setMode(id)} style={{
              flex: 1, padding: '0.42rem', borderRadius: 6, border: 'none',
              background: mode === id ? C.cream2 : 'transparent',
              color: mode === id ? C.brown : C.brownL,
              fontSize: '0.78rem', fontWeight: mode === id ? 700 : 500,
              cursor: 'pointer', fontFamily: 'system-ui',
              boxShadow: mode === id ? '0 1px 4px rgba(44,31,5,0.1)' : 'none',
              transition: 'all 0.2s'
            }}>{label}</button>
          ))}
        </div>

        {/* ══ OAUTH MODE ══════════════════════════════════ */}
        {mode === 'oauth' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: '0.72rem', color: C.brownL, fontFamily: 'system-ui', whiteSpace: 'nowrap' }}>
                {isSignUp ? 'Sign up with' : 'Sign in with'}
              </span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Google */}
              <button onClick={handleGoogle} disabled={!!loading} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '0.82rem', borderRadius: 10, border: `1px solid ${C.border}`,
                background: C.cream, color: C.brown, fontSize: '0.9rem', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading && loading !== 'google' ? 0.45 : 1,
                transition: 'all 0.18s', fontFamily: 'system-ui',
                boxShadow: '0 1px 4px rgba(44,31,5,0.06)'
              }}>
                {loading === 'google' ? <Spinner /> : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>

              {/* GitHub */}
              <button onClick={handleGitHub} disabled={!!loading} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '0.82rem', borderRadius: 10, border: `1px solid ${C.border}`,
                background: C.cream3, color: C.brown, fontSize: '0.9rem', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading && loading !== 'github' ? 0.45 : 1,
                transition: 'all 0.18s', fontFamily: 'system-ui',
                boxShadow: '0 1px 4px rgba(44,31,5,0.06)'
              }}>
                {loading === 'github' ? <Spinner /> : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={C.brown}>
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                )}
                Continue with GitHub
              </button>

              {/* Discord */}
              <button onClick={handleDiscord} disabled={!!loading} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '0.82rem', borderRadius: 10, border: `1px solid ${C.border}`,
                background: '#5865F2', color: '#fff', fontSize: '0.9rem', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading && loading !== 'discord' ? 0.45 : 1,
                transition: 'all 0.18s', fontFamily: 'system-ui',
                boxShadow: '0 1px 4px rgba(44,31,5,0.06)'
              }}>
                {loading === 'discord' ? (
                  <span style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                )}
                Continue with Discord
              </button>
            </div>
          </>
        )}

        {/* ══ EMAIL MODE ══════════════════════════════════ */}
        {mode === 'email' && (
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {forgotSent ? (
              <div style={{
                background: C.cream, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: '1rem', textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.85rem', color: C.brown, fontFamily: 'system-ui', fontWeight: 600, marginBottom: 4 }}>
                  Check your inbox ✉️
                </p>
                <p style={{ fontSize: '0.78rem', color: C.brownL, fontFamily: 'system-ui' }}>
                  We sent a password reset link to <strong>{email}</strong>
                </p>
                <button type="button" onClick={() => setForgotSent(false)} style={{
                  marginTop: 10, background: 'none', border: 'none',
                  color: C.accent, fontWeight: 600, fontSize: '0.8rem',
                  cursor: 'pointer', fontFamily: 'system-ui', textDecoration: 'underline'
                }}>
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                {/* Email input */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: C.brownM, fontFamily: 'system-ui', marginBottom: 5 }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                </div>

                {/* Password input */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: C.brownM, fontFamily: 'system-ui', marginBottom: 5 }}>
                    Password {isSignUp && <span style={{ fontWeight: 400, color: C.brownL }}>(min. 6 chars)</span>}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={isSignUp ? 'Create a password' : 'Your password'}
                      required
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      style={{ ...inputStyle, paddingRight: '2.4rem' }}
                      onFocus={e => e.target.style.borderColor = C.accent}
                      onBlur={e => e.target.style.borderColor = C.border}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: C.brownL, display: 'flex', alignItems: 'center', padding: 2
                      }}
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Forgot password — only on signin */}
                {!isSignUp && (
                  <div style={{ textAlign: 'right', marginTop: -4 }}>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={loading === 'forgot'}
                      style={{
                        background: 'none', border: 'none', color: C.accent,
                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'system-ui', textDecoration: 'underline'
                      }}
                    >
                      {loading === 'forgot' ? 'Sending…' : 'Forgot password?'}
                    </button>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!!loading || !email || !password}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '0.82rem', borderRadius: 10, border: 'none',
                    background: C.accent, color: '#fff',
                    fontSize: '0.92rem', fontWeight: 700,
                    cursor: (loading || !email || !password) ? 'not-allowed' : 'pointer',
                    opacity: (loading || !email || !password) ? 0.65 : 1,
                    transition: 'all 0.18s', fontFamily: 'system-ui',
                    marginTop: 2,
                    boxShadow: '0 2px 8px rgba(146,64,14,0.25)'
                  }}
                >
                  {loading === 'email' ? <Spinner /> : (isSignUp ? 'Create account' : 'Sign in')}
                </button>
              </>
            )}
          </form>
        )}

        {/* Switch tab link */}
        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: C.brownL, fontFamily: 'system-ui' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => switchTab(isSignUp ? 'signin' : 'signup')} style={{
            background: 'none', border: 'none', color: C.accent,
            fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
            fontFamily: 'system-ui', textDecoration: 'underline'
          }}>
            {isSignUp ? 'Sign in' : 'Sign up free'}
          </button>
        </p>

        {/* Terms */}
        <p style={{ textAlign: 'center', marginTop: 10, fontSize: '0.7rem', color: C.brownL, fontFamily: 'system-ui', lineHeight: 1.5 }}>
          By continuing you agree to our{' '}
          <span style={{ color: C.accent, cursor: 'pointer' }}>Terms</span> and{' '}
          <span style={{ color: C.accent, cursor: 'pointer' }}>Privacy Policy</span>.
        </p>

        {/* Back button */}
        {!mandatory && (
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            width: '100%', justifyContent: 'center',
            marginTop: 14, background: 'none', border: 'none',
            color: C.brownL, fontSize: '0.78rem', cursor: 'pointer',
            fontFamily: 'system-ui'
          }}>
            <ArrowLeft size={13} /> Back
          </button>
        )}
      </div>
    </div>
  )
}
