import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { DoctorProfile, UpdateDoctorProfileRequest } from '@/types/doctor';

import { GENDER_LABELS, DOCTOR_TITLE_LABELS } from '@/lib/enums';

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState<UpdateDoctorProfileRequest>();

  useEffect(() => {
    api.get<ApiResponse<DoctorProfile>>('/api/doctor/profile')
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && res.data.data) {
          setProfile(res.data.data);
          setForm({
            phoneNumber: res.data.data.phoneNumber || '',
            address: res.data.data.address || '',
            specialization: res.data.data.specialization || '',
            officeRoom: res.data.data.officeRoom || '',
            officeHours: res.data.data.officeHours || '',
          });
        } else {
          setProfile(null);
        }
      })
      .catch(() => {
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put<ApiResponse<DoctorProfile>>('/api/doctor/profile', form);
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
    { label: 'Email', value: profile.email, icon: 'ri-mail-line' },
    { label: 'Department', value: profile.departmentName, icon: 'ri-building-line' },
    { label: 'Title', value: DOCTOR_TITLE_LABELS[profile.title as 0 | 1 | 2 | 3 | 4], icon: 'ri-award-line' },
    { label: 'Gender', value: GENDER_LABELS[profile.gender as 0 | 1], icon: 'ri-user-line' },
    { label: 'Date of Birth', value: profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '-', icon: 'ri-cake-line' },
    { label: 'Specialization', value: profile.specialization || 'Not specified', icon: 'ri-brain-line' },
    { label: 'Office Room', value: profile.officeRoom || 'Not specified', icon: 'ri-door-open-line' },
    { label: 'Office Hours', value: profile.officeHours || 'Not specified', icon: 'ri-time-line' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        <button
          type="button"
          onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors"
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
            <div className="w-20 h-20 rounded-full bg-violet-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              {profile.name?.charAt(0) || '?'}
            </div>
            <h2 className="text-base font-bold text-slate-800">{profile.name || 'Unknown'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{DOCTOR_TITLE_LABELS[(profile.title ?? 0) as 0 | 1 | 2 | 3 | 4]}</p>
            <p className="text-xs text-slate-400 mt-1">{profile.departmentName || '-'}</p>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div>
                <p className="text-lg font-bold text-slate-800">{profile.specialization || '-'}</p>
                <p className="text-[10px] text-slate-400">Specialization</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{profile.officeRoom || '-'}</p>
                <p className="text-[10px] text-slate-400">Office</p>
              </div>
            </div>
          </div>

          {editMode && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Edit Information</h3>
              <div className="space-y-3">
                {[
                  { key: 'phoneNumber', label: 'Phone Number', icon: 'ri-phone-line', type: 'tel' },
                  { key: 'address', label: 'Address', icon: 'ri-map-pin-line', type: 'text' },
                  { key: 'specialization', label: 'Specialization', icon: 'ri-brain-line', type: 'text' },
                  { key: 'officeRoom', label: 'Office Room', icon: 'ri-door-open-line', type: 'text' },
                  { key: 'officeHours', label: 'Office Hours', icon: 'ri-time-line', type: 'text' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">{field.label}</label>
                    <div className="relative">
                      <i className={`${field.icon} absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm`} />
                      <input
                        type={field.type}
                        value={(form as Record<string, string>)?.[field.key] || ''}
                        onChange={(e) => setForm((f) => ({ ...(f || {}), [field.key]: e.target.value } as UpdateDoctorProfileRequest))}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
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
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Faculty Information</h3>
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