import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role, ROLE_LABELS } from '../../lib/enums';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const PORTAL_NAV: Record<Role, NavItem[]> = {
  [Role.Admin]: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { path: '/admin/academic-years', label: 'Academic Years', icon: 'ri-time-line' },
    { path: '/admin/registration', label: 'Registration', icon: 'ri-edit-box-line' },
    { path: '/admin/courses', label: 'Courses', icon: 'ri-book-line' },
    { path: '/admin/course-instances', label: 'Course Instances', icon: 'ri-tv-line' },
    { path: '/admin/departments', label: 'Departments', icon: 'ri-building-line' },
    { path: '/admin/users/students', label: 'Students', icon: 'ri-user-line' },
    { path: '/admin/users/doctors', label: 'Doctors', icon: 'ri-stethoscope-line' },
    { path: '/admin/users/advisors', label: 'Advisors', icon: 'ri-user-star-line' },
    { path: '/admin/schedules', label: 'Scheduling', icon: 'ri-calendar-line' },
    { path: '/admin/rooms', label: 'Rooms', icon: 'ri-door-line' },
    { path: '/admin/fees', label: 'Finance', icon: 'ri-money-dollar-circle-line' },
    { path: '/admin/notifications', label: 'Notifications', icon: 'ri-notification-line' },
  ],
  [Role.Student]: [
    { path: '/student/dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { path: '/student/courses', label: 'My Courses', icon: 'ri-book-line' },
    { path: '/student/registration', label: 'Registration', icon: 'ri-edit-line' },
    { path: '/student/schedule', label: 'Schedule', icon: 'ri-calendar-line' },
    { path: '/student/exams', label: 'Exams', icon: 'ri-file-list-line' },
    { path: '/student/grades', label: 'Grades', icon: 'ri-bar-chart-line' },
    { path: '/student/attendance', label: 'Attendance', icon: 'ri-check-double-line' },
    { path: '/student/fees', label: 'Fees', icon: 'ri-money-dollar-circle-line' },
    { path: '/student/notifications', label: 'Notifications', icon: 'ri-notification-line' },
    { path: '/student/profile', label: 'Profile', icon: 'ri-user-settings-line' },
  ],
  [Role.Doctor]: [
    { path: '/doctor/dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { path: '/doctor/courses', label: 'My Courses', icon: 'ri-book-line' },
    { path: '/doctor/schedule', label: 'Schedule', icon: 'ri-calendar-line' },
    { path: '/doctor/attendance', label: 'Attendance', icon: 'ri-check-double-line' },
    { path: '/doctor/grades', label: 'Grades', icon: 'ri-bar-chart-line' },
    { path: '/doctor/announcements', label: 'Announcements', icon: 'ri-megaphone-line' },
    { path: '/doctor/profile', label: 'Profile', icon: 'ri-user-settings-line' },
  ],
  [Role.AcademicAdvisor]: [
    { path: '/advisor/dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { path: '/advisor/students', label: 'My Students', icon: 'ri-user-line' },
    { path: '/advisor/warnings', label: 'Warnings', icon: 'ri-alert-line' },
    { path: '/advisor/schedule-adjustments', label: 'Schedule Adjust', icon: 'ri-calendar-event-line' },
    { path: '/advisor/fees', label: 'Fees', icon: 'ri-money-dollar-circle-line' },
    { path: '/advisor/notifications', label: 'Notifications', icon: 'ri-notification-line' },
    { path: '/advisor/profile', label: 'Profile', icon: 'ri-user-settings-line' },
  ],
};

const ROLE_THEME: Record<Role, { color: string; navBg: string; activeBg: string; activeText: string }> = {
  [Role.Admin]: { color: 'bg-slate-700', navBg: 'bg-white', activeBg: 'bg-slate-50', activeText: 'text-slate-700' },
  [Role.Doctor]: { color: 'bg-violet-600', navBg: 'bg-white', activeBg: 'bg-violet-50', activeText: 'text-violet-700' },
  [Role.Student]: { color: 'bg-emerald-600', navBg: 'bg-white', activeBg: 'bg-emerald-50', activeText: 'text-emerald-700' },
  [Role.AcademicAdvisor]: { color: 'bg-amber-600', navBg: 'bg-white', activeBg: 'bg-amber-50', activeText: 'text-amber-700' },
};

// Searchable pages per role
const SEARCHABLE_PAGES: Record<Role, Array<{ path: string; label: string; keywords: string }>> = {
  [Role.Admin]: [
    { path: '/admin/dashboard', label: 'Dashboard', keywords: 'home stats overview' },
    { path: '/admin/academic-years', label: 'Academic Years', keywords: 'semesters terms sessions' },
    { path: '/admin/registration', label: 'Registration', keywords: 'enroll open close registration' },
    { path: '/admin/courses', label: 'Courses', keywords: 'subjects classes curriculum' },
    { path: '/admin/course-instances', label: 'Course Instances', keywords: 'instances sections classes offered' },
    { path: '/admin/departments', label: 'Departments', keywords: 'departments divisions' },
    { path: '/admin/users/students', label: 'Students', keywords: 'student users pupils' },
    { path: '/admin/users/doctors', label: 'Doctors', keywords: 'faculty professors teachers' },
    { path: '/admin/users/advisors', label: 'Advisors', keywords: 'academic advisors counselors' },
    { path: '/admin/schedules', label: 'Scheduling', keywords: 'timetable calendar rooms' },
    { path: '/admin/rooms', label: 'Rooms', keywords: 'halls labs classrooms offices' },
    { path: '/admin/fees', label: 'Finance', keywords: 'payments tuition money billing' },
    { path: '/admin/notifications', label: 'Notifications', keywords: 'messages alerts announcements' },
  ],
  [Role.Student]: [
    { path: '/student/dashboard', label: 'Dashboard', keywords: 'home overview' },
    { path: '/student/courses', label: 'My Courses', keywords: 'classes subjects enrolled' },
    { path: '/student/registration', label: 'Registration', keywords: 'enroll sign up add courses' },
    { path: '/student/schedule', label: 'Schedule', keywords: 'timetable calendar classes' },
    { path: '/student/exams', label: 'Exams', keywords: 'tests assessments midterm final' },
    { path: '/student/grades', label: 'Grades', keywords: 'marks gpa scores results' },
    { path: '/student/attendance', label: 'Attendance', keywords: 'presence absence records' },
    { path: '/student/fees', label: 'Fees', keywords: 'payments tuition billing money' },
    { path: '/student/notifications', label: 'Notifications', keywords: 'messages alerts inbox' },
    { path: '/student/profile', label: 'Profile', keywords: 'account settings personal info' },
  ],
  [Role.Doctor]: [
    { path: '/doctor/dashboard', label: 'Dashboard', keywords: 'home overview teaching' },
    { path: '/doctor/courses', label: 'My Courses', keywords: 'classes subjects teaching' },
    { path: '/doctor/schedule', label: 'Schedule', keywords: 'timetable calendar classes' },
    { path: '/doctor/attendance', label: 'Attendance', keywords: 'presence records students' },
    { path: '/doctor/grades', label: 'Grades', keywords: 'marks scores entry evaluation' },
    { path: '/doctor/announcements', label: 'Announcements', keywords: 'messages posts broadcast' },
    { path: '/doctor/profile', label: 'Profile', keywords: 'account settings personal' },
  ],
  [Role.AcademicAdvisor]: [
    { path: '/advisor/dashboard', label: 'Dashboard', keywords: 'home overview students' },
    { path: '/advisor/students', label: 'My Students', keywords: 'advisees pupils monitoring' },
    { path: '/advisor/warnings', label: 'Warnings', keywords: 'alerts probation discipline' },
    { path: '/advisor/schedule-adjustments', label: 'Schedule Adjust', keywords: 'changes requests swaps' },
    { path: '/advisor/fees', label: 'Fees', keywords: 'payments tuition billing' },
    { path: '/advisor/notifications', label: 'Notifications', keywords: 'messages alerts inbox' },
    { path: '/advisor/profile', label: 'Profile', keywords: 'account settings personal' },
  ],
};

export default function PortalLayout({ children, allowedRole }: { children: React.ReactNode; allowedRole: Role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const role = user?.role ?? allowedRole;
  const navItems = PORTAL_NAV[role] || [];
  const theme = ROLE_THEME[role];
  const searchable = SEARCHABLE_PAGES[role] || [];

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return searchable.filter(
      (page) =>
        page.label.toLowerCase().includes(q) ||
        page.keywords.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery, searchable]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
  }, [logout, navigate]);

  const handleSearchSelect = useCallback(
    (path: string) => {
      navigate(path);
      setSearchOpen(false);
      setSearchQuery('');
    },
    [navigate]
  );

  // Keyboard shortcut: Cmd/Ctrl + K to open search, Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const profilePath = useMemo(() => {
    switch (role) {
      case Role.Student: return '/student/profile';
      case Role.Doctor: return '/doctor/profile';
      case Role.AcademicAdvisor: return '/advisor/profile';
      default: return '';
    }
  }, [role]);

  const notificationsPath = useMemo(() => {
    switch (role) {
      case Role.Student: return '/student/notifications';
      case Role.Doctor: return '/doctor/announcements';
      case Role.AcademicAdvisor: return '/advisor/notifications';
      case Role.Admin: return '/admin/notifications';
      default: return '';
    }
  }, [role]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${theme.navBg} border-r border-gray-100 flex flex-col transform transition-transform duration-200 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${theme.color} flex items-center justify-center`}>
              <i className="ri-graduation-cap-line text-white text-sm" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-800">EduBrain</h1>
              <p className="text-[10px] text-slate-400">{ROLE_LABELS[role]}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? `${theme.activeBg} ${theme.activeText} font-medium`
                    : 'text-slate-500 hover:bg-gray-50 hover:text-slate-700'
                }`}
              >
                <i className={`${item.icon} text-base ${isActive ? '' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className={`w-8 h-8 rounded-full ${theme.color} flex items-center justify-center text-white text-xs font-medium`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <i className="ri-logout-box-line" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <i className="ri-menu-line text-slate-600" />
              </button>

              {/* Global Search */}
              <div className="relative hidden md:block">
                <div className="flex items-center gap-2">
                  <i className="ri-search-line text-slate-400 text-sm" />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Search pages...
                  </button>
                  <span className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-slate-500">
                    <i className="ri-command-line" /> K
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile search toggle */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <i className="ri-search-line text-slate-600" />
              </button>

              {/* Notifications */}
              {notificationsPath && (
                <button
                  type="button"
                  onClick={() => navigate(notificationsPath)}
                  className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <i className="ri-notification-line text-slate-600" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                </button>
              )}

              {/* User dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-full ${theme.color} flex items-center justify-center text-white text-xs font-medium`}>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <i className={`ri-arrow-down-s-line text-xs text-slate-400 hidden sm:block ${userMenuOpen ? 'rotate-180' : ''} transition-transform`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-50 py-1 animate-[fadeIn_0.15s_ease-out]">
                      {profilePath && (
                        <button
                          type="button"
                          onClick={() => { navigate(profilePath); setUserMenuOpen(false); }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-gray-50 transition-colors"
                        >
                          <i className="ri-user-line text-slate-400" />
                          My Profile
                        </button>
                      )}
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        type="button"
                        onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <i className="ri-logout-box-line" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Search overlay */}
        {searchOpen && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4">
            <div className="absolute inset-0 bg-black/20" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} />
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.15s_ease-out]">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <i className="ri-search-line text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages, sections..."
                  className="flex-1 text-sm outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-slate-500"
                >
                  ESC
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <button
                        key={result.path}
                        type="button"
                        onClick={() => handleSearchSelect(result.path)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <i className="ri-arrow-right-line text-slate-400 text-xs" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{result.label}</p>
                          <p className="text-[10px] text-slate-400">{result.path}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="py-8 text-center">
                    <i className="ri-search-line text-2xl text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">No results found</p>
                  </div>
                ) : (
                  <div className="py-2">
                    <p className="px-4 py-2 text-[10px] uppercase tracking-wider text-slate-400 font-medium">Quick Access</p>
                    {searchable.slice(0, 5).map((page) => (
                      <button
                        key={page.path}
                        type="button"
                        onClick={() => handleSearchSelect(page.path)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <i className="ri-arrow-right-line text-slate-400 text-xs" />
                        <p className="text-sm text-slate-700">{page.label}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
