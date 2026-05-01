import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';
import { ResetPasswordRequest } from '../../types/auth';
import type { ApiResponse } from '../../lib/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stateEmail = (location.state as { email?: string })?.email;
    if (stateEmail) {
      setEmail(stateEmail);
    }
  }, [location.state]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }

      setIsLoading(true);

      const payload: ResetPasswordRequest = {
        email,
        code,
        newPassword,
      };

      try {
        const response = await api.post<ApiResponse<unknown>>('/auth/reset-password', payload);
        const result = response.data;

        if (result.isSuccess) {
          setSuccess(true);
        } else {
          setError(result.error?.description || 'Failed to reset password. Please try again.');
        }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: ApiResponse<unknown> } };
        const desc = axiosErr.response?.data?.error?.description;
        setError(desc || 'Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [email, code, newPassword, confirmPassword]
  );

  return (
    <div className="flex min-h-screen w-full">
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
            Create New<br />
            <span className="text-slate-400">Password</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            Enter the reset code from your email and set a new secure password for your account.
          </p>
        </div>
      </div>

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

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Reset Password</h2>
          <p className="text-sm text-slate-500 mb-8">Enter your reset code and new password.</p>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-checkbox-circle-line" />
                  <span className="font-medium">Password reset successful!</span>
                </div>
                <p className="text-xs">Your password has been updated. You can now sign in with your new password.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-2.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium transition-colors whitespace-nowrap"
              >
                Go to Sign in
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

              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Reset Code</label>
                <div className="relative">
                  <i className="ri-key-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
                    placeholder="Enter 6-digit code"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">New Password</label>
                <div className="relative">
                  <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
                    placeholder="Min 8 characters, uppercase, lowercase, digit, special char"
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

              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
                    placeholder="Re-enter new password"
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
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}