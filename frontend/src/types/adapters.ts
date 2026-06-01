/**
 * Adapter: API types (Reza) ↔ TemplateProps (FE)
 *
 * API menyimpan data dalam struktur flat `content` + `config`.
 * TemplateProps pakai struktur nested yang lebih ergonomis untuk template components.
 * Adapter ini handle konversi dua arah.
 */

import type { Invitation, PublicInvitation, InvitationContent, InvitationConfig, UpdateInvitationRequest } from "./api"
import type { TemplateProps, BankAccount, GalleryPhoto, StoryScene } from "./template"

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
      groomRole: content.groomRole,
      groomParents: content.groomParents,
      brideName: extractFirstName(content.brideName),
      brideFullName: content.brideName,
      brideRole: content.brideRole,
      brideParents: content.brideParents,
    },

    photo: {
      couple: config.couplePhoto,
      groom: config.groomPhoto,
      bride: config.bridePhoto,
      proposal: config.proposalPhoto,
      illustration: config.illustrationImage,
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
        accountHolder: acc.accountName,
      } satisfies BankAccount)),
      qrisImageUrl: content.digitalEnvelope.qrisImageUrl ?? undefined,
    } : undefined,

    gallery: config.gallery?.length ? {
      photos: config.gallery.map(g => ({
        url: g.url,
        caption: g.caption,
      } satisfies GalleryPhoto)),
    } : undefined,

    story: config.story?.length ? {
      scenes: config.story.map(s => ({
        illustrationUrl: s.illustrationUrl,
        caption: s.caption,
      } satisfies StoryScene)),
    } : undefined,

    verse: config.verse ? {
      arabic: config.verse.arabic,
      translation: config.verse.translation,
      source: config.verse.source,
    } : undefined,

    proposal: config.proposal ? {
      quote: config.proposal.quote,
      reply: config.proposal.reply,
    } : undefined,

    opening: config.opening ? {
      showLoadingScreen: config.opening.showLoadingScreen,
      loadingNames: config.opening.loadingNames,
      loadingDate: config.opening.loadingDate,
      bowColor: config.opening.bowColor,
    } : undefined,

    music: config.music ? {
      enabled: config.music.enabled,
      url: config.music.url ?? undefined,
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
    groomPhoto: props.photo.groom,
    bridePhoto: props.photo.bride,
    proposalPhoto: props.photo.proposal,
    illustrationImage: props.photo.illustration,
    colors: {
      primary: props.colors.primary,
      secondary: props.colors.secondary,
    },
    fonts: undefined,
    gallery: props.gallery?.photos?.map(p => ({ url: p.url, caption: p.caption })),
    story: props.story?.scenes?.map(s => ({ illustrationUrl: s.illustrationUrl, caption: s.caption })),
    verse: props.verse ? {
      arabic: props.verse.arabic,
      translation: props.verse.translation,
      source: props.verse.source,
    } : undefined,
    opening: props.opening ? {
      showLoadingScreen: props.opening.showLoadingScreen,
      loadingNames: props.opening.loadingNames,
      loadingDate: props.opening.loadingDate,
      bowColor: props.opening.bowColor,
    } : undefined,
    proposal: props.proposal ? {
      quote: props.proposal.quote,
      reply: props.proposal.reply,
    } : undefined,
    music: props.music ? {
      enabled: props.music.enabled,
      url: props.music.url ?? null,
    } : { enabled: false },
  }

  // Full InvitationContent — semua field wajib ada, null untuk yang tidak diisi
  const content: InvitationContent = {
    groomName: props.couple.groomFullName ?? props.couple.groomName,
    brideName: props.couple.brideFullName ?? props.couple.brideName,
    groomRole: props.couple.groomRole,
    brideRole: props.couple.brideRole,
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
