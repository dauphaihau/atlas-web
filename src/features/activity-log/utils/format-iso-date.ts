export function formatIsoDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  try {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString()
  } catch {
    return iso
  }
}
