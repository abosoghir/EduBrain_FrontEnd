// ============================================================
// Admin - Fees Management API Service
// ============================================================

import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type {
  PaginatedResponse,
  FeesDashboard,
  FeeInvoice,
  Payment,
  CreateInvoiceRequest,
  RecordPaymentRequest,
  WaiveFeeRequest,
  RefundPaymentRequest,
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

// 1. GET /api/admin/fees/dashboard
export async function getFeesDashboard(): Promise<{ data: FeesDashboard | null; error?: string }> {
  try {
    const res = await api.get<ApiResponse<FeesDashboard>>(`/api/admin/fees/dashboard`);
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch fees dashboard' };
  }
}

// 2. GET /api/admin/fees/invoices
export async function getInvoices(params: {
  studentId?: number;
  status?: number;
  feeType?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: PaginatedResponse<FeeInvoice> | null; error?: string }> {
  try {
    const qs = buildQueryString(params);
    const res = await api.get<unknown>(`/api/admin/fees/invoices${qs}`);
    const raw = res.data as ApiResponse<PaginatedResponse<FeeInvoice>>;
    if (raw && 'isSuccess' in raw && raw.isSuccess && raw.hasData && raw.data) {
      return { data: raw.data };
    }
    const direct = res.data as unknown as PaginatedResponse<FeeInvoice>;
    if (direct && Array.isArray(direct.items)) return { data: direct };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch invoices' };
  }
}

// 3. GET /api/admin/fees/invoices/{id}
export async function getInvoiceDetails(invoiceId: number): Promise<{ data: FeeInvoice | null; error?: string }> {
  try {
    const res = await api.get<ApiResponse<FeeInvoice>>(`/api/admin/fees/invoices/${invoiceId}`);
    const data = unwrap(res);
    if (data) return { data };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch invoice details' };
  }
}

// 4. POST /api/admin/fees/invoices
export async function createInvoice(form: CreateInvoiceRequest): Promise<{ data: any; success: boolean; error?: string }> {
  try {
    const res = await api.post<ApiResponse<any>>(`/api/admin/fees/invoices`, form);
    const d = res.data as ApiResponse<any>;
    if (d?.isSuccess) return { data: d.data, success: true };
    return { data: null, success: false, error: getErrorMessage(res) };
  } catch {
    return { data: null, success: false, error: 'Failed to create invoice' };
  }
}

// 5. POST /api/admin/fees/invoices/{id}/payments
export async function recordPayment(invoiceId: number, form: RecordPaymentRequest): Promise<{ data: any; success: boolean; error?: string }> {
  try {
    const res = await api.post<ApiResponse<any>>(`/api/admin/fees/invoices/${invoiceId}/payments`, form);
    const d = res.data as ApiResponse<any>;
    if (d?.isSuccess) return { data: d.data, success: true };
    return { data: null, success: false, error: getErrorMessage(res) };
  } catch {
    return { data: null, success: false, error: 'Failed to record payment' };
  }
}

// 6. PUT /api/admin/fees/invoices/{id}
export async function updateInvoice(invoiceId: number, form: Partial<CreateInvoiceRequest>): Promise<{ data: any; success: boolean; error?: string }> {
  try {
    const res = await api.put<ApiResponse<any>>(`/api/admin/fees/invoices/${invoiceId}`, form);
    const d = res.data as ApiResponse<any>;
    if (d?.isSuccess) return { data: d.data, success: true };
    return { data: null, success: false, error: getErrorMessage(res) };
  } catch {
    return { data: null, success: false, error: 'Failed to update invoice' };
  }
}

// 7. POST /api/admin/fees/invoices/{id}/waive
export async function waiveInvoice(invoiceId: number, form: WaiveFeeRequest): Promise<{ data: any; success: boolean; error?: string }> {
  try {
    const res = await api.post<ApiResponse<any>>(`/api/admin/fees/invoices/${invoiceId}/waive`, form);
    const d = res.data as ApiResponse<any>;
    if (d?.isSuccess) return { data: d.data, success: true };
    return { data: null, success: false, error: getErrorMessage(res) };
  } catch {
    return { data: null, success: false, error: 'Failed to waive fees' };
  }
}

// 8. POST /api/admin/fees/payments/{id}/refund
export async function processRefund(paymentId: number, form: RefundPaymentRequest): Promise<{ data: any; success: boolean; error?: string }> {
  try {
    const res = await api.post<ApiResponse<any>>(`/api/admin/fees/payments/${paymentId}/refund`, form);
    const d = res.data as ApiResponse<any>;
    if (d?.isSuccess) return { data: d.data, success: true };
    return { data: null, success: false, error: getErrorMessage(res) };
  } catch {
    return { data: null, success: false, error: 'Failed to process refund' };
  }
}

// 9. GET /api/admin/fees/payments
export async function getPayments(params: {
  studentId?: number;
  fromDate?: string;
  toDate?: string;
  paymentMethod?: number;
  page?: number;
  pageSize?: number;
}): Promise<{ data: PaginatedResponse<Payment> | null; error?: string }> {
  try {
    const qs = buildQueryString(params);
    const res = await api.get<unknown>(`/api/admin/fees/payments${qs}`);
    const raw = res.data as ApiResponse<PaginatedResponse<Payment>>;
    if (raw && 'isSuccess' in raw && raw.isSuccess && raw.hasData && raw.data) {
      return { data: raw.data };
    }
    const direct = res.data as unknown as PaginatedResponse<Payment>;
    if (direct && Array.isArray(direct.items)) return { data: direct };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch payments' };
  }
}
