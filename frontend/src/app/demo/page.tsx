"use client"

import { useState } from "react"
import EditorShell from "@/components/editor/EditorShell"
import TemplateElegantGarden from "@/components/templates/TemplateElegantGarden"
import { TEMPLATE_PREVIEW_DATA } from "@/types/template"
import type { TemplateProps } from "@/types/template"

export default function DemoPage() {
  const [data, setData] = useState<TemplateProps>(TEMPLATE_PREVIEW_DATA)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const handleSave = async () => {
    setSaveStatus("saving")
    await new Promise(r => setTimeout(r, 800)) // Simulasi API call
    setSaveStatus("saved")
    setTimeout(() => setSaveStatus("idle"), 3000)
  }

  return (
    <EditorShell
      TemplateComponent={TemplateElegantGarden}
      data={data}
      saveStatus={saveStatus}
      onUpdate={fn => setData(prev => fn(prev))}
      onSave={handleSave}
    />
  )
}
