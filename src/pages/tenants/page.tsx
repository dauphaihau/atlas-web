import {
  TenantsPageHeader,
  TenantsTable,
} from "@/features/tenant"

export function TenantsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <TenantsPageHeader />
      <div className="flex min-h-0 flex-1 flex-col">
        <TenantsTable />
      </div>
    </div>
  )
}
