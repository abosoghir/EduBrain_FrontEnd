const BASE_URL = 'https://edu-brain-v1.runasp.net';

// In-memory token storage (never persist to localStorage for access token)
let accessToken: string | null = null;
let refreshTokenValue: string | null = null;
let tokenExpiration: number | null = null; // timestamp in ms

export function setTokens(access: string, refresh: string, expiresInSeconds: number) {
  accessToken = access;
  refreshTokenValue = refresh;
  tokenExpiration = Date.now() + expiresInSeconds * 1000;
}

export function clearTokens() {
  accessToken = null;
  refreshTokenValue = null;
  tokenExpiration = null;
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

  if (!response.ok && response.status === 401 && refreshTokenValue) {
    try {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, refreshToken: refreshTokenValue }),
      });
      const refreshData = await refreshResponse.json();
      if (refreshData?.isSuccess && refreshData?.hasData) {
        const d = refreshData.data;
        setTokens(d.token, d.refreshToken, d.expiresIn);
        headers.Authorization = `Bearer ${d.token}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
        });
        const retryData = await retryResponse.json().catch(() => null);
        return { data: retryData as T, status: retryResponse.status };
      }
    } catch {
      clearTokens();
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