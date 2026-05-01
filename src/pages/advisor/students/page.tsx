import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { AdvisorStudent } from '@/types/advisor';

import { STUDENT_STATUS_FILTER_LABELS, YEAR_LEVEL_LABELS } from '@/lib/enums';

export default function AdvisorStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<AdvisorStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    api.get<ApiResponse<AdvisorStudent[]>>('/api/advisor/students')
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && Array.isArray(res.data.data)) {
          setStudents(res.data.data);
        } else {
          setStudents([]);
        }
      })
      .catch(() => {
        setStudents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const studentList = Array.isArray(students) ? students : [];
    let result = studentList;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      const statusMap: Record<string, string> = { normal: '0', atrisk: '1', deanlist: '2' };
      const targetStatus = parseInt(statusMap[statusFilter], 10);
      result = result.filter((s) => s.status === targetStatus);
    }
    return result;
  }, [students, search, statusFilter]);

  const statusBadge = useCallback((status: number) => {
    const map: Record<number, string> = {
      0: 'bg-slate-50 text-slate-600',
      1: 'bg-red-50 text-red-600',
      2: 'bg-emerald-50 text-emerald-600',
    };
    return map[status] || 'bg-gray-50 text-gray-600';
  }, []);

  const handleViewStudent = useCallback(
    (studentId: string) => {
      navigate(`/advisor/students/${studentId}`);
    },
    [navigate]
  );

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">My Students</h1>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading students...
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
          />
        </div>
        <div className="flex gap-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'normal', label: 'Normal' },
            { key: 'atrisk', label: 'At Risk' },
            { key: 'deanlist', label: "Dean's List" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === f.key
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Year</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">GPA</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Credits</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Attendance</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr
                  key={s.studentId}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => handleViewStudent(s.studentId)}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-600">
                        {s.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{s.studentName}</p>
                        <p className="text-[10px] text-slate-400">{s.studentCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{YEAR_LEVEL_LABELS[s.yearLevel as 0 | 1 | 2 | 3]}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-sm font-bold ${s.gpa >= 3.5 ? 'text-emerald-600' : s.gpa >= 2.5 ? 'text-slate-700' : 'text-red-600'}`}>
                      {s.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{s.totalCreditHours}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-medium ${s.attendancePercentage >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {s.attendancePercentage}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge(s.status)}`}>
                      {STUDENT_STATUS_FILTER_LABELS[s.status as 0 | 1 | 2]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs text-amber-600 font-medium hover:underline">View</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-user-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No students found matching your filters.</p>
        </div>
      )}
    </div>
  );
}