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
  CreateStudentResponse,
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
): Promise<{ data: CreateStudentResponse | null; error?: string }> {
  try {
    const res = await api.post<ApiResponse<CreateStudentResponse>>('/api/users/students', form);
    const d = res.data as ApiResponse<CreateStudentResponse>;
    // Handle the { success, message, data } response shape
    const raw = res.data as unknown as { success?: boolean; data?: CreateStudentResponse; message?: string };
    if (raw?.success && raw.data) {
      return { data: raw.data };
    }
    if (d?.isSuccess && d?.hasData && d.data) {
      return { data: d.data };
    }
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to create student' };
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
    const res = await api.get<ApiResponse<DepartmentOption[]>>('/api/admin/departments');
    const data = unwrap(res);
    if (data && Array.isArray(data)) return data;
    // Try direct
    const raw = res.data as unknown as DepartmentOption[];
    if (Array.isArray(raw)) return raw;
    return [];
  } catch {
    return [];
  }
}

export async function fetchAdvisors(): Promise<AdvisorOption[]> {
  try {
    const res = await api.get<ApiResponse<AdvisorOption[]>>('/admin/users/advisors');
    const data = unwrap(res);
    if (data && Array.isArray(data)) return data;
    const raw = res.data as unknown as AdvisorOption[];
    if (Array.isArray(raw)) return raw;
    return [];
  } catch {
    return [];
  }
}
