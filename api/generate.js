export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // Vercel serverless: try both VITE_ and non-VITE_ env var names
  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: { message: 'API key not configured on server' } })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (e) {
    res.status(500).json({ error: { message: e.message } })
  }
}
