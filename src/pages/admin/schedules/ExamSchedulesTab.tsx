import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchExamSchedules, createExamSchedule, updateExamSchedule, deleteExamSchedule, publishExamSchedule, fetchSemesters, fetchDepartmentsDropdown, fetchRoomsDropdown } from '@/lib/scheduleApi';
import type { ExamScheduleItem, ExamScheduleFilterParams, CreateExamScheduleForm, UpdateExamScheduleForm, PaginatedResponse, SemesterOption, DepartmentOption, RoomOption } from '@/types/admin';
import { EXAM_TYPE_LABELS } from '@/lib/enums';

export default function ExamSchedulesTab() {
  const [exams, setExams] = useState<ExamScheduleItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ExamScheduleFilterParams>({});

  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ExamScheduleItem | null>(null);
  const [form, setForm] = useState<CreateExamScheduleForm>({ courseInstanceId: 0, examType: 0, examDate: '', startTime: '09:00:00', endTime: '11:00:00' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const loadDropdowns = useCallback(async () => {
    const [s, dep, r] = await Promise.all([fetchSemesters(), fetchDepartmentsDropdown(), fetchRoomsDropdown()]);
    setSemesters(s); setDepartments(dep); setRooms(r);
  }, []);

  const loadData = useCallback(async (page = 1) => {
    setLoading(true);
    const res = await fetchExamSchedules({ ...filters, page, pageSize: 50 });
    if (res.data) {
      setExams(res.data.items);
      setPagination({ page: res.data.page, pageSize: res.data.pageSize, totalCount: res.data.totalCount, totalPages: res.data.totalPages, hasPreviousPage: res.data.hasPreviousPage, hasNextPage: res.data.hasNextPage });
    } else { setExams([]); if (res.error) setToast({ msg: res.error, type: 'error' }); }
    setLoading(false);
  }, [filters]);

  useEffect(() => { loadDropdowns(); }, [loadDropdowns]);
  useEffect(() => { loadData(1); }, [loadData]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const handleOpenCreate = () => { setEditingItem(null); setForm({ courseInstanceId: 0, examType: 0, examDate: '', startTime: '09:00:00', endTime: '11:00:00' }); setShowModal(true); };

  const handleOpenEdit = (item: ExamScheduleItem) => {
    setEditingItem(item);
    setForm({ courseInstanceId: item.courseInstanceId, examType: item.examType, examDate: item.examDate?.split('T')[0] || '', startTime: item.startTime, endTime: item.endTime, roomId: item.roomId, notes: item.notes || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editingItem) {
        const upd: UpdateExamScheduleForm = { examDate: form.examDate, startTime: form.startTime, endTime: form.endTime, roomId: form.roomId, notes: form.notes, publishImmediately: form.publishImmediately };
        const res = await updateExamSchedule(editingItem.examScheduleId, upd);
        if (res.data) { setToast({ msg: res.data.message || 'Updated', type: 'success' }); loadData(pagination.page); }
        else setToast({ msg: res.error || 'Update failed', type: 'error' });
      } else {
        if (!form.courseInstanceId || !form.examDate) { setToast({ msg: 'Course Instance and Exam Date are required', type: 'error' }); setSubmitting(false); return; }
        const res = await createExamSchedule(form);
        if (res.data) { setToast({ msg: res.data.message || 'Created', type: 'success' }); loadData(1); }
        else setToast({ msg: res.error || 'Create failed', type: 'error' });
      }
      setShowModal(false);
    } catch { setToast({ msg: 'Request failed', type: 'error' }); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const res = await deleteExamSchedule(deleteId);
    if (res.success) { setToast({ msg: 'Exam schedule deleted', type: 'success' }); loadData(pagination.page); }
    else setToast({ msg: res.error || 'Delete failed', type: 'error' });
    setDeleteId(null);
  };

  const handlePublish = async (id: number) => {
    const res = await publishExamSchedule(id);
    if (res.success) { setToast({ msg: 'Published successfully', type: 'success' }); loadData(pagination.page); }
    else setToast({ msg: res.error || 'Publish failed', type: 'error' });
  };

  const fmtTime = (t: string) => t?.slice(0, 5) || t;
  const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; } };

  return (
    <div>
      {toast && (<div className={`mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}><i className={`ri-${toast.type === 'success' ? 'check' : 'error-warning'}-line`} /> {toast.msg}</div>)}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select value={filters.semesterId ?? ''} onChange={e => setFilters(p => ({ ...p, semesterId: e.target.value ? Number(e.target.value) : undefined }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200">
          <option value="">All Semesters</option>
          {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filters.departmentId ?? ''} onChange={e => setFilters(p => ({ ...p, departmentId: e.target.value ? Number(e.target.value) : undefined }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.description}</option>)}
        </select>
        <select value={filters.examType ?? ''} onChange={e => setFilters(p => ({ ...p, examType: e.target.value !== '' ? Number(e.target.value) : undefined }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200">
          <option value="">All Exam Types</option>
          <option value={0}>Midterm</option><option value={1}>Final</option><option value={2}>Practical</option><option value={3}>Oral</option>
        </select>
        <select value={filters.isPublished === undefined ? '' : String(filters.isPublished)} onChange={e => setFilters(p => ({ ...p, isPublished: e.target.value === '' ? undefined : e.target.value === 'true' }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200">
          <option value="">All Status</option>
          <option value="true">Published</option><option value="false">Draft</option>
        </select>
        <input type="date" value={filters.startDate ?? ''} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value || undefined }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" placeholder="Start Date" />
        <input type="date" value={filters.endDate ?? ''} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value || undefined }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" placeholder="End Date" />
      </div>

      <div className="flex justify-end mb-4">
        <button type="button" onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"><i className="ri-add-line" /> Add Exam Schedule</button>
      </div>

      {loading && <div className="flex items-center gap-2 text-slate-400 text-sm mb-4"><i className="ri-loader-4-line animate-spin" /> Loading...</div>}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50">
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase">Course</th>
              <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase">Type</th>
              <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase">Date</th>
              <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase">Time</th>
              <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase">Duration</th>
              <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase">Room</th>
              <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase">Doctor</th>
              <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase">Enrolled</th>
              <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {exams.map(ex => (
                <tr key={ex.examScheduleId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3"><p className="text-sm font-medium text-slate-700">{ex.courseCode}</p><p className="text-[10px] text-slate-400">{ex.courseName}</p></td>
                  <td className="px-3 py-3 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${ex.examType === 0 ? 'bg-orange-50 text-orange-600' : ex.examType === 1 ? 'bg-red-50 text-red-600' : ex.examType === 2 ? 'bg-teal-50 text-teal-600' : 'bg-indigo-50 text-indigo-600'}`}>{ex.examTypeDisplay || EXAM_TYPE_LABELS[ex.examType as 0|1|2|3]}</span></td>
                  <td className="px-3 py-3 text-center text-xs text-slate-700">{fmtDate(ex.examDate)}</td>
                  <td className="px-3 py-3 text-center text-xs text-slate-700">{fmtTime(ex.startTime)} – {fmtTime(ex.endTime)}</td>
                  <td className="px-3 py-3 text-center text-xs text-slate-600">{ex.duration?.slice(0,5) || '—'}</td>
                  <td className="px-3 py-3 text-center text-xs text-slate-600">{ex.roomName || '—'}{ex.roomBuilding ? <span className="block text-[10px] text-slate-400">{ex.roomBuilding}</span> : null}</td>
                  <td className="px-3 py-3 text-center text-xs text-slate-600">{ex.doctorName}</td>
                  <td className="px-3 py-3 text-center text-xs text-slate-600">{ex.enrolledCount}</td>
                  <td className="px-3 py-3 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${ex.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{ex.status || (ex.isPublished ? 'Published' : 'Draft')}</span></td>
                  <td className="px-3 py-3 text-center"><div className="flex items-center justify-center gap-1">
                    {!ex.isPublished && <button type="button" onClick={() => handlePublish(ex.examScheduleId)} title="Publish" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-emerald-500"><i className="ri-send-plane-line text-sm" /></button>}
                    <button type="button" onClick={() => handleOpenEdit(ex)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500"><i className="ri-pencil-line text-sm" /></button>
                    <button type="button" onClick={() => setDeleteId(ex.examScheduleId)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><i className="ri-delete-bin-line text-sm" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

      {!loading && exams.length === 0 && (<div className="text-center py-12 bg-white rounded-xl border border-gray-100 mt-2"><div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-file-list-3-line text-3xl text-slate-400" /></div><p className="text-sm text-slate-500">No exam schedules found.</p></div>)}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white"><h2 className="text-sm font-semibold text-slate-800">{editingItem ? 'Edit Exam Schedule' : 'Add Exam Schedule'}</h2><button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {!editingItem && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-slate-600 mb-1">Course Instance ID *</label><input type="number" required min={1} value={form.courseInstanceId || ''} onChange={e => setForm(p => ({ ...p, courseInstanceId: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" /></div>
                  <div><label className="block text-xs font-medium text-slate-600 mb-1">Exam Type *</label><select value={form.examType} onChange={e => setForm(p => ({ ...p, examType: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"><option value={0}>Midterm</option><option value={1}>Final</option><option value={2}>Practical</option><option value={3}>Oral</option></select></div>
                </div>
              )}
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Exam Date *</label><input type="date" required value={form.examDate} onChange={e => setForm(p => ({ ...p, examDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Start Time *</label><input type="time" required value={form.startTime?.slice(0,5)} onChange={e => setForm(p => ({ ...p, startTime: e.target.value + ':00' }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">End Time *</label><input type="time" required value={form.endTime?.slice(0,5)} onChange={e => setForm(p => ({ ...p, endTime: e.target.value + ':00' }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" /></div>
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Room</label>
                <select value={form.roomId ?? ''} onChange={e => setForm(p => ({ ...p, roomId: e.target.value ? Number(e.target.value) : undefined }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                  <option value="">— No Room —</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Notes</label><textarea rows={2} value={form.notes ?? ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" placeholder="Additional notes for students..." /></div>
              <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={form.publishImmediately ?? false} onChange={e => setForm(p => ({ ...p, publishImmediately: e.target.checked }))} className="rounded border-gray-300" /> Publish immediately</label>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50">{submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : editingItem ? 'Save Changes' : 'Create Exam Schedule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div>
            <h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Delete Exam Schedule?</h3>
            <p className="text-xs text-slate-500 text-center mb-5">Published exams cannot be deleted.</p>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
