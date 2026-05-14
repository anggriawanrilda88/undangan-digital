import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { api } from "@/lib/api"
import { invitationToTemplateProps } from "@/types/adapters"
import PublicInvitationPage from "./PublicInvitationPage"

// Force dynamic — halaman ini SSR per-request, tidak di-static generate
// Karena: (1) data berubah, (2) build time tidak punya env Supabase
export const dynamic = "force-dynamic"
interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * SSR metadata untuk Open Graph (WhatsApp preview, Twitter card, dll)
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const inv = await api.getPublicInvitation(slug)
    const { groomName, brideName, receptionDate } = inv.content
    const date = new Date(receptionDate).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    })
    return {
      title: `Undangan Pernikahan ${groomName} & ${brideName}`,
      description: `${groomName} & ${brideName} mengundang kehadiranmu — ${date}`,
      openGraph: {
        title: `${groomName} & ${brideName} 💍`,
        description: `Kami mengundang kehadiranmu — ${date}`,
        images: inv.config.couplePhoto ? [{ url: inv.config.couplePhoto }] : [],
        type: "website",
      },
    }
  } catch {
    return { title: "Undangan Digital" }
  }
}

/**
 * Halaman publik undangan — SSR + hydrate ke client untuk RSVP interactivity.
 * Hanya tampil kalau status = "published".
 */
export default async function InvitationSlugPage({ params }: PageProps) {
  const { slug } = await params

  let templateProps
  try {
    const inv = await api.getPublicInvitation(slug)
    templateProps = invitationToTemplateProps(inv)
  } catch {
    notFound()
  }

  return <PublicInvitationPage templateProps={templateProps} />
}
