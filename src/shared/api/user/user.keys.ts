export interface ListUsersQueryParams {
  page?: number
  per_page?: number
  search?: string
  trashed?: 'with' | 'only'
}

export const userKeys = {
  all: ['users'] as const,
  list: (params?: ListUsersQueryParams) =>
    [...userKeys.all, 'list', params ?? {}] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
  assignableRoles: () => [...userKeys.all, 'assignable-roles'] as const,
  importStatus: (id: number) => [...userKeys.all, 'import-status', id] as const,
};
