"use client"

import { use } from "react"
import TemplateElegantGarden from "@/components/templates/TemplateElegantGarden"
import { TEMPLATE_PREVIEW_DATA } from "@/types/template"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// Mapping template id → component
// Tambah template baru di sini kalau ada
const TEMPLATE_MAP: Record<string, React.ComponentType<typeof TEMPLATE_PREVIEW_DATA>> = {
  "elegant-garden": TemplateElegantGarden,
  // "modern-serif": TemplateModernSerif,
  // "minimalist-clean": TemplateMinimalistClean,
}

interface Props {
  params: Promise<{ id: string }>
}

export default function PreviewPage({ params }: Props) {
  const { id } = use(params)
  const TemplateComponent = TEMPLATE_MAP[id]

  if (!TemplateComponent) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-50">
        <p className="text-stone-500 text-sm">Template &quot;{id}&quot; tidak ditemukan.</p>
        <Link href="/dashboard/templates" className="text-amber-600 text-sm hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> Kembali pilih template
        </Link>
      </main>
    )
  }

  return (
    <div className="relative">
      {/* Floating back button */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/dashboard/templates"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm border border-stone-200 text-stone-700 text-xs font-medium shadow-sm hover:bg-white transition-colors"
        >
          <ArrowLeft size={13} /> Kembali
        </Link>
      </div>

      {/* Preview badge */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <span className="px-3 py-1.5 rounded-full bg-amber-600 text-white text-xs font-medium shadow-md">
          Preview — Data Contoh
        </span>
      </div>

      {/* Template preview */}
      <TemplateComponent {...TEMPLATE_PREVIEW_DATA} />
    </div>
  )
}
