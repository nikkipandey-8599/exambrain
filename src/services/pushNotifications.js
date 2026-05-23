const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export async function requestPushPermission() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return false
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

export async function subscribeToPush() {
  try {
    const reg = await navigator.serviceWorker.ready
    if (!VAPID_PUBLIC_KEY) {
      // fallback: schedule local notification via setTimeout trick
      return scheduleDailyLocalReminder()
    }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })
    localStorage.setItem('exambrain-push-sub', JSON.stringify(sub))
    return true
  } catch {
    return scheduleDailyLocalReminder()
  }
}

export function scheduleDailyLocalReminder() {
  // Store desired reminder time; SW will fire it
  const now = new Date()
  const next = new Date(now)
  next.setDate(next.getDate() + 1)
  next.setHours(18, 0, 0, 0) // 6 PM
  localStorage.setItem('exambrain-reminder-time', next.toISOString())
  localStorage.setItem('exambrain-push-enabled', '1')
  return true
}

export function isPushEnabled() {
  return localStorage.getItem('exambrain-push-enabled') === '1'
}

export function disablePush() {
  localStorage.removeItem('exambrain-push-enabled')
  localStorage.removeItem('exambrain-reminder-time')
  localStorage.removeItem('exambrain-push-sub')
}

export async function showLocalNotification(title, body) {
  if (Notification.permission !== 'granted') return
  const reg = await navigator.serviceWorker.ready
  reg.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    tag: 'exambrain-reminder',
    renotify: true,
    actions: [{ action: 'open', title: 'Study Now' }]
  })
}
