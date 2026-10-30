// api/generate.js
// ExamBrain AI endpoint
// Provider priority: OpenRouter -> NVIDIA -> Gemini -> Groq
// (change the order with the AI_PROVIDER_ORDER environment variable)
//
// Request:  { messages, temperature?, max_tokens?, json? }
// Response: { choices: [{ message: { role, content } }], provider, model }
//
// How fallback works:
//   - A provider that fails (404, 403, 429, bad JSON, ...) is skipped immediately.
//   - A provider that is merely SLOW is NOT killed. After AI_STAGGER_MS the next
//     provider is started as well, and whichever returns a valid answer first wins.
//   - Everything stops at AI_TOTAL_BUDGET_MS, which must stay below the function's
//     maxDuration in vercel.json.

import { guard } from './_auth.js'

// Total time for the whole request (login check + all AI attempts), in ms.
// Default 55s fits the 60s maxDuration. If Fluid Compute is on (Vercel allows up to
// 300s on Hobby), raise maxDuration in vercel.json and set e.g. AI_TOTAL_BUDGET_MS=110000.
const TOTAL_BUDGET_MS = Math.min(
  Number(process.env.AI_TOTAL_BUDGET_MS) || 55000,
  290000
)

// How long to wait on one provider before also starting the next one.
// Big requests (full quiz) are slow, so they wait longer than small ones (hints, grading).
const STAGGER_MS = Number(process.env.AI_STAGGER_MS) || 25000
const STAGGER_SMALL_MS = 8000

const MAX_PROMPT_CHARS = 60000

// Reasoning models spend part of max_tokens on "thinking". A tiny limit (e.g. 150 for
// hints) can leave nothing for the answer, so never go below this. It is only a ceiling.
const MIN_OUTPUT_TOKENS = 1024

const csv = (value, fallback) =>
  (value || fallback)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

// Wait that can be cancelled (so a finished request never leaves a timer running).
const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer)
      const error = new Error('aborted')
      error.name = 'AbortError'
      reject(error)
    }

    if (signal?.aborted) return abort()

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, ms)

    signal?.addEventListener('abort', abort, { once: true })
  })

// ─────────────────────────────────────────────────────
// PROVIDERS
// ─────────────────────────────────────────────────────

