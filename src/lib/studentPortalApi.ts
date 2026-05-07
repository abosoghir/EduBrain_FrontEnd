// ============================================================
// Student Portal API Service Layer
// Base URL: /api/student
// ============================================================

import { api } from './api';
import type {
  StudentDashboardData,
  StudentCoursesResponse,
  StudentCourseDetail,
  StudentCourseMaterialsResponse,
  CourseAttendanceDetail,
  StudentScheduleData,
  StudentGradesData,
  CourseGradesDetailed,
  GpaHistoryData,
  StudentAttendanceData,
  StudentExamData,
  StudentFeesData,
  StudentNotificationsData,
  StudentProfile,
  UpdateStudentProfileRequest,
  ChangeStudentPasswordRequest,
} from '@/types/student';

// ---- Helpers ----

interface ApiWrapper<T> {
  success?: boolean;
  isSuccess?: boolean;
  data?: T;
  message?: string;
}

function unwrap<T>(response: { data: ApiWrapper<T> }): T {
  const body = response.data;
  const isOk = body.success === true || body.isSuccess === true;
  if (!isOk || body.data === undefined) {
    throw new Error(body.message || 'Request failed');
  }
  return body.data;
}

// ---- Dashboard ----

export async function fetchStudentDashboard(): Promise<StudentDashboardData> {
  const res = await api.get<ApiWrapper<StudentDashboardData>>('/api/student/dashboard');
  return unwrap(res);
}

// ---- Registration ----
// Note: Registration APIs have been moved to studentRegistrationApi.ts

// ---- Courses ----

export async function fetchStudentCourses(semesterId?: number): Promise<StudentCoursesResponse> {
  const qs = semesterId !== undefined ? `?semesterId=${semesterId}` : '';
  const res = await api.get<ApiWrapper<StudentCoursesResponse>>(`/api/student/courses${qs}`);
  return unwrap(res);
}

export async function fetchStudentCourseDetail(courseInstanceId: number): Promise<StudentCourseDetail> {
  const res = await api.get<ApiWrapper<StudentCourseDetail>>(`/api/student/courses/${courseInstanceId}`);
  return unwrap(res);
}

export async function fetchStudentCourseMaterials(courseInstanceId: number): Promise<StudentCourseMaterialsResponse> {
  const res = await api.get<ApiWrapper<StudentCourseMaterialsResponse>>(
    `/api/student/courses/${courseInstanceId}/materials`
  );
  return unwrap(res);
}

export async function fetchCourseAttendanceDetail(courseInstanceId: number): Promise<CourseAttendanceDetail> {
  const res = await api.get<ApiWrapper<CourseAttendanceDetail>>(
    `/api/student/courses/${courseInstanceId}/attendance`
  );
  return unwrap(res);
}

// ---- Schedule ----

export async function fetchStudentSchedule(): Promise<StudentScheduleData> {
  const res = await api.get<ApiWrapper<StudentScheduleData>>('/api/student/schedule/weekly');
  return unwrap(res);
}

// ---- Grades ----

export async function fetchStudentGrades(semesterId?: number): Promise<StudentGradesData> {
  const qs = semesterId !== undefined ? `?semesterId=${semesterId}` : '';
  const res = await api.get<ApiWrapper<StudentGradesData>>(`/api/student/grades${qs}`);
  return unwrap(res);
}

export async function fetchCourseGradesDetailed(courseInstanceId: number): Promise<CourseGradesDetailed> {
  const res = await api.get<ApiWrapper<CourseGradesDetailed>>(`/api/student/courses/${courseInstanceId}/grades`);
  return unwrap(res);
}

export async function fetchGpaHistory(): Promise<GpaHistoryData> {
  const res = await api.get<ApiWrapper<GpaHistoryData>>('/api/student/grades/gpa-history');
  return unwrap(res);
}

// ---- Attendance ----

export async function fetchStudentAttendance(): Promise<StudentAttendanceData> {
  const res = await api.get<ApiWrapper<StudentAttendanceData>>('/api/student/attendance');
  return unwrap(res);
}

// ---- Exam Schedule ----

export async function fetchExamSchedule(): Promise<StudentExamData> {
  const res = await api.get<ApiWrapper<StudentExamData>>('/api/student/exam-schedule');
  return unwrap(res);
}

// ---- Fees ----

export async function fetchStudentFees(semesterId?: number): Promise<StudentFeesData> {
  const qs = semesterId !== undefined ? `?semesterId=${semesterId}` : '';
  const res = await api.get<ApiWrapper<StudentFeesData>>(`/api/student/fees${qs}`);
  return unwrap(res);
}

// ---- Notifications ----

export async function fetchStudentNotifications(params?: {
  type?: number;
  isRead?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<StudentNotificationsData> {
  const parts: string[] = [];
  if (params?.type !== undefined) parts.push(`type=${params.type}`);
  if (params?.isRead !== undefined) parts.push(`isRead=${params.isRead}`);
  if (params?.page !== undefined) parts.push(`page=${params.page}`);
  if (params?.pageSize !== undefined) parts.push(`pageSize=${params.pageSize}`);
  const qs = parts.length > 0 ? `?${parts.join('&')}` : '';
  const res = await api.get<ApiWrapper<StudentNotificationsData>>(`/api/student/notifications${qs}`);
  return unwrap(res);
}

export async function markNotificationRead(notificationId: number): Promise<void> {
  await api.put(`/api/student/notifications/${notificationId}/mark-read`, {});
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.put('/api/student/notifications/mark-all-read', {});
}

// ---- Profile ----

export async function fetchStudentProfile(): Promise<StudentProfile> {
  const res = await api.get<ApiWrapper<StudentProfile>>('/api/student/profile');
  return unwrap(res);
}

export async function updateStudentProfile(payload: UpdateStudentProfileRequest): Promise<void> {
  const res = await api.put<{ isSuccess?: boolean; message?: string }>('/api/student/profile', payload);
  if (res.data && res.data.isSuccess === false) {
    throw new Error(res.data.message || 'Failed to update profile');
  }
}

export async function changeStudentPassword(payload: ChangeStudentPasswordRequest): Promise<void> {
  const res = await api.post<{ isSuccess?: boolean; message?: string }>('/api/student/profile/change-password', payload);
  if (res.data && res.data.isSuccess === false) {
    throw new Error(res.data.message || 'Failed to change password');
  }
}
