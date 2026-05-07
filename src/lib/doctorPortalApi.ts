// ============================================================
// Doctor Portal API Service
// Base URL: /api/doctor  |  Role: Doctor only
// ============================================================

import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type {
  DoctorDashboardData,
  DoctorCoursesResponse,
  DoctorCourseStudentsResponse,
  DoctorCourseMaterialsResponse,
  CreateMaterialForm,
  DoctorCourseDetail,
  DoctorScheduleData,
  DoctorAttendanceSession,
  RecordAttendanceRequest,
  DoctorAttendanceSummary,
  DoctorGradesData,
  SubmitGradesRequest,
  DoctorAnnouncementsResponse,
  CreateAnnouncementRequest,
  CreateAnnouncementResponse,
  DoctorProfile,
} from '@/types/doctor';

// ---- Helpers ----

function buildQS(params: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

function unwrap<T>(res: { data: unknown }): T | null {
  const d = res.data as ApiResponse<T>;
  if (d && typeof d === 'object' && 'isSuccess' in d) {
    if (d.isSuccess && d.data !== undefined && d.data !== null) return d.data;
    return null;
  }
  // Direct shape (success: true / data: {...})
  const raw = res.data as Record<string, unknown>;
  if (raw?.['success'] && raw['data'] !== undefined) return raw['data'] as T;
  return res.data as T;
}

function errMsg(res: { data: unknown }): string {
  const d = res.data as ApiResponse<unknown>;
  if (d && typeof d === 'object' && 'error' in d && d.error) {
    return d.error.description || 'Operation failed';
  }
  return 'Operation failed';
}

// ============================================================
// 1. Dashboard
// ============================================================

export async function fetchDoctorDashboard(): Promise<{
  data: DoctorDashboardData | null;
  error?: string;
}> {
  try {
    const res = await api.get<unknown>('/api/doctor/dashboard');
    const data = unwrap<DoctorDashboardData>(res);
    if (data) return { data };
    return { data: null, error: errMsg(res) };
  } catch {
    return { data: null, error: 'Failed to load dashboard' };
  }
}

// ============================================================
// 2. My Courses
// ============================================================

export async function fetchDoctorCourses(semesterId?: number): Promise<{
  data: DoctorCoursesResponse | null;
  error?: string;
}> {
  try {
    const qs = buildQS({ semesterId });
    const res = await api.get<unknown>(`/api/doctor/courses${qs}`);
    const data = unwrap<DoctorCoursesResponse>(res);
    if (data) return { data };
    return { data: null, error: errMsg(res) };
  } catch {
    return { data: null, error: 'Failed to load courses' };
  }
}

// ============================================================
// 3. Course Students
// ============================================================

export async function fetchCourseStudents(
  courseInstanceId: number,
  search?: string
): Promise<{ data: DoctorCourseStudentsResponse | null; error?: string }> {
  try {
    const qs = buildQS({ search });
    const res = await api.get<unknown>(
      `/api/doctor/courses/${courseInstanceId}/students${qs}`
    );
    const data = unwrap<DoctorCourseStudentsResponse>(res);
    if (data) return { data };
    return { data: null, error: errMsg(res) };
  } catch {
    return { data: null, error: 'Failed to load students' };
  }
}

export async function exportCourseStudents(
  courseInstanceId: number,
  format: 'excel' | 'csv' = 'excel'
): Promise<void> {
  const url = `/api/doctor/courses/${courseInstanceId}/students/export?format=${format}`;
  window.open(url, '_blank');
}

// ============================================================
// 4. Course Materials
// ============================================================

export async function fetchCourseMaterials(
  courseInstanceId: number
): Promise<{ data: DoctorCourseMaterialsResponse | null; error?: string }> {
  try {
    const res = await api.get<unknown>(
      `/api/doctor/courses/${courseInstanceId}/materials`
    );
    const data = unwrap<DoctorCourseMaterialsResponse>(res);
    if (data) return { data };
    return { data: null, error: errMsg(res) };
  } catch {
    return { data: null, error: 'Failed to load materials' };
  }
}

export async function createCourseMaterial(
  courseInstanceId: number,
  form: CreateMaterialForm
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.post<unknown>(
      `/api/doctor/courses/${courseInstanceId}/materials`,
      form
    );
    const raw = res.data as Record<string, unknown>;
    if (raw?.['success'] || (res.data as ApiResponse<unknown>)?.isSuccess) {
      return { success: true };
    }
    return { success: false, error: errMsg(res) };
  } catch {
    return { success: false, error: 'Failed to create material' };
  }
}

export async function deleteCourseMaterial(
  materialId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<unknown>(`/api/doctor/materials/${materialId}`);
    const raw = res.data as Record<string, unknown>;
    if (raw?.['success'] || (res.data as ApiResponse<unknown>)?.isSuccess) {
      return { success: true };
    }
    return { success: false, error: errMsg(res) };
  } catch {
    return { success: false, error: 'Failed to delete material' };
  }
}

export async function fetchDoctorCourseDetail(
  courseInstanceId: number
): Promise<{ data: DoctorCourseDetail | null; error?: string }> {
  try {
    // There is no single-course endpoint; derive from the courses list
    const res = await fetchDoctorCourses();
    if (res.data) {
      const match = res.data.courses.find(c => c.courseInstanceId === courseInstanceId);
      if (match) {
        return {
          data: {
            courseInstanceId: match.courseInstanceId,
            courseCode: match.courseCode,
            courseName: match.courseName,
            creditHours: match.creditHours,
            semesterName: match.semesterName,
            enrolledCount: match.enrolledCount,
            maxCapacity: match.maxCapacity,
          },
        };
      }
    }
    return { data: null, error: 'Course not found' };
  } catch {
    return { data: null, error: 'Failed to load course details' };
  }
}

