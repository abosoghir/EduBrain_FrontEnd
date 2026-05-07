import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats, fetchRecentRegistrations, fetchSystemAlerts } from '@/lib/adminApi';
import type { DashboardStats, RecentRegistration, SystemAlert } from '@/types/admin';

/* ─── Stat Card ─── */

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

/* ─── Severity Badge ─── */

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    high: 'bg-rose-50 text-rose-600 border-rose-200',
    medium: 'bg-amber-50 text-amber-600 border-amber-200',
    low: 'bg-blue-50 text-blue-600 border-blue-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${map[severity] ?? map.low}`}>
      {severity}
    </span>
  );
}

/* ─── Main Dashboard ─── */

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [registrations, setRegistrations] = useState<RecentRegistration[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(true);
  const [alertLoading, setAlertLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats()
      .then(res => { if (res.data) setStats(res.data); })
      .finally(() => setLoading(false));

    fetchRecentRegistrations(10)
      .then(res => setRegistrations(res.data))
      .finally(() => setRegLoading(false));

    fetchSystemAlerts(10)
      .then(res => setAlerts(res.data))
      .finally(() => setAlertLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: 'ri-user-line', color: 'bg-slate-100 text-slate-700', route: '/admin/users/students' },
    { label: 'Total Doctors', value: stats?.totalDoctors ?? 0, icon: 'ri-stethoscope-line', color: 'bg-violet-50 text-violet-600', route: '/admin/users/doctors' },
    { label: 'Active Courses', value: stats?.activeCourses ?? 0, icon: 'ri-book-line', color: 'bg-emerald-50 text-emerald-600', route: '/admin/courses' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals ?? 0, icon: 'ri-time-line', color: 'bg-amber-50 text-amber-600', route: '/admin/registration' },
    { label: 'Unpaid Fees', value: stats?.unpaidFeesCount ?? 0, icon: 'ri-money-dollar-circle-line', color: 'bg-rose-50 text-rose-600', route: '/admin/fees' },
    { label: 'Absence Alerts', value: stats?.highAbsenceAlerts ?? 0, icon: 'ri-alarm-warning-line', color: 'bg-orange-50 text-orange-600', route: '/admin/attendance' },
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

  /* Enrollment chart — simple bar comparison */
  const maxStudentCount = Math.max(
    ...(stats?.enrollmentByDepartment ?? []).map(d => d.studentCount),
    ...(stats?.lastSemesterEnrollmentByDepartment ?? []).map(d => d.studentCount),
    1
  );

  return (
    <div className="animate-[fadeUp_0.3s_ease-out] space-y-6">
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Welcome banner */}
      {stats && (
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-xs font-medium mb-0.5">Current Semester</p>
            <h2 className="text-base font-bold">{stats.currentSemester}</h2>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${stats.isRegistrationOpen ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-red-400/20 text-red-300 border border-red-400/30'}`}>
            Registration {stats.isRegistrationOpen ? 'Open' : 'Closed'}
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

      {/* Enrollment by Department Chart */}
      {!loading && stats && stats.enrollmentByDepartment.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Enrollment by Department</h2>
          <div className="space-y-3">
            {stats.enrollmentByDepartment.map((dept) => {
              const lastSem = stats.lastSemesterEnrollmentByDepartment.find(d => d.departmentId === dept.departmentId);
              const pct = Math.round((dept.studentCount / maxStudentCount) * 100);
              const lastPct = lastSem ? Math.round((lastSem.studentCount / maxStudentCount) * 100) : 0;
              const diff = lastSem ? dept.studentCount - lastSem.studentCount : 0;

              return (
                <div key={dept.departmentId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      />
                      <span className="text-xs font-medium text-slate-700">
                        {dept.departmentName}
                        <span className="text-slate-400 ml-1">({dept.departmentCode})</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-700">{dept.studentCount.toLocaleString()}</span>
                      {diff !== 0 && (
                        <span className={`${diff > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {diff > 0 ? '+' : ''}{diff}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    {lastPct > 0 && (
                      <div
                        className="absolute h-full rounded-full opacity-25"
                        style={{ width: `${lastPct}%`, backgroundColor: dept.color }}
                      />
                    )}
                    <div
                      className="absolute h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: dept.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400">
            <div className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-slate-400 inline-block" /> Current Semester</div>
            <div className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-slate-400/25 inline-block" /> Last Semester</div>
          </div>
        </div>
      )}

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

        {/* System Alerts */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">System Alerts</h2>
          {alertLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-3/4 bg-gray-100 rounded mb-1.5" />
                    <div className="h-2.5 w-1/3 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No active alerts</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alerts.map((alert) => (
                <button
                  key={alert.alertId}
                  type="button"
                  onClick={() => alert.actionLink && navigate(alert.actionLink)}
                  className={`w-full flex items-start gap-3 p-2 rounded-lg text-left hover:bg-gray-50 transition-colors ${!alert.isRead ? 'bg-slate-50/60' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    alert.severity === 'high' ? 'bg-rose-100' : alert.severity === 'medium' ? 'bg-amber-100' : 'bg-blue-100'
                  }`}>
                    <i className={`text-xs ${
                      alert.severity === 'high' ? 'ri-error-warning-line text-rose-500' : alert.severity === 'medium' ? 'ri-alert-line text-amber-500' : 'ri-information-line text-blue-500'
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-medium text-slate-700 truncate">{alert.title}</p>
                      <SeverityBadge severity={alert.severity} />
                      {!alert.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{alert.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{alert.typeDisplay} · {timeAgo(alert.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Recent Registrations</h2>
        {regLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-3 w-24 bg-gray-100 rounded" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No recent registrations</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 text-slate-400 font-medium">Student</th>
                  <th className="text-left py-2 px-2 text-slate-400 font-medium">Course</th>
                  <th className="text-left py-2 px-2 text-slate-400 font-medium">Credits</th>
                  <th className="text-left py-2 px-2 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-2 px-2 text-slate-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.enrollmentId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-2">
                      <div>
                        <p className="font-medium text-slate-700">{reg.studentName}</p>
                        <p className="text-[10px] text-slate-400">{reg.studentCode}</p>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <div>
                        <p className="text-slate-700">{reg.courseName}</p>
                        <p className="text-[10px] text-slate-400">{reg.courseCode}</p>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-slate-600">{reg.creditHours} hrs</td>
                    <td className="py-2.5 px-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${reg.statusColor}15`,
                          color: reg.statusColor,
                          border: `1px solid ${reg.statusColor}30`,
                        }}
                      >
                        {reg.statusDisplay}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-slate-400">{timeAgo(reg.registrationDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}