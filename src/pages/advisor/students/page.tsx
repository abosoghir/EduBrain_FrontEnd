import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyStudents } from '@/lib/advisorPortalApi';
import type { AdvisorStudentDto, GetMyStudentsResponse } from '@/types/advisor';
import {
  STUDENT_STATUS_FILTER_LABELS,
  YEAR_LEVEL_LABELS,
  PAYMENT_STATUS_LABELS,
  StudentStatusFilter,
  PaymentStatus,
} from '@/lib/enums';

export default function AdvisorStudents() {
  const navigate = useNavigate();
  const [response, setResponse] = useState<GetMyStudentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const loadStudents = useCallback(async () => {
    setLoading(true);
    const res = await fetchMyStudents({
      search: search.trim() || undefined,
      status: statusFilter,
      page,
      pageSize,
    });
    setResponse(res.data);
    setLoading(false);
  }, [search, statusFilter, page]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const students = response?.students?.items ?? [];
  const pagination = response?.students;

  const statusBadge = (status: number) => {
    const map: Record<number, string> = {
      [StudentStatusFilter.GoodStanding]: 'bg-slate-50 text-slate-600',
      [StudentStatusFilter.DeanList]: 'bg-emerald-50 text-emerald-600',
      [StudentStatusFilter.AcademicWarning]: 'bg-amber-50 text-amber-600',
      [StudentStatusFilter.Probation]: 'bg-red-50 text-red-600',
    };
    return map[status] || 'bg-gray-50 text-gray-600';
  };

  const feesBadge = (status: PaymentStatus) => {
    const map: Record<number, string> = {
      [PaymentStatus.Paid]: 'bg-emerald-50 text-emerald-600',
      [PaymentStatus.PartiallyPaid]: 'bg-amber-50 text-amber-600',
      [PaymentStatus.Unpaid]: 'bg-red-50 text-red-600',
    };
    return map[status] || 'bg-gray-50 text-gray-600';
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-2">My Students</h1>

      {/* Summary Stats */}
      {response && !loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
            <p className="text-lg font-bold text-slate-800">{response.totalStudents}</p>
            <p className="text-[10px] text-slate-500">Total Students</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
            <p className="text-lg font-bold text-emerald-600">{response.deanListCount}</p>
            <p className="text-[10px] text-slate-500">Dean's List</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
            <p className="text-lg font-bold text-red-600">{response.atRiskCount}</p>
            <p className="text-[10px] text-slate-500">At Risk</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
            <p className="text-lg font-bold text-amber-600">{response.averageGPA.toFixed(2)}</p>
            <p className="text-[10px] text-slate-500">Average GPA</p>
          </div>
        </div>
      )}

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
            placeholder="Search by name or code..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {[
            { key: undefined, label: 'All' },
            { key: StudentStatusFilter.GoodStanding, label: 'Good Standing' },
            { key: StudentStatusFilter.DeanList, label: "Dean's List" },
            { key: StudentStatusFilter.AcademicWarning, label: 'Warning' },
            { key: StudentStatusFilter.Probation, label: 'Probation' },
          ].map((f) => (
            <button
              key={f.key ?? 'all'}
              type="button"
              onClick={() => { setStatusFilter(f.key); setPage(1); }}
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
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Attendance</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Fees</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Warnings</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s: AdvisorStudentDto) => (
                <tr
                  key={s.studentId}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/advisor/students/${s.studentId}`)}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {s.profilePictureUrl ? (
                        <img src={s.profilePictureUrl} alt={s.studentName} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-600">
                          {s.studentName.charAt(0)}
                        </div>
                      )}
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
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-medium ${(s.attendancePercentage ?? 0) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {s.attendancePercentage != null ? `${s.attendancePercentage}%` : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${feesBadge(s.feesStatus)}`}>
                      {PAYMENT_STATUS_LABELS[s.feesStatus as PaymentStatus]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {s.warningsCount > 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600">
                        {s.warningsCount}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge(s.academicStatus)}`}>
                      {STUDENT_STATUS_FILTER_LABELS[s.academicStatus as StudentStatusFilter] || 'Unknown'}
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-500">
            Page {pagination.pageNumber} of {pagination.totalPages}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-100 text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-100 text-slate-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {!loading && students.length === 0 && (
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