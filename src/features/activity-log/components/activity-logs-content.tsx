import { useMeQuery } from '@/shared/queries/auth';
import { ActivityLogsPageHeader } from './activity-logs-page-header';
import { ActivityLogsPermissionDenied } from './activity-logs-permission-denied';
import { ActivityLogsTable } from './activity-logs-table';

export function ActivityLogsContent() {
  const { data: me } = useMeQuery();
  const isAdmin = me?.roles?.includes('admin') ?? false;

  if (!isAdmin) {
    return <ActivityLogsPermissionDenied />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <ActivityLogsPageHeader />
      <ActivityLogsTable />
    </div>
  );
}
