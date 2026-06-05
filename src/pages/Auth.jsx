import { useState, useEffect, useRef } from 'react'
import { signInWithGoogle, signInWithGitHub } from '../services/supabase'
import { showToast } from '../components/Toast'
import { loadVanta, initNet } from '../utils/vanta'

export default function Auth({ onBack, mandatory = false }) {
  const [loading, setLoading] = useState(null)
  const vantaRef = useRef(null)
  const vantaEffect = useRef(null)
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  useEffect(() => {
    loadVanta().then(() => {
      if (vantaRef.current) {
        vantaEffect.current = initNet(vantaRef.current, isDark)
      }
    }).catch(() => {})
    return () => { if (vantaEffect.current) { vantaEffect.current.destroy(); vantaEffect.current = null } }
  }, [])

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

  return (
    <div ref={vantaRef} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', overflow: 'hidden'
    }}>
      {/* Overlay for readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,253,242,0.75)', backdropFilter: 'blur(2px)', zIndex: 0 }} />

      <div className="animate-scaleIn" style={{
        position: 'relative', zIndex: 1,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '2.5rem 2rem', width: '100%', maxWidth: 360,
        boxShadow: '0 24px 64px var(--shadow)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ margin: '0 auto 12px', display: 'block' }}>
            <rect width="52" height="52" rx="14" fill="var(--brand-500)" />
            <text x="26" y="36" textAnchor="middle" fontSize="28" fill="var(--parchment)">🎓</text>
          </svg>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Welcome to ExamBrain
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, fontFamily: 'system-ui' }}>
            {mandatory
              ? 'Sign in to access all features and save your study sessions.'
              : 'Sign in to sync your sessions across devices.'}
          </p>
        </div>

        {/* Benefits */}
        <div style={{ marginBottom: '1.75rem' }}>
          {[
            ['Cloud sync', 'Access your sessions on any device'],
            ['Study history', 'Track your progress over time'],
            ['Private & secure', 'Your data belongs only to you'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-500)', marginTop: 7, flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 1, fontFamily: 'system-ui' }}>{title}</p>
                <p style={{ fontSize: '0.77rem', color: 'var(--text-muted)', fontFamily: 'system-ui' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sign-in buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleGoogle} disabled={!!loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '0.85rem', borderRadius: 10,
            border: '1px solid var(--border-strong)',
            background: 'var(--bg)', color: 'var(--text-primary)',
            fontSize: '0.92rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading && loading !== 'google' ? 0.5 : 1,
            transition: 'all 0.2s', fontFamily: 'system-ui'
          }}>
            {loading === 'google' ? (
              <span className="animate-spin" style={{ width: 18, height: 18, border: '2px solid var(--border-strong)', borderTopColor: 'var(--brand-500)', borderRadius: '50%', display: 'inline-block' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <button onClick={handleGitHub} disabled={!!loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '0.85rem', borderRadius: 10,
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
            fontSize: '0.92rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading && loading !== 'github' ? 0.5 : 1,
            transition: 'all 0.2s', fontFamily: 'system-ui'
          }}>
            {loading === 'github' ? (
              <span className="animate-spin" style={{ width: 18, height: 18, border: '2px solid var(--border-strong)', borderTopColor: 'var(--text-primary)', borderRadius: '50%', display: 'inline-block' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            )}
            Continue with GitHub
          </button>
        </div>

        {!mandatory && (
          <button onClick={onBack} style={{
            width: '100%', marginTop: 16, background: 'none', border: 'none',
            color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer',
            fontFamily: 'system-ui', padding: '0.5rem', borderRadius: 8,
            transition: 'color 0.2s'
          }}>
            Continue without signing in
          </button>
        )}
      </div>
    </div>
  )
}
