import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { WarningRecord, CreateWarningRequest } from '@/types/advisor';

import { WARNING_LEVEL_LABELS, WARNING_REASON_LABELS } from '@/lib/enums';

export default function AdvisorWarnings() {
  const [warnings, setWarnings] = useState<WarningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateWarningRequest>({
    studentId: '',
    level: 1,
    reason: 1,
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadWarnings = useCallback(() => {
    setLoading(true);
    api.get<ApiResponse<WarningRecord[]>>('/api/advisor/warnings')
      .then((res) => {
        const payload = res.data?.data;
        if (res.data?.isSuccess && res.data?.hasData && Array.isArray(payload)) {
          setWarnings(payload);
        } else {
          setWarnings([]);
        }
      })
      .catch(() => {
        setWarnings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadWarnings();
  }, [loadWarnings]);

  const filtered = warnings.filter((w) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return w.status === 0;
    return w.status === 1;
  });

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        const res = await api.post<ApiResponse<number>>('/api/advisor/warnings', form);
        if (res.data.isSuccess) {
          setShowCreate(false);
          setForm({ studentId: '', level: 1, reason: 1, description: '' });
          loadWarnings();
        }
      } catch {
        // Show error but don't add mock data
        setShowCreate(false);
        setForm({ studentId: '', level: 1, reason: 1, description: '' });
      } finally {
        setSubmitting(false);
      }
    },
    [form, warnings, loadWarnings]
  );

  const handleResolve = useCallback(
    async (warningId: number) => {
      try {
        await api.post<ApiResponse<boolean>>(`/api/advisor/warnings/${warningId}/resolve`, { resolutionNotes: 'Resolved by advisor' });
        loadWarnings();
      } catch {
        // Show error toast or log
      }
    },
    [loadWarnings]
  );

  const levelBadge = (level: number) => {
    const map: Record<number, string> = {
      1: 'bg-amber-50 text-amber-600',
      2: 'bg-orange-50 text-orange-600',
      3: 'bg-red-50 text-red-600',
    };
    return map[level] || 'bg-gray-50 text-gray-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Student Warnings</h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors whitespace-nowrap"
        >
          <i className="ri-add-line" />
          Issue Warning
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading warnings...
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1 mb-6">
        {[
          { key: 'all' as const, label: 'All Warnings' },
          { key: 'active' as const, label: 'Active' },
          { key: 'resolved' as const, label: 'Resolved' },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              statusFilter === f.key
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Create Warning Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Issue New Warning</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600">
                <i className="ri-close-line" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Student ID</label>
                <input
                  type="text"
                  value={form.studentId}
                  onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))}
                  placeholder="Enter student ID or code"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Warning Level</label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm((prev) => ({ ...prev, level: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                  >
                    <option value={1}>Minor (Level 1)</option>
                    <option value={2}>Moderate (Level 2)</option>
                    <option value={3}>Severe (Level 3)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Reason</label>
                  <select
                    value={form.reason}
                    onChange={(e) => setForm((prev) => ({ ...prev, reason: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                  >
                    <option value={0}>Exceeded Absence</option>
                    <option value={1}>Low Academic Performance</option>
                    <option value={2}>Unpaid Fees</option>
                    <option value={3}>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the warning reason..."
                  required
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-none"
                />
                <p className="text-[10px] text-slate-400 text-right mt-1">{form.description.length}/500</p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.studentId || !form.description}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center gap-1">
                      <i className="ri-loader-4-line animate-spin" />
                      Issuing...
                    </span>
                  ) : (
                    'Issue Warning'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warnings List */}
      <div className="space-y-3">
        {filtered.map((w) => (
          <div key={w.warningId} className={`bg-white rounded-xl border ${w.status === 0 ? 'border-gray-100' : 'border-gray-50'} p-5`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${levelBadge(w.level)}`}>
                <i className="ri-alert-line text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-800">{WARNING_REASON_LABELS[w.reason as 0 | 1 | 2 | 3]}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${levelBadge(w.level)}`}>
                    Level {w.level} — {WARNING_LEVEL_LABELS[w.level as 1 | 2 | 3]}
                  </span>
                  {w.status === 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600">Active</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-500">Resolved</span>
                  )}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-2">{w.description}</p>
                <div className="flex items-center flex-wrap gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <i className="ri-user-line" />
                    {w.studentName} ({w.studentCode})
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ri-calendar-line" />
                    {new Date(w.issuedDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ri-user-star-line" />
                    {w.issuedBy}
                  </span>
                </div>
              </div>
              {w.status === 0 && (
                <button
                  type="button"
                  onClick={() => handleResolve(w.warningId)}
                  className="px-3 py-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-alert-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No warnings found.</p>
        </div>
      )}
    </div>
  );
}