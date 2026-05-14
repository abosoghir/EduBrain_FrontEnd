import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role, ROLE_LABELS } from '../../lib/enums';
import { LoginRequest } from '../../types/auth';
import { api } from '../../lib/api';

interface SystemStats {
  studentsCount: number;
  coursesCount: number;
  facultyCount: number;
  departmentsCount: number;
}

const ROLES = [
  { role: Role.Admin, icon: 'ri-shield-user-line', color: 'bg-slate-600', ring: 'ring-slate-600', btn: 'bg-slate-700 hover:bg-slate-800' },
  { role: Role.Doctor, icon: 'ri-stethoscope-line', color: 'bg-violet-600', ring: 'ring-violet-600', btn: 'bg-violet-600 hover:bg-violet-700' },
  { role: Role.Student, icon: 'ri-graduation-cap-line', color: 'bg-emerald-600', ring: 'ring-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  { role: Role.AcademicAdvisor, icon: 'ri-user-star-line', color: 'bg-amber-600', ring: 'ring-amber-600', btn: 'bg-amber-600 hover:bg-amber-700' },
];

const ROLE_DEFAULT_EMAILS: Record<Role, string> = {
  [Role.Admin]: 'admin@edubrain.com',
  [Role.Doctor]: 'm.samir@fcs.edu',
  [Role.Student]: 'ahmed.hassan@student.fcs.edu',
  [Role.AcademicAdvisor]: 'r.fawzy@fcs.edu',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, redirectToPortal } = useAuth();

  const [selectedRole, setSelectedRole] = useState<Role>(Role.Admin);
  const [email, setEmail] = useState(ROLE_DEFAULT_EMAILS[Role.Admin]);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [stats, setStats] = useState<SystemStats>({
    studentsCount: 1240,
    coursesCount: 86,
    facultyCount: 64,
    departmentsCount: 6,
  });

  useEffect(() => {
    api.get<any>('/api/public/stats').then(res => {
      if (res.data) {
        let statsData = res.data;
        if (statsData.isSuccess && statsData.data) {
          statsData = statsData.data;
        }
        setStats({
          studentsCount: statsData.studentsCount || 0,
          coursesCount: statsData.coursesCount || 0,
          facultyCount: statsData.facultyCount || 0,
          departmentsCount: statsData.departmentsCount || 0,
        });
      }
    }).catch(console.error);
  }, []);

  const handleRoleChange = useCallback((role: Role) => {
    setSelectedRole(role);
    setEmail(ROLE_DEFAULT_EMAILS[role]);
    setError('');
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      const credentials: LoginRequest = {
        email,
        password,
        role: selectedRole,
      };

      const result = await login(credentials);
      setIsLoading(false);

      if (result.success) {
        navigate(redirectToPortal(selectedRole));
      } else {
        setError(result.error || 'Invalid credentials');
      }
    },
    [email, password, selectedRole, login, redirectToPortal, navigate]
  );

  const currentConfig = ROLES.find((r) => r.role === selectedRole) || ROLES[0];

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-slate-900 text-white p-10">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <i className="ri-graduation-cap-line text-xl" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Faculty of Computer Science</h2>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Your Academic<br />
            <span className={selectedRole === Role.Admin ? 'text-slate-400' : selectedRole === Role.Doctor ? 'text-violet-400' : selectedRole === Role.Student ? 'text-emerald-400' : 'text-amber-400'}>
              Portal Awaits
            </span>
          </h1>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-10">
            A unified platform for students, faculty, advisors, and administrators to manage academic life seamlessly.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {ROLES.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => handleRoleChange(r.role)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border ${
                  selectedRole === r.role
                    ? `border-white/30 bg-white/10`
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${r.color} flex items-center justify-center`}>
                  <i className={`${r.icon} text-white text-sm`} />
                </div>
                <div>
                  <p className="text-xs font-medium">{ROLE_LABELS[r.role]}</p>
                  <p className="text-[10px] text-slate-400">
                    {r.role === Role.Admin && 'Full system access'}
                    {r.role === Role.Doctor && 'Courses & students'}
                    {r.role === Role.Student && 'Grades & schedule'}
                    {r.role === Role.AcademicAdvisor && 'Monitor & guide'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-4">Faculty Excellence</p>
          <div className="flex gap-8">
            <div>
              <p className="text-2xl font-bold">{stats.studentsCount.toLocaleString()}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <i className="ri-user-line" /> Students
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.coursesCount.toLocaleString()}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <i className="ri-book-line" /> Courses
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.facultyCount.toLocaleString()}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <i className="ri-team-line" /> Faculty
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.departmentsCount.toLocaleString()}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <i className="ri-building-line" /> Departments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Mobile role selector */}
          <div className="lg:hidden mb-6">
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleRoleChange(r.role)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm transition-all border ${
                    selectedRole === r.role
                      ? `border-slate-300 bg-white shadow-sm`
                      : 'border-gray-200 bg-white/60'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md ${r.color} flex items-center justify-center`}>
                    <i className={`${r.icon} text-white text-xs`} />
                  </div>
                  <span className="text-xs font-medium text-slate-700">{ROLE_LABELS[r.role]}</span>
                </button>
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Sign in</h2>
          <p className="text-sm text-slate-500 mb-8">Access your portal with your credentials</p>

          <form onSubmit={handleSubmit}>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-3 font-medium">Select Your Role</p>
            <div className="hidden lg:grid grid-cols-2 gap-3 mb-6">
              {ROLES.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleRoleChange(r.role)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border ${
                    selectedRole === r.role
                      ? `border-${r.ring.replace('ring-', '')} ring-1 ${r.ring} bg-white shadow-sm`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${r.color} flex items-center justify-center`}>
                    <i className={`${r.icon} text-white text-sm`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{ROLE_LABELS[r.role]}</p>
                    <p className="text-[10px] text-slate-400">
                      {r.role === Role.Admin && 'Full system access'}
                      {r.role === Role.Doctor && 'Courses & students'}
                      {r.role === Role.Student && 'Grades & schedule'}
                      {r.role === Role.AcademicAdvisor && 'Monitor & guide'}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Email / ID</label>
              <div className="relative">
                <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <i className={showPassword ? 'ri-eye-off-line text-sm' : 'ri-eye-line text-sm'} />
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-60 whitespace-nowrap ${currentConfig.btn}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin" />
                  Signing in...
                </span>
              ) : (
                `Sign in as ${ROLE_LABELS[selectedRole]}`
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <p className="mt-10 text-center text-[10px] text-slate-400">
            &copy; 2026 Faculty of Computer Science - CMS v1.0
          </p>
        </div>
      </div>
    </div>
  );
}