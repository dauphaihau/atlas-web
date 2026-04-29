'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import type { UserDto } from '@/shared/api/user';
import { userKeys } from '@/shared/api/user';
import { Button } from '@atlas/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@atlas/ui/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@atlas/ui/field';
import { Input } from '@atlas/ui/input';
import { useUpdateUserMutation } from '@/shared/queries/user';
import { type ApiError, getErrorMessage, isVersionConflict } from '@/shared/lib/api-errors';
import { ConflictCallout } from '@/shared/ui/app/conflict-callout';
import { RestoreEditsAlert } from '@/shared/ui/app/restore-edits-alert';

const editUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required.')
    .max(255, 'Name must be at most 255 characters.'),
  email: z.string().min(1, 'Email is required.').email('Enter a valid email.'),
  password: z
    .string()
    .max(255, 'Password must be at most 255 characters.')
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || val.length >= 8, {
      message: 'Password must be at least 8 characters.',
    }),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export interface EditUserDialogProps {
  user: UserDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const queryClient = useQueryClient();
  const [pendingEdits, setPendingEdits] = useState<EditUserFormValues | null>(null);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const updateUser = useUpdateUserMutation();
  const rawError = updateUser.error as ApiError | undefined;
  const updateError = getErrorMessage(rawError);
  const isConflict = isVersionConflict(rawError);

  useEffect(() => {
    if (user != null) {
      form.reset({
        name: user.name,
        email: user.email,
        password: '',
      });
    }
  }, [user, form]);

  const onSubmit = (formValues: EditUserFormValues) => {
    if (user == null) return;
    updateUser.mutate(
      {
        id: user.id,
        payload: {
          version: user.version,
          name: formValues.name,
          email: formValues.email,
          ...(formValues.password ? { password: formValues.password } : {}),
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      form.reset();
      setPendingEdits(null);
    }
  };

  const handleReload = () => {
    setPendingEdits(form.getValues());
    queryClient.invalidateQueries({ queryKey: userKeys.all });
    updateUser.reset();
  };

  const handleRestoreEdits = () => {
    if (pendingEdits == null) return;
    form.reset(pendingEdits);
    setPendingEdits(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
        </DialogHeader>
        <form
          id="edit-user-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {isConflict && (
            <ConflictCallout subject="user" onReload={handleReload} />
          )}
          {!isConflict && pendingEdits != null && (
            <RestoreEditsAlert subject="User" onRestore={handleRestoreEdits} />
          )}
          {updateError != null && updateError !== '' && !isConflict && (
            <p className="text-destructive text-sm" role="alert">
              {updateError}
            </p>
          )}
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? '' : undefined}>
                  <FieldLabel htmlFor="edit-user-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="edit-user-name"
                    placeholder="Full name"
                    disabled={updateUser.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? '' : undefined}>
                  <FieldLabel htmlFor="edit-user-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="edit-user-email"
                    type="email"
                    placeholder="email@example.com"
                    disabled={updateUser.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? '' : undefined}>
                  <FieldLabel htmlFor="edit-user-password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="edit-user-password"
                    type="password"
                    placeholder="Leave blank to keep unchanged"
                    disabled={updateUser.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Min 8 characters. Leave blank to keep the current password.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="edit-user-form"
              disabled={updateUser.isPending || isConflict}
            >
              {updateUser.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
