import { Button } from "@/shared/ui/button"
import { useExportUsersMutation } from "@/shared/queries/user"
import { Download } from "lucide-react"
import { AddUserDialog } from "./components/AddUserDialog"
import { ImportUsersSheet } from "./components/ImportUsersSheet"
import { UsersTable } from "./components/UsersTable"

export function UsersPage() {
  const exportUsers = useExportUsersMutation()

  type ApiError = { message?: string; body?: { message?: string | string[] } }
  const exportErr = exportUsers.error as ApiError | undefined
  const exportError =
    exportErr?.message ??
    (Array.isArray(exportErr?.body?.message) ? exportErr.body.message.join(", ") : exportErr?.body?.message) ??
    null

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage users and permissions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportUsers.mutate()}
            disabled={exportUsers.isPending}
          >
            <Download className="size-4" />
            {exportUsers.isPending ? "Exporting…" : "Export CSV"}
          </Button>
          <AddUserDialog />
          <ImportUsersSheet />
        </div>
      </div>

      {exportError && (
        <p className="shrink-0 text-destructive text-sm" role="alert">
          {exportError}
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        <UsersTable />
      </div>
    </div>
  )
}
