// ============================================================
// Schedules Management API Service
// Course Schedules + Exam Schedules
// ============================================================

import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type {
  PaginatedResponse,
  CourseScheduleItem,
  CourseScheduleFilterParams,
  CreateCourseScheduleForm,
  CreateCourseScheduleResponse,
  UpdateCourseScheduleForm,
  UpdateCourseScheduleResponse,
  ExamScheduleItem,
  ExamScheduleFilterParams,
  CreateExamScheduleForm,
  CreateExamScheduleResponse,
  UpdateExamScheduleForm,
  UpdateExamScheduleResponse,
  SemesterOption,
  DoctorOption,
  DepartmentOption,
  RoomOption,
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

function getErrorMessage(res: { data: unknown }): string {
  const d = res.data as ApiResponse<unknown>;
  if (d && typeof d === 'object' && 'error' in d && d.error) return d.error.description || 'Operation failed';
  // Handle direct { message } shape
  const raw = d as unknown as { message?: string };
  if (raw?.message) return raw.message;
  return 'Operation failed';
}

/** Unwrap ApiResponse<T> or direct T */
function unwrap<T>(res: { data: ApiResponse<T> | T }): T | null {
  const d = res.data as ApiResponse<T>;
  if (d && typeof d === 'object' && 'isSuccess' in d) {
    if (d.isSuccess && d.hasData && d.data !== undefined) return d.data;
    return null;
  }
  return res.data as T;
}

// ============================================================
// Course Schedules (GET /api/schedules)
// Response shape: { data: [...] } (non-paginated)
// ============================================================

export async function fetchCourseSchedules(
  params: CourseScheduleFilterParams = {}
): Promise<{ data: CourseScheduleItem[] | null; error?: string }> {
  try {
    const qs = buildQueryString({
      semesterId: params.semesterId,
      departmentId: params.departmentId,
      doctorId: params.doctorId,
      roomId: params.roomId,
      day: params.day,
    });
    const res = await api.get<unknown>(`/api/schedules${qs}`);
    // Response: { data: [...] } or ApiResponse<CourseScheduleItem[]>
    const raw = res.data as { data?: CourseScheduleItem[] } & ApiResponse<CourseScheduleItem[]>;
    if (raw && 'data' in raw && Array.isArray(raw.data)) return { data: raw.data };
    if (raw && 'isSuccess' in raw && raw.isSuccess && raw.hasData && Array.isArray(raw.data)) return { data: raw.data };
    if (Array.isArray(res.data)) return { data: res.data as CourseScheduleItem[] };
    return { data: [], error: getErrorMessage(res) };
  } catch {
    return { data: [], error: 'Failed to fetch course schedules' };
  }
}

export async function createCourseSchedule(
  form: CreateCourseScheduleForm
): Promise<{ data: CreateCourseScheduleResponse | null; error?: string }> {
  try {
    const res = await api.post<unknown>('/api/schedules', form);
    // Use Record<string, unknown> to prevent TS control-flow narrowing collapsing the type to `never`
    const raw = res.data as Record<string, unknown>;
    // Direct response shape (201)
    if (raw && 'scheduleId' in raw) return { data: raw as unknown as CreateCourseScheduleResponse };
    if (raw && 'isSuccess' in raw && raw['isSuccess'] && raw['data']) return { data: raw['data'] as unknown as CreateCourseScheduleResponse };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to create course schedule' };
  }
}

export async function updateCourseSchedule(
  scheduleId: number,
  form: UpdateCourseScheduleForm
): Promise<{ data: UpdateCourseScheduleResponse | null; error?: string }> {
  try {
    const res = await api.put<unknown>(`/api/schedules/${scheduleId}`, form);
    // Use Record<string, unknown> to prevent TS control-flow narrowing collapsing the type to `never`
    const raw = res.data as Record<string, unknown>;
    if (raw && 'scheduleId' in raw) return { data: raw as unknown as UpdateCourseScheduleResponse };
    if (raw && 'isSuccess' in raw && raw['isSuccess'] && raw['data']) return { data: raw['data'] as unknown as UpdateCourseScheduleResponse };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to update course schedule' };
  }
}

export async function deleteCourseSchedule(
  scheduleId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<unknown>(`/api/schedules/${scheduleId}`);
    const raw = res.data as { success?: boolean; message?: string } & ApiResponse<boolean>;
    if (raw?.success) return { success: true };
    if (raw && 'isSuccess' in raw && raw.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to delete course schedule' };
  }
}

// ============================================================
// Exam Schedules (GET /api/exam-schedules)
// Response shape: paginated { items, page, pageSize, totalCount, ... }
// ============================================================

export async function fetchExamSchedules(
  params: ExamScheduleFilterParams = {}
): Promise<{ data: PaginatedResponse<ExamScheduleItem> | null; error?: string }> {
  try {
    const qs = buildQueryString({
      semesterId: params.semesterId,
      departmentId: params.departmentId,
      courseInstanceId: params.courseInstanceId,
      startDate: params.startDate,
      endDate: params.endDate,
      examType: params.examType,
      isPublished: params.isPublished,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 50,
    });
    const res = await api.get<unknown>(`/api/exam-schedules${qs}`);
    // Direct paginated response or ApiResponse wrapped
    const raw = res.data as PaginatedResponse<ExamScheduleItem> & ApiResponse<PaginatedResponse<ExamScheduleItem>>;
    if (raw && 'items' in raw && Array.isArray(raw.items)) return { data: raw as PaginatedResponse<ExamScheduleItem> };
    if (raw && 'isSuccess' in raw && raw.isSuccess && raw.data) {
      const inner = raw.data as unknown as PaginatedResponse<ExamScheduleItem>;
      if (inner && Array.isArray(inner.items)) return { data: inner };
    }
    // Fallback: data wrapper
    const wrapped = res.data as { data?: PaginatedResponse<ExamScheduleItem> };
    if (wrapped?.data && Array.isArray(wrapped.data.items)) return { data: wrapped.data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch exam schedules' };
  }
}

export async function createExamSchedule(
  form: CreateExamScheduleForm
): Promise<{ data: CreateExamScheduleResponse | null; error?: string }> {
  try {
    const res = await api.post<unknown>('/api/exam-schedules', form);
    // Use Record<string, unknown> to prevent TS control-flow narrowing collapsing the type to `never`
    const raw = res.data as Record<string, unknown>;
    if (raw && 'examScheduleId' in raw) return { data: raw as unknown as CreateExamScheduleResponse };
    if (raw && 'isSuccess' in raw && raw['isSuccess'] && raw['data']) return { data: raw['data'] as unknown as CreateExamScheduleResponse };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to create exam schedule' };
  }
}

export async function updateExamSchedule(
  examScheduleId: number,
  form: UpdateExamScheduleForm
): Promise<{ data: UpdateExamScheduleResponse | null; error?: string }> {
  try {
    const res = await api.put<unknown>(`/api/exam-schedules/${examScheduleId}`, form);
    // Use Record<string, unknown> to prevent TS control-flow narrowing collapsing the type to `never`
    const raw = res.data as Record<string, unknown>;
    if (raw && 'examScheduleId' in raw) return { data: raw as unknown as UpdateExamScheduleResponse };
    if (raw && 'isSuccess' in raw && raw['isSuccess'] && raw['data']) return { data: raw['data'] as unknown as UpdateExamScheduleResponse };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to update exam schedule' };
  }
}

export async function deleteExamSchedule(
  examScheduleId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<unknown>(`/api/exam-schedules/${examScheduleId}`);
    const raw = res.data as { success?: boolean; message?: string } & ApiResponse<boolean>;
    if (raw?.success) return { success: true };
    if (raw && 'isSuccess' in raw && raw.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to delete exam schedule' };
  }
}

export async function publishExamSchedule(
  examScheduleId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.post<unknown>(`/api/exam-schedules/${examScheduleId}/publish`, {});
    const raw = res.data as { success?: boolean; isPublished?: boolean; message?: string } & ApiResponse<boolean>;
    if (raw?.success) return { success: true };
    if (raw && 'isSuccess' in raw && raw.isSuccess) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to publish exam schedule' };
  }
}

// ============================================================
// Dropdown Data Loaders
// ============================================================

export async function fetchSemesters(): Promise<SemesterOption[]> {
  try {
    const res = await api.get<unknown>('/api/admin/semesters');
    const raw = res.data as { data?: SemesterOption[] } & ApiResponse<SemesterOption[]>;
    if (raw && 'data' in raw && Array.isArray(raw.data)) return raw.data;
    if (raw && 'isSuccess' in raw && raw.isSuccess && Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(res.data)) return res.data as SemesterOption[];
    return [];
  } catch { return []; }
}

export async function fetchDoctorsDropdown(): Promise<DoctorOption[]> {
  try {
    const res = await api.get<unknown>('/api/doctors');
    const raw = res.data as { data?: DoctorOption[] } & ApiResponse<DoctorOption[]>;
    // Might be paginated { items: [...] } — extract items
    const paginated = res.data as { items?: DoctorOption[] };
    if (paginated && Array.isArray(paginated.items)) return paginated.items;
    if (raw && 'data' in raw && Array.isArray(raw.data)) return raw.data;
    if (raw && 'isSuccess' in raw && raw.isSuccess && Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(res.data)) return res.data as DoctorOption[];
    return [];
  } catch { return []; }
}

export async function fetchRoomsDropdown(): Promise<RoomOption[]> {
  try {
    const res = await api.get<unknown>('/api/admin/rooms');
    const raw = res.data as { data?: RoomOption[] } & ApiResponse<RoomOption[]>;
    if (raw && 'data' in raw && Array.isArray(raw.data)) return raw.data;
    if (raw && 'isSuccess' in raw && raw.isSuccess && Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(res.data)) return res.data as RoomOption[];
    return [];
  } catch { return []; }
}

export async function fetchDepartmentsDropdown(): Promise<DepartmentOption[]> {
  try {
    const res = await api.get<unknown>('/api/admin/departments');
    const raw = res.data as { data?: DepartmentOption[] } & ApiResponse<DepartmentOption[]>;
    if (raw && 'data' in raw && Array.isArray(raw.data)) return raw.data;
    if (raw && 'isSuccess' in raw && raw.isSuccess && Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(res.data)) return res.data as DepartmentOption[];
    return [];
  } catch { return []; }
}
