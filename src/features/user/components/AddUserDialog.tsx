'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { useCreateUserMutation } from '@/shared/queries/user';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

type ApiError = { message?: string; body?: { message?: string | string[] } };

function getErrorMessage(err: ApiError | undefined): string | null {
  if (!err) return null;
  const bodyMsg = Array.isArray(err.body?.message)
    ? err.body.message.join(', ')
    : err.body?.message;
  return err.message ?? bodyMsg ?? null;
}

const addUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required.')
    .max(255, 'Name must be at most 255 characters.'),
  email: z.string().min(1, 'Email is required.').email('Enter a valid email.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(255, 'Password must be at most 255 characters.'),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

export function AddUserDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const createUser = useCreateUserMutation();
  const createError = getErrorMessage(createUser.error as ApiError | undefined);

  const onSubmit = (formValues: AddUserFormValues) => {
    createUser.mutate(formValues, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
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
      <DialogContent className="max-w-sm">
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
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? '' : undefined}>
                  <FieldLabel htmlFor="add-user-password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="add-user-password"
                    type="password"
                    placeholder="Min 8 characters"
                    disabled={createUser.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Must be at least 8 characters.
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
              disabled={createUser.isPending}
            >
              {createUser.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
