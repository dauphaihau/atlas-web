"use client"

import { useState } from "react"
import { Button } from "@atlas/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@atlas/ui/dialog"
import { useExportUsersMutation } from "@/shared/queries/user"
import type { ExportUsersField } from "@/shared/api/user/dto"
import { Download } from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_FIELDS: ExportUsersField[] = ["id", "name", "email", "roles", "created_at"]

const FIELD_LABELS: Record<ExportUsersField, string> = {
  id: "ID",
  name: "Name",
  email: "Email",
  roles: "Roles",
  created_at: "Created At",
}

type DatePreset =
  | "today"
  | "current_month"
  | "last_7_days"
  | "last_4_weeks"
  | "last_month"
  | "all"
  | "custom"

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "current_month", label: "Current month" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_4_weeks", label: "Last 4 weeks" },
  { value: "last_month", label: "Last month" },
  { value: "all", label: "All" },
  { value: "custom", label: "Custom" },
]

type Timezone = "local" | "utc"

// ─── Date utilities ────────────────────────────────────────────────────────────

function getLocalTzName(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/** Returns a human-readable label like "GMT+8 (UTC+08:00)" for the local offset. */
function getLocalTzLabel(): string {
  const offsetMin = -new Date().getTimezoneOffset()
  const sign = offsetMin >= 0 ? "+" : "-"
  const absMin = Math.abs(offsetMin)
  const h = Math.floor(absMin / 60)
  const m = absMin % 60
  const short = m === 0 ? `${sign}${h}` : `${sign}${h}:${String(m).padStart(2, "0")}`
  const long = `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  return `GMT${short} (UTC${long})`
}

/** Extract year/month/day from a Date in the given IANA timezone. */
function getPartsInTz(
  date: Date,
  tzName: string,
): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: tzName,
  }).formatToParts(date)
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)!.value, 10)
  return { year: get("year"), month: get("month"), day: get("day") }
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/** Format an ISO date string (YYYY-MM-DD) as "Mar 8" in the given timezone. */
function formatDisplayDate(isoDate: string, tzName: string): string {
  const [y, m, d] = isoDate.split("-").map(Number)
  // Build the date at noon to avoid any DST edge-cases flipping the day.
  const date = new Date(y, m - 1, d, 12, 0, 0)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: tzName,
  }).format(date)
}

function computePresetRange(
  preset: DatePreset,
  tzName: string,
): { from: string | null; to: string | null } {
  if (preset === "all" || preset === "custom") return { from: null, to: null }

  const now = new Date()
  const { year, month, day } = getPartsInTz(now, tzName)
  const today = toIsoDate(year, month, day)

  if (preset === "today") return { from: today, to: today }

  if (preset === "current_month") {
    return { from: toIsoDate(year, month, 1), to: today }
  }

  if (preset === "last_7_days") {
    const d = new Date(now)
    d.setDate(d.getDate() - 6)
    const p = getPartsInTz(d, tzName)
    return { from: toIsoDate(p.year, p.month, p.day), to: today }
  }

  if (preset === "last_4_weeks") {
    const d = new Date(now)
    d.setDate(d.getDate() - 27)
    const p = getPartsInTz(d, tzName)
    return { from: toIsoDate(p.year, p.month, p.day), to: today }
  }

  if (preset === "last_month") {
    // Last day of previous month = one day before the first of the current month.
    const firstOfThisMonth = new Date(year, month - 1, 1, 12, 0, 0)
    const lastOfPrevMonth = new Date(firstOfThisMonth.getTime() - 24 * 60 * 60 * 1000)
    const firstOfPrevMonth = new Date(
      lastOfPrevMonth.getFullYear(),
      lastOfPrevMonth.getMonth(),
      1,
      12,
      0,
      0,
    )
    const fp = getPartsInTz(firstOfPrevMonth, tzName)
    const lp = getPartsInTz(lastOfPrevMonth, tzName)
    return {
      from: toIsoDate(fp.year, fp.month, fp.day),
      to: toIsoDate(lp.year, lp.month, lp.day),
    }
  }

  return { from: null, to: null }
}

/** Compact date-range label shown beside each preset radio (e.g. "Mar 1–Mar 8"). */
function getRangeLabel(
  preset: DatePreset,
  tzName: string,
): string {
  if (preset === "all" || preset === "custom") return ""
  const { from, to } = computePresetRange(preset, tzName)
  if (!from) return ""
  if (from === to) return formatDisplayDate(from, tzName)
  return `${formatDisplayDate(from, tzName)}–${formatDisplayDate(to!, tzName)}`
}

// ─── Error helper ──────────────────────────────────────────────────────────────

type ApiError = { message?: string; body?: { message?: string | string[] } }

function getExportErrorMessage(err: ApiError | undefined): string | null {
  if (!err) return null
  const bodyMsg = Array.isArray(err.body?.message)
    ? err.body.message.join(", ")
    : err.body?.message
  return err.message ?? bodyMsg ?? null
}

// ─── Export dialog ─────────────────────────────────────────────────────────────

export function ExportUsersButton() {
  const [open, setOpen] = useState(false)
  const [timezone, setTimezone] = useState<Timezone>("local")
  const [datePreset, setDatePreset] = useState<DatePreset>("today")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [selectedFields, setSelectedFields] = useState<Set<ExportUsersField>>(
    new Set(ALL_FIELDS),
  )

  const exportUsers = useExportUsersMutation()

  const tzName = timezone === "utc" ? "UTC" : getLocalTzName()
  const localTzLabel = getLocalTzLabel()

  const toggleField = (field: ExportUsersField) => {
    setSelectedFields((prev) => {
      const next = new Set(prev)
      if (next.has(field)) {
        if (next.size === 1) return prev // keep at least one column
        next.delete(field)
      } else {
        next.add(field)
      }
      return next
    })
  }

  const handleExport = () => {
    const range =
      datePreset === "custom"
        ? { from: customFrom || null, to: customTo || null }
        : computePresetRange(datePreset, tzName)

    const allSelected = selectedFields.size === ALL_FIELDS.length

    exportUsers.mutate(
      {
        date_from: range.from ?? undefined,
        date_to: range.to ?? undefined,
        fields: allSelected ? undefined : (Array.from(selectedFields) as ExportUsersField[]),
      },
      { onSuccess: () => setOpen(false) },
    )
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) exportUsers.reset()
  }

  const exportError = getExportErrorMessage(exportUsers.error as ApiError | undefined)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Download className="size-4" />
        Export CSV
      </Button>

      <DialogContent className="max-w-md gap-0 p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Export users</DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="flex flex-col gap-6 overflow-y-auto max-h-[60vh] px-6 py-5">
          {/* Timezone */}
          <section className="flex flex-col gap-2.5">
            <p className="font-medium text-sm">Time zone</p>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="export-tz"
                  checked={timezone === "local"}
                  onChange={() => setTimezone("local")}
                  className="accent-primary size-4"
                />
                <span className="text-sm">{localTzLabel}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="export-tz"
                  checked={timezone === "utc"}
                  onChange={() => setTimezone("utc")}
                  className="accent-primary size-4"
                />
                <span className="text-sm">UTC</span>
              </label>
            </div>
          </section>

          {/* Date range */}
          <section className="flex flex-col gap-2.5">
            <p className="font-medium text-sm">Date range</p>
            <div className="flex flex-col gap-2">
              {DATE_PRESETS.map(({ value, label }) => {
                const rangeLabel = getRangeLabel(value, tzName)
                return (
                  <label
                    key={value}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="export-date-preset"
                      checked={datePreset === value}
                      onChange={() => setDatePreset(value)}
                      className="accent-primary size-4 shrink-0"
                    />
                    <span className="text-sm flex-1">{label}</span>
                    {rangeLabel && (
                      <span className="text-muted-foreground text-sm tabular-nums">
                        {rangeLabel}
                      </span>
                    )}
                  </label>
                )
              })}
            </div>

            {/* Custom date pickers */}
            {datePreset === "custom" && (
              <div className="flex items-center gap-2 mt-1 ml-6">
                <input
                  type="date"
                  value={customFrom}
                  max={customTo || undefined}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="border border-input rounded-md px-2 py-1 text-sm bg-transparent text-foreground"
                />
                <span className="text-muted-foreground text-sm">–</span>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom || undefined}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="border border-input rounded-md px-2 py-1 text-sm bg-transparent text-foreground"
                />
              </div>
            )}
          </section>

          {/* Columns */}
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">Columns</p>
              <span className="text-muted-foreground text-xs">
                {selectedFields.size} of {ALL_FIELDS.length} selected
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {ALL_FIELDS.map((field) => (
                <label
                  key={field}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.has(field)}
                    onChange={() => toggleField(field)}
                    className="accent-primary size-4"
                  />
                  <span className="text-sm">{FIELD_LABELS[field]}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Inline error */}
          {exportError && (
            <p className="text-destructive text-sm" role="alert">
              {exportError}
            </p>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t">
          <DialogClose>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleExport}
            disabled={exportUsers.isPending || selectedFields.size === 0}
          >
            {exportUsers.isPending ? "Exporting…" : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Renders export error message when present. Place below the actions row. */
export function ExportUsersError() {
  const exportUsers = useExportUsersMutation()
  const exportError = getExportErrorMessage(
    exportUsers.error as ApiError | undefined,
  )
  if (exportError == null || exportError === "") return null
  return (
    <p className="shrink-0 text-destructive text-sm" role="alert">
      {exportError}
    </p>
  )
}
