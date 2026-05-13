import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

/**
 * OAuth callback handler.
 * Supabase redirect ke sini setelah Google OAuth berhasil.
 * Exchange code → session, lalu redirect ke dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Gagal — redirect ke login dengan error param
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
