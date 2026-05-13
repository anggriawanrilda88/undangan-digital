"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface TemplateOption {
  id: string
  name: string
  description: string
  thumbnail: string       // URL preview image
  tags: string[]          // e.g. ["Elegan", "Modern", "Floral"]
  isPremium: boolean
}

// Data template yang tersedia di MVP (3 template)
export const AVAILABLE_TEMPLATES: TemplateOption[] = [
  {
    id: "elegant-garden",
    name: "Elegant Garden",
    description: "Elegan dan romantis dengan nuansa floral warm earth tones.",
    thumbnail: "/images/templates/elegant-garden-thumb.jpg",
    tags: ["Elegan", "Floral", "Romantis"],
    isPremium: false,
  },
  {
    id: "modern-serif",
    name: "Modern Serif",
    description: "Minimalis modern dengan tipografi serif yang sophisticated.",
    thumbnail: "/images/templates/modern-serif-thumb.jpg",
    tags: ["Modern", "Minimalis", "Serif"],
    isPremium: false,
  },
  {
    id: "royal-batik",
    name: "Royal Batik",
    description: "Sentuhan budaya Indonesia dengan motif batik yang elegan.",
    thumbnail: "/images/templates/royal-batik-thumb.jpg",
    tags: ["Tradisional", "Batik", "Indonesia"],
    isPremium: true,
  },
]

interface TemplatPickerProps {
  selectedId?: string
  onSelect: (templateId: string) => void
  onPreview?: (templateId: string) => void
}

export default function TemplatePicker({ selectedId, onSelect, onPreview }: TemplatPickerProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AVAILABLE_TEMPLATES.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onMouseEnter={() => setHovered(template.id)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200 group",
              selectedId === template.id
                ? "border-amber-500 shadow-lg shadow-amber-100"
                : "border-stone-200 hover:border-amber-300 hover:shadow-md"
            )}
            onClick={() => onSelect(template.id)}
          >
            {/* Thumbnail */}
            <div className="relative aspect-[3/4] bg-stone-100">
              <Image
                src={template.thumbnail}
                alt={template.name}
                fill
                className="object-cover"
                onError={(e) => {
                  // Fallback gradient kalau thumbnail belum ada
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                }}
              />
              {/* Fallback placeholder kalau image tidak ada */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-stone-200">
                <span className="text-4xl opacity-30">💍</span>
              </div>

              {/* Premium badge */}
              {template.isPremium && (
                <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  Premium
                </div>
              )}

              {/* Selected checkmark */}
              {selectedId === template.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 left-2 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow"
                >
                  <Check size={14} className="text-white" strokeWidth={3} />
                </motion.div>
              )}

              {/* Preview overlay on hover */}
              {hovered === template.id && onPreview && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center"
                  onClick={(e) => { e.stopPropagation(); onPreview(template.id) }}
                >
                  <button className="bg-white text-stone-800 font-medium text-sm px-4 py-2 rounded-xl shadow hover:bg-stone-50 transition-colors">
                    Preview →
                  </button>
                </motion.div>
              )}
            </div>

            {/* Info */}
            <div className="p-3 bg-white">
              <h3 className="font-semibold text-stone-800 text-sm">{template.name}</h3>
              <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{template.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {template.tags.map(tag => (
                  <span key={tag} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
