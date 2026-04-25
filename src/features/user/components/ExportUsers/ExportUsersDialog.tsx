'use client';

import { useState } from 'react';
import { Button } from '@atlas/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@atlas/ui/dialog';
import { useExportUsersMutation } from '@/shared/queries/user';
import type { ExportUsersField } from '@/shared/api/user/dto';
import { ALL_FIELDS, DATE_PRESETS, FIELD_LABELS } from './constants';
import type { ApiError, DatePreset, Timezone } from './types';
import {
  computePresetRange,
  getExportErrorMessage,
  getLocalTzLabel,
  getLocalTzName,
  getRangeLabel
} from './utils';

type ExportUsersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExportUsersDialog({ open, onOpenChange }: ExportUsersDialogProps) {
  const [timezone, setTimezone] = useState<Timezone>('local');
  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [selectedFields, setSelectedFields] = useState<Set<ExportUsersField>>(
    new Set(ALL_FIELDS)
  );

  const exportUsers = useExportUsersMutation();

  const tzName = timezone === 'utc' ? 'UTC' : getLocalTzName();
  const localTzLabel = getLocalTzLabel();

  const toggleField = (field: ExportUsersField) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        if (next.size === 1) return prev;
        next.delete(field);
      }
      else {
        next.add(field);
      }
      return next;
    });
  };

  const handleExport = () => {
    const range =
      datePreset === 'custom'
        ? { from: customFrom || null, to: customTo || null }
        : computePresetRange(datePreset, tzName);

    const allSelected = selectedFields.size === ALL_FIELDS.length;

    exportUsers.mutate(
      {
        date_from: range.from ?? undefined,
        date_to: range.to ?? undefined,
        fields: allSelected ? undefined : (Array.from(selectedFields) as ExportUsersField[]),
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const handleDialogChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) exportUsers.reset();
  };

  const exportError = getExportErrorMessage(exportUsers.error as ApiError | undefined);

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <DialogTitle>Export users</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-6 overflow-y-auto px-6 py-5">
          <section className="flex flex-col gap-2.5">
            <p className="text-sm font-medium">Time zone</p>
            <div className="flex items-center gap-8">
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <input
                  type="radio"
                  name="export-tz"
                  checked={timezone === 'local'}
                  onChange={() => setTimezone('local')}
                  className="accent-primary size-4"
                />
                <span className="text-sm">{localTzLabel}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <input
                  type="radio"
                  name="export-tz"
                  checked={timezone === 'utc'}
                  onChange={() => setTimezone('utc')}
                  className="accent-primary size-4"
                />
                <span className="text-sm">UTC</span>
              </label>
            </div>
          </section>

          <section className="flex flex-col gap-2.5">
            <p className="text-sm font-medium">Date range</p>
            <div className="flex flex-col gap-2">
              {DATE_PRESETS.map(({ value, label }) => {
                const rangeLabel = getRangeLabel(value, tzName);
                return (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 select-none"
                  >
                    <input
                      type="radio"
                      name="export-date-preset"
                      checked={datePreset === value}
                      onChange={() => setDatePreset(value)}
                      className="accent-primary size-4 shrink-0"
                    />
                    <span className="flex-1 text-sm">{label}</span>
                    {rangeLabel && (
                      <span className="text-muted-foreground text-sm tabular-nums">
                        {rangeLabel}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {datePreset === 'custom' && (
              <div className="mt-1 ml-6 flex items-center gap-2">
                <input
                  type="date"
                  value={customFrom}
                  max={customTo || undefined}
                  onChange={(event) => setCustomFrom(event.target.value)}
                  className="border-input bg-transparent text-foreground rounded-md border px-2 py-1 text-sm"
                />
                <span className="text-muted-foreground text-sm">–</span>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom || undefined}
                  onChange={(event) => setCustomTo(event.target.value)}
                  className="border-input bg-transparent text-foreground rounded-md border px-2 py-1 text-sm"
                />
              </div>
            )}
          </section>

          <section className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Columns</p>
              <span className="text-muted-foreground text-xs">
                {selectedFields.size} of {ALL_FIELDS.length} selected
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {ALL_FIELDS.map((field) => (
                <label
                  key={field}
                  className="flex cursor-pointer items-center gap-2 select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.has(field)}
                    onChange={() => toggleField(field)}
                    className="accent-primary size-4"
                  />
                  <span className="text-sm">{FIELD_LABELS[field]}</span>
                </label>
              ))}
            </div>
          </section>

          {exportError && (
            <p className="text-destructive text-sm" role="alert">
              {exportError}
            </p>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <DialogClose>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleExport}
            disabled={exportUsers.isPending || selectedFields.size === 0}
          >
            {exportUsers.isPending ? 'Exporting…' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
