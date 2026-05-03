import React, { useState, useEffect } from 'react';
import type { UpdateAdvisorForm, AdvisorDetail, RoomOption } from '@/types/admin';
import { fetchOfficeRooms } from '@/lib/advisorApi';

interface Props {
  advisor: AdvisorDetail;
  onSubmit: (form: UpdateAdvisorForm) => Promise<void>;
  onClose: () => void;
  submitting: boolean;
}

export default function EditAdvisorModal({ advisor, onSubmit, onClose, submitting }: Props) {
  const [form, setForm] = useState<UpdateAdvisorForm>({
    advisorId: advisor.id,
    name: advisor.fullName,
    phoneNumber: advisor.phoneNumber || '',
    officeRoomId: advisor.officeRoomId ?? undefined,
  });
  const [rooms, setRooms] = useState<RoomOption[]>([]);

  useEffect(() => { fetchOfficeRooms().then(setRooms); }, []);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(form); };
  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Edit Advisor — {advisor.fullName}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
            <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number *</label>
            <input type="text" required value={form.phoneNumber} onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Office Room</label>
            <select value={form.officeRoomId ?? ''} onChange={e => setForm(p => ({ ...p, officeRoomId: e.target.value ? Number(e.target.value) : undefined }))} className={inputCls}>
              <option value="">— None —</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting || !form.name || !form.phoneNumber}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
              {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
