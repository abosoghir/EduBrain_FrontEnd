import React from 'react';
import type { RegistrationStatusData } from '@/types/student';

interface Props {
  status: RegistrationStatusData;
  selectedCredits: number;
}

export default function CreditHoursSummary({ status, selectedCredits }: Props) {
  const totalProjected = status.registeredHours + selectedCredits;
  const pctRegistered = status.maxCreditHours > 0 ? (status.registeredHours / status.maxCreditHours) * 100 : 0;
  const pctSelected = status.maxCreditHours > 0 ? (selectedCredits / status.maxCreditHours) * 100 : 0;
  const isOverMax = totalProjected > status.maxCreditHours;
  const isBelowMin = totalProjected < status.minCreditHours && totalProjected > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Credit Hours</h3>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500">
            {totalProjected} / {status.maxCreditHours} hours
          </span>
          {isOverMax && <span className="text-rose-600 font-bold">Over Limit!</span>}
          {isBelowMin && <span className="text-amber-600 font-bold">Below Minimum</span>}
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
          <div
            className="bg-blue-500 h-3 transition-all duration-300"
            style={{ width: `${Math.min(pctRegistered, 100)}%` }}
          />
          <div
            className={`h-3 transition-all duration-300 ${isOverMax ? 'bg-rose-400' : 'bg-emerald-400'}`}
            style={{ width: `${Math.min(pctSelected, 100 - pctRegistered)}%` }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 mb-4">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" /> Enrolled: {status.registeredHours}
        </div>
        {selectedCredits > 0 && (
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isOverMax ? 'bg-rose-400' : 'bg-emerald-400'}`} /> Selected: {selectedCredits}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <p className="text-slate-400 font-medium">Min Required</p>
          <p className="text-base font-bold text-slate-700">{status.minCreditHours}</p>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <p className="text-slate-400 font-medium">Remaining</p>
          <p className="text-base font-bold text-slate-700">{Math.max(0, status.maxCreditHours - totalProjected)}</p>
        </div>
      </div>
    </div>
  );
}
