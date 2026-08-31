export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'GROQ_API_KEY not configured on server' } })
  }

  // Force stable model, enable JSON mode
  const body = {
    ...req.body,
    model: 'llama-3.1-8b-instant',
    response_format: { type: 'json_object' },  // Groq JSON Object Mode — no truncation mid-structure
    temperature: 0.3,
    max_tokens: 8192
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
    console.log('[ExamBrain] Groq:', {
      status: response.status,
      model: body.model,
      finish_reason: data?.choices?.[0]?.finish_reason || null,
      error: data?.error || null
    })
    return res.status(response.status).json(data)
  } catch (e) {
    console.error('[ExamBrain] Groq server error:', e)
    return res.status(500).json({ error: { message: e.message } })
  }
}
