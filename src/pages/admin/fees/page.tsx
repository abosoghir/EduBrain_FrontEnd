import React, { useEffect, useState, useCallback } from 'react';
import {
  getFeesDashboard, getInvoices, getInvoiceDetails, createInvoice,
  recordPayment, waiveInvoice, getPayments
} from '@/lib/feesApi';
import { fetchSemesters } from '@/lib/scheduleApi';
import { fetchStudents } from '@/lib/studentApi';
import type {
  FeesDashboard, FeeInvoice, SemesterOption, Payment,
  CreateInvoiceRequest, RecordPaymentRequest, WaiveFeeRequest, FeeItemRequest
} from '@/types/admin';
import { FEE_STATUS_LABELS, FEE_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/enums';
import InvoiceDetailPanel from './InvoiceDetailPanel';

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

export default function AdminFees() {
  const [tab, setTab] = useState<'dashboard' | 'invoices' | 'payments'>('dashboard');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Dashboard State
  const [dashboard, setDashboard] = useState<FeesDashboard | null>(null);
  const [dashLoading, setDashLoading] = useState(true);

  // Invoices State
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [invPagination, setInvPagination] = useState({ page: 1, totalPages: 0, totalCount: 0, hasPreviousPage: false, hasNextPage: false });
  const [invLoading, setInvLoading] = useState(false);
  const [invFilters, setInvFilters] = useState<{ studentId?: number; status?: number; feeType?: number; fromDate?: string; toDate?: string }>({});

  // Payments State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payPagination, setPayPagination] = useState({ page: 1, totalPages: 0, totalCount: 0, hasPreviousPage: false, hasNextPage: false });
  const [payLoading, setPayLoading] = useState(false);
  const [payFilters, setPayFilters] = useState<{ studentId?: number; paymentMethod?: number; fromDate?: string; toDate?: string }>({});

  // Global lookups
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [students, setStudents] = useState<{ id: number; fullName: string; studentCode: string }[]>([]);

  // Modal states
  const [viewInvoice, setViewInvoice] = useState<FeeInvoice | null>(null);
  const [viewInvoiceId, setViewInvoiceId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showWaive, setShowWaive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Create Invoice Form
  const [createForm, setCreateForm] = useState<CreateInvoiceRequest>({
    studentId: 0, semesterId: 0, dueDate: '', items: [], notes: ''
  });

  // Record Payment Form
  const [recordForm, setRecordForm] = useState<RecordPaymentRequest>({
    amount: 0, paymentMethod: 0, transactionReference: '', paymentDate: new Date().toISOString().split('T')[0], notes: ''
  });

  // Waive Form
  const [waiveForm, setWaiveForm] = useState<WaiveFeeRequest>({
    amount: 0, reason: '', notes: ''
  });

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  // Init Data
  useEffect(() => {
    fetchSemesters().then(setSemesters);
    fetchStudents({ pageSize: 1000 }).then(res => {
      if (res.data) setStudents(res.data.items);
    });
  }, []);

  const loadDashboard = useCallback(async () => {
    setDashLoading(true);
    const res = await getFeesDashboard();
    if (res.data) setDashboard(res.data);
    setDashLoading(false);
  }, []);

  const loadInvoices = useCallback(async (page = 1) => {
    setInvLoading(true);
    const res = await getInvoices({ ...invFilters, page, pageSize: 20 });
    if (res.data) {
      setInvoices(res.data.items);
      setInvPagination({ page: res.data.page, totalPages: res.data.totalPages, totalCount: res.data.totalCount, hasPreviousPage: res.data.hasPreviousPage, hasNextPage: res.data.hasNextPage });
    } else setInvoices([]);
    setInvLoading(false);
  }, [invFilters]);

  const loadPayments = useCallback(async (page = 1) => {
    setPayLoading(true);
    const res = await getPayments({ ...payFilters, page, pageSize: 20 });
    if (res.data) {
      setPayments(res.data.items);
      setPayPagination({ page: res.data.page, totalPages: res.data.totalPages, totalCount: res.data.totalCount, hasPreviousPage: res.data.hasPreviousPage, hasNextPage: res.data.hasNextPage });
    } else setPayments([]);
    setPayLoading(false);
  }, [payFilters]);

  const fetchInvoiceDetail = useCallback(async (id: number) => {
    const res = await getInvoiceDetails(id);
    if (res.data) setViewInvoice(res.data);
  }, []);

  useEffect(() => {
    if (tab === 'dashboard') loadDashboard();
    else if (tab === 'invoices') loadInvoices(1);
    else if (tab === 'payments') loadPayments(1);
  }, [tab, loadDashboard, loadInvoices, loadPayments]);

  useEffect(() => {
    if (viewInvoiceId) fetchInvoiceDetail(viewInvoiceId);
  }, [viewInvoiceId, fetchInvoiceDetail]);

  // Handle Form Submits
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await createInvoice(createForm);
    setSubmitting(false);
    if (res.success) {
      showToast('Invoice created successfully');
      setShowCreate(false);
      loadInvoices(1);
      loadDashboard();
    } else showToast(res.error || 'Failed to create invoice', false);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewInvoice) return;
    setSubmitting(true);
    const res = await recordPayment(viewInvoice.invoiceId, recordForm);
    setSubmitting(false);
    if (res.success) {
      showToast('Payment recorded successfully');
      setShowRecordPayment(false);
      fetchInvoiceDetail(viewInvoice.invoiceId);
      if (tab === 'invoices') loadInvoices(invPagination.page);
      loadDashboard();
    } else showToast(res.error || 'Failed to record payment', false);
  };

  const handleWaiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewInvoice) return;
    setSubmitting(true);
    const res = await waiveInvoice(viewInvoice.invoiceId, waiveForm);
    setSubmitting(false);
    if (res.success) {
      showToast('Fee waived successfully');
      setShowWaive(false);
      fetchInvoiceDetail(viewInvoice.invoiceId);
      if (tab === 'invoices') loadInvoices(invPagination.page);
      loadDashboard();
    } else showToast(res.error || 'Failed to waive fee', false);
  };

  const fmtCurrency = (n: number) => `EGP ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; } };

  const statusColor = (s: number) => {
    switch (s) {
      case 0: return 'bg-amber-100 text-amber-700'; // Pending
      case 1: return 'bg-blue-100 text-blue-700'; // PartiallyPaid
      case 2: return 'bg-emerald-100 text-emerald-700'; // Paid
      case 3: return 'bg-red-100 text-red-700'; // Overdue
      case 4: return 'bg-gray-100 text-gray-700'; // Waived
      case 5: return 'bg-purple-100 text-purple-700'; // Refunded
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Fees Management</h1>
        <button type="button" onClick={() => {
          setCreateForm({ studentId: 0, semesterId: 0, dueDate: '', items: [{ feeType: 0, description: '', amount: 0 }], notes: '' });
          setShowCreate(true);
        }} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
          <i className="ri-add-line mr-1" /> Create Invoice
        </button>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${toast.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <i className={toast.ok ? 'ri-check-line' : 'ri-error-warning-line'} /> {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        <button type="button" onClick={() => setTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'dashboard' ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>
          <i className="ri-dashboard-line mr-1" /> Dashboard
        </button>
        <button type="button" onClick={() => setTab('invoices')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'invoices' ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>
          <i className="ri-file-list-3-line mr-1" /> Invoices
        </button>
        <button type="button" onClick={() => setTab('payments')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'payments' ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>
          <i className="ri-bank-card-line mr-1" /> Payment History
        </button>
      </div>

      {/* =========== Dashboard Tab =========== */}
      {tab === 'dashboard' && (
        <div>
          {dashLoading && <div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading dashboard...</div>}
          {dashboard && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center"><i className="ri-money-dollar-circle-line" /></div><span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Outstanding</span></div>
                  <p className="text-xl font-bold text-slate-800">{fmtCurrency(dashboard.totalOutstanding)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center"><i className="ri-check-line" /></div><span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Collected</span></div>
                  <p className="text-xl font-bold text-emerald-700">{fmtCurrency(dashboard.totalCollected)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center"><i className="ri-time-line" /></div><span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Pending</span></div>
                  <p className="text-xl font-bold text-slate-800">{dashboard.pendingInvoices} <span className="text-xs font-normal text-slate-400">Invoices</span></p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center"><i className="ri-check-double-line" /></div><span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Paid</span></div>
                  <p className="text-xl font-bold text-slate-800">{dashboard.paidInvoices} <span className="text-xs font-normal text-slate-400">Invoices</span></p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded bg-red-50 text-red-600 flex items-center justify-center"><i className="ri-error-warning-line" /></div><span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Overdue</span></div>
                  <p className="text-xl font-bold text-red-600">{dashboard.overdueInvoices} <span className="text-xs font-normal text-red-400">Invoices</span></p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Fee Breakdown</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Tuition</span><span className="font-semibold text-slate-800">{fmtCurrency(dashboard.semesterBreakdown.totalTuition)}</span></div>
                      <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Administrative</span><span className="font-semibold text-slate-800">{fmtCurrency(dashboard.semesterBreakdown.totalAdministrative)}</span></div>
                      <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{ width: '15%' }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Services</span><span className="font-semibold text-slate-800">{fmtCurrency(dashboard.semesterBreakdown.totalServices)}</span></div>
                      <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: '10%' }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Fines</span><span className="font-semibold text-slate-800">{fmtCurrency(dashboard.semesterBreakdown.totalFines)}</span></div>
                      <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }}></div></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-center items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-3"><i className="ri-line-chart-line text-2xl text-emerald-500" /></div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Monthly Collection</h3>
                  <p className="text-3xl font-bold text-slate-800">{fmtCurrency(dashboard.monthlyCollection)}</p>
                  <p className="text-xs text-slate-500 mt-2">Collected this month</p>
                  <div className="mt-4 text-xs font-medium bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full">
                    {dashboard.recentTransactions} transactions in last 30 days
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* =========== Invoices Tab =========== */}
      {tab === 'invoices' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-gray-100">
            <input type="number" min={1} value={invFilters.studentId ?? ''} onChange={e => setInvFilters(p => ({ ...p, studentId: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Student ID" className="w-32 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" />
            <select value={invFilters.status ?? ''} onChange={e => setInvFilters(p => ({ ...p, status: e.target.value ? Number(e.target.value) : undefined }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="">All Statuses</option>
              {Object.entries(FEE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <div className="flex items-center gap-2 ml-auto">
              <input type="date" value={invFilters.fromDate ?? ''} onChange={e => setInvFilters(p => ({ ...p, fromDate: e.target.value || undefined }))} className="w-36 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" />
              <span className="text-slate-400">-</span>
              <input type="date" value={invFilters.toDate ?? ''} onChange={e => setInvFilters(p => ({ ...p, toDate: e.target.value || undefined }))} className="w-36 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden relative">
            {invLoading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><i className="ri-loader-4-line animate-spin text-2xl text-slate-400" /></div>}
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-gray-100 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Invoice #</th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Balance</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Due Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No invoices found.</td></tr>
                ) : invoices.map(inv => (
                  <tr key={inv.invoiceId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800 font-medium">{inv.studentName}</p>
                      <p className="text-[10px] text-slate-400">{inv.studentCode}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{fmtCurrency(inv.totalAmount)}</td>
                    <td className="px-4 py-3">
                      {inv.remainingAmount > 0 ? <span className="font-semibold text-red-600">{fmtCurrency(inv.remainingAmount)}</span> : <span className="text-emerald-600">Settled</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusColor(inv.status)}`}>
                        {inv.statusDisplay || FEE_STATUS_LABELS[inv.status as keyof typeof FEE_STATUS_LABELS]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(inv.dueDate)}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => setViewInvoiceId(inv.invoiceId)} className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {invPagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
              <span>Page {invPagination.page} of {invPagination.totalPages}</span>
              <div className="flex gap-2">
                <button type="button" disabled={!invPagination.hasPreviousPage} onClick={() => loadInvoices(invPagination.page - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">Previous</button>
                <button type="button" disabled={!invPagination.hasNextPage} onClick={() => loadInvoices(invPagination.page + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========== Payments Tab =========== */}
      {tab === 'payments' && (
        <div>
          <div className="flex flex-wrap gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-gray-100">
            <input type="number" min={1} value={payFilters.studentId ?? ''} onChange={e => setPayFilters(p => ({ ...p, studentId: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Student ID" className="w-32 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" />
            <select value={payFilters.paymentMethod ?? ''} onChange={e => setPayFilters(p => ({ ...p, paymentMethod: e.target.value ? Number(e.target.value) : undefined }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="">All Methods</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden relative">
            {payLoading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><i className="ri-loader-4-line animate-spin text-2xl text-slate-400" /></div>}
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-gray-100 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Invoice #</th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No payments found.</td></tr>
                ) : payments.map(pay => (
                  <tr key={pay.paymentId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-blue-600 cursor-pointer" onClick={() => { setTab('invoices'); setViewInvoiceId(pay.invoiceId); }}>{pay.invoiceNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{pay.studentName}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{fmtCurrency(pay.amount)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                        {pay.paymentMethodDisplay || PAYMENT_METHOD_LABELS[pay.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{pay.transactionReference || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(pay.paymentDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {payPagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
              <span>Page {payPagination.page} of {payPagination.totalPages}</span>
              <div className="flex gap-2">
                <button type="button" disabled={!payPagination.hasPreviousPage} onClick={() => loadPayments(payPagination.page - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">Previous</button>
                <button type="button" disabled={!payPagination.hasNextPage} onClick={() => loadPayments(payPagination.page + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========== Modals & Panels =========== */}

      {viewInvoice && !showRecordPayment && !showWaive && (
        <>
          <div className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => { setViewInvoice(null); setViewInvoiceId(null); }} />
          <InvoiceDetailPanel
            invoice={viewInvoice}
            onClose={() => { setViewInvoice(null); setViewInvoiceId(null); }}
            onRecordPaymentClick={() => {
              setRecordForm({ amount: viewInvoice.remainingAmount, paymentMethod: 0, transactionReference: '', paymentDate: new Date().toISOString().split('T')[0], notes: '' });
              setShowRecordPayment(true);
            }}
            onWaiveFeeClick={() => {
              setWaiveForm({ amount: viewInvoice.remainingAmount, reason: '', notes: '' });
              setShowWaive(true);
            }}
          />
        </>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-slate-800">Create Fee Invoice</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-gray-100 rounded-full"><i className="ri-close-line text-lg" /></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Student *</label>
                  <select required value={createForm.studentId || ''} onChange={e => setCreateForm(p => ({ ...p, studentId: Number(e.target.value) }))} className={inputCls}>
                    <option value="">Select Student...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.studentCode})</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Semester *</label>
                  <select required value={createForm.semesterId || ''} onChange={e => setCreateForm(p => ({ ...p, semesterId: Number(e.target.value) }))} className={inputCls}>
                    <option value="">Select Semester...</option>
                    {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Due Date *</label>
                  <input type="date" required value={createForm.dueDate} onChange={e => setCreateForm(p => ({ ...p, dueDate: e.target.value }))} className={inputCls} />
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-700">Fee Items</h3>
                  <button type="button" onClick={() => setCreateForm(p => ({ ...p, items: [...p.items, { feeType: 0, description: '', amount: 0 }] }))} className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {createForm.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start bg-slate-50 p-2 rounded-lg border border-gray-100">
                      <div className="w-1/3">
                        <select required value={item.feeType} onChange={e => {
                          const newItems = [...createForm.items];
                          newItems[idx].feeType = Number(e.target.value);
                          setCreateForm(p => ({ ...p, items: newItems }));
                        }} className={inputCls}>
                          {Object.entries(FEE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <input type="text" required placeholder="Description" value={item.description} onChange={e => {
                          const newItems = [...createForm.items];
                          newItems[idx].description = e.target.value;
                          setCreateForm(p => ({ ...p, items: newItems }));
                        }} className={inputCls} />
                      </div>
                      <div className="w-1/4">
                        <input type="number" required min="0.01" step="0.01" placeholder="Amount" value={item.amount || ''} onChange={e => {
                          const newItems = [...createForm.items];
                          newItems[idx].amount = Number(e.target.value);
                          setCreateForm(p => ({ ...p, items: newItems }));
                        }} className={inputCls} />
                      </div>
                      {createForm.items.length > 1 && (
                        <button type="button" onClick={() => {
                          const newItems = [...createForm.items];
                          newItems.splice(idx, 1);
                          setCreateForm(p => ({ ...p, items: newItems }));
                        }} className="w-9 h-9 flex shrink-0 items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <i className="ri-delete-bin-line" />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="text-right text-sm font-semibold text-slate-700 mt-2 pr-10">
                    Total: {fmtCurrency(createForm.items.reduce((sum, item) => sum + (item.amount || 0), 0))}
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Notes</label>
                <textarea value={createForm.notes || ''} onChange={e => setCreateForm(p => ({ ...p, notes: e.target.value }))} rows={2} className={inputCls} placeholder="Optional notes..."></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting || !createForm.studentId || !createForm.semesterId || !createForm.dueDate} className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecordPayment && viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Record Payment</h2>
              <button type="button" onClick={() => setShowRecordPayment(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-gray-100 rounded-full"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleRecordPaymentSubmit} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-gray-100 text-sm mb-4">
                <div className="flex justify-between mb-1"><span className="text-slate-500">Invoice</span><span className="font-semibold text-slate-800">{viewInvoice.invoiceNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Remaining Balance</span><span className="font-bold text-red-600">{fmtCurrency(viewInvoice.remainingAmount)}</span></div>
              </div>
              
              <div>
                <label className={labelCls}>Payment Amount *</label>
                <input type="number" required min="0.01" max={viewInvoice.remainingAmount} step="0.01" value={recordForm.amount || ''} onChange={e => setRecordForm(p => ({ ...p, amount: Number(e.target.value) }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Payment Method *</label>
                <select required value={recordForm.paymentMethod} onChange={e => setRecordForm(p => ({ ...p, paymentMethod: Number(e.target.value) }))} className={inputCls}>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Date *</label>
                <input type="date" required value={recordForm.paymentDate} onChange={e => setRecordForm(p => ({ ...p, paymentDate: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Transaction Reference</label>
                <input type="text" value={recordForm.transactionReference || ''} onChange={e => setRecordForm(p => ({ ...p, transactionReference: e.target.value }))} className={inputCls} placeholder="Optional" />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowRecordPayment(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting || !recordForm.amount} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  {submitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWaive && viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Waive Fees</h2>
              <button type="button" onClick={() => setShowWaive(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-gray-100 rounded-full"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleWaiveSubmit} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-gray-100 text-sm mb-4">
                <div className="flex justify-between mb-1"><span className="text-slate-500">Invoice</span><span className="font-semibold text-slate-800">{viewInvoice.invoiceNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Remaining Balance</span><span className="font-bold text-red-600">{fmtCurrency(viewInvoice.remainingAmount)}</span></div>
              </div>
              
              <div>
                <label className={labelCls}>Amount to Waive *</label>
                <input type="number" required min="0.01" max={viewInvoice.remainingAmount} step="0.01" value={waiveForm.amount || ''} onChange={e => setWaiveForm(p => ({ ...p, amount: Number(e.target.value) }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Reason *</label>
                <input type="text" required value={waiveForm.reason} onChange={e => setWaiveForm(p => ({ ...p, reason: e.target.value }))} className={inputCls} placeholder="e.g. Scholarship approval" />
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <textarea value={waiveForm.notes || ''} onChange={e => setWaiveForm(p => ({ ...p, notes: e.target.value }))} rows={2} className={inputCls} placeholder="Optional details..." />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowWaive(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting || !waiveForm.amount || !waiveForm.reason} className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50">
                  {submitting ? 'Processing...' : 'Confirm Waiver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}