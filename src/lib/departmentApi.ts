// ============================================================
// Department Management API Service
// ============================================================

import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type {
  DepartmentListItem,
  DepartmentDetail,
  CreateDepartmentForm,
  UpdateDepartmentForm,
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

function getErrorMessage(res: { data: unknown }): string {
  const d = res.data as ApiResponse<unknown>;
  if (d && typeof d === 'object' && 'error' in d && d.error) return d.error.description || 'Operation failed';
  return 'Operation failed';
}

/** List response shape: { data: [...] } or ApiResponse<[...]> */
export async function fetchDepartments(params: {
  departmentType?: number;
  search?: string;
} = {}): Promise<{ data: DepartmentListItem[]; error?: string }> {
  try {
    const qs = buildQueryString({ departmentType: params.departmentType, search: params.search });
    const res = await api.get<unknown>(`/api/admin/departments${qs}`);
    const raw = res.data as { data?: DepartmentListItem[] } & ApiResponse<DepartmentListItem[]>;
    // Shape 1: { data: [...] }
    if (raw && 'data' in raw && Array.isArray(raw.data)) return { data: raw.data };
    // Shape 2: ApiResponse wrapper
    if (raw && 'isSuccess' in raw && raw.isSuccess && raw.hasData && Array.isArray(raw.data)) return { data: raw.data };
    // Shape 3: direct array
    if (Array.isArray(res.data)) return { data: res.data as DepartmentListItem[] };
    return { data: [], error: getErrorMessage(res) };
  } catch {
    return { data: [], error: 'Failed to fetch departments' };
  }
}

export async function fetchDepartmentDetail(
  id: number
): Promise<{ data: DepartmentDetail | null; error?: string }> {
  try {
    const res = await api.get<unknown>(`/api/admin/departments/${id}`);
    // Cast to unknown first to prevent TypeScript from narrowing to 'never'
    const raw = res.data as unknown as Record<string, unknown>;
    // ApiResponse wrapper shape
    if (raw && raw['isSuccess'] && raw['data']) return { data: raw['data'] as DepartmentDetail };
    // Direct response shape
    if (raw && typeof raw === 'object' && 'students' in raw) return { data: raw as unknown as DepartmentDetail };
    return { data: null, error: String(raw?.['error'] ?? 'Failed to fetch department details') };
  } catch {
    return { data: null, error: 'Failed to fetch department details' };
  }
}

export async function createDepartment(
  form: CreateDepartmentForm
): Promise<{ id: number | null; error?: string }> {
  try {
    const res = await api.post<unknown>('/api/admin/departments', form);
    const raw = res.data as { success?: boolean; data?: { id: number }; message?: string } & ApiResponse<{ id: number }>;
    if (raw?.success && raw.data) return { id: (raw.data as { id: number }).id };
    if (raw && 'isSuccess' in raw && raw.isSuccess && raw.data) return { id: (raw.data as unknown as { id: number }).id };
    return { id: null, error: getErrorMessage(res) };
  } catch {
    return { id: null, error: 'Failed to create department' };
  }
}

export async function updateDepartment(
  id: number,
  form: UpdateDepartmentForm
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<unknown>(`/api/admin/departments/${id}`, form);
    const raw = res.data as { success?: boolean } & ApiResponse<boolean>;
    if (raw?.success) return { success: true };
    if (raw && 'isSuccess' in raw && raw.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to update department' };
  }
}

export async function deleteDepartment(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<unknown>(`/api/admin/departments/${id}`);
    const raw = res.data as { success?: boolean } & ApiResponse<boolean>;
    if (raw?.success) return { success: true };
    if (raw && 'isSuccess' in raw && raw.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to delete department' };
  }
}

export async function setDepartmentHead(
  departmentId: number,
  doctorId: number | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<unknown>(`/api/admin/departments/${departmentId}/set-head`, { doctorId });
    const raw = res.data as { success?: boolean } & ApiResponse<boolean>;
    if (raw?.success) return { success: true };
    if (raw && 'isSuccess' in raw && raw.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to update department head' };
  }
}

export async function addCourseToDepartment(
  departmentId: number,
  courseId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.post<unknown>(`/api/admin/departments/${departmentId}/courses`, { courseId });
    const raw = res.data as { success?: boolean } & ApiResponse<boolean>;
    if (raw?.success) return { success: true };
    if (raw && 'isSuccess' in raw && raw.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to add course' };
  }
}

export async function removeCourseFromDepartment(
  departmentId: number,
  courseId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<unknown>(`/api/admin/departments/${departmentId}/courses/${courseId}`);
    const raw = res.data as { success?: boolean } & ApiResponse<boolean>;
    if (raw?.success) return { success: true };
    if (raw && 'isSuccess' in raw && raw.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to remove course' };
  }
}
