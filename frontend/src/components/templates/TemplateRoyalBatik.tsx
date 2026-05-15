"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { MapPin, Clock, Calendar, Copy, Check } from "lucide-react"
import { useState } from "react"
import type { TemplateProps } from "@/types/template"
import type { RsvpStatus } from "@/types/api"
import { formatDateID, formatTime, cn } from "@/lib/utils"

/**
 * Template: Royal Batik
 * Tema: Tradisional Jawa, batik-inspired, warm brown & gold, ornamental
 * Target: Pasangan yang ingin nuansa adat/tradisional dengan sentuhan modern
 */
export default function TemplateRoyalBatik({ couple, photo, events, digitalGifts, colors, meta }: TemplateProps) {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null)
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)

  const handleCopyAccount = async (accountNumber: string) => {
    await navigator.clipboard.writeText(accountNumber)
    setCopiedAccount(accountNumber)
    setTimeout(() => setCopiedAccount(null), 2000)
  }

  // Royal Batik override colors kalau tidak diset
  const primary = colors.primary || "#7C3D12"     // brown
  const secondary = colors.secondary || "#FEF3C7"  // warm cream

  return (
    <div className="min-h-screen font-serif text-stone-800" style={{ backgroundColor: secondary }}>

      {/* === ORNAMENTAL HEADER === */}
      <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center text-center px-6">
        {/* Batik-inspired SVG ornament top */}
        <div className="absolute top-0 inset-x-0 h-24 overflow-hidden opacity-20">
          <svg viewBox="0 0 400 100" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50 Q50 0 100 50 Q150 100 200 50 Q250 0 300 50 Q350 100 400 50" stroke={primary} strokeWidth="2" fill="none"/>
            <path d="M0 70 Q50 20 100 70 Q150 120 200 70 Q250 20 300 70 Q350 120 400 70" stroke={primary} strokeWidth="1.5" fill="none"/>
            <circle cx="100" cy="50" r="5" fill={primary}/>
            <circle cx="200" cy="50" r="5" fill={primary}/>
            <circle cx="300" cy="50" r="5" fill={primary}/>
          </svg>
        </div>

        {/* Ornament bottom */}
        <div className="absolute bottom-0 inset-x-0 h-24 overflow-hidden opacity-20 rotate-180">
          <svg viewBox="0 0 400 100" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50 Q50 0 100 50 Q150 100 200 50 Q250 0 300 50 Q350 100 400 50" stroke={primary} strokeWidth="2" fill="none"/>
            <path d="M0 70 Q50 20 100 70 Q150 120 200 70 Q250 20 300 70 Q350 120 400 70" stroke={primary} strokeWidth="1.5" fill="none"/>
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 space-y-6"
        >
          <p className="text-xs tracking-[0.5em] uppercase font-sans" style={{ color: primary, opacity: 0.7 }}>
            Bismillahirrahmanirrahim
          </p>

          {/* Ornamental diamond divider */}
          <div className="flex items-center gap-3 justify-center">
            <div className="h-px w-12 opacity-30" style={{ backgroundColor: primary }} />
            <div className="w-2 h-2 rotate-45" style={{ backgroundColor: primary }} />
            <div className="h-px w-12 opacity-30" style={{ backgroundColor: primary }} />
          </div>

          {photo.couple && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto w-44 h-44 rounded-full overflow-hidden border-4 shadow-xl"
              style={{ borderColor: primary }}
            >
              <Image
                src={photo.couple}
                alt={`${couple.groomName} & ${couple.brideName}`}
                width={176}
                height={176}
                className="object-cover w-full h-full"
                priority
              />
            </motion.div>
          )}

          <div className="space-y-1">
            <h1 className="text-5xl font-bold leading-tight" style={{ color: primary }}>
              {couple.groomName}
            </h1>
            <div className="flex items-center gap-3 justify-center">
              <div className="h-px w-8 opacity-30" style={{ backgroundColor: primary }} />
              <span className="font-sans text-lg" style={{ color: primary, opacity: 0.5 }}>&amp;</span>
              <div className="h-px w-8 opacity-30" style={{ backgroundColor: primary }} />
            </div>
            <h1 className="text-5xl font-bold leading-tight" style={{ color: primary }}>
              {couple.brideName}
            </h1>
          </div>

          <p className="font-sans text-sm text-stone-500">
            {events.reception.date && formatDateID(events.reception.date)}
          </p>

          {/* Diamond divider bottom */}
          <div className="flex items-center gap-3 justify-center">
            <div className="h-px w-12 opacity-30" style={{ backgroundColor: primary }} />
            <div className="w-2 h-2 rotate-45" style={{ backgroundColor: primary }} />
            <div className="h-px w-12 opacity-30" style={{ backgroundColor: primary }} />
          </div>
        </motion.div>
      </section>

      {/* === GREETING === */}
      {meta.greeting && (
        <section className="px-8 py-14 text-center" style={{ backgroundColor: `${primary}10` }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="leading-relaxed max-w-md mx-auto italic text-base"
            style={{ color: primary }}
          >
            &ldquo;{meta.greeting}&rdquo;
          </motion.p>
        </section>
      )}

      {/* === PENGANTIN === */}
      <section className="px-6 py-14 text-center">
        <BatikSectionTitle primary={primary}>Mempelai</BatikSectionTitle>
        <div className="mt-10 space-y-10">
          <BatikCoupleItem
            name={couple.groomFullName ?? couple.groomName}
            parents={couple.groomParents}
            photo={photo.groom}
            primary={primary}
          />
          <div className="flex items-center gap-3 justify-center">
            <div className="h-px w-8 opacity-20" style={{ backgroundColor: primary }} />
            <div className="w-2.5 h-2.5 rotate-45" style={{ backgroundColor: primary, opacity: 0.4 }} />
            <div className="h-px w-8 opacity-20" style={{ backgroundColor: primary }} />
          </div>
          <BatikCoupleItem
            name={couple.brideFullName ?? couple.brideName}
            parents={couple.brideParents}
            photo={photo.bride}
            primary={primary}
          />
        </div>
      </section>

      {/* === ACARA === */}
      <section className="px-6 py-14 text-center" style={{ backgroundColor: `${primary}10` }}>
        <BatikSectionTitle primary={primary}>Rangkaian Acara</BatikSectionTitle>
        <div className="mt-10 space-y-5">
          {events.akad && (
            <BatikEventCard title="Akad Nikah" event={events.akad} primary={primary} />
          )}
          <BatikEventCard title="Resepsi Pernikahan" event={events.reception} primary={primary} />
        </div>
      </section>

      {/* === RSVP === */}
      {!rsvpSubmitted ? (
        <section className="px-6 py-14 text-center">
          <BatikSectionTitle primary={primary}>Konfirmasi Kehadiran</BatikSectionTitle>
          {meta.rsvpDeadline && (
            <p className="mt-2 text-xs text-stone-500 font-sans">
              Mohon konfirmasi sebelum {formatDateID(meta.rsvpDeadline)}
            </p>
          )}
          <RsvpForm onSubmit={() => setRsvpSubmitted(true)} primary={primary} />
        </section>
      ) : (
        <section className="px-6 py-14 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="text-5xl">🙏</div>
            <h3 className="text-xl font-semibold" style={{ color: primary }}>Jazakumullah Khairan</h3>
            <p className="text-stone-500 font-sans text-sm">Konfirmasi Anda telah kami terima.</p>
          </motion.div>
        </section>
      )}

      {/* === AMPLOP DIGITAL === */}
      {digitalGifts && (digitalGifts.bankAccounts?.length || digitalGifts.qrisImageUrl) && (
        <section className="px-6 py-14 text-center" style={{ backgroundColor: `${primary}10` }}>
          <BatikSectionTitle primary={primary}>Amplop Digital</BatikSectionTitle>
          <p className="mt-3 text-stone-500 font-sans text-sm max-w-xs mx-auto">
            Kebaikan Anda merupakan kehormatan bagi kami
          </p>
          <div className="mt-8 space-y-4">
            {digitalGifts.bankAccounts?.map((acc) => (
              <div
                key={acc.accountNumber}
                className="bg-white rounded-2xl p-4 border text-left flex items-center justify-between gap-4"
                style={{ borderColor: `${primary}30` }}
              >
                <div>
                  <p className="font-sans text-xs text-stone-400 uppercase tracking-wide">{acc.bankName}</p>
                  <p className="font-mono text-lg font-semibold text-stone-800">{acc.accountNumber}</p>
                  <p className="font-sans text-sm text-stone-500">{acc.accountHolder}</p>
                </div>
                <button
                  onClick={() => handleCopyAccount(acc.accountNumber)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-colors text-white",
                    copiedAccount === acc.accountNumber ? "bg-green-500" : ""
                  )}
                  style={copiedAccount !== acc.accountNumber ? { backgroundColor: primary } : {}}
                >
                  {copiedAccount === acc.accountNumber ? <><Check size={13} /> Tersalin</> : <><Copy size={13} /> Salin</>}
                </button>
              </div>
            ))}
            {digitalGifts.qrisImageUrl && (
              <div className="bg-white rounded-2xl p-4 border text-center" style={{ borderColor: `${primary}30` }}>
                <p className="font-sans text-sm text-stone-500 mb-3">Scan QRIS</p>
                <Image src={digitalGifts.qrisImageUrl} alt="QRIS" width={200} height={200} className="mx-auto rounded-lg" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* === FOOTER === */}
      <footer className="px-6 py-12 text-center font-sans text-xs text-stone-400 space-y-2">
        <div className="flex items-center gap-3 justify-center mb-4">
          <div className="h-px w-16 opacity-20" style={{ backgroundColor: primary }} />
          <div className="w-2 h-2 rotate-45 opacity-40" style={{ backgroundColor: primary }} />
          <div className="h-px w-16 opacity-20" style={{ backgroundColor: primary }} />
        </div>
        <p className="font-serif text-sm" style={{ color: primary }}>
          {couple.groomName} &amp; {couple.brideName}
        </p>
        <p>{events.reception.date.slice(0, 4)} · Made with ❤️</p>
      </footer>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────

function BatikSectionTitle({ children, primary }: { children: React.ReactNode; primary: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <h2 className="text-2xl font-bold" style={{ color: primary }}>{children}</h2>
      <div className="flex items-center gap-2 justify-center mt-2">
        <div className="h-px w-8 opacity-30" style={{ backgroundColor: primary }} />
        <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: primary, opacity: 0.5 }} />
        <div className="h-px w-8 opacity-30" style={{ backgroundColor: primary }} />
      </div>
    </motion.div>
  )
}

function BatikCoupleItem({ name, parents, photo, primary }: {
  name: string; parents?: string; photo?: string; primary: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-3 text-center"
    >
      {photo && (
        <div
          className="mx-auto w-28 h-28 rounded-full overflow-hidden border-4 shadow-md"
          style={{ borderColor: primary }}
        >
          <Image src={photo} alt={name} width={112} height={112} className="object-cover w-full h-full" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-stone-800">{name}</h3>
      {parents && <p className="text-sm text-stone-500 font-sans">{parents}</p>}
    </motion.div>
  )
}

function BatikEventCard({ title, event, primary }: {
  title: string; event: import("@/types/template").EventDetail; primary: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-5 shadow-sm border text-left space-y-2 font-sans text-sm text-stone-600"
      style={{ borderColor: `${primary}30` }}
    >
      <h3 className="font-semibold text-base" style={{ color: primary }}>{title}</h3>
      <div className="flex items-center gap-2">
        <Calendar size={14} style={{ color: primary }} className="shrink-0" />
        <span>{formatDateID(event.date)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock size={14} style={{ color: primary }} className="shrink-0" />
        <span>{formatTime(event.time)}</span>
      </div>
      <div className="flex items-start gap-2">
        <MapPin size={14} style={{ color: primary }} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-stone-800">{event.venue}</p>
          <p className="text-stone-500">{event.address}</p>
        </div>
      </div>
      {event.mapsUrl && (
        <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer"
          className="inline-block mt-1 text-xs font-medium underline underline-offset-2"
          style={{ color: primary }}
        >
          Buka di Google Maps →
        </a>
      )}
    </motion.div>
  )
}

function RsvpForm({ onSubmit, primary }: { onSubmit: () => void; primary: string }) {
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
        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none bg-white"
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
        style={{ backgroundColor: primary }}
      >
        Kirim Konfirmasi
      </button>
    </form>
  )
}
