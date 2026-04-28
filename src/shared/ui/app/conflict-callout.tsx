import { Button } from '@atlas/ui/button';

export interface ConflictCalloutProps {
  subject: string
  onReload: () => void
}

export function ConflictCallout({ subject, onReload }: ConflictCalloutProps) {
  return (
    <div
      className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm dark:border-amber-800 dark:bg-amber-950"
      role="alert"
    >
      <p className="font-medium text-amber-800 dark:text-amber-300">
        Edited by someone else
      </p>
      <p className="mt-0.5 text-amber-700 dark:text-amber-400">
        This {subject} was updated in another session. Reload to get the latest version, then apply your changes.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={onReload}
      >
        Reload
      </Button>
    </div>
  );
}
