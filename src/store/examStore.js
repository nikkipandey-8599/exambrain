import { create } from 'zustand'
import { shuffleArray } from '../utils/helpers'

const useExamStore = create((set, get) => ({
  // Session
  sessionId: null,
  notes: '',
  examContent: null,
  isGenerating: false,
  generateError: null,
  generationStage: '',

  // Quiz
  quizMode: 'mcq',
  currentQuestionIndex: 0,
  answers: [],
  quizComplete: false,

  // Flashcards
  currentCardIndex: 0,
  isCardFlipped: false,
  masteredCards: new Set(),
  shuffledCards: null,
  isShuffled: false,

  // Quiz results
  quizResults: null,

  // Actions
  setNotes: (notes) => set({ notes }),
  setSessionId: (id) => set({ sessionId: id }),
  setExamContent: (content) => set({ examContent: content }),
  setGenerating: (val, stage = '') => set({ isGenerating: val, generationStage: stage }),
  setGenerateError: (err) => set({ generateError: err }),

  setQuizMode: (mode) => set({ quizMode: mode, currentQuestionIndex: 0 }),

  setAnswer: (answer) => set(state => {
    const existing = state.answers.findIndex(a => a.id === answer.id)
    const answers = existing >= 0
      ? state.answers.map((a, i) => i === existing ? answer : a)
      : [...state.answers, answer]
    return { answers }
  }),

  nextQuestion: () => set(state => {
    const total = state.quizMode === 'mcq'
      ? (state.examContent?.quiz?.length || 0)
      : (state.examContent?.shortAnswer?.length || 0)
    const next = state.currentQuestionIndex + 1
    if (next >= total) return { quizComplete: true }
    return { currentQuestionIndex: next }
  }),

  prevQuestion: () => set(state => ({
    currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1)
  })),

  goToQuestion: (idx) => set({ currentQuestionIndex: idx }),

  resetQuiz: () => set({
    currentQuestionIndex: 0,
    answers: [],
    quizComplete: false,
    quizResults: null
  }),

  setQuizResults: (results) => set({ quizResults: results }),

  nextCard: () => set(state => {
    const cards = state.shuffledCards || state.examContent?.flashcards || []
    return {
      currentCardIndex: (state.currentCardIndex + 1) % cards.length,
      isCardFlipped: false
    }
  }),

  prevCard: () => set(state => {
    const cards = state.shuffledCards || state.examContent?.flashcards || []
    return {
      currentCardIndex: (state.currentCardIndex - 1 + cards.length) % cards.length,
      isCardFlipped: false
    }
  }),

  goToCard: (idx) => set({ currentCardIndex: idx, isCardFlipped: false }),

  flipCard: () => set(state => ({ isCardFlipped: !state.isCardFlipped })),

  markMastered: (id) => set(state => {
    const s = new Set(state.masteredCards)
    s.has(id) ? s.delete(id) : s.add(id)
    return { masteredCards: s }
  }),

  shuffleCards: () => set(state => {
    const cards = state.examContent?.flashcards || []
    return {
      shuffledCards: shuffleArray(cards),
      isShuffled: true,
      currentCardIndex: 0,
      isCardFlipped: false
    }
  }),

  resetCards: () => set({
    shuffledCards: null,
    isShuffled: false,
    currentCardIndex: 0,
    isCardFlipped: false
  }),

  resetFlashcards: () => set({
    currentCardIndex: 0,
    isCardFlipped: false,
    masteredCards: new Set(),
    shuffledCards: null,
    isShuffled: false
  }),

  resetAll: () => set({
    sessionId: null,
    notes: '',
    examContent: null,
    isGenerating: false,
    generateError: null,
    generationStage: '',
    quizMode: 'mcq',
    currentQuestionIndex: 0,
    answers: [],
    quizComplete: false,
    currentCardIndex: 0,
    isCardFlipped: false,
    masteredCards: new Set(),
    shuffledCards: null,
    isShuffled: false,
    quizResults: null
  }),

  // Computed
  getCurrentQuestion: () => {
    const state = get()
    if (!state.examContent) return null
    return state.quizMode === 'mcq'
      ? state.examContent.quiz?.[state.currentQuestionIndex]
      : state.examContent.shortAnswer?.[state.currentQuestionIndex]
  },

  getTotalQuestions: () => {
    const state = get()
    if (!state.examContent) return 0
    return state.quizMode === 'mcq'
      ? state.examContent.quiz?.length || 0
      : state.examContent.shortAnswer?.length || 0
  },

  getMcqScore: () => {
    const state = get()
    const mcqAnswers = state.answers.filter(a => a.type === 'mcq')
    const correct = mcqAnswers.filter(a => a.isCorrect).length
    const total = state.examContent?.quiz?.length || 0
    return { correct, total, pct: total ? Math.round((correct / total) * 100) : 0 }
  }
}))

export default useExamStore
