
// api/generate.js
// ExamBrain AI endpoint
// Provider priority: OpenRouter -> Gemini -> Groq
//
// Request:  { messages, temperature?, max_tokens?, json? }
// Response: { choices: [{ message: { role, content } }], provider, model }

import { guard } from './_auth.js'

// vercel.json allows 120 seconds for this function.
// Keep a little time available for authentication and the response.
const TOTAL_BUDGET_MS = Math.min(
  Number(process.env.AI_TOTAL_BUDGET_MS) || 105000,
  110000
)

// Start the next provider sooner if the current one is slow.
const STAGGER_MS = Number(process.env.AI_STAGGER_MS) || 8000
const STAGGER_SMALL_MS = 4000

const MAX_PROMPT_CHARS = 60000
const MIN_OUTPUT_TOKENS = 1024

const csv = (value, fallback) =>
  (value || fallback)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

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
  openrouter: {
    key: () => process.env.OPENROUTER_API_KEY,

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
        extra: { reasoning: { effort: 'low' } }
      })
  },

  gemini: {
    key: () => process.env.GEMINI_API_KEY,

    models: () =>
      csv(
        process.env.GEMINI_MODEL,
        'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3.6-flash'
      ),

    run: ctx => geminiNative(ctx)
  },

  groq: {
    key: () => process.env.GROQ_API_KEY,

    models: () =>
      csv(
        process.env.GROQ_MODEL,
        'openai/gpt-oss-120b'
      ),

    run: ctx =>
      openAICompatible({
        ...ctx,
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {},
        tokenParameter: 'max_completion_tokens',
        extra: /gpt-oss/i.test(ctx.model)
          ? { reasoning_effort: 'low' }
          : {}
      })
  }
}

// ─────────────────────────────────────────────────────
// OPENAI-COMPATIBLE PROVIDERS
// OpenRouter and Groq
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
  extra = {},
  tokenParameter = 'max_tokens'
}) {
  const hasOptionalParams =
    json || Object.keys(extra).length > 0

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
        [tokenParameter]: max_tokens,
        ...(rich
          ? {
              ...extra,
              ...(json
                ? {
                    response_format: {
                      type: 'json_object'
                    }
                  }
                : {})
            }
          : {})
      })
    })

  let response = await send(true)

  // Retry without optional parameters if the model rejects them.
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
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const systemText = messages
    .filter(message => message.role === 'system')
    .map(message => String(message.content || ''))
    .join('\n')

  const requestBody = JSON.stringify({
    contents: messages
      .filter(message => message.role !== 'system')
      .map(message => ({
        role:
          message.role === 'assistant'
            ? 'model'
            : 'user',
        parts: [
          {
            text: String(message.content || '')
          }
        ]
      })),

    ...(systemText
      ? {
          systemInstruction: {
            parts: [{ text: systemText }]
          }
        }
      : {}),

    generationConfig: {
      temperature,
      maxOutputTokens: max_tokens,
      ...(json
        ? {
            responseMimeType: 'application/json'
          }
        : {})
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
// BUILD PROVIDER ATTEMPTS
// ─────────────────────────────────────────────────────

function buildAttempts(request) {
  const order = csv(
    process.env.AI_PROVIDER_ORDER,
    'openrouter,gemini,groq'
  )

  const attempts = []

  for (const name of order) {
    const provider = PROVIDERS[name]

    // NVIDIA and unknown providers are not enabled.
    if (!provider) {
      console.warn(
        '[ExamBrain] Provider is not enabled:',
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
    attempts.map(
      attempt => `${attempt.name}/${attempt.model}`
    )
  )

  return attempts
}

// ─────────────────────────────────────────────────────
// RUN ONE ATTEMPT
// ─────────────────────────────────────────────────────

async function runAttempt(
  { name, provider, model },
  request,
  signal
) {
  const { text, finish } = await provider.run({
    ...request,
    max_tokens: Math.max(
      request.max_tokens,
      MIN_OUTPUT_TOKENS
    ),
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

  if (!request.json) {
    return text
  }

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
// STAGGERED PROVIDER FALLBACK
// ─────────────────────────────────────────────────────

function raceAttempts(
  attempts,
  request,
  { staggerMs, deadlineAt }
) {
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
          failures.push(
            `${label}: no answer before the time limit`
          )
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
        if (running.size === 0) {
          finish(null)
        }
        return
      }

      const attempt = attempts[nextIndex++]
      const label = `${attempt.name}/${attempt.model}`
      const controller = new AbortController()

      controllers.push(controller)
      running.add(label)

      console.log(
        '[ExamBrain] Trying AI provider:',
        attempt.name,
        attempt.model
      )

      runAttempt(
        attempt,
        request,
        controller.signal
      ).then(
        content => {
          running.delete(label)
          finish({
            ...attempt,
            content
          })
        },

        error => {
          running.delete(label)

          if (finished) return

          const reason =
            error.message || String(error)

          failures.push(`${label}: ${reason}`)

          console.warn(
            '[ExamBrain] AI attempt failed:',
            attempt.name,
            attempt.model,
            reason
          )

          if (running.size === 0) {
            launchNext()
          }
        }
      )

      if (nextIndex < attempts.length) {
        staggerTimer = setTimeout(
          launchNext,
          staggerMs
        )
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
    return res.status(405).json({
      error: {
        message: 'Method not allowed'
      }
    })
  }

  // Keep authentication and rate limiting enabled.
  const caller = await guard(req, res)

  if (!caller) {
    return
  }

  const body = req.body || {}

  const messages = Array.isArray(body.messages)
    ? body.messages
    : []

  if (!messages.length) {
    return res.status(400).json({
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
    return res.status(413).json({
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
      Math.max(
        parseInt(body.max_tokens, 10) || 4096,
        1
      ),
      8192
    ),

    json: body.json !== false
  }

  const attempts = buildAttempts(request)

  if (!attempts.length) {
    console.error(
      '[ExamBrain] No AI provider available. Check API keys and provider settings.'
    )

    return res.status(500).json({
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
        request.max_tokens <= 1024
          ? STAGGER_SMALL_MS
          : STAGGER_MS,

      // Leave time to send the response before Vercel's limit.
      deadlineAt:
        startedAt + TOTAL_BUDGET_MS - 1500
    }
  )

  if (winner) {
    console.log('[ExamBrain] AI success:', {
      provider: winner.name,
      model: winner.model,
      ms: Date.now() - startedAt
    })

    return res.status(200).json({
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

  return res.status(502).json({
    error: {
      message:
        'AI is busy right now. Please try again in a minute.'
    }
  })
}
