import { gradeOffline } from '../utils/helpers'

const GROQ_URL = '/api/generate'
const GEMINI_URL = '/api/generate-gemini'

// Model is also overridden server-side in generate.js as a safety net
const GROQ_MODEL = 'llama-3.1-8b-instant'

// ── Groq call ─────────────────────────────────────────
async function callGroq(prompt, maxTokens = 4000) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: maxTokens
    })
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error?.message || 'Groq API error'
    const err = new Error(msg)
    // Fallback on: rate limits, deprecated models, unavailable models, server errors
    err.shouldFallback = (
      res.status === 429 ||
      res.status === 503 ||
      data?.error?.code === 'rate_limit_exceeded' ||
      msg.includes('does not exist') ||
      msg.includes('deprecated') ||
      msg.includes('not have access') ||
      msg.includes('model_not_found')
    )
    throw err
  }
  return data.choices[0].message.content
}

// ── Gemini fallback call ───────────────────────────────
async function callGemini(prompt, maxTokens = 4000) {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, max_tokens: maxTokens })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Gemini API error')
  return data.text
}

// ── Router: try Groq, fall back to Gemini on any infra error ──
async function callAI(prompt, maxTokens = 4000) {
  try {
    return await callGroq(prompt, maxTokens)
  } catch (err) {
    if (err.shouldFallback) {
      console.warn('[ExamBrain] Groq unavailable — switching to Gemini:', err.message)
      return await callGemini(prompt, maxTokens)
    }
    throw err
  }
}

// ── Generate exam content ─────────────────────────────
export async function generateExamContent(notes) {
  const prompt = `You are an expert exam preparation AI. Analyze the following student notes carefully and generate comprehensive exam content.

Return ONLY valid JSON with no markdown, no code blocks, no extra text. Use this exact structure:
{
  "topic": "Subject name extracted from notes (2-6 words)",
  "summary": "2-3 sentence overview of the key concepts covered",
  "quiz": [
    {
      "id": "q1",
      "question": "Clear, specific question based directly on the notes?",
      "options": ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"],
      "answer": "A. First option",
      "explanation": "Detailed explanation of why this answer is correct and why others are wrong",
      "difficulty": "easy",
      "subtopic": "Specific subtopic name from the notes"
    }
  ],
  "shortAnswer": [
    {
      "id": "sa1",
      "question": "Question requiring a detailed written answer?",
      "modelAnswer": "The complete ideal answer with all key points included",
      "keyPoints": ["Specific key point 1 that MUST be mentioned", "Specific key point 2", "Specific key point 3"],
      "difficulty": "medium",
      "subtopic": "Specific subtopic name"
    }
  ],
  "flashcards": [
    {
      "id": "fc1",
      "front": "Term, concept, or question",
      "back": "Clear definition or answer",
      "subtopic": "Specific subtopic name"
    }
  ]
}

Rules:
- Generate EXACTLY 20 MCQs: 6 easy, 8 medium, 6 hard
- Generate EXACTLY 7 short answer questions
- Generate EXACTLY 20 flashcards
- difficulty must be exactly "easy", "medium", or "hard"
- All questions MUST be directly based on the provided notes — do not add external knowledge
- MCQ options must be plausible and clearly distinct
- The correct answer in "answer" field must EXACTLY match one of the options strings
- Short answer keyPoints must be SPECIFIC terms/facts from the notes, not vague phrases
- Each keyPoint should be a concrete, verifiable fact

Student Notes:
${notes}`

  const text = await callAI(prompt, 6000)
  const clean = text.replace(/```json|```/g, '').trim()
  let parsed
  try {
    parsed = JSON.parse(clean)
  } catch {
    const match = clean.match(/\{[\s\S]*\}/)
    if (match) parsed = JSON.parse(match[0])
    else throw new Error('Invalid response format from AI')
  }
  if (!parsed.quiz || !parsed.flashcards || !parsed.shortAnswer) {
    throw new Error('Incomplete response — missing required fields')
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

  const prompt = `You are a strict but fair exam grader. Grade the student's answer accurately and honestly.

Question: ${question}

Model Answer: ${modelAnswer}

Required Key Points (student MUST mention these specific concepts):
${keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n')}

Student's Answer: "${trimmedAnswer}"

Grading Rules:
- Score 0-100 based on how many key points the student correctly addressed
- Score 0-20: Answer is wrong, irrelevant, or too vague
- Score 21-49: Mentions some concepts but misses most key points
- Score 50-69: Covers about half the key points adequately
- Score 70-84: Covers most key points with reasonable accuracy
- Score 85-100: Covers all or nearly all key points accurately
- isCorrect = true ONLY if score >= 70
- Be STRICT: vague or generic answers should score low
- Be FAIR: reward genuinely correct explanations even if worded differently

Return ONLY valid JSON, no markdown:
{
  "score": <number 0-100>,
  "isCorrect": <true if score >= 70, false otherwise>,
  "feedback": "One specific sentence explaining what was right or wrong about this answer",
  "missedPoints": ["exact key point they missed or got wrong"]
}`

  try {
    const text = await callAI(prompt, 800)
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)
    result.isCorrect = result.score >= 70
    return result
  } catch {
    return gradeOffline(userAnswer, modelAnswer, keyPoints)
  }
}
