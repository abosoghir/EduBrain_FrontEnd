import React, { useState, useEffect } from 'react';
import type { CreateStudentForm, DepartmentOption, AdvisorOption } from '@/types/admin';
import { fetchDepartments, fetchAdvisors } from '@/lib/studentApi';

interface Props {
  onSubmit: (form: CreateStudentForm) => Promise<void>;
  onClose: () => void;
  submitting: boolean;
}

const EMPTY: CreateStudentForm = {
  fullName: '', email: '', phoneNumber: '', nationalId: '',
  gender: 0, dateOfBirth: '', nationality: '', religion: '',
  address: '', city: '', fatherPhone: '', fatherJob: '',
  previousQualification: '', yearLevel: 0, password: '',
  departmentId: undefined, advisorId: undefined,
};

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

export default function CreateStudentModal({ onSubmit, onClose, submitting }: Props) {
  const [form, setForm] = useState<CreateStudentForm>(EMPTY);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [advisors, setAdvisors] = useState<AdvisorOption[]>([]);

  useEffect(() => {
    fetchDepartments().then(setDepartments);
    fetchAdvisors().then(setAdvisors);
  }, []);

  const sf = (field: keyof CreateStudentForm, value: unknown) =>
    setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(form); };

  const isValid = !!(form.fullName && form.email && form.nationalId &&
    form.gender !== undefined && form.dateOfBirth && form.nationality &&
    form.religion && form.address && form.city && form.fatherPhone && form.password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Add Student</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600">
            <i className="ri-close-line" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Basic Info */}
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Basic Information</p>
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
              <label className={labelCls}>National ID *</label>
              <input type="text" required value={form.nationalId} onChange={e => sf('nationalId', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Gender *</label>
              <select required value={form.gender} onChange={e => sf('gender', Number(e.target.value))} className={inputCls}>
                <option value={0}>Male</option>
                <option value={1}>Female</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Date of Birth *</label>
              <input type="date" required value={form.dateOfBirth} onChange={e => sf('dateOfBirth', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Year Level *</label>
              <select required value={form.yearLevel} onChange={e => sf('yearLevel', Number(e.target.value))} className={inputCls}>
                <option value={0}>Freshman</option>
                <option value={1}>Sophomore</option>
                <option value={2}>Junior</option>
                <option value={3}>Senior</option>
              </select>
            </div>
          </div>

          {/* Personal Info */}
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pt-1">Personal Details</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nationality *</label>
              <input type="text" required value={form.nationality} onChange={e => sf('nationality', e.target.value)} className={inputCls} placeholder="e.g. Egyptian" />
            </div>
            <div>
              <label className={labelCls}>Religion *</label>
              <input type="text" required value={form.religion} onChange={e => sf('religion', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Address *</label>
              <input type="text" required value={form.address} onChange={e => sf('address', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>City *</label>
              <input type="text" required value={form.city} onChange={e => sf('city', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Father's Phone *</label>
              <input type="text" required value={form.fatherPhone} onChange={e => sf('fatherPhone', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Father's Job</label>
              <input type="text" value={form.fatherJob ?? ''} onChange={e => sf('fatherJob', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Previous Qualification</label>
            <input type="text" value={form.previousQualification ?? ''} onChange={e => sf('previousQualification', e.target.value)} className={inputCls} />
          </div>

          {/* Academic */}
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pt-1">Academic Assignment</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Department</label>
              <select value={form.departmentId ?? ''} onChange={e => sf('departmentId', e.target.value ? Number(e.target.value) : undefined)} className={inputCls}>
                <option value="">— Select —</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Advisor</label>
              <select value={form.advisorId ?? ''} onChange={e => sf('advisorId', e.target.value ? Number(e.target.value) : undefined)} className={inputCls}>
                <option value="">— Select —</option>
                {advisors.map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
              </select>
            </div>
          </div>

          {/* Password */}
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pt-1">Account</p>
          <div>
            <label className={labelCls}>Password *</label>
            <input type="password" required value={form.password} onChange={e => sf('password', e.target.value)} className={inputCls} placeholder="Temporary password" />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting || !isValid}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
              {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Creating...</span> : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
