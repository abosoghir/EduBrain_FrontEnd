import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchStudentCourseDetail,
  fetchStudentCourseMaterials,
  fetchCourseAttendanceDetail,
} from '@/lib/studentPortalApi';
import type {
  StudentCourseDetail,
  StudentCourseMaterialWeek,
  CourseAttendanceDetail,
} from '@/types/student';
import { MATERIAL_TYPE_LABELS, GRADE_LABELS, ATTENDANCE_STATUS_LABELS } from '@/lib/enums';

const TABS = [
  { id: 'grades', label: 'Grades', icon: 'ri-bar-chart-line' },
  { id: 'attendance', label: 'Attendance', icon: 'ri-check-double-line' },
  { id: 'materials', label: 'Materials', icon: 'ri-folder-line' },
];

export default function StudentCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseInstanceId = parseInt(id || '0', 10);

  const [course, setCourse] = useState<StudentCourseDetail | null>(null);
  const [materialWeeks, setMaterialWeeks] = useState<StudentCourseMaterialWeek[]>([]);
  const [attendanceDetail, setAttendanceDetail] = useState<CourseAttendanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grades');
  const [loadingTab, setLoadingTab] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchStudentCourseDetail(courseInstanceId)
      .then(setCourse)
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [courseInstanceId]);

  const loadMaterials = useCallback(async () => {
    if (materialWeeks.length > 0) return;
    setLoadingTab('materials');
    try {
      const res = await fetchStudentCourseMaterials(courseInstanceId);
      setMaterialWeeks(res.weeks);
    } catch {
      setMaterialWeeks([]);
    } finally {
      setLoadingTab(null);
    }
  }, [courseInstanceId, materialWeeks.length]);

  const loadAttendance = useCallback(async () => {
    if (attendanceDetail) return;
    setLoadingTab('attendance');
    try {
      const res = await fetchCourseAttendanceDetail(courseInstanceId);
      setAttendanceDetail(res);
    } catch {
      setAttendanceDetail(null);
    } finally {
      setLoadingTab(null);
    }
  }, [courseInstanceId, attendanceDetail]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'materials') loadMaterials();
    if (tab === 'attendance') loadAttendance();
  };

  const statusColor = (status: string) => {
    if (status === 'Passed') return 'text-emerald-600 bg-emerald-50';
    if (status === 'Failed') return 'text-red-600 bg-red-50';
    return 'text-amber-600 bg-amber-50';
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <i className="ri-loader-4-line animate-spin" />
        Loading course details...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Course not found.</p>
        <button
          type="button"
          onClick={() => navigate('/student/courses')}
          className="mt-4 text-sm text-emerald-600 hover:underline"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const { currentGrades, gradeWeights, attendance } = course;

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/student/courses')}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <i className="ri-arrow-left-line" /> Back to Courses
      </button>

      {/* Course Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600 mb-2">
              {course.courseCode}
            </span>
            <h1 className="text-lg font-bold text-slate-800">{course.courseName}</h1>
            <p className="text-xs text-slate-500 mt-1">
              {course.departmentName} · {course.creditHours} credits · {course.doctorName}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Enrolled {new Date(course.enrollmentDate).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            {currentGrades.totalScore !== null ? (
              <>
                <p className="text-2xl font-bold text-slate-800">{currentGrades.totalScore.toFixed(1)}</p>
                <p className="text-[10px] text-slate-400">Total / 100</p>
                {currentGrades.letterGrade !== null && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                    {GRADE_LABELS[currentGrades.letterGrade as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10]}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-slate-400">In Progress</span>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-[10px]">
          <span className={`flex items-center gap-1 px-2 py-1 rounded-md ${
            attendance.attendancePercentage >= 85
              ? 'bg-emerald-50 text-emerald-600'
              : attendance.attendancePercentage >= 75
              ? 'bg-amber-50 text-amber-600'
              : 'bg-red-50 text-red-600'
          }`}>
            <i className="ri-check-double-line" />
            {attendance.attendancePercentage.toFixed(1)}% attendance
          </span>
          <span className="text-slate-400">
            {attendance.presentCount}/{attendance.totalSessions} sessions
          </span>
          {attendance.hasWarning && (
            <span className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-md">
              <i className="ri-error-warning-line" /> Attendance Warning
            </span>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleTabChange(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className={t.icon} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Grades Tab */}
      {activeTab === 'grades' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Grade Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase">Component</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase">Score</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase">Max</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(
                  [
                    { label: 'Midterm', score: currentGrades.midterm, weight: gradeWeights.midterm },
                    { label: 'Final', score: currentGrades.final, weight: gradeWeights.final },
                    { label: 'Practical', score: currentGrades.practical, weight: gradeWeights.practical },
                    { label: 'Quizzes', score: currentGrades.quizzes, weight: gradeWeights.quizzes },
                    { label: 'Oral', score: currentGrades.oral, weight: gradeWeights.oral },
                  ] as Array<{ label: string; score: number | null; weight: number }>
                )
                  .filter((row) => row.weight > 0)
                  .map((row) => {
                    const pct = row.score !== null ? ((row.score / row.weight) * 100).toFixed(1) : null;
                    return (
                      <tr key={row.label} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">{row.label}</td>
                        <td className="px-4 py-3 text-center text-sm text-slate-600">
                          {row.score !== null ? row.score.toFixed(1) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-400">{row.weight}</td>
                        <td className="px-4 py-3 text-center">
                          {pct !== null ? (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                              parseFloat(pct) >= 85 ? 'bg-emerald-50 text-emerald-600' :
                              parseFloat(pct) >= 70 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                            }`}>{pct}%</span>
                          ) : (
                            <span className="text-xs text-slate-300">Pending</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-sm text-slate-700">Total</td>
                  <td className="px-4 py-3 text-center text-sm text-slate-800">
                    {currentGrades.totalScore?.toFixed(1) ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-slate-400">100</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${statusColor(currentGrades.status)}`}>
                      {currentGrades.status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Attendance History</h3>
          {loadingTab === 'attendance' ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-6 justify-center">
              <i className="ri-loader-4-line animate-spin" /> Loading...
            </div>
          ) : attendanceDetail ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Present', value: attendanceDetail.presentCount, color: 'text-emerald-600 bg-emerald-50', icon: 'ri-check-line' },
                  { label: 'Absent', value: attendanceDetail.absentCount, color: 'text-red-600 bg-red-50', icon: 'ri-close-line' },
                  { label: 'Excused', value: attendanceDetail.excusedCount, color: 'text-blue-600 bg-blue-50', icon: 'ri-shield-check-line' },
                  { label: 'Total', value: attendanceDetail.totalSessions, color: 'text-slate-600 bg-slate-50', icon: 'ri-calendar-line' },
                ].map((s) => (
                  <div key={s.label} className={`${s.color} rounded-lg p-3 text-center`}>
                    <i className={`${s.icon} text-lg mb-1 block`} />
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-[10px]">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mb-6">
                <p className={`text-3xl font-bold ${
                  attendanceDetail.attendancePercentage >= 85 ? 'text-emerald-600' :
                  attendanceDetail.attendancePercentage >= 75 ? 'text-amber-600' : 'text-red-600'
                }`}>{attendanceDetail.attendancePercentage.toFixed(1)}%</p>
                <p className="text-xs text-slate-400 mt-1">Overall Attendance Rate</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase">Date</th>
                      <th className="text-center px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase">Week</th>
                      <th className="text-center px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendanceDetail.sessions.map((s) => (
                      <tr key={s.attendanceId} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-slate-400">Week {s.weekNumber}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            s.status === 0 ? 'bg-emerald-50 text-emerald-600' :
                            s.status === 2 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {ATTENDANCE_STATUS_LABELS[s.status as 0 | 1 | 2]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{s.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">Failed to load attendance data.</p>
          )}
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          {loadingTab === 'materials' ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-6 justify-center bg-white rounded-xl border border-gray-100 p-5">
              <i className="ri-loader-4-line animate-spin" /> Loading materials...
            </div>
          ) : materialWeeks.length > 0 ? (
            materialWeeks.map((week) => (
              <div key={week.weekNumber} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                  <i className="ri-folder-line text-slate-400 text-sm" />
                  <h3 className="text-xs font-semibold text-slate-700">Week {week.weekNumber}</h3>
                  <span className="text-[10px] text-slate-400 ml-auto">{week.materials.length} files</span>
                </div>
                {week.materials.length === 0 ? (
                  <p className="px-5 py-3 text-xs text-slate-400">No materials this week.</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {week.materials.map((m) => (
                      <div key={m.materialId} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100">
                          <i className={`${m.type === 2 ? 'ri-link' : 'ri-file-line'} text-emerald-500 text-sm`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{m.title}</p>
                          <p className="text-[10px] text-slate-400">
                            {MATERIAL_TYPE_LABELS[m.type as 0 | 1 | 2]} · {new Date(m.createdOn).toLocaleDateString()}
                            {m.downloadCount > 0 && ` · ${m.downloadCount} downloads`}
                          </p>
                        </div>
                        <a
                          href={m.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-emerald-50 flex items-center justify-center border border-gray-100 transition-colors shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className={`${m.type === 2 ? 'ri-external-link-line' : 'ri-download-line'} text-slate-400 text-xs`} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <i className="ri-folder-line text-3xl text-slate-300 block mb-3" />
              <p className="text-sm text-slate-400">No materials available yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}