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

interface DeleteUserDialogProps {
  user: UserDto | null;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteUserDialog({
  user,
  isPending,
  onConfirm,
  onClose,
}: DeleteUserDialogProps) {
  return (
    <AlertDialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete {user?.name ?? 'this user'}. You can restore them
            from the Deleted tab.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
