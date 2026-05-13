import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
