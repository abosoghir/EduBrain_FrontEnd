import React, { useState } from 'react';
import type { FeeInvoice, Payment } from '@/types/admin';
import { FEE_STATUS_LABELS, FEE_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/enums';

interface Props {
  invoice: FeeInvoice;
  onClose: () => void;
  onRecordPaymentClick: () => void;
  onWaiveFeeClick: () => void;
}

export default function InvoiceDetailPanel({ invoice: inv, onClose, onRecordPaymentClick, onWaiveFeeClick }: Props) {
  const [tab, setTab] = useState<'details' | 'payments'>('details');

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
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-white shadow-2xl border-l border-gray-100 flex flex-col animate-slide-left">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-bold text-slate-800">{inv.invoiceNumber}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor(inv.status)}`}>
              {inv.statusDisplay || FEE_STATUS_LABELS[inv.status as keyof typeof FEE_STATUS_LABELS]}
            </span>
          </div>
          <p className="text-sm text-slate-500">Created: {fmtDate(inv.createdAt)} | Due: {fmtDate(inv.dueDate)}</p>
        </div>
        <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-white rounded-full hover:shadow-sm transition-all"><i className="ri-close-line text-lg" /></button>
      </div>

      <div className="flex px-6 border-b border-gray-100 pt-2">
        <button type="button" onClick={() => setTab('details')} className={`pb-3 text-sm font-medium border-b-2 px-2 transition-colors ${tab === 'details' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Invoice Details</button>
        <button type="button" onClick={() => setTab('payments')} className={`pb-3 text-sm font-medium border-b-2 px-2 transition-colors ml-6 ${tab === 'payments' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          Payment History {(inv.payments?.length || 0) > 0 && <span className="ml-1 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-[10px]">{inv.payments?.length}</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'details' && (
          <div className="space-y-6">
            {/* Student Info */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Student Information</h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Student Name</p>
                    <p className="text-sm font-medium text-slate-800">{inv.student?.name || inv.studentName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Student ID</p>
                    <p className="text-sm font-medium text-slate-800">{inv.student?.code || inv.studentCode}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400 uppercase">Semester</p>
                    <p className="text-sm font-medium text-slate-800">{inv.semester?.name || inv.semesterName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Financial Summary</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-gray-100 text-center">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Total</p>
                  <p className="text-sm font-bold text-slate-800">{fmtCurrency(inv.totalAmount)}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
                  <p className="text-[10px] text-emerald-600 uppercase mb-1">Paid</p>
                  <p className="text-sm font-bold text-emerald-700">{fmtCurrency(inv.paidAmount)}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 border border-red-100 text-center">
                  <p className="text-[10px] text-red-600 uppercase mb-1">Balance</p>
                  <p className="text-sm font-bold text-red-700">{fmtCurrency(inv.remainingAmount)}</p>
                </div>
              </div>
            </div>

            {/* Fee Items */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Fee Items</h3>
              <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
                {inv.items && inv.items.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {inv.items.map(item => (
                      <div key={item.feeItemId} className="p-3 flex items-start justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{item.description}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                            {item.feeTypeDisplay || FEE_TYPE_LABELS[item.feeType as keyof typeof FEE_TYPE_LABELS]}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-700">{fmtCurrency(item.amount)}</p>
                          {item.waivedAmount > 0 && <p className="text-[10px] text-emerald-600 mt-0.5">Waived: {fmtCurrency(item.waivedAmount)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm">No fee items found.</div>
                )}
                <div className="bg-slate-50 p-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-600">Total Billed</span>
                  <span className="text-sm font-bold text-slate-800">{fmtCurrency(inv.totalAmount)}</span>
                </div>
              </div>
            </div>

            {inv.notes && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</h3>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm text-amber-800">
                  {inv.notes}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'payments' && (
          <div>
            {inv.payments && inv.payments.length > 0 ? (
              <div className="space-y-3">
                {inv.payments.map((p, idx) => (
                  <div key={p.paymentId || idx} className={`p-4 rounded-xl border ${p.isRefunded ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{fmtCurrency(p.amount)}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{fmtDate(p.paymentDate)}</p>
                      </div>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                        {p.paymentMethodDisplay || PAYMENT_METHOD_LABELS[p.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]}
                      </span>
                    </div>
                    {p.transactionReference && (
                      <p className="text-xs text-slate-400"><i className="ri-barcode-line mr-1" /> Ref: {p.transactionReference}</p>
                    )}
                    {p.isRefunded && (
                      <div className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1">
                        <i className="ri-reply-line" /> Refunded ({fmtCurrency(p.refundedAmount)})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3"><i className="ri-money-dollar-circle-line text-2xl text-slate-300" /></div>
                <p className="text-sm text-slate-500">No payments recorded yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-5 border-t border-gray-100 bg-slate-50 flex gap-3">
        {(inv.status !== 2 && inv.status !== 4 && inv.status !== 5) && (
          <button type="button" onClick={onRecordPaymentClick} className="flex-1 bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
            Record Payment
          </button>
        )}
        {(inv.remainingAmount > 0 && inv.status !== 4 && inv.status !== 5) && (
          <button type="button" onClick={onWaiveFeeClick} className="px-4 py-2.5 bg-white border border-gray-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Waive Fees
          </button>
        )}
      </div>
    </div>
  );
}
