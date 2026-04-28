import { AlertTriangleIcon } from 'lucide-react';
import { Button } from '@atlas/ui/button';
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle
} from '@/shared/ui/primitives/alert';

export interface RestoreEditsAlertProps {
  subject: string
  onRestore: () => void
}

export function RestoreEditsAlert({ subject, onRestore }: RestoreEditsAlertProps) {
  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-50">
      <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle>{subject} changed elsewhere</AlertTitle>
      <AlertDescription>
        Latest details were loaded. You can restore your unsaved edits and review before saving again.
      </AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline" type="button" onClick={onRestore}>
          Restore my edits
        </Button>
      </AlertAction>
    </Alert>
  );
}
