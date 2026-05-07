import React, { useState, useEffect } from 'react';
import type { UpdateStudentForm, StudentDetail, DepartmentOption, AdvisorOption } from '@/types/admin';
import { YEAR_LEVEL_LABELS, GENDER_LABELS, YearLevel, Gender } from '@/lib/enums';
import { fetchDepartments, fetchAdvisors } from '@/lib/studentApi';

interface Props {
  student: StudentDetail;
  onSubmit: (form: Partial<UpdateStudentForm>) => Promise<void>;
  onClose: () => void;
  submitting: boolean;
}

export default function EditStudentModal({ student, onSubmit, onClose, submitting }: Props) {
  const nameParts = student.fullName.split(' ');
  const [form, setForm] = useState<UpdateStudentForm>({
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: student.email || '',
    phoneNumber: student.phoneNumber || '',
    nationalId: student.nationalId || '',
    yearLevel: student.yearLevel,
    departmentId: student.departmentId,
    nationality: student.nationality || '',
    gender: student.gender,
    religion: student.religion || '',
    dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
    address: student.address || '',
    city: student.city || '',
    fatherPhone: student.fatherPhone || '',
    fatherJob: student.fatherJob || '',
    previousQualification: student.previousQualification || '',
  });

  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [advisors, setAdvisors] = useState<AdvisorOption[]>([]);

  useEffect(() => {
    fetchDepartments().then(setDepartments);
    fetchAdvisors().then(setAdvisors);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const set = (key: keyof UpdateStudentForm, val: string | number | undefined) => setForm(p => ({ ...p, [key]: val }));
  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
  const selectCls = inputCls;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-sm font-semibold text-slate-800">Edit Student — {student.fullName}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Personal Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Personal</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">First Name</label><input type="text" value={form.firstName ?? ''} onChange={e => set('firstName', e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Last Name</label><input type="text" value={form.lastName ?? ''} onChange={e => set('lastName', e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Email</label><input type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Phone</label><input type="text" value={form.phoneNumber ?? ''} onChange={e => set('phoneNumber', e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">National ID</label><input type="text" value={form.nationalId ?? ''} onChange={e => set('nationalId', e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label><input type="date" value={form.dateOfBirth ?? ''} onChange={e => set('dateOfBirth', e.target.value)} className={inputCls} /></div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                <select value={form.gender ?? ''} onChange={e => set('gender', e.target.value !== '' ? Number(e.target.value) : undefined)} className={selectCls}>
                  <option value="">Select...</option>
                  {Object.entries(GENDER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Nationality</label><input type="text" value={form.nationality ?? ''} onChange={e => set('nationality', e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Religion</label><input type="text" value={form.religion ?? ''} onChange={e => set('religion', e.target.value)} className={inputCls} /></div>
            </div>
          </div>

          {/* Academic */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Academic</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Year Level</label>
                <select value={form.yearLevel ?? ''} onChange={e => set('yearLevel', e.target.value !== '' ? Number(e.target.value) : undefined)} className={selectCls}>
                  <option value="">Select...</option>
                  {Object.entries(YEAR_LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                <select value={form.departmentId ?? ''} onChange={e => set('departmentId', e.target.value ? Number(e.target.value) : undefined)} className={selectCls}>
                  <option value="">Select...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Academic Advisor</label>
                <select value={form.academicAdvisorId ?? ''} onChange={e => set('academicAdvisorId', e.target.value ? Number(e.target.value) : undefined)} className={selectCls}>
                  <option value="">Select...</option>
                  {advisors.map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Previous Qualification</label><input type="text" value={form.previousQualification ?? ''} onChange={e => set('previousQualification', e.target.value)} className={inputCls} /></div>
            </div>
          </div>

          {/* Address & Family */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Address & Family</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Address</label><input type="text" value={form.address ?? ''} onChange={e => set('address', e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">City</label><input type="text" value={form.city ?? ''} onChange={e => set('city', e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Father Phone</label><input type="text" value={form.fatherPhone ?? ''} onChange={e => set('fatherPhone', e.target.value)} className={inputCls} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Father Job</label><input type="text" value={form.fatherJob ?? ''} onChange={e => set('fatherJob', e.target.value)} className={inputCls} /></div>
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
