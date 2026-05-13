/**
 * Adapter: API types (Reza) ↔ TemplateProps (FE)
 *
 * API menyimpan data dalam struktur flat `content` + `config`.
 * TemplateProps pakai struktur nested yang lebih ergonomis untuk template components.
 * Adapter ini handle konversi dua arah.
 */

import type { Invitation, PublicInvitation, InvitationContent, InvitationConfig, UpdateInvitationRequest } from "./api"
import type { TemplateProps, BankAccount } from "./template"

// ─── API → TemplateProps ─────────────────────────────────

/**
 * Konversi Invitation (API) ke TemplateProps (untuk template components).
 * Dipakai di: halaman editor, halaman undangan publik.
 */
export function invitationToTemplateProps(invitation: Invitation | PublicInvitation): TemplateProps {
  const { content, config, slug } = invitation

  return {
    couple: {
      groomName: extractFirstName(content.groomName),
      groomFullName: content.groomName,
      groomParents: content.groomParents,
      brideName: extractFirstName(content.brideName),
      brideFullName: content.brideName,
      brideParents: content.brideParents,
    },

    photo: {
      couple: config.couplePhoto,
    },

    events: {
      ...(content.akadDate ? {
        akad: {
          date: extractDate(content.akadDate),
          time: extractTime(content.akadDate),
          venue: content.akadVenue?.name ?? "",
          address: content.akadVenue?.address ?? "",
          mapsUrl: content.akadVenue?.mapsUrl ?? undefined,
        },
      } : {}),
      reception: {
        date: extractDate(content.receptionDate),
        time: extractTime(content.receptionDate),
        venue: content.venue.name,
        address: content.venue.address,
        mapsUrl: content.venue.mapsUrl ?? undefined,
      },
    },

    digitalGifts: content.digitalEnvelope ? {
      bankAccounts: content.digitalEnvelope.bankAccounts?.map(acc => ({
        bankName: acc.bankName,
        accountNumber: acc.accountNumber,
        accountHolder: acc.accountName,  // API: accountName → FE: accountHolder
      } satisfies BankAccount)),
      qrisImageUrl: content.digitalEnvelope.qrisImageUrl ?? undefined,
    } : undefined,

    colors: {
      primary: config.colors.primary,
      secondary: config.colors.secondary,
    },

    meta: {
      templateId: config.templateId,
      slug,
      isPublic: "status" in invitation ? invitation.status === "published" : true,
      greeting: content.openingMessage,
    },
  }
}

// ─── TemplateProps → API UpdateRequest ──────────────────

/**
 * Konversi TemplateProps (form editor) ke UpdateInvitationRequest (API).
 * Dipakai di: auto-save dan manual save di EditorShell.
 *
 * ⚠️  PENTING: Backend replace seluruh `content` atau `config` object sekaligus
 * (bukan field-level partial). Wajib kirim full object — jangan kirim sebagian field.
 */
export function templatePropsToUpdateRequest(props: TemplateProps): UpdateInvitationRequest {
  // Full InvitationConfig — semua field wajib ada
  const config: InvitationConfig = {
    templateId: props.meta.templateId,
    couplePhoto: props.photo.couple,
    colors: {
      primary: props.colors.primary,
      secondary: props.colors.secondary,
    },
    fonts: undefined,
    music: { enabled: false },
  }

  // Full InvitationContent — semua field wajib ada, null untuk yang tidak diisi
  const content: InvitationContent = {
    groomName: props.couple.groomFullName ?? props.couple.groomName,
    brideName: props.couple.brideFullName ?? props.couple.brideName,
    groomParents: props.couple.groomParents,
    brideParents: props.couple.brideParents,
    openingMessage: props.meta.greeting,

    receptionDate: combineDatetime(props.events.reception.date, props.events.reception.time),
    venue: {
      name: props.events.reception.venue,
      address: props.events.reception.address,
      mapsUrl: props.events.reception.mapsUrl,
    },

    akadDate: props.events.akad
      ? combineDatetime(props.events.akad.date, props.events.akad.time)
      : null,
    akadVenue: props.events.akad
      ? { name: props.events.akad.venue, address: props.events.akad.address, mapsUrl: props.events.akad.mapsUrl }
      : null,

    digitalEnvelope: props.digitalGifts
      ? {
          bankAccounts: props.digitalGifts.bankAccounts?.map(acc => ({
            bankName: acc.bankName,
            accountNumber: acc.accountNumber,
            accountName: acc.accountHolder,  // FE: accountHolder → API: accountName
          })),
          qrisImageUrl: props.digitalGifts.qrisImageUrl ?? null,
        }
      : null,
  }

  return {
    slug: props.meta.slug,
    config,
    content,
  }
}

// ─── Helpers ─────────────────────────────────────────────

/** "Reza Mahendra" → "Reza" */
function extractFirstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName
}

/** "2025-09-20T08:00:00Z" → "2025-09-20" */
function extractDate(datetime: string): string {
  return datetime.split("T")[0] ?? datetime
}

/** "2025-09-20T08:00:00Z" → "08:00" */
function extractTime(datetime: string): string {
  const timePart = datetime.split("T")[1] ?? "00:00:00Z"
  return timePart.substring(0, 5)
}

/** "2025-09-20" + "08:00" → "2025-09-20T08:00:00Z" */
function combineDatetime(date: string, time: string): string {
  return `${date}T${time}:00Z`
}
