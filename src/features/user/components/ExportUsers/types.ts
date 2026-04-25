export type DatePreset =
  | 'today'
  | 'current_month'
  | 'last_7_days'
  | 'last_4_weeks'
  | 'last_month'
  | 'all'
  | 'custom';

export type Timezone = 'local' | 'utc';

export type ApiError = { message?: string; body?: { message?: string | string[] } };
