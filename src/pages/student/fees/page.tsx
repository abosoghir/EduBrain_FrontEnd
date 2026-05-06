import React, { useEffect, useState } from 'react';
import { fetchStudentFees } from '@/lib/studentPortalApi';
import type { StudentFeesData } from '@/types/student';
import { PAYMENT_METHOD_LABELS } from '@/lib/enums';

const PAYMENT_STATUS: Record<number, { label: string; color: string }> = {
  0: { label: 'Paid', color: 'bg-emerald-50 text-emerald-600' },
  1: { label: 'Unpaid', color: 'bg-red-50 text-red-600' },
  2: { label: 'Partially Paid', color: 'bg-amber-50 text-amber-600' },
};

const FEE_ITEM_STATUS: Record<number, { label: string; color: string; icon: string }> = {
  0: { label: 'Paid', color: 'text-emerald-600', icon: 'ri-check-circle-line' },
  1: { label: 'Unpaid', color: 'text-red-500', icon: 'ri-close-circle-line' },
};

export default function StudentFees() {
  const [data, setData] = useState<StudentFeesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);

  useEffect(() => {
    fetchStudentFees()
      .then((d) => {
        setData(d);
        setSelectedSemesterId(d.selectedSemesterId);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSemesterChange = async (semesterId: number) => {
    setSelectedSemesterId(semesterId);
    setLoading(true);
    try {
      const res = await fetchStudentFees(semesterId);
      setData(res);
    } catch {
      // keep
    } finally {
      setLoading(false);
    }
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

      {/* Semester Selector */}
      {data && data.availableSemesters.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {data.availableSemesters.map((sem) => (
            <button
              key={sem.semesterId}
              type="button"
              onClick={() => handleSemesterChange(sem.semesterId)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedSemesterId === sem.semesterId
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
              }`}
            >
              {sem.name}
              {sem.isCurrent && (
                <span className={`ml-1.5 text-[10px] ${selectedSemesterId === sem.semesterId ? 'text-emerald-200' : 'text-slate-400'}`}>★</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fee Summary Card */}
      {data && (
        <>
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-slate-400">Semester: {data.selectedSemesterName}</p>
                <h2 className="text-2xl font-bold text-slate-800 mt-1">
                  {data.amountPaid.toLocaleString()} EGP
                  <span className="text-sm font-normal text-slate-400 ml-2">paid</span>
                </h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PAYMENT_STATUS[data.paymentStatus]?.color ?? 'bg-gray-50 text-gray-600'}`}>
                {PAYMENT_STATUS[data.paymentStatus]?.label ?? '—'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Due</p>
                <p className="text-base font-bold text-slate-800">{data.totalDue.toLocaleString()} EGP</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Remaining</p>
                <p className={`text-base font-bold ${data.remainingAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {data.remainingAmount.toLocaleString()} EGP
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Due Date</p>
                <p className="text-base font-bold text-slate-800">
                  {data.dueDate ? new Date(data.dueDate).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>Payment Progress</span>
                <span>{data.paidPercentage.toFixed(0)}% paid</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${data.paidPercentage >= 100 ? 'bg-emerald-500' : data.paidPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(data.paidPercentage, 100)}%` }}
                />
              </div>
            </div>

            {data.isOverdue && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                <i className="ri-error-warning-line" />
                This payment is overdue.
              </div>
            )}
          </div>

          {/* Fee Breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-slate-700">Fee Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase">Fee Type</th>
                    <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase">Amount</th>
                    <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase">Status</th>
                    <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase">Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.feeBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-sm font-medium text-slate-700">{item.feeType}</td>
                      <td className="px-5 py-3 text-center text-sm text-slate-600">{item.amount.toLocaleString()} EGP</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${FEE_ITEM_STATUS[item.status]?.color ?? 'text-slate-500'}`}>
                          <i className={FEE_ITEM_STATUS[item.status]?.icon ?? 'ri-question-line'} />
                          {FEE_ITEM_STATUS[item.status]?.label ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-xs text-slate-400">
                        {item.paidDate ? new Date(item.paidDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-5 py-3 text-sm text-slate-700">Total</td>
                    <td className="px-5 py-3 text-center text-sm text-slate-800">{data.totalDue.toLocaleString()} EGP</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment History */}
          {data.paymentHistory.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-slate-700">Payment History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase">Date</th>
                      <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase">Amount</th>
                      <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase">Method</th>
                      <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.paymentHistory.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-xs text-slate-600">
                          {new Date(p.paymentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3 text-center text-sm font-medium text-emerald-600">{p.amount.toLocaleString()} EGP</td>
                        <td className="px-5 py-3 text-center text-xs text-slate-500">
                          {PAYMENT_METHOD_LABELS[p.method as 0 | 1 | 2 | 3]}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="font-mono text-[10px] text-slate-400 bg-gray-50 px-2 py-0.5 rounded">
                            {p.receiptNumber}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !data && (
        <div className="text-center py-12">
          <p className="text-sm text-slate-500">No fees data available.</p>
        </div>
      )}
    </div>
  );
}