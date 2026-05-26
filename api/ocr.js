export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  const { base64, mimeType } = req.body

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
    res.status(200).json({ text })
  } catch (e) {
    // Return error so client falls back to Tesseract
    res.status(500).json({ error: e.message })
  }
}
