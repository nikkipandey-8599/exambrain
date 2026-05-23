import { useState, useEffect } from 'react'

const KEY_STREAK = 'exambrain-streak'
const KEY_LAST = 'exambrain-last-study'
const KEY_HEATMAP = 'exambrain-heatmap'
const KEY_BADGES = 'exambrain-badges'

export function useStreak() {
  const [streak, setStreak] = useState(0)
  const [heatmap, setHeatmap] = useState({})
  const [badges, setBadges] = useState([])
  const [newBadge, setNewBadge] = useState(null)

  useEffect(() => {
    const s = parseInt(localStorage.getItem(KEY_STREAK) || '0')
    const last = localStorage.getItem(KEY_LAST)
    const h = JSON.parse(localStorage.getItem(KEY_HEATMAP) || '{}')
    const b = JSON.parse(localStorage.getItem(KEY_BADGES) || '[]')
    
    // Check if streak should reset
    if (last) {
      const lastDate = new Date(last)
      const today = new Date()
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
      if (diffDays > 1) {
        localStorage.setItem(KEY_STREAK, '0')
        setStreak(0)
      } else {
        setStreak(s)
      }
    }
    setHeatmap(h)
    setBadges(b)
  }, [])

  function recordStudy(sessions, score) {
    const today = new Date().toISOString().split('T')[0]
    const last = localStorage.getItem(KEY_LAST)
    const lastDate = last ? new Date(last).toISOString().split('T')[0] : null
    
    // Update heatmap
    const h = JSON.parse(localStorage.getItem(KEY_HEATMAP) || '{}')
    h[today] = (h[today] || 0) + 1
    localStorage.setItem(KEY_HEATMAP, JSON.stringify(h))
    setHeatmap({...h})

    // Update streak
    let currentStreak = parseInt(localStorage.getItem(KEY_STREAK) || '0')
    if (lastDate !== today) {
      currentStreak = lastDate === getPrevDay(today) ? currentStreak + 1 : 1
      localStorage.setItem(KEY_STREAK, String(currentStreak))
      localStorage.setItem(KEY_LAST, today)
      setStreak(currentStreak)
    }

    // Check badges
    const existingBadges = JSON.parse(localStorage.getItem(KEY_BADGES) || '[]')
    const newBadges = []
    const allSessions = parseInt(localStorage.getItem('exambrain-total-sessions') || '0') + 1
    localStorage.setItem('exambrain-total-sessions', String(allSessions))

    const badgeChecks = [
      { id: 'first', label: 'First Session!', emoji: '🎯', check: allSessions === 1 },
      { id: 'streak3', label: '3 Day Streak', emoji: '🔥', check: currentStreak === 3 },
      { id: 'streak7', label: '7 Day Streak', emoji: '⚡', check: currentStreak === 7 },
      { id: 'perfect', label: 'Perfect Score', emoji: '🏆', check: score === 100 },
      { id: 'sessions10', label: '10 Sessions', emoji: '📚', check: allSessions === 10 },
      { id: 'sessions25', label: '25 Sessions', emoji: '🎓', check: allSessions === 25 },
    ]

    badgeChecks.forEach(b => {
      if (b.check && !existingBadges.includes(b.id)) {
        newBadges.push(b)
        existingBadges.push(b.id)
      }
    })

    if (newBadges.length > 0) {
      localStorage.setItem(KEY_BADGES, JSON.stringify(existingBadges))
      setBadges(existingBadges)
      setNewBadge(newBadges[0])
      setTimeout(() => setNewBadge(null), 4000)
    }

    return currentStreak
  }

  function getPrevDay(dateStr) {
    const d = new Date(dateStr)
    d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
  }

  return { streak, heatmap, badges, newBadge, recordStudy }
}
