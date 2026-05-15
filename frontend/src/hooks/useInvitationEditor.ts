"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { api } from "@/lib/api"
import { invitationToTemplateProps, templatePropsToUpdateRequest } from "@/types/adapters"
import type { TemplateProps } from "@/types/template"
import type { InvitationStatus } from "@/types/api"

type SaveStatus = "idle" | "saving" | "saved" | "error"
type PublishStatus = "idle" | "publishing" | "done" | "error"

interface UseInvitationEditorReturn {
  data: TemplateProps | null
  loading: boolean
  saveStatus: SaveStatus
  publishStatus: PublishStatus
  invitationStatus: InvitationStatus
  error: string | null
  updateData: (updater: (prev: TemplateProps) => TemplateProps) => void
  save: () => Promise<void>
  publish: () => Promise<void>
  unpublish: () => Promise<void>
}

export function useInvitationEditor(invitationId: string): UseInvitationEditorReturn {
  const [data, setData] = useState<TemplateProps | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle")
  const [invitationStatus, setInvitationStatus] = useState<InvitationStatus>("draft")
  const [error, setError] = useState<string | null>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestData = useRef<TemplateProps | null>(null)

  // Load invitation data
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    api.getInvitation(invitationId)
      .then(inv => {
        if (cancelled) return
        const props = invitationToTemplateProps(inv)
        setData(props)
        latestData.current = props
        setInvitationStatus(inv.status)
      })
      .catch(err => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Gagal memuat undangan")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [invitationId])

  // Save ke API
  const save = useCallback(async () => {
    const current = latestData.current
    if (!current) return

    setSaveStatus("saving")
    try {
      const payload = templatePropsToUpdateRequest(current)
      await api.updateInvitation(invitationId, payload)
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (err) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 5000)
      throw err // re-throw supaya EditorShell bisa show toast
    }
  }, [invitationId])

  // Publish undangan
  const publish = useCallback(async () => {
    setPublishStatus("publishing")
    try {
      await api.updateInvitation(invitationId, { status: "published" })
      setInvitationStatus("published")
      setPublishStatus("done")
      setTimeout(() => setPublishStatus("idle"), 3000)
    } catch (err) {
      setPublishStatus("error")
      setTimeout(() => setPublishStatus("idle"), 5000)
      throw err
    }
  }, [invitationId])

  // Unpublish (kembali ke draft)
  const unpublish = useCallback(async () => {
    setPublishStatus("publishing")
    try {
      await api.updateInvitation(invitationId, { status: "draft" })
      setInvitationStatus("draft")
      setPublishStatus("done")
      setTimeout(() => setPublishStatus("idle"), 2000)
    } catch (err) {
      setPublishStatus("error")
      setTimeout(() => setPublishStatus("idle"), 5000)
      throw err
    }
  }, [invitationId])

  // Update data + trigger auto-save debounce 30 detik (US-03 AC)
  const updateData = useCallback((updater: (prev: TemplateProps) => TemplateProps) => {
    setData(prev => {
      if (!prev) return prev
      const next = updater(prev)
      latestData.current = next

      // Reset auto-save timer
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(() => {
        save()
      }, 30_000)

      return next
    })
  }, [save])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [])

  return { data, loading, saveStatus, publishStatus, invitationStatus, error, updateData, save, publish, unpublish }
}
