import React, { useEffect, useState, useCallback } from 'react';
import { fetchRegistrationStatus, openRegistration, closeRegistration, fetchSemesterOptions } from '@/lib/adminApi';
import type { RegistrationStatus, OpenRegistrationForm, SemesterOption } from '@/types/admin';

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

export default function AdminRegistration() {
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [form, setForm] = useState<OpenRegistrationForm>({ semesterId: 0, openDate: '', closeDate: '' });

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchRegistrationStatus();
    if (res.data) setStatus(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchSemesterOptions().then(setSemesters);
  }, [load]);

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await openRegistration(form);
    setSubmitting(false);
    if (res.success) { showToast('Registration opened successfully'); setShowOpenModal(false); load(); }
    else showToast(res.error || 'Failed to open registration', false);
  };

  const handleClose = async () => {
    if (!status) return;
    setSubmitting(true);
    const res = await closeRegistration({ semesterId: status.semesterId });
    setSubmitting(false);
    if (res.success) { showToast('Registration closed'); setShowCloseConfirm(false); load(); }
    else showToast(res.error || 'Failed to close registration', false);
  };

  const isOpen = status?.status === 'Open';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Registration Management</h1>
          <p className="text-sm text-slate-500">Control course registration windows for each semester</p>
        </div>
        <div className="flex items-center gap-2">
          {isOpen
            ? <button type="button" onClick={() => setShowCloseConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                <i className="ri-close-circle-line" /> Close Registration
              </button>
            : <button type="button" onClick={() => setShowOpenModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                <i className="ri-checkbox-circle-line" /> Open Registration
              </button>
          }
        </div>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${toast.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <i className={toast.ok ? 'ri-check-line' : 'ri-error-warning-line'} /> {toast.msg}
        </div>
      )}

      {loading && <div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading...</div>}

      {/* Status Card */}
      {status && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Current Semester</p>
              <h2 className="text-lg font-bold text-slate-800">{status.semesterName}</h2>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${isOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'}`}>
              <i className={`${isOpen ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'} mr-1`} />
              {status.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Opened On</p>
              <p className="text-sm font-semibold text-slate-800">{status.openedOn ? new Date(status.openedOn).toLocaleDateString() : '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Closes On</p>
              <p className="text-sm font-semibold text-slate-800">{status.closesOn ? new Date(status.closesOn).toLocaleDateString() : '—'}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-[10px] text-blue-500 uppercase tracking-wider mb-1">Total Registrations</p>
              <p className="text-sm font-semibold text-blue-800">{status.totalRegistrations.toLocaleString()}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-[10px] text-amber-500 uppercase tracking-wider mb-1">Pending Approvals</p>
              <p className="text-sm font-semibold text-amber-800">{status.pendingApprovals.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !status && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-edit-box-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">No active registration period</p>
          <p className="text-xs text-slate-400 mb-4">Open registration to allow students to enroll in courses</p>
          <button type="button" onClick={() => setShowOpenModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            Open Registration
          </button>
        </div>
      )}

      {/* Open Registration Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Open Registration</h2>
              <button type="button" onClick={() => setShowOpenModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleOpen} className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Semester *</label>
                <select required value={form.semesterId || ''} onChange={e => setForm(p => ({ ...p, semesterId: Number(e.target.value) }))} className={inputCls}>
                  <option value="">Select semester...</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Open Date *</label>
                  <input type="date" required value={form.openDate} onChange={e => setForm(p => ({ ...p, openDate: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Close Date *</label>
                  <input type="date" required value={form.closeDate} onChange={e => setForm(p => ({ ...p, closeDate: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowOpenModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting || !form.semesterId || !form.openDate || !form.closeDate}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Opening...</span> : 'Open Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Confirm */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4"><i className="ri-close-circle-line text-amber-500 text-xl" /></div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Close Registration?</h3>
            <p className="text-xs text-slate-500 mb-5">Students will no longer be able to register for courses. This can be re-opened.</p>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setShowCloseConfirm(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleClose} disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                {submitting ? 'Closing...' : 'Close Registration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