const PROVIDERS = {
  // 1. OpenRouter — primary provider
  openrouter: {
    key: () => process.env.OPENROUTER_API_KEY,

    // Pinned models on purpose, NOT "openrouter/free": that router picks a RANDOM free
    // model every time, including tiny ones (a 2.6B model was picked in production) that
    // cannot write a full quiz. Slugs are from OpenRouter's free list (Oct 2026). Free
    // models change often: set OPENROUTER_MODELS (comma-separated) when one disappears.
    models: () =>
      csv(
        process.env.OPENROUTER_MODELS,
        'google/gemma-4-31b-it:free,nvidia/nemotron-3-ultra-550b-a55b:free,google/gemma-4-26b-a4b-it:free'
      ),

    run: ctx =>
      openAICompatible({
        ...ctx,
        url: 'https://openrouter.ai/api/v1/chat/completions',
        headers: {
          'HTTP-Referer': 'https://exambrain.me',
          'X-Title': 'ExamBrain'
        },
        // Reasoning models count their "thinking" against max_tokens. Uncapped, a model can
        // spend the whole budget thinking and return an EMPTY answer (finish_reason "length").
        // Models without this setting ignore it, or the request is retried without it.
        extra: { reasoning: { effort: 'low' } }
      })
  },

  // 2. NVIDIA — second provider
  nvidia: {
    key: () => process.env.NVIDIA_API_KEY,

    // NOTE (Oct 2026): many personal NVIDIA accounts get "403 Authorization failed" on chat
    // completions because the "Public API Endpoints" permission is missing on the account.
    // That is on NVIDIA's side, not a code or key problem. A 403 returns instantly, so
    // leaving NVIDIA in the list costs nothing.
    models: () =>
      csv(
        process.env.NVIDIA_MODELS,
        'nvidia/nemotron-3-super-120b-a12b'
      ),

    run: ctx =>
      openAICompatible({
        ...ctx,
        url: 'https://integrate.api.nvidia.com/v1/chat/completions',
        headers: {}
      })
  },

  // 3. Gemini — third provider
  // Free-tier quotas are per MODEL. As of Oct 2026, gemini-3.6-flash allows only about
  // 20 requests/day (5/min) while each Flash-Lite model allows about 500/day (10/min).
  // So the Lite models go first and 3.6 Flash is the last resort. Check your real limits
  // in Google AI Studio -> Rate limits. Override with GEMINI_MODEL (comma-separated).
  gemini: {
    key: () => process.env.GEMINI_API_KEY,

    models: () =>
      csv(
        process.env.GEMINI_MODEL,
        'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3.6-flash'
      ),

    run: ctx => geminiNative(ctx)
  },

  // Optional extra provider. Not used unless "mistral" is in AI_PROVIDER_ORDER AND
  // MISTRAL_API_KEY is set. Mistral says its free tier is "to try and explore the API"
  // (not for production) and publishes no fixed limits (see console.mistral.ai/limits),
  // so treat it as an extra fallback only. The default model alias is untested.
  mistral: {
    key: () => process.env.MISTRAL_API_KEY,

    models: () =>
      csv(
        process.env.MISTRAL_MODEL,
        'mistral-small-latest'
      ),

    run: ctx =>
      openAICompatible({
        ...ctx,
        url: 'https://api.mistral.ai/v1/chat/completions',
        headers: {}
      })
  },

  // 4. Groq — last fallback
  // llama-3.3-70b-versatile and llama-3.1-8b-instant were shut down on 2026-08-16.
  // Groq's recommended replacement is openai/gpt-oss-120b.
  groq: {
    key: () => process.env.GROQ_API_KEY,

    models: () =>
      csv(
        process.env.GROQ_MODEL,
        'openai/gpt-oss-120b'
      ),

    // Groq's free tier has a small tokens-per-minute cap, so it only handles small
    // jobs (grading, hints). A full quiz needs far more output than fits, so it is skipped.
    canHandle: ({ messages, max_tokens }) => {
      const chars = messages.reduce(
        (total, message) =>
          total + String(message.content || '').length,
        0
      )

      const estimatedInputTokens = Math.ceil(chars / 4)

      return estimatedInputTokens <= 3500 && max_tokens <= 2048
    },

    run: ctx =>
      openAICompatible({
        ...ctx,
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {},
        // gpt-oss models are reasoning models; "low" keeps them fast and cheap.
        // If Groq rejects the parameter, the request is retried without it.
        extra: /gpt-oss/i.test(ctx.model) ? { reasoning_effort: 'low' } : {}
      })
  }
}

// ─────────────────────────────────────────────────────
// OPENAI-COMPATIBLE PROVIDERS
// OpenRouter, NVIDIA and Groq
// ─────────────────────────────────────────────────────

async function openAICompatible({
  url,
  headers,
  key,
  model,
  messages,
  temperature,
  max_tokens,
  json,
  signal,
  extra = {}
}) {
  const hasOptionalParams = json || Object.keys(extra).length > 0

  // "rich" = with JSON mode and provider-specific extras.
  const send = rich =>
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
        ...(rich
          ? {
              ...extra,
              ...(json
                ? { response_format: { type: 'json_object' } }
                : {})
            }
          : {})
      })
    })

  let response = await send(true)

  // Some models reject JSON mode or extra parameters.
  // Retry once with a plain request before giving up on this model.
  if (
    hasOptionalParams &&
    (response.status === 400 || response.status === 422)
  ) {
    response = await send(false)
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(
      `HTTP ${response.status} ${body.slice(0, 250)}`
    )
  }

  const data = await response.json()

  // Some providers return HTTP 200 with an error object.
  if (data?.error) {
    throw new Error(
      data.error.message || 'Provider returned an error'
    )
  }

  const choice = data?.choices?.[0]

  return {
    text: choice?.message?.content || '',
    finish: choice?.finish_reason
  }
}

// ─────────────────────────────────────────────────────
// GEMINI NATIVE API
// ─────────────────────────────────────────────────────

