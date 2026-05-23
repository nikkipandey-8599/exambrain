import { GoogleGenerativeAI } from '@google/generative-ai'
import { gradeOffline } from '../utils/helpers'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export async function generateExamContent(notes) {
  const prompt = `You are an expert exam preparation AI. Analyze the following student notes and generate comprehensive exam content.

Return ONLY valid JSON with no markdown, no code blocks, no extra text. Use this exact structure:
{
  "topic": "Subject name extracted from notes (2-5 words)",
  "summary": "2-3 sentence overview of the key concepts covered",
  "quiz": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"],
      "answer": "A. First option",
      "explanation": "Why this answer is correct and others are wrong",
      "difficulty": "easy",
      "subtopic": "Specific subtopic name"
    }
  ],
  "shortAnswer": [
    {
      "id": "sa1",
      "question": "Short answer question?",
      "modelAnswer": "The ideal complete answer to this question",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
      "difficulty": "medium",
      "subtopic": "Specific subtopic name"
    }
  ],
  "flashcards": [
    {
      "id": "fc1",
      "front": "Term or concept",
      "back": "Definition or explanation",
      "subtopic": "Specific subtopic name"
    }
  ]
}

Rules:
- Generate EXACTLY 10 MCQs: 4 easy, 4 medium, 2 hard (in that order)
- Generate EXACTLY 5 short answer questions
- Generate EXACTLY 12 flashcards
- MCQ options must be plausible distractors, not obviously wrong
- Each question must have a unique subtopic tag
- difficulty must be exactly "easy", "medium", or "hard"

Student Notes:
${notes}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
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

export async function gradeShortAnswer(question, modelAnswer, keyPoints, userAnswer) {
  if (!navigator.onLine) {
    return gradeOffline(userAnswer, modelAnswer, keyPoints)
  }
  
  const prompt = `Grade this student answer. Return ONLY valid JSON, no markdown.

Question: ${question}
Model Answer: ${modelAnswer}
Key Points: ${keyPoints.join(', ')}
Student Answer: ${userAnswer}

{
  "score": <number 0-100>,
  "isCorrect": <true if score >= 70>,
  "feedback": "One sentence of specific feedback",
  "missedPoints": ["key point they missed", "another missed point"]
}`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json|```/g, '').trim()
    return JSON.parse(text)
  } catch {
    return gradeOffline(userAnswer, modelAnswer, keyPoints)
  }
}
