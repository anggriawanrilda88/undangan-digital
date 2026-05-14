import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Undangan Digital — Buat Undangan Pernikahan Online",
  description: "Buat undangan pernikahan digital yang elegan dalam 10 menit. Bagikan ke semua tamu dengan satu link.",
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100 flex flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <div className="text-center max-w-xl">
        <span className="text-5xl mb-6 block">💍</span>
        <h1 className="text-4xl font-bold text-stone-800 leading-tight tracking-tight">
          Undangan Pernikahan<br />
          <span className="text-amber-700">Digital & Elegan</span>
        </h1>
        <p className="mt-4 text-lg text-stone-500 leading-relaxed">
          Buat undangan pernikahan cantik dalam 10 menit.<br />
          Bagikan ke semua tamu dengan satu link.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/login"
            className="px-8 py-3.5 rounded-2xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 transition-colors shadow-md shadow-amber-200"
          >
            Mulai Gratis →
          </Link>
          <Link
            href="/demo"
            className="px-8 py-3.5 rounded-2xl border border-stone-200 bg-white text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors"
          >
            Lihat Contoh Undangan
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl w-full">
        {[
          { icon: "✏️", title: "Editor Mudah", desc: "Edit teks, foto, dan detail acara tanpa perlu desainer." },
          { icon: "📲", title: "Share Sekali Klik", desc: "Satu link untuk semua tamu. Copy & paste ke WhatsApp." },
          { icon: "💌", title: "RSVP Online", desc: "Tamu konfirmasi kehadiran langsung dari undangan." },
        ].map((f) => (
          <div key={f.title} className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-stone-100 text-center">
            <span className="text-3xl">{f.icon}</span>
            <h3 className="mt-3 font-semibold text-stone-800 text-sm">{f.title}</h3>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="mt-16 text-xs text-stone-400">
        © {new Date().getFullYear()} Undangan Digital · Dibuat dengan ❤️
      </p>
    </main>
  )
}
