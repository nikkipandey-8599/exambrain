import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { requestPushPermission, subscribeToPush, isPushEnabled, disablePush, showLocalNotification } from '../services/pushNotifications'
import { showToast } from './Toast'

export default function PushNotifToggle() {
  const [enabled, setEnabled] = useState(isPushEnabled())
  const [loading, setLoading] = useState(false)

  // Check if notifications supported
  if (!('Notification' in window)) return null

  async function handleToggle() {
    if (enabled) {
      disablePush()
      setEnabled(false)
      showToast.info('Reminders disabled')
      return
    }
    setLoading(true)
    const granted = await requestPushPermission()
    if (!granted) {
      showToast.error('Permission denied — enable in browser settings')
      setLoading(false)
      return
    }
    const ok = await subscribeToPush()
    if (ok) {
      setEnabled(true)
      showToast.success('Daily reminders enabled at 6 PM 🔥')
      // Demo notification
      setTimeout(() => showLocalNotification('ExamBrain 🧠', "Your streak is waiting! Study for 5 mins to keep it alive 🔥"), 2000)
    } else {
      showToast.error('Could not enable reminders')
    }
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.75rem 1rem', background: 'var(--bg-secondary)',
      border: '1px solid var(--border)', borderRadius: 12, marginBottom: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {enabled ? <Bell size={16} color="var(--brand-400)" /> : <BellOff size={16} color="var(--text-muted)" />}
        <div>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Daily Reminders</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {enabled ? '6 PM reminder active 🔥' : 'Your streak is at risk without it'}
          </p>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        style={{
          width: 44, height: 26, borderRadius: 99, border: 'none',
          background: enabled ? 'var(--brand-500)' : 'var(--border-strong)',
          position: 'relative', transition: 'background 0.25s', cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: 'white',
          position: 'absolute', top: 3, left: enabled ? 21 : 3,
          transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)'
        }} />
      </button>
    </div>
  )
}
