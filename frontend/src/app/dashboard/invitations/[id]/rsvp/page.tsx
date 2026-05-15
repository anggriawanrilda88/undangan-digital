"use client"

import { use, useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Loader2, AlertCircle, Users, UserCheck, UserX, HelpCircle,
  ChevronLeft, Download, RefreshCw, ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import type { Rsvp, RsvpSummary, RsvpStatus } from "@/types/api"
import { cn } from "@/lib/utils"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function RsvpManagementPage({ params }: PageProps) {
  const { id } = use(params)

  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [summary, setSummary] = useState<RsvpSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<RsvpStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const LIMIT = 20

  const fetchRsvps = useCallback(async (statusFilter: RsvpStatus | "all", currentPage: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.getRsvpList(id, {
        status: statusFilter === "all" ? undefined : statusFilter,
        page: currentPage,
        limit: LIMIT,
      })
      setRsvps(result.rsvps)
      setSummary(result.summary)
      setTotalPages(result.pagination.totalPages)
      setTotal(result.pagination.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data RSVP")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRsvps(filterStatus, page)
  }, [fetchRsvps, filterStatus, page])

  const handleFilterChange = (status: RsvpStatus | "all") => {
    setFilterStatus(status)
    setPage(1)
  }

  // Export CSV
  const handleExportCSV = () => {
    if (!rsvps.length) return
    const headers = ["Nama", "Status", "Jumlah Tamu", "Ucapan", "Tanggal RSVP"]
    const statusLabel: Record<RsvpStatus, string> = {
      attending: "Hadir",
      not_attending: "Tidak Hadir",
      maybe: "Mungkin Hadir",
    }
    const rows = rsvps.map(r => [
      `"${r.guestName.replace(/"/g, '""')}"`,
      statusLabel[r.status],
      r.guestCount,
      `"${(r.message ?? "").replace(/"/g, '""')}"`,
      new Date(r.createdAt).toLocaleDateString("id-ID"),
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rsvp-${id}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200 px-4 h-14 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ChevronLeft size={14} />
            Dashboard
          </Link>
          <span className="text-stone-300">/</span>
          <h1 className="font-semibold text-stone-800 text-sm">Data RSVP</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchRsvps(filterStatus, page)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!rsvps.length}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Summary Cards */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            <SummaryCard
              icon={<Users size={20} className="text-stone-500" />}
              label="Total Tamu"
              value={summary.totalGuests}
              bg="bg-stone-100"
            />
            <SummaryCard
              icon={<UserCheck size={20} className="text-green-600" />}
              label="Hadir"
              value={summary.attending}
              bg="bg-green-50"
            />
            <SummaryCard
              icon={<UserX size={20} className="text-red-500" />}
              label="Tidak Hadir"
              value={summary.notAttending}
              bg="bg-red-50"
            />
            <SummaryCard
              icon={<HelpCircle size={20} className="text-amber-500" />}
              label="Mungkin"
              value={summary.maybe}
              bg="bg-amber-50"
            />
          </motion.div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "attending", "not_attending", "maybe"] as const).map(status => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors",
                filterStatus === status
                  ? "bg-amber-600 text-white"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              )}
            >
              {status === "all" && "Semua"}
              {status === "attending" && "✅ Hadir"}
              {status === "not_attending" && "❌ Tidak Hadir"}
              {status === "maybe" && "🤔 Mungkin"}
            </button>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && !error && (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-amber-500" />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && rsvps.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <div className="text-4xl">📭</div>
            <p className="text-sm font-medium text-stone-700">Belum ada RSVP</p>
            <p className="text-xs text-stone-500">
              {filterStatus === "all"
                ? "Belum ada tamu yang konfirmasi kehadiran"
                : "Tidak ada tamu dengan status ini"}
            </p>
          </div>
        )}

        {/* RSVP List */}
        {!loading && !error && rsvps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <p className="text-xs text-stone-400 font-medium">
              {filterStatus === "all" ? `${total} total respons` : `${total} tamu`}
              {totalPages > 1 && ` · Halaman ${page} dari ${totalPages}`}
            </p>
            {rsvps.map((rsvp, i) => (
              <motion.div
                key={rsvp.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-xl border border-stone-100 px-4 py-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-stone-800 text-sm">{rsvp.guestName}</p>
                      <StatusBadge status={rsvp.status} />
                      {rsvp.status === "attending" && rsvp.guestCount > 1 && (
                        <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                          {rsvp.guestCount} orang
                        </span>
                      )}
                    </div>
                    {rsvp.message && (
                      <p className="text-xs text-stone-500 mt-1 italic">&ldquo;{rsvp.message}&rdquo;</p>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 shrink-0">
                    {new Date(rsvp.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-stone-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </main>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────

function SummaryCard({
  icon, label, value, bg,
}: {
  icon: React.ReactNode
  label: string
  value: number
  bg: string
}) {
  return (
    <div className={cn("rounded-2xl p-4 space-y-2 shadow-sm border border-white/50", bg)}>
      <div className="flex items-center justify-between">
        {icon}
      </div>
      <p className="text-2xl font-bold text-stone-800">{value}</p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: RsvpStatus }) {
  const configs: Record<RsvpStatus, { label: string; className: string }> = {
    attending: { label: "Hadir", className: "bg-green-100 text-green-700" },
    not_attending: { label: "Tidak Hadir", className: "bg-red-100 text-red-600" },
    maybe: { label: "Mungkin", className: "bg-amber-100 text-amber-700" },
  }
  const cfg = configs[status]
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", cfg.className)}>
      {cfg.label}
    </span>
  )
}
