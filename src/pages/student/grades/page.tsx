import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../../lib/api';
import type { ApiResponse } from '../../../lib/api';
import type { StudentGradesSummary, StudentGrade } from '../../../types/student';

import { COURSE_TYPE_LABELS } from '../../../lib/enums';

export default function StudentGrades() {
  const [summary, setSummary] = useState<StudentGradesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string>('');

  useEffect(() => {
    api.get<ApiResponse<StudentGradesSummary>>('/api/student/grades')
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && res.data.data) {
          setSummary(res.data.data);
          if (Array.isArray(res.data.data.semesterGrades) && res.data.data.semesterGrades.length > 0) {
            setSelectedSemester(res.data.data.semesterGrades[0].semesterName);
          }
        } else {
          setSummary(null);
        }
      })
      .catch(() => {
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const currentSemester = useMemo(() => {
    return summary?.semesterGrades.find((s) => s.semesterName === selectedSemester);
  }, [summary, selectedSemester]);

  const gradeColor = (totalGrade: number) => {
    if (totalGrade >= 90) return 'text-emerald-600 bg-emerald-50';
    if (totalGrade >= 80) return 'text-blue-600 bg-blue-50';
    if (totalGrade >= 70) return 'text-amber-600 bg-amber-50';
    if (totalGrade >= 60) return 'text-orange-600 bg-orange-50';
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

      {/* GPA Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Cumulative GPA', value: summary.cumulativeGPA.toFixed(2), icon: 'ri-bar-chart-line', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Total Credits', value: summary.totalCreditHours, icon: 'ri-time-line', color: 'text-blue-600 bg-blue-50' },
            { label: 'Completed', value: summary.completedHours, icon: 'ri-check-line', color: 'text-violet-600 bg-violet-50' },
            { label: 'Semesters', value: summary.semesterGrades.length, icon: 'ri-calendar-line', color: 'text-amber-600 bg-amber-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                  <i className={`${s.icon} text-sm`} />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Semester Selector */}
      {summary && summary.semesterGrades.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {summary.semesterGrades.map((sem) => (
            <button
              key={sem.semesterName}
              type="button"
              onClick={() => setSelectedSemester(sem.semesterName)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedSemester === sem.semesterName
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
              }`}
            >
              {sem.semesterName}
              <span className={`ml-2 text-[10px] ${selectedSemester === sem.semesterName ? 'text-emerald-200' : 'text-slate-400'}`}>
                GPA: {sem.gpa.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Grades Table */}
      {currentSemester && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">{currentSemester.semesterName}</h2>
            <span className="text-xs text-slate-400">{currentSemester.courses.length} courses</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Credits</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Grade</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Letter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentSemester.courses.map((course: StudentGrade) => (
                  <tr key={course.courseId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-700">{course.courseName}</p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-xs text-slate-500">{course.courseCode}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-[10px] text-slate-400">{COURSE_TYPE_LABELS[course.courseType as 0 | 1]}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-xs text-slate-500">{course.credits}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-bold text-slate-700">{course.totalGrade}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${gradeColor(course.totalGrade)}`}>
                        {course.letterGrade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !summary && (
        <div className="text-center py-12">
          <p className="text-sm text-slate-500">No grades data available.</p>
        </div>
      )}
    </div>
  );
}