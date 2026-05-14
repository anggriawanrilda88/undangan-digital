/**
 * Auth helper — JWT berbasis cookie (tidak pakai Supabase)
 *
 * Token disimpan di cookie `auth_token` yang bisa dibaca middleware Next.js.
 * Kita tidak pakai httpOnly supaya client-side JS bisa baca untuk API calls.
 *
 * Pertimbangan keamanan:
 * - Cookie di-set dengan SameSite=Lax + Secure (production)
 * - Untuk upgrade ke httpOnly: perlu backend set cookie via Set-Cookie header
 */

const TOKEN_KEY = "auth_token"
const MAX_AGE = 60 * 60 * 24 * 7 // 7 hari

// ─── Cookie helpers ──────────────────────────────────────

function isServer() {
  return typeof document === "undefined"
}

export function setAuthToken(token: string): void {
  if (isServer()) return
  const secure = location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${TOKEN_KEY}=${token}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`
}

export function getAuthToken(): string | null {
  if (isServer()) return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function removeAuthToken(): void {
  if (isServer()) return
  document.cookie = `${TOKEN_KEY}=; Max-Age=0; Path=/; SameSite=Lax`
}

// ─── Auth headers builder ────────────────────────────────

export function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Logout helper ───────────────────────────────────────

export function logout(): void {
  removeAuthToken()
  window.location.href = "/auth/login"
}
