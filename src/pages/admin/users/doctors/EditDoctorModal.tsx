import React, { useState, useEffect } from 'react';
import type { UpdateDoctorForm, DoctorDetail, DepartmentOption, RoomOption } from '@/types/admin';
import { fetchDepartments, fetchOfficeRooms } from '@/lib/doctorApi';

interface Props {
  doctor: DoctorDetail;
  onSubmit: (form: Partial<UpdateDoctorForm>) => Promise<void>;
  onClose: () => void;
  submitting: boolean;
}

export default function EditDoctorModal({ doctor, onSubmit, onClose, submitting }: Props) {
  const nameParts = doctor.fullName.replace(/^Dr\.\s*/i, '').split(' ');
  const [form, setForm] = useState<UpdateDoctorForm>({
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: doctor.email,
    phoneNumber: doctor.phoneNumber || '',
    nationalId: doctor.nationalId || '',
    title: doctor.title,
    departmentId: doctor.departmentId,
    officeRoomId: doctor.officeRoomId || undefined,
  });
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);

  useEffect(() => { fetchDepartments().then(setDepartments); fetchOfficeRooms().then(setRooms); }, []);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(form); };
  const set = (key: keyof UpdateDoctorForm, val: string | number | undefined) => setForm(p => ({ ...p, [key]: val }));
  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Edit Doctor — {doctor.fullName}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Personal</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">First Name</label><input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Last Name</label><input type="text" value={form.lastName} onChange={e => set('lastName', e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Email</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Phone</label><input type="text" value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} className={inputCls} /></div>
              <div className="col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">National ID</label><input type="text" value={form.nationalId} onChange={e => set('nationalId', e.target.value)} className={inputCls} /></div>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Academic</h3>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                <select value={form.title} onChange={e => set('title', Number(e.target.value))} className={inputCls}>
                  <option value={0}>Professor</option><option value={1}>Associate Professor</option><option value={2}>Assistant Professor</option><option value={3}>Lecturer</option><option value={4}>Teaching Assistant</option>
                </select></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                <select value={form.departmentId ?? ''} onChange={e => set('departmentId', Number(e.target.value))} className={inputCls}>
                  <option value="">— Select —</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.description}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Office Room</label>
                <select value={form.officeRoomId ?? ''} onChange={e => set('officeRoomId', e.target.value ? Number(e.target.value) : undefined)} className={inputCls}>
                  <option value="">— Select —</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select></div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
              {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
