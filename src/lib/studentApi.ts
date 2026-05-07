// ============================================================
// Student Management API Service
// ============================================================

import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type {
  PaginatedResponse,
  StudentListItem,
  StudentListParams,
  StudentDetail,
  CreateStudentForm,
  UpdateStudentForm,
  UpdateStudentResponse,
  DepartmentOption,
  AdvisorOption,
} from '@/types/admin';

// ---- Helpers ----

function buildQueryString(params: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

/**
 * Unwrap the API response. The backend may wrap in ApiResponse<T> or return directly.
 * This helper handles both cases.
 */
function unwrap<T>(res: { data: ApiResponse<T> | T }): T | null {
  const d = res.data as ApiResponse<T>;
  if (d && typeof d === 'object' && 'isSuccess' in d) {
    // Wrapped in ApiResponse
    if (d.isSuccess && d.hasData && d.data !== undefined) {
      return d.data;
    }
    return null;
  }
  // Direct response
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
  if (d && typeof d === 'object' && 'error' in d && d.error) {
    return d.error.description || 'Operation failed';
  }
  return 'Operation failed';
}

// ---- API Functions ----

export async function fetchStudents(
  params: StudentListParams = {}
): Promise<{ data: PaginatedResponse<StudentListItem> | null; error?: string }> {
  try {
    const qs = buildQueryString({
      searchTerm: params.searchTerm,
      year: params.year,
      departmentId: params.departmentId,
      status: params.status,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    });
    const res = await api.get<ApiResponse<PaginatedResponse<StudentListItem>>>(`/api/students${qs}`);
    const data = unwrap(res);
    if (data) {
      return { data };
    }
    // Fallback: maybe the response IS the paginated object directly
    const raw = res.data as unknown as PaginatedResponse<StudentListItem>;
    if (raw && Array.isArray(raw.items)) {
      return { data: raw };
    }
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch students' };
  }
}

export async function fetchStudentDetail(
  studentId: number
): Promise<{ data: StudentDetail | null; error?: string }> {
  try {
    const res = await api.get<ApiResponse<StudentDetail>>(`/api/students/${studentId}`);
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch student details' };
  }
}

export async function createStudent(
  form: CreateStudentForm
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.post<unknown>('/api/users/students', form);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to create student' };
  }
}

export async function updateStudent(
  studentId: number,
  form: Partial<UpdateStudentForm>
): Promise<{ data: UpdateStudentResponse | null; error?: string }> {
  try {
    const res = await api.put<ApiResponse<UpdateStudentResponse>>(`/api/students/${studentId}`, form);
    const data = unwrap(res);
    if (data) return { data };
    // Also handle direct { studentId, fullName, email, message } shape
    const raw = res.data as unknown as UpdateStudentResponse;
    if (raw?.studentId && raw?.message) {
      return { data: raw };
    }
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to update student' };
  }
}

export async function deleteStudent(
  studentId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<ApiResponse<boolean>>(`/api/students/${studentId}`);
    const d = res.data as ApiResponse<boolean>;
    const raw = res.data as unknown as { success?: boolean; message?: string };
    if (raw?.success) return { success: true };
    if (d?.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to delete student' };
  }
}

export async function fetchDepartments(): Promise<DepartmentOption[]> {
  try {
    const res = await api.get<ApiResponse<{ id: number; description: string }[]>>('/api/admin/departments');
    const data = unwrap(res);
    if (data && Array.isArray(data)) {
      return data.map((d) => ({ id: d.id, name: d.description ?? d.id.toString() }));
    }
    // Try direct
    const raw = res.data as unknown as { id: number; description?: string; name?: string }[];
    if (Array.isArray(raw)) {
      return raw.map((d) => ({ id: d.id, name: d.description ?? d.name ?? '' }));
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchAdvisors(): Promise<AdvisorOption[]> {
  try {
    const res = await api.get<unknown>('/api/admin/users/advisors?pageSize=100');
    // The API wraps in ApiResponse<{ items: [...] }>
    const apiRes = res.data as ApiResponse<{ items: { id: number; fullName: string }[] }>;
    if (apiRes?.isSuccess && apiRes.data?.items) {
      return apiRes.data.items.map((a) => ({ id: a.id, fullName: a.fullName }));
    }
    // Fallback: maybe direct array
    const raw = res.data as unknown as AdvisorOption[];
    if (Array.isArray(raw)) return raw;
    return [];
  } catch {
    return [];
  }
}
