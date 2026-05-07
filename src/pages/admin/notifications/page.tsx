import React, { useEffect, useState, useCallback } from 'react';
import { fetchNotifications, sendNotification } from '@/lib/notificationApi';
import type { NotificationItem, NotificationFilterParams, SendNotificationForm } from '@/types/admin';
import { NOTIFICATION_TYPE_LABELS, NotificationType } from '@/lib/enums';

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

const EMPTY_FORM: SendNotificationForm = { title: '', message: '', type: NotificationType.GeneralAnnouncement, sendToAll: true };

const TYPE_ICON: Record<number, string> = {
  0: 'ri-calendar-close-line', 1: 'ri-file-list-line', 2: 'ri-alert-line', 3: 'ri-megaphone-line',
  4: 'ri-money-dollar-circle-line', 5: 'ri-edit-line', 6: 'ri-lock-line', 7: 'ri-bar-chart-line',
  8: 'ri-questionnaire-line', 9: 'ri-calendar-event-line',
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, totalCount: 0, hasPreviousPage: false, hasNextPage: false });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<NotificationFilterParams>({});
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<SendNotificationForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const loadData = useCallback(async (page = 1) => {
    setLoading(true);
    const res = await fetchNotifications({ ...filters, page, pageSize: 20 });
    if (res.data) {
      setNotifications(res.data.items);
      setPagination({ page: res.data.pageNumber, totalPages: res.data.totalPages, totalCount: res.data.totalCount, hasPreviousPage: res.data.hasPreviousPage, hasNextPage: res.data.hasNextPage });
    } else { setNotifications([]); if (res.error) showToast(res.error, false); }
    setLoading(false);
  }, [filters]);

  useEffect(() => { loadData(1); }, [loadData]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const handleOpenCreate = () => { setForm(EMPTY_FORM); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    // Clean the payload: omit empty/unused targeting fields
    const payload: SendNotificationForm = {
      title: form.title,
      message: form.message,
      type: form.type,
    };
    if (form.sendToAll) {
      payload.sendToAll = true;
    } else {
      if (form.studentIds && form.studentIds.length > 0) payload.studentIds = form.studentIds;
      if (form.departmentId) payload.departmentId = form.departmentId;
      if (form.yearLevel !== undefined && form.yearLevel !== null) payload.yearLevel = form.yearLevel;
    }
    const res = await sendNotification(payload);
    setSubmitting(false);
    if (res.data) {
      showToast(`Notification sent to ${res.data.recipientCount} recipients`);
      setShowModal(false); loadData(1);
    } else showToast(res.error || 'Send failed', false);
  };

  // Client-side search filter on top of server data
  const filtered = search.trim()
    ? notifications.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase()))
    : notifications;

  const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return d; } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
          {!loading && <p className="text-xs text-slate-400 mt-0.5">{pagination.totalCount} total</p>}
        </div>
        <button type="button" onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap">
          <i className="ri-send-plane-line" /> Send Notification
        </button>
      </div>

      {loading && <div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading notifications...</div>}
      {toast && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${toast.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <i className={toast.ok ? 'ri-check-line' : 'ri-error-warning-line'} /> {toast.msg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or message..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <select value={filters.type ?? ''} onChange={e => setFilters(p => ({ ...p, type: e.target.value !== '' ? Number(e.target.value) : undefined }))} className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
          <option value="">All Types</option>
          {Object.entries(NOTIFICATION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.isRead === undefined ? '' : String(filters.isRead)} onChange={e => setFilters(p => ({ ...p, isRead: e.target.value === '' ? undefined : e.target.value === 'true' }))} className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
          <option value="">All Status</option>
          <option value="true">Read</option>
          <option value="false">Unread</option>
        </select>
      </div>

      {/* Notification cards */}
      <div className="space-y-3">
        {filtered.map(n => (
          <div key={n.notificationId} className={`bg-white rounded-xl border ${n.isRead ? 'border-gray-100' : 'border-blue-100'} p-5`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${n.isRead ? 'bg-slate-50 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>
                <i className={`${TYPE_ICON[n.type] || 'ri-notification-line'} text-sm`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-800">{n.title}</h3>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600">{n.typeDisplay || NOTIFICATION_TYPE_LABELS[n.type as NotificationType]}</span>
                  {!n.isRead && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">Unread</span>}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-2">{n.message}</p>
                <div className="flex items-center flex-wrap gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><i className="ri-user-line" /> {n.senderName}</span>
                  <span className="flex items-center gap-1"><i className="ri-calendar-line" /> {fmtDate(n.sentDate)}</span>
                  <span className="flex items-center gap-1"><i className="ri-group-line" /> {n.recipientCount} recipients</span>
                  {n.readAt && <span className="flex items-center gap-1"><i className="ri-eye-line" /> Read: {fmtDate(n.readAt)}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-notification-line text-3xl text-slate-400" /></div>
          <p className="text-sm text-slate-500">No notifications found.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
          <span>Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)</span>
          <div className="flex gap-2">
            <button type="button" disabled={!pagination.hasPreviousPage} onClick={() => loadData(pagination.page - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-gray-50 disabled:opacity-40">Previous</button>
            <button type="button" disabled={!pagination.hasNextPage} onClick={() => loadData(pagination.page + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-gray-50 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Send Notification</h2>
              <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Title *</label>
                <input type="text" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Message *</label>
                <textarea required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={3} className={`${inputCls} resize-none`} />
                <p className="text-[10px] text-slate-400 text-right mt-1">{form.message.length} chars</p>
              </div>
              <div>
                <label className={labelCls}>Notification Type *</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: Number(e.target.value) }))} className={inputCls}>
                  {Object.entries(NOTIFICATION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {/* Targeting */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Target Audience</h3>
                <label className="flex items-center gap-2 text-sm text-slate-600 mb-3 cursor-pointer">
                  <input type="checkbox" checked={form.sendToAll ?? false} onChange={e => setForm(p => ({ ...p, sendToAll: e.target.checked, studentIds: e.target.checked ? [] : p.studentIds, departmentId: e.target.checked ? undefined : p.departmentId, yearLevel: e.target.checked ? undefined : p.yearLevel }))}
                    className="rounded border-gray-300 text-slate-600 focus:ring-slate-400" />
                  Send to all users
                </label>
                {!form.sendToAll && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Department ID</label>
                      <input type="number" min={1} value={form.departmentId ?? ''} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value ? Number(e.target.value) : undefined }))} className={inputCls} placeholder="Optional" />
                    </div>
                    <div>
                      <label className={labelCls}>Year Level</label>
                      <select value={form.yearLevel ?? ''} onChange={e => setForm(p => ({ ...p, yearLevel: e.target.value ? Number(e.target.value) : undefined }))} className={inputCls}>
                        <option value="">All Years</option>
                        <option value={0}>Freshman</option>
                        <option value={1}>Sophomore</option>
                        <option value={2}>Junior</option>
                        <option value={3}>Senior</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Student IDs (comma-separated)</label>
                      <input type="text" value={(form.studentIds ?? []).join(', ')} onChange={e => setForm(p => ({ ...p, studentIds: e.target.value.split(',').map(s => Number(s.trim())).filter(n => n > 0) }))} className={inputCls} placeholder="e.g. 5001, 5002, 5003" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting || !form.title || !form.message} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Sending...</span> : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}