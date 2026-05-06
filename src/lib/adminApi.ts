// ============================================================
// Admin API Service — Dashboard, Academic Years, Semesters,
// Registration, Course Instances
// ============================================================

import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type {
  DashboardStats,
  ActivityItem,
  AcademicYearListItem,
  AcademicYearDetail,
  CreateAcademicYearForm,
  UpdateAcademicYearForm,
  CreateSemesterForm,
  UpdateSemesterForm,
  SemesterItem,
  RegistrationStatus,
  OpenRegistrationForm,
  CloseRegistrationForm,
  CourseInstanceListItem,
  CourseInstanceListParams,
  CreateCourseInstanceForm,
  UpdateCourseInstanceForm,
  EnrollmentListItem,
  SemesterOption,
  DoctorOption,
  DepartmentOption,
  CourseOption,
  RoomOption,
  PaginatedResponse,
} from '@/types/admin';

// ---- Helpers ----

function buildQS(params: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

function unwrap<T>(res: { data: unknown }): T | null {
  const d = res.data as ApiResponse<T>;
  if (d && typeof d === 'object' && 'isSuccess' in d) {
    if (d.isSuccess && d.hasData && d.data !== undefined) return d.data;
    return null;
  }
  // Direct shape { success, data }
  const raw = res.data as { success?: boolean; data?: T };
  if (raw?.success && raw.data !== undefined) return raw.data;
  // Direct object
  return res.data as T;
}

function getError(res: { data: unknown }): string {
  const d = res.data as ApiResponse<unknown>;
  if (d && typeof d === 'object' && 'error' in d && d.error) {
    return d.error.description || 'Operation failed';
  }
  const raw = res.data as { message?: string };
  return raw?.message || 'Operation failed';
}

function isSuccess(res: { data: unknown }): boolean {
  const d = res.data as ApiResponse<unknown>;
  if (d && typeof d === 'object') {
    if ('isSuccess' in d) return !!d.isSuccess;
    if ('success' in d) return !!(d as { success?: boolean }).success;
  }
  return false;
}

// ============================================================
// DASHBOARD
// ============================================================

export async function fetchDashboardStats(): Promise<{ data: DashboardStats | null; error?: string }> {
  try {
    const res = await api.get<unknown>('/api/admin/dashboard/stats');
    const data = unwrap<DashboardStats>(res);
    if (data) return { data };
    const raw = res.data as DashboardStats;
    if (raw && typeof raw === 'object' && 'totalStudents' in raw) return { data: raw };
    return { data: null, error: getError(res) };
  } catch { return { data: null, error: 'Failed to load dashboard stats' }; }
}

export async function fetchDashboardActivity(limit = 10): Promise<{ data: ActivityItem[]; error?: string }> {
  try {
    const res = await api.get<unknown>(`/api/admin/dashboard/activity?limit=${limit}`);
    const data = unwrap<ActivityItem[]>(res);
    if (data && Array.isArray(data)) return { data };
    const raw = res.data as { data?: ActivityItem[] };
    if (raw?.data && Array.isArray(raw.data)) return { data: raw.data };
    if (Array.isArray(res.data)) return { data: res.data as ActivityItem[] };
    return { data: [] };
  } catch { return { data: [] }; }
}

// ============================================================
// ACADEMIC YEARS
// ============================================================

export async function fetchAcademicYears(): Promise<{ data: AcademicYearListItem[]; error?: string }> {
  try {
    const res = await api.get<unknown>('/api/admin/academic-years');
    const raw = res.data as { data?: AcademicYearListItem[] } & ApiResponse<AcademicYearListItem[]>;
    if (raw && 'data' in raw && Array.isArray(raw.data)) return { data: raw.data };
    if (raw && 'isSuccess' in raw && raw.isSuccess && Array.isArray(raw.data)) return { data: raw.data as AcademicYearListItem[] };
    if (Array.isArray(res.data)) return { data: res.data as AcademicYearListItem[] };
    return { data: [], error: getError(res) };
  } catch { return { data: [], error: 'Failed to fetch academic years' }; }
}

export async function fetchAcademicYearDetail(id: number): Promise<{ data: AcademicYearDetail | null; error?: string }> {
  try {
    const res = await api.get<unknown>(`/api/admin/academic-years/${id}`);
    const data = unwrap<AcademicYearDetail>(res);
    if (data) return { data };
    const raw = res.data as AcademicYearDetail;
    if (raw && 'semesters' in raw) return { data: raw };
    return { data: null, error: getError(res) };
  } catch { return { data: null, error: 'Failed to fetch academic year details' }; }
}

export async function createAcademicYear(form: CreateAcademicYearForm): Promise<{ id: number | null; error?: string }> {
  try {
    const res = await api.post<unknown>('/api/admin/academic-years', form);
    const data = unwrap<{ id: number }>(res);
    if (data?.id) return { id: data.id };
    const raw = res.data as { id?: number; success?: boolean };
    if (raw?.id) return { id: raw.id };
    if (isSuccess(res)) return { id: null }; // no id returned but success
    return { id: null, error: getError(res) };
  } catch { return { id: null, error: 'Failed to create academic year' }; }
}

export async function updateAcademicYear(id: number, form: UpdateAcademicYearForm): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<unknown>(`/api/admin/academic-years/${id}`, form);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getError(res) };
  } catch { return { success: false, error: 'Failed to update academic year' }; }
}

