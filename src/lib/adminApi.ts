// ============================================================
// Admin API Service — Dashboard, Academic Years, Semesters,
// Registration, Course Instances
// ============================================================

import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type {
  DashboardStats,
  RecentRegistration,
  SystemAlert,
  AcademicYearListItem,
  AcademicYearDetail,
  CreateAcademicYearForm,
  UpdateAcademicYearForm,
  CreateSemesterForm,
  UpdateSemesterForm,
  UpdateSemesterRegistrationDatesForm,
  ActiveSemesterDropdownItem,
  UpdateRegistrationDatesForm,
  SemesterItem,
  RegistrationSettings,
  UpdateRegistrationSettingsForm,
  OpenRegistrationWindowForm,
  RegistrationActivityLogParams,
  RegistrationActivityLogResponse,
  CourseInstanceListItem,
  CourseInstanceListParams,
  CreateCourseInstanceForm,
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

export async function fetchDashboardStats(semesterId?: number): Promise<{ data: DashboardStats | null; error?: string }> {
  try {
    const qs = semesterId ? `?semesterId=${semesterId}` : '';
    const res = await api.get<unknown>(`/api/admin/dashboard/stats${qs}`);
    const data = unwrap<DashboardStats>(res);
    if (data) return { data };
    const raw = res.data as DashboardStats;
    if (raw && typeof raw === 'object' && 'totalStudents' in raw) return { data: raw };
    return { data: null, error: getError(res) };
  } catch { return { data: null, error: 'Failed to load dashboard stats' }; }
}

export async function fetchRecentRegistrations(count = 5): Promise<{ data: RecentRegistration[]; error?: string }> {
  try {
    const res = await api.get<unknown>(`/api/admin/dashboard/recent-registrations?count=${count}`);
    const data = unwrap<RecentRegistration[]>(res);
    if (data && Array.isArray(data)) return { data };
    const raw = res.data as { data?: RecentRegistration[] };
    if (raw?.data && Array.isArray(raw.data)) return { data: raw.data };
    if (Array.isArray(res.data)) return { data: res.data as RecentRegistration[] };
    return { data: [] };
  } catch { return { data: [] }; }
}

export async function fetchSystemAlerts(maxAlerts = 10): Promise<{ data: SystemAlert[]; error?: string }> {
  try {
    const res = await api.get<unknown>(`/api/admin/dashboard/alerts?maxAlerts=${maxAlerts}`);
    const data = unwrap<SystemAlert[]>(res);
    if (data && Array.isArray(data)) return { data };
    const raw = res.data as { data?: SystemAlert[] };
    if (raw?.data && Array.isArray(raw.data)) return { data: raw.data };
    if (Array.isArray(res.data)) return { data: res.data as SystemAlert[] };
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

export async function updateRegistrationDates(
  semesterId: number,
  form: UpdateRegistrationDatesForm
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<unknown>(`/api/admin/semesters/${semesterId}/registration-dates`, form);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getError(res) };
  } catch { return { success: false, error: 'Failed to update registration dates' }; }
}

// ============================================================
// REGISTRATION
// ============================================================

export async function fetchRegistrationSettings(semesterId?: number): Promise<{ data: RegistrationSettings | null; error?: string }> {
  try {
    const qs = semesterId ? `?semesterId=${semesterId}` : '';
    const res = await api.get<unknown>(`/api/registration-control/settings${qs}`);
    const data = unwrap<RegistrationSettings>(res);
    if (data) return { data };
    const raw = res.data as RegistrationSettings;
    if (raw && typeof raw === 'object' && 'isOpen' in raw) return { data: raw };
    return { data: null, error: getError(res) };
  } catch { return { data: null, error: 'Failed to load registration settings' }; }
}

export async function updateRegistrationSettings(form: UpdateRegistrationSettingsForm): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.put<unknown>('/api/registration-control/settings', form);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getError(res) };
  } catch { return { success: false, error: 'Failed to update registration settings' }; }
}

export async function openRegistrationWindow(form: OpenRegistrationWindowForm): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.post<unknown>('/api/admin/registration/windows', form);
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getError(res) };
  } catch { return { success: false, error: 'Failed to open registration window' }; }
}

export async function closeRegistrationWindow(windowId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.post<unknown>(`/api/admin/registration/windows/${windowId}/close`, {});
    if (isSuccess(res)) return { success: true };
    return { success: false, error: getError(res) };
  } catch { return { success: false, error: 'Failed to close registration window' }; }
}

export async function fetchRegistrationActivityLog(
  params: RegistrationActivityLogParams = {}
): Promise<{ data: RegistrationActivityLogResponse | null; error?: string }> {
  try {
    const qs = buildQS({
      semesterId: params.semesterId,
      fromDate: params.fromDate,
      toDate: params.toDate,
      status: params.status,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 50,
    });
    const res = await api.get<unknown>(`/api/registration-control/activity-log${qs}`);
    const data = unwrap<RegistrationActivityLogResponse>(res);
    if (data && Array.isArray(data.items)) return { data };
    const raw = res.data as RegistrationActivityLogResponse;
    if (raw && Array.isArray(raw.items)) return { data: raw };
    return { data: null, error: getError(res) };
  } catch { return { data: null, error: 'Failed to fetch activity log' }; }
}

// ============================================================
// COURSE INSTANCES
// ============================================================

