import React, { useEffect, useState, useCallback } from 'react';
import { fetchWarnings, sendWarning, resolveWarning } from '@/lib/advisorPortalApi';
import type { WarningDto, SendWarningRequest, GetWarningsResponse } from '@/types/advisor';
import { WARNING_LEVEL_LABELS, WARNING_REASON_LABELS, WARNING_STATUS_LABELS, WarningStatus, WarningReason } from '@/lib/enums';
import StudentPicker from '@/components/advisor/StudentPicker';

export default function AdvisorWarnings() {
  const [data, setData] = useState<GetWarningsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<SendWarningRequest>({
    studentId: 0,
    reason: WarningReason.ExceededAbsenceLimit,
    warningLevel: 1,
    message: '',
  });
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const loadWarnings = useCallback(async () => {
    setLoading(true);
    const statusParam = statusFilter === 'all' ? undefined : statusFilter === 'active' ? WarningStatus.Active : WarningStatus.Resolved;
    const res = await fetchWarnings(statusParam);
    setData(res.data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { loadWarnings(); }, [loadWarnings]);

  const warnings = data?.warnings ?? [];

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setSubmitting(true);
    const payload: SendWarningRequest = { ...form, studentId: selectedStudentId };
    const res = await sendWarning(payload);
    if (res.data) {
      setShowCreate(false);
      setForm({ studentId: 0, reason: WarningReason.ExceededAbsenceLimit, warningLevel: 1, message: '' });
      setSelectedStudentId(null);
      loadWarnings();
    }
    setSubmitting(false);
  }, [form, selectedStudentId, loadWarnings]);

  const handleResolve = useCallback(async (warningId: number) => {
    setResolvingId(warningId);
    const res = await resolveWarning(warningId, { resolutionNotes: resolveNotes || 'Resolved by advisor' });
    if (res.success) {
      setResolveNotes('');
      loadWarnings();
    }
    setResolvingId(null);
  }, [resolveNotes, loadWarnings]);

  const levelBadge = (level: number) => {
    const map: Record<number, string> = { 1: 'bg-amber-50 text-amber-600', 2: 'bg-orange-50 text-orange-600', 3: 'bg-red-50 text-red-600' };
    return map[level] || 'bg-gray-50 text-gray-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Student Warnings</h1>
          {data && (
            <p className="text-xs text-slate-500 mt-1">
              {data.totalActive} active · {data.totalResolved} resolved
            </p>
          )}
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors whitespace-nowrap">
          <i className="ri-add-line" /> Issue Warning
        </button>
      </div>

      {loading && <div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading warnings...</div>}

      {/* Filters */}
      <div className="flex gap-1 mb-6">
        {([{ key: 'all' as const, label: 'All Warnings' }, { key: 'active' as const, label: 'Active' }, { key: 'resolved' as const, label: 'Resolved' }]).map((f) => (
          <button key={f.key} type="button" onClick={() => setStatusFilter(f.key)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === f.key ? 'bg-amber-600 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>{f.label}</button>
        ))}
      </div>

      {/* Create Warning Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Issue New Warning</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Student</label>
                <StudentPicker
                  value={selectedStudentId}
                  onChange={(id) => setSelectedStudentId(id)}
                  placeholder="Search student by name or code..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Warning Level</label>
                  <select value={form.warningLevel} onChange={(e) => setForm((prev) => ({ ...prev, warningLevel: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400">
                    <option value={1}>Minor (Level 1)</option>
                    <option value={2}>Moderate (Level 2)</option>
                    <option value={3}>Severe (Level 3)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Reason</label>
                  <select value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: Number(e.target.value) as WarningReason }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400">
                    <option value={WarningReason.ExceededAbsenceLimit}>Exceeded Absence</option>
                    <option value={WarningReason.LowAcademicPerformance}>Low Academic Performance</option>
                    <option value={WarningReason.UnpaidFees}>Unpaid Fees</option>
                    <option value={WarningReason.Other}>Other</option>
                  </select>
                </div>
              </div>
              {form.reason === WarningReason.Other && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Custom Reason</label>
                  <input type="text" value={form.customReason || ''} onChange={(e) => setForm((prev) => ({ ...prev, customReason: e.target.value }))} required placeholder="Specify reason..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Message</label>
                <textarea value={form.message} onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} placeholder="Warning message to student..." required rows={3} maxLength={2000} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-none" />
                <p className="text-[10px] text-slate-400 text-right mt-1">{form.message.length}/2000</p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting || !selectedStudentId || !form.message} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" />Issuing...</span> : 'Issue Warning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warnings List */}
      <div className="space-y-3">
        {warnings.map((w: WarningDto) => (
          <div key={w.warningId} className={`bg-white rounded-xl border ${w.status === WarningStatus.Active ? 'border-gray-100' : 'border-gray-50'} p-5`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${levelBadge(w.warningLevel)}`}>
                <i className="ri-alert-line text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-800">{w.reason}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${levelBadge(w.warningLevel)}`}>
                    Level {w.warningLevel} — {WARNING_LEVEL_LABELS[w.warningLevel as 1 | 2 | 3]}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${w.status === WarningStatus.Active ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
                    {WARNING_STATUS_LABELS[w.status as WarningStatus]}
                  </span>
                </div>
                {w.courseCode && <p className="text-xs text-slate-500 mb-1">Course: {w.courseCode}</p>}
                {w.resolutionNotes && <p className="text-xs text-emerald-600 mb-1">Resolution: {w.resolutionNotes}</p>}
                <div className="flex items-center flex-wrap gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><i className="ri-user-line" />{w.studentName} ({w.studentCode})</span>
                  <span className="flex items-center gap-1"><i className="ri-calendar-line" />{new Date(w.dateIssued).toLocaleDateString()}</span>
                </div>
              </div>
              {w.status === WarningStatus.Active && (
                <button type="button" onClick={() => handleResolve(w.warningId)} disabled={resolvingId === w.warningId} className="px-3 py-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap disabled:opacity-50">
                  {resolvingId === w.warningId ? <i className="ri-loader-4-line animate-spin" /> : 'Resolve'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && warnings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-alert-line text-3xl text-slate-400" /></div>
          <p className="text-sm text-slate-500">No warnings found.</p>
        </div>
      )}
    </div>
  );
}