import React, { useEffect, useState, useCallback } from 'react';
import { fetchDoctorProfile, updateDoctorProfile } from '@/lib/doctorPortalApi';
import type { DoctorProfile } from '@/types/doctor';
import { DOCTOR_TITLE_LABELS } from '@/lib/enums';

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Only the 3 fields the API actually accepts
  const [form, setForm] = useState<{ phoneNumber: string; profilePictureUrl: string }>({
    phoneNumber: '',
    profilePictureUrl: '',
  });

  useEffect(() => {
    fetchDoctorProfile()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setForm({
            phoneNumber: data.phoneNumber ?? '',
            profilePictureUrl: data.profilePictureUrl ?? '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    const { success, error } = await updateDoctorProfile({
      phoneNumber: form.phoneNumber || undefined,
      profilePictureUrl: form.profilePictureUrl || undefined,
    });
    if (success) {
      if (profile) {
        setProfile({ ...profile, phoneNumber: form.phoneNumber, profilePictureUrl: form.profilePictureUrl });
      }
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setEditMode(false);
    } else {
      setMessage({ type: 'error', text: error ?? 'Failed to update profile.' });
    }
    setSaving(false);
  }, [form, profile]);

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

  const titleDisplay = DOCTOR_TITLE_LABELS[profile.title as 0 | 1 | 2 | 3 | 4] ?? 'Faculty';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        <button
          type="button"
          onClick={() => { setEditMode(!editMode); setMessage(null); }}
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
        {/* Avatar + summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            {profile.profilePictureUrl ? (
              <img
                src={profile.profilePictureUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-violet-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {profile.email.charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="text-base font-bold text-slate-800">{titleDisplay}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{profile.email}</p>
            <p className="text-xs text-slate-400 mt-1">{profile.departmentName}</p>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div>
                <p className="text-lg font-bold text-slate-800">{profile.totalCourses}</p>
                <p className="text-[10px] text-slate-400">Courses</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{profile.totalStudents}</p>
                <p className="text-[10px] text-slate-400">Students</p>
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
                      value={form.phoneNumber}
                      onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                      placeholder="+20 1234567890"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">Profile Picture URL</label>
                  <div className="relative">
                    <i className="ri-image-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                      type="url"
                      value={form.profilePictureUrl}
                      onChange={(e) => setForm((f) => ({ ...f, profilePictureUrl: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                      placeholder="https://..."
                    />
                  </div>
                </div>
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
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Faculty information */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Faculty Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Email', value: profile.email, icon: 'ri-mail-line' },
              { label: 'Title', value: titleDisplay, icon: 'ri-award-line' },
              { label: 'Department', value: profile.departmentName, icon: 'ri-building-line' },
              { label: 'Office Room', value: profile.officeRoomName ?? 'Not assigned', icon: 'ri-door-open-line' },
              { label: 'Phone', value: profile.phoneNumber ?? 'Not provided', icon: 'ri-phone-line' },
              { label: 'Total Courses', value: String(profile.totalCourses), icon: 'ri-book-line' },
            ].map((row) => (
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
        </div>
      </div>
    </div>
  );
}