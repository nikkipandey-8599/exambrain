import { useState, useEffect } from 'react'
import { Star, Send, ThumbsUp, MessageSquare, ChevronDown, ChevronUp, Shield, Trash2, Reply } from 'lucide-react'
import { supabase } from '../services/supabase'
import { showToast } from './Toast'

// ── Admin config ──────────────────────────────────────
const ADMIN_EMAIL = 'nikkipandey392@gmail.com' // ← change this to your actual email

// ── Browser fingerprint for guest spam prevention ─────
function getFingerprint() {
  const key = 'exambrain-fp'
  let fp = localStorage.getItem(key)
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(key, fp)
  }
  return fp
}

// ── Supabase helpers ──────────────────────────────────
async function checkAlreadyReviewed(userId, fingerprint) {
  if (userId) {
    const { data } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
    return data && data.length > 0
  }
  const { data } = await supabase
    .from('reviews')
    .select('id')
    .eq('fingerprint', fingerprint)
    .limit(1)
  return data && data.length > 0
}

async function submitReview(review) {
  const { error } = await supabase.from('reviews').insert(review)
  if (error) throw error
}

async function fetchReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data || []
}

async function hideReview(id) {
  const { error } = await supabase
    .from('reviews')
    .update({ hidden: true })
    .eq('id', id)
  if (error) throw error
}

