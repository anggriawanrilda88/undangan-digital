/**
 * API Client — wrapper untuk semua request ke Golang API (Reza)
 * Spec: docs/openapi-undangan-digital.yaml
 * Base URL: NEXT_PUBLIC_API_URL (default: http://localhost:8080/api/v1)
 *
 * Auth di-handle otomatis via authHeaders() dari lib/auth.ts (JWT cookie).
 */

import { authHeaders } from "./auth"
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
  ApiSuccess,
  ApiError,
} from "@/types/api"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1"

// ─── Error class ─────────────────────────────────────────

export class ApiException extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = "ApiException"
  }
}

// ─── Core fetch wrapper ──────────────────────────────────

/**
 * apiFetch — auto-attach JWT dari cookie session.
 * Pass `authenticated: false` untuk endpoint publik (tidak perlu auth).
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit & { authenticated?: boolean; multipart?: boolean } = {}
): Promise<T> {
  const { authenticated = true, multipart = false, ...fetchOptions } = options

  const authH = authenticated ? authHeaders() : {}

  // Untuk multipart/form-data: jangan set Content-Type manual,
  // biarkan browser set dengan boundary yang benar
  const headers: Record<string, string> = multipart
    ? { ...authH, ...(fetchOptions.headers as Record<string, string> ?? {}) }
    : {
        "Content-Type": "application/json",
        ...authH,
        ...(fetchOptions.headers as Record<string, string> ?? {}),
      }

  const res = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers })
  const json = (await res.json()) as ApiSuccess<T> | ApiError

  if (!res.ok || !json.success) {
    const err = (json as ApiError).error
    throw new ApiException(err?.code ?? "UNKNOWN", err?.message ?? `HTTP ${res.status}`)
  }

  return (json as ApiSuccess<T>).data
}

// ─── API Methods ─────────────────────────────────────────

export const api = {

  // ── Auth ──
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: UserProfile }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      authenticated: false,
    }),

  register: (email: string, password: string) =>
    apiFetch<{ token: string; user: UserProfile }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      authenticated: false,
    }),

  getMe: () =>
    apiFetch<UserProfile>("/auth/me"),

  // ── Invitations (authenticated) ──
  listInvitations: () =>
    apiFetch<InvitationSummary[]>("/invitations"),

  createInvitation: (payload: CreateInvitationRequest) =>
    apiFetch<Invitation>("/invitations", { method: "POST", body: JSON.stringify(payload) }),

  getInvitation: (id: string) =>
    apiFetch<Invitation>(`/invitations/${id}`),

  updateInvitation: (id: string, payload: UpdateInvitationRequest) =>
    apiFetch<Invitation>(`/invitations/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  deleteInvitation: (id: string) =>
    apiFetch<null>(`/invitations/${id}`, { method: "DELETE" }),

  // Debounce 400ms sebelum call! (slug validation)
  checkSlug: (slug: string) =>
    apiFetch<SlugCheckResult>(`/slugs/check?slug=${encodeURIComponent(slug)}`),

  // ── Public (no auth) ──
  getPublicInvitation: (slug: string) =>
    apiFetch<PublicInvitation>(`/i/${slug}`, { authenticated: false }),

  // ── RSVP ──
  submitRsvp: (invitationId: string, payload: RsvpRequest) =>
    apiFetch<Rsvp>(`/invitations/${invitationId}/rsvp`, {
      method: "POST",
      body: JSON.stringify(payload),
      authenticated: false,
    }),

  getRsvpList: (invitationId: string, params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set("status", params.status)
    if (params?.page) qs.set("page", String(params.page))
    if (params?.limit) qs.set("limit", String(params.limit))
    const query = qs.toString() ? `?${qs}` : ""
    return apiFetch<RsvpListResponse>(`/invitations/${invitationId}/rsvp${query}`)
  },

  // ── Image Upload ──
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return apiFetch<{ url: string }>("/upload/image", {
      method: "POST",
      body: formData,
      multipart: true,
    })
  },
}
