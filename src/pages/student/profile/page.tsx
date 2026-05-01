import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../../lib/api';
import type { ApiResponse } from '../../../lib/api';
import type { StudentProfile, UpdateStudentProfileRequest } from '../../../types/student';

import { GENDER_LABELS, YEAR_LEVEL_LABELS } from '../../../lib/enums';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState<UpdateStudentProfileRequest>();

  useEffect(() => {
    api.get<ApiResponse<StudentProfile>>('/api/student/profile')
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && res.data.data) {
          setProfile(res.data.data);
          setForm({
            phoneNumber: res.data.data.phoneNumber || '',
            address: res.data.data.address || '',
          });
        } else {
          setProfile(null);
          setForm(undefined);
        }
      })
      .catch(() => {
        setProfile(null);
        setForm(undefined);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put<ApiResponse<StudentProfile>>('/api/student/profile', form);
      if (res.data.isSuccess && res.data.hasData && res.data.data) {
        setProfile(res.data.data);
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
        setEditMode(false);
      } else {
        setMessage({ type: 'error', text: res.data.error?.description || 'Failed to update profile.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  }, [form]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <i className="ri-loader-4-line animate-spin" />
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Failed to load profile.</p>
      </div>
    );
  }

  const infoRows = [
    { label: 'Student Code', value: profile.studentCode, icon: 'ri-id-card-line' },
    { label: 'Email', value: profile.email, icon: 'ri-mail-line' },
    { label: 'Department', value: profile.departmentName, icon: 'ri-building-line' },
    { label: 'Year Level', value: YEAR_LEVEL_LABELS[profile.yearLevel as 0 | 1 | 2 | 3], icon: 'ri-stairs-line' },
    { label: 'Academic Year', value: profile.academicYearName, icon: 'ri-calendar-line' },
    { label: 'Semester', value: profile.semesterName, icon: 'ri-book-line' },
    { label: 'Gender', value: GENDER_LABELS[profile.gender as 0 | 1], icon: 'ri-user-line' },
    { label: 'Date of Birth', value: profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '-', icon: 'ri-cake-line' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        <button
          type="button"
          onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
        >
          <i className={editMode ? 'ri-close-line' : 'ri-edit-line'} />
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left card - Avatar & summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              {profile.name.charAt(0)}
            </div>
            <h2 className="text-base font-bold text-slate-800">{profile.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{profile.studentCode}</p>
            <p className="text-xs text-slate-400 mt-1">{profile.departmentName}</p>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div>
                <p className="text-lg font-bold text-slate-800">{profile.cumulativeGPA.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400">GPA</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{profile.totalCreditHours}</p>
                <p className="text-[10px] text-slate-400">Credits</p>
              </div>
            </div>
          </div>

          {editMode && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Edit Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">Phone Number</label>
                  <div className="relative">
                    <i className="ri-phone-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                      type="tel"
                      value={form?.phoneNumber || ''}
                      onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">Address</label>
                  <div className="relative">
                    <i className="ri-map-pin-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                      type="text"
                      value={form?.address || ''}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                      placeholder="Enter address"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right card - Info grid */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Student Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100">
                  <i className={`${row.icon} text-slate-400 text-sm`} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{row.label}</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5">{row.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100">
                <i className="ri-phone-line text-slate-400 text-sm" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Phone Number</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{profile.phoneNumber || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 mt-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100">
                <i className="ri-map-pin-line text-slate-400 text-sm" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Address</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{profile.address || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}