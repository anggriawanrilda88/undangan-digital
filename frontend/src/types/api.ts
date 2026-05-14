/**
 * API Types — Generated from OpenAPI spec Reza (openapi-undangan-digital.yaml)
 * Jangan modifikasi manual; sync ulang kalau spec berubah.
 */

// ─── Base ───────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── User ───────────────────────────────────────────────

export interface UserProfile {
  id: string
  email: string
  name: string
  createdAt: string
}

// ─── Invitation Config (template settings) ──────────────

export interface InvitationConfig {
  templateId: string
  colors: {
    primary: string
    secondary: string
  }
  fonts?: {
    heading?: string
    body?: string
  }
  couplePhoto?: string
  music?: {
    enabled: boolean
    url?: string | null
  }
}

// ─── Invitation Content (data undangan) ─────────────────

export interface VenueInfo {
  name: string
  address: string
  mapsUrl?: string | null
}

export interface BankAccountApi {
  bankName: string
  accountNumber: string
  accountName: string  // Note: API pakai "accountName", bukan "accountHolder"
}

export interface InvitationContent {
  groomName: string
  brideName: string
  groomParents?: string
  brideParents?: string
  akadDate?: string | null       // ISO 8601 date-time
  receptionDate: string          // ISO 8601 date-time
  akadVenue?: VenueInfo | null
  venue: VenueInfo               // Venue resepsi
  digitalEnvelope?: {
    bankAccounts?: BankAccountApi[]
    qrisImageUrl?: string | null
  } | null
  openingMessage?: string
}

// ─── Invitation (full, authenticated) ───────────────────

export type InvitationStatus = "draft" | "published" | "archived"

export interface Invitation {
  id: string
  userId: string
  slug: string
  status: InvitationStatus
  config: InvitationConfig
  content: InvitationContent
  rsvpCount: number
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
}

// ─── Invitation Summary (list view) ─────────────────────

export interface InvitationSummary {
  id: string
  slug: string
  status: InvitationStatus
  groomName: string
  brideName: string
  receptionDate: string
  rsvpCount: number
  updatedAt: string
}

// ─── Public Invitation (halaman tamu) ───────────────────

export interface PublicInvitation {
  slug: string
  config: InvitationConfig
  content: InvitationContent
}

// ─── Create / Update Requests ───────────────────────────

export interface CreateInvitationRequest {
  slug: string
  config?: Partial<InvitationConfig>
  content: InvitationContent
}

export interface UpdateInvitationRequest {
  slug?: string
  status?: InvitationStatus
  config?: InvitationConfig          // Full object — backend replace whole config
  content?: InvitationContent        // Full object — backend replace whole content
}

// ─── Slug Check ─────────────────────────────────────────

export interface SlugCheckResult {
  available: boolean
  slug: string
}

// ─── RSVP ───────────────────────────────────────────────

export type RsvpStatus = "attending" | "not_attending" | "maybe"

export interface RsvpRequest {
  guestName: string
  status: RsvpStatus
  guestCount?: number
  message?: string | null
}

export interface Rsvp {
  id: string
  invitationId: string
  guestName: string
  status: RsvpStatus
  guestCount: number
  message?: string | null
  createdAt: string
}

export interface RsvpSummary {
  totalResponses: number
  attending: number
  notAttending: number
  maybe: number
  totalGuests: number
}

export interface RsvpListResponse {
  rsvps: Rsvp[]
  summary: RsvpSummary
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ─── Upload ─────────────────────────────────────────────

export type UploadCategory = "couple_photo" | "qris"
export type UploadFileType = "image/jpeg" | "image/png" | "image/webp"

export interface PresignRequest {
  filename: string
  contentType: UploadFileType
}

export interface PresignResult {
  uploadUrl: string
  publicUrl: string
}
