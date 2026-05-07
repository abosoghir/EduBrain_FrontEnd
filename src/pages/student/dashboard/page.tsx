import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStudentDashboard } from '@/lib/studentPortalApi';
import type { StudentDashboardData } from '@/types/student';
import { SCHEDULE_TYPE_LABELS, EXAM_TYPE_LABELS, YEAR_LEVEL_LABELS } from '@/lib/enums';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-[fadeUp_0.3s_ease-out]">
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Welcome Banner */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">
          Welcome back, {data?.studentName || 'Student'}!
        </h1>
        <p className="text-sm text-slate-500">
          {data?.academicYear || '—'} · {data?.yearLevel !== undefined ? YEAR_LEVEL_LABELS[data.yearLevel as 0 | 1 | 2 | 3] : '—'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-gray-200 mb-3" />
              <div className="h-6 w-12 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
          ))
        ) : (
          [
            { label: 'Registered Courses', value: data?.registeredCoursesCount ?? 0, icon: 'ri-book-line', color: 'text-blue-600 bg-blue-50', route: '/student/courses' },
            { label: 'Credit Hours', value: `${data?.registeredHours ?? 0} / ${data?.totalCreditHours ?? 0}`, icon: 'ri-time-line', color: 'text-teal-600 bg-teal-50' },
            { label: 'Cumulative GPA', value: (data?.cumulativeGPA ?? 0).toFixed(2), icon: 'ri-bar-chart-line', color: (data?.cumulativeGPA ?? 0) >= 2.0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50' },
            { label: 'Upcoming Exams', value: data?.upcomingExamsCount ?? 0, icon: 'ri-file-list-line', color: 'text-orange-600 bg-orange-50', route: '/student/exams' },
            { label: 'Notifications', value: data?.unreadNotificationsCount ?? 0, icon: 'ri-notification-line', color: (data?.unreadNotificationsCount ?? 0) > 0 ? 'text-red-600 bg-red-50' : 'text-slate-500 bg-slate-50', route: '/student/notifications' },
            { label: 'Registered Hours', value: data?.registeredHours ?? 0, icon: 'ri-draft-line', color: 'text-violet-600 bg-violet-50' },
          ].map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => s.route && navigate(s.route)}
              className={`bg-white rounded-xl border border-gray-100 p-4 text-left hover:border-gray-200 transition-all ${s.route ? 'cursor-pointer' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                <i className={`${s.icon} text-sm`} />
              </div>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </button>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Today's Schedule</h2>
            <button type="button" onClick={() => navigate('/student/schedule')} className="text-xs text-emerald-600 hover:underline">View all</button>
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
              {data.todaySchedule.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-12 text-center shrink-0">
                    <p className="text-xs font-medium text-slate-600">{slot.startTime.slice(0, 5)}</p>
                    <p className="text-[10px] text-slate-400">{slot.endTime.slice(0, 5)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{slot.courseName}</p>
                    <p className="text-[10px] text-slate-400">
                      {slot.courseCode} · {slot.roomName} ·{' '}
                      {SCHEDULE_TYPE_LABELS[slot.scheduleType as 0 | 1 | 2]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-sm text-slate-500">No classes today!</p>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Recent Notifications</h2>
            <button type="button" onClick={() => navigate('/student/notifications')} className="text-xs text-emerald-600 hover:underline">View all</button>
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
            <div className="text-center py-6">
              <i className="ri-notification-line text-2xl text-slate-300 block mb-2" />
              <p className="text-sm text-slate-400">No notifications yet.</p>
            </div>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Upcoming Exams</h2>
            <button type="button" onClick={() => navigate('/student/exams')} className="text-xs text-emerald-600 hover:underline">View all</button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (data?.upcomingExams && data.upcomingExams.length > 0) ? (
            <div className="space-y-3">
              {data.upcomingExams.slice(0, 3).map((exam) => (
                <button
                  key={exam.examScheduleId}
                  type="button"
                  onClick={() => navigate('/student/exams')}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-orange-50/50 w-full text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] text-orange-600 font-medium uppercase">
                      {new Date(exam.examDate).toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-sm font-bold text-orange-700">
                      {new Date(exam.examDate).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{exam.courseName}</p>
                    <p className="text-[10px] text-slate-400">
                      {EXAM_TYPE_LABELS[exam.examType as 0 | 1 | 2 | 3]} · {exam.hallName} · In {exam.daysRemaining}d
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <i className="ri-calendar-check-line text-2xl text-slate-300 block mb-2" />
              <p className="text-sm text-slate-400">No upcoming exams.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}