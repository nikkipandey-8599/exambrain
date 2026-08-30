export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'GROQ_API_KEY not configured on server' } })
  }

  // Override deprecated model if frontend sends the old one
  const body = { ...req.body }
  if (
    !body.model ||
    body.model === 'llama-3.3-70b-versatile' ||
    body.model === 'llama3-70b-8192'
  ) {
    body.model = 'llama-3.1-8b-instant'   // fast, free, stable on Groq
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (e) {
    res.status(500).json({ error: { message: e.message } })
  }
}
