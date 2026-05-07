import React, { useState } from 'react';
import type { StudentDetail } from '@/types/admin';
import {
  YEAR_LEVEL_LABELS, GENDER_LABELS, GRADE_LABELS, ENROLLMENT_STATUS_LABELS,
  SCHEDULE_TYPE_LABELS, DAY_OF_WEEK_LABELS, FEE_STATUS_LABELS, PAYMENT_METHOD_LABELS,
} from '@/lib/enums';

type Tab = 'overview' | 'courses' | 'schedule' | 'grades' | 'attendance' | 'fees';

interface Props {
  student: StudentDetail;
  onClose: () => void;
}

export default function StudentDetailPanel({ student, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'ri-user-line' },
    { key: 'courses', label: 'Courses', icon: 'ri-book-line' },
    { key: 'schedule', label: 'Schedule', icon: 'ri-calendar-line' },
    { key: 'grades', label: 'Grades', icon: 'ri-bar-chart-line' },
    { key: 'attendance', label: 'Attendance', icon: 'ri-checkbox-circle-line' },
    { key: 'fees', label: 'Fees', icon: 'ri-money-dollar-circle-line' },
  ];

  const gpaColor = (gpa: number) => gpa >= 3.5 ? 'text-emerald-600' : gpa >= 2.5 ? 'text-slate-700' : 'text-red-600';
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl animate-slide-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 overflow-hidden">
              {student.photoUrl ? <img src={student.photoUrl} alt="" className="w-full h-full object-cover" /> : student.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">{student.fullName}</h2>
              <p className="text-[10px] text-slate-400">{student.studentCode} · {student.email}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-gray-100"><i className="ri-close-line text-lg" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <i className={`${t.icon} text-sm`} />{t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 mb-1">GPA</p>
                  <p className={`text-lg font-bold ${gpaColor(student.cumulativeGPA)}`}>{student.cumulativeGPA.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 mb-1">Credits</p>
                  <p className="text-lg font-bold text-slate-700">{student.totalCreditHours}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 mb-1">Year</p>
                  <p className="text-lg font-bold text-slate-700">{YEAR_LEVEL_LABELS[student.yearLevel as 0|1|2|3]}</p>
                </div>
              </div>
              {student.isOnAcademicProbation && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg text-xs text-red-600">
                  <i className="ri-alert-line" /> Academic Probation
                </div>
              )}
              {/* Personal Info */}
              <div>
                <h3 className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1"><i className="ri-user-3-line" /> Personal Information</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  {([
                    ['Phone', student.phoneNumber],
                    ['Gender', GENDER_LABELS[student.gender as 0|1]],
                    ['Date of Birth', fmtDate(student.dateOfBirth)],
                    ['Nationality', student.nationality],
                    ['Religion', student.religion],
                    ['National ID', student.nationalId],
                    ['Address', student.address],
                    ['City', student.city],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label}><span className="text-slate-400">{label}:</span> <span className="text-slate-700 font-medium">{val || '—'}</span></div>
                  ))}
                </div>
              </div>
              {/* Academic Info */}
              <div>
                <h3 className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1"><i className="ri-graduation-cap-line" /> Academic Information</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  {([
                    ['Department', `${student.departmentName} (${student.departmentCode})`],
                    ['Advisor', student.academicAdvisorName || '—'],
                    ['General Grade', GRADE_LABELS[student.generalGrade as keyof typeof GRADE_LABELS] || '—'],
                    ['Qualification', student.previousQualification],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label}><span className="text-slate-400">{label}:</span> <span className="text-slate-700 font-medium">{val || '—'}</span></div>
                  ))}
                </div>
              </div>
              {/* Family Info */}
              <div>
                <h3 className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1"><i className="ri-parent-line" /> Family Information</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  <div><span className="text-slate-400">Father Phone:</span> <span className="text-slate-700 font-medium">{student.fatherPhone || '—'}</span></div>
                  <div><span className="text-slate-400">Father Job:</span> <span className="text-slate-700 font-medium">{student.fatherJob || '—'}</span></div>
                </div>
              </div>
              {/* GPA Trend */}
              {student.semesterGPAHistory.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-600 mb-3">Semester GPA History</h3>
                  <div className="overflow-x-auto"><table className="w-full text-xs">
                    <thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left text-slate-500">Semester</th><th className="px-3 py-2 text-center text-slate-500">Sem. GPA</th><th className="px-3 py-2 text-center text-slate-500">Cum. GPA</th><th className="px-3 py-2 text-center text-slate-500">Attempted</th><th className="px-3 py-2 text-center text-slate-500">Earned</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">{student.semesterGPAHistory.map((h, i) => (
                      <tr key={i}><td className="px-3 py-2 text-slate-700">{h.semesterName}</td><td className="px-3 py-2 text-center font-medium">{h.semesterGPA.toFixed(2)}</td><td className="px-3 py-2 text-center font-medium">{h.cumulativeGPA.toFixed(2)}</td><td className="px-3 py-2 text-center">{h.creditHoursAttempted}</td><td className="px-3 py-2 text-center">{h.creditHoursEarned}</td></tr>
                    ))}</tbody>
                  </table></div>
                </div>
              )}
            </div>
          )}

          {/* COURSES */}
          {tab === 'courses' && (
            <div>{student.currentCourses.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No current courses.</p> : (
              <div className="space-y-2">{student.currentCourses.map((c) => (
                <div key={c.courseInstanceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div><p className="text-sm font-medium text-slate-700">{c.courseName}</p><p className="text-[10px] text-slate-400">{c.courseCode} · {c.creditHours} credits · {c.doctorName}</p></div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.status === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{ENROLLMENT_STATUS_LABELS[c.status as keyof typeof ENROLLMENT_STATUS_LABELS] || 'Unknown'}</span>
                </div>
              ))}</div>
            )}</div>
          )}

          {/* SCHEDULE */}
          {tab === 'schedule' && (
            <div>{student.weeklySchedule.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No schedule entries.</p> : (
              <div className="space-y-2">{student.weeklySchedule.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div><p className="text-sm font-medium text-slate-700">{s.courseName} <span className="text-[10px] text-slate-400">({s.courseCode})</span></p><p className="text-[10px] text-slate-400">{DAY_OF_WEEK_LABELS[s.day as keyof typeof DAY_OF_WEEK_LABELS]} · {s.startTime.slice(0,5)}–{s.endTime.slice(0,5)} · {s.roomName} · {s.doctorName}</p></div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{SCHEDULE_TYPE_LABELS[s.scheduleType as keyof typeof SCHEDULE_TYPE_LABELS]}</span>
                </div>
              ))}</div>
            )}</div>
          )}

          {/* GRADES */}
          {tab === 'grades' && (
            <div>{student.grades.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No grades recorded.</p> : (
              <div className="overflow-x-auto"><table className="w-full text-xs">
                <thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left text-slate-500">Course</th><th className="px-3 py-2 text-center text-slate-500">Mid</th><th className="px-3 py-2 text-center text-slate-500">Final</th><th className="px-3 py-2 text-center text-slate-500">Prac</th><th className="px-3 py-2 text-center text-slate-500">Quiz</th><th className="px-3 py-2 text-center text-slate-500">Total</th><th className="px-3 py-2 text-center text-slate-500">Grade</th></tr></thead>
                <tbody className="divide-y divide-gray-50">{student.grades.map((g) => (
                  <tr key={g.enrollmentId}><td className="px-3 py-2"><p className="font-medium text-slate-700">{g.courseName}</p><p className="text-[10px] text-slate-400">{g.courseCode} · {g.creditHours}cr</p></td><td className="px-3 py-2 text-center">{g.midterm}</td><td className="px-3 py-2 text-center">{g.final}</td><td className="px-3 py-2 text-center">{g.practical}</td><td className="px-3 py-2 text-center">{g.quizzes}</td><td className="px-3 py-2 text-center font-bold">{g.totalGrade}</td><td className="px-3 py-2 text-center font-medium">{GRADE_LABELS[g.letterGrade as keyof typeof GRADE_LABELS] || '—'}</td></tr>
                ))}</tbody>
              </table></div>
            )}</div>
          )}

          {/* ATTENDANCE */}
          {tab === 'attendance' && (
            <div>{student.courseAttendances.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No attendance data.</p> : (
              <div className="space-y-2">{student.courseAttendances.map((a) => (
                <div key={a.courseInstanceId} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2"><p className="text-sm font-medium text-slate-700">{a.courseName} <span className="text-[10px] text-slate-400">({a.courseCode})</span></p>{a.hasAbsenceWarning && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">Warning</span>}</div>
                  <div className="flex gap-4 text-[10px] text-slate-500"><span>Present: {a.presentCount}/{a.totalLectures}</span><span>Absent: {a.absentCount}</span><span className={`font-medium ${a.attendancePercentage >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>{a.attendancePercentage.toFixed(1)}%</span></div>
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${a.attendancePercentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(a.attendancePercentage, 100)}%` }} /></div>
                </div>
              ))}</div>
            )}</div>
          )}

          {/* FEES */}
          {tab === 'fees' && (
            <div className="space-y-6">
              {student.currentFees && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="text-xs font-semibold text-slate-600 mb-3">{student.currentFees.semesterName}</h3>
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div><p className="text-slate-400">Total</p><p className="font-bold text-slate-700">{student.currentFees.totalAmount.toLocaleString()}</p></div>
                    <div><p className="text-slate-400">Paid</p><p className="font-bold text-emerald-600">{student.currentFees.paidAmount.toLocaleString()}</p></div>
                    <div><p className="text-slate-400">Remaining</p><p className="font-bold text-red-600">{student.currentFees.remainingAmount.toLocaleString()}</p></div>
                  </div>
                  <div className="mt-2 text-center"><span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{FEE_STATUS_LABELS[student.currentFees.status as keyof typeof FEE_STATUS_LABELS]}</span></div>
                </div>
              )}
              {student.installments.length > 0 && (
                <div><h3 className="text-xs font-semibold text-slate-600 mb-3">Installments</h3>
                  <div className="space-y-2">{student.installments.map((inst) => (
                    <div key={inst.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-xs">
                      <div><p className="font-medium text-slate-700">Installment #{inst.installmentNumber}</p><p className="text-[10px] text-slate-400">Due: {fmtDate(inst.dueDate)}{inst.paidDate ? ` · Paid: ${fmtDate(inst.paidDate)}` : ''}</p></div>
                      <div className="text-right"><p className="font-bold text-slate-700">{inst.amount.toLocaleString()}</p><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${inst.status === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{FEE_STATUS_LABELS[inst.status as keyof typeof FEE_STATUS_LABELS]}</span></div>
                    </div>
                  ))}</div>
                </div>
              )}
              {student.paymentHistory.length > 0 && (
                <div><h3 className="text-xs font-semibold text-slate-600 mb-3">Payment History</h3>
                  <div className="space-y-2">{student.paymentHistory.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-xs">
                      <div><p className="font-medium text-slate-700">{p.amount.toLocaleString()}</p><p className="text-[10px] text-slate-400">{fmtDate(p.paymentDate)} · {PAYMENT_METHOD_LABELS[p.method as keyof typeof PAYMENT_METHOD_LABELS]}</p></div>
                      {p.notes && <p className="text-[10px] text-slate-400 max-w-[150px] truncate">{p.notes}</p>}
                    </div>
                  ))}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
