import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { AdvisorProfile, UpdateAdvisorProfileRequest } from '@/types/advisor';

import { GENDER_LABELS } from '@/lib/enums';

export default function AdvisorProfile() {
  const [profile, setProfile] = useState<AdvisorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateAdvisorProfileRequest>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<ApiResponse<AdvisorProfile>>('/api/advisor/profile')
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && res.data.data) {
          setProfile(res.data.data);
          setForm({
            phoneNumber: res.data.data.phoneNumber,
            address: res.data.data.address,
            officeRoom: res.data.data.officeRoom,
            officeHours: res.data.data.officeHours,
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

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
        await api.put<ApiResponse<boolean>>('/api/advisor/profile', form);
        setProfile((prev) => (prev ? { ...prev, ...form } : prev));
        setEditing(false);
      } catch {
        setEditing(false);
      } finally {
        setSaving(false);
      }
    },
    [form]
  );

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors whitespace-nowrap"
          >
            <i className="ri-edit-line" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-amber-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
              {profile.name.charAt(0)}
            </div>
            <h2 className="text-lg font-bold text-slate-800">{profile.name}</h2>
            <p className="text-xs text-slate-500 mt-1">Academic Advisor</p>
            <p className="text-xs text-amber-600 font-medium mt-1">{profile.departmentName}</p>
            <div className="mt-4 w-full pt-4 border-t border-gray-100 space-y-2 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Gender</span>
                <span className="font-medium text-slate-700">{GENDER_LABELS[profile.gender as 0 | 1]}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Date of Birth</span>
                <span className="font-medium text-slate-700">
                  {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Assigned Students</span>
                <span className="font-medium text-slate-700">{profile.assignedStudentCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          {editing ? (
            <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Edit Profile Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phoneNumber || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                  <input
                    type="text"
                    value={form.address || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Office Room</label>
                  <input
                    type="text"
                    value={form.officeRoom || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, officeRoom: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Office Hours</label>
                  <input
                    type="text"
                    value={form.officeHours || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, officeHours: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      phoneNumber: profile.phoneNumber,
                      address: profile.address,
                      officeRoom: profile.officeRoom,
                      officeHours: profile.officeHours,
                    });
                  }}
                  className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {saving ? (
                    <span className="flex items-center gap-1">
                      <i className="ri-loader-4-line animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Email', value: profile.email, icon: 'ri-mail-line' },
                  { label: 'Phone', value: profile.phoneNumber || 'Not provided', icon: 'ri-phone-line' },
                  { label: 'Address', value: profile.address || 'Not provided', icon: 'ri-map-pin-line' },
                  { label: 'Office Room', value: profile.officeRoom || 'Not provided', icon: 'ri-building-line' },
                  { label: 'Office Hours', value: profile.officeHours || 'Not provided', icon: 'ri-time-line' },
                  { label: 'Department', value: profile.departmentName, icon: 'ri-briefcase-line' },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100">
                      <i className={`${row.icon} text-slate-400 text-xs`} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{row.label}</p>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold text-slate-800">{profile.assignedStudentCount}</p>
                <p className="text-[10px] text-slate-400 mt-1">Advisees</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold text-amber-600">4</p>
                <p className="text-[10px] text-slate-400 mt-1">Active Warnings</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold text-emerald-600">3</p>
                <p className="text-[10px] text-slate-400 mt-1">Pending Adjustments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}