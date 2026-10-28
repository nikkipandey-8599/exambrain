import { gradeOffline } from '../utils/helpers'
import { authHeaders } from '../utils/authHeader'

const AI_URL = '/api/generate'

// ── AI call ───────────────────────────────────────────
// Provider fallback (OpenRouter → NVIDIA → Gemini → Groq) happens server-side
// in api/generate.js, so the browser only ever makes one request.
// Errors carry `status` (401 signed out, 429 rate limited, 503/502 AI unavailable, 0 network)
// and a user-friendly `message` written by the server.
function aiError(message, status) {
  const err = new Error(message)
  err.status = status
  return err
}

async function callAI(prompt, maxTokens = 8192) {
  let res
  try {
    res = await fetch(AI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: maxTokens,
        json: true
      })
    })
  } catch {
    throw aiError('Could not reach ExamBrain. Check your internet connection and try again.', 0)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // non-JSON error page (e.g. 404 when the function isn't deployed)
  }

  if (!res.ok) {
    const fallbackMessages = {
      401: 'Please sign in again to use AI features.',
      429: 'You are sending requests too quickly. Please wait a moment and try again.',
      503: 'AI is temporarily unavailable. Please try again in a few minutes.'
    }
    throw aiError(
      data?.error?.message || fallbackMessages[res.status] || `AI request failed (${res.status})`,
      res.status
    )
  }

  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from AI')
  return content
}

// ── Safe JSON parse — handles both raw JSON and markdown-wrapped ──
function safeParseJSON(text) {
  // Strip markdown code fences if present
  const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    // Try extracting the first complete JSON object
    const match = clean.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not parse JSON from AI response')
  }
}

// ── Generate exam content ─────────────────────────────
export async function generateExamContent(notes) {
  const prompt = `You are an expert exam preparation AI. Analyze the following student notes and generate comprehensive exam content.

You MUST return ONLY a valid JSON object with NO markdown, NO code blocks, NO extra text before or after. The response must be parseable by JSON.parse() directly.

Required JSON structure:
{
  "topic": "Subject name (2-6 words)",
  "summary": "2-3 sentence overview of key concepts",
  "quiz": [
    {
      "id": "q1",
      "question": "Question text?",
      "options": ["A. Option one", "B. Option two", "C. Option three", "D. Option four"],
      "answer": "A. Option one",
      "explanation": "Why this answer is correct",
      "difficulty": "easy",
      "subtopic": "Subtopic name"
    }
  ],
  "shortAnswer": [
    {
      "id": "sa1",
      "question": "Question requiring detailed answer?",
      "modelAnswer": "Complete ideal answer",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
      "difficulty": "medium",
      "subtopic": "Subtopic name"
    }
  ],
  "flashcards": [
    {
      "id": "fc1",
      "front": "Term or concept",
      "back": "Definition or answer",
      "subtopic": "Subtopic name"
    }
  ]
}

STRICT RULES:
- Generate EXACTLY 20 quiz questions: 6 easy, 8 medium, 6 hard
- Generate EXACTLY 7 short answer questions
- Generate EXACTLY 20 flashcards
- difficulty values must be exactly: "easy", "medium", or "hard"
- The "answer" field must EXACTLY match one of the strings in "options"
- All content must come directly from the notes — no external knowledge
- Do not add any text before { or after the final }

Student Notes:
${notes}`

  const text = await callAI(prompt, 8192)
  const parsed = safeParseJSON(text)

  if (!parsed.quiz || !parsed.flashcards || !parsed.shortAnswer) {
    throw new Error('Incomplete response — missing required fields')
  }
  // Enforce counts defensively
  if (parsed.quiz.length < 5 || parsed.flashcards.length < 5) {
    throw new Error('AI returned too few questions — please try again')
  }
  return parsed
}

// ── Grade short answer ────────────────────────────────
export async function gradeShortAnswer(question, modelAnswer, keyPoints, userAnswer) {
  if (!navigator.onLine) return gradeOffline(userAnswer, modelAnswer, keyPoints)

  const trimmedAnswer = userAnswer?.trim() || ''
  if (trimmedAnswer.length < 10) {
    return {
      score: 0,
      isCorrect: false,
      feedback: 'Answer is too short. Please provide a detailed response.',
      missedPoints: keyPoints
    }
  }

  const prompt = `You are a strict but fair exam grader.

Question: ${question}
Model Answer: ${modelAnswer}
Required Key Points:
${keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n')}
Student Answer: "${trimmedAnswer}"

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "score": <0-100>,
  "isCorrect": <true if score >= 70>,
  "feedback": "One sentence explaining what was right or wrong",
  "missedPoints": ["key points they missed"]
}

Scoring: 0-20 wrong/vague, 21-49 partial, 50-69 half correct, 70-84 mostly correct, 85-100 excellent.`

  try {
    const text = await callAI(prompt, 1024)
    const result = safeParseJSON(text)
    result.isCorrect = result.score >= 70
    return result
  } catch (err) {
    // Fall back to offline keyword grading, but tell the student why it happened
    const result = gradeOffline(userAnswer, modelAnswer, keyPoints)
    const note =
      err?.status === 401 ? 'Graded offline because your session expired — sign in again for AI grading.'
      : err?.status === 429 ? 'Graded offline because you reached the AI limit — wait a moment for AI grading.'
      : err?.status === 503 || err?.status === 502 ? 'Graded offline because AI is busy right now.'
      : ''
    if (note) result.feedback = `${result.feedback} (${note})`
    return result
  }
}
