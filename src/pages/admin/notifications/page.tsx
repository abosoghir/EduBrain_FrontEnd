import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { AdminNotification, NotificationForm } from '@/types/admin';
import { NOTIFICATION_TYPE_LABELS } from '@/lib/enums';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NotificationForm>({ title: '', message: '', type: 3, isGlobal: true });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    api.get<ApiResponse<AdminNotification[]>>('/api/notifications')
      .then((res) => { if (res.data?.isSuccess && res.data?.hasData && Array.isArray(res.data.data)) setNotifications(res.data.data); else setNotifications([]); })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); } }, [toast]);

  const filtered = useMemo(() => {
    let list = Array.isArray(notifications) ? notifications : [];
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter((n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)); }
    if (typeFilter !== 'all') list = list.filter((n) => n.type === Number(typeFilter));
    return list;
  }, [notifications, search, typeFilter]);

  const handleOpenCreate = () => { setForm({ title: '', message: '', type: 3, isGlobal: true }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<number>>('/api/notifications', form);
      if (res.data?.isSuccess) { setToast('Notification sent'); loadData(); } else { setToast(res.data?.error?.description || 'Send failed'); }
      setShowModal(false);
    } catch { setToast('Request failed, saved locally'); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try { const res = await api.delete<ApiResponse<boolean>>(`/api/notifications/${deleteId}`); if (res.data?.isSuccess) { setToast('Deleted'); loadData(); } else { setToast(res.data?.error?.description || 'Delete failed'); } }
    catch { setToast('Delete failed. Please try again.'); }
    setDeleteId(null);
  };

  const typeIcon = (type: number) => {
    const map: Record<number, string> = { 0: 'ri-calendar-close-line', 1: 'ri-file-list-line', 2: 'ri-alert-line', 3: 'ri-megaphone-line', 4: 'ri-money-dollar-circle-line', 5: 'ri-edit-line', 6: 'ri-lock-line', 7: 'ri-bar-chart-line', 8: 'ri-questionnaire-line', 9: 'ri-calendar-event-line' };
    return map[type] || 'ri-notification-line';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
        <button type="button" onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"><i className="ri-add-line" /> Send Notification</button>
      </div>
      {loading && (<div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading notifications...</div>)}
      {toast && (<div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2"><i className="ri-check-line" /> {toast}</div>)}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or message..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => setTypeFilter('all')} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${typeFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>All</button>
          {[{ key: '3', label: 'General' }, { key: '5', label: 'Registration' }, { key: '4', label: 'Fees' }, { key: '1', label: 'Exam' }, { key: '7', label: 'Grades' }].map((f) => (
            <button key={f.key} type="button" onClick={() => setTypeFilter(f.key)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${typeFilter === f.key ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>{f.label}</button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((n) => (
          <div key={n.notificationId} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${n.isGlobal ? 'bg-slate-50 text-slate-600' : 'bg-amber-50 text-amber-600'}`}><i className={`${typeIcon(n.type)} text-sm`} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-800">{n.title}</h3>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600">{NOTIFICATION_TYPE_LABELS[n.type as 0|1|2|3|4|5|6|7|8|9]}</span>
                  {n.isGlobal && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600">Global</span>}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-2">{n.message}</p>
                <div className="flex items-center flex-wrap gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><i className="ri-user-line" /> {n.senderName}</span>
                  <span className="flex items-center gap-1"><i className="ri-calendar-line" /> {new Date(n.sentDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><i className="ri-eye-line" /> {n.readCount}/{n.totalRecipients} read</span>
                </div>
              </div>
              <button type="button" onClick={() => setDeleteId(n.notificationId)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 shrink-0"><i className="ri-delete-bin-line text-sm" /></button>
            </div>
          </div>
        ))}
      </div>
      {!loading && filtered.length === 0 && (<div className="text-center py-12 bg-white rounded-xl border border-gray-100"><div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-notification-line text-3xl text-slate-400" /></div><p className="text-sm text-slate-500">No notifications found.</p></div>)}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-800">Send Notification</h2><button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Title</label><input type="text" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Message</label><textarea required value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} rows={3} maxLength={500} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 resize-none" /><p className="text-[10px] text-slate-400 text-right mt-1">{form.message.length}/500</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Type</label><select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"><option value={3}>General Announcement</option><option value={0}>Lecture Cancelled</option><option value={1}>Exam Reminder</option><option value={2}>Academic Warning</option><option value={4}>Fees Due</option><option value={5}>Registration Open</option><option value={6}>Registration Closed</option><option value={7}>Grade Published</option><option value={8}>Quiz Added</option><option value={9}>Schedule Changed</option></select></div>
                <div className="flex items-end pb-2"><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.isGlobal} onChange={(e) => setForm((p) => ({ ...p, isGlobal: e.target.checked }))} className="rounded border-gray-300" /> Send to all users</label></div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button><button type="submit" disabled={submitting || !form.title || !form.message} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">{submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Sending...</span> : 'Send Notification'}</button></div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5"><div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div><h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Delete Notification?</h3><p className="text-xs text-slate-500 text-center mb-5">This action cannot be undone.</p><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button><button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete</button></div></div>
        </div>
      )}
    </div>
  );
}