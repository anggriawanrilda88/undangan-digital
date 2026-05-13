/**
 * API Client — wrapper untuk semua request ke Golang API (Reza)
 * Spec: docs/openapi-undangan-digital.yaml
 * Base URL: NEXT_PUBLIC_API_URL (default: http://localhost:8080/v1)
 */

import type {
  UserProfile,
  Invitation,
  InvitationSummary,
  PublicInvitation,
  CreateInvitationRequest,
  UpdateInvitationRequest,
  SlugCheckResult,
  RsvpRequest,
  Rsvp,
  RsvpListResponse,
  PresignRequest,
  PresignResult,
  ApiSuccess,
  ApiError,
} from "@/types/api"

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1")

// ─── Core fetch wrapper ──────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const json = (await res.json()) as ApiSuccess<T> | ApiError

  if (!res.ok || !json.success) {
    const err = (json as ApiError).error
    const error = new ApiException(err?.code ?? "UNKNOWN", err?.message ?? `HTTP ${res.status}`)
    throw error
  }

  return (json as ApiSuccess<T>).data
}

export class ApiException extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = "ApiException"
  }
}

// ─── API Methods ─────────────────────────────────────────

export const api = {

  // ── Auth ──
  getMe: (token: string) =>
    apiFetch<UserProfile>("/auth/me", {}, token),

  // ── Invitations (authenticated) ──
  listInvitations: (token: string) =>
    apiFetch<InvitationSummary[]>("/invitations", {}, token),

  createInvitation: (payload: CreateInvitationRequest, token: string) =>
    apiFetch<Invitation>("/invitations", { method: "POST", body: JSON.stringify(payload) }, token),

  getInvitation: (id: string, token: string) =>
    apiFetch<Invitation>(`/invitations/${id}`, {}, token),

  updateInvitation: (id: string, payload: UpdateInvitationRequest, token: string) =>
    apiFetch<Invitation>(`/invitations/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token),

  deleteInvitation: (id: string, token: string) =>
    apiFetch<null>(`/invitations/${id}`, { method: "DELETE" }, token),

  checkSlug: (slug: string, token: string) =>
    apiFetch<SlugCheckResult>(`/slugs/check?slug=${encodeURIComponent(slug)}`, {}, token),

  // ── Public ──
  getPublicInvitation: (slug: string) =>
    apiFetch<PublicInvitation>(`/i/${slug}`),

  // ── RSVP ──
  submitRsvp: (invitationId: string, payload: RsvpRequest) =>
    apiFetch<Rsvp>(`/invitations/${invitationId}/rsvp`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getRsvpList: (invitationId: string, token: string, params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set("status", params.status)
    if (params?.page) qs.set("page", String(params.page))
    if (params?.limit) qs.set("limit", String(params.limit))
    return apiFetch<RsvpListResponse>(`/invitations/${invitationId}/rsvp?${qs}`, {}, token)
  },

  // ── Upload ──
  presignUpload: (payload: PresignRequest, token: string) =>
    apiFetch<PresignResult>("/upload/presign", { method: "POST", body: JSON.stringify(payload) }, token),
}
