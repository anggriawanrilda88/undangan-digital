"use client"

import { use } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import EditorShell from "@/components/editor/EditorShell"
import TemplateElegantGarden from "@/components/templates/TemplateElegantGarden"
import { useInvitationEditor } from "@/hooks/useInvitationEditor"

// Template registry — tambah template baru di sini
const TEMPLATE_MAP: Record<string, React.ComponentType<import("@/types/template").TemplateProps>> = {
  "elegant-garden": TemplateElegantGarden,
  // "modern-serif": TemplateModernSerif,   // Phase 1
  // "royal-batik": TemplateRoyalBatik,     // Phase 1
}

const FALLBACK_TEMPLATE = TemplateElegantGarden

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditorPage({ params }: PageProps) {
  const { id } = use(params)
  const { data, loading, saveStatus, error, updateData, save } = useInvitationEditor(id)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-3">
          <Loader2 size={28} className="animate-spin text-amber-500 mx-auto" />
          <p className="text-sm text-stone-500">Memuat undangan...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-3 max-w-xs px-4">
          <AlertCircle size={32} className="text-red-400 mx-auto" />
          <p className="text-sm font-medium text-stone-700">Gagal memuat undangan</p>
          <p className="text-xs text-stone-500">{error ?? "Undangan tidak ditemukan"}</p>
          <a href="/dashboard" className="text-xs text-amber-600 hover:underline">
            ← Kembali ke dashboard
          </a>
        </div>
      </div>
    )
  }

  // Pilih template component berdasarkan templateId
  const TemplateComponent = TEMPLATE_MAP[data.meta.templateId] ?? FALLBACK_TEMPLATE

  return (
    <EditorShell
      TemplateComponent={TemplateComponent}
      data={data}
      saveStatus={saveStatus}
      onUpdate={updateData}
      onSave={save}
    />
  )
}
