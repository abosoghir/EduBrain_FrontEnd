import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { DoctorAttendanceSession, DoctorAttendanceStudent, RecordAttendanceRequest } from '@/types/doctor';

import { ATTENDANCE_STATUS_LABELS, SCHEDULE_TYPE_LABELS } from '@/lib/enums';

export default function DoctorAttendance() {
  const [sessions, setSessions] = useState<DoctorAttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<DoctorAttendanceSession | null>(null);
  const [students, setStudents] = useState<DoctorAttendanceStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    api.get<ApiResponse<DoctorAttendanceSession[]>>('/api/doctor/attendance/sessions')
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && res.data.data) {
          setSessions(res.data.data);
        } else {
          setSessions([]);
        }
      })
      .catch(() => {
        setSessions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOpenSession = useCallback((session: DoctorAttendanceSession) => {
    setSelectedSession(session);
    setMessage(null);
    api.get<ApiResponse<DoctorAttendanceStudent[]>>(`/api/doctor/attendance/sessions/${session.sessionId}/students`)
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && res.data.data) {
          setStudents(res.data.data);
        } else {
          setStudents([]);
        }
      })
      .catch(() => {
        setStudents([]);
      });
  }, []);

  const handleCloseSession = useCallback(() => {
    setSelectedSession(null);
    setStudents([]);
    setMessage(null);
  }, []);

  const updateStudentStatus = useCallback((studentId: string, status: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
  }, []);

  const handleSaveAttendance = useCallback(async () => {
    if (!selectedSession) return;
    setSaving(true);
    setMessage(null);
    const payload: RecordAttendanceRequest = {
      sessionId: selectedSession.sessionId,
      attendanceRecords: students.map((s) => ({ studentId: s.studentId, status: s.status })),
    };
    try {
      const res = await api.post<ApiResponse<null>>('/api/doctor/attendance', payload);
      if (res.data.isSuccess) {
        setMessage({ type: 'success', text: 'Attendance recorded successfully.' });
        setSessions((prev) =>
          prev.map((s) =>
            s.sessionId === selectedSession.sessionId
              ? { ...s, recordedCount: students.length, status: 1 }
              : s
          )
        );
      } else {
        setMessage({ type: 'error', text: res.data.error?.description || 'Failed to save attendance.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  }, [selectedSession, students]);

  const filteredSessions = useMemo(() => {
    if (filterStatus === 'all') return sessions;
    return sessions.filter((s) => (filterStatus === 'open' ? s.status === 0 : s.status === 1));
  }, [sessions, filterStatus]);

  const statusBadge = useCallback((status: number) => {
    const map: Record<number, string> = {
      0: 'bg-emerald-50 text-emerald-600',
      1: 'bg-red-50 text-red-600',
      2: 'bg-amber-50 text-amber-600',
    };
    return map[status] || 'bg-gray-50 text-gray-600';
  }, []);

  const quickStats = useMemo(() => {
    if (!students.length) return null;
    const present = students.filter((s) => s.status === 0).length;
    const absent = students.filter((s) => s.status === 1).length;
    const late = students.filter((s) => s.status === 2).length;
    return { present, absent, late, total: students.length };
  }, [students]);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Attendance Recording</h1>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading sessions...
        </div>
      )}

      {/* Session Recording Panel */}
      {selectedSession && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">
                {selectedSession.courseName} · {selectedSession.courseCode}
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {new Date(selectedSession.date).toLocaleDateString()} · {selectedSession.startTime} · {SCHEDULE_TYPE_LABELS[selectedSession.scheduleType as 0 | 1 | 2]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {message && (
                <span className={`text-xs px-2 py-1 rounded-md ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {message.text}
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors disabled:opacity-60"
              >
                {saving ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-save-line" />}
                Save Attendance
              </button>
              <button
                type="button"
                onClick={handleCloseSession}
                className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center"
              >
                <i className="ri-close-line text-slate-500" />
              </button>
            </div>
          </div>

          {/* Quick stats */}
          {quickStats && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-emerald-600">{quickStats.present}</p>
                <p className="text-[10px] text-emerald-500">Present</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-red-600">{quickStats.absent}</p>
                <p className="text-[10px] text-red-500">Absent</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-amber-600">{quickStats.late}</p>
                <p className="text-[10px] text-amber-500">Late</p>
              </div>
            </div>
          )}

          {/* Student list */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="text-center px-4 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Present</th>
                  <th className="text-center px-4 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Absent</th>
                  <th className="text-center px-4 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Late</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr key={s.studentId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600">
                          {s.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{s.studentName}</p>
                          <p className="text-[10px] text-slate-400">{s.studentCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => updateStudentStatus(s.studentId, 0)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          s.status === 0 ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-200' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <i className="ri-check-line" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => updateStudentStatus(s.studentId, 1)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          s.status === 1 ? 'bg-red-100 text-red-600 ring-2 ring-red-200' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <i className="ri-close-line" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => updateStudentStatus(s.studentId, 2)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          s.status === 2 ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-200' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <i className="ri-time-line" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Attendance Sessions</h2>
          <div className="flex gap-1">
            {['all', 'open', 'closed'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterStatus(f)}
                className={`px-3 py-1 rounded-md text-[10px] font-medium capitalize transition-colors ${
                  filterStatus === f ? 'bg-violet-600 text-white' : 'bg-gray-50 text-slate-500 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Recorded</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSessions.map((s) => (
                <tr key={s.sessionId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-700">{s.courseName}</p>
                    <p className="text-[10px] text-slate-400">{s.courseCode}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">
                    {new Date(s.date).toLocaleDateString()} · {s.startTime}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-[10px] text-slate-400">{SCHEDULE_TYPE_LABELS[s.scheduleType as 0 | 1 | 2]}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs text-slate-600">
                      {s.recordedCount}/{s.totalStudents}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      s.status === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {s.status === 0 ? 'Open' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenSession(s)}
                      className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                    >
                      {s.status === 0 ? 'Record' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filteredSessions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-400">No attendance sessions found.</p>
        </div>
      )}
    </div>
  );
}