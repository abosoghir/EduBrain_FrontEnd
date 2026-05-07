import React, { useEffect, useState, useCallback } from 'react';
import { fetchFeesOverview, fetchStudentFees, updatePaymentStatus } from '@/lib/feesApi';
import type { FeesOverview, StudentFeeItem, StudentFeeFilterParams, UpdatePaymentStatusForm } from '@/types/admin';
import { PaymentStatus, PaymentMethod, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/enums';

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

export default function AdminFees() {
  const [tab, setTab] = useState<'overview' | 'fees'>('overview');
  const [overview, setOverview] = useState<FeesOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [fees, setFees] = useState<StudentFeeItem[]>([]);
  const [feesLoading, setFeesLoading] = useState(false);
  const [filters, setFilters] = useState<StudentFeeFilterParams>({});
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, totalCount: 0, hasPreviousPage: false, hasNextPage: false });

  const [editingFee, setEditingFee] = useState<StudentFeeItem | null>(null);
  const [payForm, setPayForm] = useState<UpdatePaymentStatusForm>({ studentFeeId: 0, status: 0, paymentMethod: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    const res = await fetchFeesOverview();
    if (res.data) setOverview(res.data);
    else showToast(res.error || 'Failed to load overview', false);
    setOverviewLoading(false);
  }, []);

  const loadFees = useCallback(async (page = 1) => {
    setFeesLoading(true);
    const res = await fetchStudentFees({ ...filters, page, pageSize: 20 });
    if (res.data) {
      setFees(res.data.items);
      setPagination({ page: res.data.pageNumber, totalPages: res.data.totalPages, totalCount: res.data.totalCount, hasPreviousPage: res.data.hasPreviousPage, hasNextPage: res.data.hasNextPage });
    } else { setFees([]); }
    setFeesLoading(false);
  }, [filters]);

  useEffect(() => { loadOverview(); }, [loadOverview]);
  useEffect(() => { if (tab === 'fees') loadFees(1); }, [tab, loadFees]);

  const handleOpenUpdate = (fee: StudentFeeItem) => {
    setEditingFee(fee);
    setPayForm({ studentFeeId: fee.studentFeeId, status: fee.status, paymentMethod: fee.paymentMethod, notes: '' });
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    if (!editingFee) return;
    const res = await updatePaymentStatus(editingFee.studentFeeId, payForm);
    setSubmitting(false);
    if (res.data) {
      showToast(`Payment updated for ${res.data.studentName}`);
      setEditingFee(null);
      loadFees(pagination.page);
      loadOverview();
    } else showToast(res.error || 'Update failed', false);
  };

  const fmtCurrency = (n: number) => `EGP ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; } };

  const statusColor = (s: number) => s === 0 ? 'bg-emerald-50 text-emerald-600' : s === 1 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Finance Management</h1>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${toast.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <i className={toast.ok ? 'ri-check-line' : 'ri-error-warning-line'} /> {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        <button type="button" onClick={() => setTab('overview')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'overview' ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>
          <i className="ri-dashboard-line mr-1" /> Overview
        </button>
        <button type="button" onClick={() => setTab('fees')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'fees' ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>
          <i className="ri-file-list-3-line mr-1" /> Student Fees
        </button>
      </div>

      {/* =========== Overview Tab =========== */}
      {tab === 'overview' && (
        <div>
          {overviewLoading && <div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading overview...</div>}
          {overview && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] text-slate-400 uppercase">Total Billed</p><p className="text-lg font-bold text-slate-700 mt-1">{fmtCurrency(overview.totalBilled)}</p></div>
                <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] text-slate-400 uppercase">Collected</p><p className="text-lg font-bold text-emerald-600 mt-1">{fmtCurrency(overview.totalCollected)}</p></div>
                <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] text-slate-400 uppercase">Pending</p><p className="text-lg font-bold text-amber-600 mt-1">{fmtCurrency(overview.pendingPayments)}</p></div>
                <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] text-slate-400 uppercase">Overdue</p><p className="text-lg font-bold text-red-600 mt-1">{fmtCurrency(overview.overdueAmount)}</p></div>
                <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] text-slate-400 uppercase">Collection Rate</p><p className="text-lg font-bold text-slate-700 mt-1">{overview.collectionRate.toFixed(1)}%</p></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Status Distribution</h3>
                  <div className="space-y-2">
                    {overview.statusDistribution.map(s => (
                      <div key={s.status} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-sm text-slate-700">{s.status}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-slate-700">{s.count}</span>
                          <span className="text-xs text-slate-400 ml-2">{fmtCurrency(s.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Department Breakdown */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">By Department</h3>
                  <div className="space-y-2">
                    {overview.departmentBreakdown.map(d => (
                      <div key={d.departmentId} className="py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">{d.departmentName}</span>
                          <span className="text-xs text-slate-400">{d.studentCount} students</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${d.totalBilled > 0 ? (d.totalCollected / d.totalBilled * 100) : 0}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">{fmtCurrency(d.totalCollected)} / {fmtCurrency(d.totalBilled)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Payments */}
              {overview.recentPayments.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-5 mt-6">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Recent Payments</h3>
                  <div className="space-y-2">
                    {overview.recentPayments.map(p => (
                      <div key={p.studentFeeId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{p.studentName}</p>
                          <p className="text-[10px] text-slate-400">{fmtDate(p.paymentDate)} · {p.methodDisplay}</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">{fmtCurrency(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* =========== Student Fees Tab =========== */}
      {tab === 'fees' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input type="number" min={1} value={filters.studentId ?? ''} onChange={e => setFilters(p => ({ ...p, studentId: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Student ID" className="w-32 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" />
            <select value={filters.status ?? ''} onChange={e => setFilters(p => ({ ...p, status: e.target.value !== '' ? Number(e.target.value) : undefined }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="">All Status</option>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {feesLoading && <div className="flex items-center gap-2 text-slate-400 text-sm mb-4"><i className="ri-loader-4-line animate-spin" /> Loading...</div>}

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50">
                  {['Student', 'Department', 'Semester', 'Tuition', 'Books', 'Total', 'Paid', 'Remaining', 'Status', 'Method', 'Actions'].map(h => (
                    <th key={h} className={`${h === 'Student' ? 'text-left' : 'text-center'} px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider`}>{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {fees.map(f => (
                    <tr key={f.studentFeeId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-3"><p className="text-sm font-medium text-slate-700">{f.studentName}</p><p className="text-[10px] text-slate-400">{f.studentCode}</p></td>
                      <td className="px-3 py-3 text-center text-xs text-slate-600">{f.departmentName}</td>
                      <td className="px-3 py-3 text-center text-xs text-slate-600">{f.semesterName}</td>
                      <td className="px-3 py-3 text-center text-xs text-slate-600">{f.tuitionFees.toLocaleString()}</td>
                      <td className="px-3 py-3 text-center text-xs text-slate-600">{f.booksFees.toLocaleString()}</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{f.totalAmount.toLocaleString()}</td>
                      <td className="px-3 py-3 text-center text-xs font-semibold text-emerald-600">{f.paidAmount.toLocaleString()}</td>
                      <td className="px-3 py-3 text-center text-xs font-semibold text-red-600">{f.remainingAmount.toLocaleString()}</td>
                      <td className="px-3 py-3 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor(f.status)}`}>{f.statusDisplay || PAYMENT_STATUS_LABELS[f.status as PaymentStatus]}</span></td>
                      <td className="px-3 py-3 text-center text-[10px] text-slate-500">{f.paymentMethodDisplay || PAYMENT_METHOD_LABELS[f.paymentMethod as PaymentMethod]}</td>
                      <td className="px-3 py-3 text-center">
                        <button type="button" onClick={() => handleOpenUpdate(f)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500" title="Update Payment">
                          <i className="ri-edit-2-line text-sm" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!feesLoading && fees.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 mt-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-money-dollar-circle-line text-3xl text-slate-400" /></div>
              <p className="text-sm text-slate-500">No fee records found.</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
              <span>Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)</span>
              <div className="flex gap-2">
                <button type="button" disabled={!pagination.hasPreviousPage} onClick={() => loadFees(pagination.page - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-gray-50 disabled:opacity-40">Previous</button>
                <button type="button" disabled={!pagination.hasNextPage} onClick={() => loadFees(pagination.page + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-gray-50 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========== Update Payment Modal =========== */}
      {editingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Update Payment</h2>
                <p className="text-xs text-slate-400">{editingFee.studentName} — {fmtCurrency(editingFee.totalAmount)}</p>
              </div>
              <button type="button" onClick={() => setEditingFee(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleUpdatePayment} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Payment Status *</label>
                  <select required value={payForm.status} onChange={e => setPayForm(p => ({ ...p, status: Number(e.target.value) }))} className={inputCls}>
                    {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Payment Method *</label>
                  <select required value={payForm.paymentMethod} onChange={e => setPayForm(p => ({ ...p, paymentMethod: Number(e.target.value) }))} className={inputCls}>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <textarea value={payForm.notes ?? ''} onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))} rows={2} className={`${inputCls} resize-none`} placeholder="Optional remarks..." />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingFee(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : 'Update Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}