export async function fetchCourseInstances(
  params: CourseInstanceListParams = {}
): Promise<{ data: PaginatedResponse<CourseInstanceListItem> | null; error?: string }> {
  try {
    // No standalone list endpoint exists — aggregate from course details
    const qs = buildQS({
      departmentId: params.departmentId,
      search: params.search,
      pageSize: 200,
    });
    const coursesRes = await api.get<unknown>(`/api/admin/courses${qs}`);

    // Extract courses list from response
    let courses: { id: number; code: string; name: string }[] = [];
    const raw = coursesRes.data as ApiResponse<{ id: number; code: string; name: string }[]>;
    if (raw && 'isSuccess' in raw && raw.isSuccess && Array.isArray(raw.data)) {
      courses = raw.data;
    } else if (raw && 'data' in raw && Array.isArray(raw.data)) {
      courses = raw.data;
    } else if (Array.isArray(coursesRes.data)) {
      courses = coursesRes.data as { id: number; code: string; name: string }[];
    }

    // Fetch details for each course to get instances
    const detailPromises = courses.map(c =>
      api.get<unknown>(`/api/admin/courses/${c.id}`).catch(() => null)
    );
    const detailResults = await Promise.all(detailPromises);

    const items: CourseInstanceListItem[] = [];
    detailResults.forEach((res, idx) => {
      if (!res) return;
      const d = res.data as ApiResponse<{ instances?: Array<{ id: number; semesterName: string; doctorName: string; maxCapacity: number; currentEnrolled: number; isFull: boolean }> }>;
      let detail = d?.data;
      if (!detail && res.data && typeof res.data === 'object' && 'instances' in (res.data as object)) {
        detail = res.data as typeof detail;
      }
      if (detail?.instances) {
        for (const inst of detail.instances) {
          items.push({
            id: inst.id,
            courseId: courses[idx].id,
            courseCode: courses[idx].code,
            courseName: courses[idx].name,
            semesterId: 0,
            semesterName: inst.semesterName,
            doctorId: 0,
            doctorName: inst.doctorName,
            doctorTitle: 0,
            doctorTitleDisplay: '',
            maxCapacity: inst.maxCapacity,
            currentEnrolled: inst.currentEnrolled,
            enrollmentPercentage: inst.maxCapacity > 0 ? (inst.currentEnrolled / inst.maxCapacity) * 100 : 0,
            status: inst.isFull ? 'Full' : 'Open',
          });
        }
      }
    });

    // Apply client-side filters
    let filtered = items;
    if (params.doctorId) {
      filtered = filtered.filter(i => i.doctorId === params.doctorId);
    }

    // Client-side pagination
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const start = (page - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    return {
      data: {
        items: pageItems,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  } catch { return { data: null, error: 'Failed to fetch course instances' }; }
}

export async function createCourseInstance(form: CreateCourseInstanceForm): Promise<{ id: number | null; error?: string }> {
  try {
    const { courseId, ...body } = form;
    const res = await api.post<unknown>(`/api/admin/courses/${courseId}/instances`, body);
    const data = unwrap<{ id: number }>(res);
    if (data?.id) return { id: data.id };
    const raw = res.data as { id?: number };
    if (raw?.id) return { id: raw.id };
    if (isSuccess(res)) return { id: null };
    return { id: null, error: getError(res) };
  } catch { return { id: null, error: 'Failed to create course instance' }; }
}

export async function deleteCourseInstance(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await api.delete<unknown>(`/api/admin/courses/instances/${id}`);
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
    const res = await api.get<unknown>('/api/admin/academic-years/active/semesters');
    const wrapped = unwrap<SemesterOption[]>(res);
    if (wrapped && Array.isArray(wrapped)) return wrapped.map(s => ({ id: s.id, name: s.name }));
    const raw = res.data as SemesterOption[];
    if (Array.isArray(raw)) return raw.map(s => ({ id: s.id, name: s.name }));
    return [];
  } catch { return []; }
}

export async function fetchDepartmentOptions(): Promise<DepartmentOption[]> {
  try {
    const res = await api.get<unknown>('/api/admin/departments');
    const wrapped = unwrap<{ id: number; description: string }[]>(res);
    if (wrapped && Array.isArray(wrapped)) return wrapped.map(d => ({ id: d.id, name: d.description ?? String(d.id) }));
    const raw = res.data as unknown as { id: number; description?: string; name?: string }[];
    if (Array.isArray(raw)) return raw.map(d => ({ id: d.id, name: d.description ?? d.name ?? '' }));
    return [];
  } catch { return []; }
}

export async function fetchDoctorOptions(): Promise<DoctorOption[]> {
  try {
    const res = await api.get<unknown>('/api/doctors?pageSize=200');
    // Paginated response: { items: [...] }
    const paginated = res.data as { items?: { id: number; fullName: string }[] };
    if (paginated && Array.isArray(paginated.items)) {
      return paginated.items.map(d => ({ id: d.id, fullName: d.fullName }));
    }
    // Wrapped in ApiResponse
    const apiRes = res.data as ApiResponse<{ items: { id: number; fullName: string }[] }>;
    if (apiRes?.isSuccess && apiRes.data?.items) {
      return apiRes.data.items.map(d => ({ id: d.id, fullName: d.fullName }));
    }
    // Fallback: direct array
    const raw = res.data as unknown as DoctorOption[];
    if (Array.isArray(raw)) return raw;
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
