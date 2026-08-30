import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── AUTH ──────────────────────────────────────────────
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })
}

export async function signInWithGitHub() {
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.origin }
  })
}

export async function signInWithDiscord() {
  return supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: { redirectTo: window.location.origin }
  })
}

// Email + Password
export async function signUpWithEmail(email, password) {
  return supabase.auth.signUp({ email, password })
}

export async function signInWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function resetPassword(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ── CLOUD SESSIONS ─────────────────────────────────────
export async function cloudSaveSession(userId, localId, data) {
  const { data: row, error } = await supabase
    .from('sessions')
    .upsert({
      user_id: userId,
      local_id: String(localId),
      topic: data.topic,
      summary: data.summary,
      exam_content: data.examContent,
      notes: data.notes,
      created_at: data.createdAt || new Date().toISOString()
    }, { onConflict: 'user_id,local_id' })
    .select()
    .single()
  if (error) throw error
  return row
}

export async function cloudGetSessions(userId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function cloudDeleteSession(userId, localId) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('user_id', userId)
    .eq('local_id', String(localId))
  if (error) throw error
}

// ── CLOUD RESULTS ─────────────────────────────────────
export async function cloudSaveResults(userId, sessionLocalId, answers) {
  const { error } = await supabase
    .from('results')
    .upsert({
      user_id: userId,
      session_local_id: String(sessionLocalId),
      answers,
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id,session_local_id' })
  if (error) throw error
}

export async function cloudGetResults(userId) {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}
