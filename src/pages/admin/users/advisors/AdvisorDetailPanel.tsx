import React from 'react';
import type { AdvisorDetail } from '@/types/admin';

interface Props { advisor: AdvisorDetail; onClose: () => void; }

export default function AdvisorDetailPanel({ advisor, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-sm font-bold text-amber-600 overflow-hidden">
              {advisor.photoUrl ? <img src={advisor.photoUrl} alt="" className="w-full h-full object-cover" /> : advisor.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">{advisor.fullName}</h2>
              <p className="text-[10px] text-slate-400">{advisor.advisorCode}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-gray-100"><i className="ri-close-line text-lg" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-[10px] text-amber-500 mb-1">Assigned Students</p>
              <p className="text-2xl font-bold text-amber-600">{advisor.assignedStudentsCount}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1"><i className="ri-contacts-line" /> Contact Information</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                <i className="ri-mail-line text-slate-400" />
                <div><span className="text-slate-400">Email</span><p className="text-slate-700 font-medium">{advisor.email}</p></div>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                <i className="ri-phone-line text-slate-400" />
                <div><span className="text-slate-400">Phone</span><p className="text-slate-700 font-medium">{advisor.phoneNumber || '—'}</p></div>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                <i className="ri-building-line text-slate-400" />
                <div><span className="text-slate-400">Office</span><p className="text-slate-700 font-medium">{advisor.officeRoom || '—'}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
