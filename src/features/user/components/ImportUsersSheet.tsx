"use client"

import { useState } from "react"
import { Button } from "@/shared/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet"
import { useImportUsersMutation } from "@/shared/queries/user"
import { Upload } from "lucide-react"

type ApiError = { message?: string; body?: { message?: string | string[] } }

function getErrorMessage(err: ApiError | undefined): string | null {
  if (!err) return null
  const bodyMsg = Array.isArray(err.body?.message)
    ? err.body.message.join(", ")
    : err.body?.message
  return err.message ?? bodyMsg ?? null
}

export function ImportUsersSheet() {
  const [open, setOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  const importUsers = useImportUsersMutation()
  const importError = getErrorMessage(importUsers.error as ApiError | undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) return
    importUsers.mutate(importFile, {
      onSuccess: () => {
        setOpen(false)
        setImportFile(null)
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Upload className="size-4" />
        Import CSV
      </Button>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Import users</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          {importError != null && importError !== "" && (
            <p className="text-destructive text-sm" role="alert">
              {importError}
            </p>
          )}
          <div className="space-y-2">
            <label htmlFor="import-file" className="text-sm font-medium">
              CSV file
            </label>
            <input
              id="import-file"
              type="file"
              accept=".csv,.txt"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm file:mr-2 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:text-primary-foreground"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              disabled={importUsers.isPending}
            />
          </div>
          <SheetFooter>
            <SheetClose>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={importUsers.isPending || !importFile}>
              {importUsers.isPending ? "Importing…" : "Import"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
