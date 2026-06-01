"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import gsap from "gsap"
import { MapPin, Clock, Calendar, Copy, Check, ChevronDown } from "lucide-react"
import type { TemplateProps, EventDetail } from "@/types/template"
import type { RsvpStatus } from "@/types/api"
import { formatDateID, formatTime } from "@/lib/utils"

// ─── GSAP plugin registration (safe within React) ───
let _gsapPluginsRegistered = false
function ensureGsapPlugins() {
  if (_gsapPluginsRegistered || typeof window === "undefined") return
  try {
    const TextPlugin = require("gsap/TextPlugin")
    const MotionPathPlugin = require("gsap/MotionPathPlugin")
    gsap.registerPlugin(TextPlugin, MotionPathPlugin)
  } catch { /* plugins optional, template still works without them */ }
  _gsapPluginsRegistered = true
}

// ─── Helper ───
function getFullName(full: string | undefined, fallback: string) {
  if (!full || full === fallback) return fallback
  // Kalau fullName = "Rizky Pratama" dan fallback = "Rizky", return full
  if (full.startsWith(fallback) && full.length > fallback.length) return full
  return fallback
}

// ─── Types ───
type SlideIndex = number
const TOTAL_SLIDES = 12 // 0..12 = 13 slides
const SLIDE_00 = 0
const SLIDE_01 = 1
const SLIDE_02 = 2
const SLIDE_03 = 3
const SLIDE_04 = 4
const SLIDE_05 = 5
const SLIDE_06 = 6
const SLIDE_07 = 7
const SLIDE_08 = 8
const SLIDE_09 = 9
const SLIDE_10 = 10
const SLIDE_11 = 11
const SLIDE_12 = 12

