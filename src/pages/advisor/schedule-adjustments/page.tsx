import React, { useState, useCallback } from 'react';
import { fetchStudentScheduleForAdjustment, dropCourse, swapSection } from '@/lib/advisorPortalApi';
import type { GetStudentScheduleForAdjustmentResponse, AdjustableCourseDto, AdvisorStudentDto } from '@/types/advisor';
import { DAY_OF_WEEK_LABELS, SCHEDULE_TYPE_LABELS } from '@/lib/enums';
import StudentPicker from '@/components/advisor/StudentPicker';

export default function AdvisorScheduleAdjust() {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<GetStudentScheduleForAdjustmentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [swapModal, setSwapModal] = useState<AdjustableCourseDto | null>(null);
  const [dropModal, setDropModal] = useState<AdjustableCourseDto | null>(null);
  const [dropReason, setDropReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleStudentSelect = useCallback(async (studentId: number, _student: AdvisorStudentDto) => {
    if (!studentId) { setSchedule(null); setSelectedStudentId(null); return; }
    setSelectedStudentId(studentId);
    setLoading(true); setError(''); setSuccessMsg('');
    const res = await fetchStudentScheduleForAdjustment(studentId);
    if (res.data) { setSchedule(res.data); } else { setError(res.error || 'Could not load schedule'); setSchedule(null); }
    setLoading(false);
  }, []);

  const handleDrop = useCallback(async () => {
    if (!dropModal || !schedule) return;
    setActionLoading(dropModal.enrollmentId);
    const res = await dropCourse({ studentId: schedule.studentId, enrollmentId: dropModal.enrollmentId, reason: dropReason || undefined, notifyStudent: true });
    if (res.data) {
      setSuccessMsg(`Dropped: ${res.data.courseName}`);
      setDropModal(null); setDropReason('');
      // Reload schedule
      const reload = await fetchStudentScheduleForAdjustment(schedule.studentId);
      if (reload.data) setSchedule(reload.data);
    }
    setActionLoading(null);
  }, [dropModal, schedule, dropReason]);

  const handleSwap = useCallback(async (newCourseInstanceId: number) => {
    if (!swapModal || !schedule) return;
    setActionLoading(swapModal.enrollmentId);
    const res = await swapSection({ studentId: schedule.studentId, currentEnrollmentId: swapModal.enrollmentId, newCourseInstanceId });
    if (res.data) {
      setSuccessMsg(`Swapped: ${res.data.courseName} → ${res.data.newSectionInfo}`);
      setSwapModal(null);
      const reload = await fetchStudentScheduleForAdjustment(schedule.studentId);
      if (reload.data) setSchedule(reload.data);
    }
    setActionLoading(null);
  }, [swapModal, schedule]);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Schedule Adjustments</h1>

      {/* Student Selector */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Student</h3>
        <StudentPicker
          value={selectedStudentId}
          onChange={handleStudentSelect}
          placeholder="Search student by name or code..."
          className="max-w-md"
        />
        {loading && <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><i className="ri-loader-4-line animate-spin" />Loading schedule...</p>}
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        {successMsg && <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><i className="ri-check-line" />{successMsg}</p>}
      </div>

      {/* Schedule Display */}
      {schedule && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">{schedule.studentName}'s Schedule</h2>
              <p className="text-xs text-slate-500">{schedule.currentCreditHours} / {schedule.maxCreditHours} credit hours</p>
            </div>
            <div className="h-2 w-32 rounded-full bg-gray-100 overflow-hidden">
              <div className={`h-full rounded-full ${schedule.currentCreditHours >= schedule.maxCreditHours ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (schedule.currentCreditHours / schedule.maxCreditHours) * 100)}%` }} />
            </div>
          </div>

          <div className="space-y-3">
            {schedule.currentCourses.map((c: AdjustableCourseDto) => (
              <div key={c.enrollmentId} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-800">{c.courseName}</h3>
                      <span className="text-[10px] text-slate-400">{c.courseCode}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">{c.creditHours} CH</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{c.doctorName} · {c.sectionInfo}</p>
                    <div className="flex flex-wrap gap-2">
                      {c.scheduleSlots.map((slot, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-gray-50 text-[10px] text-slate-500">
                          {DAY_OF_WEEK_LABELS[slot.day as 0|1|2|3|4|5|6]} {slot.startTime?.substring(0,5)}–{slot.endTime?.substring(0,5)} ({SCHEDULE_TYPE_LABELS[slot.type as 0|1|2]}) — {slot.roomName}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {c.availableSectionsForSwap.length > 0 && (
                      <button type="button" onClick={() => setSwapModal(c)} className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">Swap</button>
                    )}
                    {c.canDrop && (
                      <button type="button" onClick={() => setDropModal(c)} className="px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap">Drop</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {schedule.currentCourses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-sm text-slate-500">No courses enrolled.</p>
            </div>
          )}
        </div>
      )}

      {!schedule && !loading && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-calendar-event-line text-3xl text-slate-400" /></div>
          <p className="text-sm text-slate-500">Enter a student ID to view and adjust their schedule.</p>
        </div>
      )}

      {/* Drop Modal */}
      {dropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-slate-800">Drop Course: {dropModal.courseName}</h2>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">This will drop <strong>{dropModal.courseCode}</strong> ({dropModal.creditHours} CH) from the student's schedule.</p>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Reason (optional)</label>
                <textarea value={dropReason} onChange={(e) => setDropReason(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none" placeholder="Reason for dropping..." />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => { setDropModal(null); setDropReason(''); }} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={handleDrop} disabled={actionLoading === dropModal.enrollmentId} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                  {actionLoading === dropModal.enrollmentId ? 'Dropping...' : 'Confirm Drop'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Swap Modal */}
      {swapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">Swap Section: {swapModal.courseName}</h2>
                <button type="button" onClick={() => setSwapModal(null)} className="text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Current: {swapModal.sectionInfo} — {swapModal.doctorName}</p>
            </div>
            <div className="p-5 space-y-3">
              {swapModal.availableSectionsForSwap.map((s) => (
                <div key={s.courseInstanceId} className="border border-gray-100 rounded-lg p-4 hover:border-amber-200 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{s.sectionInfo}</p>
                      <p className="text-xs text-slate-500">{s.doctorName} · {s.availableSeats} seats available</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {s.scheduleSlots.map((slot, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-gray-50 text-[10px] text-slate-500">
                            {DAY_OF_WEEK_LABELS[slot.day as 0|1|2|3|4|5|6]} {slot.startTime?.substring(0,5)}–{slot.endTime?.substring(0,5)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={() => handleSwap(s.courseInstanceId)} disabled={actionLoading !== null} className="px-3 py-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 disabled:opacity-50 whitespace-nowrap shrink-0">Select</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}