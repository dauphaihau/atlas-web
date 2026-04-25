import type { ExportUsersField } from '@/shared/api/user/dto';
import type { DatePreset } from './types';

export const ALL_FIELDS: ExportUsersField[] = ['id', 'name', 'email', 'roles', 'created_at'];

export const FIELD_LABELS: Record<ExportUsersField, string> = {
  id: 'ID',
  name: 'Name',
  email: 'Email',
  roles: 'Roles',
  created_at: 'Created At',
};

export const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'current_month', label: 'Current month' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_4_weeks', label: 'Last 4 weeks' },
  { value: 'last_month', label: 'Last month' },
  { value: 'all', label: 'All' },
  { value: 'custom', label: 'Custom' },
];
