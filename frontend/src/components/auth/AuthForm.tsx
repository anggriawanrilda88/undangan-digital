"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Eye, EyeOff, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

type AuthMode = "login" | "register"

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccessMsg("Cek email kamu untuk konfirmasi akun! 📬")
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // Redirect handled by middleware / onAuthStateChange
        window.location.href = "/dashboard"
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
      // Translate common Supabase error messages ke Indonesia
      setError(translateAuthError(msg))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
      setError(translateAuthError(msg))
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl font-bold text-stone-800">
          {mode === "login" ? "Masuk ke akun" : "Daftar sekarang"}
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          {mode === "login"
            ? "Kelola undangan digital kamu"
            : "Buat undangan pernikahan dalam 10 menit"}
        </p>
      </motion.div>

      {/* Google OAuth */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {/* Google G icon */}
          <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Lanjut dengan Google
        </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-stone-200" />
        <span className="text-xs text-stone-400">atau</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-stone-600">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="kamu@email.com"
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-stone-600">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              minLength={8}
              className="w-full px-4 py-3 pr-10 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg"
          >
            {error}
          </motion.p>
        )}
        {successMsg && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg"
          >
            {successMsg}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-opacity",
            "bg-amber-600 text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {mode === "login" ? "Masuk" : "Daftar"}
        </button>
      </form>

      {/* Toggle mode */}
      <p className="mt-6 text-center text-sm text-stone-500">
        {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
        <button
          onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(null) }}
          className="font-medium text-amber-700 hover:underline"
        >
          {mode === "login" ? "Daftar gratis" : "Masuk"}
        </button>
      </p>
    </div>
  )
}

// ─── Error translation ───────────────────────────────────

function translateAuthError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Email atau password salah."
  if (msg.includes("Email not confirmed")) return "Email belum dikonfirmasi. Cek inbox kamu."
  if (msg.includes("User already registered")) return "Email sudah terdaftar. Silakan masuk."
  if (msg.includes("Password should be")) return "Password minimal 8 karakter."
  if (msg.includes("rate limit")) return "Terlalu banyak percobaan. Coba lagi beberapa menit."
  return msg
}
