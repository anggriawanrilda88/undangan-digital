/**
 * Supabase server-side client — untuk App Router (Server Components, Route Handlers)
 * Pakai @supabase/ssr dengan cookies() dari next/headers
 */

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — set cookie tidak selalu bisa, diabaikan
          }
        },
      },
    }
  )
}

/**
 * Middleware-compatible Supabase client (untuk Next.js middleware.ts)
 */
export { createServerClient } from "@supabase/ssr"
