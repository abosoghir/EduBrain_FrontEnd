import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats, fetchDashboardActivity } from '@/lib/adminApi';
import type { DashboardStats, ActivityItem } from '@/types/admin';

function StatCard({
  label, value, icon, color, route, loading
}: {
  label: string; value: string | number; icon: string; color: string; route: string; loading: boolean;
}) {
  const navigate = useNavigate();
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
        <div className="w-10 h-10 rounded-lg bg-gray-100 mb-3" />
        <div className="h-7 w-16 bg-gray-100 rounded mb-2" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => navigate(route)}
      className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <i className={`${icon} text-lg`} />
        </div>
        <i className="ri-arrow-right-line text-slate-300 text-sm group-hover:text-slate-500 transition-colors" />
      </div>
      <p className="text-2xl font-bold text-slate-800">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </button>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats()
      .then(res => { if (res.data) setStats(res.data); })
      .finally(() => setLoading(false));

    fetchDashboardActivity(10)
      .then(res => setActivity(res.data))
      .finally(() => setActivityLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: 'ri-user-line', color: 'bg-slate-100 text-slate-700', route: '/admin/users/students' },
    { label: 'Total Doctors', value: stats?.totalDoctors ?? 0, icon: 'ri-stethoscope-line', color: 'bg-violet-50 text-violet-600', route: '/admin/users/doctors' },
    { label: 'Total Courses', value: stats?.totalCourses ?? 0, icon: 'ri-book-line', color: 'bg-emerald-50 text-emerald-600', route: '/admin/courses' },
    { label: 'Active Instances', value: stats?.activeCourseInstances ?? 0, icon: 'ri-tv-line', color: 'bg-blue-50 text-blue-600', route: '/admin/course-instances' },
    { label: 'Registration', value: stats?.registrationStatus ?? '—', icon: 'ri-edit-box-line', color: 'bg-amber-50 text-amber-600', route: '/admin/registration' },
    { label: 'Unpaid Fees', value: stats?.unpaidFeesCount ?? 0, icon: 'ri-money-dollar-circle-line', color: 'bg-rose-50 text-rose-600', route: '/admin/fees' },
  ];

  const quickActions = [
    { label: 'Add Academic Year', icon: 'ri-calendar-add-line', path: '/admin/academic-years' },
    { label: 'Add Student', icon: 'ri-user-add-line', path: '/admin/users/students' },
    { label: 'Add Course Instance', icon: 'ri-add-box-line', path: '/admin/course-instances' },
    { label: 'Manage Registration', icon: 'ri-toggle-line', path: '/admin/registration' },
    { label: 'Manage Schedules', icon: 'ri-calendar-event-line', path: '/admin/schedules' },
    { label: 'Send Notification', icon: 'ri-notification-line', path: '/admin/notifications' },
  ];

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="animate-[fadeUp_0.3s_ease-out] space-y-6">
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Welcome banner */}
      {(stats?.currentAcademicYear || stats?.currentSemester) && (
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-xs font-medium mb-0.5">Current Period</p>
            <h2 className="text-base font-bold">{stats.currentAcademicYear}</h2>
            <p className="text-slate-300 text-sm">{stats.currentSemester}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${stats?.registrationStatus === 'Open' ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-red-400/20 text-red-300 border border-red-400/30'}`}>
            Registration {stats?.registrationStatus ?? '—'}
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">System-wide overview and quick actions</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all text-left"
              >
                <i className={`${action.icon} text-slate-400`} />
                <span className="text-sm text-slate-600 whitespace-nowrap">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Recent Activity</h2>
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-3/4 bg-gray-100 rounded mb-1.5" />
                    <div className="h-2.5 w-1/3 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No recent activity</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <i className="ri-history-line text-slate-400 text-xs" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 leading-snug">{item.event}</p>
                    <p className="text-[10px] text-slate-400">{item.performedBy} · {timeAgo(item.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}