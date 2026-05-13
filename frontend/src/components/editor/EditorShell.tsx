"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Save, Check } from "lucide-react"
import type { TemplateProps } from "@/types/template"
import { TEMPLATE_PREVIEW_DATA } from "@/types/template"
import { cn } from "@/lib/utils"

interface EditorShellProps {
  /** Template component yang akan di-render */
  TemplateComponent: React.ComponentType<TemplateProps>
  /** Initial data undangan */
  initialData?: Partial<TemplateProps>
  /** Callback saat save (kirim ke API) */
  onSave?: (data: TemplateProps) => Promise<void>
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

export default function EditorShell({ TemplateComponent, initialData, onSave }: EditorShellProps) {
  const [data, setData] = useState<TemplateProps>({ ...TEMPLATE_PREVIEW_DATA, ...initialData })
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-save tiap 30 detik sesuai AC US-03
  const triggerSave = useCallback(async () => {
    if (!onSave) return
    setSaveStatus("saving")
    try {
      await onSave(data)
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch {
      setSaveStatus("error")
    }
  }, [data, onSave])

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(triggerSave, 30_000)
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [data, triggerSave])

  const updateData = (updater: (prev: TemplateProps) => TemplateProps) => {
    setData(updater)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* === EDITOR TOPBAR === */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200 px-4 h-14 flex items-center justify-between gap-4 shadow-sm">
        <h1 className="font-semibold text-stone-800 text-sm truncate">✏️ Edit Undangan</h1>

        <div className="flex items-center gap-2">
          {/* Save status indicator */}
          <SaveIndicator status={saveStatus} />

          {/* Manual save */}
          <button
            onClick={triggerSave}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:opacity-50 transition-colors"
          >
            <Save size={13} />
            Simpan
          </button>

          {/* Toggle Preview — Fixed prominent button sesuai AC */}
          <button
            onClick={() => setIsPreviewMode(p => !p)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              isPreviewMode
                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                : "bg-amber-600 text-white hover:bg-amber-700"
            )}
          >
            {isPreviewMode ? <><EyeOff size={13} /> Kembali Edit</> : <><Eye size={13} /> Preview</>}
          </button>
        </div>
      </header>

      {/* === CONTENT === */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {isPreviewMode ? (
            // PREVIEW MODE — full-screen tampilan undangan real-time
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <TemplateComponent {...data} />
            </motion.div>
          ) : (
            // EDIT MODE — form editor
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <EditorForm data={data} onChange={updateData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// === Save Status Indicator ===
function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        status === "saving" && "text-stone-400",
        status === "saved" && "text-green-600",
        status === "error" && "text-red-500",
      )}
    >
      {status === "saving" && <span className="animate-pulse">Menyimpan...</span>}
      {status === "saved" && <><Check size={12} /> Tersimpan</>}
      {status === "error" && "Gagal menyimpan"}
    </motion.div>
  )
}

// === Editor Form ===
function EditorForm({ data, onChange }: { data: TemplateProps; onChange: (fn: (prev: TemplateProps) => TemplateProps) => void }) {
  const update = <K extends keyof TemplateProps>(key: K, value: TemplateProps[K]) => {
    onChange(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-8">

      {/* PASANGAN */}
      <Section title="👫 Pengantin">
        <Field label="Nama Pengantin Pria">
          <Input
            value={data.couple.groomName}
            onChange={v => update("couple", { ...data.couple, groomName: v })}
            placeholder="Nama panggilan pengantin pria"
          />
        </Field>
        <Field label="Nama Lengkap (opsional)">
          <Input
            value={data.couple.groomFullName ?? ""}
            onChange={v => update("couple", { ...data.couple, groomFullName: v })}
            placeholder="Nama lengkap untuk caption formal"
          />
        </Field>
        <Field label="Nama Pengantin Wanita">
          <Input
            value={data.couple.brideName}
            onChange={v => update("couple", { ...data.couple, brideName: v })}
            placeholder="Nama panggilan pengantin wanita"
          />
        </Field>
      </Section>

      {/* RESEPSI */}
      <Section title="🎊 Resepsi">
        <Field label="Tanggal">
          <Input
            type="date"
            value={data.events.reception.date}
            onChange={v => update("events", { ...data.events, reception: { ...data.events.reception, date: v } })}
          />
        </Field>
        <Field label="Waktu">
          <Input
            type="time"
            value={data.events.reception.time}
            onChange={v => update("events", { ...data.events, reception: { ...data.events.reception, time: v } })}
          />
        </Field>
        <Field label="Nama Venue">
          <Input
            value={data.events.reception.venue}
            onChange={v => update("events", { ...data.events, reception: { ...data.events.reception, venue: v } })}
            placeholder="Nama gedung/tempat"
          />
        </Field>
        <Field label="Alamat Lengkap">
          <Textarea
            value={data.events.reception.address}
            onChange={v => update("events", { ...data.events, reception: { ...data.events.reception, address: v } })}
            placeholder="Alamat lengkap venue"
          />
        </Field>
        <Field label="Google Maps Link (opsional)">
          <Input
            value={data.events.reception.mapsUrl ?? ""}
            onChange={v => update("events", { ...data.events, reception: { ...data.events.reception, mapsUrl: v } })}
            placeholder="https://maps.google.com/..."
          />
        </Field>
      </Section>

      {/* AKAD */}
      <Section title="🕌 Akad Nikah (opsional)">
        <Field label="Tanggal">
          <Input
            type="date"
            value={data.events.akad?.date ?? ""}
            onChange={v => update("events", { ...data.events, akad: { ...data.events.akad!, date: v } })}
          />
        </Field>
        <Field label="Waktu">
          <Input
            type="time"
            value={data.events.akad?.time ?? ""}
            onChange={v => update("events", { ...data.events, akad: { ...data.events.akad!, time: v } })}
          />
        </Field>
        <Field label="Nama Venue">
          <Input
            value={data.events.akad?.venue ?? ""}
            onChange={v => update("events", { ...data.events, akad: { ...data.events.akad!, venue: v } })}
            placeholder="Nama masjid/tempat akad"
          />
        </Field>
      </Section>

      {/* SLUG */}
      <Section title="🔗 Link Undangan">
        <Field label="Slug URL">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-stone-400 shrink-0">undangan.id/u/</span>
            <Input
              value={data.meta.slug}
              onChange={v => update("meta", { ...data.meta, slug: v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })}
              placeholder="nama-pasangan"
            />
          </div>
          {/* TODO: validasi slug real-time via GET /api/slugs/check (tunggu API Reza) */}
        </Field>
      </Section>

    </div>
  )
}

// === Reusable form primitives ===
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-stone-700 text-sm">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-stone-500 font-medium">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
    />
  )
}

function Textarea({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none"
    />
  )
}
