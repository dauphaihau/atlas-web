import { useMutation } from "@tanstack/react-query"
import { userApi } from "@/shared/api/user"
import type { ExportUsersParams } from "@/shared/api/user/dto"
import { getApiBaseUrl } from "@/shared/lib/api-client"

function getDownloadUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  const base = getApiBaseUrl()
  const path = url.startsWith("/") ? url : `/${url}`
  return base ? `${base.replace(/\/$/, "")}${path}` : path
}

export function useExportUsersMutation() {
  return useMutation({
    mutationFn: (params?: ExportUsersParams) => userApi.exportUsers(params),
    onSuccess: (data) => {
      if (!data?.url) return
      const fullUrl = getDownloadUrl(data.url)
      window.open(fullUrl, "_blank", "noopener,noreferrer")
    },
  })
}
