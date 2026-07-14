import { useAuthStore } from '@/store/use-auth-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  skipAuth?: boolean;
  /** Internal: prevents infinite refresh loops. */
  _retried?: boolean;
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        const json = (await res.json()) as Envelope<{ accessToken: string; refreshToken: string }>;
        if (!res.ok || !json.data) return null;
        useAuthStore.getState().setSession({
          accessToken: json.data.accessToken,
          refreshToken: json.data.refreshToken,
          user: useAuthStore.getState().user ?? { id: '', email: '', role: 'STUDENT' },
        });
        return json.data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, skipAuth = false, _retried = false } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const accessToken = useAuthStore.getState().accessToken;
  if (!skipAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !skipAuth && !_retried) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiRequest<T>(path, { ...options, _retried: true });
    }
    useAuthStore.getState().clear();
    throw new ApiError('AUTH_REQUIRED', 'Session expired. Please log in again.', 401);
  }

  const json = (await res.json().catch(() => null)) as Envelope<T> | null;

  if (!res.ok || !json || json.success === false) {
    throw new ApiError(
      json?.error?.code ?? 'SERVER_ERROR',
      json?.error?.message ?? `Request failed with status ${res.status}`,
      res.status,
    );
  }

  return json.data as T;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'PATCH', body }),
};
