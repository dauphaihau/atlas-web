import { type ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useMeQuery } from "@/shared/queries/auth"
import { authKeys } from "@/shared/api/auth"
import { getTokenFromCookie, clearTokenCookie } from "@/shared/utils/get-token-cookie-name"
import { Skeleton } from "@/shared/ui/skeleton"

interface AuthGuardProps {
  children: ReactNode
}

/**
 * Protects dashboard routes: requires valid token and successful /me.
 * Redirects to /login when unauthenticated or when /me returns 401.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const queryClient = useQueryClient()
  const token = getTokenFromCookie()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const { data, isLoading, isError, error } = useMeQuery()
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
    clearTokenCookie()
    queryClient.removeQueries({ queryKey: authKeys.all })
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