async function geminiNative({
  key,
  model,
  messages,
  temperature,
  max_tokens,
  json,
  signal
}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const systemText = messages
    .filter(message => message.role === 'system')
    .map(message => String(message.content || ''))
    .join('\n')

  const requestBody = JSON.stringify({
    contents: messages
      .filter(message => message.role !== 'system')
      .map(message => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(message.content || '') }]
      })),
    ...(systemText
      ? { systemInstruction: { parts: [{ text: systemText }] } }
      : {}),
    generationConfig: {
      temperature,
      maxOutputTokens: max_tokens,
      ...(json ? { responseMimeType: 'application/json' } : {})
    }
  })

  const send = () =>
    fetch(url, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key
      },
      body: requestBody
    })

  let response = await send()

  // 503 = Google is overloaded for a moment, and one quick retry often gets through.
  // 429 = quota used up: retrying would not help, so that goes straight to the next model.
  if (response.status === 503) {
    await sleep(1500, signal)
    response = await send()
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(
      `HTTP ${response.status} ${body.slice(0, 250)}`
    )
  }

  const data = await response.json()
  const candidate = data?.candidates?.[0]

  return {
    text:
      candidate?.content?.parts
        ?.map(part => part.text || '')
        .join('') || '',
    finish:
      candidate?.finishReason === 'MAX_TOKENS'
        ? 'length'
        : candidate?.finishReason
  }
}

// ─────────────────────────────────────────────────────
// VALIDATE JSON RESPONSES
// ─────────────────────────────────────────────────────

function toValidJson(text) {
  const cleaned = String(text || '')
    .replace(/```json|```/gi, '')
    .trim()

  try {
    JSON.parse(cleaned)
    return cleaned
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')

    if (start !== -1 && end > start) {
      const extracted = cleaned.slice(start, end + 1)

      try {
        JSON.parse(extracted)
        return extracted
      } catch {
        return null
      }
    }

    return null
  }
}

// ─────────────────────────────────────────────────────
// BUILD PROVIDER ATTEMPTS IN PRIORITY ORDER
// ─────────────────────────────────────────────────────

function buildAttempts(request) {
  const order = csv(
    process.env.AI_PROVIDER_ORDER,
    'openrouter,nvidia,gemini,groq'
  )

  const attempts = []

  for (const name of order) {
    const provider = PROVIDERS[name]

    if (!provider) {
      console.warn(
        '[ExamBrain] Unknown provider in AI_PROVIDER_ORDER:',
        name
      )
      continue
    }

    if (!provider.key()) {
      console.log(
        '[ExamBrain] Skipping provider: missing API key',
        name
      )
      continue
    }

    if (
      provider.canHandle &&
      !provider.canHandle(request)
    ) {
      console.log(
        '[ExamBrain] Skipping provider: request exceeds provider limit',
        name
      )
      continue
    }

    for (const model of provider.models()) {
      attempts.push({
        name,
        provider,
        model
      })
    }
  }

  console.log(
    '[ExamBrain] Provider attempt order:',
    attempts.map(attempt => `${attempt.name}/${attempt.model}`)
  )

  return attempts
}

// ─────────────────────────────────────────────────────
// RUN ONE ATTEMPT AND VALIDATE ITS ANSWER
// Throws on any problem so the caller moves on to the next provider.
// ─────────────────────────────────────────────────────

async function runAttempt({ name, provider, model }, request, signal) {
  // Groq gets a smaller output allowance to reduce rate-limit pressure.
  const wanted =
    name === 'groq'
      ? Math.min(request.max_tokens, 2048)
      : request.max_tokens

  const { text, finish } = await provider.run({
    ...request,
    max_tokens: Math.max(wanted, MIN_OUTPUT_TOKENS),
    key: provider.key(),
    model,
    signal
  })

  if (!String(text || '').trim()) {
    throw new Error(
      finish === 'length'
        ? 'Output truncated (no content)'
        : 'Empty response'
    )
  }

  // Plain-text requests (hints) accept the answer as it is.
  if (!request.json) {
    return text
  }

  // A cut-off or malformed JSON answer is useless — try the next provider.
  if (finish === 'length') {
    throw new Error('Output truncated')
  }

  const valid = toValidJson(text)

  if (!valid) {
    throw new Error('Invalid JSON output')
  }

  return valid
}

// ─────────────────────────────────────────────────────
// RACE THE ATTEMPTS (staggered)
//
// Starts the first attempt. The next one starts when
//   - the running one(s) have all failed, or
//   - `staggerMs` has passed without an answer.
// The first valid answer wins and everything else is cancelled.
// Resolves { winner, failures }; winner is null if nothing worked in time.
// ─────────────────────────────────────────────────────

