export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_GEMINI_API_KEY}`
      },
      body: JSON.stringify(req.body)
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
