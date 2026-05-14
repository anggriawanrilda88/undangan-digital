"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, FileText, Loader2, ExternalLink } from "lucide-react"
import { api } from "@/lib/api"
import type { InvitationSummary } from "@/types/api"
import { logout } from "@/lib/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [invitations, setInvitations] = useState<InvitationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listInvitations()
      .then(setInvitations)
      .catch(err => {
        if (err?.code === "UNAUTHORIZED" || err?.message?.includes("401")) {
          logout()
        } else {
          setError("Gagal memuat undangan.")
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💍</span>
          <span className="font-semibold text-stone-800 text-sm">Undangan Digital</span>
        </div>
        <button
          onClick={logout}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          Keluar
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Undangan Saya</h1>
            <p className="text-sm text-stone-500 mt-1">Kelola semua undangan digitalmu di sini.</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/dashboard/templates")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors shadow-sm shadow-amber-200"
          >
            <Plus size={15} />
            Buat Baru
          </motion.button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-stone-400">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 text-sm">{error}</div>
        ) : invitations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <FileText size={40} className="mx-auto text-stone-200 mb-4" strokeWidth={1.5} />
            <p className="text-stone-500 font-medium">Belum ada undangan</p>
            <p className="text-stone-400 text-sm mt-1">Klik "Buat Baru" untuk mulai.</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {invitations.map(inv => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center justify-between hover:border-amber-200 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/editor/${inv.id}`)}
              >
                <div>
                  <p className="font-semibold text-stone-800 text-sm">
                    {inv.groomName} & {inv.brideName}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    /{inv.slug} · {inv.status === "published" ? "✅ Published" : "📝 Draft"} · {inv.rsvpCount} RSVP
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {inv.status === "published" && (
                    <a
                      href={`/u/${inv.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <span className="text-stone-300 text-xs">Edit →</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
