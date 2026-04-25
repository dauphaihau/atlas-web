import { AddTenantDialog } from './AddTenantDialog';

export function TenantsPageHeader() {
  return (
    <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
        <p className="text-muted-foreground">
          Manage tenants (super admin only).
        </p>
      </div>
      <div className="flex gap-2">
        <AddTenantDialog />
      </div>
    </div>
  );
}
