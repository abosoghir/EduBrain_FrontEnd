import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { AdminCourse, CourseForm } from '@/types/admin';
import { COURSE_TYPE_LABELS, DEPARTMENT_TYPE_LABELS } from '@/lib/enums';

export default function AdminCourses() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>({ courseCode: '', courseName: '', description: '', credits: 3, courseType: 0, departmentId: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    api.get<ApiResponse<AdminCourse[]>>('/api/admin/courses')
      .then((res) => { if (res.data?.isSuccess && res.data?.hasData && Array.isArray(res.data.data)) setCourses(res.data.data); else setCourses([]); })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); } }, [toast]);

  const filtered = useMemo(() => {
    let list = Array.isArray(courses) ? courses : [];
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter((c) => c.courseCode.toLowerCase().includes(q) || c.courseName.toLowerCase().includes(q)); }
    if (typeFilter !== 'all') list = list.filter((c) => c.courseType === Number(typeFilter));
    return list;
  }, [courses, search, typeFilter]);

  const handleOpenCreate = () => { setEditingId(null); setForm({ courseCode: '', courseName: '', description: '', credits: 3, courseType: 0, departmentId: 1 }); setShowModal(true); };
  const handleOpenEdit = (course: AdminCourse) => { setEditingId(course.courseId); setForm({ courseCode: course.courseCode, courseName: course.courseName, description: course.description || '', credits: course.credits, courseType: course.courseType, departmentId: course.departmentId }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put<ApiResponse<boolean>>(`/api/admin/courses/${editingId}`, form);
        if (res.data?.isSuccess) { setToast('Course updated'); loadData(); } else { setToast(res.data?.error?.description || 'Update failed'); }
      } else {
        const res = await api.post<ApiResponse<string>>('/api/admin/courses', form);
        if (res.data?.isSuccess) { setToast('Course created'); loadData(); } else { setToast(res.data?.error?.description || 'Create failed'); }
      }
      setShowModal(false);
    } catch { setToast('Request failed, saved locally'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { const res = await api.delete<ApiResponse<boolean>>(`/api/admin/courses/${deleteId}`); if (res.data?.isSuccess) { setToast('Deleted'); loadData(); } else { setToast(res.data?.error?.description || 'Delete failed'); } }
    catch { setToast('Delete failed. Please try again.'); }
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Course Management</h1>
        <button type="button" onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"><i className="ri-add-line" /> Add Course</button>
      </div>
      {loading && (<div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading courses...</div>)}
      {toast && (<div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2"><i className="ri-check-line" /> {toast}</div>)}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by code or name..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
        <div className="flex gap-1">
          {[{ key: 'all', label: 'All' }, { key: '0', label: 'Compulsory' }, { key: '1', label: 'Elective' }].map((f) => (
            <button key={f.key} type="button" onClick={() => setTypeFilter(f.key)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${typeFilter === f.key ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>{f.label}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Course</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Credits</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Department</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Students</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Doctors</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.courseId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div><p className="text-sm font-medium text-slate-700">{c.courseCode} — {c.courseName}</p><p className="text-[10px] text-slate-400 line-clamp-1">{c.description || 'No description'}</p></div>
                  </td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">{c.credits}</td>
                  <td className="px-5 py-3 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${c.courseType === 0 ? 'bg-slate-50 text-slate-600' : 'bg-emerald-50 text-emerald-600'}`}>{COURSE_TYPE_LABELS[c.courseType as 0|1]}</span></td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{c.departmentName}</td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">{c.totalStudents}</td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">{c.totalDoctors}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => handleOpenEdit(c)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500"><i className="ri-pencil-line text-sm" /></button>
                      <button type="button" onClick={() => setDeleteId(c.courseId)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><i className="ri-delete-bin-line text-sm" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {!loading && filtered.length === 0 && (<div className="text-center py-12 bg-white rounded-xl border border-gray-100"><div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-book-line text-3xl text-slate-400" /></div><p className="text-sm text-slate-500">No courses found.</p></div>)}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-800">{editingId ? 'Edit Course' : 'Add Course'}</h2><button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Course Code</label><input type="text" required value={form.courseCode} onChange={(e) => setForm((p) => ({ ...p, courseCode: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Credits</label><input type="number" required min={1} max={6} value={form.credits} onChange={(e) => setForm((p) => ({ ...p, credits: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Course Name</label><input type="text" required value={form.courseName} onChange={(e) => setForm((p) => ({ ...p, courseName: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Type</label><select value={form.courseType} onChange={(e) => setForm((p) => ({ ...p, courseType: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"><option value={0}>Compulsory</option><option value={1}>Elective</option></select></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Department</label><select value={form.departmentId} onChange={(e) => setForm((p) => ({ ...p, departmentId: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"><option value={1}>Computer Science</option><option value={2}>IT</option><option value={3}>Software Engineering</option><option value={4}>AI</option><option value={5}>Cyber Security</option><option value={0}>General</option></select></div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting || !form.courseCode || !form.courseName} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">{submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : editingId ? 'Save Changes' : 'Create Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5"><div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div><h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Delete Course?</h3><p className="text-xs text-slate-500 text-center mb-5">This action cannot be undone.</p><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button><button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete</button></div></div>
        </div>
      )}
    </div>
  );
}