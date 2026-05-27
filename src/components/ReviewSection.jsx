import { useState, useEffect, useCallback } from 'react'
import { Star, Send, ThumbsUp, MessageSquare, ChevronDown, ChevronUp, Shield, Trash2, Reply, Bell, Edit2, X, Check } from 'lucide-react'
import { supabase } from '../services/supabase'
import { showToast } from './Toast'

const ADMIN_EMAIL = 'nikkipandey392@gmail.com' // ← change to your email

function getFingerprint() {
  const key = 'exambrain-fp'
  let fp = localStorage.getItem(key)
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(key, fp)
  }
  return fp
}

async function fetchReviews() {
  const { data, error } = await supabase
    .from('reviews').select('*')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data || []
}

function StarRating({ value, onChange, size = 28, readonly = false }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <button key={i}
          onClick={() => !readonly && onChange?.(i)}
          onMouseEnter={() => !readonly && setHovered(i)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{ background: 'none', border: 'none', cursor: readonly ? 'default' : 'pointer', padding: 0 }}
        >
          <Star size={size}
            fill={(hovered || value) >= i ? '#f59e0b' : 'none'}
            color={(hovered || value) >= i ? '#f59e0b' : 'var(--border-strong)'}
            style={{ transform: (hovered || value) >= i ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.15s' }}
          />
        </button>
      ))}
    </div>
  )
}

const CATEGORIES = [
  { id: 'ui',         label: '🎨 UI/Design' },
  { id: 'ai_quality', label: '🤖 AI Quality' },
  { id: 'feature',    label: '✨ Feature Request' },
  { id: 'bug',        label: '🐛 Bug Report' },
  { id: 'general',    label: '💬 General' },
]

const STAR_LABELS = ['', 'Needs Work', 'Below Average', 'Good', 'Very Good', 'Excellent!']

