import { Controller, useWatch } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@atlas/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger
} from '@atlas/ui/select';
import type { AddUserFormValues } from './add-user-dialog-schema';
import type {
  AddUserRoleValue,
  AssignableRoleOption
} from './add-user-dialog-roles';

export function AddUserRoleSelectField({
  control,
  disabled,
  roles,
}: {
  control: UseFormReturn<AddUserFormValues>['control']
  disabled: boolean
  roles: AssignableRoleOption[]
}) {
  const selectedRole = useWatch({ control, name: 'role' });
  const selectedRoleOption = roles.find((role) => role.slug === selectedRole);

  return (
    <Controller
      name="role"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid ? '' : undefined}>
          <FieldLabel htmlFor="add-user-role">Role</FieldLabel>
          <Select
            value={field.value}
            onValueChange={(value: AddUserRoleValue | null) => {
              if (value != null) field.onChange(value);
            }}
            disabled={disabled}
          >
            <SelectTrigger
              id="add-user-role"
              aria-invalid={fieldState.invalid}
            >
              <span className={selectedRoleOption ? undefined : 'text-muted-foreground'}>
                {selectedRoleOption?.name ?? 'Select role'}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {roles.map((role) => (
                  <SelectItem key={role.slug} value={role.slug}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedRoleOption?.description && (
            <FieldDescription>{selectedRoleOption.description}</FieldDescription>
          )}
          {fieldState.invalid && (
            <FieldError errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  );
}