function raceAttempts(attempts, request, { staggerMs, deadlineAt }) {
  return new Promise(resolve => {
    const failures = []
    const controllers = []
    const running = new Set()

    let nextIndex = 0
    let finished = false
    let staggerTimer = null

    const deadlineTimer = setTimeout(
      () => finish(null),
      Math.max(deadlineAt - Date.now(), 0)
    )

    function finish(winner) {
      if (finished) return
      finished = true

      clearTimeout(staggerTimer)
      clearTimeout(deadlineTimer)

      if (!winner) {
        for (const label of running) {
          failures.push(`${label}: no answer before the time limit`)
        }
      }

      for (const controller of controllers) {
        controller.abort()
      }

      resolve({ winner, failures })
    }

    function launchNext() {
      clearTimeout(staggerTimer)

      if (finished) return

      if (nextIndex >= attempts.length) {
        if (running.size === 0) finish(null)
        return
      }

      const attempt = attempts[nextIndex++]
      const label = `${attempt.name}/${attempt.model}`
      const controller = new AbortController()

      controllers.push(controller)
      running.add(label)

      console.log('[ExamBrain] Trying AI provider:', attempt.name, attempt.model)

      runAttempt(attempt, request, controller.signal).then(
        content => {
          running.delete(label)
          finish({ ...attempt, content })
        },
        error => {
          running.delete(label)
          if (finished) return

          const reason = error.message || String(error)
          failures.push(`${label}: ${reason}`)

          console.warn(
            '[ExamBrain] AI attempt failed:',
            attempt.name,
            attempt.model,
            reason
          )

          // Nothing else is running — move on right away.
          if (running.size === 0) launchNext()
        }
      )

      if (nextIndex < attempts.length) {
        staggerTimer = setTimeout(launchNext, staggerMs)
      }
    }

    launchNext()
  })
}

// ─────────────────────────────────────────────────────
// API HANDLER
// ─────────────────────────────────────────────────────

export default async function handler(req, res) {
  const startedAt = Date.now()

  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({
        error: {
          message: 'Method not allowed'
        }
      })
  }

  // Authentication and rate-limit checks.
  const caller = await guard(req, res)

  if (!caller) {
    return
  }

  const body = req.body || {}
  const messages = Array.isArray(body.messages)
    ? body.messages
    : []

  if (!messages.length) {
    return res
      .status(400)
      .json({
        error: {
          message: 'messages is required'
        }
      })
  }

  const totalChars = messages.reduce(
    (total, message) =>
      total + String(message?.content ?? '').length,
    0
  )

  if (totalChars > MAX_PROMPT_CHARS) {
    return res
      .status(413)
      .json({
        error: {
          message: 'Request is too large.'
        }
      })
  }

  const request = {
    messages: messages.map(message => ({
      role:
        message.role === 'assistant' ||
        message.role === 'system'
          ? message.role
          : 'user',
      content: String(message.content ?? '')
    })),

    temperature: Math.min(
      Math.max(Number(body.temperature ?? 0.3), 0),
      1
    ),

    max_tokens: Math.min(
      Math.max(parseInt(body.max_tokens, 10) || 4096, 1),
      8192
    ),

    json: body.json !== false
  }

  const attempts = buildAttempts(request)

  if (!attempts.length) {
    console.error(
      '[ExamBrain] No AI provider available. Check API keys and provider settings.'
    )

    return res
      .status(500)
      .json({
        error: {
          message: 'AI is not set up on the server yet.'
        }
      })
  }

  const { winner, failures } = await raceAttempts(
    attempts,
    request,
    {
      staggerMs:
        request.max_tokens <= 1024 ? STAGGER_SMALL_MS : STAGGER_MS,
      // Leave a little room to send the response before Vercel's limit.
      deadlineAt: startedAt + TOTAL_BUDGET_MS - 1500
    }
  )

  if (winner) {
    console.log('[ExamBrain] AI success:', {
      provider: winner.name,
      model: winner.model,
      ms: Date.now() - startedAt
    })

    return res
      .status(200)
      .json({
        choices: [
          {
            message: {
              role: 'assistant',
              content: winner.content
            }
          }
        ],
        provider: winner.name,
        model: winner.model
      })
  }

  console.error(
    '[ExamBrain] All AI providers failed:',
    failures
  )

  return res
    .status(502)
    .json({
      error: {
        message:
          'AI is busy right now. Please try again in a minute.'
      }
    })
}
