import { useState } from 'react'
import { Cloud, CloudOff, Check, AlertCircle } from 'lucide-react'
import { cloudSaveSession, cloudSaveResults, cloudGetSessions } from '../services/supabase'
import { getAllSessions, getResultsBySession } from '../services/db'
import { showToast } from './Toast'

export default function SyncBanner({ user, onMigrate }) {
  const [syncing, setSyncing] = useState(false)
  const [synced, setSynced] = useState(false)

  async function handleSync() {
    if (!user || syncing) return
    setSyncing(true)
    try {
      const localSessions = await getAllSessions()
      const cloudSessions = await cloudGetSessions(user.id)
      const cloudIds = new Set(cloudSessions.map(s => s.local_id))

      let count = 0
      for (const session of localSessions) {
        if (!cloudIds.has(String(session.id))) {
          await cloudSaveSession(user.id, session.id, session)
          const results = await getResultsBySession(session.id)
          if (results.length > 0) {
            await cloudSaveResults(user.id, session.id, results[0].answers)
          }
          count++
        }
      }
      setSynced(true)
      showToast.success(`Synced ${count} session${count !== 1 ? 's' : ''} to cloud`)
      if (onMigrate) onMigrate()
    } catch (e) {
      showToast.error('Sync failed — check connection')
    } finally {
      setSyncing(false)
    }
  }

  if (synced) return null

  return (
    <div className="animate-slideDown" style={{
      background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.25)',
      borderRadius: 12, padding: '0.75rem 1rem', margin: '0 1.25rem 1rem',
      display: 'flex', alignItems: 'center', gap: 10
    }}>
      <Cloud size={16} color="var(--brand-400)" style={{ flexShrink: 0 }} />
      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1, lineHeight: 1.4 }}>
        Sync your local sessions to the cloud
      </p>
      <button
        onClick={handleSync}
        disabled={syncing}
        style={{
          background: 'var(--brand-500)', color: 'white', border: 'none',
          borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.78rem',
          fontWeight: 600, cursor: syncing ? 'not-allowed' : 'pointer', flexShrink: 0
        }}
      >
        {syncing ? 'Syncing…' : 'Sync Now'}
      </button>
    </div>
  )
}
