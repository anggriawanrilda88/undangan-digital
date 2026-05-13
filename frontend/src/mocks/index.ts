// Instrument MSW hanya di development environment
// Dipanggil di layout.tsx atau di komponen root

export async function initMSW() {
  if (typeof window === "undefined") return
  if (process.env.NODE_ENV !== "development") return

  const { worker } = await import("./browser")
  await worker.start({
    onUnhandledRequest: "bypass", // Jangan error untuk request lain (next-internal, dll)
  })
}
