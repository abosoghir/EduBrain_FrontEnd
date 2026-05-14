import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { ForgotPasswordRequest } from '../../types/auth';
import type { ApiResponse } from '../../lib/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [stats, setStats] = useState({
    studentsCount: 1240,
    coursesCount: 86,
    facultyCount: 64,
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
        });
      }
    }).catch(console.error);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      const payload: ForgotPasswordRequest = { email };

      try {
        const response = await api.post<ApiResponse<unknown>>('/auth/forget-password', payload);
        const result = response.data;

        if (result.isSuccess) {
          setSuccess(true);
        } else {
          setError(result.error?.description || 'Failed to send reset link. Please try again.');
        }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: ApiResponse<unknown> } };
        const desc = axiosErr.response?.data?.error?.description;
        setError(desc || 'Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [email]
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel */}
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
            Reset Your<br />
            <span className="text-slate-400">Password</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            Enter your email address and we will send you a reset code to recover your account.
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-4">Faculty Excellence</p>
          <div className="flex gap-8">
            <div>
              <p className="text-2xl font-bold">{stats.studentsCount.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Students</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.coursesCount.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Courses</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.facultyCount.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Faculty</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <i className="ri-arrow-left-line" />
            Back to Sign in
          </button>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Forgot Password</h2>
          <p className="text-sm text-slate-500 mb-8">
            {success
              ? 'Check your email for the reset code.'
              : 'Enter your email to receive a password reset code.'}
          </p>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-checkbox-circle-line" />
                  <span className="font-medium">Reset code sent!</span>
                </div>
                <p className="text-xs">Please check your email inbox for the reset code.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/reset-password', { state: { email } })}
                className="w-full py-2.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium transition-colors whitespace-nowrap"
              >
                Continue to Reset Password
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email Address</label>
                <div className="relative">
                  <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
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
                className="w-full py-2.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}