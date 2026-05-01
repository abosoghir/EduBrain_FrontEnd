import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { AdvisorNotification } from '@/types/advisor';

import { NOTIFICATION_TYPE_LABELS } from '@/lib/enums';

export default function AdvisorNotifications() {
  const [notifications, setNotifications] = useState<AdvisorNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    api.get<ApiResponse<AdvisorNotification[]>>('/api/advisor/notifications')
      .then((res) => {
        const payload = res.data;
        if (payload.isSuccess && payload.hasData && Array.isArray(payload.data)) {
          setNotifications(payload.data);
        } else {
          setNotifications([]);
        }
      })
      .catch(() => {
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = useCallback(
    async (notificationId: number) => {
      try {
        await api.post<ApiResponse<boolean>>(`/api/advisor/notifications/${notificationId}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
        );
      } catch {
        // Show error
      }
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post<ApiResponse<boolean>>('/api/advisor/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  }, []);

  const typeIcon = (type: number) => {
    const map: Record<number, string> = {
      0: 'ri-close-circle-line text-red-500',
      1: 'ri-alarm-warning-line text-amber-500',
      2: 'ri-alert-line text-orange-500',
      3: 'ri-article-line text-slate-500',
      4: 'ri-money-dollar-circle-line text-emerald-500',
      5: 'ri-open-arm-line text-blue-500',
      6: 'ri-lock-line text-slate-500',
      7: 'ri-star-line text-violet-500',
      8: 'ri-file-list-line text-slate-500',
      9: 'ri-calendar-event-line text-amber-500',
    };
    return map[type] || 'ri-notification-line text-slate-500';
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium whitespace-nowrap"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading notifications...
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1 mb-6">
        {[
          { key: 'all' as const, label: `All (${notifications.length})` },
          { key: 'unread' as const, label: `Unread (${unreadCount})` },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filter === f.key
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filtered.map((n) => (
          <div
            key={n.notificationId}
            className={`rounded-xl border p-4 transition-colors ${
              n.isRead ? 'bg-white border-gray-100' : 'bg-amber-50/30 border-amber-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${n.isRead ? 'bg-gray-50' : 'bg-amber-50'}`}>
                <i className={`${typeIcon(n.type)} text-sm`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`text-sm ${n.isRead ? 'font-medium text-slate-700' : 'font-semibold text-slate-800'}`}>
                      {n.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-2" />
                  )}
                </div>
                <div className="flex items-center flex-wrap gap-3 mt-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <i className="ri-user-line" />
                    {n.senderName}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ri-calendar-line" />
                    {new Date(n.sentDate).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${n.isRead ? 'bg-gray-50 text-gray-500' : 'bg-amber-50 text-amber-600'}`}>
                    {NOTIFICATION_TYPE_LABELS[n.type as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9]}
                  </span>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(n.notificationId)}
                      className="text-amber-600 hover:underline font-medium ml-auto"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-notification-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No notifications to display.</p>
        </div>
      )}
    </div>
  );
}