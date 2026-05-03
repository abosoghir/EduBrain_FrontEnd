import React, { useState } from 'react';
import type { CourseDetail } from '@/types/admin';
import { COURSE_TYPE_LABELS } from '@/lib/enums';

type Tab = 'overview' | 'prerequisites' | 'departments' | 'instances';

interface Props {
  course: CourseDetail;
  onClose: () => void;
  onRemovePrerequisite?: (prereqId: number) => void;
  onDeleteInstance?: (instanceId: number) => void;
}

export default function CourseDetailPanel({ course: c, onClose, onRemovePrerequisite, onDeleteInstance }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const tabs: { key: Tab; label: string; icon: string; count: number }[] = [
    { key: 'overview', label: 'Overview', icon: 'ri-book-line', count: 0 },
    { key: 'prerequisites', label: 'Prerequisites', icon: 'ri-links-line', count: c.prerequisites.length },
    { key: 'departments', label: 'Departments', icon: 'ri-building-line', count: c.departments.length },
    { key: 'instances', label: 'Instances', icon: 'ri-calendar-line', count: c.instances.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">{c.code} — {c.name}</h2>
            <p className="text-[10px] text-slate-400">{COURSE_TYPE_LABELS[c.courseType as 0 | 1]} · {c.creditHours} credits</p>
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
            <div className="space-y-5">
              {c.description && <p className="text-xs text-slate-600 bg-gray-50 rounded-xl p-3">{c.description}</p>}
              <div className="grid grid-cols-3 gap-3">
                {([
                  ['Credit Hours', c.creditHours, 'ri-book-line', 'bg-blue-50 text-blue-600'],
                  ['Theory', c.theoryHours, 'ri-presentation-line', 'bg-violet-50 text-violet-600'],
                  ['Practical', c.practicalHours, 'ri-flask-line', 'bg-emerald-50 text-emerald-600'],
                ] as [string, number, string, string][]).map(([label, val, icon, cls]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className={`w-7 h-7 rounded-lg ${cls} flex items-center justify-center mx-auto mb-1.5`}><i className={`${icon} text-xs`} /></div>
                    <p className="text-lg font-bold text-slate-700">{val}</p>
                    <p className="text-[10px] text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-xs bg-gray-50 rounded-xl p-3">
                <div><span className="text-slate-400">Type:</span> <span className="font-medium text-slate-700">{COURSE_TYPE_LABELS[c.courseType as 0 | 1]}</span></div>
                <div><span className="text-slate-400">Passing Grade:</span> <span className="font-medium text-slate-700">{c.passingGrade}%</span></div>
                <div><span className="text-slate-400">Price:</span> <span className="font-medium text-slate-700">{c.price ? `${c.price.toFixed(2)} EGP` : '—'}</span></div>
                <div><span className="text-slate-400">Per Credit Hour:</span> <span className="font-medium text-slate-700">{c.pricePerCreditHour ? `${c.pricePerCreditHour.toFixed(2)} EGP` : '—'}</span></div>
              </div>
            </div>
          )}

          {tab === 'prerequisites' && (
            <div>{c.prerequisites.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No prerequisites.</p> : (
              <div className="space-y-2">{c.prerequisites.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div><p className="text-sm font-medium text-slate-700">{p.courseName}</p><p className="text-[10px] text-slate-400">{p.courseCode}</p></div>
                  {onRemovePrerequisite && <button type="button" onClick={() => onRemovePrerequisite(p.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-red-400 hover:text-red-600" title="Remove"><i className="ri-close-line text-xs" /></button>}
                </div>
              ))}</div>
            )}</div>
          )}

          {tab === 'departments' && (
            <div>{c.departments.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">Not assigned to any department.</p> : (
              <div className="space-y-2">{c.departments.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">{d.code}</span>
                    <p className="text-sm font-medium text-slate-700">{d.departmentType}</p>
                  </div>
                </div>
              ))}</div>
            )}</div>
          )}

          {tab === 'instances' && (
            <div>{c.instances.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No instances.</p> : (
              <div className="space-y-2">{c.instances.map(inst => (
                <div key={inst.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{inst.semesterName}</p>
                    <p className="text-[10px] text-slate-400">{inst.doctorName} · {inst.currentEnrolled}/{inst.maxCapacity} students</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${inst.isFull ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{inst.isFull ? 'Full' : 'Open'}</span>
                    {onDeleteInstance && <button type="button" onClick={() => onDeleteInstance(inst.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-red-400 hover:text-red-600" title="Delete"><i className="ri-delete-bin-line text-xs" /></button>}
                  </div>
                </div>
              ))}</div>
            )}</div>
          )}
        </div>
      </div>
    </div>
  );
}
