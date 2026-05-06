import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDoctorDashboard } from '@/lib/doctorPortalApi';
import type { DoctorDashboardData } from '@/types/doctor';
import { SCHEDULE_TYPE_LABELS } from '@/lib/enums';
import { SkeletonStat } from '@/components/base/Skeleton';
import { EmptyState } from '@/components/base/EmptyState';

const TYPE_BADGE: Record<number, string> = {
  0: 'bg-emerald-50 text-emerald-600',
  1: 'bg-blue-50 text-blue-600',
  2: 'bg-amber-50 text-amber-600',
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DoctorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorDashboard()
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-[fadeUp_0.3s_ease-out]">
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Doctor Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your teaching activities</p>
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
            { label: 'Courses', value: data?.coursesThisSemester ?? 0, icon: 'ri-book-line', color: 'text-violet-600 bg-violet-50', route: '/doctor/courses' },
            { label: 'Students', value: data?.totalStudents ?? 0, icon: 'ri-user-line', color: 'text-emerald-600 bg-emerald-50', route: undefined },
            { label: 'Pending', value: data?.pendingQuizzes ?? 0, icon: 'ri-draft-line', color: 'text-amber-600 bg-amber-50', route: undefined },
            { label: 'Events Today', value: data?.eventsSentToday ?? 0, icon: 'ri-send-plane-line', color: 'text-slate-700 bg-slate-100', route: '/doctor/announcements' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Today's Schedule</h2>
            <button
              type="button"
              onClick={() => navigate('/doctor/schedule')}
              className="text-xs text-violet-600 hover:underline"
            >
              View all
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-12 h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (data?.todaySchedule && data.todaySchedule.length > 0) ? (
            <div className="space-y-3">
              {data.todaySchedule.map((slot) => (
                <div
                  key={slot.courseScheduleId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 text-center shrink-0">
                    <p className="text-xs font-medium text-slate-600">{slot.startTime.slice(0, 5)}</p>
                    <p className="text-[10px] text-slate-400">{slot.endTime.slice(0, 5)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{slot.courseName}</p>
                    <p className="text-[10px] text-slate-400">{slot.courseCode} · {slot.roomName}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${TYPE_BADGE[slot.type] ?? 'bg-gray-50 text-gray-500'}`}>
                    {SCHEDULE_TYPE_LABELS[slot.type as 0 | 1 | 2]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="ri-calendar-line" title="No classes today" description="No scheduled teaching sessions for today." />
          )}
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Recent Announcements</h2>
            <button
              type="button"
              onClick={() => navigate('/doctor/announcements')}
              className="text-xs text-violet-600 hover:underline"
            >
              View all
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse shrink-0" />
                  <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (data?.recentAnnouncements && data.recentAnnouncements.length > 0) ? (
            <div className="space-y-3">
              {data.recentAnnouncements.map((a) => (
                <div
                  key={a.notificationId}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                    <i className="ri-megaphone-line text-violet-500 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{a.title}</p>
                    <p className="text-[10px] text-slate-400">
                      {a.recipientsCount} recipients · {new Date(a.sentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="ri-megaphone-line" title="No announcements" description="No recent announcements sent to your students." />
          )}
        </div>
      </div>
    </div>
  );
}