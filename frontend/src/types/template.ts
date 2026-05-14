/**
 * TemplateProps — Standardized interface untuk semua template undangan.
 * Semua template WAJIB menerima props ini, tidak boleh ada props custom per-template.
 * Jika ada field baru, tambahkan di sini (coordinate dengan Reza untuk DB alignment).
 */

export interface BankAccount {
  bankName: string      // e.g. "BCA", "Mandiri"
  accountNumber: string
  accountHolder: string
}

export interface EventDetail {
  date: string          // ISO 8601: "2025-09-20"
  time: string          // "HH:mm" format: "09:00"
  venue: string         // Nama tempat
  address: string       // Alamat lengkap
  mapsUrl?: string      // Google Maps embed/share URL (optional)
}

export interface TemplateColors {
  primary: string       // hex: "#B5936E"
  secondary: string     // hex: "#F5ECD7"
  accent?: string       // hex (optional, untuk detail kecil)
  text?: string         // hex (optional, override default text color)
}

export interface TemplateProps {
  // === PASANGAN ===
  couple: {
    groomName: string         // Nama pengantin pria
    groomFullName?: string    // Nama lengkap untuk caption formal
    groomParents?: string     // "Putra dari Bapak X & Ibu Y"
    brideName: string         // Nama pengantin wanita
    brideFullName?: string
    brideParents?: string
  }

  // === FOTO ===
  photo: {
    couple?: string           // URL foto couple utama
    groom?: string            // Foto pengantin pria (optional)
    bride?: string            // Foto pengantin wanita (optional)
  }

  // === ACARA ===
  events: {
    akad?: EventDetail        // Akad nikah (optional — ada yang tidak tampilkan)
    reception: EventDetail    // Resepsi (wajib)
  }

  // === AMPLOP DIGITAL ===
  digitalGifts?: {
    bankAccounts?: BankAccount[]  // Maks 3 rekening
    qrisImageUrl?: string         // URL gambar QRIS
  }

  // === STYLING ===
  colors: TemplateColors

  // === METADATA ===
  meta: {
    templateId: string        // ID template yang dipilih, e.g. "elegant-garden"
    slug: string              // URL slug: /u/[slug]
    isPublic: boolean
    rsvpDeadline?: string     // ISO 8601 date
    greeting?: string         // Custom greeting text di halaman undangan
  }
}

/**
 * Default/fallback values untuk preview dengan dummy data
 */
export const TEMPLATE_PREVIEW_DATA: TemplateProps = {
  couple: {
    groomName: "Rizky",
    groomFullName: "Muhammad Rizky Pratama",
    groomParents: "Putra dari Bapak Hendra & Ibu Sari",
    brideName: "Aulia",
    brideFullName: "Aulia Rahma Dewi",
    brideParents: "Putri dari Bapak Darmawan & Ibu Lestari",
  },
  photo: {
    couple: "/images/preview/couple-placeholder.svg",
  },
  events: {
    akad: {
      date: "2025-09-20",
      time: "08:00",
      venue: "Masjid Al-Ikhlas",
      address: "Jl. Sudirman No. 12, Jakarta Pusat",
      mapsUrl: "https://maps.google.com",
    },
    reception: {
      date: "2025-09-20",
      time: "11:00",
      venue: "Ballroom Hotel Mulia",
      address: "Jl. Asia Afrika No. 8, Jakarta Selatan",
      mapsUrl: "https://maps.google.com",
    },
  },
  digitalGifts: {
    bankAccounts: [
      { bankName: "BCA", accountNumber: "1234567890", accountHolder: "Muhammad Rizky Pratama" },
    ],
  },
  colors: {
    primary: "#B5936E",
    secondary: "#F5ECD7",
    accent: "#8B6F4E",
  },
  meta: {
    templateId: "elegant-garden",
    slug: "rizky-aulia",
    isPublic: true,
    rsvpDeadline: "2025-09-13",
    greeting: "Bersama keluarga besar kami, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.",
  },
}
