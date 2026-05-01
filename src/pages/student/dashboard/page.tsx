import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import type { ApiResponse } from '../../../lib/api';
import { SkeletonStat } from '../../../components/base/Skeleton';
import { EmptyState } from '../../../components/base/EmptyState';

interface StudentDashboardData {
  studentName: string;
  academicYear: string;
  yearLevel: number;
  currentSemester: string;
  registeredCoursesCount: number;
  totalCreditHours: number;
  registeredHours: number;
  cumulativeGPA: number;
  upcomingExamsCount: number;
  unreadNotificationsCount: number;
  todaySchedule: Array<{
    courseCode: string;
    courseName: string;
    startTime: string;
    endTime: string;
    roomName: string;
    scheduleType: number;
  }>;
  recentNotifications: Array<{
    notificationId: number;
    title: string;
    message: string;
    type: number;
    sentDate: string;
    isRead: boolean;
  }>;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiResponse<StudentDashboardData>>('/api/student/dashboard')
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData) {
          setData(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-[fadeUp_0.3s_ease-out]">
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">
          Welcome back, {data?.studentName || 'Student'}
        </h1>
        <p className="text-sm text-slate-500">
          {data?.currentSemester || '2025-2026 First Semester'} · Year {((data?.yearLevel ?? 0) + 1)}
        </p>
      </div>

      {/* Stats */}
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
            { label: 'Registered Courses', value: data?.registeredCoursesCount ?? 0, icon: 'ri-book-line', color: 'text-emerald-600 bg-emerald-50', route: '/student/courses' },
            { label: 'Credit Hours', value: data?.registeredHours ?? 0, icon: 'ri-time-line', color: 'text-violet-600 bg-violet-50' },
            { label: 'GPA', value: data?.cumulativeGPA ?? 0, icon: 'ri-bar-chart-line', color: 'text-slate-700 bg-slate-100', isDecimal: true },
            { label: 'Unread Notifications', value: data?.unreadNotificationsCount ?? 0, icon: 'ri-notification-line', color: 'text-amber-600 bg-amber-50', route: '/student/notifications' },
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
              <p className="text-xl font-bold text-slate-800">
                {s.isDecimal ? (s.value as number).toFixed(2) : s.value}
              </p>
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
              onClick={() => navigate('/student/schedule')}
              className="text-xs text-emerald-600 hover:underline"
            >
              View all
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-12 h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (data?.todaySchedule && data.todaySchedule.length > 0) ? (
            <div className="space-y-3">
              {data.todaySchedule.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-12 text-center shrink-0">
                    <p className="text-xs font-medium text-slate-600">{slot.startTime.slice(0, 5)}</p>
                    <p className="text-[10px] text-slate-400">{slot.endTime.slice(0, 5)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{slot.courseName}</p>
                    <p className="text-[10px] text-slate-400">{slot.courseCode} · {slot.roomName}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="ri-calendar-line"
              title="No classes today"
              description="You're all set — no scheduled classes for today."
            />
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Recent Notifications</h2>
            <button
              type="button"
              onClick={() => navigate('/student/notifications')}
              className="text-xs text-emerald-600 hover:underline"
            >
              View all
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse mt-1.5" />
                  <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (data?.recentNotifications && data.recentNotifications.length > 0) ? (
            <div className="space-y-3">
              {data.recentNotifications.slice(0, 5).map((n) => (
                <button
                  key={n.notificationId}
                  type="button"
                  onClick={() => navigate('/student/notifications')}
                  className={`flex items-start gap-3 p-3 rounded-lg w-full text-left transition-colors ${n.isRead ? 'bg-gray-50 hover:bg-gray-100' : 'bg-emerald-50/50 hover:bg-emerald-50'}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? 'bg-gray-300' : 'bg-emerald-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{n.title}</p>
                    <p className="text-xs text-slate-500 truncate">{n.message}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="ri-notification-line"
              title="No notifications"
              description="You're all caught up — no new notifications."
            />
          )}
        </div>
      </div>
    </div>
  );
}