"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { api } from "@/lib/api"
import { invitationToTemplateProps, templatePropsToUpdateRequest } from "@/types/adapters"
import type { TemplateProps } from "@/types/template"

type SaveStatus = "idle" | "saving" | "saved" | "error"

interface UseInvitationEditorReturn {
  data: TemplateProps | null
  loading: boolean
  saveStatus: SaveStatus
  error: string | null
  updateData: (updater: (prev: TemplateProps) => TemplateProps) => void
  save: () => Promise<void>
}

export function useInvitationEditor(invitationId: string): UseInvitationEditorReturn {
  const [data, setData] = useState<TemplateProps | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
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
      console.error("Save failed:", err)
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

  return { data, loading, saveStatus, error, updateData, save }
}
