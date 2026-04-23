"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@atlas/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@atlas/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@atlas/ui/field"
import { Input } from "@atlas/ui/input"
import { useCreateTenantMutation } from "@/shared/queries/tenant"
import { PlusIcon } from "lucide-react"
import { useState } from "react"

type ApiError = { message?: string; body?: { message?: string | string[] } }

function getErrorMessage(err: ApiError | undefined): string | null {
  if (!err) return null
  const bodyMsg = Array.isArray(err.body?.message)
    ? err.body.message.join(", ")
    : err.body?.message
  return err.message ?? bodyMsg ?? null
}

const slugRegex = /^[a-zA-Z0-9_-]+$/

const addTenantSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(255, "Name must be at most 255 characters."),
  slug: z
    .string()
    .min(1, "Slug is required.")
    .max(100, "Slug must be at most 100 characters.")
    .regex(slugRegex, "Slug may only contain letters, numbers, hyphens, and underscores."),
  settingsJson: z.string().optional(),
  is_active: z.boolean(),
})

type AddTenantFormValues = z.infer<typeof addTenantSchema>

function parseSettingsJson(
  value: string | undefined
): Record<string, unknown> | null | undefined {
  if (value == null || value.trim() === "") return null
  try {
    const parsed = JSON.parse(value) as unknown
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return undefined
  }
}

export function AddTenantDialog() {
  const [open, setOpen] = useState(false)

  const form = useForm<AddTenantFormValues>({
    resolver: zodResolver(addTenantSchema),
    defaultValues: {
      name: "",
      slug: "",
      settingsJson: "",
      is_active: true,
    },
  })

  const createTenant = useCreateTenantMutation()
  const createError = getErrorMessage(createTenant.error as ApiError | undefined)

  const onSubmit = (data: AddTenantFormValues) => {
    const settings = parseSettingsJson(data.settingsJson)
    if (settings === undefined) {
      form.setError("settingsJson", { message: "Invalid JSON." })
      return
    }
    createTenant.mutate(
      {
        name: data.name,
        slug: data.slug,
        settings,
        is_active: data.is_active,
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button size="sm" type="button" onClick={() => setOpen(true)}>
        <PlusIcon className="size-4" />
        Add tenant
      </Button>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add tenant</DialogTitle>
        </DialogHeader>
        <form
          id="add-tenant-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {createError != null && createError !== "" && (
            <p className="text-destructive text-sm" role="alert">
              {createError}
            </p>
          )}
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid ? "" : undefined}>
                  <FieldLabel htmlFor="add-tenant-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="add-tenant-name"
                    placeholder="Acme Inc."
                    disabled={createTenant.isPending}
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
                <Field data-invalid={fieldState.invalid ? "" : undefined}>
                  <FieldLabel htmlFor="add-tenant-slug">Slug</FieldLabel>
                  <Input
                    {...field}
                    id="add-tenant-slug"
                    placeholder="acme-inc"
                    disabled={createTenant.isPending}
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
                <Field data-invalid={fieldState.invalid ? "" : undefined}>
                  <FieldLabel htmlFor="add-tenant-settings">
                    Settings (optional JSON)
                  </FieldLabel>
                  <textarea
                    {...field}
                    id="add-tenant-settings"
                    rows={3}
                    placeholder='{"key": "value"}'
                    disabled={createTenant.isPending}
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
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={createTenant.isPending}
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
              form="add-tenant-form"
              disabled={createTenant.isPending}
            >
              {createTenant.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
