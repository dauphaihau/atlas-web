import type {
  ActivityLogEntryDto,
  ListActivityLogsParams,
  ListActivityLogsResponseDto,
} from "./dto"
import { api, type ApiResponseWrapper, unwrapData } from "@/shared/lib/api-client"

function buildListUrl(params?: ListActivityLogsParams): string {
  const base = "/api/v1/activity-logs"
  if (!params) return base
  const search = new URLSearchParams()
  if (params.page !== undefined) search.set("page", String(params.page))
  if (params.per_page !== undefined) search.set("per_page", String(params.per_page))
  if (params.event !== undefined && params.event !== "") search.set("event", params.event)
  if (params.subject_type !== undefined && params.subject_type !== "") search.set("subject_type", params.subject_type)
  if (params.subject_id !== undefined) search.set("subject_id", String(params.subject_id))
  if (params.causer_id !== undefined) search.set("causer_id", String(params.causer_id))
  if (params.from_date !== undefined && params.from_date !== "") search.set("from_date", params.from_date)
  if (params.to_date !== undefined && params.to_date !== "") search.set("to_date", params.to_date)
  if (params.sort !== undefined && params.sort !== "") search.set("sort", params.sort)
  if (params.search !== undefined && params.search !== "") search.set("search", params.search)
  const qs = search.toString()
  return qs ? `${base}?${qs}` : base
}

export const activityLogApi = {
  list(params?: ListActivityLogsParams): Promise<ListActivityLogsResponseDto> {
    return api.get<ListActivityLogsResponseDto>(buildListUrl(params))
  },

  get(id: number): Promise<ActivityLogEntryDto> {
    return api
      .get<ApiResponseWrapper<ActivityLogEntryDto>>(`/api/v1/activity-logs/${id}`)
      .then(unwrapData)
  },

  listForUser(userId: number, params?: ListActivityLogsParams): Promise<ListActivityLogsResponseDto> {
    const base = `/api/v1/users/${userId}/activity-logs`
    if (!params) return api.get<ListActivityLogsResponseDto>(base)
    const searchParams = new URLSearchParams()
    if (params.page !== undefined) searchParams.set("page", String(params.page))
    if (params.per_page !== undefined) searchParams.set("per_page", String(params.per_page))
    if (params.event !== undefined && params.event !== "") searchParams.set("event", params.event)
    if (params.from_date !== undefined && params.from_date !== "") searchParams.set("from_date", params.from_date)
    if (params.to_date !== undefined && params.to_date !== "") searchParams.set("to_date", params.to_date)
    if (params.sort !== undefined && params.sort !== "") searchParams.set("sort", params.sort)
    if (params.search !== undefined && params.search !== "") searchParams.set("search", params.search)
    const qs = searchParams.toString()
    return api.get<ListActivityLogsResponseDto>(qs ? `${base}?${qs}` : base)
  },
}
