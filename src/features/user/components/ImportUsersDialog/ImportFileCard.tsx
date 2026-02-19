"use client"

import { Button } from "@/shared/ui/button"
import { Progress } from "@/shared/ui/progress"
import { formatFileSize } from "@/shared/utils/format-file-size"
import { FileUp, X } from "lucide-react"

export interface ImportFileCardProps {
  file: File
  onRemove: () => void
  /** Server-side progress 0–100, or null while upload/status not yet available (shows 0% when shown). */
  progressPercentage: number | null
  /** When true, shows the progress bar and percentage (e.g. after user clicks Import). */
  showProgress?: boolean
  disabled?: boolean
}

export function ImportFileCard({
  file,
  onRemove,
  progressPercentage,
  showProgress = false,
  disabled = false,
}: ImportFileCardProps) {
  const percentage =
    progressPercentage != null && Number.isFinite(progressPercentage)
      ? Math.min(100, Math.max(0, progressPercentage))
      : 0

  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm"
      role="status"
      aria-label={`Selected file: ${file.name}, ${formatFileSize(file.size)}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <FileUp className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove selected file"
          className="shrink-0"
        >
          <X className="size-3" />
        </Button>
      </div>

      {showProgress && (
        <div className="flex items-center gap-2">
          <Progress value={percentage} className="flex-1" />
          <span className="shrink-0 text-sm tabular-nums text-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
}
