"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FileText, Loader2, ExternalLink, Users } from "lucide-react"
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
      .then(inv => {
        setInvitations(inv)
        // DEF-S02-01: individual_customer → auto-redirect ke editor jika sudah ada undangan
        // Kalau belum ada → redirect ke template picker (buat undangan pertama)
        if (inv.length === 0) {
          router.replace("/dashboard/templates")
        } else {
          router.replace(`/dashboard/editor/${inv[0].id}`)
        }
      })
      .catch(err => {
        if (err?.code === "UNAUTHORIZED" || err?.message?.includes("401")) {
          logout()
        } else {
          setError("Gagal memuat undangan.")
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  // Loading state sementara redirect diproses
  if (loading || invitations.length > 0 || (!loading && !error)) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 size={28} className="animate-spin text-amber-500 mx-auto" />
          <p className="text-sm text-stone-500">Memuat undangan kamu...</p>
        </div>
      </main>
    )
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-amber-700 hover:underline"
          >
            Coba lagi
          </button>
        </div>
      </main>
    )
  }

  return null
}
