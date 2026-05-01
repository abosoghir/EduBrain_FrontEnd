import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { ScheduleAdjustment, ReviewAdjustmentRequest } from '@/types/advisor';


export default function AdvisorScheduleAdjust() {
  const [adjustments, setAdjustments] = useState<ScheduleAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    api.get<ApiResponse<ScheduleAdjustment[]>>('/api/advisor/schedule-adjustments')
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && res.data.data) {
          setAdjustments(res.data.data);
        } else {
          setAdjustments([]);
        }
      })
      .catch(() => {
        setAdjustments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = adjustments.filter((a) => {
    if (statusFilter === 'all') return true;
    const map: Record<string, number> = { pending: '0', approved: '1', rejected: '2' };
    return a.status === Number(map[statusFilter]);
  });

  const handleReview = useCallback(
    async (adjustmentId: number, approved: boolean) => {
      const req: ReviewAdjustmentRequest = { adjustmentId, approved, notes: approved ? 'Approved by advisor' : 'Rejected by advisor' };
      try {
        await api.post<ApiResponse<boolean>>('/api/advisor/schedule-adjustments/review', req);
        setAdjustments((prev) =>
          prev.map((a) =>
            a.adjustmentId === adjustmentId
              ? { ...a, status: approved ? 1 : 2, reviewedBy: 'Dr. Amira Fouad', reviewDate: new Date().toISOString().split('T')[0] }
              : a
          )
        );
      } catch {
        // Show error, don't update state
      }
    },
    []
  );

  const statusBadge = (status: number) => {
    const map: Record<number, string> = {
      0: 'bg-amber-50 text-amber-600',
      1: 'bg-emerald-50 text-emerald-600',
      2: 'bg-red-50 text-red-600',
    };
    return map[status] || 'bg-gray-50 text-gray-600';
  };

  const statusLabel = (status: number) => {
    const map: Record<number, string> = { 0: 'Pending', 1: 'Approved', 2: 'Rejected' };
    return map[status] || 'Unknown';
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Schedule Adjustments</h1>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading schedule adjustments...
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1 mb-6">
        {[
          { key: 'all' as const, label: 'All Requests' },
          { key: 'pending' as const, label: 'Pending' },
          { key: 'approved' as const, label: 'Approved' },
          { key: 'rejected' as const, label: 'Rejected' },
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

      {/* Adjustments List */}
      <div className="space-y-3">
        {filtered.map((a) => (
          <div key={a.adjustmentId} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${statusBadge(a.status)}`}>
                  <i className="ri-calendar-event-line text-sm" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-800">
                      {a.toCourseCode
                        ? `Course Switch: ${a.fromCourseCode} → ${a.toCourseCode}`
                        : `Drop: ${a.fromCourseCode}`}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge(a.status)}`}>
                      {statusLabel(a.status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{a.fromCourseName}{a.toCourseName ? ` → ${a.toCourseName}` : ''}</p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-2">{a.reason}</p>
                  <div className="flex items-center flex-wrap gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <i className="ri-user-line" />
                      {a.studentName} ({a.studentCode})
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-calendar-line" />
                      Requested: {new Date(a.requestDate).toLocaleDateString()}
                    </span>
                    {a.reviewedBy && a.reviewDate && (
                      <span className="flex items-center gap-1">
                        <i className="ri-user-star-line" />
                        Reviewed: {new Date(a.reviewDate).toLocaleDateString()} by {a.reviewedBy}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {a.status === 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleReview(a.adjustmentId, false)}
                    className="px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview(a.adjustmentId, true)}
                    className="px-3 py-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-calendar-event-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No schedule adjustment requests found.</p>
        </div>
      )}
    </div>
  );
}