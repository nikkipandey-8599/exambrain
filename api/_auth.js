// api/_auth.js
// Shared guard for the AI endpoints (generate.js, ocr.js).
// The leading underscore keeps Vercel from exposing this file as a route.
//
// 1. Verifies the caller's Supabase access token server-side.
// 2. Enforces per-user and global rate limits via the consume_ai_quota()
//    function in Supabase (see SUPABASE_RATE_LIMIT.sql). If the limiter is
//    unavailable the request is refused (fail closed).
//
// No new secrets are needed: it uses your existing Supabase URL and anon key
// (both are public values) and the caller's own token.
//
// Error messages avoid the word "key" on purpose: Home_analytics.jsx rewrites
// any error containing "key" into an "API key error" message.

const supabaseUrl = () => process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnon = () => process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const SB_TIMEOUT_MS = 5000
const TOKEN_CACHE_MS = 60 * 1000
const tokenCache = new Map() // token -> expiry timestamp (valid tokens only)

async function sbFetch(path, token, init = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SB_TIMEOUT_MS)
  try {
    return await fetch(`${supabaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        apikey: supabaseAnon(),
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  } finally {
    clearTimeout(timer)
  }
}

function fail(res, status, message, extraHeaders = {}) {
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v)
  res.status(status).json({ error: { message } })
  return null
}

/**
 * Call at the top of a handler:  const caller = await guard(req, res); if (!caller) return
 * Sends the error response itself and returns null when the request must stop.
 */
export async function guard(req, res) {
  if (!supabaseUrl() || !supabaseAnon()) {
    console.error('[ExamBrain] Supabase env vars missing on server (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)')
    return fail(res, 500, 'Server is not configured correctly.')
  }

  // ── 1. Identify the caller ───────────────────────────
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) return fail(res, 401, 'Please sign in to use this feature.')

  const cachedUntil = tokenCache.get(token)
  if (!cachedUntil || cachedUntil < Date.now()) {
    let userRes
    try {
      userRes = await sbFetch('/auth/v1/user', token)
    } catch (e) {
      console.error('[ExamBrain] Auth check failed:', e.message)
      return fail(res, 503, 'Could not verify your login. Please try again.')
    }

    if (userRes.status === 401 || userRes.status === 403) {
      tokenCache.delete(token)
      return fail(res, 401, 'Your session has expired. Please sign in again.')
    }
    if (!userRes.ok) {
      console.error('[ExamBrain] Auth check HTTP', userRes.status)
      return fail(res, 503, 'Could not verify your login. Please try again.')
    }

    const user = await userRes.json().catch(() => null)
    if (!user?.id) return fail(res, 401, 'Please sign in to use this feature.')

    if (tokenCache.size > 500) tokenCache.clear()
    tokenCache.set(token, Date.now() + TOKEN_CACHE_MS)
  }

  // ── 2. Rate limit (per user + global) ────────────────
  // Fails CLOSED: if the limiter cannot give a clear "allowed" answer, the request
  // is refused (503) instead of reaching the AI providers.
  // The limits themselves live in SUPABASE_RATE_LIMIT.sql, not here.
  const unavailable = () =>
    fail(res, 503, 'AI is temporarily unavailable. Please try again in a few minutes.', { 'Retry-After': '30' })

  let result
  try {
    const limitRes = await sbFetch('/rest/v1/rpc/consume_ai_quota', token, {
      method: 'POST',
      body: '{}'
    })
    if (!limitRes.ok) {
      const detail = await limitRes.text().catch(() => '')
      console.error('[ExamBrain] Rate limiter HTTP', limitRes.status, '- request refused.',
        'Has SUPABASE_RATE_LIMIT.sql been run?', detail.slice(0, 160))
      return unavailable()
    }
    result = await limitRes.json()
  } catch (e) {
    console.error('[ExamBrain] Rate limiter error - request refused:', e.message)
    return unavailable()
  }

  if (result?.allowed === true) return { token }

  if (result?.allowed === false) {
    if (result.reason === 'unauthenticated') {
      return fail(res, 401, 'Your session has expired. Please sign in again.')
    }
    const wait = Number(result.retry_after) || 60
    const message =
      result.reason === 'user_day'
        ? "You've reached today's AI limit. It resets within 24 hours."
        : result.reason === 'global'
          ? 'ExamBrain is very busy right now. Please try again in a minute.'
          : 'You are sending requests too quickly. Please wait a moment.'
    return fail(res, 429, message, { 'Retry-After': String(wait) })
  }

  // Unexpected response shape
  console.error('[ExamBrain] Rate limiter returned an unexpected result - request refused:', JSON.stringify(result))
  return unavailable()
}
