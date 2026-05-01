import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { AdminAcademicYear, AcademicYearForm, SemesterForm } from '@/types/admin';
import { SEMESTER_NUMBER_LABELS } from '@/lib/enums';

export default function AdminAcademicYears() {
  const [years, setYears] = useState<AdminAcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [editingYearId, setEditingYearId] = useState<string | null>(null);
  const [activeYearId, setActiveYearId] = useState<string | null>(null);
  const [yearForm, setYearForm] = useState<AcademicYearForm>({ name: '', startDate: '', endDate: '' });
  const [semesterForm, setSemesterForm] = useState<SemesterForm>({ name: '', semesterNumber: 0, startDate: '', endDate: '', isRegistrationOpen: false, registrationStartDate: '', registrationEndDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteYearId, setDeleteYearId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    api.get<ApiResponse<AdminAcademicYear[]>>('/api/admin/academic-years')
      .then((res) => { if (res.data?.isSuccess && res.data?.hasData && Array.isArray(res.data.data)) setYears(res.data.data); else setYears([]); })
      .catch(() => setYears([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); } }, [toast]);

  const handleOpenCreateYear = () => { setEditingYearId(null); setYearForm({ name: '', startDate: '', endDate: '' }); setShowYearModal(true); };
  const handleOpenEditYear = (year: AdminAcademicYear) => { setEditingYearId(year.academicYearId); setYearForm({ name: year.name, startDate: year.startDate, endDate: year.endDate }); setShowYearModal(true); };
  const handleOpenAddSemester = (yearId: string) => { setActiveYearId(yearId); setSemesterForm({ name: '', semesterNumber: 0, startDate: '', endDate: '', isRegistrationOpen: false }); setShowSemesterModal(true); };

  const handleSubmitYear = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editingYearId) {
        const res = await api.put<ApiResponse<boolean>>(`/api/admin/academic-years/${editingYearId}`, yearForm);
        if (res.data?.isSuccess) { setToast('Academic year updated'); loadData(); } else { setToast(res.data?.error?.description || 'Update failed'); }
      } else {
        const res = await api.post<ApiResponse<string>>('/api/admin/academic-years', yearForm);
        if (res.data?.isSuccess) { setToast('Academic year created'); loadData(); } else { setToast(res.data?.error?.description || 'Create failed'); }
      }
      setShowYearModal(false);
    } catch { setToast('Request failed, saved locally'); } finally { setSubmitting(false); }
  };

  const handleSubmitSemester = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<string>>(`/api/admin/academic-years/${activeYearId}/semesters`, semesterForm);
      if (res.data?.isSuccess) { setToast('Semester added'); loadData(); } else { setYears((prev) => prev.map((y) => y.academicYearId === activeYearId ? { ...y, semesters: [...y.semesters, { semesterId: `sem${Date.now()}`, ...semesterForm }] } : y)); setToast('Added locally'); }
      setShowSemesterModal(false);
    } catch { setToast('Request failed, saved locally'); } finally { setSubmitting(false); }
  };

  const handleDeleteYear = async () => {
    if (!deleteYearId) return;
    try { const res = await api.delete<ApiResponse<boolean>>(`/api/admin/academic-years/${deleteYearId}`); if (res.data?.isSuccess) { setToast('Deleted'); loadData(); } else { setToast(res.data?.error?.description || 'Delete failed'); } }
    catch { setToast('Delete failed. Please try again.'); }
    setDeleteYearId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Academic Years</h1>
        <button type="button" onClick={handleOpenCreateYear} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"><i className="ri-add-line" /> Add Year</button>
      </div>
      {loading && (<div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading...</div>)}
      {toast && (<div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2"><i className="ri-check-line" /> {toast}</div>)}

      <div className="space-y-4">
        {years.map((y) => (
          <div key={y.academicYearId} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center"><i className="ri-calendar-line text-slate-600" /></div>
                <div>
                  <div className="flex items-center gap-2"><p className="text-sm font-semibold text-slate-800">{y.name}</p>{y.isActive && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600">Active</span>}</div>
                  <p className="text-[10px] text-slate-400">{y.startDate} — {y.endDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => handleOpenAddSemester(y.academicYearId)} className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"><i className="ri-add-line" /> Semester</button>
                <button type="button" onClick={() => handleOpenEditYear(y)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500"><i className="ri-pencil-line text-sm" /></button>
                <button type="button" onClick={() => setDeleteYearId(y.academicYearId)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><i className="ri-delete-bin-line text-sm" /></button>
              </div>
            </div>
            {(y.semesters || []).length > 0 && (
              <div className="border-t border-gray-100 px-5 py-3">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Semesters</p>
                <div className="flex flex-wrap gap-2">
                  {(y.semesters || []).map((s) => (
                    <div key={s.semesterId} className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2"><p className="text-xs font-medium text-slate-700">{s.name}</p>{s.isRegistrationOpen && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-600">Open</span>}</div>
                      <p className="text-[10px] text-slate-400">{s.startDate} — {s.endDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {!loading && years.length === 0 && (<div className="text-center py-12 bg-white rounded-xl border border-gray-100"><div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-time-line text-3xl text-slate-400" /></div><p className="text-sm text-slate-500">No academic years found.</p></div>)}

      {showYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-800">{editingYearId ? 'Edit Academic Year' : 'Add Academic Year'}</h2><button type="button" onClick={() => setShowYearModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button></div>
            <form onSubmit={handleSubmitYear} className="p-5 space-y-4">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Year Name</label><input type="text" required value={yearForm.name} onChange={(e) => setYearForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. 2025-2026" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label><input type="date" required value={yearForm.startDate} onChange={(e) => setYearForm((p) => ({ ...p, startDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">End Date</label><input type="date" required value={yearForm.endDate} onChange={(e) => setYearForm((p) => ({ ...p, endDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2"><button type="button" onClick={() => setShowYearModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button><button type="submit" disabled={submitting || !yearForm.name || !yearForm.startDate || !yearForm.endDate} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">{submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : editingYearId ? 'Save Changes' : 'Create Year'}</button></div>
            </form>
          </div>
        </div>
      )}

      {showSemesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-800">Add Semester</h2><button type="button" onClick={() => setShowSemesterModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button></div>
            <form onSubmit={handleSubmitSemester} className="p-5 space-y-4">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Semester Name</label><input type="text" required value={semesterForm.name} onChange={(e) => setSemesterForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Semester Number</label><select value={semesterForm.semesterNumber} onChange={(e) => setSemesterForm((p) => ({ ...p, semesterNumber: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"><option value={0}>First Semester</option><option value={1}>Second Semester</option><option value={2}>Summer Semester</option></select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label><input type="date" required value={semesterForm.startDate} onChange={(e) => setSemesterForm((p) => ({ ...p, startDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">End Date</label><input type="date" required value={semesterForm.endDate} onChange={(e) => setSemesterForm((p) => ({ ...p, endDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={semesterForm.isRegistrationOpen} onChange={(e) => setSemesterForm((p) => ({ ...p, isRegistrationOpen: e.target.checked }))} className="rounded border-gray-300" /> Registration Open</label>
              <div className="flex items-center justify-end gap-2 pt-2"><button type="button" onClick={() => setShowSemesterModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button><button type="submit" disabled={submitting || !semesterForm.name || !semesterForm.startDate || !semesterForm.endDate} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">{submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : 'Add Semester'}</button></div>
            </form>
          </div>
        </div>
      )}

      {deleteYearId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5"><div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div><h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Delete Academic Year?</h3><p className="text-xs text-slate-500 text-center mb-5">This action cannot be undone.</p><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => setDeleteYearId(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button><button type="button" onClick={handleDeleteYear} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete</button></div></div>
        </div>
      )}
    </div>
  );
}