"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { MapPin, Clock, Calendar, Copy, Check } from "lucide-react"
import { useState } from "react"
import type { TemplateProps } from "@/types/template"
import type { RsvpStatus } from "@/types/api"
import { formatDateID, formatTime, cn } from "@/lib/utils"

/**
 * Template: Modern Serif
 * Tema: Modern, clean, editorial — typografi serif besar, hitam-putih elegan
 * Target: Pasangan urban, minimalis, suka estetika magazine
 */
export default function TemplateModernSerif({ couple, photo, events, digitalGifts, colors, meta }: TemplateProps) {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null)
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)

  const handleCopyAccount = async (accountNumber: string) => {
    await navigator.clipboard.writeText(accountNumber)
    setCopiedAccount(accountNumber)
    setTimeout(() => setCopiedAccount(null), 2000)
  }

  return (
    <div className="min-h-screen bg-white font-serif text-stone-900">

      {/* === HERO === */}
      <section className="relative min-h-screen flex flex-col">
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ backgroundColor: colors.primary }} />

        {/* Foto full-bleed */}
        {photo.couple && (
          <div className="relative w-full" style={{ height: "60vh" }}>
            <Image
              src={photo.couple}
              alt={`${couple.groomName} & ${couple.brideName}`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />
          </div>
        )}

        {/* Name block */}
        <div className={cn(
          "flex-1 flex flex-col items-center justify-center px-8 py-12 text-center",
          !photo.couple && "pt-24"
        )}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs tracking-[0.4em] uppercase font-sans text-stone-400 mb-6"
          >
            We're Getting Married
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1"
          >
            <h1 className="text-6xl font-bold tracking-tight leading-none" style={{ color: colors.primary }}>
              {couple.groomName}
            </h1>
            <div className="flex items-center gap-3 justify-center">
              <div className="h-px flex-1 max-w-[60px]" style={{ backgroundColor: colors.primary, opacity: 0.3 }} />
              <span className="text-stone-400 font-sans text-sm">&amp;</span>
              <div className="h-px flex-1 max-w-[60px]" style={{ backgroundColor: colors.primary, opacity: 0.3 }} />
            </div>
            <h1 className="text-6xl font-bold tracking-tight leading-none" style={{ color: colors.primary }}>
              {couple.brideName}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 font-sans text-sm text-stone-500"
          >
            {events.reception.date && formatDateID(events.reception.date)}
          </motion.p>
        </div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute bottom-6 inset-x-0 flex justify-center"
        >
          <svg className="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* === GREETING === */}
      {meta.greeting && (
        <section className="px-8 py-14 text-center border-t border-stone-100">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-stone-500 leading-relaxed max-w-md mx-auto text-base italic"
          >
            &ldquo;{meta.greeting}&rdquo;
          </motion.p>
        </section>
      )}

      {/* === PENGANTIN === */}
      <section className="px-6 py-14 border-t border-stone-100">
        <SectionLabel>Mempelai</SectionLabel>
        <div className="mt-10 space-y-10">
          <CoupleItem
            name={couple.groomFullName ?? couple.groomName}
            parents={couple.groomParents}
            photo={photo.groom}
            colors={colors}
          />
          <div className="text-center text-3xl text-stone-200">&amp;</div>
          <CoupleItem
            name={couple.brideFullName ?? couple.brideName}
            parents={couple.brideParents}
            photo={photo.bride}
            colors={colors}
          />
        </div>
      </section>

      {/* === ACARA === */}
      <section className="px-6 py-14 bg-stone-50 border-t border-stone-100">
        <SectionLabel>Acara</SectionLabel>
        <div className="mt-10 space-y-5">
          {events.akad && (
            <EventCard title="Akad Nikah" event={events.akad} colors={colors} />
          )}
          <EventCard title="Resepsi Pernikahan" event={events.reception} colors={colors} />
        </div>
      </section>

      {/* === RSVP === */}
      {!rsvpSubmitted ? (
        <section className="px-6 py-14 border-t border-stone-100">
          <SectionLabel>Konfirmasi Kehadiran</SectionLabel>
          {meta.rsvpDeadline && (
            <p className="mt-2 text-xs text-stone-400 font-sans text-center">
              Konfirmasi sebelum {formatDateID(meta.rsvpDeadline)}
            </p>
          )}
          <RsvpForm onSubmit={() => setRsvpSubmitted(true)} colors={colors} />
        </section>
      ) : (
        <section className="px-6 py-14 border-t border-stone-100 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="text-5xl">🎊</div>
            <h3 className="text-xl font-semibold" style={{ color: colors.primary }}>Terima kasih!</h3>
            <p className="text-stone-500 font-sans text-sm">Konfirmasi Anda telah kami terima.</p>
          </motion.div>
        </section>
      )}

      {/* === AMPLOP DIGITAL === */}
      {digitalGifts && (digitalGifts.bankAccounts?.length || digitalGifts.qrisImageUrl) && (
        <section className="px-6 py-14 bg-stone-50 border-t border-stone-100 text-center">
          <SectionLabel>Amplop Digital</SectionLabel>
          <p className="mt-3 text-stone-500 font-sans text-sm max-w-xs mx-auto">
            Bagi yang ingin memberikan hadiah
          </p>
          <div className="mt-8 space-y-4">
            {digitalGifts.bankAccounts?.map((acc) => (
              <div
                key={acc.accountNumber}
                className="bg-white rounded-xl p-4 border border-stone-100 text-left flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-sans text-xs text-stone-400 uppercase tracking-wide">{acc.bankName}</p>
                  <p className="font-mono text-lg font-semibold text-stone-800">{acc.accountNumber}</p>
                  <p className="font-sans text-sm text-stone-500">{acc.accountHolder}</p>
                </div>
                <button
                  onClick={() => handleCopyAccount(acc.accountNumber)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-colors",
                    copiedAccount === acc.accountNumber
                      ? "bg-green-100 text-green-700"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  )}
                >
                  {copiedAccount === acc.accountNumber
                    ? <><Check size={13} /> Tersalin</>
                    : <><Copy size={13} /> Salin</>
                  }
                </button>
              </div>
            ))}
            {digitalGifts.qrisImageUrl && (
              <div className="bg-white rounded-xl p-4 border border-stone-100 text-center">
                <p className="font-sans text-sm text-stone-500 mb-3">Scan QRIS</p>
                <Image src={digitalGifts.qrisImageUrl} alt="QRIS" width={200} height={200} className="mx-auto rounded-lg" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* === FOOTER === */}
      <footer className="px-6 py-10 text-center text-stone-400 font-sans text-xs space-y-1 border-t border-stone-100">
        <div className="h-px w-12 mx-auto mb-4" style={{ backgroundColor: colors.primary, opacity: 0.3 }} />
        <p>{couple.groomName} &amp; {couple.brideName}</p>
        <p>{events.reception.date.slice(0, 4)} · Made with ❤️</p>
      </footer>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <p className="text-xs tracking-[0.35em] uppercase font-sans text-stone-400">{children}</p>
    </motion.div>
  )
}

function CoupleItem({ name, parents, photo, colors }: {
  name: string; parents?: string; photo?: string; colors: TemplateProps["colors"]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col items-center gap-3 text-center"
    >
      {photo && (
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 shadow-sm" style={{ borderColor: colors.primary }}>
          <Image src={photo} alt={name} width={96} height={96} className="object-cover w-full h-full" />
        </div>
      )}
      <h3 className="text-xl font-semibold tracking-tight text-stone-800">{name}</h3>
      {parents && <p className="text-sm text-stone-400 font-sans">{parents}</p>}
    </motion.div>
  )
}

function EventCard({ title, event, colors }: {
  title: string; event: import("@/types/template").EventDetail; colors: TemplateProps["colors"]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl border border-stone-100 p-5 font-sans text-sm text-stone-600 space-y-2"
    >
      <p className="font-semibold text-stone-900 text-base" style={{ color: colors.primary }}>{title}</p>
      <div className="flex items-center gap-2">
        <Calendar size={14} className="shrink-0" style={{ color: colors.primary }} />
        <span>{formatDateID(event.date)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock size={14} className="shrink-0" style={{ color: colors.primary }} />
        <span>{formatTime(event.time)}</span>
      </div>
      <div className="flex items-start gap-2">
        <MapPin size={14} className="shrink-0 mt-0.5" style={{ color: colors.primary }} />
        <div>
          <p className="font-medium text-stone-800">{event.venue}</p>
          <p className="text-stone-400">{event.address}</p>
        </div>
      </div>
      {event.mapsUrl && (
        <a
          href={event.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-1 text-xs font-medium underline underline-offset-2"
          style={{ color: colors.primary }}
        >
          Buka di Google Maps →
        </a>
      )}
    </motion.div>
  )
}

function RsvpForm({ onSubmit, colors }: { onSubmit: () => void; colors: TemplateProps["colors"] }) {
  const [form, setForm] = useState({ name: "", attendance: "attending" as RsvpStatus, guests: "1" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-3 max-w-sm mx-auto font-sans">
      <input
        required
        placeholder="Nama lengkap Anda"
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 bg-white"
        style={{ "--tw-ring-color": colors.primary } as React.CSSProperties}
      />
      <select
        value={form.attendance}
        onChange={e => setForm(f => ({ ...f, attendance: e.target.value as RsvpStatus }))}
        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white"
      >
        <option value="attending">✅ Hadir</option>
        <option value="not_attending">❌ Tidak Hadir</option>
        <option value="maybe">🤔 Mungkin Hadir</option>
      </select>
      {form.attendance === "attending" && (
        <select
          value={form.guests}
          onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white"
        >
          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} orang</option>)}
        </select>
      )}
      <button
        type="submit"
        className="w-full py-3 rounded-xl font-medium text-sm text-white"
        style={{ backgroundColor: colors.primary }}
      >
        Kirim Konfirmasi
      </button>
    </form>
  )
}
