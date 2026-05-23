import { useState, useRef, useEffect } from 'react'
import { LogOut, User, Cloud } from 'lucide-react'

export default function UserMenu({ user, onSignOut, onShowAuth }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  if (!user) {
    return (
      <button
        onClick={onShowAuth}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(79,110,247,0.12)', border: '1px solid rgba(79,110,247,0.3)',
          color: 'var(--brand-400)', borderRadius: 8, padding: '0.35rem 0.75rem',
          fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
        }}
      >
        <User size={13} /> Sign In
      </button>
    )
  }

  const avatar = user.user_metadata?.avatar_url
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0
        }}
      >
        {avatar ? (
          <img src={avatar} alt={name} width={30} height={30} style={{ borderRadius: '50%', border: '2px solid var(--brand-500)' }} />
        ) : (
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>
            {name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </button>

      {open && (
        <div className="animate-slideDown" style={{
          position: 'absolute', right: 0, top: 38, zIndex: 100,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '0.5rem', minWidth: 180,
          boxShadow: '0 8px 32px var(--shadow)'
        }}>
          <div style={{ padding: '0.5rem 0.75rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{name}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Cloud size={11} color="var(--success)" />
              <p style={{ fontSize: '0.72rem', color: 'var(--success)' }}>Cloud sync active</p>
            </div>
          </div>
          <button
            onClick={() => { setOpen(false); onSignOut() }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '0.6rem 0.75rem', background: 'none', border: 'none',
              color: 'var(--danger)', fontSize: '0.85rem', cursor: 'pointer',
              borderRadius: 8, transition: 'background 0.2s'
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
