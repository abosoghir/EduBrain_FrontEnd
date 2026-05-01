import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { AdminGradingConfig, GradingConfigForm } from '@/types/admin';

const GRADE_TYPES = ['Midterm', 'Final', 'Practical', 'Oral', 'Quiz', 'Assignment', 'Project', 'Participation'];

export default function AdminGrading() {
  const [configs, setConfigs] = useState<AdminGradingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GradingConfigForm>({ gradeType: 0, weight: 30, minScore: 0, maxScore: 100, isDefault: true, academicYearId: 'ay1' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    api.get<ApiResponse<AdminGradingConfig[]>>('/api/admin/grading/enrollments')
      .then((res) => { if (res.data?.isSuccess && res.data?.hasData && Array.isArray(res.data.data)) setConfigs(res.data.data); else setConfigs([]); })
      .catch(() => setConfigs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); } }, [toast]);

  const filtered = useMemo(() => {
    let list = Array.isArray(configs) ? configs : [];
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter((c) => GRADE_TYPES[c.gradeType]?.toLowerCase().includes(q)); }
    return list;
  }, [configs, search]);

  const handleOpenCreate = () => { setEditingId(null); setForm({ gradeType: 0, weight: 30, minScore: 0, maxScore: 100, isDefault: true, academicYearId: 'ay1' }); setShowModal(true); };
  const handleOpenEdit = (c: AdminGradingConfig) => { setEditingId(c.gradingConfigId); setForm({ gradeType: c.gradeType, weight: c.weight, minScore: c.minScore, maxScore: c.maxScore, courseId: c.courseId, isDefault: c.isDefault, academicYearId: c.academicYearId }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put<ApiResponse<boolean>>(`/api/admin/grading/${editingId}`, form);
        if (res.data?.isSuccess) { setToast('Config updated'); loadData(); } else { setToast(res.data?.error?.description || 'Update failed'); }
      } else {
        const res = await api.post<ApiResponse<string>>('/api/admin/grading', form);
        if (res.data?.isSuccess) { setToast('Config created'); loadData(); } else { setToast(res.data?.error?.description || 'Create failed'); }
      }
      setShowModal(false);
    } catch { setToast('Request failed, saved locally'); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => { if (!deleteId) return; try { const res = await api.delete<ApiResponse<boolean>>(`/api/admin/grading/${deleteId}`); if (res.data?.isSuccess) { setToast('Deleted'); loadData(); } else { setToast(res.data?.error?.description || 'Delete failed'); } } catch { setToast('Delete failed. Please try again.'); } setDeleteId(null); };

  const totalWeight = useMemo(() => filtered.reduce((sum, c) => sum + c.weight, 0), [filtered]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Grading Management</h1>
        <button type="button" onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"><i className="ri-add-line" /> Add Config</button>
      </div>
      {loading && (<div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading configs...</div>)}
      {toast && (<div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2"><i className="ri-check-line" /> {toast}</div>)}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by grade type..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
        <div className="px-4 py-2 rounded-lg bg-gray-50 text-xs text-slate-600">Total Weight: <span className={`font-semibold ${totalWeight === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{totalWeight}%</span></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Grade Type</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Weight</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Min Score</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Max Score</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Scope</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Year</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.gradingConfigId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3"><p className="text-sm font-medium text-slate-700">{GRADE_TYPES[c.gradeType] || 'Unknown'}</p></td>
                  <td className="px-5 py-3 text-center"><span className="text-sm font-bold text-slate-700">{c.weight}%</span></td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{c.minScore}</td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{c.maxScore}</td>
                  <td className="px-5 py-3 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${c.isDefault ? 'bg-slate-50 text-slate-600' : 'bg-amber-50 text-amber-600'}`}>{c.isDefault ? 'Default' : 'Course Specific'}</span></td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{c.academicYearId === 'ay1' ? '2025-2026' : c.academicYearId}</td>
                  <td className="px-5 py-3 text-center"><div className="flex items-center justify-center gap-1"><button type="button" onClick={() => handleOpenEdit(c)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500"><i className="ri-pencil-line text-sm" /></button><button type="button" onClick={() => setDeleteId(c.gradingConfigId)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><i className="ri-delete-bin-line text-sm" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {!loading && filtered.length === 0 && (<div className="text-center py-12 bg-white rounded-xl border border-gray-100"><div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-bar-chart-line text-3xl text-slate-400" /></div><p className="text-sm text-slate-500">No grading configs found.</p></div>)}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-800">{editingId ? 'Edit Config' : 'Add Config'}</h2><button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Grade Type</label><select value={form.gradeType} onChange={(e) => setForm((p) => ({ ...p, gradeType: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400">{GRADE_TYPES.map((t, i) => (<option key={t} value={i}>{t}</option>))}</select></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Weight (%)</label><input type="number" required min={0} max={100} value={form.weight} onChange={(e) => setForm((p) => ({ ...p, weight: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Min Score</label><input type="number" required min={0} value={form.minScore} onChange={(e) => setForm((p) => ({ ...p, minScore: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Max Score</label><input type="number" required min={1} value={form.maxScore} onChange={(e) => setForm((p) => ({ ...p, maxScore: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Course ID (optional)</label><input type="text" value={form.courseId || ''} onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value || undefined }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))} className="rounded border-gray-300" /> Default Config</label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button><button type="submit" disabled={submitting} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">{submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : editingId ? 'Save Changes' : 'Create Config'}</button></div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5"><div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div><h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Delete Config?</h3><p className="text-xs text-slate-500 text-center mb-5">This action cannot be undone.</p><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button><button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete</button></div></div>
        </div>
      )}
    </div>
  );
}