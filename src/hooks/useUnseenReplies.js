import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export function useUnseenReplies(user) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!user) { setCount(0); return }
    checkUnseenReplies()

    // Real-time subscription — badge updates instantly when admin replies
    const channel = supabase
      .channel('reviews-replies')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'reviews',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.new.admin_reply && !localStorage.getItem(`reply-seen-${payload.new.id}`)) {
          setCount(c => c + 1)
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  async function checkUnseenReplies() {
    if (!user) return
    try {
      const { data } = await supabase
        .from('reviews')
        .select('id, admin_reply')
        .eq('user_id', user.id)
        .not('admin_reply', 'is', null)
        .eq('hidden', false)

      if (!data) return
      const unseen = data.filter(r => !localStorage.getItem(`reply-seen-${r.id}`))
      setCount(unseen.length)
    } catch { }
  }

  function markAllSeen(reviews) {
    reviews.forEach(r => {
      if (r.admin_reply) localStorage.setItem(`reply-seen-${r.id}`, '1')
    })
    setCount(0)
  }

  return { unseenCount: count, markAllSeen }
}