// ─── Main Component ──────────────────────────────────────
export default function TemplateCartoonWhimsical(props: TemplateProps) {
  const {
    couple, photo, events, digitalGifts, colors, meta, verse,
    story, proposal, opening, gallery,
  } = props

  ensureGsapPlugins()

  const [currentSlide, setCurrentSlide] = useState<SlideIndex>(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null)
  const [musicPlaying, setMusicPlaying] = useState(false)

  const appRef = useRef<HTMLDivElement>(null)
  const curtainRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const playedSlides = useRef(new Set<SlideIndex>())
  const floatTweens = useRef<gsap.core.Tween[]>([])

  // CSS vars
  const style = {
    "--color-primary": colors.primary,
    "--color-secondary": colors.secondary,
    "--color-accent": colors.accent ?? "#B8D4BD",
    "--color-curtain": colors.primary,
    "--color-text-light": "#7A7A7A",
  } as React.CSSProperties

  // ─── Slide transition ───────────────────────────────
  const goToSlide = useCallback((target: SlideIndex) => {
    if (isTransitioning) return
    if (target < 0 || target > TOTAL_SLIDES) return
    if (target === currentSlide) return

    const curtain = curtainRef.current
    if (!curtain) return

    setIsTransitioning(true)

    // Phase 1: curtain turun (menutupi layar)
    gsap.set(curtain, { yPercent: -100 })
    gsap.to(curtain, {
      yPercent: 0,
      duration: 0.6,
      ease: "power2.in",
      onComplete() {
        setCurrentSlide(target)
        playedSlides.current.add(target)

        // Phase 2: curtain lanjut turun (membuka slide baru)
        gsap.to(curtain, {
          yPercent: 100,
          duration: 0.6,
          ease: "power2.out",
          onComplete() {
            gsap.set(curtain, { yPercent: -100 })
            setIsTransitioning(false)
          },
        })
      },
    })
  }, [currentSlide, isTransitioning])

  // ─── Swipe support ──────────────────────────────────
  useEffect(() => {
    const el = appRef.current
    if (!el) return
    let startY = 0
    const onTouchStart = (e: TouchEvent) => { startY = e.touches[0].clientY }
    const onTouchEnd = (e: TouchEvent) => {
      const dy = e.changedTouches[0].clientY - startY
      if (Math.abs(dy) > 50) {
        if (dy < 0) goToSlide(currentSlide + 1)
        else goToSlide(currentSlide - 1)
      }
    }
    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchend", onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchend", onTouchEnd)
    }
  }, [currentSlide, goToSlide])

  // ─── Keyboard navigation ────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goToSlide(currentSlide + 1)
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goToSlide(currentSlide - 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [currentSlide, goToSlide])

  // ─── Copy rekening ──────────────────────────────────
  const handleCopyAccount = async (num: string) => {
    await navigator.clipboard.writeText(num)
    setCopiedAccount(num)
    setTimeout(() => setCopiedAccount(null), 2000)
  }

  // ─── Music toggle ───────────────────────────────────
  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    if (musicPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
    setMusicPlaying(!musicPlaying)
  }

  // ─── Computed display values ────────────────────────
  const groomFull = getFullName(couple.groomFullName, couple.groomName)
  const brideFull = getFullName(couple.brideFullName, couple.brideName)
  const displayNames = opening?.loadingNames ?? `${couple.groomName} & ${couple.brideName}`
  const displayDate = opening?.loadingDate ??
    formatDateID(events.akad?.date ?? events.reception.date).toUpperCase()

  return (
    <div
      ref={appRef}
      style={style}
      className="fixed inset-0 flex items-center justify-center bg-stone-800/90 font-sans"
      role="main"
      aria-label="Undangan Pernikahan Digital"
    >
      {/* Phone frame container */}
      <div className="relative w-full h-full max-w-[430px] overflow-hidden shadow-2xl md:rounded-3xl bg-[var(--color-secondary)]">
        {/* Curtain overlay */}
        <div ref={curtainRef} className="absolute inset-0 z-50 bg-[var(--color-curtain)] pointer-events-none" />

        {/* Background music */}
        {props.music?.url && (
          <>
            <audio ref={audioRef} src={props.music.url} loop preload="none" />
            <button
              onClick={toggleMusic}
              className="absolute top-4 right-4 z-40 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-[var(--color-primary)] hover:scale-110 transition-transform"
              aria-label={musicPlaying ? "Matikan musik" : "Putar musik"}
            >
              {musicPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.47 4.47 0 002.5-3.5zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0014 8.5v7a4.47 4.47 0 002.5-3.5zM3 9v6h4l5 5V4L7 9H3z"/></svg>
              )}
            </button>
          </>
        )}

        {/* Slide 00 — Opening / Loading */}
        <Slide00
          isActive={currentSlide === SLIDE_00}
          onPlayed={() => playedSlides.current.add(SLIDE_00)}
          displayNames={displayNames}
          displayDate={displayDate}
          colors={colors}
          onOpen={() => goToSlide(SLIDE_01)}
        />

        {/* Slide 01 — Cover */}
        <Slide01
          isActive={currentSlide === SLIDE_01}
          wasPlayed={playedSlides.current.has(SLIDE_01)}
          couple={couple}
          colors={colors}
          greeting={meta.greeting}
        />

        {/* Slide 02 — Introduction */}
        <Slide02
          isActive={currentSlide === SLIDE_02}
          wasPlayed={playedSlides.current.has(SLIDE_02)}
          couple={couple}
          photo={photo}
          colors={colors}
        />

        {/* Slide 03 — Our Story */}
        <Slide03
          isActive={currentSlide === SLIDE_03}
          wasPlayed={playedSlides.current.has(SLIDE_03)}
          story={story}
          colors={colors}
        />

        {/* Slide 04 — Our Bond */}
        <Slide04
          isActive={currentSlide === SLIDE_04}
          wasPlayed={playedSlides.current.has(SLIDE_04)}
          couple={couple}
          colors={colors}
        />

        {/* Slide 05 — Proposal */}
        <Slide05
          isActive={currentSlide === SLIDE_05}
          wasPlayed={playedSlides.current.has(SLIDE_05)}
          proposal={proposal}
          photo={photo}
          colors={colors}
        />

        {/* Slide 06 — Verse */}
        <Slide06
          isActive={currentSlide === SLIDE_06}
          wasPlayed={playedSlides.current.has(SLIDE_06)}
          verse={verse}
          colors={colors}
        />

        {/* Slide 07 — Invitation */}
        <Slide07
          isActive={currentSlide === SLIDE_07}
          wasPlayed={playedSlides.current.has(SLIDE_07)}
          couple={couple}
          photo={photo}
          colors={colors}
        />

        {/* Slide 08 — Save the Date */}
        <Slide08
          isActive={currentSlide === SLIDE_08}
          wasPlayed={playedSlides.current.has(SLIDE_08)}
          events={events}
          colors={colors}
        />

        {/* Slide 09 — Venue */}
        <Slide09
          isActive={currentSlide === SLIDE_09}
          wasPlayed={playedSlides.current.has(SLIDE_09)}
          events={events}
          colors={colors}
        />

        {/* Slide 10 — Digital Envelope */}
        <Slide10
          isActive={currentSlide === SLIDE_10}
          wasPlayed={playedSlides.current.has(SLIDE_10)}
          digitalGifts={digitalGifts}
          colors={colors}
          copiedAccount={copiedAccount}
          onCopyAccount={handleCopyAccount}
        />

        {/* Slide 11 — Gallery Intro */}
        <Slide11
          isActive={currentSlide === SLIDE_11}
          wasPlayed={playedSlides.current.has(SLIDE_11)}
          colors={colors}
        />

        {/* Slide 12 — Gallery */}
        <Slide12
          isActive={currentSlide === SLIDE_12}
          wasPlayed={playedSlides.current.has(SLIDE_12)}
          gallery={gallery}
          colors={colors}
          couple={couple}
        />

        {/* Navigation bar */}
        {currentSlide > 0 && (
          <NavBar
            currentSlide={currentSlide}
            totalSlides={TOTAL_SLIDES}
            onGoTo={goToSlide}
            isTransitioning={isTransitioning}
          />
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SLIDE 00 — Opening Screen
// ════════════════════════════════════════════════════════
function Slide00({
  isActive, onPlayed, displayNames, displayDate, colors, onOpen,
}: {
  isActive: boolean; onPlayed: () => void; displayNames: string;
  displayDate: string; colors: TemplateProps["colors"]; onOpen: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bowRef = useRef<HTMLDivElement>(null)
  const invitedRef = useRef<HTMLParagraphElement>(null)
  const namesRef = useRef<HTMLHeadingElement>(null)
  const dateRef = useRef<HTMLParagraphElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    if (!isActive || playedRef.current) return
    playedRef.current = true
    onPlayed()

    const tl = gsap.timeline({ delay: 0.3 })

    // Bow floats
    if (bowRef.current) {
      gsap.set(bowRef.current, { opacity: 0, scale: 0.5, y: 20 })
      tl.to(bowRef.current, {
        opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(2.5)",
      })
      tl.to(bowRef.current, {
        y: -6, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut",
      }, "+=0.1")
    }

    // "you are invited"
    if (invitedRef.current) {
      gsap.set(invitedRef.current, { opacity: 0, y: -20 })
      tl.to(invitedRef.current, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=0.3")
    }

    // Names
    if (namesRef.current) {
      gsap.set(namesRef.current, { opacity: 0, scale: 0.5 })
      tl.to(namesRef.current, {
        opacity: 1, scale: 1, duration: 1.0, ease: "elastic.out(1, 0.5)",
      }, "+=0.15")
    }

    // Date
    if (dateRef.current) {
      gsap.set(dateRef.current, { opacity: 0 })
      tl.to(dateRef.current, { opacity: 1, duration: 0.8, ease: "power2.out" }, "+=0.2")
    }

    // Button
    if (btnRef.current) {
      gsap.set(btnRef.current, { opacity: 0, y: 24, scale: 0.85 })
      tl.to(btnRef.current, {
        opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(2)",
      }, "+=0.15")
      tl.to(btnRef.current, {
        scale: 1.05, duration: 0.9, repeat: -1, yoyo: true, ease: "sine.inOut",
      }, "+=0.3")
    }

    return () => { tl.kill() }
  }, [isActive])

  if (!isActive) return null

  return (
    <div ref={containerRef} className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center bg-[var(--color-secondary)]">
      {/* Bow SVG */}
      <div ref={bowRef} className="mb-6">
        <svg width="120" height="80" viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
          <path d="M70,44 C58,58 44,68 28,80" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M70,44 C82,58 96,68 112,80" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M70,42 C40,22 36,44 70,54" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M70,42 C100,22 104,44 70,54" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <circle cx="70" cy="47" r="4.5" fill={colors.primary}/>
        </svg>
      </div>

      <p ref={invitedRef} className="text-sm tracking-[0.2em] uppercase text-stone-500 mb-4" style={{ fontFamily: "'Caveat', cursive" }}>
        you are invited
      </p>

      <h1 ref={namesRef} className="text-4xl sm:text-5xl font-bold text-[var(--color-primary)] mb-4" style={{ fontFamily: "'Caveat', cursive" }}>
        {displayNames}
      </h1>

      {/* Wave divider */}
      <div className="w-48 mb-4">
        <svg width="200" height="20" viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20,10 Q65,0 100,10 Q135,20 180,10" stroke={colors.primary} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
        </svg>
      </div>

      <p ref={dateRef} className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-8">
        {displayDate}
      </p>

      {/* Sparkles */}
      <div className="flex gap-3 mb-8">
        {["✦", "✧", "✦"].map((s, i) => (
          <span key={i} className="text-[var(--color-accent)] text-lg animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
            {s}
          </span>
        ))}
      </div>

      <button
        ref={btnRef}
        onClick={onOpen}
        className="px-8 py-3 rounded-full bg-[var(--color-primary)] text-white text-sm font-medium shadow-lg hover:opacity-90 transition-opacity"
      >
        Buka Undangan
      </button>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SLIDE 01 — Cover
// ════════════════════════════════════════════════════════
function Slide01({
  isActive, wasPlayed, couple, colors, greeting,
}: {
  isActive: boolean; wasPlayed: boolean; couple: TemplateProps["couple"];
  colors: TemplateProps["colors"]; greeting?: string;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const coupleRef = useRef<HTMLHeadingElement>(null)
  const greetingRef = useRef<HTMLParagraphElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    if (!isActive || playedRef.current) return
    playedRef.current = true
    const tl = gsap.timeline()

    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 0, y: -20, scale: 0.9 })
      tl.to(titleRef.current, { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: "elastic.out(1, 0.4)" })
    }
    if (subRef.current) {
      gsap.set(subRef.current, { opacity: 0, y: 18 })
      tl.to(subRef.current, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=0.3")
    }
    if (coupleRef.current) {
      gsap.set(coupleRef.current, { opacity: 0, scale: 0.8 })
      tl.to(coupleRef.current, { opacity: 1, scale: 1, duration: 1.1, ease: "elastic.out(1, 0.5)" }, "-=0.2")
    }
    if (greetingRef.current && greeting) {
      gsap.set(greetingRef.current, { opacity: 0, y: 14 })
      tl.to(greetingRef.current, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "+=0.3")
    }
    return () => { tl.kill() }
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center bg-[var(--color-secondary)]">
      {/* Decorative border */}
      <div className="absolute inset-6 border-2 border-[var(--color-primary)]/20 rounded-3xl pointer-events-none" />

      <p ref={titleRef} className="text-xs tracking-[0.3em] uppercase text-[var(--color-primary)] mb-3">
        The Wedding of
      </p>

      <p ref={subRef} className="text-xs text-stone-400 tracking-widest uppercase mb-6">
        Created with Love
      </p>

      <h1 ref={coupleRef} className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] leading-snug mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
        {couple.groomName}<br/>
        <span className="text-2xl text-stone-400 font-normal">&amp;</span><br/>
        {couple.brideName}
      </h1>

      {greeting && (
        <p ref={greetingRef} className="text-sm text-stone-500 italic max-w-xs leading-relaxed mt-4">
          &ldquo;{greeting}&rdquo;
        </p>
      )}

      <ChevronDown className="absolute bottom-8 text-[var(--color-primary)]/40 animate-bounce" size={22} />
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SLIDE 02 — Introduction (Profil Mempelai)
// ════════════════════════════════════════════════════════
function Slide02({
  isActive, wasPlayed, couple, photo, colors,
}: {
  isActive: boolean; wasPlayed: boolean; couple: TemplateProps["couple"];
  photo: TemplateProps["photo"]; colors: TemplateProps["colors"];
}) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const groomCardRef = useRef<HTMLDivElement>(null)
  const brideCardRef = useRef<HTMLDivElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    if (!isActive || playedRef.current) return
    playedRef.current = true
    const tl = gsap.timeline()

    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 0, y: -24 })
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
    }
    if (groomCardRef.current) {
      gsap.set(groomCardRef.current, { opacity: 0, x: -50 })
      tl.to(groomCardRef.current, { opacity: 1, x: 0, duration: 0.7, ease: "back.out(1.5)" }, "+=0.1")
    }
    if (brideCardRef.current) {
      gsap.set(brideCardRef.current, { opacity: 0, x: 50 })
      tl.to(brideCardRef.current, { opacity: 1, x: 0, duration: 0.7, ease: "back.out(1.5)" }, "-=0.3")
    }
    return () => { tl.kill() }
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-[var(--color-secondary)] overflow-y-auto py-8">
      <h2 ref={titleRef} className="text-lg font-bold text-[var(--color-primary)] mb-6 tracking-widest uppercase">
        Introduction
      </h2>

      <div className="flex gap-4 w-full max-w-xs">
        {/* Groom Card */}
        <div ref={groomCardRef} className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          {photo.groom && (
            <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-[var(--color-primary)] mb-3">
              <img src={photo.groom} alt={couple.groomName} className="w-full h-full object-cover" />
            </div>
          )}
          <h3 className="font-semibold text-stone-800 text-sm">{couple.groomFullName ?? couple.groomName}</h3>
          {couple.groomRole && <p className="text-xs text-stone-400">{couple.groomRole}</p>}
          {couple.groomParents && <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">{couple.groomParents}</p>}
        </div>

        {/* Bride Card */}
        <div ref={brideCardRef} className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          {photo.bride && (
            <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-[var(--color-primary)] mb-3">
              <img src={photo.bride} alt={couple.brideName} className="w-full h-full object-cover" />
            </div>
          )}
          <h3 className="font-semibold text-stone-800 text-sm">{couple.brideFullName ?? couple.brideName}</h3>
          {couple.brideRole && <p className="text-xs text-stone-400">{couple.brideRole}</p>}
          {couple.brideParents && <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">{couple.brideParents}</p>}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SLIDE 03 — Our Story
// ════════════════════════════════════════════════════════
function Slide03({
  isActive, wasPlayed, story, colors,
}: {
  isActive: boolean; wasPlayed: boolean;
  story?: TemplateProps["story"]; colors: TemplateProps["colors"];
}) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const scenesRef = useRef<HTMLDivElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    if (!isActive || playedRef.current) return
    playedRef.current = true
    const tl = gsap.timeline()

    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 0 })
      tl.to(titleRef.current, { opacity: 1, duration: 0.7 })
    }

    if (scenesRef.current) {
      const scenes = scenesRef.current.querySelectorAll(".story-scene-item")
      gsap.set(scenes, { opacity: 0, y: 24 })
      tl.to(scenes, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.25, ease: "power3.out",
      }, "+=0.15")
    }
    return () => { tl.kill() }
  }, [isActive])

  if (!isActive) return null
  const scenes = story?.scenes ?? []

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-[var(--color-secondary)] overflow-y-auto py-8">
      <h2 ref={titleRef} className="text-lg font-bold text-[var(--color-primary)] mb-5 tracking-widest uppercase">
        Our Story
      </h2>

      <div ref={scenesRef} className="space-y-4 w-full max-w-xs">
        {scenes.length > 0 ? scenes.map((scene, i) => (
          <div key={i} className="story-scene-item bg-white rounded-2xl p-4 shadow-sm border border-stone-100 text-left flex gap-3 items-start">
            {scene.illustrationUrl && (
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                <img src={scene.illustrationUrl} alt={`Scene ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <span className="text-[10px] text-[var(--color-primary)] font-semibold tracking-widest">SCENE {i + 1}</span>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{scene.caption}</p>
            </div>
          </div>
        )) : (
          <div className="story-scene-item bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <p className="text-sm text-stone-400 italic">Cerita perjalanan cinta kami...</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SLIDE 04 — Our Bond
// ════════════════════════════════════════════════════════
function Slide04({
  isActive, wasPlayed, couple, colors,
}: {
  isActive: boolean; wasPlayed: boolean; couple: TemplateProps["couple"];
  colors: TemplateProps["colors"];
}) {
  const charLeftRef = useRef<HTMLDivElement>(null)
  const charRightRef = useRef<HTMLDivElement>(null)
  const bubbleLeftRef = useRef<HTMLDivElement>(null)
  const bubbleRightRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLParagraphElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    if (!isActive || playedRef.current) return
    playedRef.current = true
    const tl = gsap.timeline()

    if (charLeftRef.current) {
      gsap.set(charLeftRef.current, { opacity: 0, x: -30 })
      tl.to(charLeftRef.current, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" })
    }
    if (charRightRef.current) {
      gsap.set(charRightRef.current, { opacity: 0, x: 30 })
      tl.to(charRightRef.current, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" }, "-=0.35")
    }
    if (bubbleLeftRef.current) {
      gsap.set(bubbleLeftRef.current, { opacity: 0, scale: 0 })
      tl.to(bubbleLeftRef.current, { opacity: 1, scale: 1, duration: 0.7, ease: "elastic.out(1, 0.6)" }, "+=0.1")
    }
    if (bubbleRightRef.current) {
      gsap.set(bubbleRightRef.current, { opacity: 0, scale: 0 })
      tl.to(bubbleRightRef.current, { opacity: 1, scale: 1, duration: 0.7, ease: "elastic.out(1, 0.6)" }, "-=0.35")
    }
    if (quoteRef.current) {
      gsap.set(quoteRef.current, { opacity: 0, y: 12 })
      tl.to(quoteRef.current, { opacity: 1, y: 0, duration: 0.8 }, "+=0.2")

      // Floating loop
      tl.to(quoteRef.current, {
        y: -6, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut",
      })
    }
    return () => { tl.kill() }
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-[var(--color-secondary)]">
      {/* Character avatars */}
      <div className="flex items-center gap-4 mb-6">
        <div ref={charLeftRef} className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-2xl border-2 border-[var(--color-primary)]/20">
          👨
        </div>
        <div className="text-2xl text-[var(--color-primary)]">💕</div>
        <div ref={charRightRef} className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-2xl border-2 border-[var(--color-primary)]/20">
          👩
        </div>
      </div>

      {/* Thought bubbles */}
      <div className="flex gap-3 mb-6">
        <div ref={bubbleLeftRef} className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-stone-100 text-xs text-stone-600 max-w-[120px]">
          ❤️
        </div>
        <div ref={bubbleRightRef} className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-stone-100 text-xs text-stone-600 max-w-[120px]">
          ❤️
        </div>
      </div>

      <p ref={quoteRef} className="text-sm text-stone-500 italic max-w-xs leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
        &ldquo;Dua hati yang saling mencintai, bersatu dalam ikatan suci pernikahan.&rdquo;
      </p>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SLIDE 05 — Proposal Moment
// ════════════════════════════════════════════════════════
function Slide05({
  isActive, wasPlayed, proposal, photo, colors,
}: {
  isActive: boolean; wasPlayed: boolean; proposal?: TemplateProps["proposal"];
  photo: TemplateProps["photo"]; colors: TemplateProps["colors"];
}) {
  const bouquetRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLParagraphElement>(null)
  const replyRef = useRef<HTMLDivElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    if (!isActive || playedRef.current) return
    playedRef.current = true
    const tl = gsap.timeline()

    if (bouquetRef.current) {
      gsap.set(bouquetRef.current, { scaleY: 0, y: 20, transformOrigin: "bottom center" })
      tl.to(bouquetRef.current, { scaleY: 1, y: 0, duration: 1.1, ease: "back.out(1.2)" })
    }
    if (quoteRef.current && proposal?.quote) {
      gsap.set(quoteRef.current, { opacity: 0, y: 10 })
      tl.to(quoteRef.current, { opacity: 1, y: 0, duration: 0.8 }, "+=0.2")
    }
    if (replyRef.current && proposal?.reply) {
      gsap.set(replyRef.current, { opacity: 0, scale: 0.6 })
      tl.to(replyRef.current, { opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" }, "+=0.15")
    }
    return () => { tl.kill() }
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-[var(--color-secondary)]">
      {/* Bouquet */}
      <div ref={bouquetRef} className="text-6xl mb-4">
        💐
      </div>

      {proposal?.quote && (
        <p ref={quoteRef} className="text-base font-semibold text-stone-700 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          &ldquo;{proposal.quote}&rdquo;
        </p>
      )}

      {proposal?.reply && (
        <div ref={replyRef} className="inline-block bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-md">
          {proposal.reply}
        </div>
      )}

      {!proposal?.quote && !proposal?.reply && (
        <p className="text-stone-400 text-sm italic">
          The moment when two hearts became one.
        </p>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SLIDE 06 — Quran Verse
// ════════════════════════════════════════════════════════
function Slide06({
  isActive, wasPlayed, verse, colors,
}: {
  isActive: boolean; wasPlayed: boolean;
  verse?: TemplateProps["verse"]; colors: TemplateProps["colors"];
}) {
  const arabicRef = useRef<HTMLParagraphElement>(null)
  const transRef = useRef<HTMLParagraphElement>(null)
  const sourceRef = useRef<HTMLParagraphElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    if (!isActive || playedRef.current) return
    playedRef.current = true

    if (!verse) return
    const tl = gsap.timeline()

    if (arabicRef.current) {
      gsap.set(arabicRef.current, { opacity: 0, filter: "blur(4px)" })
      tl.to(arabicRef.current, { opacity: 1, filter: "blur(0px)", duration: 1.3, ease: "power2.inOut" })
    }
    if (transRef.current) {
      gsap.set(transRef.current, { opacity: 0, y: 12 })
      tl.to(transRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
    }
    if (sourceRef.current) {
      gsap.set(sourceRef.current, { opacity: 0 })
      tl.to(sourceRef.current, { opacity: 1, duration: 0.7 }, "-=0.2")
    }
    return () => { tl.kill() }
  }, [isActive])

  if (!isActive) return null
  if (!verse) return null

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center bg-[var(--color-secondary)]">
      {/* Bow decoration */}
      <div className="mb-6">
        <svg width="60" height="50" viewBox="0 0 100 80" fill="none">
          <path d="M50,38 C35,20 30,42 50,52" stroke={colors.primary} strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M50,38 C65,20 70,42 50,52" stroke={colors.primary} strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="50" cy="45" r="4" fill={colors.primary}/>
        </svg>
      </div>

      <p className="text-xs tracking-widest uppercase text-[var(--color-primary)] mb-4">Ayat Suci</p>

      <p ref={arabicRef} className="text-2xl leading-relaxed mb-4 text-stone-700" style={{ fontFamily: "'Amiri', serif", direction: "rtl" }}>
        {verse.arabic}
      </p>

      <div className="w-32 h-px bg-[var(--color-primary)]/30 mb-4" />

      <p ref={transRef} className="text-xs text-stone-500 leading-relaxed max-w-xs italic">
        &ldquo;{verse.translation}&rdquo;
      </p>

      {verse.source && (
        <p ref={sourceRef} className="text-[10px] text-stone-400 mt-3 tracking-wide">
          — {verse.source} —
        </p>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SLIDE 07 — Wedding Invitation
// ════════════════════════════════════════════════════════
function Slide07({
  isActive, wasPlayed, couple, photo, colors,
}: {
  isActive: boolean; wasPlayed: boolean; couple: TemplateProps["couple"];
  photo: TemplateProps["photo"]; colors: TemplateProps["colors"];
}) {
  const labelRef = useRef<HTMLParagraphElement>(null)
  const groomRef = useRef<HTMLHeadingElement>(null)
  const brideRef = useRef<HTMLHeadingElement>(null)
  const ampRef = useRef<HTMLSpanElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    if (!isActive || playedRef.current) return
    playedRef.current = true
    const tl = gsap.timeline()

    if (labelRef.current) {
      gsap.set(labelRef.current, { opacity: 0, y: -12 })
      tl.to(labelRef.current, { opacity: 1, y: 0, duration: 0.7 })
    }
    if (groomRef.current) {
      gsap.set(groomRef.current, { opacity: 0, x: -40 })
      tl.to(groomRef.current, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }, "+=0.1")
    }
    if (ampRef.current) {
      gsap.set(ampRef.current, { opacity: 0, scale: 0.3 })
      tl.to(ampRef.current, { opacity: 1, scale: 1, duration: 0.7, ease: "elastic.out(1.2, 0.5)" }, "-=0.3")
    }
    if (brideRef.current) {
      gsap.set(brideRef.current, { opacity: 0, x: 40 })
      tl.to(brideRef.current, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }, "-=0.5")
    }
    return () => { tl.kill() }
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-[var(--color-secondary)]">
      <p ref={labelRef} className="text-xs tracking-[0.25em] uppercase text-[var(--color-primary)] mb-4">
        Wedding Invitation
      </p>

      {photo.couple && (
        <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[var(--color-primary)]/20 shadow-lg mb-6">
          <img src={photo.couple} alt={`${couple.groomName} & ${couple.brideName}`} className="w-full h-full object-cover" />
        </div>
      )}

      <h2 ref={groomRef} className="text-2xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "'Playfair Display', serif" }}>
        {couple.groomFullName ?? couple.groomName}
      </h2>

      <span ref={ampRef} className="text-3xl text-[var(--color-primary)]/60 my-1">&amp;</span>

      <h2 ref={brideRef} className="text-2xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "'Playfair Display', serif" }}>
        {couple.brideFullName ?? couple.brideName}
      </h2>

      {/* Stars */}
      <div className="flex gap-2 mt-6">
        {["✦", "✧", "✦", "✧"].map((s, i) => (
          <span key={i} className="text-[var(--color-accent)] text-sm animate-spin" style={{ animationDuration: `${8 + i * 2}s` }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SLIDE 08 — Save the Date
// ════════════════════════════════════════════════════════
function Slide08({
  isActive, wasPlayed, events, colors,
}: {
  isActive: boolean; wasPlayed: boolean; events: TemplateProps["events"];
  colors: TemplateProps["colors"];
}) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    if (!isActive || playedRef.current) return
    playedRef.current = true
    const tl = gsap.timeline()

    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 0, y: -14 })
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.8 })
    }
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll(".date-card-item")
      gsap.set(cards, { opacity: 0, y: 20 })
      tl.to(cards, { opacity: 1, y: 0, duration: 0.7, stagger: 0.2, ease: "back.out(1.3)" }, "+=0.1")
    }
    return () => { tl.kill() }
  }, [isActive])

  if (!isActive) return null

  const allEvents = [
    ...(events.akad ? [{ title: "Akad Nikah", event: events.akad, icon: "🕌" }] : []),
    { title: "Resepsi", event: events.reception, icon: "🎊" },
  ]

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-[var(--color-secondary)] overflow-y-auto py-8">
      <h2 ref={titleRef} className="text-lg font-bold text-[var(--color-primary)] mb-5 tracking-widest uppercase">
        Save the Date
      </h2>

      <div ref={cardsRef} className="space-y-4 w-full max-w-xs">
        {allEvents.map((item, i) => (
          <div key={i} className="date-card-item bg-white rounded-2xl p-4 shadow-sm border border-stone-100 text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold text-[var(--color-primary)] text-sm">{item.title}</span>
            </div>
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-[var(--color-primary)] shrink-0" />
                <span>{formatDateID(item.event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-[var(--color-primary)] shrink-0" />
                <span>{formatTime(item.event.time)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SLIDE 09 — Venue
// ════════════════════════════════════════════════════════
function Slide09({
  isActive, wasPlayed, events, colors,
}: {
  isActive: boolean; wasPlayed: boolean; events: TemplateProps["events"];
  colors: TemplateProps["colors"];
}) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const venueCardRef = useRef<HTMLDivElement>(null)
  const playedRef = useRef(false)

  const venue = events.akad ?? events.reception

  useEffect(() => {
    if (!isActive || playedRef.current) return
    playedRef.current = true
    const tl = gsap.timeline()

    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 0, y: -16 })
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.8 })
    }
    if (venueCardRef.current) {
      gsap.set(venueCardRef.current, { opacity: 0, y: 20 })
      tl.to(venueCardRef.current, { opacity: 1, y: 0, duration: 0.9, ease: "back.out(1.2)" }, "+=0.15")
    }
    return () => { tl.kill() }
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-[var(--color-secondary)]">
      <h2 ref={titleRef} className="text-lg font-bold text-[var(--color-primary)] mb-4 tracking-widest uppercase">
        Venue
      </h2>

      <div ref={venueCardRef} className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 w-full max-w-xs text-left">
        {/* Illustration */}
        <div className="text-5xl text-center mb-3">🏛️</div>

        <h3 className="font-semibold text-stone-800 text-sm text-center">{venue.venue}</h3>
        <p className="text-xs text-stone-500 mt-1 text-center">{venue.address}</p>

        {venue.mapsUrl && (
          <a
            href={venue.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 text-center px-4 py-2 rounded-full bg-[var(--color-secondary)] text-[var(--color-primary)] text-xs font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors"
          >
            Buka di Google Maps →
          </a>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SLIDE 10 — Digital Envelope
// ════════════════════════════════════════════════════════
function Slide10({
  isActive, wasPlayed, digitalGifts, colors, copiedAccount, onCopyAccount,
}: {
  isActive: boolean; wasPlayed: boolean; digitalGifts?: TemplateProps["digitalGifts"];
  colors: TemplateProps["colors"]; copiedAccount: string | null;
  onCopyAccount: (num: string) => void;
}) {
  const giftRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    if (!isActive || playedRef.current) return
    playedRef.current = true
    const tl = gsap.timeline()

    if (giftRef.current) {
      gsap.set(giftRef.current, { opacity: 0, scale: 0.6, y: 20 })
      tl.to(giftRef.current, { opacity: 1, scale: 1, y: 0, duration: 1.0, ease: "elastic.out(1, 0.6)" })
    }
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll(".env-card-item")
      gsap.set(cards, { opacity: 0, x: -20 })
      tl.to(cards, { opacity: 1, x: 0, duration: 0.6, stagger: 0.2, ease: "power3.out" }, "+=0.1")
    }
    return () => { tl.kill() }
  }, [isActive])

  if (!isActive) return null
  const accounts = digitalGifts?.bankAccounts ?? []

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-[var(--color-secondary)] overflow-y-auto py-8">
      <div ref={giftRef} className="text-5xl mb-4">
        🎁
      </div>

      <h2 className="text-lg font-bold text-[var(--color-primary)] mb-1 tracking-widest uppercase">
        Amplop Digital
      </h2>
      <p className="text-xs text-stone-400 mb-5 max-w-[200px]">
        Bagi yang ingin memberikan hadiah
      </p>

      <div ref={cardsRef} className="space-y-3 w-full max-w-xs">
        {accounts.length > 0 ? accounts.map((acc, i) => (
          <div key={i} className="env-card-item bg-white rounded-xl p-3 shadow-sm border border-stone-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">{acc.bankName}</p>
              <p className="font-mono text-sm font-semibold text-stone-800">{acc.accountNumber}</p>
              <p className="text-[10px] text-stone-500">{acc.accountHolder}</p>
            </div>
            <button
              onClick={() => onCopyAccount(acc.accountNumber)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-[var(--color-secondary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors shrink-0"
            >
              {copiedAccount === acc.accountNumber ? (
                <><Check size={12} /> Tersalin</>
              ) : (
                <><Copy size={12} /> Salin</>
              )}
            </button>
          </div>
        )) : (
          <p className="text-xs text-stone-400 italic">Informasi amplop digital akan ditambahkan.</p>
        )}
      </div>

      {digitalGifts?.qrisImageUrl && (
        <div className="mt-4 bg-white rounded-xl p-3 shadow-sm border border-stone-100">
          <p className="text-[10px] text-stone-400 mb-2">Scan QRIS</p>
          <img src={digitalGifts.qrisImageUrl} alt="QRIS" className="w-32 h-32 mx-auto rounded-lg object-contain" />
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SLIDE 11 — Glimpse of Us (Gallery Intro)
// ════════════════════════════════════════════════════════
function Slide11({
  isActive, wasPlayed, colors,
}: {
  isActive: boolean; wasPlayed: boolean; colors: TemplateProps["colors"];
}) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    if (!isActive || playedRef.current) return
    playedRef.current = true
    const tl = gsap.timeline()

    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 0, clipPath: "inset(0 100% 0 0)" } as any)
      tl.to(titleRef.current, { opacity: 1, duration: 0.1 })
      tl.to(titleRef.current, { clipPath: "inset(0 0% 0 0)", duration: 1.2, ease: "power2.inOut" } as any, "<")
    }
    if (subRef.current) {
      gsap.set(subRef.current, { opacity: 0, y: 8 })
      tl.to(subRef.current, { opacity: 1, y: 0, duration: 0.7 }, "+=0.15")
    }
    return () => { tl.kill() }
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-[var(--color-secondary)]">
      {/* Bow */}
      <div className="mb-5">
        <svg width="60" height="50" viewBox="0 0 100 80" fill="none">
          <path d="M50,38 C35,20 30,42 50,52" stroke={colors.primary} strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M50,38 C65,20 70,42 50,52" stroke={colors.primary} strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="50" cy="45" r="4" fill={colors.primary}/>
        </svg>
      </div>

      <h2 ref={titleRef} className="text-lg font-bold text-[var(--color-primary)] mb-3 tracking-widest uppercase">
        Glimpse of Us
      </h2>

      <p ref={subRef} className="text-xs text-stone-400 max-w-[200px]">
        Cuplikan perjalanan cinta kami
      </p>

      {/* Arrow down indicator */}
      <div className="mt-8 text-[var(--color-primary)]/50 animate-bounce">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SLIDE 12 — Photo Gallery
// ════════════════════════════════════════════════════════
function Slide12({
  isActive, wasPlayed, gallery, colors, couple,
}: {
  isActive: boolean; wasPlayed: boolean; gallery?: TemplateProps["gallery"];
  colors: TemplateProps["colors"]; couple: TemplateProps["couple"];
}) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const photosRef = useRef<HTMLDivElement>(null)
  const closingRef = useRef<HTMLDivElement>(null)
  const playedRef = useRef(false)

  useEffect(() => {
    if (!isActive || playedRef.current) return
    playedRef.current = true
    const tl = gsap.timeline()

    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 0, y: -14 })
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.8 })
    }
    if (photosRef.current) {
      const photos = photosRef.current.querySelectorAll(".gallery-photo-item")
      gsap.set(photos, { opacity: 0, scale: 0.8, rotation: () => (Math.random() - 0.5) * 6 })
      tl.to(photos, {
        opacity: 1, scale: 1, rotation: 0, duration: 0.7, stagger: 0.15, ease: "back.out(1.3)",
      }, "+=0.1")
    }
    if (closingRef.current) {
      gsap.set(closingRef.current, { opacity: 0, y: 12 })
      tl.to(closingRef.current, { opacity: 1, y: 0, duration: 0.8 }, "+=0.2")
    }
    return () => { tl.kill() }
  }, [isActive])

  if (!isActive) return null
  const photos = gallery?.photos ?? []

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 bg-[var(--color-secondary)] overflow-y-auto py-8">
      <h2 ref={titleRef} className="text-lg font-bold text-[var(--color-primary)] mb-4 tracking-widest uppercase">
        Gallery
      </h2>

      <div ref={photosRef} className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {photos.length > 0 ? photos.slice(0, 4).map((photo, i) => (
          <div
            key={i}
            className={`gallery-photo-item bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 ${i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"}`}
          >
            <img src={photo.url} alt={photo.caption ?? `Foto ${i + 1}`} className="w-full h-full object-cover" />
            {photo.caption && (
              <div className="p-1.5">
                <p className="text-[10px] text-stone-500 text-center">{photo.caption}</p>
              </div>
            )}
          </div>
        )) : (
          <>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`gallery-photo-item bg-stone-100 rounded-xl flex items-center justify-center border border-stone-200 ${i === 1 ? "col-span-2 aspect-[2/1]" : "aspect-square"}`}>
                <span className="text-3xl text-stone-300">📷</span>
              </div>
            ))}
          </>
        )}
      </div>

      <div ref={closingRef} className="mt-6 text-center">
        <p className="text-sm text-stone-500" style={{ fontFamily: "'Playfair Display', serif" }}>
          Terima kasih atas doa dan kehadiran Anda
        </p>
        <p className="text-xs text-stone-400 mt-1">
          {couple.groomName} &amp; {couple.brideName}
        </p>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// Navigation Bar
