/**
 * MSW Mock Handlers — synced dengan OpenAPI spec Reza v1.0
 * Base: /v1 (sesuai servers[1] di spec: http://localhost:8080/v1)
 */

import { http, HttpResponse, delay } from "msw"
import type { Invitation, InvitationSummary, PublicInvitation, Rsvp, RsvpListResponse } from "@/types/api"

const BASE = "/api/v1"

// ─── Mock Data ───────────────────────────────────────────

const mockUser = {
  id: "user-abc123",
  email: "reza@example.com",
  createdAt: "2025-05-01T08:00:00Z",
}

const mockInvitation: Invitation = {
  id: "inv-001",
  userId: "user-abc123",
  slug: "reza-anisa-2025",
  status: "draft",
  config: {
    templateId: "elegant-garden",
    colors: { primary: "#B5936E", secondary: "#F5ECD7" },
    couplePhoto: "/images/preview/couple-placeholder.jpg",
    music: { enabled: false },
  },
  content: {
    groomName: "Reza Mahendra",
    brideName: "Anisa Putri",
    groomParents: "Putra dari Bpk. Hendra & Ibu Sari",
    brideParents: "Putri dari Bpk. Wahyu & Ibu Dewi",
    akadDate: "2025-09-20T08:00:00Z",
    receptionDate: "2025-09-20T11:00:00Z",
    akadVenue: {
      name: "Masjid Al-Ikhlas",
      address: "Jl. Sudirman No. 12, Jakarta Pusat",
      mapsUrl: "https://maps.google.com",
    },
    venue: {
      name: "Ballroom Hotel Mulia",
      address: "Jl. Asia Afrika No. 8, Jakarta Selatan",
      mapsUrl: "https://maps.google.com",
    },
    digitalEnvelope: {
      bankAccounts: [
        { bankName: "BCA", accountNumber: "1234567890", accountName: "Reza Mahendra" },
        { bankName: "Mandiri", accountNumber: "0987654321", accountName: "Reza Mahendra" },
      ],
      qrisImageUrl: null,
    },
    openingMessage: "Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir.",
  },
  rsvpCount: 3,
  createdAt: "2025-05-01T08:00:00Z",
  updatedAt: "2025-05-10T12:00:00Z",
  publishedAt: null,
}

const mockRsvps: Rsvp[] = [
  { id: "rsvp-1", invitationId: "inv-001", guestName: "Budi Santoso", status: "attending", guestCount: 2, message: "Selamat ya!", createdAt: "2025-05-11T09:00:00Z" },
  { id: "rsvp-2", invitationId: "inv-001", guestName: "Siti Nurhaliza", status: "attending", guestCount: 1, message: null, createdAt: "2025-05-12T10:30:00Z" },
  { id: "rsvp-3", invitationId: "inv-001", guestName: "Ahmad Fauzi", status: "not_attending", guestCount: 0, message: "Maaf tidak bisa hadir", createdAt: "2025-05-12T14:00:00Z" },
]

const takenSlugs = ["reza-anisa-2025", "budi-sari", "ahmad-rina"]

// ─── Handlers ────────────────────────────────────────────

