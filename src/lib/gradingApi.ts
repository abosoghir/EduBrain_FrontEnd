// ============================================================
// Grading Management API Service
// ============================================================

import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type {
  CourseEnrollmentsData,
  SetGradeForm,
  SetGradeResponse,
  AcademicRecordData,
} from '@/types/admin';

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

// GET /api/grading/course-instances/{courseInstanceId}/enrollments
export async function fetchCourseEnrollments(
  courseInstanceId: number
): Promise<{ data: CourseEnrollmentsData | null; error?: string }> {
  try {
    const res = await api.get<ApiResponse<CourseEnrollmentsData>>(`/api/grading/course-instances/${courseInstanceId}/enrollments`);
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch course enrollments' };
  }
}

// GET /api/students/{studentId}/academic-record
export async function fetchAcademicRecord(
  studentId: number
): Promise<{ data: AcademicRecordData | null; error?: string }> {
  try {
    const res = await api.get<ApiResponse<AcademicRecordData>>(`/api/students/${studentId}/academic-record`);
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch academic record' };
  }
}

// PUT /api/grading/enrollments/{enrollmentId}/grades
export async function setStudentGrade(
  enrollmentId: number,
  form: SetGradeForm
): Promise<{ data: SetGradeResponse | null; error?: string }> {
  try {
    const res = await api.put<ApiResponse<SetGradeResponse>>(`/api/grading/enrollments/${enrollmentId}/grades`, form);
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to set grade' };
  }
}
