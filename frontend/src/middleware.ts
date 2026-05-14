import { NextResponse, type NextRequest } from "next/server"

/**
 * Next.js Middleware — proteksi route dashboard.
 * Unauthenticated user yang akses /dashboard/* di-redirect ke /auth/login.
 * Authenticated user yang akses /auth/login di-redirect ke /dashboard.
 *
 * Auth check: baca cookie `auth_token` (JWT dari backend Golang).
 * Tidak ada network call — cukup cek keberadaan token.
 * Token expiry ditangani oleh API (401 → logout).
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const { pathname } = request.nextUrl

  // Unauthenticated → redirect ke login
  if (!token && pathname.startsWith("/dashboard")) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/auth/login"
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated → skip halaman login
  if (token && pathname.startsWith("/auth/login")) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = "/dashboard"
    dashboardUrl.search = ""
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login"],
}