// ── Review Card ───────────────────────────────────────
function ReviewCard({ review, isAdmin, currentUserId, onDelete, onReply, onEdit, onThumbsUp, onMarkSeen }) {
  const [liked, setLiked] = useState(false)
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyText, setReplyText] = useState(review.admin_reply || '')
  const [savingReply, setSavingReply] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editStars, setEditStars] = useState(review.stars)
  const [editMessage, setEditMessage] = useState(review.message)
  const [editCategory, setEditCategory] = useState(review.category)
  const [savingEdit, setSavingEdit] = useState(false)

  const isMyReview = currentUserId && review.user_id === currentUserId
  const hasNewReply = isMyReview && review.admin_reply &&
    !localStorage.getItem(`reply-seen-${review.id}`)

  const date = new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const cat = CATEGORIES.find(c => c.id === review.category)

  function handleMarkSeen() {
    localStorage.setItem(`reply-seen-${review.id}`, '1')
    onMarkSeen?.()
  }

  async function handleLike() {
    if (liked) return
    setLiked(true)
    const { error } = await supabase.from('reviews').update({ helpful: (review.helpful || 0) + 1 }).eq('id', review.id)
    if (!error) onThumbsUp(review.id, review.helpful || 0)
  }

  async function handleDelete() {
    if (!window.confirm('Delete this review permanently?')) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', review.id)
      if (error) throw error
      onDelete(review.id)
    } catch(e) {
      showToast.error('Delete failed: ' + e.message)
      setDeleting(false)
    }
  }

  async function handleSaveReply() {
    if (!replyText.trim()) return
    setSavingReply(true)
    try {
      const { error } = await supabase.from('reviews')
        .update({ admin_reply: replyText.trim(), admin_replied_at: new Date().toISOString() })
        .eq('id', review.id)
      if (error) throw error
      onReply(review.id, replyText.trim())
      setShowReplyBox(false)
    } catch(e) { showToast.error('Reply failed: ' + e.message) }
    finally { setSavingReply(false) }
  }

  async function handleSaveEdit() {
    if (!editStars) { showToast.error('Please select stars'); return }
    if (editMessage.trim().length < 10) { showToast.error('Write at least 10 characters'); return }
    setSavingEdit(true)
    try {
      const { error } = await supabase.from('reviews')
        .update({ stars: editStars, message: editMessage.trim(), category: editCategory, updated_at: new Date().toISOString() })
        .eq('id', review.id)
      if (error) throw error
      onEdit(review.id, { stars: editStars, message: editMessage.trim(), category: editCategory })
      setEditing(false)
      showToast.success('Review updated! ✅')
    } catch(e) { showToast.error('Update failed: ' + e.message) }
    finally { setSavingEdit(false) }
  }

  return (
    <div className="animate-slideUp" style={{
      background: hasNewReply ? 'rgba(79,110,247,0.04)' : 'var(--bg-secondary)',
      border: `1px solid ${hasNewReply ? 'rgba(79,110,247,0.35)' : 'var(--border)'}`,
      borderRadius: 14, padding: '1rem', marginBottom: 10, position: 'relative',
      transition: 'all 0.3s'
    }}>

      {/* New reply badge */}
      {hasNewReply && (
        <div onClick={handleMarkSeen} style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--brand-500)', color: 'white',
          fontSize: '0.65rem', fontWeight: 700, borderRadius: 99,
          padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5,
          cursor: 'pointer', boxShadow: '0 2px 12px rgba(79,110,247,0.5)',
          whiteSpace: 'nowrap', zIndex: 1
        }}>
          <Bell size={9} fill="white" /> ExamBrain Team replied to your review!
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, marginTop: hasNewReply ? 6 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: `hsl(${(review.name?.charCodeAt(0) || 70) * 17 % 360}, 60%, 45%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 700, color: 'white', flexShrink: 0
          }}>
            {review.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {review.name || 'Anonymous'}
              </p>
              {isMyReview && (
                <span style={{ fontSize: '0.62rem', background: 'rgba(79,110,247,0.1)', color: 'var(--brand-400)', borderRadius: 6, padding: '1px 6px', fontWeight: 600 }}>
                  You
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{date}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {!editing && <StarRating value={review.stars} size={14} readonly />}

          {/* Edit button — own review */}
          {isMyReview && !editing && !isAdmin && (
            <button onClick={() => setEditing(true)} title="Edit your review"
              style={{
                background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)',
                borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                color: 'var(--brand-400)', display: 'flex', alignItems: 'center', gap: 4,
                fontSize: '0.72rem', fontWeight: 500
              }}>
              <Edit2 size={11} /> Edit
            </button>
          )}

          {/* Delete button — admin only */}
          {isAdmin && (
            <button onClick={handleDelete} disabled={deleting} title="Delete review"
              style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 6, padding: '4px 8px', cursor: deleting ? 'not-allowed' : 'pointer',
                color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4,
                fontSize: '0.72rem', fontWeight: 500
              }}>
              <Trash2 size={11} /> {deleting ? '…' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      {/* Edit mode */}
      {editing ? (
        <div className="animate-slideDown" style={{ marginBottom: 10 }}>
          <div style={{ marginBottom: 10, textAlign: 'center' }}>
            <StarRating value={editStars} onChange={setEditStars} size={28} />
            {editStars > 0 && (
              <p style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600, marginTop: 4 }}>
                {STAR_LABELS[editStars]}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setEditCategory(c.id)} style={{
                padding: '0.3rem 0.65rem', borderRadius: 8, fontSize: '0.72rem',
                border: `1px solid ${editCategory === c.id ? 'var(--brand-500)' : 'var(--border)'}`,
                background: editCategory === c.id ? 'rgba(79,110,247,0.12)' : 'var(--bg-secondary)',
                color: editCategory === c.id ? 'var(--brand-400)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}>{c.label}</button>
            ))}
          </div>
          <textarea className="input-field" rows={3}
            value={editMessage} onChange={e => setEditMessage(e.target.value)}
            maxLength={500} style={{ fontSize: '0.85rem', marginBottom: 8, resize: 'vertical' }}
          />
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 8, textAlign: 'right' }}>
            {editMessage.length}/500
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSaveEdit} disabled={savingEdit}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'var(--brand-500)', color: 'white', border: 'none',
                borderRadius: 8, padding: '0.45rem 1rem', fontSize: '0.82rem',
                fontWeight: 600, cursor: savingEdit ? 'not-allowed' : 'pointer'
              }}>
              <Check size={13} /> {savingEdit ? 'Saving…' : 'Save Changes'}
            </button>
            <button onClick={() => { setEditing(false); setEditStars(review.stars); setEditMessage(review.message); setEditCategory(review.category) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 8, padding: '0.45rem 1rem', fontSize: '0.82rem',
                color: 'var(--text-muted)', cursor: 'pointer'
              }}>
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {cat && (
            <span style={{
              display: 'inline-block', fontSize: '0.68rem', fontWeight: 600,
              background: 'rgba(79,110,247,0.1)', color: 'var(--brand-400)',
              border: '1px solid rgba(79,110,247,0.2)', borderRadius: 6,
              padding: '2px 8px', marginBottom: 8
            }}>{cat.label}</span>
          )}
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
            {review.message}
          </p>
        </>
      )}

      {/* Admin reply */}
      {review.admin_reply && !editing && (
        <div onClick={handleMarkSeen} style={{
          background: 'rgba(79,110,247,0.06)', border: '1px solid rgba(79,110,247,0.2)',
          borderRadius: 10, padding: '0.75rem', marginBottom: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Shield size={12} color="var(--brand-400)" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-400)' }}>ExamBrain Team</span>
            {review.admin_replied_at && (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                · {new Date(review.admin_replied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {review.admin_reply}
          </p>
        </div>
      )}

      {/* Actions */}
      {!editing && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleLike} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: liked ? 'rgba(34,197,94,0.1)' : 'none',
            border: `1px solid ${liked ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
            borderRadius: 8, padding: '0.3rem 0.7rem', cursor: liked ? 'default' : 'pointer',
            fontSize: '0.75rem', color: liked ? 'var(--success)' : 'var(--text-muted)', transition: 'all 0.2s'
          }}>
            <ThumbsUp size={12} /> {review.helpful || 0} Helpful
          </button>

          {isAdmin && (
            <button onClick={() => setShowReplyBox(o => !o)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)',
              borderRadius: 8, padding: '0.3rem 0.7rem', cursor: 'pointer',
              fontSize: '0.75rem', color: 'var(--brand-400)'
            }}>
              <Reply size={12} /> {review.admin_reply ? 'Edit Reply' : 'Reply as Admin'}
            </button>
          )}
        </div>
      )}

      {/* Admin reply box */}
      {isAdmin && showReplyBox && (
        <div className="animate-slideDown" style={{ marginTop: 10 }}>
          <textarea className="input-field" rows={3}
            value={replyText} onChange={e => setReplyText(e.target.value)}
            placeholder="Write your reply as ExamBrain Team..."
            style={{ fontSize: '0.82rem', marginBottom: 6 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSaveReply} disabled={savingReply || !replyText.trim()}
              style={{
                background: 'var(--brand-500)', color: 'white', border: 'none',
                borderRadius: 8, padding: '0.4rem 1rem', fontSize: '0.8rem',
                fontWeight: 600, cursor: savingReply ? 'not-allowed' : 'pointer'
              }}>
              {savingReply ? 'Saving…' : 'Post Reply'}
            </button>
            <button onClick={() => setShowReplyBox(false)} style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 8,
              padding: '0.4rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer'
            }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────
export default function ReviewSection({ user, onUnseenChange }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [myReview, setMyReview] = useState(null) // existing review of current user
  const [stars, setStars] = useState(0)
  const [name, setName] = useState(user?.user_metadata?.full_name || '')
  const [category, setCategory] = useState('general')
  const [message, setMessage] = useState('')

  const isAdmin = user?.email === ADMIN_EMAIL
  const fingerprint = getFingerprint()

  const calcUnseen = useCallback((reviewList) => {
    if (!user) return 0
    return reviewList.filter(r =>
      r.user_id === user.id && r.admin_reply &&
      !localStorage.getItem(`reply-seen-${r.id}`)
    ).length
  }, [user])

  useEffect(() => {
    loadReviews()

    // Realtime subscription for new admin replies
    if (user) {
      const channel = supabase
        .channel('review-updates')
        .on('postgres_changes', {
          event: 'UPDATE', schema: 'public', table: 'reviews',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          setReviews(prev => {
            const updated = prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r)
            onUnseenChange?.(calcUnseen(updated))
            return updated
          })
        })
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    if (user?.user_metadata?.full_name) setName(user.user_metadata.full_name)
  }, [user])

  async function loadReviews() {
    setLoading(true)
    try {
      const data = await fetchReviews()
      setReviews(data)
      // Find own review
      if (user) {
        const own = data.find(r => r.user_id === user.id)
        setMyReview(own || null)
      } else {
        const fp = getFingerprint()
        const own = data.find(r => r.fingerprint === fp)
        setMyReview(own || null)
      }
      onUnseenChange?.(calcUnseen(data))
    } catch { }
    finally { setLoading(false) }
  }

  async function handleSubmit() {
    if (!stars) { showToast.error('Please give a star rating!'); return }
    if (message.trim().length < 10) { showToast.error('Write at least 10 characters'); return }
    if (myReview) { showToast.error('You already submitted a review!'); return }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('reviews').insert({
        stars, category, message: message.trim(),
        name: name.trim() || 'Anonymous',
        helpful: 0, hidden: false,
        user_id: user?.id || null,
        fingerprint: user?.id ? null : fingerprint
      })
      if (error) throw error
      showToast.success('Thanks for your feedback! 🙏')
      setStars(0); setMessage(''); setCategory('general')
      setShowForm(false)
      await loadReviews()
    } catch { showToast.error('Could not submit — try again') }
    finally { setSubmitting(false) }
  }

  function handleDelete(id) {
    setReviews(prev => prev.filter(r => r.id !== id))
    if (myReview?.id === id) setMyReview(null)
    showToast.success('Review deleted ✅')
  }

  function handleReply(id, reply) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, admin_reply: reply, admin_replied_at: new Date().toISOString() } : r))
  }

  function handleEdit(id, updates) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    setMyReview(prev => prev?.id === id ? { ...prev, ...updates } : prev)
  }

  function handleMarkSeen() {
    const unseen = calcUnseen(reviews)
    onUnseenChange?.(unseen - 1 < 0 ? 0 : unseen - 1)
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1)
    : 0
  const dist = [5,4,3,2,1].map(s => ({ stars: s, count: reviews.filter(r => r.stars === s).length }))
  const displayed = showAll ? reviews : reviews.slice(0, 3)
  const alreadyReviewed = !!myReview

  return (
    <div style={{ padding: '1.25rem', paddingBottom: '5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
            💬 Reviews & Feedback
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Help us improve ExamBrain</p>
        </div>

        {alreadyReviewed && !isAdmin ? (
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '0.4rem 0.75rem' }}>
            ✅ Reviewed
          </div>
        ) : !alreadyReviewed ? (
          <button onClick={() => setShowForm(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--brand-500)', color: 'white', border: 'none',
            borderRadius: 10, padding: '0.5rem 1rem', fontSize: '0.82rem',
            fontWeight: 600, cursor: 'pointer'
          }}>
            <MessageSquare size={14} />
            {showForm ? 'Cancel' : 'Write Review'}
          </button>
        ) : null}
      </div>

      {/* Review Form */}
      {showForm && !alreadyReviewed && (
        <div className="animate-slideDown card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            ✍️ Share your experience
          </h3>
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <StarRating value={stars} onChange={setStars} size={36} />
            {stars > 0 && (
              <p style={{ fontSize: '0.82rem', color: 'var(--warning)', fontWeight: 600, marginTop: 6 }}>
                {STAR_LABELS[stars]}
              </p>
            )}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Category</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)} style={{
                padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 500,
                border: `1px solid ${category === c.id ? 'var(--brand-500)' : 'var(--border)'}`,
                background: category === c.id ? 'rgba(79,110,247,0.12)' : 'var(--bg-secondary)',
                color: category === c.id ? 'var(--brand-400)' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.15s'
              }}>{c.label}</button>
            ))}
          </div>
          <input className="input-field" style={{ marginBottom: 10, fontSize: '0.88rem' }}
            placeholder="Your name (optional)" value={name}
            onChange={e => setName(e.target.value)} maxLength={40} />
          <textarea className="input-field" rows={4}
            placeholder="What do you think? What's working? What needs improvement?"
            value={message} onChange={e => setMessage(e.target.value)}
            maxLength={500} style={{ marginBottom: 6, fontSize: '0.88rem', resize: 'vertical' }} />
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'right' }}>
            {message.length}/500
          </p>
          <button onClick={handleSubmit} disabled={submitting || !stars || message.trim().length < 10}
            className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {submitting
              ? <><span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /> Submitting…</>
              : <><Send size={14} /> Submit Review</>}
          </button>
        </div>
      )}

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{avgRating}</p>
              <StarRating value={Math.round(Number(avgRating))} size={14} readonly />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ flex: 1 }}>
              {dist.map(({ stars: s, count }) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 8 }}>{s}</span>
                  <Star size={10} fill="#f59e0b" color="#f59e0b" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: 'var(--warning)', width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%', transition: 'width 0.6s' }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 14, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin banner */}
      {isAdmin && (
        <div style={{ background: 'rgba(79,110,247,0.06)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={14} color="var(--brand-400)" />
          <p style={{ fontSize: '0.78rem', color: 'var(--brand-400)', fontWeight: 600 }}>
            Admin Mode — delete reviews and reply as ExamBrain Team
          </p>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Loading reviews…
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '2rem', marginBottom: 8 }}>🌟</p>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Be the first to review!</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Your feedback helps make ExamBrain better.</p>
        </div>
      ) : (
        <>
          {displayed.map(r => (
            <ReviewCard
              key={r.id} review={r}
              isAdmin={isAdmin}
              currentUserId={user?.id}
              onDelete={handleDelete}
              onReply={handleReply}
              onEdit={handleEdit}
              onThumbsUp={(id, cur) => setReviews(prev => prev.map(x => x.id === id ? { ...x, helpful: cur + 1 } : x))}
              onMarkSeen={handleMarkSeen}
            />
          ))}
          {reviews.length > 3 && (
            <button onClick={() => setShowAll(o => !o)} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'none', border: '1px solid var(--border)', borderRadius: 10,
              padding: '0.65rem', color: 'var(--text-secondary)', fontSize: '0.82rem',
              fontWeight: 500, cursor: 'pointer', marginTop: 4
            }}>
              {showAll ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show all {reviews.length} reviews</>}
            </button>
          )}
        </>
      )}
    </div>
  )
}
