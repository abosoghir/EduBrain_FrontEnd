import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '../../../lib/api';
import type { ApiResponse } from '../../../lib/api';
import type { StudentAttendanceSummary, StudentAttendanceRecord } from '../../../types/student';

import { ATTENDANCE_STATUS_LABELS } from '../../../lib/enums';

export default function StudentAttendance() {
  const [summary, setSummary] = useState<StudentAttendanceSummary[]>([]);
  const [records, setRecords] = useState<StudentAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<StudentAttendanceSummary[]>>('/api/student/attendance/summary'),
      api.get<ApiResponse<StudentAttendanceRecord[]>>('/api/student/attendance/records'),
    ])
      .then(([sumRes, recRes]) => {
        if (sumRes.data.isSuccess && sumRes.data.hasData && sumRes.data.data) {
          setSummary(sumRes.data.data);
        } else {
          setSummary([]);
        }
        if (recRes.data.isSuccess && recRes.data.hasData && recRes.data.data) {
          setRecords(recRes.data.data);
        } else {
          setRecords([]);
        }
      })
      .catch(() => {
        setSummary([]);
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredRecords = useMemo(() => {
    if (selectedCourse === 'all') return records;
    return records.filter((r) => r.courseCode === selectedCourse);
  }, [records, selectedCourse]);

  const statusBadge = useCallback((status: number) => {
    const map: Record<number, string> = {
      0: 'bg-emerald-50 text-emerald-600',
      1: 'bg-red-50 text-red-600',
      2: 'bg-amber-50 text-amber-600',
    };
    return map[status] || 'bg-gray-50 text-gray-600';
  }, []);

  const statusIcon = useCallback((status: number) => {
    const map: Record<number, string> = {
      0: 'ri-check-line',
      1: 'ri-close-line',
      2: 'ri-time-line',
    };
    return map[status] || 'ri-question-line';
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">My Attendance</h1>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading attendance...
        </div>
      )}

      {/* Course summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {summary.map((s) => (
          <div
            key={s.courseCode}
            onClick={() => setSelectedCourse(s.courseCode)}
            className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${
              selectedCourse === s.courseCode ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{s.courseName}</h3>
                <p className="text-[10px] text-slate-400">{s.courseCode}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                s.percentage >= 90 ? 'bg-emerald-50 text-emerald-600' : s.percentage >= 75 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
              }`}>
                {s.percentage}%
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-600">
                <i className="ri-check-line" /> {s.presentCount}
              </span>
              <span className="flex items-center gap-1 text-red-500">
                <i className="ri-close-line" /> {s.absentCount}
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <i className="ri-time-line" /> {s.lateCount}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">{s.totalCount} total</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSelectedCourse('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedCourse === 'all' ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
          }`}
        >
          All Records
        </button>
        {summary.map((s) => (
          <button
            key={s.courseCode}
            type="button"
            onClick={() => setSelectedCourse(s.courseCode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCourse === s.courseCode ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
            }`}
          >
            {s.courseCode}
          </button>
        ))}
      </div>

      {/* Records list */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Attendance Records</h2>
          <span className="text-xs text-slate-400">{filteredRecords.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.map((r) => (
                <tr key={r.attendanceId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-xs text-slate-600">
                    {new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-700">{r.courseName}</p>
                    <p className="text-[10px] text-slate-400">{r.courseCode}</p>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-[10px] text-slate-400">Lecture</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge(r.status)}`}>
                      <i className={statusIcon(r.status)} />
                      {ATTENDANCE_STATUS_LABELS[r.status as 0 | 1 | 2]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filteredRecords.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-400">No attendance records found.</p>
        </div>
      )}
    </div>
  );
}