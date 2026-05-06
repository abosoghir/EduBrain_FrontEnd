import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStudentAttendance } from '@/lib/studentPortalApi';
import type { StudentAttendanceData, CourseAttendanceOverview } from '@/types/student';

export default function StudentAttendance() {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentAttendanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentAttendance()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (badge: number) => {
    if (badge === 0) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (badge === 1) return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-red-50 text-red-600 border-red-100';
  };

  const statusLabel = (badge: number) => {
    if (badge === 0) return 'Normal';
    if (badge === 1) return 'Warning';
    return 'Danger';
  };

  const statusIcon = (badge: number) => {
    if (badge === 0) return 'ri-check-line';
    if (badge === 1) return 'ri-alert-line';
    return 'ri-close-circle-line';
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">My Attendance</h1>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading attendance...
        </div>
      )}

      {/* Overall Stats */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Overall Rate', value: `${data.overallAttendanceRate.toFixed(1)}%`, icon: 'ri-bar-chart-line', color: data.overallAttendanceRate >= 85 ? 'text-emerald-600 bg-emerald-50' : data.overallAttendanceRate >= 75 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50' },
            { label: 'Total Present', value: data.totalPresent, icon: 'ri-check-line', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Total Absent', value: data.totalAbsent, icon: 'ri-close-line', color: 'text-red-600 bg-red-50' },
            { label: 'Total Late', value: data.totalLate, icon: 'ri-time-line', color: 'text-amber-600 bg-amber-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                <i className={`${s.icon} text-sm`} />
              </div>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Course Attendance Table */}
      {data && data.courseAttendances.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Per-Course Attendance</h2>
            <span className="text-xs text-slate-400">{data.courseAttendances.length} courses</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Attended</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.courseAttendances.map((c: CourseAttendanceOverview) => (
                  <tr key={c.courseInstanceId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-700">{c.courseName}</p>
                      <p className="text-[10px] text-slate-400">{c.courseCode}</p>
                    </td>
                    <td className="px-5 py-3 text-center text-sm text-slate-600">{c.attendedSessions}</td>
                    <td className="px-5 py-3 text-center text-sm text-slate-400">{c.totalSessions}</td>
                    <td className="px-5 py-3 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              c.statusBadge === 0 ? 'bg-emerald-500' :
                              c.statusBadge === 1 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(c.attendancePercentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600 w-10 text-right">
                          {c.attendancePercentage.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusBadge(c.statusBadge)}`}>
                        <i className={statusIcon(c.statusBadge)} />
                        {statusLabel(c.statusBadge)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => navigate(`/student/courses/${c.courseInstanceId}?tab=attendance`)}
                        className="text-xs text-emerald-600 hover:underline"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && (!data || data.courseAttendances.length === 0) && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-calendar-check-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No attendance data available.</p>
        </div>
      )}
    </div>
  );
}