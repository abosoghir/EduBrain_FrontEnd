import React, { useEffect, useState, useCallback } from 'react';
import { fetchAdvisorNotifications, markNotificationAsRead } from '@/lib/advisorPortalApi';
import type { AdvisorNotificationDto, GetAdvisorNotificationsResponse } from '@/types/advisor';
import { NOTIFICATION_TYPE_LABELS, NotificationType } from '@/lib/enums';

export default function AdvisorNotifications() {
  const [data, setData] = useState<GetAdvisorNotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const res = await fetchAdvisorNotifications({
      isRead: filter === 'unread' ? false : undefined,
      page,
      pageSize,
    });
    setData(res.data);
    setLoading(false);
  }, [filter, page]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const notifications = data?.notifications?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const pagination = data?.notifications;

  const handleMarkAsRead = useCallback(async (notificationId: number) => {
    const res = await markNotificationAsRead(notificationId);
    if (res.success) {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1),
          notifications: {
            ...prev.notifications,
            items: prev.notifications.items.map((n) =>
              n.notificationId === notificationId ? { ...n, isRead: true } : n
            ),
          },
        };
      });
    }
  }, []);

  const typeIcon = (type: number) => {
    const map: Record<number, string> = {
      [NotificationType.LectureCancelled]: 'ri-close-circle-line text-red-500',
      [NotificationType.ExamReminder]: 'ri-alarm-warning-line text-amber-500',
      [NotificationType.AcademicWarning]: 'ri-alert-line text-orange-500',
      [NotificationType.GeneralAnnouncement]: 'ri-article-line text-slate-500',
      [NotificationType.FeesDue]: 'ri-money-dollar-circle-line text-emerald-500',
      [NotificationType.RegistrationOpen]: 'ri-open-arm-line text-blue-500',
      [NotificationType.RegistrationClosed]: 'ri-lock-line text-slate-500',
      [NotificationType.GradePublished]: 'ri-star-line text-violet-500',
      [NotificationType.QuizAdded]: 'ri-file-list-line text-slate-500',
      [NotificationType.ScheduleChanged]: 'ri-calendar-event-line text-amber-500',
    };
    return map[type] || 'ri-notification-line text-slate-500';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium">{unreadCount} unread</span>
          )}
        </div>
      </div>

      {loading && <div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading notifications...</div>}

      {/* Filters */}
      <div className="flex gap-1 mb-6">
        {([{ key: 'all' as const, label: `All` }, { key: 'unread' as const, label: `Unread (${unreadCount})` }]).map((f) => (
          <button key={f.key} type="button" onClick={() => { setFilter(f.key); setPage(1); }} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${filter === f.key ? 'bg-amber-600 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>{f.label}</button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.map((n: AdvisorNotificationDto) => (
          <div key={n.notificationId} className={`rounded-xl border p-4 transition-colors ${n.isRead ? 'bg-white border-gray-100' : 'bg-amber-50/30 border-amber-100'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${n.isRead ? 'bg-gray-50' : 'bg-amber-50'}`}>
                <i className={`${typeIcon(n.type)} text-sm`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`text-sm ${n.isRead ? 'font-medium text-slate-700' : 'font-semibold text-slate-800'}`}>{n.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-2" />}
                </div>
                <div className="flex items-center flex-wrap gap-3 mt-2 text-[10px] text-slate-400">
                  {n.senderName && (
                    <span className="flex items-center gap-1"><i className="ri-user-line" />{n.senderName}</span>
                  )}
                  <span className="flex items-center gap-1"><i className="ri-calendar-line" />{new Date(n.dateTime).toLocaleDateString()}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${n.isRead ? 'bg-gray-50 text-gray-500' : 'bg-amber-50 text-amber-600'}`}>
                    {NOTIFICATION_TYPE_LABELS[n.type as NotificationType]}
                  </span>
                  {!n.isRead && (
                    <button type="button" onClick={() => handleMarkAsRead(n.notificationId)} className="text-amber-600 hover:underline font-medium ml-auto">
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-500">Page {pagination.pageNumber} of {pagination.totalPages}</p>
          <div className="flex gap-1">
            <button type="button" disabled={!pagination.hasPreviousPage} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-100 text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <button type="button" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-100 text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-notification-line text-3xl text-slate-400" /></div>
          <p className="text-sm text-slate-500">No notifications to display.</p>
        </div>
      )}
    </div>
  );
}