import React, { useEffect, useState, useCallback } from 'react';
import { fetchFeesDashboard, sendFeeReminder } from '@/lib/advisorPortalApi';
import type { FeesDashboardData, FeesDashboardStudentDto } from '@/types/advisor';
import { PAYMENT_STATUS_LABELS, PaymentStatus } from '@/lib/enums';

export default function AdvisorFees() {
  const [data, setData] = useState<FeesDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');
  const [search, setSearch] = useState('');
  const [sendingReminder, setSendingReminder] = useState<number | null>(null);

  useEffect(() => {
    fetchFeesDashboard()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = (data?.recentFeeAssignments ?? []).filter((s) => {
    let match = true;
    if (search.trim()) {
      const q = search.toLowerCase();
      match = s.studentName.toLowerCase().includes(q) || s.studentCode.toLowerCase().includes(q);
    }
    if (statusFilter !== 'all') {
      const map: Record<string, number> = { paid: PaymentStatus.Paid, partial: PaymentStatus.PartiallyPaid, unpaid: PaymentStatus.Unpaid };
      match = match && s.status === map[statusFilter];
    }
    return match;
  });

  const handleSendReminder = useCallback(async (studentFeeId: number) => {
    setSendingReminder(studentFeeId);
    await sendFeeReminder(studentFeeId);
    setSendingReminder(null);
  }, []);

  const statusBadge = (status: number) => {
    const map: Record<number, string> = {
      [PaymentStatus.Paid]: 'bg-emerald-50 text-emerald-600',
      [PaymentStatus.PartiallyPaid]: 'bg-amber-50 text-amber-600',
      [PaymentStatus.Unpaid]: 'bg-red-50 text-red-600',
    };
    return map[status] || 'bg-gray-50 text-gray-600';
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Fee Management</h1>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" /> Loading fee data...
        </div>
      )}

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center"><i className="ri-money-dollar-circle-line text-sm" /></div>
            </div>
            <p className="text-xl font-bold text-slate-800">{data.totalExpected.toLocaleString()} EGP</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Total Expected</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><i className="ri-check-double-line text-sm" /></div>
            </div>
            <p className="text-xl font-bold text-emerald-600">{data.totalCollected.toLocaleString()} EGP</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Total Collected</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><i className="ri-time-line text-sm" /></div>
            </div>
            <p className="text-xl font-bold text-amber-600">{data.totalPending.toLocaleString()} EGP</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Total Pending</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><i className="ri-error-warning-line text-sm" /></div>
            </div>
            <p className="text-xl font-bold text-red-600">{data.overdueStudents}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Overdue Students</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student name or code..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400" />
        </div>
        <div className="flex gap-1">
          {([{ key: 'all' as const, label: 'All' }, { key: 'paid' as const, label: 'Paid' }, { key: 'partial' as const, label: 'Partial' }, { key: 'unpaid' as const, label: 'Unpaid' }]).map((f) => (
            <button key={f.key} type="button" onClick={() => setStatusFilter(f.key)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === f.key ? 'bg-amber-600 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Recent Fee Assignments Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-slate-700">Recent Fee Assignments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Semester</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s: FeesDashboardStudentDto) => (
                <tr key={s.studentFeeId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-600">{s.studentName.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{s.studentName}</p>
                        <p className="text-[10px] text-slate-400">{s.studentCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{s.semesterName}</td>
                  <td className="px-5 py-3 text-center text-sm font-medium text-slate-700">{s.totalAmount.toLocaleString()} EGP</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge(s.status)}`}>
                      {PAYMENT_STATUS_LABELS[s.status as PaymentStatus]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {s.status !== PaymentStatus.Paid && (
                      <button type="button" onClick={() => handleSendReminder(s.studentFeeId)} disabled={sendingReminder === s.studentFeeId} className="px-3 py-1 text-xs text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 whitespace-nowrap">
                        {sendingReminder === s.studentFeeId ? <i className="ri-loader-4-line animate-spin" /> : 'Send Reminder'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-money-dollar-circle-line text-3xl text-slate-400" /></div>
          <p className="text-sm text-slate-500">No fee records match your filters.</p>
        </div>
      )}
    </div>
  );
}