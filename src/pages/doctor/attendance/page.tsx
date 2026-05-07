import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchDoctorCourses, fetchAttendanceSession, submitAttendance } from '@/lib/doctorPortalApi';
import type { DoctorCourse, DoctorAttendanceStudent, RecordAttendanceRequest } from '@/types/doctor';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

const STATUS_STYLE: Record<number, string> = {
  0: 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-200',
  1: 'bg-red-100 text-red-600 ring-2 ring-red-200',
  2: 'bg-amber-100 text-amber-600 ring-2 ring-amber-200',
};
const STATUS_IDLE = 'bg-gray-50 text-gray-300 hover:bg-gray-100';

// Local state type for tracking attendance marks (currentStatus can start null)
interface StudentMark {
  studentId: number;
  studentCode: string;
  studentName: string;
  profilePictureUrl: string | null;
  status: number; // 0=Present, 1=Absent, 2=Late (we default null → 0 for UI)
}

export default function DoctorAttendance() {
  const [courses, setCourses] = useState<DoctorCourse[]>([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);

  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const [students, setStudents] = useState<StudentMark[]>([]);
  const [isAttendanceTaken, setIsAttendanceTaken] = useState(false);
  const [sessionWeekNumber, setSessionWeekNumber] = useState(1);
  const [sessionCourseName, setSessionCourseName] = useState('');
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load courses on mount
  useEffect(() => {
    fetchDoctorCourses().then(({ data }) => {
      setCourses(data?.courses ?? []);
      setCoursesLoaded(true);
    });
  }, []);

  const loadSession = useCallback(async () => {
    if (!selectedCourseId || !selectedDate) return;
    setSessionLoading(true);
    setSessionLoaded(false);
    setMessage(null);
    const { data, error } = await fetchAttendanceSession(Number(selectedCourseId), selectedDate);
    if (data) {
      // Map API students (currentStatus can be null) to local state
      setStudents(data.students.map((s: DoctorAttendanceStudent) => ({
        studentId: s.studentId,
        studentCode: s.studentCode,
        studentName: s.studentName,
        profilePictureUrl: s.profilePictureUrl,
        status: s.currentStatus ?? 0, // Default unset → Present
      })));
      setIsAttendanceTaken(data.attendanceAlreadyTaken);
      setSessionWeekNumber(data.weekNumber);
      setSessionCourseName(data.courseName);
    } else {
      setStudents([]);
      setMessage({ type: 'error', text: error ?? 'Failed to load session.' });
    }
    setSessionLoading(false);
    setSessionLoaded(true);
  }, [selectedCourseId, selectedDate]);

  const updateStatus = useCallback((studentId: number, status: number) => {
    setStudents((prev) => prev.map((s) => (s.studentId === studentId ? { ...s, status } : s)));
  }, []);

  const markAll = useCallback((status: number) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedCourseId || !selectedDate) return;
    setSaving(true);
    setMessage(null);
    const payload: RecordAttendanceRequest = {
      courseInstanceId: Number(selectedCourseId),
      date: selectedDate,
      weekNumber: sessionWeekNumber,
      students: students.map((s) => ({ studentId: s.studentId, status: s.status })),
    };
    const { success, message: msg, error } = await submitAttendance(payload);
    if (success) {
      setIsAttendanceTaken(true);
      setMessage({ type: 'success', text: msg ?? 'Attendance saved successfully!' });
    } else {
      setMessage({ type: 'error', text: error ?? 'Failed to save attendance.' });
    }
    setSaving(false);
  }, [selectedCourseId, selectedDate, sessionWeekNumber, students]);

  const quickStats = useMemo(() => {
    if (!students.length) return null;
    return {
      present: students.filter((s) => s.status === 0).length,
      absent: students.filter((s) => s.status === 1).length,
      late: students.filter((s) => s.status === 2).length,
      total: students.length,
    };
  }, [students]);

  const isPastDate = selectedDate < todayISO();

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Take Attendance</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">Course *</label>
            <select
              value={selectedCourseId}
              onChange={(e) => { setSelectedCourseId(e.target.value ? Number(e.target.value) : ''); setSessionLoaded(false); setStudents([]); }}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
            >
              <option value="">
                {coursesLoaded ? 'Select a course...' : 'Loading courses...'}
              </option>
              {courses.map((c) => (
                <option key={c.courseInstanceId} value={c.courseInstanceId}>
                  {c.courseCode} — {c.courseName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">Date *</label>
            <input
              type="date"
              value={selectedDate}
              max={todayISO()}
              onChange={(e) => { setSelectedDate(e.target.value); setSessionLoaded(false); setStudents([]); }}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </div>
          <button
            type="button"
            onClick={loadSession}
            disabled={!selectedCourseId || !selectedDate || sessionLoading}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            {sessionLoading ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-search-line" />}
            Load Session
          </button>
        </div>
      </div>

      {/* Session info + warnings */}
      {sessionLoaded && sessionCourseName && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 text-xs text-slate-600">
            <i className="ri-information-line text-violet-500" />
            <span className="font-medium">{sessionCourseName}</span>
            <span className="text-slate-400">·</span>
            <span>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="text-slate-400">·</span>
            <span>Week {sessionWeekNumber}</span>
            {isAttendanceTaken && (
              <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium text-[10px]">
                ✅ Attendance Taken
              </span>
            )}
            {!isAttendanceTaken && (
              <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium text-[10px]">
                ⏳ Not Taken Yet
              </span>
            )}
          </div>
          {isPastDate && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
              <i className="ri-error-warning-line" />
              You are recording attendance for a past date.
            </div>
          )}
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
          {message.text}
        </div>
      )}

      {/* Attendance table */}
      {sessionLoaded && students.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {quickStats && (
                <>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium">{quickStats.present} Present</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-medium">{quickStats.absent} Absent</span>
                  {quickStats.late > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-medium">{quickStats.late} Late</span>}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => markAll(0)} className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-medium hover:bg-emerald-100 transition-colors">
                Mark All Present
              </button>
              <button type="button" onClick={() => markAll(1)} className="px-3 py-1 rounded-md bg-red-50 text-red-600 text-[10px] font-medium hover:bg-red-100 transition-colors">
                Mark All Absent
              </button>
            </div>
          </div>

          {/* Student rows */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Present</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Absent</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Late</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s, idx) => (
                  <tr key={s.studentId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-xs text-slate-400">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {s.profilePictureUrl ? (
                          <img src={s.profilePictureUrl} alt={s.studentName} className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600">
                            {s.studentName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-700">{s.studentName}</p>
                          <p className="text-[10px] text-slate-400">{s.studentCode}</p>
                        </div>
                      </div>
                    </td>
                    {([0, 1, 2] as const).map((status) => (
                      <td key={status} className="px-5 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => updateStatus(s.studentId, status)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${s.status === status ? STATUS_STYLE[status] : STATUS_IDLE
                            }`}
                        >
                          <i className={status === 0 ? 'ri-check-line' : status === 1 ? 'ri-close-line' : 'ri-time-line'} />
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save bar */}
          <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors disabled:opacity-60"
            >
              {saving ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-save-line" />}
              Save Attendance
            </button>
          </div>
        </div>
      )}

      {sessionLoaded && students.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <i className="ri-group-line text-xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">No enrolled students found for this session.</p>
        </div>
      )}
    </div>
  );
}