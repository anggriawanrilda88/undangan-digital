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

export interface GalleryPhoto {
  url: string                 // URL foto
  caption?: string            // Caption pendek (opsional)
}

export interface StoryScene {
  illustrationUrl: string     // Ilustrasi scene
  caption: string             // Caption / teks cerita
}

export interface VerseSection {
  arabic: string              // Teks Arab
  translation: string         // Terjemahan
  source?: string             // Sumber ayat (e.g. "QS. An-Naba: 8")
}

export interface OpeningConfig {
  showLoadingScreen: boolean  // Tampilkan loading screen (slide 00)
  loadingNames?: string       // Teks nama di loading (e.g. "Risa & Fany")
  loadingDate?: string        // Teks tanggal di loading (e.g. "04 OKTOBER 2025")
  bowColor?: string           // Warna pita bow di loading (default: primary)
}

export interface ProposalConfig {
  quote?: string              // Teks quote proposal
  reply?: string              // Teks jawaban (e.g. "Yes, I Do! 💍")
}

export interface TemplateProps {
  // === PASANGAN ===
  couple: {
    groomName: string         // Nama pengantin pria
    groomFullName?: string    // Nama lengkap untuk caption formal
    groomRole?: string        // Gelar / role (e.g. "S.E")
    groomParents?: string     // "Putra dari Bapak X & Ibu Y"
    brideName: string         // Nama pengantin wanita
    brideFullName?: string
    brideRole?: string        // Gelar / role (e.g. "S.Ak")
    brideParents?: string
  }

  // === FOTO ===
  photo: {
    couple?: string           // URL foto couple utama
    groom?: string            // Foto pengantin pria (optional)
    bride?: string            // Foto pengantin wanita (optional)
    proposal?: string         // Foto momen proposal
    illustration?: string     // Ilustrasi couple (SVG/PNG)
  }

  // === ACARA ===
  events: {
    akad?: EventDetail        // Akad nikah (optional)
    reception: EventDetail    // Resepsi (wajib)
  }

  // === AMPLOP DIGITAL ===
  digitalGifts?: {
    bankAccounts?: BankAccount[]  // Maks 3 rekening
    qrisImageUrl?: string         // URL gambar QRIS
  }

  // === GALLERY FOTO ===
  gallery?: {
    photos: GalleryPhoto[]    // Array foto gallery (maks 6)
  }

  // === OUR STORY ===
  story?: {
    scenes: StoryScene[]      // Array scene cerita (maks 4)
  }

  // === VERSE / AYAT ===
  verse?: VerseSection

  // === PROPOSAL ===
  proposal?: ProposalConfig

  // === OPENING SCREEN ===
  opening?: OpeningConfig

  // === MUSIC ===
  music?: {
    enabled: boolean
    url?: string              // URL file audio
  }

  // === STYLING ===
  colors: TemplateColors

  // === METADATA ===
  meta: {
    templateId: string        // ID template yang dipilih, e.g. "elegant-garden", "cartoon-whimsical"
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
    groomRole: "S.E",
    groomParents: "Putra dari Bapak Hendra & Ibu Sari",
    brideName: "Aulia",
    brideFullName: "Aulia Rahma Dewi",
    brideRole: "S.Ak",
    brideParents: "Putri dari Bapak Darmawan & Ibu Lestari",
  },
  photo: {
    couple: "/images/preview/couple-placeholder.jpg",
    groom: undefined,
    bride: undefined,
    proposal: undefined,
    illustration: undefined,
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
  gallery: {
    photos: [
      { url: "/images/preview/gallery-1.jpg", caption: "First Date" },
      { url: "/images/preview/gallery-2.jpg", caption: "Engagement" },
      { url: "/images/preview/gallery-3.jpg", caption: "Pre-wedding" },
      { url: "/images/preview/gallery-4.jpg", caption: "Together" },
    ],
  },
  story: {
    scenes: [
      { illustrationUrl: "/images/preview/story-1.svg", caption: "Pertama kali bertemu di kampus, saling berkenalan dan bertukar cerita." },
      { illustrationUrl: "/images/preview/story-2.svg", caption: "Semakin dekat, saling memahami dan tumbuh bersama." },
      { illustrationUrl: "/images/preview/story-3.svg", caption: "Kini kami siap melangkah ke jenjang pernikahan." },
    ],
  },
  verse: {
    arabic: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    translation: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.",
    source: "QS. Ar-Rum: 21",
  },
  proposal: {
    quote: "Will you be my forever?",
    reply: "Yes, I Do! 💍",
  },
  opening: {
    showLoadingScreen: true,
    loadingNames: "Rizky & Aulia",
    loadingDate: "20 SEPTEMBER 2025",
    bowColor: undefined,
  },
  music: {
    enabled: false,
    url: undefined,
  },
  colors: {
    primary: "#2D5C3F",
    secondary: "#F5F0EB",
    accent: "#B8D4BD",
  },
  meta: {
    templateId: "cartoon-whimsical",
    slug: "rizky-aulia",
    isPublic: true,
    rsvpDeadline: "2025-09-13",
    greeting: "Bersama keluarga besar kami, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.",
  },
}
