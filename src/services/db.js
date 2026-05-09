import { openDB } from 'idb'
import { DB_NAME, DB_VERSION } from '../utils/constants'

let dbPromise = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const sessions = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true })
        sessions.createIndex('by-topic', 'topic')
        sessions.createIndex('by-date', 'createdAt')
        const notes = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true })
        notes.createIndex('by-session', 'sessionId')
        const results = db.createObjectStore('results', { keyPath: 'id', autoIncrement: true })
        results.createIndex('by-session', 'sessionId')
      }
    })
  }
  return dbPromise
}

export async function saveSession(data) {
  const db = await getDB()
  return db.add('sessions', { ...data, createdAt: new Date().toISOString() })
}
export async function updateSession(id, data) {
  const db = await getDB()
  const existing = await db.get('sessions', id)
  if (!existing) return
  return db.put('sessions', { ...existing, ...data })
}
export async function deleteSession(id) {
  const db = await getDB()
  return db.delete('sessions', id)
}
export async function getAllSessions() {
  const db = await getDB()
  const all = await db.getAllFromIndex('sessions', 'by-date')
  return all.reverse()
}
export async function saveNote(sessionId, text) {
  const db = await getDB()
  return db.add('notes', { sessionId, text, createdAt: new Date().toISOString() })
}
export async function getLatestNote() {
  const db = await getDB()
  const all = await db.getAll('notes')
  return all[all.length - 1] || null
}
export async function saveResults(sessionId, answers) {
  const db = await getDB()
  return db.add('results', { sessionId, answers, createdAt: new Date().toISOString() })
}
export async function getResultsBySession(sessionId) {
  const db = await getDB()
  return db.getAllFromIndex('results', 'by-session', sessionId)
}
export async function getWeakTopics() {
  const db = await getDB()
  const all = await db.getAll('results')
  const map = {}
  all.forEach(r => {
    ;(r.answers || []).forEach(a => {
      const t = a.subtopic || 'General'
      if (!map[t]) map[t] = { correct: 0, total: 0 }
      map[t].total++
      if (a.isCorrect) map[t].correct++
    })
  })
  return Object.entries(map)
    .map(([topic, v]) => ({ topic, pct: Math.round((v.correct / v.total) * 100), ...v }))
    .sort((a, b) => a.pct - b.pct)
}
export async function clearAllData() {
  const db = await getDB()
  await db.clear('sessions')
  await db.clear('notes')
  await db.clear('results')
}