export async function deleteAcademicYear(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<unknown>(`/api/admin/academic-years/${id}`);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getError(res) };
  } catch { return { success: false, error: 'Failed to delete academic year' }; }
}

// ============================================================
// SEMESTERS
// ============================================================

export async function createSemester(academicYearId: number, form: CreateSemesterForm): Promise<{ id: number | null; error?: string }> {
  try {
    const res = await api.post<unknown>(`/api/admin/academic-years/${academicYearId}/semesters`, form);
    const data = unwrap<{ id: number }>(res);
    if (data?.id) return { id: data.id };
    const raw = res.data as { id?: number };
    if (raw?.id) return { id: raw.id };
    if (isSuccess(res)) return { id: null };
    return { id: null, error: getError(res) };
  } catch { return { id: null, error: 'Failed to create semester' }; }
}

export async function updateSemester(semesterId: number, form: UpdateSemesterForm): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<unknown>(`/api/admin/semesters/${semesterId}`, form);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getError(res) };
  } catch { return { success: false, error: 'Failed to update semester' }; }
}

export async function deleteSemester(semesterId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<unknown>(`/api/admin/semesters/${semesterId}`);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getError(res) };
  } catch { return { success: false, error: 'Failed to delete semester' }; }
}

export async function setCurrentSemester(semesterId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<unknown>(`/api/admin/semesters/${semesterId}/set-current`, {});
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getError(res) };
  } catch { return { success: false, error: 'Failed to set current semester' }; }
}

// ============================================================
// REGISTRATION
// ============================================================

export async function fetchRegistrationStatus(): Promise<{ data: RegistrationStatus | null; error?: string }> {
  try {
    const res = await api.get<unknown>('/api/admin/registration/status');
    const data = unwrap<RegistrationStatus>(res);
    if (data) return { data };
    const raw = res.data as RegistrationStatus;
    if (raw && typeof raw === 'object' && 'status' in raw) return { data: raw };
    return { data: null, error: getError(res) };
  } catch { return { data: null, error: 'Failed to load registration status' }; }
}

export async function openRegistration(form: OpenRegistrationForm): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.post<unknown>('/api/admin/registration/open', form);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getError(res) };
  } catch { return { success: false, error: 'Failed to open registration' }; }
}

export async function closeRegistration(form: CloseRegistrationForm): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.post<unknown>('/api/admin/registration/close', form);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getError(res) };
  } catch { return { success: false, error: 'Failed to close registration' }; }
}

// ============================================================
// COURSE INSTANCES
// ============================================================

export async function fetchCourseInstances(
  params: CourseInstanceListParams = {}
): Promise<{ data: PaginatedResponse<CourseInstanceListItem> | null; error?: string }> {
  try {
    const qs = buildQS({
      semesterId: params.semesterId,
      departmentId: params.departmentId,
      doctorId: params.doctorId,
      search: params.search,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    });
    const res = await api.get<unknown>(`/api/admin/course-instances${qs}`);
    const raw = res.data as PaginatedResponse<CourseInstanceListItem>;
    if (raw && Array.isArray(raw.items)) return { data: raw };
    const wrapped = unwrap<PaginatedResponse<CourseInstanceListItem>>(res);
    if (wrapped && Array.isArray(wrapped.items)) return { data: wrapped };
    return { data: null, error: getError(res) };
  } catch { return { data: null, error: 'Failed to fetch course instances' }; }
}

export async function createCourseInstance(form: CreateCourseInstanceForm): Promise<{ id: number | null; error?: string }> {
  try {
    const res = await api.post<unknown>('/api/admin/course-instances', form);
    const data = unwrap<{ id: number }>(res);
    if (data?.id) return { id: data.id };
    const raw = res.data as { id?: number };
    if (raw?.id) return { id: raw.id };
    if (isSuccess(res)) return { id: null };
    return { id: null, error: getError(res) };
  } catch { return { id: null, error: 'Failed to create course instance' }; }
}

