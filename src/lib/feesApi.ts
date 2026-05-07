// ============================================================
// Finance (Fees) Management API Service
// ============================================================

import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type {
  PaginatedResponse,
  FeesOverview,
  StudentFeeItem,
  StudentFeeFilterParams,
  UpdatePaymentStatusForm,
  UpdatePaymentStatusResponse,
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

// GET /api/fees/overview
export async function fetchFeesOverview(
  semesterId?: number
): Promise<{ data: FeesOverview | null; error?: string }> {
  try {
    const qs = semesterId ? `?semesterId=${semesterId}` : '';
    const res = await api.get<ApiResponse<FeesOverview>>(`/api/fees/overview${qs}`);
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch fees overview' };
  }
}

// GET /api/fees
export async function fetchStudentFees(
  params: StudentFeeFilterParams = {}
): Promise<{ data: PaginatedResponse<StudentFeeItem> | null; error?: string }> {
  try {
    const qs = buildQueryString({
      studentId: params.studentId,
      semesterId: params.semesterId,
      status: params.status,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    });
    const res = await api.get<unknown>(`/api/fees${qs}`);
    const raw = res.data as ApiResponse<PaginatedResponse<StudentFeeItem>>;
    if (raw && 'isSuccess' in raw && raw.isSuccess && raw.hasData && raw.data) {
      const inner = raw.data as PaginatedResponse<StudentFeeItem>;
      if (inner && Array.isArray(inner.items)) return { data: inner };
    }
    const direct = res.data as unknown as PaginatedResponse<StudentFeeItem>;
    if (direct && Array.isArray(direct.items)) return { data: direct };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch student fees' };
  }
}

// PUT /api/fees/{studentFeeId}/payment-status
export async function updatePaymentStatus(
  studentFeeId: number,
  form: UpdatePaymentStatusForm
): Promise<{ data: UpdatePaymentStatusResponse | null; error?: string }> {
  try {
    const res = await api.put<ApiResponse<UpdatePaymentStatusResponse>>(`/api/fees/${studentFeeId}/payment-status`, form);
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to update payment status' };
  }
}
