import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStudentProfile, sendStudentMessage } from '@/lib/advisorPortalApi';
import type { StudentProfileForAdvisor } from '@/types/advisor';
import { YEAR_LEVEL_LABELS, WARNING_STATUS_LABELS, PAYMENT_STATUS_LABELS, ENROLLMENT_STATUS_LABELS, DAY_OF_WEEK_LABELS, SCHEDULE_TYPE_LABELS, WarningStatus, PaymentStatus } from '@/lib/enums';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'ri-information-line' },
  { id: 'courses', label: 'Schedule', icon: 'ri-book-line' },
  { id: 'attendance', label: 'Attendance', icon: 'ri-check-double-line' },
  { id: 'warnings', label: 'Warnings', icon: 'ri-alert-line' },
  { id: 'fees', label: 'Fees', icon: 'ri-money-dollar-circle-line' },
];

export default function AdvisorStudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfileForAdvisor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMessage, setShowMessage] = useState(false);
  const [msgForm, setMsgForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchStudentProfile(Number(id))
      .then((res) => setStudent(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const goBack = useCallback(() => navigate('/advisor/students'), [navigate]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSending(true);
    const res = await sendStudentMessage(Number(id), msgForm);
    if (res.success) {
      setShowMessage(false);
      setMsgForm({ subject: '', message: '' });
    }
    setSending(false);
  }, [id, msgForm]);

  if (loading) return <div className="flex items-center gap-2 text-slate-400 text-sm"><i className="ri-loader-4-line animate-spin" /> Loading student details...</div>;
  if (!student) return <div className="text-center py-12"><p className="text-sm text-slate-500">Failed to load student details.</p><button type="button" onClick={goBack} className="mt-4 text-sm text-amber-600 hover:underline">Back to Students</button></div>;

  const warningLevelBadge = (level: number) => {
    const map: Record<number, string> = { 1: 'bg-amber-50 text-amber-600', 2: 'bg-orange-50 text-orange-600', 3: 'bg-red-50 text-red-600' };
    return map[level] || 'bg-gray-50 text-gray-600';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={goBack} className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
            <i className="ri-arrow-left-line text-slate-500" />
          </button>
          <div className="flex items-center gap-3">
            {student.profilePictureUrl ? (
              <img src={student.profilePictureUrl} alt={student.studentName} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white text-lg font-bold">{student.studentName.charAt(0)}</div>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-800">{student.studentName}</h1>
              <p className="text-xs text-slate-500">
                {student.studentCode} · {student.departmentName} · {YEAR_LEVEL_LABELS[student.yearLevel as 0 | 1 | 2 | 3]}
                {student.isOnAcademicProbation && <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600">On Probation</span>}
              </p>
            </div>
          </div>
        </div>
        <button type="button" onClick={() => setShowMessage(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors whitespace-nowrap">
          <i className="ri-mail-line" /> Message
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Cumulative GPA', value: student.cumulativeGPA.toFixed(2), icon: 'ri-bar-chart-line', color: student.cumulativeGPA >= 3.5 ? 'text-emerald-600 bg-emerald-50' : student.cumulativeGPA >= 2.5 ? 'text-slate-600 bg-slate-50' : 'text-red-600 bg-red-50' },
          { label: 'Credit Hours', value: student.totalCreditHours, icon: 'ri-time-line', color: 'text-blue-600 bg-blue-50' },
          { label: 'Attendance', value: student.overallAttendancePercentage != null ? `${student.overallAttendancePercentage}%` : '—', icon: 'ri-check-double-line', color: (student.overallAttendancePercentage ?? 0) >= 80 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50' },
          { label: 'Warnings', value: student.warnings.length, icon: 'ri-alert-line', color: student.warnings.length > 0 ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}><i className={`${s.icon} text-sm`} /></div>
            </div>
            <p className="text-xl font-bold text-slate-800">{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-50 p-1 rounded-lg w-fit overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <i className={tab.icon} />{tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Student Information</h3>
            <div className="space-y-3">
              {[
                { label: 'Email', value: student.email, icon: 'ri-mail-line' },
                { label: 'Phone', value: student.phoneNumber || 'Not provided', icon: 'ri-phone-line' },
                { label: 'Department', value: student.departmentName, icon: 'ri-building-line' },
                { label: 'Year Level', value: YEAR_LEVEL_LABELS[student.yearLevel as 0 | 1 | 2 | 3], icon: 'ri-stairs-line' },
                { label: 'Total Credit Hours', value: String(student.totalCreditHours), icon: 'ri-time-line' },
                { label: 'Current Semester GPA', value: student.currentSemesterGPA != null ? student.currentSemesterGPA.toFixed(2) : '—', icon: 'ri-bar-chart-line' },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
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

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Academic Summary</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">GPA</span>
                  <span className={`text-sm font-bold ${student.cumulativeGPA >= 3.5 ? 'text-emerald-600' : student.cumulativeGPA >= 2.5 ? 'text-amber-600' : 'text-red-600'}`}>{student.cumulativeGPA.toFixed(2)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${student.cumulativeGPA >= 3.5 ? 'bg-emerald-500' : student.cumulativeGPA >= 2.5 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${(student.cumulativeGPA / 4) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Attendance</span>
                  <span className={`text-sm font-bold ${(student.overallAttendancePercentage ?? 0) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{student.overallAttendancePercentage ?? 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${(student.overallAttendancePercentage ?? 0) >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${student.overallAttendancePercentage ?? 0}%` }} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <p className="text-lg font-bold text-slate-800">{student.currentSchedule.length}</p>
                    <p className="text-[10px] text-slate-400">Current Courses</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <p className="text-lg font-bold text-slate-800">{student.warnings.filter(w => w.status === 0).length}</p>
                    <p className="text-[10px] text-slate-400">Active Warnings</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <p className={`text-lg font-bold ${student.currentSemesterFees && student.currentSemesterFees.remainingAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {student.currentSemesterFees ? (student.currentSemesterFees.remainingAmount > 0 ? `${student.currentSemesterFees.remainingAmount.toLocaleString()} EGP` : 'Paid') : '—'}
                    </p>
                    <p className="text-[10px] text-slate-400">Fee Balance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-slate-700">Current Schedule</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Section</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Schedule</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {student.currentSchedule.map((c) => (
                  <tr key={c.enrollmentId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-700">{c.courseName}</p>
                      <p className="text-[10px] text-slate-400">{c.courseCode}</p>
                    </td>
                    <td className="px-5 py-3 text-center text-xs text-slate-600">{c.doctorName}</td>
                    <td className="px-5 py-3 text-center text-xs text-slate-600">{c.sectionInfo}</td>
                    <td className="px-5 py-3 text-center">
                      <div className="space-y-1">
                        {c.scheduleSlots.map((slot, i) => (
                          <div key={i} className="text-[10px] text-slate-500">
                            {DAY_OF_WEEK_LABELS[slot.day as 0|1|2|3|4|5|6]} {slot.startTime?.substring(0,5)}–{slot.endTime?.substring(0,5)} ({SCHEDULE_TYPE_LABELS[slot.type as 0|1|2]}) — {slot.roomName}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600">
                        {ENROLLMENT_STATUS_LABELS[c.status as 0|1|2|3|4]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {student.currentSchedule.length === 0 && (
            <div className="text-center py-8"><p className="text-sm text-slate-400">No courses enrolled this semester.</p></div>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-slate-700">Course Attendance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Attendance</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Absences</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {student.courseAttendances.map((ca) => (
                  <tr key={ca.courseInstanceId} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-700">{ca.courseName}</p>
                      <p className="text-[10px] text-slate-400">{ca.courseCode}</p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-sm font-bold ${ca.attendancePercentage >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{ca.attendancePercentage}%</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-medium ${ca.absences > 3 ? 'text-red-600' : 'text-slate-600'}`}>{ca.absences}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {student.courseAttendances.length === 0 && (
            <div className="text-center py-8"><p className="text-sm text-slate-400">No attendance records available.</p></div>
          )}
        </div>
      )}

      {/* Warnings Tab */}
      {activeTab === 'warnings' && (
        <div className="space-y-3">
          {student.warnings.length > 0 ? student.warnings.map((w) => (
            <div key={w.warningId} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${warningLevelBadge(w.warningLevel)}`}>
                  <i className="ri-alert-line text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-800">{w.reason}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${warningLevelBadge(w.warningLevel)}`}>Level {w.warningLevel}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${w.status === WarningStatus.Active ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
                      {WARNING_STATUS_LABELS[w.status as WarningStatus]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><i className="ri-calendar-line" />{new Date(w.dateIssued).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-100"><p className="text-sm text-slate-400">No warnings on record.</p></div>
          )}
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          {student.currentSemesterFees ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-gray-50">
                  <p className="text-lg font-bold text-slate-800">{student.currentSemesterFees.totalAmount.toLocaleString()} EGP</p>
                  <p className="text-[10px] text-slate-400">Total Fees</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-emerald-50">
                  <p className="text-lg font-bold text-emerald-600">{student.currentSemesterFees.paidAmount.toLocaleString()} EGP</p>
                  <p className="text-[10px] text-emerald-400">Paid</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50">
                  <p className="text-lg font-bold text-red-600">{student.currentSemesterFees.remainingAmount.toLocaleString()} EGP</p>
                  <p className="text-[10px] text-red-400">Remaining</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Tuition', value: student.currentSemesterFees.tuitionFees },
                  { label: 'Books', value: student.currentSemesterFees.booksFees },
                  { label: 'Discount', value: student.currentSemesterFees.discount },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{r.label}</span>
                    <span className="font-medium text-slate-700">{r.value.toLocaleString()} EGP</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${student.currentSemesterFees.status === PaymentStatus.Paid ? 'bg-emerald-50 text-emerald-600' : student.currentSemesterFees.status === PaymentStatus.PartiallyPaid ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                    {PAYMENT_STATUS_LABELS[student.currentSemesterFees.status as PaymentStatus]}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Payment Progress</span>
                  <span className="text-xs font-medium text-slate-700">{student.currentSemesterFees.totalAmount > 0 ? Math.round((student.currentSemesterFees.paidAmount / student.currentSemesterFees.totalAmount) * 100) : 0}%</span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${student.currentSemesterFees.totalAmount > 0 ? (student.currentSemesterFees.paidAmount / student.currentSemesterFees.totalAmount) * 100 : 0}%` }} />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8"><p className="text-sm text-slate-400">No fee records for this semester.</p></div>
          )}
        </div>
      )}

      {/* Send Message Modal */}
      {showMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Send Message to {student.studentName}</h2>
              <button type="button" onClick={() => setShowMessage(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleSendMessage} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Subject</label>
                <input type="text" value={msgForm.subject} onChange={(e) => setMsgForm(p => ({ ...p, subject: e.target.value }))} required maxLength={200} placeholder="Message subject..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Message</label>
                <textarea value={msgForm.message} onChange={(e) => setMsgForm(p => ({ ...p, message: e.target.value }))} required maxLength={2000} rows={4} placeholder="Write your message..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-none" />
                <p className="text-[10px] text-slate-400 text-right mt-1">{msgForm.message.length}/2000</p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowMessage(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={sending || !msgForm.subject || !msgForm.message} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50">
                  {sending ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" />Sending...</span> : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}