"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { MapPin, Clock, Calendar, Copy, Check } from "lucide-react"
import { useState } from "react"
import type { TemplateProps } from "@/types/template"
import type { RsvpStatus } from "@/types/api"
import { formatDateID, formatTime, cn } from "@/lib/utils"

/** Display label untuk RSVP status enum (API pakai English, tampilkan Indonesia) */
export const rsvpStatusLabel: Record<RsvpStatus, string> = {
  attending: "Hadir",
  not_attending: "Tidak Hadir",
  maybe: "Mungkin Hadir",
} as const

/**
 * Template: Elegant Garden
 * Tema: Elegan, floral, warm earth tones
 * Target: Pasangan modern yang suka estetika minimalis-romantis
 */
export default function TemplateElegantGarden({ couple, photo, events, digitalGifts, colors, meta }: TemplateProps) {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null)
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)

  const handleCopyAccount = async (accountNumber: string) => {
    await navigator.clipboard.writeText(accountNumber)
    setCopiedAccount(accountNumber)
    setTimeout(() => setCopiedAccount(null), 2000)
  }

  const style = {
    "--color-primary": colors.primary,
    "--color-secondary": colors.secondary,
    "--color-accent": colors.accent ?? colors.primary,
  } as React.CSSProperties

  return (
    <div style={style} className="min-h-screen bg-[var(--color-secondary)] font-serif text-stone-800">

      {/* === HERO === */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Background ornament */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-[var(--color-primary)] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[var(--color-primary)] translate-x-1/3 translate-y-1/3" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 space-y-6"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-[var(--color-primary)] font-sans">
            The Wedding of
          </p>

          {photo.couple && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-[var(--color-primary)] shadow-xl"
            >
              <Image
                src={photo.couple}
                alt={`${couple.groomName} & ${couple.brideName}`}
                width={192}
                height={192}
                className="object-cover w-full h-full"
                priority
              />
            </motion.div>
          )}

          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-[var(--color-primary)] leading-tight">
              {couple.groomName}
            </h1>
            <p className="text-2xl text-stone-500">&amp;</p>
            <h1 className="text-5xl font-bold text-[var(--color-primary)] leading-tight">
              {couple.brideName}
            </h1>
          </div>

          <p className="text-stone-500 font-sans text-sm">
            {events.akad ? formatDateID(events.akad.date) : formatDateID(events.reception.date)}
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 text-[var(--color-primary)] opacity-60"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* === QUOTE / GREETING === */}
      {meta.greeting && (
        <section className="px-8 py-12 text-center bg-white/50">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-stone-600 leading-relaxed max-w-md mx-auto italic"
          >
            &ldquo;{meta.greeting}&rdquo;
          </motion.p>
        </section>
      )}

      {/* === PENGANTIN === */}
      <section className="px-6 py-12 text-center">
        <SectionTitle>Mempelai</SectionTitle>
        <div className="mt-8 space-y-8">
          <CouplePerson
            name={couple.groomFullName ?? couple.groomName}
            parents={couple.groomParents}
            photo={photo.groom}
            colors={colors}
          />
          <div className="text-3xl text-[var(--color-primary)]">&amp;</div>
          <CouplePerson
            name={couple.brideFullName ?? couple.brideName}
            parents={couple.brideParents}
            photo={photo.bride}
            colors={colors}
          />
        </div>
      </section>

      {/* === ACARA === */}
      <section className="px-6 py-12 bg-white/50 text-center">
        <SectionTitle>Acara</SectionTitle>
        <div className="mt-8 space-y-6">
          {events.akad && (
            <EventCard title="Akad Nikah" event={events.akad} colors={colors} />
          )}
          <EventCard title="Resepsi Pernikahan" event={events.reception} colors={colors} />
        </div>
      </section>

      {/* === RSVP === */}
      {!rsvpSubmitted ? (
        <section className="px-6 py-12 text-center">
          <SectionTitle>Konfirmasi Kehadiran</SectionTitle>
          <p className="mt-3 text-stone-500 font-sans text-sm">
            {meta.rsvpDeadline ? `Konfirmasi sebelum ${formatDateID(meta.rsvpDeadline)}` : "Mohon konfirmasi kehadiran Anda"}
          </p>
          <RsvpForm onSubmit={() => setRsvpSubmitted(true)} colors={colors} />
        </section>
      ) : (
        <section className="px-6 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="text-5xl">🎊</div>
            <h3 className="text-xl font-semibold text-[var(--color-primary)]">Terima kasih!</h3>
            <p className="text-stone-500 font-sans text-sm">Konfirmasi kehadiran Anda telah diterima.</p>
          </motion.div>
        </section>
      )}

      {/* === AMPLOP DIGITAL === */}
      {digitalGifts && (digitalGifts.bankAccounts?.length || digitalGifts.qrisImageUrl) && (
        <section className="px-6 py-12 bg-white/50 text-center">
          <SectionTitle>Amplop Digital</SectionTitle>
          <p className="mt-3 text-stone-500 font-sans text-sm max-w-xs mx-auto">
            Bagi yang ingin memberikan hadiah, kami terima melalui transfer berikut
          </p>
          <div className="mt-8 space-y-4">
            {digitalGifts.bankAccounts?.map((acc) => (
              <div
                key={acc.accountNumber}
                className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 text-left flex items-center justify-between gap-4"
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
                      : "bg-[var(--color-secondary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                  )}
                >
                  {copiedAccount === acc.accountNumber ? <><Check size={14} /> Tersalin</> : <><Copy size={14} /> Salin</>}
                </button>
              </div>
            ))}
            {digitalGifts.qrisImageUrl && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                <p className="font-sans text-sm text-stone-500 mb-3">Scan QRIS</p>
                <Image
                  src={digitalGifts.qrisImageUrl}
                  alt="QRIS"
                  width={200}
                  height={200}
                  className="mx-auto rounded-lg"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* === FOOTER === */}
      <footer className="px-6 py-10 text-center text-stone-400 font-sans text-xs space-y-1">
        <p>Made with ❤️ — Undangan Digital</p>
        <p>{couple.groomName} &amp; {couple.brideName} · {events.reception.date.slice(0, 4)}</p>
      </footer>
    </div>
  )
}

// ============ Sub-components ============

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-2xl font-bold text-[var(--color-primary)]"
    >
      {children}
      <div className="mt-2 mx-auto w-12 h-0.5 bg-[var(--color-primary)] opacity-40 rounded-full" />
    </motion.h2>
  )
}

