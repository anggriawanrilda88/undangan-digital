"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Eye, EyeOff, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { setAuthToken } from "@/lib/auth"
import { cn } from "@/lib/utils"

type AuthMode = "login" | "register"

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (mode === "register") {
        const { token } = await api.register(email, password, name)
        setAuthToken(token)
        setSuccessMsg("Akun berhasil dibuat! Mengalihkan ke dashboard... 🎉")
        setTimeout(() => { window.location.href = "/dashboard" }, 1000)
      } else {
        const { token } = await api.login(email, password)
        setAuthToken(token)
        window.location.href = "/dashboard"
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
      setError(translateAuthError(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Mode tabs — prominent toggle */}
      <div className="flex rounded-xl bg-stone-100 p-1 mb-6">
        <button
          type="button"
          onClick={() => { setMode("login"); setError(null); setName("") }}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
            mode === "login"
              ? "bg-white text-stone-800 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => { setMode("register"); setError(null); setName("") }}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
            mode === "register"
              ? "bg-white text-stone-800 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          Daftar Gratis
        </button>
      </div>

      {/* Header */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <p className="text-sm text-stone-500">
          {mode === "login"
            ? "Kelola undangan digital kamu"
            : "Buat undangan pernikahan dalam 10 menit"}
        </p>
      </motion.div>

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name — hanya tampil saat register */}
        {mode === "register" && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-600">Nama Lengkap</label>
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nama kamu"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            />
          </div>
        )}

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
      <p className="mt-5 text-center text-xs text-stone-400">
        {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
        <button
          onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(null); setName("") }}
          className="text-amber-700 hover:underline"
        >
          {mode === "login" ? "Daftar gratis" : "Masuk"}
        </button>
      </p>
    </div>
  )
}

// ─── Error translation ───────────────────────────────────

function translateAuthError(msg: string): string {
  if (msg.includes("invalid credentials") || msg.includes("wrong password") || msg.includes("not found"))
    return "Email atau password salah."
  if (msg.includes("already exists") || msg.includes("already registered"))
    return "Email sudah terdaftar. Silakan masuk."
  if (msg.includes("password") && msg.includes("8"))
    return "Password minimal 8 karakter."
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "Terlalu banyak percobaan. Coba lagi beberapa menit."
  if (msg.includes("invalid email"))
    return "Format email tidak valid."
  return msg
}
