import { type ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useMeQuery } from "@/shared/queries/auth"
import { Skeleton } from "@atlas/ui/skeleton"

interface AuthGuardProps {
  children: ReactNode
}

/**
 * Protects dashboard routes: requires successful /me (auth via server-set cookie).
 * Redirects to /login when unauthenticated or when /me returns 401.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { data, isLoading, isError, error } = useMeQuery({ enabled: true })
  const err = error as { status?: number } | undefined

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    )
  }

  if (isError && (err?.status === 401 || !data)) {
    // Do not call removeQueries here: it removes the query and triggers an immediate refetch
    // while AuthGuard is still mounted, causing an infinite 401 → refetch loop. Just redirect;
    // the query stays in error state (no retry on 401) and login mutation sets fresh data on success.
    return <Navigate to="/login" replace />
  }

  if (!data) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
