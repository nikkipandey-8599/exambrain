export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' })
  }

  const { prompt, max_tokens = 4000 } = req.body
  if (!prompt) return res.status(400).json({ error: 'prompt is required' })

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: max_tokens
          }
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      const msg = data?.error?.message || 'Gemini API error'
      return res.status(response.status).json({ error: msg })
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      return res.status(500).json({ error: 'Empty response from Gemini' })
    }

    res.status(200).json({ text })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
