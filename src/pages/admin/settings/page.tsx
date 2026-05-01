import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '../../../components/base/ToastProvider';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';

interface RegistrationSettings {
  maxAllowedCredits: number;
  minAllowedCredits: number;
  allowWaitlist: boolean;
  registrationDeadlineDays: number;
  prerequisiteEnforcement: boolean;
  conflictDetection: boolean;
  autoApproveElectives: boolean;
}



export default function AdminSettings() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<RegistrationSettings>({
    maxAllowedCredits: 18,
    minAllowedCredits: 12,
    allowWaitlist: true,
    registrationDeadlineDays: 7,
    prerequisiteEnforcement: true,
    conflictDetection: true,
    autoApproveElectives: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<ApiResponse<RegistrationSettings>>('/api/admin/registration/settings')
      .then((res) => {
        if (res.data?.isSuccess && res.data?.hasData) {
          setSettings(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSetting = useCallback(<K extends keyof RegistrationSettings>(
    key: K,
    value: RegistrationSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await api.put<ApiResponse<boolean>>('/api/admin/registration/settings', settings);
      if (res.data?.isSuccess) {
        showToast('Settings saved successfully', 'success');
      } else {
        showToast(res.data?.error?.description || 'Save failed', 'error');
      }
    } catch {
      showToast('Save failed. Please try again.', 'error');
    }
    setSaving(false);
  }, [showToast]);

  return (
    <div className="animate-[fadeUp_0.3s_ease-out]">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">System Settings</h1>
          <p className="text-sm text-slate-500">Configure registration rules and system policies</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <i className="ri-loader-4-line animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <i className="ri-save-line" />
              Save Changes
            </span>
          )}
        </button>
      </div>

      {/* Registration Settings */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <i className="ri-edit-line text-slate-400" />
            Course Registration Rules
          </h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Max Allowed Credits</label>
            <input
              type="number"
              value={settings.maxAllowedCredits}
              onChange={(e) => updateSetting('maxAllowedCredits', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              min={1}
              max={30}
            />
            <p className="text-[10px] text-slate-400 mt-1">Maximum credit hours a student can register per semester</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Min Allowed Credits</label>
            <input
              type="number"
              value={settings.minAllowedCredits}
              onChange={(e) => updateSetting('minAllowedCredits', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              min={1}
              max={30}
            />
            <p className="text-[10px] text-slate-400 mt-1">Minimum credit hours to maintain full-time status</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Registration Deadline (Days)</label>
            <input
              type="number"
              value={settings.registrationDeadlineDays}
              onChange={(e) => updateSetting('registrationDeadlineDays', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              min={1}
              max={30}
            />
            <p className="text-[10px] text-slate-400 mt-1">Days before semester start to close registration</p>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <i className="ri-toggle-line text-slate-400" />
            Feature Toggles
          </h2>
        </div>
        <div className="p-5 space-y-4">
          {[
            { key: 'allowWaitlist' as const, label: 'Allow Waitlist', desc: 'Students can join waitlist when courses are full' },
            { key: 'prerequisiteEnforcement' as const, label: 'Enforce Prerequisites', desc: 'Block registration if prerequisite courses are not completed' },
            { key: 'conflictDetection' as const, label: 'Schedule Conflict Detection', desc: 'Prevent registration when time slots overlap' },
            { key: 'autoApproveElectives' as const, label: 'Auto-Approve Electives', desc: 'Skip advisor approval for elective course registrations' },
          ].map((toggle) => (
            <div key={toggle.key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700">{toggle.label}</p>
                <p className="text-[10px] text-slate-400">{toggle.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting(toggle.key, !settings[toggle.key])}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings[toggle.key] ? 'bg-slate-700' : 'bg-gray-300'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings[toggle.key] ? 'translate-x-5' : ''}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <i className="ri-information-line text-slate-400" />
            System Information
          </h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Version</p>
              <p className="text-sm font-semibold text-slate-700">v1.2.0</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Last Updated</p>
              <p className="text-sm font-semibold text-slate-700">June 2026</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Environment</p>
              <p className="text-sm font-semibold text-slate-700">Production</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}