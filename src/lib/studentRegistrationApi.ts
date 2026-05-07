import { api } from './api';
import type { ApiResponse } from './api';
import { PaginatedResponse } from '@/types/admin';
import {
  StudentRegistrationStatus,
  CourseCatalogItem,
  CartData,
  AddToCartRequest,
  EnrollmentsData,
} from '@/types/student';

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

export async function fetchRegistrationStatus(): Promise<StudentRegistrationStatus | null> {
  const res = await api.get<ApiResponse<StudentRegistrationStatus>>('/api/student/registration/status');
  return unwrap(res);
}

export interface CourseCatalogParams {
  department?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchCourseCatalog(params?: CourseCatalogParams): Promise<PaginatedResponse<CourseCatalogItem>> {
  const qs = params ? buildQueryString(params as any) : '';
  const res = await api.get<ApiResponse<PaginatedResponse<CourseCatalogItem>>>(`/api/student/registration/courses${qs}`);
  const data = unwrap(res);
  return data || { items: [], pageNumber: 1, totalPages: 1, totalCount: 0, hasPreviousPage: false, hasNextPage: false } as any;
}

export async function addToCart(data: AddToCartRequest): Promise<{ success: boolean; message: string }> {
  const res = await api.post<ApiResponse<any>>('/api/student/registration/cart', data);
  const d = res.data as ApiResponse<any> & { message?: string };
  if (d?.isSuccess) return { success: true, message: d.message || 'Added to cart' };
  throw new Error(getErrorMessage(res));
}

export async function fetchCart(): Promise<CartData | null> {
  const res = await api.get<ApiResponse<CartData>>('/api/student/registration/cart');
  return unwrap(res);
}

export async function removeFromCart(cartItemId: number): Promise<{ success: boolean; message: string }> {
  const res = await api.delete<ApiResponse<any>>(`/api/student/registration/cart/${cartItemId}`);
  const d = res.data as ApiResponse<any> & { message?: string };
  if (d?.isSuccess) return { success: true, message: d.message || 'Removed from cart' };
  throw new Error(getErrorMessage(res));
}

export async function clearCart(): Promise<{ success: boolean; message: string }> {
  const res = await api.delete<ApiResponse<any>>('/api/student/registration/cart');
  const d = res.data as ApiResponse<any> & { message?: string };
  if (d?.isSuccess) return { success: true, message: d.message || 'Cart cleared' };
  throw new Error(getErrorMessage(res));
}

export async function confirmRegistration(cartId: number): Promise<{ success: boolean; message: string }> {
  const res = await api.post<ApiResponse<any>>('/api/student/registration/confirm', { cartId });
  const d = res.data as ApiResponse<any> & { message?: string };
  if (d?.isSuccess) return { success: true, message: d.message || 'Registration confirmed' };
  throw new Error(getErrorMessage(res));
}

export async function fetchEnrollments(): Promise<EnrollmentsData | null> {
  const res = await api.get<ApiResponse<EnrollmentsData>>('/api/student/registration/enrollments');
  return unwrap(res);
}

export async function dropCourse(enrollmentId: number): Promise<{ success: boolean; message: string }> {
  const res = await api.post<ApiResponse<any>>(`/api/student/registration/enrollments/${enrollmentId}/drop`, {});
  const d = res.data as ApiResponse<any> & { message?: string };
  if (d?.isSuccess) return { success: true, message: d.message || 'Course dropped' };
  throw new Error(getErrorMessage(res));
}

export async function leaveWaitlist(enrollmentId: number): Promise<{ success: boolean; message: string }> {
  const res = await api.post<ApiResponse<any>>(`/api/student/registration/enrollments/${enrollmentId}/leave-waitlist`, {});
  const d = res.data as ApiResponse<any> & { message?: string };
  if (d?.isSuccess) return { success: true, message: d.message || 'Left waitlist' };
  throw new Error(getErrorMessage(res));
}