export const handlers = [

  // ── AUTH ──
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    await delay(200)
    const body = await request.json() as { email: string; password: string }
    if (body.password.length < 8) {
      return HttpResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "Email atau password salah." } },
        { status: 401 }
      )
    }
    return HttpResponse.json({
      success: true,
      data: { token: "mock-jwt-token-12345", user: { ...mockUser, email: body.email } },
    })
  }),

  http.post(`${BASE}/auth/register`, async ({ request }) => {
    await delay(300)
    const body = await request.json() as { email: string; password: string; name: string }
    return HttpResponse.json({
      success: true,
      data: {
        token: "mock-jwt-token-new-user",
        user: { id: `user-${Date.now()}`, email: body.email, name: body.name, createdAt: new Date().toISOString() },
      },
    }, { status: 201 })
  }),

  http.get(`${BASE}/auth/me`, async () => {
    await delay(150)
    return HttpResponse.json({ success: true, data: mockUser })
  }),

  // ── INVITATIONS ──

  http.get(`${BASE}/invitations`, async () => {
    await delay(200)
    const summary: InvitationSummary = {
      id: mockInvitation.id,
      slug: mockInvitation.slug,
      status: mockInvitation.status,
      groomName: mockInvitation.content.groomName,
      brideName: mockInvitation.content.brideName,
      receptionDate: mockInvitation.content.receptionDate,
      rsvpCount: mockInvitation.rsvpCount,
      updatedAt: mockInvitation.updatedAt,
    }
    return HttpResponse.json({ success: true, data: [summary] })
  }),

  http.post(`${BASE}/invitations`, async ({ request }) => {
    await delay(300)
    const body = await request.json() as Partial<Invitation>
    const created: Invitation = {
      ...mockInvitation,
      ...body,
      id: `inv-${Date.now()}`,
      status: "draft",
      rsvpCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({ success: true, data: created }, { status: 201 })
  }),

  // slug check — standalone endpoint (bukan nested di /invitations)
  http.get(`${BASE}/slugs/check`, async ({ request }) => {
    await delay(150)
    const url = new URL(request.url)
    const slug = url.searchParams.get("slug") ?? ""
    const available = !takenSlugs.includes(slug)
    return HttpResponse.json({ success: true, data: { available, slug } })
  }),

  http.get(`${BASE}/invitations/:id`, async ({ params }) => {
    await delay(200)
    if (params.id !== mockInvitation.id) {
      return HttpResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Undangan tidak ditemukan" } },
        { status: 404 }
      )
    }
    return HttpResponse.json({ success: true, data: mockInvitation })
  }),

  http.put(`${BASE}/invitations/:id`, async ({ request }) => {
    await delay(300)
    const body = await request.json() as Partial<Invitation>
    const updated: Invitation = {
      ...mockInvitation,
      ...body,
      config: { ...mockInvitation.config, ...(body.config ?? {}) },
      content: { ...mockInvitation.content, ...(body.content ?? {}) },
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({ success: true, data: updated })
  }),

  http.delete(`${BASE}/invitations/:id`, async () => {
    await delay(200)
    return HttpResponse.json({ success: true, data: null })
  }),

  // ── PUBLIC ──

  http.get(`${BASE}/i/:slug`, async ({ params }) => {
    await delay(150)
    if (params.slug !== mockInvitation.slug) {
      return HttpResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Undangan tidak ditemukan" } },
        { status: 404 }
      )
    }
    const pub: PublicInvitation = {
      slug: mockInvitation.slug,
      config: mockInvitation.config,
      content: mockInvitation.content,
    }
    return HttpResponse.json({ success: true, data: pub })
  }),

  // ── RSVP ──

  http.post(`${BASE}/invitations/:id/rsvp`, async ({ params, request }) => {
    await delay(300)
    const body = await request.json() as { guestName: string; status: string; guestCount?: number; message?: string }
    const rsvp: Rsvp = {
      id: `rsvp-${Date.now()}`,
      invitationId: params.id as string,
      guestName: body.guestName,
      status: body.status as Rsvp["status"],
      guestCount: body.guestCount ?? 1,
      message: body.message ?? null,
      createdAt: new Date().toISOString(),
    }
    return HttpResponse.json({ success: true, data: rsvp }, { status: 201 })
  }),

  http.get(`${BASE}/invitations/:id/rsvp`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const statusFilter = url.searchParams.get("status")
    const filtered = statusFilter ? mockRsvps.filter(r => r.status === statusFilter) : mockRsvps

    const response: RsvpListResponse = {
      rsvps: filtered,
      summary: {
        totalResponses: mockRsvps.length,
        attending: mockRsvps.filter(r => r.status === "attending").length,
        notAttending: mockRsvps.filter(r => r.status === "not_attending").length,
        maybe: mockRsvps.filter(r => r.status === "maybe").length,
        totalGuests: mockRsvps.filter(r => r.status === "attending").reduce((s, r) => s + r.guestCount, 0),
      },
      pagination: { page: 1, limit: 50, total: filtered.length, totalPages: 1 },
    }
    return HttpResponse.json({ success: true, data: response })
  }),

  // ── UPLOAD ──

  http.post(`${BASE}/upload/image`, async () => {
    await delay(400)
    return HttpResponse.json({
      success: true,
      data: {
        url: "https://minio.anggriawan.my.id/undangan-uploads/mock-uuid.webp",
      },
    })
  }),
]
