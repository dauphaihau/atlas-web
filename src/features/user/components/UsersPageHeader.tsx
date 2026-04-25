import { ExportUsersButton } from './ExportUsers';
import { AddUserDialog } from './AddUserDialog';
import { ImportUsersDialog } from './ImportUsersDialog';

export function UsersPageHeader() {
  return (
    <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage users and permissions.
        </p>
      </div>
      <div className="flex gap-2">
        <ExportUsersButton />
        <AddUserDialog />
        <ImportUsersDialog />
      </div>
    </div>
  );
}
