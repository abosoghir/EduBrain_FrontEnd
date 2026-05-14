// ============================================================
// Advisor Portal API Service
// Handles all API calls for the Advisor Portal (logged-in advisor)
// NOTE: Different from advisorApi.ts which is the admin's advisor management
// ============================================================

import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type {
  AdvisorDashboardData,
  FeesDashboardData,
  GetMyStudentsResponse,
  GetMyStudentsParams,
  StudentProfileForAdvisor,
  SendStudentMessageRequest,
  GetStudentFeesResponse,
  AssignFeesRequest,
  AssignFeesResponse,
  SendFeeReminderRequest,
  GetWarningsResponse,
  SendWarningRequest,
  SendWarningResponse,
  ResolveWarningRequest,
  GetStudentScheduleForAdjustmentResponse,
  DropCourseRequest,
  DropCourseResponse,
  ManualCourseAddRequest,
  ManualCourseAddResponse,
  SwapSectionRequest,
  SwapSectionResponse,
  AdvisorProfileResponse,
  UpdateAdvisorProfileRequest,
  GetAdvisorNotificationsResponse,
  GetAdvisorNotificationsParams,
  AddStudentRequest,
} from '@/types/advisor';

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

function isSuccess(res: { data: unknown }): boolean {
  const d = res.data as ApiResponse<unknown>;
  if (d && typeof d === 'object') {
    if ('isSuccess' in d) return !!d.isSuccess;
  }
  return false;
}

// ============================================================
// DASHBOARD
// ============================================================

export async function fetchAdvisorDashboard(): Promise<{
  data: AdvisorDashboardData | null;
  error?: string;
}> {
  try {
    const res = await api.get<ApiResponse<AdvisorDashboardData>>('/api/advisor/dashboard');
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch dashboard data' };
  }
}

export async function fetchFeesDashboard(): Promise<{
  data: FeesDashboardData | null;
  error?: string;
}> {
  try {
    const res = await api.get<ApiResponse<FeesDashboardData>>('/api/advisor/fees/dashboard');
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch fees dashboard' };
  }
}

// ============================================================
// STUDENTS
// ============================================================

export async function fetchMyStudents(
  params: GetMyStudentsParams = {}
): Promise<{ data: GetMyStudentsResponse | null; error?: string }> {
  try {
    const qs = buildQueryString({
      search: params.search,
      level: params.level,
      status: params.status,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    });
    const res = await api.get<ApiResponse<GetMyStudentsResponse>>(`/api/advisor/students${qs}`);
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch students' };
  }
}

export async function fetchStudentProfile(
  studentId: number
): Promise<{ data: StudentProfileForAdvisor | null; error?: string }> {
  try {
    const res = await api.get<ApiResponse<StudentProfileForAdvisor>>(
      `/api/advisor/students/${studentId}/profile`
    );
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch student profile' };
  }
}

export async function sendStudentMessage(
  studentId: number,
  body: SendStudentMessageRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.post<ApiResponse<unknown>>(
      `/api/advisor/students/${studentId}/message`,
      body
    );
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to send message' };
  }
}

export async function addStudent(
  body: AddStudentRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.post<ApiResponse<unknown>>('/api/advisor/students', body);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to add student' };
  }
}

// ============================================================
// FEES
// ============================================================

export async function fetchStudentFees(
  studentId: number
): Promise<{ data: GetStudentFeesResponse | null; error?: string }> {
  try {
    const res = await api.get<ApiResponse<GetStudentFeesResponse>>(
      `/api/advisor/students/${studentId}/fees`
    );
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch student fees' };
  }
}

export async function assignFees(
  body: AssignFeesRequest
): Promise<{ data: AssignFeesResponse | null; error?: string }> {
  try {
    const res = await api.post<ApiResponse<AssignFeesResponse>>('/api/advisor/fees/assign', body);
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to assign fees' };
  }
}

export async function sendFeeReminder(
  studentFeeId: number,
  body: SendFeeReminderRequest = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.post<ApiResponse<unknown>>(
      `/api/advisor/fees/${studentFeeId}/reminder`,
      body
    );
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to send fee reminder' };
  }
}

// ============================================================
// WARNINGS
// ============================================================

export async function fetchWarnings(
  status?: number
): Promise<{ data: GetWarningsResponse | null; error?: string }> {
  try {
    const qs = buildQueryString({ status });
    const res = await api.get<ApiResponse<GetWarningsResponse>>(`/api/advisor/warnings${qs}`);
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch warnings' };
  }
}

export async function sendWarning(
  body: SendWarningRequest
): Promise<{ data: SendWarningResponse | null; error?: string }> {
  try {
    const res = await api.post<ApiResponse<SendWarningResponse>>('/api/advisor/warnings', body);
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to send warning' };
  }
}

export async function resolveWarning(
  warningId: number,
  body: ResolveWarningRequest = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<ApiResponse<unknown>>(
      `/api/advisor/warnings/${warningId}/resolve`,
      body
    );
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to resolve warning' };
  }
}

// ============================================================
// SCHEDULE ADJUSTMENTS
// ============================================================

export async function fetchStudentScheduleForAdjustment(
  studentId: number
): Promise<{ data: GetStudentScheduleForAdjustmentResponse | null; error?: string }> {
  try {
    const res = await api.get<ApiResponse<GetStudentScheduleForAdjustmentResponse>>(
      `/api/advisor/students/${studentId}/schedule-adjustment`
    );
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch student schedule' };
  }
}

export async function dropCourse(
  body: DropCourseRequest
): Promise<{ data: DropCourseResponse | null; error?: string }> {
  try {
    const res = await api.post<ApiResponse<DropCourseResponse>>(
      '/api/advisor/schedule-adjustments/drop',
      body
    );
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to drop course' };
  }
}

export async function manualCourseAdd(
  body: ManualCourseAddRequest
): Promise<{ data: ManualCourseAddResponse | null; error?: string }> {
  try {
    const res = await api.post<ApiResponse<ManualCourseAddResponse>>(
      '/api/advisor/schedule-adjustments/add-course',
      body
    );
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to add course' };
  }
}

export async function swapSection(
  body: SwapSectionRequest
): Promise<{ data: SwapSectionResponse | null; error?: string }> {
  try {
    const res = await api.post<ApiResponse<SwapSectionResponse>>(
      '/api/advisor/schedule-adjustments/swap-section',
      body
    );
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to swap section' };
  }
}

// ============================================================
// PROFILE
// ============================================================

export async function fetchAdvisorProfile(): Promise<{
  data: AdvisorProfileResponse | null;
  error?: string;
}> {
  try {
    const res = await api.get<ApiResponse<AdvisorProfileResponse>>('/api/advisor/profile');
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch profile' };
  }
}

export async function updateAdvisorProfile(
  body: UpdateAdvisorProfileRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<ApiResponse<unknown>>('/api/advisor/profile', body);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to update profile' };
  }
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export async function fetchAdvisorNotifications(
  params: GetAdvisorNotificationsParams = {}
): Promise<{ data: GetAdvisorNotificationsResponse | null; error?: string }> {
  try {
    const qs = buildQueryString({
      type: params.type,
      isRead: params.isRead,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    });
    const res = await api.get<ApiResponse<GetAdvisorNotificationsResponse>>(
      `/api/advisor/notifications${qs}`
    );
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch notifications' };
  }
}

export async function markNotificationAsRead(
  notificationId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<ApiResponse<unknown>>(
      `/api/advisor/notifications/${notificationId}/read`,
      {}
    );
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getErrorMessage(res) };
  } catch {
    return { success: false, error: 'Failed to mark notification as read' };
  }
}
