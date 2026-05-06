import React, { useState } from 'react';
import type { DepartmentDetail } from '@/types/admin';

type Tab = 'overview' | 'students' | 'doctors' | 'courses';

interface Props { department: DepartmentDetail; onClose: () => void; onRemoveCourse?: (courseId: number) => void; }

export default function DepartmentDetailPanel({ department: d, onClose, onRemoveCourse }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const tabs: { key: Tab; label: string; icon: string; count: number }[] = [
    { key: 'overview', label: 'Overview', icon: 'ri-building-line', count: 0 },
    { key: 'students', label: 'Students', icon: 'ri-user-line', count: d.studentsCount },
    { key: 'doctors', label: 'Doctors', icon: 'ri-stethoscope-line', count: d.doctorsCount },
    { key: 'courses', label: 'Courses', icon: 'ri-book-line', count: d.coursesCount },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">{d.code}</span>
              <h2 className="text-sm font-semibold text-slate-800">{d.description}</h2>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{d.departmentType} · Head: {d.headDoctorName || 'None assigned'}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-gray-100"><i className="ri-close-line text-lg" /></button>
        </div>

        <div className="flex border-b border-gray-100 px-6 gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <i className={`${t.icon} text-sm`} />{t.label}{t.count > 0 && <span className="ml-1 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full">{t.count}</span>}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {([['Students', d.studentsCount, 'ri-user-line', 'bg-blue-50 text-blue-600'], ['Doctors', d.doctorsCount, 'ri-stethoscope-line', 'bg-violet-50 text-violet-600'], ['Courses', d.coursesCount, 'ri-book-line', 'bg-emerald-50 text-emerald-600']] as [string, number, string, string][]).map(([label, count, icon, cls]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className={`w-8 h-8 rounded-lg ${cls} flex items-center justify-center mx-auto mb-2`}><i className={`${icon} text-sm`} /></div>
                    <p className="text-lg font-bold text-slate-700">{count}</p>
                    <p className="text-[10px] text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-xs">
                <div className="grid grid-cols-2 gap-y-2">
                  <div><span className="text-slate-400">Code:</span> <span className="font-medium text-slate-700">{d.code}</span></div>
                  <div><span className="text-slate-400">Type:</span> <span className="font-medium text-slate-700">{d.departmentType}</span></div>
                  <div className="col-span-2"><span className="text-slate-400">Head:</span> <span className="font-medium text-slate-700">{d.headDoctorName || 'None assigned'}</span></div>
                </div>
              </div>
            </div>
          )}

          {tab === 'students' && (
            <div>{d.students.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No students in this department.</p> : (
              <div className="space-y-2">{d.students.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div><p className="text-sm font-medium text-slate-700">{s.name}</p><p className="text-[10px] text-slate-400">{s.email}</p></div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{s.yearLevel}</span>
                </div>
              ))}</div>
            )}</div>
          )}

          {tab === 'doctors' && (
            <div>{d.doctors.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No doctors in this department.</p> : (
              <div className="space-y-2">{d.doctors.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div><p className="text-sm font-medium text-slate-700">{doc.name}</p><p className="text-[10px] text-slate-400">{doc.email}</p></div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-medium">{doc.title}</span>
                </div>
              ))}</div>
            )}</div>
          )}

          {tab === 'courses' && (
            <div>{d.courses.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No courses in this department.</p> : (
              <div className="space-y-2">{d.courses.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div><p className="text-sm font-medium text-slate-700">{c.name}</p><p className="text-[10px] text-slate-400">{c.code} · {c.creditHours} credits</p></div>
                  {onRemoveCourse && <button type="button" onClick={() => onRemoveCourse(c.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-red-400 hover:text-red-600" title="Remove"><i className="ri-close-line text-xs" /></button>}
                </div>
              ))}</div>
            )}</div>
          )}
        </div>
      </div>
    </div>
  );
}
