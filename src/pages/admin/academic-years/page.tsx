import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchAcademicYears, fetchAcademicYearDetail,
  createAcademicYear, updateAcademicYear, deleteAcademicYear,
  createSemester, updateSemester, deleteSemester,
  updateRegistrationDates,
} from '@/lib/adminApi';
import { SEMESTER_NUMBER_LABELS, SemesterNumber } from '@/lib/enums';
import type {
  AcademicYearListItem, AcademicYearDetail, SemesterItem,
  CreateAcademicYearForm, UpdateAcademicYearForm,
  CreateSemesterForm, UpdateSemesterForm, UpdateRegistrationDatesForm,
} from '@/types/admin';

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

const EMPTY_YEAR: CreateAcademicYearForm = { name: '', startDate: '', endDate: '' };
const EMPTY_SEM: CreateSemesterForm = {
  semesterNumber: 0, startDate: '', endDate: '',
  midtermStart: null, midtermEnd: null,
  finalExamStart: null, finalExamEnd: null,
  maxCreditHoursPerStudent: 18, minCreditHoursPerStudent: 12,
  tuitionFees: null,
};
const EMPTY_REG: UpdateRegistrationDatesForm = { addDropDeadline: null, withdrawDeadline: null };

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return iso; }
}
function toInputDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}
function semLabel(n: number): string {
  return SEMESTER_NUMBER_LABELS[n as SemesterNumber] ?? `Semester ${n}`;
}

