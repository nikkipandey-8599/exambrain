export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' })
  }

  const { prompt } = req.body
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
            temperature: 0.3,
            maxOutputTokens: 8192,
            // Gemini JSON mode — forces valid JSON output
            responseMimeType: 'application/json'
          }
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      const msg = data?.error?.message || 'Gemini API error'
      console.error('[ExamBrain] Gemini error:', msg)
      return res.status(response.status).json({ error: msg })
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      console.error('[ExamBrain] Gemini empty response:', JSON.stringify(data))
      return res.status(500).json({ error: 'Empty response from Gemini' })
    }

    console.log('[ExamBrain] Gemini success, length:', text.length)
    return res.status(200).json({ text })
  } catch (e) {
    console.error('[ExamBrain] Gemini server error:', e)
    return res.status(500).json({ error: e.message })
  }
}
