import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../../lib/api';
import type { ApiResponse } from '../../../lib/api';
import type { StudentFeeSummary, StudentFee } from '../../../types/student';

import { PAYMENT_STATUS_LABELS } from '../../../lib/enums';

export default function StudentFees() {
  const [fees, setFees] = useState<StudentFeeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<number | 'all'>('all');

  useEffect(() => {
    api.get<ApiResponse<StudentFeeSummary>>('/api/student/fees')
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && res.data.data) {
          setFees(res.data.data);
        } else {
          setFees(null);
        }
      })
      .catch(() => {
        setFees(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredFees = useMemo(() => {
    if (!fees) return [];
    if (filterStatus === 'all') return fees.fees;
    return fees.fees.filter((f) => f.paymentStatus === filterStatus);
  }, [fees, filterStatus]);

  const statusBadge = (status: number) => {
    const map: Record<number, string> = {
      0: 'bg-emerald-50 text-emerald-600',
      1: 'bg-red-50 text-red-600',
      2: 'bg-amber-50 text-amber-600',
    };
    return map[status] || 'bg-gray-50 text-gray-600';
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">My Fees</h1>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading fees...
        </div>
      )}

      {/* Summary cards */}
      {fees && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Fees', value: fees.totalFees.toLocaleString(), icon: 'ri-money-dollar-circle-line', color: 'text-slate-600 bg-slate-50' },
            { label: 'Total Paid', value: fees.totalPaid.toLocaleString(), icon: 'ri-check-line', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Remaining', value: fees.totalRemaining.toLocaleString(), icon: 'ri-alert-line', color: fees.totalRemaining > 0 ? 'text-red-600 bg-red-50' : 'text-slate-400 bg-slate-50' },
            { label: 'Pending', value: fees.fees.filter((f) => f.paymentStatus === 1).length, icon: 'ri-time-line', color: 'text-amber-600 bg-amber-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                  <i className={`${s.icon} text-sm`} />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(['all', 0, 1, 2] as const).map((status) => (
          <button
            key={String(status)}
            type="button"
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filterStatus === status ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'All' : PAYMENT_STATUS_LABELS[status as 0 | 1 | 2]}
          </button>
        ))}
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Fee Statement</h2>
          <span className="text-xs text-slate-400">{filteredFees.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Fee Type</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Paid</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Remaining</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFees.map((fee: StudentFee) => (
                <tr key={fee.feeId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-700">{fee.feeType}</p>
                    <p className="text-[10px] text-slate-400">{fee.academicYearName} · {fee.semesterName}</p>
                  </td>
                  <td className="px-5 py-3 text-center text-sm text-slate-600">{fee.amount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-center text-sm text-emerald-600">{fee.paidAmount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-center text-sm text-slate-600">{fee.remainingAmount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-center text-xs text-slate-500">{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium ${statusBadge(fee.paymentStatus)}`}>
                      {PAYMENT_STATUS_LABELS[fee.paymentStatus as 0 | 1 | 2]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filteredFees.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-400">No fees found.</p>
        </div>
      )}
    </div>
  );
}