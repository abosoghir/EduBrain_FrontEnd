import React, { useEffect, useState } from 'react';
import { fetchStudentProfile, updateStudentProfile, changeStudentPassword } from '@/lib/studentPortalApi';
import type { StudentProfile, UpdateStudentProfileRequest, ChangeStudentPasswordRequest } from '@/types/student';
import { GENDER_LABELS, YEAR_LEVEL_LABELS } from '@/lib/enums';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState<UpdateStudentProfileRequest>({});
  
  const [passwordForm, setPasswordForm] = useState<ChangeStudentPasswordRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchStudentProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          phoneNumber: p.phoneNumber ?? '',
          address: p.address ?? '',
          city: p.city ?? '',
          fatherPhone: p.fatherPhone ?? '',
          fatherJob: p.fatherJob ?? '',
          nationality: p.nationality ?? '',
          gender: p.gender as 0 | 1,
          religion: p.religion ?? '',
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
        });
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload: UpdateStudentProfileRequest = {
        ...form,
        dateOfBirth: form.dateOfBirth === '' ? undefined : form.dateOfBirth,
        gender: form.gender === '' as any ? undefined : form.gender,
      };
      await updateStudentProfile(payload);
      // Refresh profile after save
      const updated = await fetchStudentProfile();
      setProfile(updated);
      setForm({
        phoneNumber: updated.phoneNumber ?? '',
        address: updated.address ?? '',
        city: updated.city ?? '',
        fatherPhone: updated.fatherPhone ?? '',
        fatherJob: updated.fatherJob ?? '',
        nationality: updated.nationality ?? '',
        gender: updated.gender as 0 | 1,
        religion: updated.religion ?? '',
        dateOfBirth: updated.dateOfBirth ? updated.dateOfBirth.split('T')[0] : '',
      });
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setEditMode(false);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setShowPasswordModal(false);
      return;
    }
    setChangingPassword(true);
    setMessage(null);
    try {
      await changeStudentPassword(passwordForm);
      setMessage({ type: 'success', text: 'Password changed successfully.' });
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password.' });
      setShowPasswordModal(false);
    } finally {
      setChangingPassword(false);
    }
  };

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

  const academicInfoRows: Array<{ label: string; value: string; icon: string }> = [
    { label: 'Student Code', value: profile.studentCode, icon: 'ri-profile-line' },
    { label: 'Department', value: profile.departmentName, icon: 'ri-building-line' },
    { label: 'Year Level', value: YEAR_LEVEL_LABELS[profile.yearLevel as 0 | 1 | 2 | 3], icon: 'ri-stack-line' },
    { label: 'Cumulative GPA', value: profile.cumulativeGPA.toFixed(2), icon: 'ri-bar-chart-line' },
    { label: 'Total Credits', value: String(profile.totalCreditHours), icon: 'ri-time-line' },
    { label: 'Academic Advisor', value: profile.academicAdvisorName ?? 'N/A', icon: 'ri-user-star-line' },
  ];

  const personalInfoRows: Array<{ label: string; value: string; icon: string }> = [
    { label: 'Email', value: profile.email, icon: 'ri-mail-line' },
    { label: 'Gender', value: profile.gender !== null && profile.gender !== undefined ? GENDER_LABELS[profile.gender as 0 | 1] : 'Not provided', icon: 'ri-user-line' },
    { label: 'Date of Birth', value: profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—', icon: 'ri-cake-line' },
    { label: 'National ID', value: profile.nationalId ?? '—', icon: 'ri-fingerprint-line' },
    { label: 'Nationality', value: profile.nationality ?? '—', icon: 'ri-flag-line' },
    { label: 'Religion', value: profile.religion ?? '—', icon: 'ri-heart-line' },
    { label: 'Qualification', value: profile.previousQualification ?? '—', icon: 'ri-file-certificate-line' },
  ];

  const editFields: Array<{ key: keyof UpdateStudentProfileRequest; label: string; icon: string; type?: string; placeholder?: string; options?: Array<{ label: string; value: string | number }> }> = [
    { key: 'phoneNumber', label: 'Phone Number', icon: 'ri-phone-line', type: 'tel', placeholder: '+20 1234567890' },
    { key: 'address', label: 'Address', icon: 'ri-map-pin-line', placeholder: '123 Elm Street' },
    { key: 'city', label: 'City', icon: 'ri-building-line', placeholder: 'Cairo' },
    { key: 'nationality', label: 'Nationality', icon: 'ri-flag-line', placeholder: 'Egyptian' },
    { key: 'gender', label: 'Gender', icon: 'ri-user-line', type: 'select', options: [{ label: 'Male', value: 0 }, { label: 'Female', value: 1 }] },
    { key: 'religion', label: 'Religion', icon: 'ri-heart-line', placeholder: 'Muslim' },
    { key: 'dateOfBirth', label: 'Date of Birth', icon: 'ri-cake-line', type: 'date' },
    { key: 'fatherPhone', label: "Father's Phone", icon: 'ri-phone-line', type: 'tel', placeholder: '+20 1098765432' },
    { key: 'fatherJob', label: "Father's Job", icon: 'ri-briefcase-line', placeholder: 'Engineer' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setShowPasswordModal(true); setMessage(null); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 text-xs font-medium transition-colors"
          >
            <i className="ri-lock-password-line" />
            Change Password
          </button>
          <button
            type="button"
            onClick={() => { setEditMode(!editMode); setMessage(null); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
          >
            <i className={editMode ? 'ri-close-line' : 'ri-edit-line'} />
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Avatar + Edit Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              {profile.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt={profile.fullName} className="w-full h-full rounded-full object-cover" />
              ) : (
                profile.fullName.charAt(0)
              )}
            </div>
            <h2 className="text-base font-bold text-slate-800">{profile.fullName}</h2>
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

          {/* Edit Form */}
          {editMode && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Edit Information</h3>
              <div className="space-y-3">
                {editFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">{field.label}</label>
                    <div className="relative">
                      <i className={`${field.icon} absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm`} />
                      {field.type === 'select' ? (
                        <select
                          value={form[field.key] ?? ''}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value === '' ? undefined : Number(e.target.value) })}
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 appearance-none"
                        >
                          <option value="" disabled>Select {field.label}</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type ?? 'text'}
                          value={form[field.key] ?? ''}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                        />
                      )}
                    </div>
                  </div>
                ))}
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

        {/* Right — Info Sections */}
        <div className="lg:col-span-2 space-y-4">
          {/* Academic Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Academic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {academicInfoRows.map((row) => (
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

          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {personalInfoRows.map((row) => (
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
            {/* Editable fields display */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Phone', value: profile.phoneNumber, icon: 'ri-phone-line' },
                { label: 'City', value: profile.city, icon: 'ri-building-line' },
                { label: 'Address', value: profile.address, icon: 'ri-map-pin-line' },
              ].map((row) => (
                <div key={row.label} className={`flex items-start gap-3 p-3 rounded-lg ${editMode ? 'bg-emerald-50/50 border border-emerald-100' : 'bg-gray-50'}`}>
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100">
                    <i className={`${row.icon} text-slate-400 text-sm`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {row.label}{editMode && <span className="ml-1 text-emerald-500">✎</span>}
                    </p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">{row.value ?? 'Not provided'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Family Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Family Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Father's Phone", value: profile.fatherPhone, icon: 'ri-phone-line' },
                { label: "Father's Job", value: profile.fatherJob, icon: 'ri-briefcase-line' },
              ].map((row) => (
                <div key={row.label} className={`flex items-start gap-3 p-3 rounded-lg ${editMode ? 'bg-emerald-50/50 border border-emerald-100' : 'bg-gray-50'}`}>
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100">
                    <i className={`${row.icon} text-slate-400 text-sm`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {row.label}{editMode && <span className="ml-1 text-emerald-500">✎</span>}
                    </p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">{row.value ?? 'Not provided'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <i className="ri-lock-password-line text-emerald-600" /> Change Password
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white"
              >
                <i className="ri-close-line" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">Current Password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">New Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">Min 8 chars, 1 upper, 1 lower, 1 number, 1 special char</p>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}