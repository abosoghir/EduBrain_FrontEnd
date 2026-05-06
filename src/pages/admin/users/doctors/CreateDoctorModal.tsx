import React, { useState, useEffect } from 'react';
import type { CreateDoctorForm, DepartmentOption, RoomOption } from '@/types/admin';
import { fetchDepartments, fetchOfficeRooms } from '@/lib/doctorApi';

interface Props {
  onSubmit: (form: CreateDoctorForm) => Promise<void>;
  onClose: () => void;
  submitting: boolean;
}

const EMPTY: CreateDoctorForm = {
  fullName: '', email: '', phoneNumber: '', title: 0, departmentId: 0, password: '',
};

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

export default function CreateDoctorModal({ onSubmit, onClose, submitting }: Props) {
  const [form, setForm] = useState<CreateDoctorForm>(EMPTY);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);

  useEffect(() => { fetchDepartments().then(setDepartments); fetchOfficeRooms().then(setRooms); }, []);

  const sf = (field: keyof CreateDoctorForm, value: unknown) => setForm(p => ({ ...p, [field]: value }));
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(form); };
  const isValid = !!(form.fullName && form.email && form.departmentId && form.password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Add Doctor</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600">
            <i className="ri-close-line" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input type="text" required value={form.fullName} onChange={e => sf('fullName', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" required value={form.email} onChange={e => sf('email', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Phone Number</label>
              <input type="text" value={form.phoneNumber ?? ''} onChange={e => sf('phoneNumber', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Title *</label>
              <select value={form.title} onChange={e => sf('title', Number(e.target.value))} className={inputCls}>
                <option value={0}>Professor</option>
                <option value={1}>Associate Professor</option>
                <option value={2}>Assistant Professor</option>
                <option value={3}>Lecturer</option>
                <option value={4}>Teaching Assistant</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Department *</label>
              <select required value={form.departmentId || ''} onChange={e => sf('departmentId', Number(e.target.value))} className={inputCls}>
                <option value="">— Select —</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Office Room</label>
              <select value={form.officeRoomId ?? ''} onChange={e => sf('officeRoomId', e.target.value ? Number(e.target.value) : undefined)} className={inputCls}>
                <option value="">— Select —</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Password *</label>
            <input type="password" required value={form.password} onChange={e => sf('password', e.target.value)} className={inputCls} placeholder="Temporary password" />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting || !isValid}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
              {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Creating...</span> : 'Create Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
