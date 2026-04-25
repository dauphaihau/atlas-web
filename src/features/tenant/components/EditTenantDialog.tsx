'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { TenantDto } from '@/shared/api/tenant';
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
import { useUpdateTenantMutation } from '@/shared/queries/tenant';

type ApiError = { message?: string; body?: { message?: string | string[] } };

function getErrorMessage(err: ApiError | undefined): string | null {
  if (!err) return null;
  const bodyMsg = Array.isArray(err.body?.message)
    ? err.body.message.join(', ')
    : err.body?.message;
  return err.message ?? bodyMsg ?? null;
}

const slugRegex = /^[a-zA-Z0-9_-]+$/;

const editTenantSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required.')
    .max(255, 'Name must be at most 255 characters.'),
  slug: z
    .string()
    .min(1, 'Slug is required.')
    .max(100, 'Slug must be at most 100 characters.')
    .regex(slugRegex, 'Slug may only contain letters, numbers, hyphens, and underscores.'),
  settingsJson: z.string().optional(),
  is_active: z.boolean(),
});

type EditTenantFormValues = z.infer<typeof editTenantSchema>;

function parseSettingsJson(value: string | undefined): Record<string, unknown> | null | undefined {
  if (value == null || value.trim() === '') return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  }
  catch {
    return undefined;
  }
}

function settingsToJson(settings: Record<string, unknown> | null | undefined): string {
  if (settings == null || Object.keys(settings).length === 0) return '';
  return JSON.stringify(settings, null, 2);
}

export interface EditTenantDialogProps {
  tenant: TenantDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTenantDialog({
  tenant,
  open,
  onOpenChange,
}: EditTenantDialogProps) {
  const form = useForm<EditTenantFormValues>({
    resolver: zodResolver(editTenantSchema),
    defaultValues: {
      name: '',
      slug: '',
      settingsJson: '',
      is_active: true,
    },
  });

  const updateTenant = useUpdateTenantMutation();
  const updateError = getErrorMessage(updateTenant.error as ApiError | undefined);

  useEffect(() => {
    if (tenant != null) {
      form.reset({
        name: tenant.name,
        slug: tenant.slug,
        settingsJson: settingsToJson(tenant.settings),
        is_active: tenant.is_active,
      });
    }
  }, [tenant, form]);

  const onSubmit = (formValues: EditTenantFormValues) => {
    if (tenant == null) return;
    const settings = parseSettingsJson(formValues.settingsJson);
    if (settings === undefined) {
      form.setError('settingsJson', { message: 'Invalid JSON.' });
      return;
    }
    updateTenant.mutate(
      {
        id: tenant.id,
        payload: {
          name: formValues.name,
          slug: formValues.slug,
          settings,
          is_active: formValues.is_active,
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
    if (!next) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit tenant</DialogTitle>
        </DialogHeader>
        <form
          id="edit-tenant-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {updateError != null && updateError !== '' && (
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
                  <FieldLabel htmlFor="edit-tenant-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="edit-tenant-name"
                    placeholder="Acme Inc."
                    disabled={updateTenant.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? '' : undefined}>
                  <FieldLabel htmlFor="edit-tenant-slug">Slug</FieldLabel>
                  <Input
                    {...field}
                    id="edit-tenant-slug"
                    placeholder="acme-inc"
                    disabled={updateTenant.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Letters, numbers, hyphens, and underscores only.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="settingsJson"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? '' : undefined}>
                  <FieldLabel htmlFor="edit-tenant-settings">
                    Settings (optional JSON)
                  </FieldLabel>
                  <textarea
                    {...field}
                    id="edit-tenant-settings"
                    rows={3}
                    placeholder='{"key": "value"}'
                    disabled={updateTenant.isPending}
                    aria-invalid={fieldState.invalid}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="is_active"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      disabled={updateTenant.isPending}
                      className="size-4 rounded border-input"
                    />
                    <FieldLabel className="mb-0">Active</FieldLabel>
                  </label>
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
              form="edit-tenant-form"
              disabled={updateTenant.isPending}
            >
              {updateTenant.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
