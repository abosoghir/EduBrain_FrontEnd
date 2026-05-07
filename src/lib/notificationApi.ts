// ============================================================
// Notifications Management API Service
// ============================================================

import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type {
  PaginatedResponse,
  NotificationItem,
  NotificationFilterParams,
  SendNotificationForm,
  SendNotificationResponse,
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

function getErrorMessage(res: { data: unknown }): string {
  const d = res.data as ApiResponse<unknown>;
  if (d && typeof d === 'object' && 'error' in d && d.error) return d.error.description || 'Operation failed';
  return 'Operation failed';
}

// GET /api/notifications
export async function fetchNotifications(
  params: NotificationFilterParams = {}
): Promise<{ data: PaginatedResponse<NotificationItem> | null; error?: string }> {
  try {
    const qs = buildQueryString({
      studentId: params.studentId,
      type: params.type,
      isRead: params.isRead,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    });
    const res = await api.get<unknown>(`/api/notifications${qs}`);
    const raw = res.data as ApiResponse<PaginatedResponse<NotificationItem>>;
    if (raw && 'isSuccess' in raw && raw.isSuccess && raw.hasData && raw.data) {
      const inner = raw.data as PaginatedResponse<NotificationItem>;
      if (inner && Array.isArray(inner.items)) return { data: inner };
    }
    // Fallback: direct paginated
    const direct = res.data as unknown as PaginatedResponse<NotificationItem>;
    if (direct && Array.isArray(direct.items)) return { data: direct };
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to fetch notifications' };
  }
}

// POST /api/notifications/send
export async function sendNotification(
  form: SendNotificationForm
): Promise<{ data: SendNotificationResponse | null; error?: string }> {
  try {
    const res = await api.post<unknown>('/api/notifications/send', form);
    const raw = res.data as Record<string, unknown>;
    if (raw && 'isSuccess' in raw && raw['isSuccess'] && raw['data']) {
      return { data: raw['data'] as unknown as SendNotificationResponse };
    }
    if (raw && 'notificationId' in raw) {
      return { data: raw as unknown as SendNotificationResponse };
    }
    return { data: null, error: getErrorMessage(res) };
  } catch {
    return { data: null, error: 'Failed to send notification' };
  }
}