export default function AdminAcademicYears() {
  const [years, setYears] = useState<AcademicYearListItem[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedDetail, setExpandedDetail] = useState<AcademicYearDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showYearModal, setShowYearModal] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYearListItem | null>(null);
  const [yearForm, setYearForm] = useState<CreateAcademicYearForm>(EMPTY_YEAR);

  const [showSemModal, setShowSemModal] = useState(false);
  const [editingSem, setEditingSem] = useState<SemesterItem | null>(null);
  const [activeSemYearId, setActiveSemYearId] = useState<number | null>(null);
  const [semForm, setSemForm] = useState<CreateSemesterForm>(EMPTY_SEM);

  const [deleteYearId, setDeleteYearId] = useState<number | null>(null);
  const [deleteSemId, setDeleteSemId] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  const loadYears = useCallback(async () => {
    setLoading(true);
    const res = await fetchAcademicYears();
    setYears(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadYears(); }, [loadYears]);

  const loadDetail = async (id: number) => {
    if (expandedId === id) { setExpandedId(null); setExpandedDetail(null); return; }
    setExpandedId(id);
    setExpandedDetail(null);
    setDetailLoading(true);
    const res = await fetchAcademicYearDetail(id);
    if (res.data) setExpandedDetail(res.data);
    setDetailLoading(false);
  };

  // Year modal
  const openCreateYear = () => { setEditingYear(null); setYearForm(EMPTY_YEAR); setShowYearModal(true); };
  const openEditYear = (y: AcademicYearListItem) => {
    setEditingYear(y);
    setYearForm({ name: y.name, startDate: toInputDate(y.startDate), endDate: toInputDate(y.endDate) });
    setShowYearModal(true);
  };
  const submitYear = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    if (editingYear) {
      const res = await updateAcademicYear(editingYear.id, yearForm as UpdateAcademicYearForm);
      res.success ? showToast('Year updated') : showToast(res.error || 'Update failed', false);
    } else {
      const res = await createAcademicYear(yearForm);
      res.id !== null ? showToast('Year created') : showToast(res.error || 'Create failed', false);
    }
    setSubmitting(false); setShowYearModal(false); loadYears();
  };

  // Semester modal
  const openAddSem = (yearId: number) => {
    setActiveSemYearId(yearId); setEditingSem(null); setSemForm(EMPTY_SEM); setShowSemModal(true);
  };
  const openEditSem = (yearId: number, s: SemesterItem) => {
    setActiveSemYearId(yearId); setEditingSem(s);
    setSemForm({
      semesterNumber: s.semesterNumber,
      startDate: toInputDate(s.startDate), endDate: toInputDate(s.endDate),
      midtermStart: s.midtermStart ? toInputDate(s.midtermStart) : null,
      midtermEnd: s.midtermEnd ? toInputDate(s.midtermEnd) : null,
      finalExamStart: s.finalExamStart ? toInputDate(s.finalExamStart) : null,
      finalExamEnd: s.finalExamEnd ? toInputDate(s.finalExamEnd) : null,
      maxCreditHoursPerStudent: s.maxCreditHoursPerStudent,
      minCreditHoursPerStudent: s.minCreditHoursPerStudent,
      tuitionFees: s.tuitionFees,
    });
    setShowSemModal(true);
  };
  const submitSem = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    if (editingSem) {
      const res = await updateSemester(editingSem.id, semForm as UpdateSemesterForm);
      res.success ? showToast('Semester updated') : showToast(res.error || 'Update failed', false);
    } else {
      const res = await createSemester(activeSemYearId!, semForm);
      res.id !== null ? showToast('Semester added') : showToast(res.error || 'Create failed', false);
    }
    setSubmitting(false); setShowSemModal(false);
    if (expandedId) { const res = await fetchAcademicYearDetail(expandedId); if (res.data) setExpandedDetail(res.data); }
  };

  // Registration dates modal state
  const [showRegModal, setShowRegModal] = useState(false);
  const [regSemId, setRegSemId] = useState<number | null>(null);
  const [regForm, setRegForm] = useState<UpdateRegistrationDatesForm>(EMPTY_REG);

  const openRegDates = (semId: number) => {
    setRegSemId(semId); setRegForm(EMPTY_REG); setShowRegModal(true);
  };
  const submitRegDates = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    const res = await updateRegistrationDates(regSemId!, regForm);
    res.success ? showToast('Registration dates updated') : showToast(res.error || 'Failed', false);
    setSubmitting(false); setShowRegModal(false);
  };

  const confirmDeleteYear = async () => {
    if (!deleteYearId) return;
    const res = await deleteAcademicYear(deleteYearId);
    res.success ? showToast('Year deleted') : showToast(res.error || 'Delete failed', false);
    setDeleteYearId(null); loadYears();
  };

  const confirmDeleteSem = async () => {
    if (!deleteSemId) return;
    const res = await deleteSemester(deleteSemId);
    res.success ? showToast('Semester deleted') : showToast(res.error || 'Delete failed', false);
    setDeleteSemId(null);
    if (expandedId) { const res2 = await fetchAcademicYearDetail(expandedId); if (res2.data) setExpandedDetail(res2.data); }
  };

  const sf = (field: keyof CreateSemesterForm, value: unknown) =>
    setSemForm(p => ({ ...p, [field]: value }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Academic Years</h1>
        <button type="button" onClick={openCreateYear}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
          <i className="ri-add-line" /> Add Year
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${toast.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <i className={toast.ok ? 'ri-check-line' : 'ri-error-warning-line'} /> {toast.msg}
        </div>
      )}

      {loading && <div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading...</div>}

      {/* Year list */}
      <div className="space-y-3">
        {years.map(y => (
          <div key={y.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <button type="button" onClick={() => loadDetail(y.id)} className="flex items-center gap-3 flex-1 text-left">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
                  <i className="ri-calendar-line text-slate-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{y.name}</p>
                  </div>
                  <p className="text-[10px] text-slate-400">{fmtDate(y.startDate)} — {fmtDate(y.endDate)} · {y.semestersCount} semester{y.semestersCount !== 1 ? 's' : ''}</p>
                </div>
                <i className={`ri-arrow-${expandedId === y.id ? 'up' : 'down'}-s-line text-slate-400 ml-auto mr-2`} />
              </button>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => openAddSem(y.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                  <i className="ri-add-line" /> Semester
                </button>
                <button type="button" onClick={() => openEditYear(y)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500">
                  <i className="ri-pencil-line text-sm" />
                </button>
                <button type="button" onClick={() => setDeleteYearId(y.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500">
                  <i className="ri-delete-bin-line text-sm" />
                </button>
              </div>
            </div>

            {/* Expanded semesters */}
            {expandedId === y.id && (
              <div className="border-t border-gray-100 px-5 py-4">
                {detailLoading && <div className="flex items-center gap-2 text-slate-400 text-sm"><i className="ri-loader-4-line animate-spin" /> Loading semesters...</div>}
                {!detailLoading && expandedDetail && (
                  <div className="space-y-2">
                    {(expandedDetail.semesters || []).length === 0 && <p className="text-xs text-slate-400">No semesters yet.</p>}
                    {(expandedDetail.semesters || []).map(s => (
                      <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 border border-gray-100">
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{semLabel(s.semesterNumber)}</p>
                          <p className="text-[10px] text-slate-400">{fmtDate(s.startDate)} — {fmtDate(s.endDate)} · {s.courseInstancesCount} instances</p>
                          {s.tuitionFees != null && <p className="text-[10px] text-slate-400">Fees: {s.tuitionFees.toLocaleString()} · Credits: {s.minCreditHoursPerStudent}–{s.maxCreditHoursPerStudent}h</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => openRegDates(s.id)}
                            className="px-2 py-1 text-[10px] rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors whitespace-nowrap">
                            Reg Dates
                          </button>
                          <button type="button" onClick={() => openEditSem(y.id, s)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 text-slate-500">
                            <i className="ri-pencil-line text-sm" />
                          </button>
                          <button type="button" onClick={() => setDeleteSemId(s.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500">
                            <i className="ri-delete-bin-line text-sm" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && years.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-time-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No academic years found.</p>
        </div>
      )}

      {/* Year Modal */}
      {showYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">{editingYear ? 'Edit Academic Year' : 'Add Academic Year'}</h2>
              <button type="button" onClick={() => setShowYearModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={submitYear} className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Year Name *</label>
                <input type="text" required value={yearForm.name} onChange={e => setYearForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. 2025-2026" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Start Date *</label>
                  <input type="date" required value={yearForm.startDate} onChange={e => setYearForm(p => ({ ...p, startDate: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>End Date *</label>
                  <input type="date" required value={yearForm.endDate} onChange={e => setYearForm(p => ({ ...p, endDate: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowYearModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting || !yearForm.name || !yearForm.startDate || !yearForm.endDate}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : editingYear ? 'Save Changes' : 'Create Year'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Semester Modal */}
      {showSemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg my-4">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">{editingSem ? 'Edit Semester' : 'Add Semester'}</h2>
              <button type="button" onClick={() => setShowSemModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={submitSem} className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Semester Number *</label>
                <select value={semForm.semesterNumber} onChange={e => sf('semesterNumber', Number(e.target.value))} className={inputCls}>
                  <option value={0}>First Semester</option>
                  <option value={1}>Second Semester</option>
                  <option value={2}>Summer Semester</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Start Date *</label>
                  <input type="date" required value={semForm.startDate} onChange={e => sf('startDate', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>End Date *</label>
                  <input type="date" required value={semForm.endDate} onChange={e => sf('endDate', e.target.value)} className={inputCls} />
                </div>
              </div>

              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pt-1">Midterm Period</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Midterm Start</label>
                  <input type="date" value={semForm.midtermStart || ''} onChange={e => sf('midtermStart', e.target.value || null)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Midterm End</label>
                  <input type="date" value={semForm.midtermEnd || ''} onChange={e => sf('midtermEnd', e.target.value || null)} className={inputCls} />
                </div>
              </div>

              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pt-1">Final Exam Period</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Final Exam Start</label>
                  <input type="date" value={semForm.finalExamStart || ''} onChange={e => sf('finalExamStart', e.target.value || null)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Final Exam End</label>
                  <input type="date" value={semForm.finalExamEnd || ''} onChange={e => sf('finalExamEnd', e.target.value || null)} className={inputCls} />
                </div>
              </div>

              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pt-1">Credit Hours &amp; Fees</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Min Credits</label>
                  <input type="number" min={1} max={30} value={semForm.minCreditHoursPerStudent ?? 12} onChange={e => sf('minCreditHoursPerStudent', Number(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Max Credits</label>
                  <input type="number" min={1} max={30} value={semForm.maxCreditHoursPerStudent ?? 18} onChange={e => sf('maxCreditHoursPerStudent', Number(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tuition Fees</label>
                  <input type="number" min={0} value={semForm.tuitionFees ?? ''} onChange={e => sf('tuitionFees', e.target.value ? Number(e.target.value) : null)} placeholder="Optional" className={inputCls} />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSemModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting || !semForm.startDate || !semForm.endDate}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : editingSem ? 'Save Changes' : 'Add Semester'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Year Confirm */}
      {deleteYearId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Delete Academic Year?</h3>
            <p className="text-xs text-slate-500 mb-5">This will remove all associated semesters and cannot be undone.</p>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setDeleteYearId(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={confirmDeleteYear} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Semester Confirm */}
      {deleteSemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Delete Semester?</h3>
            <p className="text-xs text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setDeleteSemId(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={confirmDeleteSem} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Dates Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Update Registration Dates</h2>
              <button type="button" onClick={() => setShowRegModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={submitRegDates} className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Add/Drop Deadline</label>
                <input type="date" value={regForm.addDropDeadline || ''} onChange={e => setRegForm(p => ({ ...p, addDropDeadline: e.target.value || null }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Withdraw Deadline</label>
                <input type="date" value={regForm.withdrawDeadline || ''} onChange={e => setRegForm(p => ({ ...p, withdrawDeadline: e.target.value || null }))} className={inputCls} />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowRegModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : 'Update Dates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}