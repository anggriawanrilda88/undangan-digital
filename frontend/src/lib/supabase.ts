/**
 * Supabase client — singleton untuk browser
 * Digunakan untuk Auth (session, JWT) dan Storage (upload langsung)
 *
 * Lazy init: jangan inisialisasi di module level karena akan break build
 * saat env vars belum tersedia (e.g. CI, static generation).
 */

import { createBrowserClient } from "@supabase/ssr"

let _supabase: ReturnType<typeof createBrowserClient> | null = null

export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/** Lazy singleton — hanya dibuat saat pertama kali dipakai di browser */
export function getSupabase() {
  if (!_supabase) {
    _supabase = createSupabaseClient()
  }
  return _supabase
}

// Backward-compat alias (untuk komponen yang sudah import `supabase` langsung)
// Tetap lazy — getter property
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    return (getSupabase() as Record<string | symbol, unknown>)[prop]
  },
})

/**
 * Ambil Authorization header dari active Supabase session.
 * Return empty object kalau tidak ada session (unauthenticated).
 */
export async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await getSupabase().auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Ambil access token langsung (untuk kasus yang perlu token string)
 */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await getSupabase().auth.getSession()
  return data.session?.access_token ?? null
}
