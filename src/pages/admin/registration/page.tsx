import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchRegistrationSettings,
  updateRegistrationSettings,
  openRegistrationWindow,
  closeRegistrationWindow,
  fetchRegistrationActivityLog,
  fetchSemesterOptions,
} from '@/lib/adminApi';
import type {
  RegistrationSettings,
  OpenRegistrationWindowForm,
  UpdateRegistrationSettingsForm,
  RegistrationActivityLogItem,
  RegistrationActivityLogResponse,
  RegistrationActivityLogParams,
  SemesterOption,
} from '@/types/admin';
import { ENROLLMENT_STATUS_LABELS, EnrollmentStatus } from '@/lib/enums';

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

type Tab = 'overview' | 'activity';

export default function AdminRegistration() {
  const [tab, setTab] = useState<Tab>('overview');
  const [settings, setSettings] = useState<RegistrationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);

  // Modals
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Open form
  const [openForm, setOpenForm] = useState<OpenRegistrationWindowForm>({ semesterId: 0, startDate: '', endDate: '' });
  // Settings form
  const [settingsForm, setSettingsForm] = useState<UpdateRegistrationSettingsForm>({ semesterId: 0 });

  // Activity log
  const [activityLog, setActivityLog] = useState<RegistrationActivityLogResponse | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityParams, setActivityParams] = useState<RegistrationActivityLogParams>({ page: 1, pageSize: 50 });

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const res = await fetchRegistrationSettings();
    if (res.data) setSettings(res.data);
    else setSettings(null);
    setLoading(false);
  }, []);

  const loadActivityLog = useCallback(async (params: RegistrationActivityLogParams) => {
    setActivityLoading(true);
    const res = await fetchRegistrationActivityLog(params);
    if (res.data) setActivityLog(res.data);
    setActivityLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
    fetchSemesterOptions().then(setSemesters);
  }, [loadSettings]);

  useEffect(() => {
    if (tab === 'activity') loadActivityLog(activityParams);
  }, [tab, activityParams, loadActivityLog]);

  const handleOpenWindow = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Ensure dates are sent in ISO 8601 UTC format
    const payload = {
      ...openForm,
      startDate: new Date(openForm.startDate).toISOString(),
      endDate: new Date(openForm.endDate).toISOString()
    };

    const res = await openRegistrationWindow(payload);
    setSubmitting(false);
    if (res.success) { showToast('Registration window opened'); setShowOpenModal(false); loadSettings(); }
    else showToast(res.error || 'Failed', false);
  };

  const handleCloseWindow = async () => {
    if (!settings) return;
    setSubmitting(true);
    const res = await closeRegistrationWindow(settings.semesterId);
    setSubmitting(false);
    if (res.success) { showToast('Registration closed'); setShowCloseConfirm(false); loadSettings(); }
    else showToast(res.error || 'Failed', false);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await updateRegistrationSettings(settingsForm);
    setSubmitting(false);
    if (res.success) { showToast('Settings updated'); setShowSettingsModal(false); loadSettings(); }
    else showToast(res.error || 'Failed', false);
  };

  const openSettingsEditor = () => {
    if (!settings) return;
    setSettingsForm({
      semesterId: settings.semesterId,
      minCreditHours: settings.minCreditHours,
      maxCreditHours: settings.maxCreditHours,
      allowWaitlist: settings.allowWaitlist,
    });
    setShowSettingsModal(true);
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Registration Management</h1>
          <p className="text-sm text-slate-500">Control registration windows, settings, and monitor activity</p>
        </div>
        <div className="flex items-center gap-2">
          {settings?.isOpen ? (
            <button type="button" onClick={() => setShowCloseConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
              <i className="ri-close-circle-line" /> Close Registration
            </button>
          ) : (
            <button type="button" onClick={() => setShowOpenModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              <i className="ri-checkbox-circle-line" /> Open Registration
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${toast.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <i className={toast.ok ? 'ri-check-line' : 'ri-error-warning-line'} /> {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {([['overview', 'Overview'], ['activity', 'Activity Log']] as [Tab, string][]).map(([key, label]) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading && <div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading...</div>}

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && settings && (
        <>
          {/* Status Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Current Semester</p>
                <h2 className="text-lg font-bold text-slate-800">{settings.semesterName}</h2>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${settings.isOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'}`}>
                <i className={`${settings.isOpen ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'} mr-1`} />
                {settings.statusDisplay}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Opens</p>
                <p className="text-sm font-semibold text-slate-800">{settings.registrationOpenDate ? new Date(settings.registrationOpenDate).toLocaleDateString() : '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Closes</p>
                <p className="text-sm font-semibold text-slate-800">{settings.registrationCloseDate ? new Date(settings.registrationCloseDate).toLocaleDateString() : '—'}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-[10px] text-blue-500 uppercase tracking-wider mb-1">Days Remaining</p>
                <p className="text-sm font-semibold text-blue-800">{settings.isOpen ? settings.daysRemaining : '—'}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-[10px] text-amber-500 uppercase tracking-wider mb-1">Registered Students</p>
                <p className="text-sm font-semibold text-amber-800">{settings.totalRegisteredStudents.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total Enrollments</p>
              <p className="text-xl font-bold text-slate-800">{settings.totalEnrollments.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Waitlisted</p>
              <p className="text-xl font-bold text-amber-600">{settings.waitlistedEnrollments.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Not Yet Registered</p>
              <p className="text-xl font-bold text-rose-600">{settings.studentsNotYetRegistered.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Courses w/ Waitlist</p>
              <p className="text-xl font-bold text-slate-800">{settings.coursesWithWaitlist}</p>
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-700">Registration Settings</h2>
              <button type="button" onClick={openSettingsEditor}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-gray-50 border border-gray-200 transition-colors">
                <i className="ri-edit-line" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Min Credit Hours</p>
                <p className="text-lg font-semibold text-slate-800">{settings.minCreditHours}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Max Credit Hours</p>
                <p className="text-lg font-semibold text-slate-800">{settings.maxCreditHours}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Waitlist</p>
                <p className="text-lg font-semibold text-slate-800">{settings.allowWaitlist ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'overview' && !loading && !settings && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-edit-box-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">No active registration period</p>
          <p className="text-xs text-slate-400 mb-4">Open registration to allow students to enroll in courses</p>
          <button type="button" onClick={() => setShowOpenModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            Open Registration
          </button>
        </div>
      )}

      {/* ── ACTIVITY LOG TAB ── */}
      {tab === 'activity' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div>
              <label className={labelCls}>Status</label>
              <select value={activityParams.status ?? ''} onChange={e => setActivityParams(p => ({ ...p, status: e.target.value ? Number(e.target.value) : undefined, page: 1 }))} className={`${inputCls} w-36`}>
                <option value="">All</option>
                {Object.entries(ENROLLMENT_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>From</label>
              <input type="date" value={activityParams.fromDate ?? ''} onChange={e => setActivityParams(p => ({ ...p, fromDate: e.target.value || undefined, page: 1 }))} className={`${inputCls} w-36`} />
            </div>
            <div>
              <label className={labelCls}>To</label>
              <input type="date" value={activityParams.toDate ?? ''} onChange={e => setActivityParams(p => ({ ...p, toDate: e.target.value || undefined, page: 1 }))} className={`${inputCls} w-36`} />
            </div>
          </div>

          {activityLoading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center"><i className="ri-loader-4-line animate-spin" /> Loading...</div>
          ) : !activityLog || activityLog.items.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No activity found</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-2 text-slate-400 font-medium">Student</th>
                      <th className="text-left py-2 px-2 text-slate-400 font-medium">Course</th>
                      <th className="text-left py-2 px-2 text-slate-400 font-medium">Section</th>
                      <th className="text-left py-2 px-2 text-slate-400 font-medium">Doctor</th>
                      <th className="text-left py-2 px-2 text-slate-400 font-medium">Credits</th>
                      <th className="text-left py-2 px-2 text-slate-400 font-medium">Status</th>
                      <th className="text-left py-2 px-2 text-slate-400 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLog.items.map((item) => (
                      <tr key={item.enrollmentId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-2.5 px-2">
                          <p className="font-medium text-slate-700">{item.studentName}</p>
                          <p className="text-[10px] text-slate-400">{item.studentCode}</p>
                        </td>
                        <td className="py-2.5 px-2">
                          <p className="text-slate-700">{item.courseName}</p>
                          <p className="text-[10px] text-slate-400">{item.courseCode}</p>
                        </td>
                        <td className="py-2.5 px-2 text-slate-600">{item.sectionName}</td>
                        <td className="py-2.5 px-2 text-slate-600">{item.doctorName}</td>
                        <td className="py-2.5 px-2 text-slate-600">{item.creditHours}</td>
                        <td className="py-2.5 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.status === EnrollmentStatus.Enrolled ? 'bg-emerald-50 text-emerald-700' :
                            item.status === EnrollmentStatus.Waitlisted ? 'bg-amber-50 text-amber-700' :
                            item.status === EnrollmentStatus.Dropped ? 'bg-red-50 text-red-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>{item.statusDisplay}</span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-400">{timeAgo(item.activityDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-slate-400">{activityLog.totalCount.toLocaleString()} total records</p>
                <div className="flex items-center gap-1">
                  <button type="button" disabled={!activityLog.hasPreviousPage} onClick={() => setActivityParams(p => ({ ...p, page: (p.page ?? 1) - 1 }))}
                    className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">Prev</button>
                  <span className="text-xs text-slate-500 px-2">Page {activityLog.pageNumber} of {activityLog.totalPages}</span>
                  <button type="button" disabled={!activityLog.hasNextPage} onClick={() => setActivityParams(p => ({ ...p, page: (p.page ?? 1) + 1 }))}
                    className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── OPEN REGISTRATION MODAL ── */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Open Registration Window</h2>
              <button type="button" onClick={() => setShowOpenModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleOpenWindow} className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Semester *</label>
                <select required value={openForm.semesterId || ''} onChange={e => setOpenForm(p => ({ ...p, semesterId: Number(e.target.value) }))} className={inputCls}>
                  <option value="">Select semester...</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Start Date *</label>
                  <input type="datetime-local" required value={openForm.startDate} onChange={e => setOpenForm(p => ({ ...p, startDate: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>End Date *</label>
                  <input type="datetime-local" required value={openForm.endDate} onChange={e => setOpenForm(p => ({ ...p, endDate: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowOpenModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting || !openForm.semesterId || !openForm.startDate || !openForm.endDate}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Opening...</span> : 'Open Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SETTINGS MODAL ── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Edit Registration Settings</h2>
              <button type="button" onClick={() => setShowSettingsModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleUpdateSettings} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Min Credit Hours</label>
                  <input type="number" min={1} value={settingsForm.minCreditHours ?? ''} onChange={e => setSettingsForm(p => ({ ...p, minCreditHours: Number(e.target.value) }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Max Credit Hours</label>
                  <input type="number" min={1} value={settingsForm.maxCreditHours ?? ''} onChange={e => setSettingsForm(p => ({ ...p, maxCreditHours: Number(e.target.value) }))} className={inputCls} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="allowWaitlist" checked={settingsForm.allowWaitlist ?? false} onChange={e => setSettingsForm(p => ({ ...p, allowWaitlist: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                <label htmlFor="allowWaitlist" className="text-sm text-slate-700">Allow Waitlist</label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSettingsModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  {submitting ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CLOSE CONFIRM ── */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4"><i className="ri-close-circle-line text-amber-500 text-xl" /></div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Close Registration?</h3>
            <p className="text-xs text-slate-500 mb-5">Students will no longer be able to register for courses. This can be re-opened later.</p>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setShowCloseConfirm(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleCloseWindow} disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                {submitting ? 'Closing...' : 'Close Registration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
