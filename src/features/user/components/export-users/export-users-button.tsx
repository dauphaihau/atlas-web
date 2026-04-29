'use client';

import { useState } from 'react';
import { Button } from '@atlas/ui/button';
import { DownloadIcon } from 'lucide-react';
import { ExportUsersDialog } from './export-users-dialog';

export function ExportUsersButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <DownloadIcon className="size-4" />
        Export CSV
      </Button>
      <ExportUsersDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
