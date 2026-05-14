import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Base URL platform — pakai env var, fallback ke production subdomain.
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://undangan-digital.anggriawan.my.id"

/**
 * Generate shareable link undangan
 * e.g. shareUrl("rizky-aulia") → "https://undangan-digital.anggriawan.my.id/u/rizky-aulia"
 */
export function shareUrl(slug: string): string {
  return `${BASE_URL}/u/${slug}`
}

/**
 * Generate pesan default WhatsApp share (US-04 AC)
 */
export function whatsappShareText(groomName: string, brideName: string, slug: string): string {
  const url = shareUrl(slug)
  return `Yth. Bapak/Ibu/Saudara/i,\n\nDengan penuh suka cita kami mengundang kehadiran Anda di pernikahan *${groomName}* & *${brideName}*.\n\nSelengkapnya: ${url}`
}

/**
 * Format tanggal ke bahasa Indonesia
 * e.g. "2025-09-20" → "Sabtu, 20 September 2025"
 */
export function formatDateID(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Format waktu
 * e.g. "09:00" → "09.00 WIB"
 */
export function formatTime(time: string, timezone = "WIB"): string {
  return `${time.replace(":", ".")} ${timezone}`
}
