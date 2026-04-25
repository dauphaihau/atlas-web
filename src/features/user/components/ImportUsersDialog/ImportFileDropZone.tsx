'use client';

import { useState } from 'react';
import {
  Field,
  FieldDescription,
  FieldLabel
} from '@atlas/ui/field';
import { cn } from '@/shared/lib/utils';
import { FileUpIcon } from 'lucide-react';

export interface ImportFileDropZoneProps {
  id: string
  labelId: string
  hintId: string
  constraintsId: string
  accept: string
  acceptedLabel: string
  disabled?: boolean
  onFileChange: (file: File | null) => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function ImportFileDropZone({
  id,
  labelId,
  hintId,
  constraintsId,
  accept,
  acceptedLabel,
  disabled = false,
  onFileChange,
  inputRef,
}: ImportFileDropZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileChange(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave() {
    setDragActive(false);
  }

  function handleZoneClick() {
    inputRef?.current?.click();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0] ?? null;
    onFileChange(chosen);
    e.target.value = '';
  }

  return (
    <Field>
      <FieldLabel id={labelId}>File</FieldLabel>
      <div
        role="button"
        tabIndex={0}
        aria-label="Drag and drop or choose file to upload"
        aria-describedby={`${hintId} ${constraintsId}`}
        onClick={handleZoneClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleZoneClick();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 bg-muted/30 hover:bg-muted/50'
        )}
      >
        <FileUpIcon className="size-10 text-muted-foreground" aria-hidden />
        <p className="text-center text-sm text-muted-foreground">
          Drag and drop or{' '}
          <span className="font-medium text-foreground">choose file</span> to
          upload
        </p>
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={`${hintId} ${constraintsId}`}
      />
      <div id={hintId} className="sr-only">
        Accepted file types: {acceptedLabel} Max. size: 10MB.
      </div>
      <FieldDescription
        id={constraintsId}
        className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs"
      >
        <span>Accepted file types: {acceptedLabel}</span>
        <span>Max. size: 10MB</span>
      </FieldDescription>
    </Field>
  );
}