async function addAdminReply(id, reply) {
  const { error } = await supabase
    .from('reviews')
    .update({ admin_reply: reply, admin_replied_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

async function thumbsUp(id, current) {
  const { error } = await supabase
    .from('reviews')
    .update({ helpful: current + 1 })
    .eq('id', id)
  if (error) throw error
}

// ── Star Rating ───────────────────────────────────────
function StarRating({ value, onChange, size = 28, readonly = false }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <button key={i} onClick={() => !readonly && onChange?.(i)}
          onMouseEnter={() => !readonly && setHovered(i)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{ background: 'none', border: 'none', cursor: readonly ? 'default' : 'pointer', padding: 0 }}>
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
  { id: 'ui', label: '🎨 UI/Design' },
  { id: 'ai_quality', label: '🤖 AI Quality' },
  { id: 'feature', label: '✨ Feature Request' },
  { id: 'bug', label: '🐛 Bug Report' },
  { id: 'general', label: '💬 General' },
]

const STAR_LABELS = ['', 'Needs Work', 'Below Average', 'Good', 'Very Good', 'Excellent!']

// ── Review Card ───────────────────────────────────────
function ReviewCard({ review, isAdmin, onHide, onReply, onThumbsUp }) {
  const [liked, setLiked] = useState(false)
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyText, setReplyText] = useState(review.admin_reply || '')
  const [savingReply, setSavingReply] = useState(false)
  const date = new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const cat = CATEGORIES.find(c => c.id === review.category)

  async function handleLike() {
    if (liked) return
    setLiked(true)
    await onThumbsUp(review.id, review.helpful || 0)
  }

  async function handleSaveReply() {
    if (!replyText.trim()) return
    setSavingReply(true)
    await onReply(review.id, replyText.trim())
    setShowReplyBox(false)
    setSavingReply(false)
  }

  return (
    <div className="animate-slideUp" style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '1rem', marginBottom: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
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
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{review.name || 'Anonymous'}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{date}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StarRating value={review.stars} size={14} readonly />
          {isAdmin && (
            <button onClick={() => onHide(review.id)} title="Hide spam"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '3px 6px', cursor: 'pointer', color: 'var(--danger)' }}>
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

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

      {/* Admin reply display */}
      {review.admin_reply && (
        <div style={{
          background: 'rgba(79,110,247,0.06)', border: '1px solid rgba(79,110,247,0.2)',
          borderRadius: 10, padding: '0.75rem', marginBottom: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Shield size={12} color="var(--brand-400)" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-400)' }}>ExamBrain Team</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{review.admin_reply}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
            <Reply size={12} /> Reply as Admin
          </button>
        )}
      </div>

      {/* Admin reply box */}
      {isAdmin && showReplyBox && (
        <div className="animate-slideDown" style={{ marginTop: 10 }}>
          <textarea
            className="input-field"
            rows={3}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Write your reply as ExamBrain Team..."
            style={{ fontSize: '0.82rem', marginBottom: 6 }}
          />
          <button onClick={handleSaveReply} disabled={savingReply || !replyText.trim()}
            style={{
              background: 'var(--brand-500)', color: 'white', border: 'none',
              borderRadius: 8, padding: '0.4rem 1rem', fontSize: '0.8rem',
              fontWeight: 600, cursor: 'pointer'
            }}>
            {savingReply ? 'Saving…' : 'Post Reply'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────
export default function ReviewSection({ user }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)

  const [stars, setStars] = useState(0)
  const [name, setName] = useState(user?.user_metadata?.full_name || '')
  const [category, setCategory] = useState('general')
  const [message, setMessage] = useState('')

  const isAdmin = user?.email === ADMIN_EMAIL
  const fingerprint = getFingerprint()

  useEffect(() => { loadReviews() }, [])

  useEffect(() => {
    if (user?.user_metadata?.full_name) setName(user.user_metadata.full_name)
  }, [user])

  useEffect(() => {
    checkAlreadyReviewed(user?.id, fingerprint).then(setAlreadyReviewed)
  }, [user])

  async function loadReviews() {
    setLoading(true)
    try { setReviews(await fetchReviews()) }
    catch { /* silent */ }
    finally { setLoading(false) }
  }

  async function handleSubmit() {
    if (!stars) { showToast.error('Please give a star rating!'); return }
    if (message.trim().length < 10) { showToast.error('Please write at least 10 characters'); return }

    // Check spam again before submit
    const already = await checkAlreadyReviewed(user?.id, fingerprint)
    if (already) {
      setAlreadyReviewed(true)
      showToast.error('You have already submitted a review!')
      setShowForm(false)
      return
    }

    setSubmitting(true)
    try {
      await submitReview({
        stars, category, message: message.trim(),
        name: name.trim() || 'Anonymous',
        helpful: 0, hidden: false,
        user_id: user?.id || null,
        fingerprint: user?.id ? null : fingerprint // only store fingerprint for guests
      })
      showToast.success('Thanks for your feedback! 🙏')
      setStars(0); setMessage(''); setCategory('general')
      setShowForm(false)
      setAlreadyReviewed(true)
      await loadReviews()
    } catch (e) {
      showToast.error('Could not submit — please try again')
    } finally { setSubmitting(false) }
  }

  async function handleHide(id) {
    await hideReview(id)
    setReviews(prev => prev.filter(r => r.id !== id))
    showToast.success('Review hidden')
  }

  async function handleReply(id, reply) {
    await addAdminReply(id, reply)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, admin_reply: reply } : r))
    showToast.success('Reply posted!')
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1) : 0
  const dist = [5,4,3,2,1].map(s => ({ stars: s, count: reviews.filter(r => r.stars === s).length }))
  const displayed = showAll ? reviews : reviews.slice(0, 3)

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
            ✅ Review submitted
          </div>
        ) : (
          <button onClick={() => setShowForm(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--brand-500)', color: 'white', border: 'none',
            borderRadius: 10, padding: '0.5rem 1rem', fontSize: '0.82rem',
            fontWeight: 600, cursor: 'pointer'
          }}>
            <MessageSquare size={14} />
            {showForm ? 'Cancel' : 'Write Review'}
          </button>
        )}
      </div>

      {/* Sign in prompt for second review */}
      {alreadyReviewed && !user && !isAdmin && (
        <div className="animate-slideDown" style={{
          background: 'rgba(79,110,247,0.06)', border: '1px solid rgba(79,110,247,0.2)',
          borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1 }}>
            Want to update your review? Sign in to manage it.
          </p>
        </div>
      )}

      {/* Review Form */}
      {showForm && !alreadyReviewed && (
        <div className="animate-slideDown card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            ✍️ Share your experience
          </h3>

          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <StarRating value={stars} onChange={setStars} size={36} />
            {stars > 0 && (
              <p className="animate-slideDown" style={{ fontSize: '0.82rem', color: 'var(--warning)', fontWeight: 600, marginTop: 6 }}>
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
            placeholder="What do you think? What's working well? What would you like improved?"
            value={message} onChange={e => setMessage(e.target.value)}
            maxLength={500} style={{ marginBottom: 6, fontSize: '0.88rem', resize: 'vertical' }} />
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'right' }}>
            {message.length}/500
          </p>

          <button onClick={handleSubmit} disabled={submitting || !stars || message.trim().length < 10}
            className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {submitting ? (
              <><span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /> Submitting…</>
            ) : (
              <><Send size={14} /> Submit Review</>
            )}
          </button>
        </div>
      )}

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{avgRating}</p>
              <StarRating value={Math.round(avgRating)} size={14} readonly />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
            <div style={{ flex: 1 }}>
              {dist.map(({ stars: s, count }) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 8 }}>{s}</span>
                  <Star size={10} fill="#f59e0b" color="#f59e0b" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: 'var(--warning)', width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%', transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 14, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin panel */}
      {isAdmin && (
        <div style={{ background: 'rgba(79,110,247,0.06)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={14} color="var(--brand-400)" />
          <p style={{ fontSize: '0.78rem', color: 'var(--brand-400)', fontWeight: 600 }}>Admin Mode — you can hide spam and reply to reviews</p>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '2rem', marginBottom: 8 }}>🌟</p>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Be the first to review!</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Your feedback helps make ExamBrain better.</p>
        </div>
      ) : (
        <>
          {displayed.map(r => (
            <ReviewCard key={r.id} review={r} isAdmin={isAdmin}
              onHide={handleHide} onReply={handleReply}
              onThumbsUp={async (id, cur) => {
                await thumbsUp(id, cur)
                setReviews(prev => prev.map(x => x.id === id ? { ...x, helpful: cur + 1 } : x))
              }} />
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
