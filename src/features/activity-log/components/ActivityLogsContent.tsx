import { useMeQuery } from '@/shared/queries/auth';
import { ActivityLogsPageHeader } from './ActivityLogsPageHeader';
import { ActivityLogsPermissionDenied } from './ActivityLogsPermissionDenied';
import { ActivityLogsTable } from './ActivityLogsTable';

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
