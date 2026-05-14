import React, { useEffect, useState, useCallback } from 'react';
import { fetchAdvisorProfile, updateAdvisorProfile } from '@/lib/advisorPortalApi';
import type { AdvisorProfileResponse, UpdateAdvisorProfileRequest } from '@/types/advisor';

export default function AdvisorProfile() {
  const [profile, setProfile] = useState<AdvisorProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateAdvisorProfileRequest>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdvisorProfile()
      .then((res) => {
        if (res.data) {
          setProfile(res.data);
          setForm({ phoneNumber: res.data.phoneNumber });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateAdvisorProfile(form);
    if (res.success && profile) {
      setProfile({ ...profile, phoneNumber: form.phoneNumber || profile.phoneNumber });
      setEditing(false);
    }
    setSaving(false);
  }, [form, profile]);

  if (loading) return <div className="flex items-center gap-2 text-slate-400 text-sm"><i className="ri-loader-4-line animate-spin" /> Loading profile...</div>;
  if (!profile) return <div className="text-center py-12"><p className="text-sm text-slate-500">Failed to load profile.</p></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors whitespace-nowrap">
            <i className="ri-edit-line" /> Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex flex-col items-center text-center">
            {profile.profilePictureUrl ? (
              <img src={profile.profilePictureUrl} alt={profile.name} className="w-20 h-20 rounded-full object-cover mb-4" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-600 flex items-center justify-center text-white text-2xl font-bold mb-4">{profile.name.charAt(0)}</div>
            )}
            <h2 className="text-lg font-bold text-slate-800">{profile.name}</h2>
            <p className="text-xs text-slate-500 mt-1">Academic Advisor</p>
            <div className="mt-4 w-full pt-4 border-t border-gray-100 space-y-2 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Advisor ID</span>
                <span className="font-medium text-slate-700">{profile.advisorId}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Total Students</span>
                <span className="font-medium text-slate-700">{profile.totalStudents}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          {editing ? (
            <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Edit Profile Information</h3>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                <input type="tel" value={form.phoneNumber || ''} onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setEditing(false); setForm({ phoneNumber: profile.phoneNumber }); }} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 whitespace-nowrap">
                  {saving ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" />Saving...</span> : 'Save Changes'}
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
                  { label: 'Office Room', value: profile.officeRoomName || 'Not assigned', icon: 'ri-building-line' },
                  { label: 'Office Location', value: profile.officeLocation || 'Not provided', icon: 'ri-map-pin-line' },
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
                <p className="text-2xl font-bold text-slate-800">{profile.totalStudents}</p>
                <p className="text-[10px] text-slate-400 mt-1">Advisees</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold text-amber-600">{profile.activeWarnings}</p>
                <p className="text-[10px] text-slate-400 mt-1">Active Warnings</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold text-emerald-600">{profile.warningsIssued}</p>
                <p className="text-[10px] text-slate-400 mt-1">Warnings Issued</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}