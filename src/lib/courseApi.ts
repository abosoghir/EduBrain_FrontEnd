// ============================================================
// Course Management API Service
// ============================================================

import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type {
  CourseListItem,
  CourseDetail,
  CreateCourseForm,
  UpdateCourseForm,
  CreateCourseInstanceForCourseForm,
  DepartmentOption,
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

/** List response: { data: [...] } or ApiResponse */
export async function fetchCourses(params: {
  departmentId?: number;
  courseType?: number;
  search?: string;
} = {}): Promise<{ data: CourseListItem[]; error?: string }> {
  try {
    const qs = buildQueryString({
      departmentId: params.departmentId,
      courseType: params.courseType,
      search: params.search,
    });
    const res = await api.get<unknown>(`/api/admin/courses${qs}`);
    const raw = res.data as { data?: CourseListItem[] } & ApiResponse<CourseListItem[]>;
    if (raw && 'data' in raw && Array.isArray(raw.data)) return { data: raw.data };
    if (raw && 'isSuccess' in raw && raw.isSuccess && raw.hasData && Array.isArray(raw.data)) return { data: raw.data };
    if (Array.isArray(res.data)) return { data: res.data as CourseListItem[] };
    return { data: [], error: getErrorMessage(res) };
  } catch {
    return { data: [], error: 'Failed to fetch courses' };
  }
}

export async function fetchCourseDetail(
  id: number
): Promise<{ data: CourseDetail | null; error?: string }> {
  try {
    const res = await api.get<unknown>(`/api/admin/courses/${id}`);
    const raw = res.data as any;
    if (raw && typeof raw === 'object' && 'prerequisites' in raw) return { data: raw as CourseDetail };
    if (raw && 'isSuccess' in raw && raw.isSuccess && raw.data) return { data: raw.data as CourseDetail };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch course details' };
  }
}

export async function createCourse(
  form: CreateCourseForm
): Promise<{ id: number | null; error?: string }> {
  try {
    const res = await api.post<unknown>('/api/admin/courses', form);
    const raw = res.data as { success?: boolean; data?: { id: number } } & ApiResponse<{ id: number }>;
    if (raw?.success && raw.data) return { id: (raw.data as { id: number }).id };
    if (raw && 'isSuccess' in raw && raw.isSuccess && raw.data) return { id: (raw.data as unknown as { id: number }).id };
    return { id: null, error: getErrorMessage(res) };
  } catch {
    return { id: null, error: 'Failed to create course' };
  }
}

export async function updateCourse(
  id: number,
  form: UpdateCourseForm
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<unknown>(`/api/admin/courses/${id}`, form);
    const raw = res.data as { success?: boolean } & ApiResponse<boolean>;
    if (raw?.success) return { success: true };
    if (raw && 'isSuccess' in raw && raw.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to update course' };
  }
}

export async function deleteCourse(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<unknown>(`/api/admin/courses/${id}`);
    const raw = res.data as { success?: boolean } & ApiResponse<boolean>;
    if (raw?.success) return { success: true };
    if (raw && 'isSuccess' in raw && raw.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to delete course' };
  }
}

export async function addPrerequisite(
  courseId: number,
  prerequisiteCourseId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.post<unknown>(`/api/admin/courses/${courseId}/prerequisites`, { prerequisiteCourseId });
    const raw = res.data as { success?: boolean } & ApiResponse<boolean>;
    if (raw?.success) return { success: true };
    if (raw && 'isSuccess' in raw && raw.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to add prerequisite' };
  }
}

export async function removePrerequisite(
  courseId: number,
  prerequisiteCourseId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<unknown>(`/api/admin/courses/${courseId}/prerequisites/${prerequisiteCourseId}`);
    const raw = res.data as { success?: boolean } & ApiResponse<boolean>;
    if (raw?.success) return { success: true };
    if (raw && 'isSuccess' in raw && raw.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to remove prerequisite' };
  }
}

export async function createCourseInstance(
  courseId: number,
  form: CreateCourseInstanceForCourseForm
): Promise<{ id: number | null; error?: string }> {
  try {
    const res = await api.post<unknown>(`/api/admin/courses/${courseId}/instances`, form);
    const raw = res.data as { success?: boolean; data?: { id: number } } & ApiResponse<{ id: number }>;
    if (raw?.success && raw.data) return { id: (raw.data as { id: number }).id };
    if (raw && 'isSuccess' in raw && raw.isSuccess && raw.data) return { id: (raw.data as unknown as { id: number }).id };
    return { id: null, error: getErrorMessage(res) };
  } catch {
    return { id: null, error: 'Failed to create course instance' };
  }
}

export async function deleteCourseInstance(
  instanceId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<unknown>(`/api/admin/courses/instances/${instanceId}`);
    const raw = res.data as { success?: boolean } & ApiResponse<boolean>;
    if (raw?.success) return { success: true };
    if (raw && 'isSuccess' in raw && raw.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to delete course instance' };
  }
}

export async function fetchDepartments(): Promise<DepartmentOption[]> {
  try {
    type DeptRaw = { id: number; description?: string; name?: string };
    const res = await api.get<ApiResponse<DeptRaw[]>>('/api/admin/departments');
    const raw = res.data as { data?: DeptRaw[] } & ApiResponse<DeptRaw[]>;
    
    let items: DeptRaw[] = [];
    if (raw && 'data' in raw && Array.isArray(raw.data)) items = raw.data;
    else if (raw && 'isSuccess' in raw && raw.isSuccess && Array.isArray(raw.data)) items = raw.data;
    else if (Array.isArray(res.data)) items = res.data as DeptRaw[];

    return items.map(d => ({
      id: d.id,
      name: d.description ?? d.name ?? String(d.id)
    }));
  } catch { return []; }
}
