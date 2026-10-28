// api/generate.js
// Single AI endpoint for ExamBrain. Tries providers in order and returns the
// first good answer, so the client never has to know which one responded.
//
// Order (default): OpenRouter -> NVIDIA -> Gemini -> Groq
// Providers without an API key set are skipped automatically.
//
// Request body : { messages, temperature?, max_tokens?, json? }   (json defaults to true)
// Response body: { choices: [{ message: { role, content } }], provider, model }
//                (OpenAI-shaped, so existing client code keeps working)

import { guard } from './_auth.js'

// Timing: auth + rate-limit checks and every model attempt all count toward the
// total budget, which must stay safely under maxDuration (60s in vercel.json).
const ATTEMPT_TIMEOUT_MS = Number(process.env.AI_ATTEMPT_TIMEOUT_MS || 30000) // max time for one model attempt
const TOTAL_BUDGET_MS = 55000 // hard stop for the whole request, measured from the start of the handler
const MAX_PROMPT_CHARS = 60000 // notes are capped at 30,000 chars in the app; this blocks oversized abuse

const csv = (value, fallback) =>
  (value || fallback).split(',').map(s => s.trim()).filter(Boolean)

// ── Provider definitions ───────────────────────────────
const PROVIDERS = {
  openrouter: {
    key: () => process.env.OPENROUTER_API_KEY,
    models: () =>
      csv(
        process.env.OPENROUTER_MODELS,
        'meta-llama/llama-3.3-70b-instruct:free'
      ),
    run: (ctx) =>
      openAICompatible({
        ...ctx,
        url: 'https://openrouter.ai/api/v1/chat/completions',
        headers: {
          'HTTP-Referer': 'https://exambrain.me',
          'X-Title': 'ExamBrain'
        }
      })
  },

  nvidia: {
    key: () => process.env.NVIDIA_API_KEY,
    models: () => csv(process.env.NVIDIA_MODELS, 'meta/llama-3.3-70b-instruct'),
    run: (ctx) =>
      openAICompatible({
        ...ctx,
        url: 'https://integrate.api.nvidia.com/v1/chat/completions',
        headers: {}
      })
  },

  gemini: {
    key: () => process.env.GEMINI_API_KEY,
    models: () => csv(process.env.GEMINI_MODEL, 'gemini-3.6-flash'),
    run: (ctx) => geminiNative(ctx)
  },

  groq: {
    key: () => process.env.GROQ_API_KEY,
    models: () => csv(process.env.GROQ_MODEL, 'llama-3.3-70b-versatile'),
    // Groq's free tier has a small tokens-per-minute cap. A request bigger than the
    // cap can never succeed, so skip Groq for big jobs and keep it for small ones (grading).
    canHandle: ({ messages, max_tokens }) => {
      const chars = messages.reduce((n, m) => n + String(m.content || '').length, 0)
      const estimatedTokens = Math.ceil(chars / 4) + max_tokens
      return estimatedTokens <= Number(process.env.GROQ_TPM_LIMIT || 6000)
    },
    run: (ctx) =>
      openAICompatible({
        ...ctx,
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {}
      })
  }
}

// ── Runners ────────────────────────────────────────────
// OpenAI-compatible chat completions (OpenRouter, NVIDIA, Groq)
async function openAICompatible({ url, headers, key, model, messages, temperature, max_tokens, json, signal }) {
  const send = (jsonMode) =>
    fetch(url, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        ...headers
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
      })
    })

  let res = await send(json)
  // Some models reject JSON mode — retry once without it
  if (json && (res.status === 400 || res.status === 422)) res = await send(false)

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${body.slice(0, 160)}`)
  }

  const data = await res.json()
  // OpenRouter can return HTTP 200 with an error object inside
  if (data?.error) throw new Error(data.error.message || 'Provider returned an error')

  const choice = data?.choices?.[0]
  return { text: choice?.message?.content || '', finish: choice?.finish_reason }
}

// Google Gemini native API
async function geminiNative({ key, model, messages, temperature, max_tokens, json, signal }) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(m.content || '') }]
        })),
        generationConfig: {
          temperature,
          maxOutputTokens: max_tokens,
          ...(json ? { responseMimeType: 'application/json' } : {})
        }
      })
    }
  )

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${body.slice(0, 160)}`)
  }

  const data = await res.json()
  const candidate = data?.candidates?.[0]
  return {
    text: candidate?.content?.parts?.map(p => p.text || '').join('') || '',
    finish: candidate?.finishReason === 'MAX_TOKENS' ? 'length' : candidate?.finishReason
  }
}