// ════════════════════════════════════════════════════════
function NavBar({
  currentSlide, totalSlides, onGoTo, isTransitioning,
}: {
  currentSlide: number; totalSlides: number;
  onGoTo: (i: number) => void; isTransitioning: boolean;
}) {
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!navRef.current) return
    gsap.fromTo(navRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" })
  }, [currentSlide]) // re-animate on slide change

  return (
    <div
      ref={navRef}
      className="absolute bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-3 px-5 pb-[calc(12px+env(safe-area-inset-bottom,0px))] pt-2 bg-[var(--color-secondary)]/95 backdrop-blur-sm border-t border-[var(--color-primary)]/10"
    >
      <button
        onClick={() => onGoTo(currentSlide - 1)}
        disabled={currentSlide <= 1 || isTransitioning}
        className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center text-lg disabled:opacity-25 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
        aria-label="Sebelumnya"
      >
        ‹
      </button>

      <div className="flex gap-1.5">
        {Array.from({ length: totalSlides }, (_, i) => i).filter(i => i > 0).map(i => (
          <button
            key={i}
            onClick={() => onGoTo(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentSlide ? "bg-[var(--color-primary)] scale-125" : "bg-[var(--color-accent)]"}`}
            aria-label={`Halaman ${i}`}
          />
        ))}
      </div>

      <button
        onClick={() => onGoTo(currentSlide + 1)}
        disabled={currentSlide >= totalSlides || isTransitioning}
        className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center text-lg disabled:opacity-25 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
        aria-label="Berikutnya"
      >
        ›
      </button>
    </div>
  )
}
