import React, { useState, useCallback, useEffect } from 'react';
import { fetchCourseEnrollments, setStudentGrade, fetchAcademicRecord } from '@/lib/gradingApi';
import type { CourseEnrollmentsData, EnrollmentStudentGrade, SetGradeForm, AcademicRecordData } from '@/types/admin';

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

export default function AdminGrading() {
  const [courseInstanceId, setCourseInstanceId] = useState('');
  const [courseData, setCourseData] = useState<CourseEnrollmentsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Grade editing
  const [editingEnrollment, setEditingEnrollment] = useState<EnrollmentStudentGrade | null>(null);
  const [gradeForm, setGradeForm] = useState<SetGradeForm>({});
  const [submitting, setSubmitting] = useState(false);

  // Academic record
  const [studentIdInput, setStudentIdInput] = useState('');
  const [academicRecord, setAcademicRecord] = useState<AcademicRecordData | null>(null);
  const [recordLoading, setRecordLoading] = useState(false);

  const [tab, setTab] = useState<'enrollments' | 'record'>('enrollments');

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const loadEnrollments = useCallback(async () => {
    const id = Number(courseInstanceId);
    if (!id) return;
    setLoading(true); setError(null);
    const res = await fetchCourseEnrollments(id);
    if (res.data) setCourseData(res.data);
    else { setCourseData(null); setError(res.error || 'Not found'); }
    setLoading(false);
  }, [courseInstanceId]);

  const handleOpenGrade = (s: EnrollmentStudentGrade) => {
    setEditingEnrollment(s);
    setGradeForm({ oral: s.oral, practical: s.practical, quizzes: s.quizzes, midterm: s.midterm, final: s.final });
  };

  const handleSetGrade = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    if (!editingEnrollment) return;
    const res = await setStudentGrade(editingEnrollment.enrollmentId, gradeForm);
    setSubmitting(false);
    if (res.data) {
      showToast(`Grade set for ${res.data.studentName}: ${res.data.totalGrade} (${res.data.letterGrade})`);
      setEditingEnrollment(null);
      loadEnrollments();
    } else showToast(res.error || 'Failed', false);
  };

  const loadRecord = async () => {
    const id = Number(studentIdInput);
    if (!id) return;
    setRecordLoading(true);
    const res = await fetchAcademicRecord(id);
    if (res.data) setAcademicRecord(res.data);
    else { setAcademicRecord(null); showToast(res.error || 'Not found', false); }
    setRecordLoading(false);
  };

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Grading Management</h1>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${toast.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <i className={toast.ok ? 'ri-check-line' : 'ri-error-warning-line'} /> {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        <button type="button" onClick={() => setTab('enrollments')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'enrollments' ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>
          <i className="ri-book-open-line mr-1" /> Course Grades
        </button>
        <button type="button" onClick={() => setTab('record')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'record' ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>
          <i className="ri-file-list-3-line mr-1" /> Academic Record
        </button>
      </div>

      {/* =========== Tab: Course Enrollments =========== */}
      {tab === 'enrollments' && (
        <div>
          <div className="flex gap-3 mb-6">
            <input type="number" min={1} value={courseInstanceId} onChange={e => setCourseInstanceId(e.target.value)} placeholder="Course Instance ID" className="w-56 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
            <button type="button" onClick={loadEnrollments} disabled={loading || !courseInstanceId} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors">
              {loading ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Loading...</span> : 'Load Enrollments'}
            </button>
          </div>

          {error && <div className="mb-4 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

          {courseData && (
            <>
              {/* Course summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Course</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{courseData.courseCode}</p>
                  <p className="text-xs text-slate-500">{courseData.courseName}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Enrolled</p>
                  <p className="text-lg font-bold text-slate-700 mt-1">{courseData.totalEnrolled}</p>
                  <p className="text-xs text-slate-500">{courseData.gradedCount} graded</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Passed</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">{courseData.passedCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Failed</p>
                  <p className="text-lg font-bold text-red-600 mt-1">{courseData.failedCount}</p>
                </div>
              </div>

              {/* Students table */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="bg-gray-50">
                      {['Student', 'Code', 'Oral', 'Practical', 'Quizzes', 'Midterm', 'Final', 'Total', 'Grade', 'Status', 'Actions'].map(h => (
                        <th key={h} className={`${h === 'Student' ? 'text-left' : 'text-center'} px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider`}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {courseData.students.map(s => (
                        <tr key={s.enrollmentId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-3 py-3 text-sm font-medium text-slate-700">{s.studentName}</td>
                          <td className="px-3 py-3 text-center text-xs text-slate-500">{s.studentCode}</td>
                          <td className="px-3 py-3 text-center text-xs text-slate-600">{s.oral}</td>
                          <td className="px-3 py-3 text-center text-xs text-slate-600">{s.practical}</td>
                          <td className="px-3 py-3 text-center text-xs text-slate-600">{s.quizzes}</td>
                          <td className="px-3 py-3 text-center text-xs text-slate-600">{s.midterm}</td>
                          <td className="px-3 py-3 text-center text-xs text-slate-600">{s.final}</td>
                          <td className="px-3 py-3 text-center text-sm font-bold text-slate-700">{s.totalGrade}</td>
                          <td className="px-3 py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${s.isPassed ? 'bg-emerald-50 text-emerald-600' : s.isGraded ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                              {s.isGraded ? `${s.letterGrade} (${s.descriptiveGrade})` : 'Not Graded'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.status === 'Graded' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>{s.status}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button type="button" onClick={() => handleOpenGrade(s)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500" title="Set Grade">
                              <i className="ri-edit-2-line text-sm" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!loading && !courseData && !error && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-bar-chart-line text-3xl text-slate-400" /></div>
              <p className="text-sm text-slate-500">Enter a Course Instance ID to view enrollments and grades.</p>
            </div>
          )}
        </div>
      )}

      {/* =========== Tab: Academic Record =========== */}
      {tab === 'record' && (
        <div>
          <div className="flex gap-3 mb-6">
            <input type="number" min={1} value={studentIdInput} onChange={e => setStudentIdInput(e.target.value)} placeholder="Student ID" className="w-56 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
            <button type="button" onClick={loadRecord} disabled={recordLoading || !studentIdInput} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors">
              {recordLoading ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Loading...</span> : 'Load Record'}
            </button>
          </div>

          {academicRecord && (
            <>
              {/* Summary */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center"><i className="ri-user-line text-xl text-slate-500" /></div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">{academicRecord.studentName}</h2>
                    <p className="text-xs text-slate-500">{academicRecord.department}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg"><p className="text-[10px] text-slate-400 uppercase">GPA</p><p className="text-lg font-bold text-slate-700">{academicRecord.currentCumulativeGPA.toFixed(2)}</p></div>
                  <div className="p-3 bg-gray-50 rounded-lg"><p className="text-[10px] text-slate-400 uppercase">Grade</p><p className="text-lg font-bold text-slate-700">{academicRecord.generalGrade}</p><p className="text-[10px] text-slate-500">{academicRecord.descriptiveGrade}</p></div>
                  <div className="p-3 bg-gray-50 rounded-lg"><p className="text-[10px] text-slate-400 uppercase">Credits Earned</p><p className="text-lg font-bold text-slate-700">{academicRecord.totalCreditHoursEarned}/{academicRecord.totalCreditHoursAttempted}</p></div>
                  <div className="p-3 bg-gray-50 rounded-lg"><p className="text-[10px] text-slate-400 uppercase">Status</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {academicRecord.isInGoodStanding && <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-medium">Good Standing</span>}
                      {academicRecord.isOnAcademicProbation && <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-medium">Probation</span>}
                      {academicRecord.qualifiesForHonors && <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-medium">Honors</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Semesters */}
              {academicRecord.semesters.map(sem => (
                <div key={sem.semesterId} className="bg-white rounded-xl border border-gray-100 mb-4 overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-700">{sem.semesterName} — {sem.academicYear}</h3>
                      <p className="text-[10px] text-slate-400">GPA: {sem.semesterGPA.toFixed(2)} | Cumulative: {sem.cumulativeGPAAtTime.toFixed(2)} | Credits: {sem.creditHoursEarned}/{sem.creditHoursAttempted}</p>
                    </div>
                  </div>
                  <table className="w-full">
                    <thead><tr className="border-b border-gray-100">
                      {['Course', 'Credits', 'Oral', 'Practical', 'Quizzes', 'Midterm', 'Final', 'Total', 'Grade', 'Doctor'].map(h => (
                        <th key={h} className={`${h === 'Course' ? 'text-left' : 'text-center'} px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase`}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {sem.courses.map(c => (
                        <tr key={c.enrollmentId}>
                          <td className="px-3 py-2"><p className="text-xs font-medium text-slate-700">{c.courseCode}</p><p className="text-[10px] text-slate-400">{c.courseName}</p></td>
                          <td className="px-3 py-2 text-center text-xs text-slate-600">{c.creditHours}</td>
                          <td className="px-3 py-2 text-center text-xs text-slate-600">{c.oral}</td>
                          <td className="px-3 py-2 text-center text-xs text-slate-600">{c.practical}</td>
                          <td className="px-3 py-2 text-center text-xs text-slate-600">{c.quizzes}</td>
                          <td className="px-3 py-2 text-center text-xs text-slate-600">{c.midterm}</td>
                          <td className="px-3 py-2 text-center text-xs text-slate-600">{c.final}</td>
                          <td className="px-3 py-2 text-center text-xs font-bold text-slate-700">{c.totalGrade}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${c.isPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{c.letterGrade}</span>
                          </td>
                          <td className="px-3 py-2 text-center text-[10px] text-slate-500">{c.doctorName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </>
          )}

          {!recordLoading && !academicRecord && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-file-list-3-line text-3xl text-slate-400" /></div>
              <p className="text-sm text-slate-500">Enter a Student ID to view their academic record.</p>
            </div>
          )}
        </div>
      )}

      {/* =========== Grade Edit Modal =========== */}
      {editingEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Set Grade</h2>
                <p className="text-xs text-slate-400">{editingEnrollment.studentName} ({editingEnrollment.studentCode})</p>
              </div>
              <button type="button" onClick={() => setEditingEnrollment(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleSetGrade} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Oral</label><input type="number" min={0} max={100} step={0.5} value={gradeForm.oral ?? ''} onChange={e => setGradeForm(p => ({ ...p, oral: e.target.value ? Number(e.target.value) : undefined }))} className={inputCls} /></div>
                <div><label className={labelCls}>Practical</label><input type="number" min={0} max={100} step={0.5} value={gradeForm.practical ?? ''} onChange={e => setGradeForm(p => ({ ...p, practical: e.target.value ? Number(e.target.value) : undefined }))} className={inputCls} /></div>
                <div><label className={labelCls}>Quizzes</label><input type="number" min={0} max={100} step={0.5} value={gradeForm.quizzes ?? ''} onChange={e => setGradeForm(p => ({ ...p, quizzes: e.target.value ? Number(e.target.value) : undefined }))} className={inputCls} /></div>
                <div><label className={labelCls}>Midterm</label><input type="number" min={0} max={100} step={0.5} value={gradeForm.midterm ?? ''} onChange={e => setGradeForm(p => ({ ...p, midterm: e.target.value ? Number(e.target.value) : undefined }))} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Final</label><input type="number" min={0} max={100} step={0.5} value={gradeForm.final ?? ''} onChange={e => setGradeForm(p => ({ ...p, final: e.target.value ? Number(e.target.value) : undefined }))} className={inputCls} /></div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingEnrollment(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : 'Set Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}