// ── Helpers ────────────────────────────────────────────
// Returns clean JSON text, or null if the model's output isn't valid JSON
function toValidJson(text) {
  const cleaned = String(text || '').replace(/```json|```/gi, '').trim()
  try {
    JSON.parse(cleaned)
    return cleaned
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end > start) {
      const slice = cleaned.slice(start, end + 1)
      try {
        JSON.parse(slice)
        return slice
      } catch {
        return null
      }
    }
    return null
  }
}

function buildAttempts(request) {
  const order = csv(process.env.AI_PROVIDER_ORDER, 'openrouter,nvidia,gemini,groq')
  const attempts = []
  for (const name of order) {
    const provider = PROVIDERS[name]
    if (!provider || !provider.key()) continue
    if (provider.canHandle && !provider.canHandle(request)) continue
    for (const model of provider.models()) attempts.push({ name, provider, model })
  }
  return attempts
}

// ── Handler ────────────────────────────────────────────
export default async function handler(req, res) {
  const startedAt = Date.now() // budget starts here, so auth time is counted

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }

  // Must be signed in and within rate limits (sends its own error response)
  const caller = await guard(req, res)
  if (!caller) return

  const body = req.body || {}
  const messages = Array.isArray(body.messages) ? body.messages : []
  if (!messages.length) {
    return res.status(400).json({ error: { message: 'messages is required' } })
  }

  const totalChars = messages.reduce((n, m) => n + String(m?.content ?? '').length, 0)
  if (totalChars > MAX_PROMPT_CHARS) {
    return res.status(413).json({ error: { message: 'Request is too large.' } })
  }

  const request = {
    messages: messages.map(m => ({
      role: m.role === 'assistant' || m.role === 'system' ? m.role : 'user',
      content: String(m.content ?? '')
    })),
    temperature: Math.min(Math.max(Number(body.temperature ?? 0.3), 0), 1),
    max_tokens: Math.min(Math.max(parseInt(body.max_tokens, 10) || 4096, 1), 8192),
    json: body.json !== false // JSON mode is the default; hints send json:false
  }

  const attempts = buildAttempts(request)
  if (!attempts.length) {
    console.error('[ExamBrain] No AI provider configured. Set OPENROUTER_API_KEY and/or NVIDIA_API_KEY in Vercel.')
    return res.status(500).json({
      error: { message: 'AI is not set up on the server yet.' }
    })
  }

  const failures = []

  for (const { name, provider, model } of attempts) {
    const remaining = TOTAL_BUDGET_MS - (Date.now() - startedAt)
    if (remaining < 3000) break

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), Math.min(ATTEMPT_TIMEOUT_MS, remaining))

    try {
      const { text, finish } = await provider.run({
        ...request,
        key: provider.key(),
        model,
        signal: controller.signal
      })

      if (!text.trim()) throw new Error('Empty response')

      let content = text
      if (request.json) {
        // A cut-off or malformed answer is useless — fall through to the next model
        const valid = finish === 'length' ? null : toValidJson(text)
        if (!valid) throw new Error(finish === 'length' ? 'Output truncated' : 'Invalid JSON output')
        content = valid
      }

      console.log('[ExamBrain] AI ok:', { provider: name, model, ms: Date.now() - startedAt })
      return res.status(200).json({
        choices: [{ message: { role: 'assistant', content } }],
        provider: name,
        model
      })
    } catch (e) {
      const reason = e.name === 'AbortError' ? 'Timed out' : e.message
      failures.push(`${name}/${model}: ${reason}`)
      console.warn('[ExamBrain] AI attempt failed:', name, model, reason)
    } finally {
      clearTimeout(timer)
    }
  }

  console.error('[ExamBrain] All AI providers failed:', failures)
  return res.status(502).json({
    error: { message: 'AI is busy right now. Please try again in a minute.' }
  })
}
