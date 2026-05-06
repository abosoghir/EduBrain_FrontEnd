import React, { useEffect, useState, useCallback } from 'react';
import { fetchDoctorAnnouncements, createAnnouncement, fetchDoctorCourses } from '@/lib/doctorPortalApi';
import type { DoctorAnnouncement, CreateAnnouncementRequest, DoctorCourse } from '@/types/doctor';
import { NOTIFICATION_TYPE_LABELS } from '@/lib/enums';

// NotificationType options valid for doctor
const ANNOUNCEMENT_TYPES = [
  { id: 0, label: 'Lecture Cancelled' },
  { id: 1, label: 'Exam Reminder' },
  { id: 3, label: 'General Announcement' },
  { id: 8, label: 'Quiz Added' },
  { id: 9, label: 'Schedule Changed' },
];

// AnnouncementTarget: 0=AllMyStudents, 1=SpecificCourse, 2=SpecificStudents
const TARGET_OPTIONS = [
  { id: 0, label: 'All My Students', icon: 'ri-team-line' },
  { id: 1, label: 'Specific Course', icon: 'ri-book-line' },
];

const EMPTY_FORM: CreateAnnouncementRequest = {
  title: '',
  message: '',
  type: 3,
  target: 0,
  courseInstanceId: null,
  studentIds: null,
  sendInApp: true,
  sendEmail: false,
  sendSms: false,
};

function typeBadge(type: number): string {
  const map: Record<number, string> = {
    0: 'bg-red-50 text-red-600',
    1: 'bg-blue-50 text-blue-600',
    3: 'bg-violet-50 text-violet-600',
    8: 'bg-amber-50 text-amber-600',
    9: 'bg-emerald-50 text-emerald-600',
  };
  return map[type] ?? 'bg-gray-50 text-gray-600';
}

export default function DoctorAnnouncements() {
  const [announcements, setAnnouncements] = useState<DoctorAnnouncement[]>([]);
  const [sentToday, setSentToday] = useState(0);
  const [courses, setCourses] = useState<DoctorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState<CreateAnnouncementRequest>(EMPTY_FORM);

  useEffect(() => {
    fetchDoctorAnnouncements().then(({ data }) => {
      if (data) {
        setAnnouncements(data.items);
        setSentToday(data.sentToday);
      }
    }).finally(() => setLoading(false));

    fetchDoctorCourses().then(({ data }) => {
      if (data) setCourses(data.courses);
    });
  }, []);

  const handleCreate = useCallback(async () => {
    if (!form.title.trim() || !form.message.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    if (form.target === 1 && !form.courseInstanceId) {
      setMessage({ type: 'error', text: 'Please select a course.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    const { data, error } = await createAnnouncement(form);
    if (data) {
      // Reload announcements
      const { data: refreshed } = await fetchDoctorAnnouncements();
      if (refreshed) { setAnnouncements(refreshed.items); setSentToday(refreshed.sentToday); }
      setForm(EMPTY_FORM);
      setShowForm(false);
      setMessage({ type: 'success', text: `Announcement sent to ${data.recipientsCount} students!` });
    } else {
      setMessage({ type: 'error', text: error ?? 'Failed to send announcement.' });
    }
    setSaving(false);
  }, [form]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Announcements</h1>
          <p className="text-xs text-slate-400 mt-0.5">Sent today: {sentToday}</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm(!showForm); setMessage(null); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors"
        >
          <i className={showForm ? 'ri-close-line' : 'ri-add-line'} />
          {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {/* Message banner */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
          {message.text}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">New Announcement</h2>
          <div className="space-y-4">

            {/* Title */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={200}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                placeholder="Announcement title..."
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">Type</label>
              <div className="flex gap-2 flex-wrap">
                {ANNOUNCEMENT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm({ ...form, type: t.id })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.type === t.id ? 'bg-violet-600 text-white' : 'bg-gray-50 text-slate-600 hover:bg-gray-100'
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">Target Audience</label>
              <div className="flex gap-2">
                {TARGET_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm({ ...form, target: t.id, courseInstanceId: null })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.target === t.id ? 'bg-violet-600 text-white' : 'bg-gray-50 text-slate-600 hover:bg-gray-100'
                      }`}
                  >
                    <i className={t.icon} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Course selector — shown only when target = SpecificCourse */}
            {form.target === 1 && (
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">Select Course *</label>
                <select
                  value={form.courseInstanceId ?? ''}
                  onChange={(e) => setForm({ ...form, courseInstanceId: Number(e.target.value) || null })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                >
                  <option value="">Select a course...</option>
                  {courses.map((c) => (
                    <option key={c.courseInstanceId} value={c.courseInstanceId}>
                      {c.courseCode} — {c.courseName}
                    </option>
                  ))}
                </select>
                {form.courseInstanceId && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    This will be sent to all students in the selected course.
                  </p>
                )}
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 resize-none"
                placeholder="Write your announcement..."
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">{form.message.length}/2000</p>
            </div>

            {/* Delivery channels */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">Delivery Channels</label>
              <div className="flex gap-3">
                {[
                  { key: 'sendInApp' as const, label: 'In-App', icon: 'ri-notification-line', locked: true },
                  { key: 'sendEmail' as const, label: 'Email', icon: 'ri-mail-line', locked: false },
                  { key: 'sendSms' as const, label: 'SMS', icon: 'ri-message-line', locked: false },
                ].map((ch) => (
                  <button
                    key={ch.key}
                    type="button"
                    disabled={ch.locked}
                    onClick={() => !ch.locked && setForm({ ...form, [ch.key]: !form[ch.key] })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form[ch.key] ? 'bg-violet-600 text-white' : 'bg-gray-50 text-slate-500 hover:bg-gray-100'
                      } ${ch.locked ? 'cursor-not-allowed opacity-70' : ''}`}
                  >
                    <i className={ch.icon} />
                    {ch.label}
                    {ch.locked && <i className="ri-lock-line text-[10px]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors disabled:opacity-60"
              >
                {saving ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-send-plane-line" />}
                Send Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading announcements...
        </div>
      )}

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${typeBadge(a.type)}`}>
                <i className="ri-megaphone-line text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-800">{a.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeBadge(a.type)}`}>
                    {a.typeDisplay || NOTIFICATION_TYPE_LABELS[a.type as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9]}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <i className="ri-calendar-line" />
                    {new Date(a.sentDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ri-focus-line" />
                    {a.target}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ri-user-line" />
                    {a.recipientsCount} recipients
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && announcements.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-megaphone-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No announcements yet.</p>
        </div>
      )}
    </div>
  );
}