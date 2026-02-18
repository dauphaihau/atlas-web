"use client"

import { Button } from "@/shared/ui/button"
import { useExportUsersMutation } from "@/shared/queries/user"
import { Download } from "lucide-react"

type ApiError = { message?: string; body?: { message?: string | string[] } }

function getExportErrorMessage(err: ApiError | undefined): string | null {
  if (!err) return null
  const bodyMsg = Array.isArray(err.body?.message)
    ? err.body.message.join(", ")
    : err.body?.message
  return err.message ?? bodyMsg ?? null
}

export function ExportUsersButton() {
  const exportUsers = useExportUsersMutation()
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => exportUsers.mutate()}
      disabled={exportUsers.isPending}
    >
      <Download className="size-4" />
      {exportUsers.isPending ? "Exporting…" : "Export CSV"}
    </Button>
  )
}

/** Renders export error message when present. Place below the actions row. */
export function ExportUsersError() {
  const exportUsers = useExportUsersMutation()
  const exportError = getExportErrorMessage(
    exportUsers.error as ApiError | undefined
  )
  if (exportError == null || exportError === "") return null
  return (
    <p className="shrink-0 text-destructive text-sm" role="alert">
      {exportError}
    </p>
  )
}