function CouplePerson({
  name, parents, photo, colors
}: {
  name: string; parents?: string; photo?: string; colors: TemplateProps["colors"]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-3"
    >
      {photo && (
        <div className="mx-auto w-28 h-28 rounded-full overflow-hidden border-2 border-[var(--color-primary)] shadow-md">
          <Image src={photo} alt={name} width={112} height={112} className="object-cover w-full h-full" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-stone-800">{name}</h3>
      {parents && <p className="text-sm text-stone-500 font-sans">{parents}</p>}
    </motion.div>
  )
}

function EventCard({
  title, event, colors
}: {
  title: string; event: import("@/types/template").EventDetail; colors: TemplateProps["colors"]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 text-left space-y-3"
    >
      <h3 className="font-semibold text-[var(--color-primary)] text-lg">{title}</h3>
      <div className="space-y-2 font-sans text-sm text-stone-600">
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-[var(--color-primary)] shrink-0" />
          <span>{formatDateID(event.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-[var(--color-primary)] shrink-0" />
          <span>{formatTime(event.time)}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin size={15} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-stone-800">{event.venue}</p>
            <p className="text-stone-500">{event.address}</p>
          </div>
        </div>
      </div>
      {event.mapsUrl && (
        <a
          href={event.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 px-4 py-1.5 rounded-lg text-xs font-medium font-sans bg-[var(--color-secondary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
        >
          Buka di Google Maps →
        </a>
      )}
    </motion.div>
  )
}

function RsvpForm({ onSubmit, colors }: { onSubmit: () => void; colors: TemplateProps["colors"] }) {
  const [form, setForm] = useState({ name: "", attendance: "attending" as RsvpStatus, guests: "1" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Wire ke api.submitRsvp(invitationId, { guestName, status, guestCount })
    // api.submitRsvp(invitationId, {
    //   guestName: form.name,
    //   status: form.attendance,
    //   guestCount: form.attendance === "attending" ? Number(form.guests) : 0,
    // })
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-sm mx-auto font-sans">
      <input
        required
        placeholder="Nama lengkap Anda"
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
      />
      <select
        value={form.attendance}
        onChange={e => setForm(f => ({ ...f, attendance: e.target.value as RsvpStatus }))}
        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
      >
        <option value="attending">✅ Hadir</option>
        <option value="not_attending">❌ Tidak Hadir</option>
        <option value="maybe">🤔 Mungkin Hadir</option>
      </select>
      {form.attendance === "attending" && (
        <select
          value={form.guests}
          onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
        >
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n} orang</option>
          ))}
        </select>
      )}
      <button
        type="submit"
        className="w-full py-3 rounded-xl font-medium text-sm bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
      >
        Kirim Konfirmasi
      </button>
    </form>
  )
}
