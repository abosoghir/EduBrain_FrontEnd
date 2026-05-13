import { api } from './api';
import type { ApiResponse } from './api';
import type {
  RegistrationStatusData,
  AvailableCourse,
  RegisteredCoursesData,
  BatchValidationResult,
  SubmitRegistrationResponse,
} from '@/types/student';

// --- Unwrap helpers (same pattern as existing API modules) ---

function unwrap<T>(res: { data: ApiResponse<T> | T }): T | null {
  const d = res.data as ApiResponse<T>;
  if (d && typeof d === 'object' && 'isSuccess' in d) {
    if (d.isSuccess && d.hasData && d.data !== undefined) return d.data;
    return null;
  }
  return res.data as T;
}

function getErrorMessage(res: { data: unknown }): string {
  const d = res.data as ApiResponse<unknown>;
  if (d && typeof d === 'object' && 'error' in d && d.error) return d.error.description || 'Operation failed';
  return 'Operation failed';
}

// --- Registration Status ---

export async function fetchRegistrationStatus(): Promise<RegistrationStatusData | null> {
  const res = await api.get<ApiResponse<RegistrationStatusData>>('/api/student/registration/status');
  return unwrap(res);
}

// --- Available Courses (smart filtered) ---

export interface AvailableCoursesParams {
  departmentId?: number;
  electiveOnly?: boolean;
}

export async function fetchAvailableCourses(params?: AvailableCoursesParams): Promise<AvailableCourse[]> {
  const parts: string[] = [];
  if (params?.departmentId) parts.push(`departmentId=${params.departmentId}`);
  if (params?.electiveOnly) parts.push('electiveOnly=true');
  const qs = parts.length > 0 ? `?${parts.join('&')}` : '';
  const res = await api.get<ApiResponse<{ courses: AvailableCourse[] }>>(`/api/student/registration/available-courses${qs}`);
  const data = unwrap(res);
  return data?.courses ?? [];
}

// --- My Registered Courses ---

export async function fetchRegisteredCourses(): Promise<RegisteredCoursesData | null> {
  const res = await api.get<ApiResponse<RegisteredCoursesData>>('/api/student/registration/my-courses');
  return unwrap(res);
}

// --- Batch Validation (read-only) ---

export async function validateBatch(courseInstanceIds: number[]): Promise<BatchValidationResult> {
  const res = await api.post<ApiResponse<BatchValidationResult>>('/api/student/registration/validate-batch', { courseInstanceIds });
  const data = unwrap(res);
  if (!data) throw new Error(getErrorMessage(res));
  return data;
}

// --- Batch Submit (atomic registration) ---

export async function submitRegistration(courseInstanceIds: number[]): Promise<SubmitRegistrationResponse> {
  const res = await api.post<ApiResponse<SubmitRegistrationResponse>>('/api/student/registration/submit', { courseInstanceIds });
  const data = unwrap(res);
  if (!data) throw new Error(getErrorMessage(res));
  return data;
}

// --- Single Course Registration (existing endpoint — kept for backward compatibility) ---

export async function registerSingleCourse(courseInstanceId: number): Promise<{ enrollmentId: number; status: number; message: string }> {
  const res = await api.post<ApiResponse<{ enrollmentId: number; status: number; message: string }>>('/api/student/registration/register', { courseInstanceId });
  const data = unwrap(res);
  if (!data) throw new Error(getErrorMessage(res));
  return data;
}

// --- Drop Course (existing endpoint) ---

export async function dropCourse(enrollmentId: number): Promise<{ enrollmentId: number; message: string }> {
  const res = await api.delete<ApiResponse<{ enrollmentId: number; message: string }>>(`/api/student/registration/drop/${enrollmentId}`);
  const data = unwrap(res);
  if (!data) throw new Error(getErrorMessage(res));
  return data;
}
