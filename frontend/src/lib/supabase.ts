/**
 * Supabase client — singleton untuk browser
 * Digunakan untuk Auth (session, JWT) dan Storage (upload langsung)
 */

import { createBrowserClient } from "@supabase/ssr"

export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton untuk dipakai di luar React tree (api.ts, dll)
export const supabase = createSupabaseClient()

/**
 * Ambil Authorization header dari active Supabase session.
 * Return empty object kalau tidak ada session (unauthenticated).
 */
export async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Ambil access token langsung (untuk kasus yang perlu token string)
 */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
