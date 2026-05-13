import type { Metadata } from "next"
import AuthForm from "@/components/auth/AuthForm"

export const metadata: Metadata = {
  title: "Masuk — Undangan Digital",
  description: "Masuk atau daftar untuk membuat undangan pernikahan digital.",
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <span className="text-3xl">💍</span>
          <p className="mt-2 text-sm font-medium text-stone-500 tracking-wide">Undangan Digital</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 px-6 py-8">
          <AuthForm />
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          Dengan mendaftar, kamu menyetujui Syarat & Ketentuan kami.
        </p>
      </div>
    </main>
  )
}