export async function updateCourseInstance(id: number, form: UpdateCourseInstanceForm): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<unknown>(`/api/admin/course-instances/${id}`, form);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getError(res) };
  } catch { return { success: false, error: 'Failed to update course instance' }; }
}

export async function deleteCourseInstance(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<unknown>(`/api/admin/course-instances/${id}`);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getError(res) };
  } catch { return { success: false, error: 'Failed to delete course instance' }; }
}

export async function fetchCourseInstanceEnrollments(id: number): Promise<{ data: EnrollmentListItem[]; error?: string }> {
  try {
    const res = await api.get<unknown>(`/api/admin/course-instances/${id}/enrollments`);
    const raw = res.data as { data?: EnrollmentListItem[] } & ApiResponse<EnrollmentListItem[]>;
    if (raw && 'data' in raw && Array.isArray(raw.data)) return { data: raw.data };
    if (Array.isArray(res.data)) return { data: res.data as EnrollmentListItem[] };
    return { data: [] };
  } catch { return { data: [] }; }
}

// ============================================================
// COMMON DROPDOWNS
// ============================================================

export async function fetchSemesterOptions(): Promise<SemesterOption[]> {
  try {
    const res = await api.get<unknown>('/api/admin/semesters');
    const raw = res.data as { data?: SemesterOption[] } & ApiResponse<SemesterOption[]>;
    if (raw && 'data' in raw && Array.isArray(raw.data)) return raw.data;
    if (raw && 'isSuccess' in raw && raw.isSuccess && Array.isArray(raw.data)) return raw.data as SemesterOption[];
    if (Array.isArray(res.data)) return res.data as SemesterOption[];
    return [];
  } catch { return []; }
}

export async function fetchDepartmentOptions(): Promise<DepartmentOption[]> {
  try {
    const res = await api.get<unknown>('/api/admin/departments');
    const raw = res.data as { data?: DepartmentOption[]; items?: DepartmentOption[] } & ApiResponse<DepartmentOption[]>;
    if (raw?.items && Array.isArray(raw.items)) return raw.items.map(d => ({ id: d.id, name: d.name }));
    if (raw && 'data' in raw && Array.isArray(raw.data)) return raw.data;
    if (raw && 'isSuccess' in raw && raw.isSuccess && Array.isArray(raw.data)) return raw.data as DepartmentOption[];
    if (Array.isArray(res.data)) return res.data as DepartmentOption[];
    return [];
  } catch { return []; }
}

export async function fetchDoctorOptions(): Promise<DoctorOption[]> {
  try {
    const res = await api.get<unknown>('/api/admin/users/doctors');
    const raw = res.data as { data?: DoctorOption[]; items?: DoctorOption[] } & ApiResponse<DoctorOption[]>;
    if (raw?.items && Array.isArray(raw.items)) return raw.items.map(d => ({ id: d.id, fullName: d.fullName }));
    if (raw && 'data' in raw && Array.isArray(raw.data)) return raw.data;
    if (raw && 'isSuccess' in raw && raw.isSuccess && Array.isArray(raw.data)) return raw.data as DoctorOption[];
    if (Array.isArray(res.data)) return res.data as DoctorOption[];
    return [];
  } catch { return []; }
}

export async function fetchCourseOptions(): Promise<CourseOption[]> {
  try {
    const res = await api.get<unknown>('/api/admin/courses?pageSize=200');
    const raw = res.data as { data?: CourseOption[]; items?: CourseOption[] } & ApiResponse<CourseOption[]>;
    if (raw?.items && Array.isArray(raw.items)) return raw.items.map(c => ({ id: (c as CourseOption & { id: number }).id, code: (c as CourseOption & { code: string }).code, name: (c as CourseOption & { name: string }).name }));
    if (raw && 'data' in raw && Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(res.data)) return res.data as CourseOption[];
    return [];
  } catch { return []; }
}

export async function fetchRoomOptions(): Promise<RoomOption[]> {
  try {
    const res = await api.get<unknown>('/api/admin/rooms');
    const raw = res.data as { data?: RoomOption[]; items?: RoomOption[] } & ApiResponse<RoomOption[]>;
    if (raw?.items && Array.isArray(raw.items)) return raw.items.map(r => ({ id: r.id, name: r.name }));
    if (raw && 'data' in raw && Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(res.data)) return res.data as RoomOption[];
    return [];
  } catch { return []; }
}
