import { supabase } from '../services/supabase'

// Returns the Authorization header for calls to our own /api/* endpoints.
// getSession() refreshes the access token automatically when it has expired.
export async function authHeaders() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}
  } catch {
    return {}
  }
}
