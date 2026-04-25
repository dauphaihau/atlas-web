/**
 * Laravel Echo client for Reverb (WebSockets).
 * Private channel auth uses the same API base; auth is via server-set HttpOnly cookie (credentials: include).
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getCookie, getApiUrl } from '@/shared/lib/api-client';
import logger from '@/shared/lib/logger';

declare global {
  interface Window {
    Pusher?: typeof Pusher
  }
}

// Required for Laravel Echo to use Pusher protocol (Reverb)
if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
}

const REVERB_KEY = import.meta.env.VITE_REVERB_APP_KEY as string | undefined;
const REVERB_HOST = import.meta.env.VITE_REVERB_HOST as string | undefined;
const REVERB_PORT = import.meta.env.VITE_REVERB_PORT as string | undefined;
const REVERB_SCHEME = (import.meta.env.VITE_REVERB_SCHEME as string) ?? 'https';

let echoInstance: Echo<'reverb'> | null = null;
let echoConfigSignature: string | null = null;

const log = logger('echo');

/** True if Reverb env vars are set; use this to avoid creating Echo until needed. */
export function isEchoConfigured(): boolean {
  return Boolean(REVERB_KEY && REVERB_HOST);
}

function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const xsrf = getCookie('XSRF-TOKEN');
  if (xsrf) {
    try {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrf);
    }
    catch {
      headers['X-XSRF-TOKEN'] = xsrf;
    }
  }
  return headers;
}

/**
 * Returns a lazily-created Echo instance, or null if Reverb env vars are missing.
 * Auth uses credentials so the server-set HttpOnly cookie is sent to the broadcasting auth endpoint.
 */
export function getEcho(): Echo<'reverb'> | null {
  if (!isEchoConfigured()) {
    resetEcho();
    return null;
  }

  const authEndpoint = getApiUrl('broadcasting/auth');
  const nextSignature = JSON.stringify({
    key: REVERB_KEY,
    host: REVERB_HOST,
    port: REVERB_PORT ?? null,
    scheme: REVERB_SCHEME,
    authEndpoint,
  });

  if (echoInstance != null && echoConfigSignature === nextSignature) {
    return echoInstance;
  }

  if (echoInstance != null) {
    log.debug('echo config changed, resetting client', {
      authEndpoint,
    });
    resetEcho();
  }

  const options = {
    broadcaster: 'reverb' as const,
    key: REVERB_KEY,
    wsHost: REVERB_HOST,
    wsPort: REVERB_PORT ? Number(REVERB_PORT) : 80,
    wssPort: REVERB_PORT ? Number(REVERB_PORT) : 443,
    forceTLS: REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'] as const,
    authEndpoint,
    auth: { headers: {} },
    channelAuthorization: {
      endpoint: authEndpoint,
      transport: 'ajax' as const,
      headersProvider: buildAuthHeaders,
      customHandler: (
        { socketId, channelName }: { socketId: string; channelName: string },
        callback: (error: Error | null, data: Record<string, unknown> | null) => void
      ) => {
        const resolvedAuthEndpoint = getApiUrl('broadcasting/auth');
        fetch(resolvedAuthEndpoint, {
          method: 'POST',
          headers: buildAuthHeaders(),
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channelName,
          }),
          credentials: 'include',
        })
          .then(async (res) => {
            if (!res.ok) {
              callback(new Error(`Channel auth failed: ${res.status}`), null);
              return;
            }
            const data = (await res.json()) as Record<string, unknown>;
            callback(null, data);
          })
          .catch((error: unknown) => {
            callback(
              error instanceof Error ? error : new Error('Channel auth failed'),
              null
            );
          });
      },
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  echoInstance = new Echo(options as any);
  echoConfigSignature = nextSignature;
  return echoInstance;
}

export function resetEcho(): void {
  if (echoInstance == null) {
    echoConfigSignature = null;
    return;
  }

  try {
    echoInstance.disconnect();
  }
  finally {
    echoInstance = null;
    echoConfigSignature = null;
  }
}
