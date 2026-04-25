const STORAGE_KEY = 'atlas_tenant_id';

/**
 * Current tenant ID for API requests (X-Tenant-ID).
 * Set from login/me when user has a tenant; clear on logout.
 * Restored from sessionStorage so the first /me request (e.g. on reload) includes the header.
 */
let currentTenantId: number | null = null;

function readStored(): number | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw == null || raw === '') return null;
    const n = Number.parseInt(raw, 10);
    return Number.isNaN(n) ? null : n;
  }
  catch {
    return null;
  }
}

function writeStored(id: number | null): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    if (id == null) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    else {
      sessionStorage.setItem(STORAGE_KEY, String(id));
    }
  }
  catch {
    // ignore
  }
}

export function getCurrentTenantId(): number | null {
  if (currentTenantId != null) return currentTenantId;
  const stored = readStored();
  if (stored != null) {
    currentTenantId = stored;
    return stored;
  }
  return null;
}

export function setCurrentTenantId(id: number | null): void {
  currentTenantId = id;
  writeStored(id);
}
