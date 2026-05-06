import React, { useEffect, useState, useMemo } from 'react';
import { fetchStudentGrades, fetchGpaHistory } from '@/lib/studentPortalApi';
import type { StudentGradesData, StudentGrade, GpaHistoryEntry } from '@/types/student';
import { GRADE_LABELS } from '@/lib/enums';

export default function StudentGrades() {
  const [data, setData] = useState<StudentGradesData | null>(null);
  const [history, setHistory] = useState<GpaHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetchStudentGrades(),
      fetchGpaHistory().catch(() => ({ history: [] })),
    ])
      .then(([grades, gpa]) => {
        setData(grades);
        setHistory(gpa.history);
        if (grades.availableSemesters.length > 0) {
          const current = grades.availableSemesters.find((s) => s.isCurrent);
          setSelectedSemesterId(current?.semesterId ?? grades.availableSemesters[0].semesterId);
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSemesterChange = async (semesterId: number) => {
    setSelectedSemesterId(semesterId);
    setLoading(true);
    try {
      const res = await fetchStudentGrades(semesterId);
      setData(res);
    } catch {
      // keep current data
    } finally {
      setLoading(false);
    }
  };

  const gradeRowColor = (totalScore: number | null) => {
    if (totalScore === null) return '';
    if (totalScore >= 90) return 'text-emerald-600 bg-emerald-50';
    if (totalScore >= 80) return 'text-blue-600 bg-blue-50';
    if (totalScore >= 70) return 'text-amber-600 bg-amber-50';
    if (totalScore >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">My Grades</h1>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading grades...
        </div>
      )}

      {/* Cumulative Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Cumulative GPA', value: data.cumulativeGPA.toFixed(2), icon: 'ri-bar-chart-line', color: data.cumulativeGPA >= 2.0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50' },
            { label: 'Credits Earned', value: data.totalCreditHoursEarned, icon: 'ri-check-double-line', color: 'text-blue-600 bg-blue-50' },
            { label: 'Academic Standing', value: data.academicStanding, icon: 'ri-award-line', color: 'text-violet-600 bg-violet-50' },
            { label: "Dean's List", value: data.isDeansListEligible ? '✅ Eligible' : '—', icon: 'ri-trophy-line', color: data.isDeansListEligible ? 'text-amber-600 bg-amber-50' : 'text-slate-400 bg-slate-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
                <i className={`${s.icon} text-sm`} />
              </div>
              <p className="text-base font-bold text-slate-800 truncate">{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Semester Selector */}
      {data && data.availableSemesters.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {data.availableSemesters.map((sem) => (
            <button
              key={sem.semesterId}
              type="button"
              onClick={() => handleSemesterChange(sem.semesterId)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedSemesterId === sem.semesterId
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
              }`}
            >
              {sem.name}
              {sem.isCurrent && (
                <span className={`ml-1.5 text-[10px] ${selectedSemesterId === sem.semesterId ? 'text-emerald-200' : 'text-slate-400'}`}>
                  ★
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Semester Summary */}
      {data && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex items-center gap-6 flex-wrap">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Semester</p>
            <p className="text-sm font-semibold text-slate-700">{data.selectedSemesterName}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">GPA</p>
            <p className="text-sm font-bold text-slate-800">{data.semesterGPA?.toFixed(2) ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Credit Hours</p>
            <p className="text-sm font-semibold text-slate-700">{data.creditHours}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Standing</p>
            <p className="text-sm font-semibold text-slate-700">{data.academicStanding}</p>
          </div>
        </div>
      )}

      {/* Grades Table */}
      {data && data.grades.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Course Grades</h2>
            <span className="text-xs text-slate-400">{data.grades.length} courses</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {['Course', 'Credits', 'Midterm', 'Final', 'Practical', 'Quizzes', 'Oral', 'Total', 'Grade', 'GPA Pts', 'Status'].map((h) => (
                    <th key={h} className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider first:text-left first:pl-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.grades.map((grade: StudentGrade) => (
                  <tr key={grade.enrollmentId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-700">{grade.courseName}</p>
                      <p className="text-[10px] text-slate-400">{grade.courseCode}</p>
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-slate-500">{grade.creditHours}</td>
                    {[grade.midterm, grade.final, grade.practical, grade.quizzes, grade.oral].map((v, i) => (
                      <td key={i} className="px-3 py-3 text-center text-xs text-slate-600">
                        {v !== null ? v.toFixed(1) : <span className="text-slate-300">—</span>}
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center text-sm font-bold text-slate-800">
                      {grade.totalScore !== null ? grade.totalScore.toFixed(1) : <span className="text-slate-300 font-normal text-xs">—</span>}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {grade.letterGrade !== null ? (
                        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${gradeRowColor(grade.totalScore)}`}>
                          {GRADE_LABELS[grade.letterGrade as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10]}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-slate-500">
                      {grade.gradePoints?.toFixed(1) ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        grade.status === 'Passed' ? 'bg-emerald-50 text-emerald-600' :
                        grade.status === 'Failed' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {grade.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GPA History */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">GPA History</h2>
          <div className="space-y-2">
            {history.map((entry) => (
              <div key={entry.semesterId} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-700">{entry.semesterName}</p>
                  <p className="text-[10px] text-slate-400">{entry.creditHoursAttempted} cr attempted · {entry.creditHoursEarned} earned</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-emerald-700">{entry.semesterGPA.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">Sem GPA</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-blue-700">{entry.cumulativeGPA.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">Cumulative</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !data && (
        <div className="text-center py-12">
          <p className="text-sm text-slate-500">No grades data available.</p>
        </div>
      )}
    </div>
  );
}