// ============================================================
// 6. Grades
// ============================================================

export async function fetchCourseGrades(
  courseInstanceId: number
): Promise<{ data: DoctorGradesData | null; error?: string }> {
  try {
    const res = await api.get<unknown>(
      `/api/doctor/courses/${courseInstanceId}/grades`
    );
    const data = unwrap<DoctorGradesData>(res);
    if (data) return { data };
    return { data: null, error: errMsg(res) };
  } catch {
    return { data: null, error: 'Failed to load grades' };
  }
}

export async function updateStudentGrades(
  enrollmentId: number,
  form: SubmitGradesRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<unknown>(
      `/api/doctor/enrollments/${enrollmentId}/grades`,
      form
    );
    const raw = res.data as Record<string, unknown>;
    if (raw?.['success'] || (res.data as ApiResponse<unknown>)?.isSuccess) {
      return { success: true };
    }
    return { success: false, error: errMsg(res) };
  } catch {
    return { success: false, error: 'Failed to update grades' };
  }
}

export async function exportCourseGrades(
  courseInstanceId: number,
  format: 'excel' | 'csv' = 'excel'
): Promise<void> {
  const url = `/api/doctor/courses/${courseInstanceId}/grades/export?format=${format}`;
  window.open(url, '_blank');
}

// ============================================================
// 7. Schedule
// ============================================================

export async function fetchDoctorSchedule(semesterId?: number): Promise<{
  data: DoctorScheduleData | null;
  error?: string;
}> {
  try {
    const qs = buildQS({ semesterId });
    const res = await api.get<unknown>(`/api/doctor/schedule${qs}`);
    const data = unwrap<DoctorScheduleData>(res);
    if (data) return { data };
    return { data: null, error: errMsg(res) };
  } catch {
    return { data: null, error: 'Failed to load schedule' };
  }
}

// ============================================================
// 8. Attendance
// ============================================================

export async function fetchAttendanceSession(
  courseInstanceId: number,
  date?: string
): Promise<{ data: DoctorAttendanceSession | null; error?: string }> {
  try {
    const qs = buildQS({ courseInstanceId, date });
    const res = await api.get<unknown>(`/api/doctor/attendance/sessions${qs}`);
    const data = unwrap<DoctorAttendanceSession>(res);
    if (data) return { data };
    return { data: null, error: errMsg(res) };
  } catch {
    return { data: null, error: 'Failed to load attendance session' };
  }
}

export async function submitAttendance(
  form: RecordAttendanceRequest
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await api.post<unknown>('/api/doctor/attendance', form);
    const raw = res.data as Record<string, unknown>;
    if (raw?.['success'] || (res.data as ApiResponse<unknown>)?.isSuccess) {
      return { success: true, message: raw?.['message'] as string | undefined };
    }
    return { success: false, error: errMsg(res) };
  } catch {
    return { success: false, error: 'Failed to save attendance' };
  }
}

export async function fetchAttendanceSummary(
  courseInstanceId: number
): Promise<{ data: DoctorAttendanceSummary | null; error?: string }> {
  try {
    const res = await api.get<unknown>(
      `/api/doctor/courses/${courseInstanceId}/attendance-summary`
    );
    const data = unwrap<DoctorAttendanceSummary>(res);
    if (data) return { data };
    return { data: null, error: errMsg(res) };
  } catch {
    return { data: null, error: 'Failed to load attendance summary' };
  }
}

export async function exportAttendanceReport(
  courseInstanceId: number,
  format: 'excel' | 'csv' = 'excel'
): Promise<void> {
  const url = `/api/doctor/courses/${courseInstanceId}/attendance-summary/export?format=${format}`;
  window.open(url, '_blank');
}

// ============================================================
// 9. Announcements
// ============================================================

export async function fetchDoctorAnnouncements(params?: {
  type?: number;
  page?: number;
  pageSize?: number;
}): Promise<{ data: DoctorAnnouncementsResponse | null; error?: string }> {
  try {
    const qs = buildQS(params ?? {});
    const res = await api.get<unknown>(`/api/doctor/announcements${qs}`);
    const data = unwrap<DoctorAnnouncementsResponse>(res);
    if (data) return { data };
    return { data: null, error: errMsg(res) };
  } catch {
    return { data: null, error: 'Failed to load announcements' };
  }
}

export async function createAnnouncement(
  form: CreateAnnouncementRequest
): Promise<{ data: CreateAnnouncementResponse | null; error?: string }> {
  try {
    const res = await api.post<unknown>('/api/doctor/announcements', form);
    const data = unwrap<CreateAnnouncementResponse>(res);
    if (data) return { data };
    return { data: null, error: errMsg(res) };
  } catch {
    return { data: null, error: 'Failed to send announcement' };
  }
}

// ============================================================
// 10. Profile
// ============================================================

export async function fetchDoctorProfile(): Promise<{
  data: DoctorProfile | null;
  error?: string;
}> {
  try {
    const res = await api.get<unknown>('/api/doctor/profile');
    const data = unwrap<DoctorProfile>(res);
    if (data) return { data };
    return { data: null, error: errMsg(res) };
  } catch {
    return { data: null, error: 'Failed to load profile' };
  }
}

export async function updateDoctorProfile(form: {
  phoneNumber?: string;
  profilePictureUrl?: string;
  officeRoomId?: number | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<unknown>('/api/doctor/profile', form);
    const raw = res.data as Record<string, unknown>;
    if (raw?.['success'] || (res.data as ApiResponse<unknown>)?.isSuccess) {
      return { success: true };
    }
    return { success: false, error: errMsg(res) };
  } catch {
    return { success: false, error: 'Failed to update profile' };
  }
}
