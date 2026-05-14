import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAdvisorDashboard } from '@/lib/advisorPortalApi';
import type { AdvisorDashboardData } from '@/types/advisor';
import { SkeletonStat } from '@/components/base/Skeleton';
import { EmptyState } from '@/components/base/EmptyState';

const ISSUE_TYPE_MAP: Record<number, { label: string; color: string; icon: string }> = {
  0: { label: 'Low GPA', color: 'bg-red-50 text-red-600', icon: 'ri-bar-chart-line' },
  1: { label: 'High Absence', color: 'bg-orange-50 text-orange-600', icon: 'ri-user-unfollow-line' },
  2: { label: 'Unpaid Fees', color: 'bg-amber-50 text-amber-600', icon: 'ri-money-dollar-circle-line' },
};

export default function AdvisorDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdvisorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvisorDashboard()
      .then((res) => {
        setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-[fadeUp_0.3s_ease-out]">
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Advisor Dashboard</h1>
        <p className="text-sm text-slate-500">Monitor your assigned students</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          [
            { label: 'Students', value: data?.totalStudents ?? 0, icon: 'ri-user-line', color: 'text-amber-600 bg-amber-50', route: '/advisor/students' },
            { label: 'Active Warnings', value: data?.activeWarnings ?? 0, icon: 'ri-alert-line', color: 'text-red-600 bg-red-50', route: '/advisor/warnings' },
            { label: 'Unpaid Fees', value: data?.unpaidFees ?? 0, icon: 'ri-money-dollar-circle-line', color: 'text-orange-600 bg-orange-50', route: '/advisor/fees' },
            { label: 'Pending Adjustments', value: data?.pendingAdjustments ?? 0, icon: 'ri-calendar-event-line', color: 'text-violet-600 bg-violet-50', route: '/advisor/schedule-adjustments' },
          ].map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => s.route && navigate(s.route)}
              className={`bg-white rounded-xl border border-gray-100 p-4 text-left hover:border-gray-200 transition-all ${s.route ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                  <i className={`${s.icon} text-sm`} />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </button>
          ))
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Students Needing Attention</h2>
          <button
            type="button"
            onClick={() => navigate('/advisor/students')}
            className="text-xs text-amber-600 hover:underline"
          >
            View all
          </button>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : (data?.studentsNeedingAttention && data.studentsNeedingAttention.length > 0) ? (
          <div className="space-y-2">
            {data.studentsNeedingAttention.map((student) => {
              const issue = ISSUE_TYPE_MAP[student.issueType] || { label: 'Issue', color: 'bg-gray-50 text-gray-600', icon: 'ri-error-warning-line' };
              return (
                <button
                  key={`${student.studentId}-${student.issueType}`}
                  type="button"
                  onClick={() => navigate(`/advisor/students/${student.studentId}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  {student.profilePictureUrl ? (
                    <img
                      src={student.profilePictureUrl}
                      alt={student.studentName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                      {student.studentName.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{student.studentName}</p>
                    <p className="text-[10px] text-slate-400">
                      {student.studentCode} · GPA: {student.gpa.toFixed(2)}
                      {student.issueDescription ? ` · ${student.issueDescription}` : ''}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${issue.color} whitespace-nowrap`}>
                    {issue.label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState icon="ri-user-follow-line" title="All clear" description="All students are in good standing — no issues to report." />
        )}
      </div>
    </div>
  );
}