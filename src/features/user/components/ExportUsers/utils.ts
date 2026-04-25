import type { DatePreset, ApiError } from './types';

export function getLocalTzName(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getLocalTzLabel(): string {
  const offsetMin = -new Date().getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const absMin = Math.abs(offsetMin);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  const short = m === 0 ? `${sign}${h}` : `${sign}${h}:${String(m).padStart(2, '0')}`;
  const long = `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return `GMT${short} (UTC${long})`;
}

function getPartsInTz(
  date: Date,
  tzName: string
): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: tzName,
  }).formatToParts(date);
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)!.value, 10);
  return { year: get('year'), month: get('month'), day: get('day') };
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDisplayDate(isoDate: string, tzName: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: tzName,
  }).format(date);
}

export function computePresetRange(
  preset: DatePreset,
  tzName: string
): { from: string | null; to: string | null } {
  if (preset === 'all' || preset === 'custom') return { from: null, to: null };

  const now = new Date();
  const { year, month, day } = getPartsInTz(now, tzName);
  const today = toIsoDate(year, month, day);

  if (preset === 'today') return { from: today, to: today };

  if (preset === 'current_month') {
    return { from: toIsoDate(year, month, 1), to: today };
  }

  if (preset === 'last_7_days') {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    const p = getPartsInTz(d, tzName);
    return { from: toIsoDate(p.year, p.month, p.day), to: today };
  }

  if (preset === 'last_4_weeks') {
    const d = new Date(now);
    d.setDate(d.getDate() - 27);
    const p = getPartsInTz(d, tzName);
    return { from: toIsoDate(p.year, p.month, p.day), to: today };
  }

  if (preset === 'last_month') {
    const firstOfThisMonth = new Date(year, month - 1, 1, 12, 0, 0);
    const lastOfPrevMonth = new Date(firstOfThisMonth.getTime() - (24 * 60 * 60 * 1000));
    const firstOfPrevMonth = new Date(
      lastOfPrevMonth.getFullYear(),
      lastOfPrevMonth.getMonth(),
      1,
      12,
      0,
      0
    );
    const fp = getPartsInTz(firstOfPrevMonth, tzName);
    const lp = getPartsInTz(lastOfPrevMonth, tzName);
    return {
      from: toIsoDate(fp.year, fp.month, fp.day),
      to: toIsoDate(lp.year, lp.month, lp.day),
    };
  }

  return { from: null, to: null };
}

export function getRangeLabel(
  preset: DatePreset,
  tzName: string
): string {
  if (preset === 'all' || preset === 'custom') return '';
  const { from, to } = computePresetRange(preset, tzName);
  if (!from) return '';
  if (from === to) return formatDisplayDate(from, tzName);
  return `${formatDisplayDate(from, tzName)}–${formatDisplayDate(to!, tzName)}`;
}

export function getExportErrorMessage(err: ApiError | undefined): string | null {
  if (!err) return null;
  const bodyMsg = Array.isArray(err.body?.message)
    ? err.body.message.join(', ')
    : err.body?.message;
  return err.message ?? bodyMsg ?? null;
}
