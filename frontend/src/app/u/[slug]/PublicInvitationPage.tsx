"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Share2, Copy, Check, MessageCircle } from "lucide-react"
import type { TemplateProps } from "@/types/template"
import type { RsvpRequest } from "@/types/api"
import { api } from "@/lib/api"
import { shareUrl, whatsappShareText } from "@/lib/utils"
import TemplateElegantGarden from "@/components/templates/TemplateElegantGarden"
import TemplateModernSerif from "@/components/templates/TemplateModernSerif"
import TemplateRoyalBatik from "@/components/templates/TemplateRoyalBatik"

// Template registry (sama dengan editor)
const TEMPLATE_MAP: Record<string, React.ComponentType<TemplateProps>> = {
  "elegant-garden": TemplateElegantGarden,
  "modern-serif": TemplateModernSerif,
  "royal-batik": TemplateRoyalBatik,
}

interface PublicInvitationPageProps {
  templateProps: TemplateProps
}

export default function PublicInvitationPage({ templateProps }: PublicInvitationPageProps) {
  const [showShareSheet, setShowShareSheet] = useState(false)

  const TemplateComponent = TEMPLATE_MAP[templateProps.meta.templateId] ?? TemplateElegantGarden

  // Override RSVP handler di template — inject actual API call
  const templatePropsWithRsvp: TemplateProps & { onRsvpSubmit?: (payload: RsvpRequest) => Promise<void> } = {
    ...templateProps,
  }

  return (
    <div className="relative">
      {/* Template render */}
      <TemplateComponent {...templatePropsWithRsvp} />

      {/* Share FAB — floating action button */}
      <button
        onClick={() => setShowShareSheet(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="Bagikan undangan"
      >
        <Share2 size={20} />
      </button>

      {/* Share Sheet */}
      <AnimatePresence>
        {showShareSheet && (
          <ShareSheet
            slug={templateProps.meta.slug}
            groomName={templateProps.couple.groomName}
            brideName={templateProps.couple.brideName}
            onClose={() => setShowShareSheet(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Share Sheet (US-04) ──────────────────────────────────

function ShareSheet({
  slug, groomName, brideName, onClose,
}: {
  slug: string
  groomName: string
  brideName: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const url = shareUrl(slug)
  const waText = whatsappShareText(groomName, brideName, slug)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, "_blank")
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl px-5 pt-4 pb-8 shadow-xl"
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-5" />

        <h3 className="font-semibold text-stone-800 mb-4">Bagikan Undangan 💌</h3>

        {/* URL copy */}
        <div className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2.5 mb-4">
          <span className="flex-1 text-sm text-stone-600 truncate font-mono">{url}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors shrink-0"
          >
            {copied ? <><Check size={13} className="text-green-600" /> Tersalin</> : <><Copy size={13} /> Salin Link</>}
          </button>
        </div>

        {/* WhatsApp share */}
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-medium text-sm transition-colors"
        >
          <MessageCircle size={18} />
          Bagikan via WhatsApp
        </button>

        {/* Native share API fallback (mobile) */}
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={() => navigator.share({ title: `Undangan ${groomName} & ${brideName}`, url })}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-200 text-stone-700 font-medium text-sm hover:bg-stone-50 transition-colors"
          >
            <Share2 size={16} />
            Bagikan lainnya
          </button>
        )}
      </motion.div>
    </>
  )
}

// ─── RSVP Form standalone (bisa dipakai di template) ─────

export function RsvpFormStandalone({
  invitationId,
  rsvpDeadline,
  colors,
}: {
  invitationId?: string
  rsvpDeadline?: string
  colors: TemplateProps["colors"]
}) {
  const [form, setForm] = useState<RsvpRequest>({
    guestName: "",
    status: "attending",
    guestCount: 1,
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitationId) return
    setError(null)
    setSubmitting(true)
    try {
      await api.submitRsvp(invitationId, {
        guestName: form.guestName,
        status: form.status,
        guestCount: form.status === "attending" ? form.guestCount : 0,
        message: form.message || undefined,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim konfirmasi")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-2 py-4"
      >
        <div className="text-4xl">🎊</div>
        <p className="font-semibold" style={{ color: colors.primary }}>Terima kasih!</p>
        <p className="text-sm text-stone-500">Konfirmasi kehadiran Anda telah kami terima.</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-sans">
      <input
        required
        placeholder="Nama lengkap Anda"
        value={form.guestName}
        onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 bg-white"
        style={{ "--tw-ring-color": colors.primary } as React.CSSProperties}
      />
      <select
        value={form.status}
        onChange={e => setForm(f => ({ ...f, status: e.target.value as RsvpRequest["status"] }))}
        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white"
      >
        <option value="attending">✅ Hadir</option>
        <option value="not_attending">❌ Tidak Hadir</option>
        <option value="maybe">🤔 Mungkin Hadir</option>
      </select>
      {form.status === "attending" && (
        <select
          value={form.guestCount}
          onChange={e => setForm(f => ({ ...f, guestCount: Number(e.target.value) }))}
          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white"
        >
          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} orang</option>)}
        </select>
      )}
      <textarea
        placeholder="Ucapan / doa (opsional)"
        value={form.message ?? ""}
        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        rows={2}
        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white resize-none"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {rsvpDeadline && (
        <p className="text-xs text-stone-400 text-center">
          Konfirmasi sebelum {new Date(rsvpDeadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting || !invitationId}
        className="w-full py-3 rounded-xl font-medium text-sm text-white disabled:opacity-60 transition-opacity hover:opacity-90"
        style={{ backgroundColor: colors.primary }}
      >
        {submitting ? "Mengirim..." : "Kirim Konfirmasi"}
      </button>
    </form>
  )
}
