"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Loader2 } from "lucide-react"
import TemplatePicker from "@/components/templates/TemplatePicker"
import { api } from "@/lib/api"
import { TEMPLATE_PREVIEW_DATA } from "@/types/template"
import { templatePropsToUpdateRequest } from "@/types/adapters"

export default function TemplatePickerPage() {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    if (!selectedId) return
    setError(null)
    setLoading(true)

    try {
      // Generate slug unik tiap kali — hindari konflik kalau user bolak-balik pilih template
      const uniqueSlug = `undangan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

      // Buat undangan baru dengan template yang dipilih + dummy data awal
      const initialProps = {
        ...TEMPLATE_PREVIEW_DATA,
        meta: { ...TEMPLATE_PREVIEW_DATA.meta, templateId: selectedId, slug: uniqueSlug },
      }
      const payload = templatePropsToUpdateRequest(initialProps)

      const invitation = await api.createInvitation({
        slug: payload.slug!,
        config: payload.config,
        content: payload.content!,
      })

      // Redirect ke editor dengan invitation ID
      router.push(`/dashboard/editor/${invitation.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat undangan"
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 h-14 flex items-center justify-between shadow-sm">
        <h1 className="font-semibold text-stone-800">Pilih Template</h1>
        <button
          onClick={handleContinue}
          disabled={!selectedId || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          Lanjut
          {!loading && <ArrowRight size={14} />}
        </button>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h2 className="text-xl font-bold text-stone-800">Pilih template undangan</h2>
          <p className="mt-1 text-sm text-stone-500">
            Kamu bisa ganti template sebelum undangan dipublikasikan.
          </p>
        </motion.div>

        <TemplatePicker
          selectedId={selectedId ?? undefined}
          onSelect={setSelectedId}
          onPreview={(id) => {
            // Buka preview di tab baru
            window.open(`/preview/${id}`, "_blank")
          }}
        />

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}

        {selectedId && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <button
              onClick={handleContinue}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Pakai template ini <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </div>
    </main>
  )
}
