"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import imageCompression from "browser-image-compression"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  /** URL gambar saat ini */
  value?: string
  /** Callback dengan URL publik setelah upload sukses */
  onChange: (url: string | undefined) => void
  /** Aspect ratio untuk preview, e.g. "aspect-square" atau "aspect-[3/4]" */
  aspectClass?: string
  /** Label */
  label?: string
  /** Disabled state */
  disabled?: boolean
}

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,          // Maks 800KB setelah kompresi
  maxWidthOrHeight: 1920,  // Maks 1920px
  useWebWorker: true,
  fileType: "image/webp",  // Convert ke WebP untuk efisiensi
}

export default function ImageUpload({
  value,
  onChange,
  aspectClass = "aspect-[4/3]",
  label = "Upload Foto",
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WebP)")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10MB")
      return
    }

    setError(null)
    setUploading(true)
    setProgress(10)

    try {
      // 1. Kompres di client-side sebelum upload
      setProgress(20)
      const compressed = await imageCompression(file, COMPRESSION_OPTIONS)
      setProgress(50)

      // 2. Upload ke BE → BE yang kirim ke MinIO
      setProgress(70)
      const url = await api.uploadImage(
        new File([compressed], file.name, { type: "image/webp" })
      )
      setProgress(100)

      onChange(url)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload gagal"
      if (msg.includes("401") || msg.includes("unauthorized")) {
        setError("Sesi kamu habis. Silakan login ulang.")
      } else {
        setError(msg)
      }
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input supaya file yang sama bisa dipilih lagi
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    onChange(undefined)
    setError(null)
  }

  return (
    <div className="space-y-1.5">
      {label && <p className="text-xs font-medium text-stone-500">{label}</p>}

      <div
        className={cn(
          "relative w-full rounded-xl overflow-hidden border-2 border-dashed transition-colors",
          aspectClass,
          value ? "border-stone-200" : "border-stone-300 hover:border-amber-400",
          disabled && "opacity-50 pointer-events-none",
          !value && !uploading && "cursor-pointer bg-stone-50 hover:bg-amber-50/40"
        )}
        onClick={() => !value && !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        {value ? (
          <>
            {/* Preview */}
            <Image src={value} alt="Uploaded" fill className="object-cover" />
            {/* Remove button */}
            <button
              onClick={e => { e.stopPropagation(); handleRemove() }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
            {/* Replace overlay */}
            <button
              onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
              className="absolute inset-x-0 bottom-0 bg-black/40 hover:bg-black/60 text-white text-xs py-2 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload size={12} /> Ganti foto
            </button>
          </>
        ) : uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-amber-50/60">
            <Loader2 size={22} className="animate-spin text-amber-500" />
            <p className="text-xs text-stone-500">Mengupload... {progress}%</p>
            {/* Progress bar */}
            <div className="w-24 h-1 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-400">
            <ImageIcon size={28} strokeWidth={1.5} />
            <div className="text-center">
              <p className="text-xs font-medium text-stone-500">Klik atau drag foto ke sini</p>
              <p className="text-xs text-stone-400 mt-0.5">JPG, PNG, WebP · Maks 10MB</p>
              <p className="text-xs text-stone-400">Otomatis dikompresi sebelum upload</p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled || uploading}
      />
    </div>
  )
}
