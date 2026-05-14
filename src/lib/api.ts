const BASE_URL = 'https://edu-brain-v1.runasp.net';

// In-memory token storage (never persist to localStorage for access token)
let accessToken: string | null = null;
let refreshTokenValue: string | null = null;
let tokenExpiration: number | null = null; // timestamp in ms
let refreshPromise: Promise<boolean> | null = null; // prevent concurrent refreshes

export function setTokens(access: string, refresh: string, expiresInSeconds: number) {
  accessToken = access;
  refreshTokenValue = refresh;
  tokenExpiration = Date.now() + expiresInSeconds * 1000;

  // Keep sessionStorage in sync so page reloads survive
  sessionStorage.setItem('edubrain_access', access);
  sessionStorage.setItem('edubrain_refresh', refresh);
  sessionStorage.setItem('edubrain_expiry', String(tokenExpiration));
}

export function clearTokens() {
  accessToken = null;
  refreshTokenValue = null;
  tokenExpiration = null;
  refreshPromise = null;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshTokenValue;
}

export function isTokenExpiringSoon(bufferMinutes = 5): boolean {
  if (!tokenExpiration) return true;
  return Date.now() >= tokenExpiration - bufferMinutes * 60 * 1000;
}

/**
 * Attempt to refresh the access token using the stored refresh token.
 * Returns true if successful, false otherwise. Uses a shared promise
 * to prevent concurrent refresh calls.
 */
export async function refreshTokens(): Promise<boolean> {
  if (!refreshTokenValue || !accessToken) return false;

  // If a refresh is already in-flight, wait for it
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken, refreshToken: refreshTokenValue }),
      });
      const data = await response.json();
      if (data?.isSuccess && data?.hasData && data.data) {
        const d = data.data;
        setTokens(d.token, d.refreshToken, d.expiresIn);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  hasData: boolean;
  data?: T;
  statusCode?: number;
  error?: {
    code: string;
    description: string;
  };
}

export async function apiFetch<T>(endpoint: string, options?: { method?: string; headers?: Record<string, string>; body?: string }): Promise<{ data: T; status: number }> {
  // Proactively refresh if token is about to expire
  if (accessToken && refreshTokenValue && isTokenExpiringSoon(2)) {
    await refreshTokens();
  }

  const url = `${BASE_URL}${endpoint}`;
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  // If we still got a 401 (e.g. proactive refresh didn't fire), try refresh once
  if (!response.ok && response.status === 401 && refreshTokenValue) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
      }
      const retryResponse = await fetch(url, {
        ...options,
        headers,
      });
      const retryData = await retryResponse.json().catch(() => null);
      return { data: retryData as T, status: retryResponse.status };
    } else {
      // Refresh failed — force logout
      clearTokens();
      sessionStorage.removeItem('edubrain_user');
      sessionStorage.removeItem('edubrain_access');
      sessionStorage.removeItem('edubrain_refresh');
      sessionStorage.removeItem('edubrain_expiry');
      window.dispatchEvent(new Event('auth:logout'));
    }
  }

  return { data: data as T, status: response.status };
}

export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: unknown) => apiFetch<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  put: <T>(endpoint: string, body: unknown) => apiFetch<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  delete: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'DELETE' }),
};