import Link from "next/link"

export default function InvitationNotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-xs">
        <div className="text-5xl">💍</div>
        <h1 className="text-xl font-semibold text-stone-800">Undangan tidak ditemukan</h1>
        <p className="text-sm text-stone-500">
          Link undangan ini tidak valid atau belum dipublikasikan.
        </p>
        <Link
          href="/"
          className="inline-block mt-2 text-sm text-amber-600 hover:underline"
        >
          Buat undangan digital kamu sendiri →
        </Link>
      </div>
    </div>
  )
}
