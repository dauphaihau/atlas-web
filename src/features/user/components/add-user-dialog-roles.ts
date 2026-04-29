import type { AssignableRoleDto } from '@/shared/api/user';

export const addUserRoleValues = [
  'user',
  'viewer',
  'support',
  'admin',
  'tenant_owner',
] as const;

export type AddUserRoleValue = typeof addUserRoleValues[number];
export type AssignableRoleOption = AssignableRoleDto & { slug: AddUserRoleValue };

export function isAddUserRoleValue(value: string): value is AddUserRoleValue {
  return addUserRoleValues.includes(value as AddUserRoleValue);
}

export function isAssignableRoleOption(role: AssignableRoleDto): role is AssignableRoleOption {
  return isAddUserRoleValue(role.slug);
}
