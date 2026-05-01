import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import type { ApiResponse } from '../../../lib/api';
import { SkeletonStat } from '../../../components/base/Skeleton';

interface DashboardStats {
  totalStudents: number;
  totalDoctors: number;
  totalCourses: number;
  totalDepartments: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiResponse<DashboardStats>>('/api/admin/dashboard/stats')
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData) {
          setStats(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Students', value: stats?.totalStudents ?? 1240, icon: 'ri-user-line', color: 'bg-slate-100 text-slate-700', route: '/admin/users/students' },
    { label: 'Doctors', value: stats?.totalDoctors ?? 64, icon: 'ri-stethoscope-line', color: 'bg-violet-50 text-violet-600', route: '/admin/users/doctors' },
    { label: 'Courses', value: stats?.totalCourses ?? 86, icon: 'ri-book-line', color: 'bg-emerald-50 text-emerald-600', route: '/admin/courses' },
    { label: 'Departments', value: stats?.totalDepartments ?? 6, icon: 'ri-building-line', color: 'bg-amber-50 text-amber-600', route: '/admin/departments' },
  ];

  return (
    <div className="animate-[fadeUp_0.3s_ease-out]">
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">System-wide overview and quick actions</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading dashboard data...
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          cards.map((_, i) => <SkeletonStat key={i} />)
        ) : (
          cards.map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={() => navigate(card.route)}
              className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:border-gray-200 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                  <i className={`${card.icon} text-lg`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{card.value.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">{card.label}</p>
            </button>
          ))
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Create Student', icon: 'ri-user-add-line', path: '/admin/users/students' },
            { label: 'Create Course', icon: 'ri-book-open-line', path: '/admin/courses' },
            { label: 'Manage Departments', icon: 'ri-building-line', path: '/admin/departments' },
            { label: 'Schedule Exams', icon: 'ri-calendar-event-line', path: '/admin/schedules' },
            { label: 'Fee Overview', icon: 'ri-money-dollar-circle-line', path: '/admin/fees' },
            { label: 'Send Notification', icon: 'ri-notification-line', path: '/admin/notifications' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all"
            >
              <i className={`${action.icon} text-slate-400`} />
              <span className="text-sm text-slate-600 whitespace-nowrap">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}