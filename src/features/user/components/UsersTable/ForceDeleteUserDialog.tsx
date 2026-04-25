import type { UserDto } from '@/shared/api/user';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@atlas/ui/alert-dialog';

interface ForceDeleteUserDialogProps {
  user: UserDto | null;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ForceDeleteUserDialog({
  user,
  isPending,
  onConfirm,
  onClose,
}: ForceDeleteUserDialogProps) {
  return (
    <AlertDialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Permanently delete user?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {user?.name ?? 'this user'}. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            Permanently Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
