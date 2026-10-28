// api/generate.js
// ExamBrain AI endpoint
// Provider priority: OpenRouter -> NVIDIA -> Gemini -> Groq
//
// Request:  { messages, temperature?, max_tokens?, json? }
// Response: { choices: [{ message: { role, content } }], provider, model }

import { guard } from './_auth.js'

// Keep individual attempts short enough to allow fallback providers to run.
// Vercel's function duration must also be configured appropriately.
const ATTEMPT_TIMEOUT_MS = Number(
  process.env.AI_ATTEMPT_TIMEOUT_MS || 12000
)

const TOTAL_BUDGET_MS = 55000
const MAX_PROMPT_CHARS = 60000

const csv = (value, fallback) =>
  (value || fallback)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

// ─────────────────────────────────────────────────────
// PROVIDERS
// ─────────────────────────────────────────────────────

const PROVIDERS = {
  // 1. OpenRouter — primary provider
  openrouter: {
    key: () => process.env.OPENROUTER_API_KEY,

    models: () =>
      csv(
        process.env.OPENROUTER_MODELS,
        'openrouter/free'
      ),

    run: ctx =>
      openAICompatible({
        ...ctx,
        url: 'https://openrouter.ai/api/v1/chat/completions',
        headers: {
          'HTTP-Referer': 'https://exambrain.me',
          'X-Title': 'ExamBrain'
        }
      })
  },

  // 2. NVIDIA — second provider
  nvidia: {
    key: () => process.env.NVIDIA_API_KEY,

    models: () =>
      csv(
        process.env.NVIDIA_MODELS,
        'meta/llama-3.3-70b-instruct'
      ),

    run: ctx =>
      openAICompatible({
        ...ctx,
        url: 'https://integrate.api.nvidia.com/v1/chat/completions',
        headers: {}
      })
  },

  // 3. Gemini — third provider
  gemini: {
    key: () => process.env.GEMINI_API_KEY,

    models: () =>
      csv(
        process.env.GEMINI_MODEL,
        'gemini-3.6-flash'
      ),

    run: ctx => geminiNative(ctx)
  },

  // 4. Groq — last fallback
  groq: {
    key: () => process.env.GROQ_API_KEY,

    models: () =>
      csv(
        process.env.GROQ_MODEL,
        'llama-3.3-70b-versatile'
      ),

    // Avoid sending very large prompts to Groq's free tier.
    // Requests outside this limit can still use the first three providers.
    canHandle: ({ messages }) => {
      const chars = messages.reduce(
        (total, message) =>
          total + String(message.content || '').length,
        0
      )

      const estimatedInputTokens = Math.ceil(chars / 4)

      return estimatedInputTokens <= 3500
    },

    run: ctx =>
      openAICompatible({
        ...ctx,
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {}
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
  signal
}) {
  const send = jsonMode =>
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
        ...(jsonMode
          ? {
              response_format: {
                type: 'json_object'
              }
            }
          : {})
      })
    })

  let response = await send(json)

  // Some models do not support JSON response mode.
  // Retry without JSON mode when the provider rejects that parameter.
  if (
    json &&
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
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key
      },
      body: JSON.stringify({
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
        ...(messages.some(message => message.role === 'system')
          ? {
              systemInstruction: {
                parts: [
                  {
                    text: messages
                      .filter(message => message.role === 'system')
                      .map(message => String(message.content || ''))
                      .join('\n')
                  }
                ]
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
    }
  )

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

  const failures = []

  for (const { name, provider, model } of attempts) {
    const elapsed = Date.now() - startedAt
    const remaining = TOTAL_BUDGET_MS - elapsed

    if (remaining < 3000) {
      console.warn(
        '[ExamBrain] Stopping provider attempts: time budget nearly exhausted.'
      )
      break
    }

    const controller = new AbortController()

    const timeout = Math.min(
      ATTEMPT_TIMEOUT_MS,
      remaining - 1000
    )

    const timer = setTimeout(
      () => controller.abort(),
      timeout
    )

    try {
      console.log(
        '[ExamBrain] Trying AI provider:',
        name,
        model
      )

      // Groq gets a smaller output allowance to reduce rate-limit pressure.
      const providerMaxTokens =
        name === 'groq'
          ? Math.min(request.max_tokens, 2048)
          : request.max_tokens

      const { text, finish } = await provider.run({
        ...request,
        max_tokens: providerMaxTokens,
        key: provider.key(),
        model,
        signal: controller.signal
      })

      if (!String(text || '').trim()) {
        throw new Error('Empty response')
      }

      let content = text

      if (request.json) {
        const valid =
          finish === 'length'
            ? null
            : toValidJson(text)

        if (!valid) {
          throw new Error(
            finish === 'length'
              ? 'Output truncated'
              : 'Invalid JSON output'
          )
        }

        content = valid
      }

      console.log('[ExamBrain] AI success:', {
        provider: name,
        model,
        ms: Date.now() - startedAt
      })

      return res
        .status(200)
        .json({
          choices: [
            {
              message: {
                role: 'assistant',
                content
              }
            }
          ],
          provider: name,
          model
        })
    } catch (error) {
      const reason =
        error.name === 'AbortError'
          ? `Timed out after ${timeout}ms`
          : error.message

      failures.push(
        `${name}/${model}: ${reason}`
      )

      console.warn(
        '[ExamBrain] AI attempt failed:',
        name,
        model,
        reason
      )
    } finally {
      clearTimeout(timer)
    }
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
