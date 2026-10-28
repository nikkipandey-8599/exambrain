// api/ocr.js
// Image text extraction via Groq Vision. The client falls back to Tesseract.js
// automatically if this returns an error, so failing here is safe.

import { guard } from './_auth.js'

const MAX_BASE64_CHARS = 6 * 1024 * 1024 // ~4.5MB image; Vercel's request body limit is 4.5MB anyway
const TIMEOUT_MS = 25000

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Must be signed in and within rate limits (sends its own error response)
  const caller = await guard(req, res)
  if (!caller) return

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'OCR is not configured on the server' })

  const { base64, mimeType } = req.body || {}
  if (typeof base64 !== 'string' || !base64) {
    return res.status(400).json({ error: 'base64 image is required' })
  }
  if (base64.length > MAX_BASE64_CHARS) {
    return res.status(413).json({ error: 'Image is too large' })
  }
  if (typeof mimeType !== 'string' || !/^image\/(png|jpe?g|webp|gif)$/i.test(mimeType)) {
    return res.status(400).json({ error: 'Unsupported image type' })
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}` }
            },
            {
              type: 'text',
              text: 'Extract ALL text from this image exactly as written. Include headings, bullet points, numbers, formulas, and all content. Return only the extracted text, nothing else.'
            }
          ]
        }],
        max_tokens: 4000
      })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'OCR failed')
    const text = data.choices?.[0]?.message?.content || ''
    return res.status(200).json({ text })
  } catch (e) {
    // Return error so client falls back to Tesseract
    return res.status(500).json({ error: e.name === 'AbortError' ? 'OCR timed out' : e.message })
  } finally {
    clearTimeout(timer)
  }
}
