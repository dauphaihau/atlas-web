import { useState, useCallback } from "react"
import { useActivityLogsQuery } from "@/shared/queries/activity-log"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@atlas/ui/pagination"
import { Input } from "@atlas/ui/input"
import { Button } from "@atlas/ui/button"
import { Skeleton } from "@atlas/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@atlas/ui/table"
import { XIcon } from "lucide-react"
import { formatIsoDate } from "../utils/format-iso-date"

const DEFAULT_PER_PAGE = 15
const PER_PAGE_OPTIONS = [10, 15, 25, 50] as const
const SEARCH_DEBOUNCE_MS = 300

export function ActivityLogsTable() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  const effectiveSearch = debouncedSearch.trim() || undefined

  const activityLogsQuery = useActivityLogsQuery({
    page,
    per_page: perPage,
    search: effectiveSearch,
  })

  const entries = activityLogsQuery.data?.data ?? []
  const meta = activityLogsQuery.data?.meta
  const total = meta?.total ?? 0
  const currentPage = meta?.current_page ?? page
  const totalPages =
    meta && meta.per_page > 0 ? Math.ceil(meta.total / meta.per_page) : 1
  const from =
    total === 0 ? 0 : (currentPage - 1) * (meta?.per_page ?? perPage) + 1
  const to =
    total === 0 ? 0 : Math.min(currentPage * (meta?.per_page ?? perPage), total)

  const goToPrev = useCallback(() => {
    setPage((p) => Math.max(1, p - 1))
  }, [])
  const goToNext = useCallback(() => {
    setPage((p) => Math.min(totalPages, p + 1))
  }, [totalPages])

  const handlePerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = Number(e.target.value)
      if (Number.isInteger(value) && value >= 1 && value <= 100) {
        setPerPage(value)
        setPage(1)
      }
    },
    []
  )

  const err = activityLogsQuery.error as
    | { status?: number; message?: string }
    | undefined
  const isForbidden = err?.status === 403

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {isForbidden && (
        <p className="shrink-0 text-destructive text-sm" role="alert">
          Access denied. Only admins can view activity logs.
        </p>
      )}

      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-2">
          <span className="sr-only">Search event, subject, causer</span>
          <Input
            type="search"
            placeholder="Search event, subject, causer…"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setPage(1)
            }}
            aria-label="Search event, subject, causer"
            className="max-w-sm"
          />
        </label>
        {searchInput.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput("")
              setPage(1)
            }}
            aria-label="Clear search"
          >
            <XIcon className="size-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border">
        {activityLogsQuery.isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : activityLogsQuery.isError && !isForbidden ? (
          <div className="p-4 text-destructive text-sm">
            {activityLogsQuery.error instanceof Error
              ? activityLogsQuery.error.message
              : "Failed to load activity logs."}
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {effectiveSearch
              ? "No activity logs match your search."
              : "No activity logs found."}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Causer</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {log.id}
                    </TableCell>
                    <TableCell className="font-medium">{log.event}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.subject_type ?? "—"} #{log.subject_id ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.causer_name ?? log.causer_email ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatIsoDate(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {!activityLogsQuery.isLoading &&
        !activityLogsQuery.isError &&
        total > 0 && (
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <span>
                Showing {from}–{to} of {total}
              </span>
              <label className="flex items-center gap-2">
                <span>Per page</span>
                <select
                  value={perPage}
                  onChange={handlePerPageChange}
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Rows per page"
                >
                  {PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <Pagination
              className="mx-0 w-auto"
              aria-label="Activity logs pagination"
            >
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={goToPrev}
                    disabled={currentPage <= 1}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-2 text-muted-foreground text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={goToNext}
                    disabled={currentPage >= totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
    </div>
  )
}
