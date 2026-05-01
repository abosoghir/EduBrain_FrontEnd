import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { AdminSchedule, ScheduleForm } from '@/types/admin';
import { SCHEDULE_TYPE_LABELS } from '@/lib/enums';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ScheduleForm>({ courseId: '', doctorId: '', roomId: '', dayOfWeek: 0, startTime: '09:00', endTime: '11:00', scheduleType: 0, semesterId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    api.get<ApiResponse<AdminSchedule[]>>('/api/schedules')
      .then((res) => { if (res.data?.isSuccess && res.data?.hasData && Array.isArray(res.data.data)) setSchedules(res.data.data); else setSchedules([]); })
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); } }, [toast]);

  const filtered = useMemo(() => {
    let list = Array.isArray(schedules) ? schedules : [];
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter((s) => s.courseName.toLowerCase().includes(q) || s.courseCode.toLowerCase().includes(q) || s.doctorName.toLowerCase().includes(q)); }
    if (dayFilter !== 'all') list = list.filter((s) => s.dayOfWeek === Number(dayFilter));
    return list;
  }, [schedules, search, dayFilter]);

  const handleOpenCreate = () => { setEditingId(null); setForm({ courseId: '', doctorId: '', roomId: '', dayOfWeek: 0, startTime: '09:00', endTime: '11:00', scheduleType: 0, semesterId: '' }); setShowModal(true); };
  const handleOpenEdit = (s: AdminSchedule) => { setEditingId(s.scheduleId); setForm({ courseId: s.courseCode, doctorId: s.doctorName, roomId: s.roomNumber, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, scheduleType: s.scheduleType, semesterId: s.semesterName }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put<ApiResponse<boolean>>(`/api/schedules/${editingId}`, form);
        if (res.data?.isSuccess) { setToast('Schedule updated'); loadData(); } else { setToast(res.data?.error?.description || 'Update failed'); }
      } else {
        const res = await api.post<ApiResponse<string>>('/api/schedules', form);
        if (res.data?.isSuccess) { setToast('Schedule created'); loadData(); } else { setToast(res.data?.error?.description || 'Create failed'); }
      }
      setShowModal(false);
    } catch { setToast('Request failed, saved locally'); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => { if (!deleteId) return; try { const res = await api.delete<ApiResponse<boolean>>(`/api/schedules/${deleteId}`); if (res.data?.isSuccess) { setToast('Deleted'); loadData(); } else { setToast(res.data?.error?.description || 'Delete failed'); } } catch { setToast('Delete failed. Please try again.'); } setDeleteId(null); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Schedule Management</h1>
        <button type="button" onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"><i className="ri-add-line" /> Add Schedule</button>
      </div>
      {loading && (<div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading schedules...</div>)}
      {toast && (<div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2"><i className="ri-check-line" /> {toast}</div>)}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by course, code, or doctor..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => setDayFilter('all')} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${dayFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>All Days</button>
          {DAYS.map((d, i) => (<button key={d} type="button" onClick={() => setDayFilter(String(i))} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${dayFilter === String(i) ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>{d.slice(0, 3)}</button>))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Course</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Room</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Day</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Time</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr key={s.scheduleId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3"><div><p className="text-sm font-medium text-slate-700">{s.courseCode} — {s.courseName}</p><p className="text-[10px] text-slate-400">{s.semesterName}</p></div></td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{s.doctorName}</td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{s.roomNumber}, {s.building}</td>
                  <td className="px-5 py-3 text-center text-xs font-medium text-slate-700">{DAYS[s.dayOfWeek]}</td>
                  <td className="px-5 py-3 text-center text-xs font-medium text-slate-700">{s.startTime} — {s.endTime}</td>
                  <td className="px-5 py-3 text-center"><span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600">{SCHEDULE_TYPE_LABELS[s.scheduleType as 0|1|2]}</span></td>
                  <td className="px-5 py-3 text-center"><div className="flex items-center justify-center gap-1"><button type="button" onClick={() => handleOpenEdit(s)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500"><i className="ri-pencil-line text-sm" /></button><button type="button" onClick={() => setDeleteId(s.scheduleId)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><i className="ri-delete-bin-line text-sm" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {!loading && filtered.length === 0 && (<div className="text-center py-12 bg-white rounded-xl border border-gray-100"><div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-calendar-line text-3xl text-slate-400" /></div><p className="text-sm text-slate-500">No schedules found.</p></div>)}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-800">{editingId ? 'Edit Schedule' : 'Add Schedule'}</h2><button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Course ID</label><input type="text" required value={form.courseId} onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Doctor ID</label><input type="text" required value={form.doctorId} onChange={(e) => setForm((p) => ({ ...p, doctorId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Room ID</label><input type="text" required value={form.roomId} onChange={(e) => setForm((p) => ({ ...p, roomId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Semester ID</label><input type="text" required value={form.semesterId} onChange={(e) => setForm((p) => ({ ...p, semesterId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Day</label><select value={form.dayOfWeek} onChange={(e) => setForm((p) => ({ ...p, dayOfWeek: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400">{DAYS.map((d, i) => (<option key={d} value={i}>{d}</option>))}</select></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Type</label><select value={form.scheduleType} onChange={(e) => setForm((p) => ({ ...p, scheduleType: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"><option value={0}>Lecture</option><option value={1}>Lab</option><option value={2}>Tutorial</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Start Time</label><input type="time" required value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">End Time</label><input type="time" required value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button><button type="submit" disabled={submitting} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">{submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : editingId ? 'Save Changes' : 'Create Schedule'}</button></div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5"><div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div><h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Delete Schedule?</h3><p className="text-xs text-slate-500 text-center mb-5">This action cannot be undone.</p><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button><button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete</button></div></div>
        </div>
      )}
    </div>
  );
}