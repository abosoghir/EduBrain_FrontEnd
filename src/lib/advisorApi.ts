// ============================================================
// Advisor Management API Service
// ============================================================

import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type {
  PaginatedResponse,
  AdvisorListItem,
  AdvisorListParams,
  AdvisorDetail,
  CreateAdvisorForm,
  UpdateAdvisorForm,
  RoomOption,
} from '@/types/admin';

function buildQueryString(params: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

function unwrap<T>(res: { data: ApiResponse<T> | T }): T | null {
  const d = res.data as ApiResponse<T>;
  if (d && typeof d === 'object' && 'isSuccess' in d) {
    if (d.isSuccess && d.hasData && d.data !== undefined) return d.data;
    return null;
  }
  return res.data as T;
}

function isSuccess(res: { data: unknown }): boolean {
  const d = res.data as ApiResponse<unknown>;
  if (d && typeof d === 'object') {
    if ('isSuccess' in d) return !!d.isSuccess;
    if ('success' in d) return !!(d as { success?: boolean }).success;
  }
  return false;
}

function getErrorMessage(res: { data: unknown }): string {
  const d = res.data as ApiResponse<unknown>;
  if (d && typeof d === 'object' && 'error' in d && d.error) return d.error.description || 'Operation failed';
  return 'Operation failed';
}

export async function fetchAdvisors(
  params: AdvisorListParams = {}
): Promise<{ data: PaginatedResponse<AdvisorListItem> | null; error?: string }> {
  try {
    const qs = buildQueryString({
      searchTerm: params.searchTerm,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    });
    const res = await api.get<ApiResponse<PaginatedResponse<AdvisorListItem>>>(`/api/admin/users/advisors${qs}`);
    const data = unwrap(res);
    if (data) return { data };
    const raw = res.data as unknown as PaginatedResponse<AdvisorListItem>;
    if (raw && Array.isArray(raw.items)) return { data: raw };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch advisors' };
  }
}

export async function fetchAdvisorDetail(
  advisorId: number
): Promise<{ data: AdvisorDetail | null; error?: string }> {
  try {
    const res = await api.get<ApiResponse<AdvisorDetail>>(`/api/admin/users/advisors/${advisorId}`);
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch advisor details' };
  }
}

export async function createAdvisor(
  form: CreateAdvisorForm
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.post<unknown>('/api/admin/users/advisors', form);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to create advisor' };
  }
}

export async function updateAdvisor(
  advisorId: number,
  form: UpdateAdvisorForm
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<ApiResponse<boolean>>(`/api/admin/users/advisors/${advisorId}`, form);
    const raw = res.data as unknown as { success?: boolean; message?: string };
    if (raw?.success) return { success: true };
    const d = res.data as ApiResponse<boolean>;
    if (d?.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to update advisor' };
  }
}

export async function deleteAdvisor(
  advisorId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<ApiResponse<boolean>>(`/api/admin/users/advisors/${advisorId}`);
    const raw = res.data as unknown as { success?: boolean };
    if (raw?.success) return { success: true };
    const d = res.data as ApiResponse<boolean>;
    if (d?.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to delete advisor' };
  }
}

export async function fetchOfficeRooms(): Promise<RoomOption[]> {
  try {
    const res = await api.get<ApiResponse<RoomOption[]>>('/api/admin/rooms?roomType=0');
    const data = unwrap(res);
    if (data && Array.isArray(data)) return data;
    const raw = res.data as unknown as RoomOption[];
    if (Array.isArray(raw)) return raw;
    return [];
  } catch { return []; }
}
