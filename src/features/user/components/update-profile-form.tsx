'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@atlas/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@atlas/ui/field';
import { Input } from '@atlas/ui/input';
import { useMeQuery, useUpdateProfileMutation } from '@/shared/queries/auth';
import { authKeys } from '@/shared/api/auth';
import { type ApiError, getErrorMessage, isVersionConflict } from '@/shared/lib/api-errors';
import { ConflictCallout } from '@/shared/ui/app/conflict-callout';

const updateProfileSchema = z.object({
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

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export function UpdateProfileForm() {
  const queryClient = useQueryClient();
  const meQuery = useMeQuery();
  const me = meQuery.data;

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const updateProfile = useUpdateProfileMutation();
  const rawError = updateProfile.error as ApiError | undefined;
  const updateError = getErrorMessage(rawError);
  const isConflict = isVersionConflict(rawError);

  useEffect(() => {
    if (me != null) {
      form.reset({
        name: me.name,
        email: me.email,
        password: '',
      });
    }
  }, [me, form]);

  const onSubmit = (formValues: UpdateProfileFormValues) => {
    if (me == null) return;
    updateProfile.mutate(
      {
        version: me.version,
        name: formValues.name,
        email: formValues.email,
        ...(formValues.password ? { password: formValues.password } : {}),
      },
      {
        onSuccess: () => {
          form.reset({ name: formValues.name, email: formValues.email, password: '' });
        },
      }
    );
  };

  const handleReload = () => {
    queryClient.invalidateQueries({ queryKey: authKeys.me() });
    updateProfile.reset();
  };

  if (meQuery.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  return (
    <form
      id="update-profile-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex max-w-sm flex-col gap-4"
    >
      {updateError != null && updateError !== '' && (
        isConflict
          ? (
            <ConflictCallout subject="profile" onReload={handleReload} />
          )
          : (
            <p className="text-destructive text-sm" role="alert">
              {updateError}
            </p>
          )
      )}
      {updateProfile.isSuccess && (
        <p className="text-sm text-green-600" role="status">
          Saved.
        </p>
      )}
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid ? '' : undefined}>
              <FieldLabel htmlFor="profile-name">Name</FieldLabel>
              <Input
                {...field}
                id="profile-name"
                placeholder="Full name"
                disabled={updateProfile.isPending}
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
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <Input
                {...field}
                id="profile-email"
                type="email"
                placeholder="email@example.com"
                disabled={updateProfile.isPending}
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
              <FieldLabel htmlFor="profile-password">New password</FieldLabel>
              <Input
                {...field}
                id="profile-password"
                type="password"
                placeholder="Leave blank to keep unchanged"
                disabled={updateProfile.isPending}
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
      <div>
        <Button
          type="submit"
          form="update-profile-form"
          disabled={updateProfile.isPending || isConflict}
        >
          {updateProfile.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
