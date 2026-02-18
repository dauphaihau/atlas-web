import {
  UsersPageHeader,
  ExportUsersError,
  UsersTable,
} from "@/features/user"

export function UsersPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <UsersPageHeader />
      <ExportUsersError />
      <div className="flex min-h-0 flex-1 flex-col">
        <UsersTable />
      </div>
    </div>
  )
}
