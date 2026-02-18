import { useState, useCallback } from "react"
import {
  useUsersQuery,
  useUpdateUserAvatarMutation,
} from "@/shared/queries/user"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { Input } from "@/shared/ui/input"
import { Skeleton } from "@/shared/ui/skeleton"
import { AvatarCell } from "./AvatarCell"
import { TablePagination } from "./TablePagination"
import { Button } from "@/shared/ui/button"
import { X } from "lucide-react"

const DEFAULT_PER_PAGE = 11
const SEARCH_DEBOUNCE_MS = 300

export function UsersTable() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  const effectiveSearch = debouncedSearch.trim() || undefined

  const usersQuery = useUsersQuery({
    page,
    per_page: perPage,
    search: effectiveSearch,
  })
  const updateAvatar = useUpdateUserAvatarMutation()

  const users = usersQuery.data?.data ?? []
  const meta = usersQuery.data?.meta
  const total = meta?.total ?? 0
  const currentPage = meta?.current_page ?? page
  const totalPages = meta && meta.per_page > 0
    ? Math.ceil(meta.total / meta.per_page)
    : 1
  const from = total === 0 ? 0 : (currentPage - 1) * (meta?.per_page ?? perPage) + 1
  const to = total === 0 ? 0 : Math.min(currentPage * (meta?.per_page ?? perPage), total)

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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-2">
          <span className="sr-only">Search by name or email</span>
          <Input
            type="search"
            placeholder="Search by name or email"
            value={searchInput}
            onChange={(e) => {
            setSearchInput(e.target.value)
            setPage(1)
          }}
            aria-label="Search by name or email"
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
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border">
        {usersQuery.isLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : usersQuery.isError ? (
          <div className="p-4 text-destructive text-sm">
            {usersQuery.error instanceof Error
              ? usersQuery.error.message
              : "Failed to load users."}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {effectiveSearch
              ? "No users match your search."
              : "No users yet. Add a user or import from CSV."}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium">Avatar</th>
                  <th className="h-10 px-4 text-left font-medium">Name</th>
                  <th className="h-10 px-4 text-left font-medium">Email</th>
                  <th className="h-10 px-4 text-left font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <AvatarCell
                        user={user}
                        onUpload={(userId, file) =>
                          updateAvatar.mutate({ userId, file })
                        }
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.created_at ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!usersQuery.isLoading && !usersQuery.isError && total > 0 && (
        <TablePagination
          from={from}
          to={to}
          total={total}
          perPage={perPage}
          onPerPageChange={handlePerPageChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={goToPrev}
          onNext={goToNext}
          ariaLabel="Users table pagination"
        />
      )}
    </div>
  )
}
