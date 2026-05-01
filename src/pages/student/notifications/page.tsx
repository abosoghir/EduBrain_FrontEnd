import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../../lib/api';
import type { ApiResponse } from '../../../lib/api';
import type { StudentNotification } from '../../../types/student';

import { NOTIFICATION_TYPE_LABELS } from '../../../lib/enums';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    api.get<ApiResponse<StudentNotification[]>>('/api/student/notifications')
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && res.data.data) {
          setNotifications(res.data.data);
        } else {
          setNotifications([]);
        }
      })
      .catch(() => {
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.isRead);
  }, [notifications, filter]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const typeIcon = (type: number) => {
    const map: Record<number, string> = {
      0: 'ri-calendar-close-line',
      1: 'ri-alarm-warning-line',
      2: 'ri-error-warning-line',
      3: 'ri-megaphone-line',
      4: 'ri-money-dollar-circle-line',
      5: 'ri-edit-line',
      6: 'ri-lock-line',
      7: 'ri-bar-chart-line',
      8: 'ri-questionnaire-line',
      9: 'ri-calendar-event-line',
    };
    return map[type] || 'ri-notification-line';
  };

  const typeColor = (type: number) => {
    const map: Record<number, string> = {
      0: 'bg-red-50 text-red-500',
      1: 'bg-amber-50 text-amber-500',
      2: 'bg-red-50 text-red-500',
      3: 'bg-blue-50 text-blue-500',
      4: 'bg-orange-50 text-orange-500',
      5: 'bg-emerald-50 text-emerald-500',
      6: 'bg-slate-50 text-slate-500',
      7: 'bg-violet-50 text-violet-500',
      8: 'bg-pink-50 text-pink-500',
      9: 'bg-cyan-50 text-cyan-500',
    };
    return map[type] || 'bg-gray-50 text-gray-500';
  };

  const handleMarkRead = async (notificationId: number) => {
    try {
      await api.post(`/api/student/notifications/${notificationId}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
      );
    } catch {
      // Still update locally on error
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
      );
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-medium">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filter === f ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Read'}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading notifications...
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((n) => (
          <div
            key={n.notificationId}
            className={`bg-white rounded-xl border p-4 transition-all ${
              n.isRead ? 'border-gray-100' : 'border-emerald-200 bg-emerald-50/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColor(n.type)}`}>
                <i className={`${typeIcon(n.type)} text-sm`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-medium ${n.isRead ? 'text-slate-600' : 'text-slate-800'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.notificationId)}
                      className="shrink-0 text-[10px] text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <i className="ri-user-line" />
                    {n.senderName}
                  </span>
                  <span>{new Date(n.sentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`px-1.5 py-0.5 rounded ${typeColor(n.type)}`}>
                    {NOTIFICATION_TYPE_LABELS[n.type as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-notification-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">
            {filter === 'unread' ? 'No unread notifications.' : filter === 'read' ? 'No read notifications.' : 'No notifications yet.'}
          </p>
        </div>
      )}
    </div>
  );
}