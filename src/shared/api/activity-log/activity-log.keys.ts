export interface ListActivityLogsQueryParams {
  page?: number
  per_page?: number
  event?: string
  subject_type?: string
  subject_id?: number
  causer_id?: number
  from_date?: string
  to_date?: string
  sort?: string
  search?: string
}

export const activityLogKeys = {
  all: ["activity-logs"] as const,
  list: (params?: ListActivityLogsQueryParams) =>
    [...activityLogKeys.all, "list", params ?? {}] as const,
  detail: (id: number) => [...activityLogKeys.all, "detail", id] as const,
  listForUser: (userId: number, params?: ListActivityLogsQueryParams) =>
    [...activityLogKeys.all, "user", userId, params ?? {}] as const,
}
