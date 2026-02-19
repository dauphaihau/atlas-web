import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination"

const PER_PAGE_OPTIONS = [10, 15, 25, 50] as const

export interface TablePaginationProps {
  from: number
  to: number
  total: number
  perPage: number
  onPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  /** Accessible label for the pagination nav. */
  ariaLabel?: string
}

export function TablePagination({
  from,
  to,
  total,
  perPage,
  onPerPageChange,
  currentPage,
  totalPages,
  onPrev,
  onNext,
  ariaLabel = "Table pagination",
}: TablePaginationProps) {
  return (
    <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Showing {from}–{to} of {total}
        </span>
        <label className="flex items-center gap-2">
          <span>Per page</span>
          <select
            value={perPage}
            onChange={onPerPageChange}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Users per page"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      {totalPages > 1 && (
        <Pagination className="mx-0 w-auto" aria-label={ariaLabel}>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={onPrev}
                disabled={currentPage <= 1}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={onNext}
                disabled={currentPage >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
