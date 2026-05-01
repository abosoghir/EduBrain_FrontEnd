import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../../lib/api';
import type { ApiResponse } from '../../../../lib/api';
import type { StudentCourseDetail } from '../../../../types/student';

import { SCHEDULE_TYPE_LABELS, MATERIAL_TYPE_LABELS, GRADE_LABELS } from '../../../../lib/enums';

export default function StudentCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = parseInt(id || '0', 10);

  const [course, setCourse] = useState<StudentCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'grades' | 'attendance'>('overview');

  useEffect(() => {
    setLoading(true);
    api.get<ApiResponse<StudentCourseDetail>>(`/api/student/courses/${courseId}`)
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && res.data.data) {
          setCourse(res.data.data);
        } else {
          setCourse(null);
        }
      })
      .catch(() => {
        setCourse(null);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const currentTotalGrade = useMemo(() => {
    if (!course?.grades.length) return 0;
    let weighted = 0;
    let totalWeight = 0;
    course.grades.forEach((g) => {
      weighted += (g.gradeValue / g.maxGrade) * g.weight;
      totalWeight += g.weight;
    });
    return totalWeight > 0 ? Math.round((weighted / totalWeight) * 100) : 0;
  }, [course?.grades]);

  const attendanceColor = useCallback((pct: number) => {
    if (pct >= 90) return 'text-emerald-600';
    if (pct >= 75) return 'text-amber-600';
    return 'text-red-600';
  }, []);

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

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: 'ri-information-line' },
    { key: 'materials' as const, label: 'Materials', icon: 'ri-folder-line' },
    { key: 'grades' as const, label: 'Grades', icon: 'ri-bar-chart-line' },
    { key: 'attendance' as const, label: 'Attendance', icon: 'ri-check-double-line' },
  ];

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/student/courses')}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <i className="ri-arrow-left-line" /> Back to Courses
      </button>

      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600 mb-2">
              {course.courseCode}
            </span>
            <h1 className="text-lg font-bold text-slate-800">{course.courseName}</h1>
            <p className="text-xs text-slate-500 mt-1">
              {course.departmentName} · {course.credits} credits · {course.doctorName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800">{currentTotalGrade}</p>
            <p className="text-[10px] text-slate-400">Current Grade /100</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <i className="ri-check-double-line" />
            {course.attendanceSummary.percentage}% attendance
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <i className="ri-user-line" />
            {course.attendanceSummary.presentCount}/{course.attendanceSummary.totalCount} sessions
          </span>
        </div>
      </div>

      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === t.key
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className={t.icon} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Description</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{course.description}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Schedule</h3>
            <div className="space-y-2">
              {course.schedule.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <i className="ri-calendar-line text-emerald-600 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{slot.day}</p>
                    <p className="text-[10px] text-slate-400">
                      {slot.startTime} - {slot.endTime} · {slot.roomName}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600">
                    {SCHEDULE_TYPE_LABELS[slot.scheduleType as 0 | 1 | 2]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Course Materials</h3>
          {course.materials.length > 0 ? (
            <div className="space-y-2">
              {course.materials.map((m) => (
                <div key={m.materialId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                    <i className={`${m.materialType === 1 ? 'ri-file-line' : 'ri-links-line'} text-violet-600 text-sm`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{m.title}</p>
                    <p className="text-[10px] text-slate-400">
                      {MATERIAL_TYPE_LABELS[m.materialType as 0 | 1 | 2]} · {new Date(m.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  {m.url && (
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-xs hover:underline shrink-0">
                      <i className="ri-external-link-line" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No materials available yet.</p>
          )}
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Grade Breakdown</h3>
          {course.grades.length > 0 ? (
            <div className="space-y-3">
              {course.grades.map((g, idx) => {
                const pct = Math.round((g.gradeValue / g.maxGrade) * 100);
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">{g.gradeType}</span>
                      <span className="text-xs text-slate-500">
                        {g.gradeValue}/{g.maxGrade} ({pct}%) · Weight: {g.weight}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 85 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Current Total</span>
                <span className="text-sm font-bold text-slate-800">{currentTotalGrade}/100</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No grades posted yet.</p>
          )}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Attendance Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Present', value: course.attendanceSummary.presentCount, color: 'text-emerald-600 bg-emerald-50', icon: 'ri-check-line' },
              { label: 'Absent', value: course.attendanceSummary.absentCount, color: 'text-red-600 bg-red-50', icon: 'ri-close-line' },
              { label: 'Late', value: course.attendanceSummary.lateCount, color: 'text-amber-600 bg-amber-50', icon: 'ri-time-line' },
              { label: 'Total', value: course.attendanceSummary.totalCount, color: 'text-slate-600 bg-slate-50', icon: 'ri-calendar-line' },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-lg p-3 text-center`}>
                <i className={`${s.icon} text-lg mb-1`} />
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px]">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className={`text-3xl font-bold ${attendanceColor(course.attendanceSummary.percentage)}`}>
              {course.attendanceSummary.percentage}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Overall Attendance</p>
          </div>
        </div>
      )}
    </div>
  );
}