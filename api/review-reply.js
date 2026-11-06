
const ADMIN_EMAIL = 'nikkipandey392@gmail.com'

const json = (res, status, body) =>
  res.status(status).json(body)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' })
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const resendKey = process.env.RESEND_API_KEY

  if (!url || !anon || !serviceKey || !resendKey) {
    return json(res, 500, { error: 'Server configuration missing' })
  }

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')

  if (!token || token === req.headers.authorization) {
    return json(res, 401, { error: 'Please sign in' })
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  }

  try {
    // Verify the person making this request
    const authRes = await fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${token}`
      }
    })

    if (!authRes.ok) {
      return json(res, 401, { error: 'Invalid session' })
    }

    const admin = await authRes.json()

    if (admin.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return json(res, 403, { error: 'Admin access required' })
    }

    const { reviewId, reply } = req.body || {}

    if (
      typeof reviewId !== 'string' ||
      !/^[0-9a-f-]{36}$/i.test(reviewId) ||
      typeof reply !== 'string' ||
      !reply.trim() ||
      reply.trim().length > 5000
    ) {
      return json(res, 400, { error: 'Invalid review or reply' })
    }

    // Find the review and its actual owner
    const reviewRes = await fetch(
      `${url}/rest/v1/reviews?id=eq.${encodeURIComponent(reviewId)}&select=*`,
      { headers }
    )

    if (!reviewRes.ok) {
      throw new Error('Could not retrieve review')
    }

    const reviews = await reviewRes.json()
    const review = reviews[0]

    if (!review) {
      return json(res, 404, { error: 'Review not found' })
    }

    // Save the admin reply
    const replyText = reply.trim()

    const updateRes = await fetch(
      `${url}/rest/v1/reviews?id=eq.${encodeURIComponent(reviewId)}`,
      {
        method: 'PATCH',
        headers: {
          ...headers,
          Prefer: 'return=representation'
        },
        body: JSON.stringify({
          admin_reply: replyText,
          admin_replied_at: new Date().toISOString()
        })
      }
    )

    if (!updateRes.ok) {
      throw new Error('Could not save review reply')
    }

    // Guest reviews have no account email
    if (!review.user_id) {
      return json(res, 200, {
        success: true,
        emailSent: false,
        reason: 'Guest review has no registered email'
      })
    }

    // Match the review's user ID with their Auth email
    const userRes = await fetch(
      `${url}/auth/v1/admin/users/${encodeURIComponent(review.user_id)}`,
      { headers }
    )

    if (!userRes.ok) {
      console.error('Could not retrieve review owner email')
      return json(res, 200, {
        success: true,
        emailSent: false,
        reason: 'Could not retrieve user email'
      })
    }

    const userData = await userRes.json()
    const recipient = userData.user?.email || userData.email

    if (!recipient) {
      return json(res, 200, {
        success: true,
        emailSent: false,
        reason: 'No email registered'
      })
    }

    // Escape user-generated content before putting it in HTML
    const escapeHtml = value =>
      String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char])

    const safeName = escapeHtml(review.name || 'there')
    const safeMessage = escapeHtml(review.message || '')
    const safeReply = escapeHtml(replyText)

    // Send notification using Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'ExamBrain <noreply@exambrain.me>',
        to: [recipient],
        subject: 'ExamBrain Team replied to your review 💬',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#333">
            <h2 style="color:#754c24">ExamBrain 💛</h2>
            <p>Hi ${safeName},</p>
            <p>The ExamBrain Team has replied to your review!</p>

            <div style="background:#f8f4ed;padding:16px;border-radius:10px;margin:20px 0">
              <strong>Your review</strong>
              <p>${safeMessage}</p>
            </div>

            <div style="background:#f0e8db;padding:16px;border-radius:10px;margin:20px 0">
              <strong>ExamBrain Team replied:</strong>
              <p style="white-space:pre-wrap">${safeReply}</p>
            </div>

            <p>Thank you for helping us improve ExamBrain!</p>
            <a href="https://exambrain.me"
              style="display:inline-block;background:#754c24;color:white;padding:12px 22px;border-radius:8px;text-decoration:none">
              Visit ExamBrain
            </a>
          </div>
        `
      })
    })

    if (!emailRes.ok) {
      const error = await emailRes.text()
      console.error('Resend email error:', error)

      return json(res, 200, {
        success: true,
        emailSent: false,
        reason: 'Reply saved, but email delivery failed'
      })
    }

    return json(res, 200, {
      success: true,
      emailSent: true
    })

  } catch (error) {
    console.error('Review reply error:', error.message)

    return json(res, 500, {
      error: 'Could not process review reply'
    })
  }
}
