'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button } from '@atlas/ui/button';
import { Checkbox } from '@atlas/ui/checkbox';
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
import {
  useAssignableRolesQuery,
  useCreateUserMutation
} from '@/shared/queries/user';
import { PlusIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  isAssignableRoleOption
} from './add-user-dialog-roles';
import {
  addUserSchema,
  type AddUserFormValues
} from './add-user-dialog-schema';
import { AddUserRoleSelectField } from './AddUserRoleSelectField';

type ApiError = { message?: string; body?: { message?: string | string[] } };

function getErrorMessage(err: ApiError | undefined): string | null {
  if (!err) return null;
  const bodyMsg = Array.isArray(err.body?.message)
    ? err.body.message.join(', ')
    : err.body?.message;
  return err.message ?? bodyMsg ?? null;
}

export function AddUserDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
      send_invite: true,
      password: '',
    },
  });
  const sendInvite = useWatch({ control: form.control, name: 'send_invite' });

  const createUser = useCreateUserMutation();
  const assignableRolesQuery = useAssignableRolesQuery({ enabled: open });
  const assignableRoles = useMemo(
    () => (assignableRolesQuery.data ?? []).filter(isAssignableRoleOption),
    [assignableRolesQuery.data]
  );
  const rolesUnavailable = assignableRoles.length === 0;
  const createError = getErrorMessage(createUser.error as ApiError | undefined);

  useEffect(() => {
    if (!open || rolesUnavailable) return;

    const currentRole = form.getValues('role');
    if (!assignableRoles.some((role) => role.slug === currentRole)) {
      form.setValue('role', assignableRoles[0].slug, { shouldValidate: true });
    }
  }, [assignableRoles, form, open, rolesUnavailable]);

  const onSubmit = (formValues: AddUserFormValues) => {
    createUser.mutate({
      name: formValues.name,
      email: formValues.email,
      role: formValues.role,
      send_invite: formValues.send_invite,
      ...(!formValues.send_invite ? { password: formValues.password } : {}),
    }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast.success(
          formValues.send_invite
            ? `Invitation sent to ${formValues.email}.`
            : `User created for ${formValues.email}.`
        );
      },
    });
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button size="sm" type="button" onClick={() => setOpen(true)}>
        <PlusIcon className="size-4" />
        Add user
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
        </DialogHeader>
        <form
          id="add-user-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {createError != null && createError !== '' && (
            <p className="text-destructive text-sm" role="alert">
              {createError}
            </p>
          )}
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? '' : undefined}>
                  <FieldLabel htmlFor="add-user-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="add-user-name"
                    placeholder="Full name"
                    disabled={createUser.isPending}
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
                  <FieldLabel htmlFor="add-user-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="add-user-email"
                    type="email"
                    placeholder="email@example.com"
                    disabled={createUser.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    We'll use this for account notifications.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <AddUserRoleSelectField
              control={form.control}
              disabled={createUser.isPending || assignableRolesQuery.isLoading || rolesUnavailable}
              roles={assignableRoles}
            />
            {assignableRolesQuery.isError && (
              <p className="text-destructive text-sm" role="alert">
                Unable to load assignable roles.
              </p>
            )}
            <Controller
              name="send_invite"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <label className="flex cursor-pointer items-start gap-2">
                    <Checkbox
                      id="add-user-send-invite"
                      checked={field.value}
                      onCheckedChange={(checked: boolean) => field.onChange(checked)}
                      disabled={createUser.isPending}
                      className="mt-0.5"
                    />
                    <span className="flex flex-col gap-1">
                      <FieldLabel htmlFor="add-user-send-invite" className="mb-0">
                        Send invite email
                      </FieldLabel>
                      <FieldDescription>
                        Let the user set their own password from an invitation link.
                      </FieldDescription>
                    </span>
                  </label>
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? '' : undefined}>
                  <FieldLabel htmlFor="add-user-password">
                    Password{sendInvite ? ' (optional)' : ''}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="add-user-password"
                    type="password"
                    placeholder={sendInvite ? 'Invite link will set password' : 'Min 8 characters'}
                    disabled={createUser.isPending || sendInvite}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    {sendInvite
                      ? 'A temporary password is generated until the invite is accepted.'
                      : 'Required for direct account creation.'}
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
              form="add-user-form"
              disabled={createUser.isPending || assignableRolesQuery.isLoading || rolesUnavailable}
            >
              {createUser.isPending
                ? sendInvite ? 'Sending…' : 'Creating…'
                : sendInvite ? 'Send invite' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
