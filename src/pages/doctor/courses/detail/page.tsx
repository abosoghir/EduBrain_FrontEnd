import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { DoctorCourseDetail } from '@/types/doctor';
import { COURSE_TYPE_LABELS, SCHEDULE_TYPE_LABELS, MATERIAL_TYPE_LABELS } from '@/lib/enums';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'ri-information-line' },
  { id: 'students', label: 'Students', icon: 'ri-user-line' },
  { id: 'materials', label: 'Materials', icon: 'ri-folder-line' },
];

export default function DoctorCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<DoctorCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!id) return;
    api.get<ApiResponse<DoctorCourseDetail>>(`/api/doctor/courses/${id}`)
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
  }, [id]);

  const goBack = useCallback(() => {
    navigate('/doctor/courses');
  }, [navigate]);

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
        <p className="text-sm text-slate-500">Failed to load course details.</p>
        <button type="button" onClick={goBack} className="mt-4 text-sm text-violet-600 hover:underline">Back to Courses</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={goBack}
          className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <i className="ri-arrow-left-line text-slate-500" />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600">
              {course.courseCode}
            </span>
            <span className="text-[10px] text-slate-400">{COURSE_TYPE_LABELS[course.courseType as 0 | 1]}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">{course.courseName}</h1>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Students', value: course.totalStudents, icon: 'ri-user-line', color: 'text-violet-600 bg-violet-50' },
          { label: 'Credits', value: course.credits, icon: 'ri-time-line', color: 'text-blue-600 bg-blue-50' },
          { label: 'Materials', value: course.materials.length, icon: 'ri-folder-line', color: 'text-amber-600 bg-amber-50' },
          { label: 'Department', value: course.departmentName, icon: 'ri-building-line', color: 'text-emerald-600 bg-emerald-50' },
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

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-50 p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Course Description</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">{course.description}</p>

          <h3 className="text-sm font-semibold text-slate-700 mb-3">Schedule</h3>
          <div className="space-y-2">
            {course.schedule.map((slot, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                  <i className="ri-calendar-line text-violet-500 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{slot.day}</p>
                  <p className="text-[10px] text-slate-400">
                    {slot.startTime} - {slot.endTime} · {slot.roomName} · {SCHEDULE_TYPE_LABELS[slot.scheduleType as 0 | 1 | 2]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Enrolled Students</h3>
            <span className="text-xs text-slate-400">{course.enrolledStudents.length} students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Grade</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {course.enrolledStudents.map((s) => (
                  <tr key={s.studentId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600">
                          {s.studentName.charAt(0)}
                        </div>
                        <p className="text-sm font-medium text-slate-700">{s.studentName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center text-xs text-slate-500">{s.studentCode}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-sm font-bold ${(s.currentGrade ?? 0) >= 70 ? 'text-slate-700' : 'text-red-600'}`}>
                        {s.currentGrade ?? '-'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-medium ${(s.attendancePercentage ?? 0) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {s.attendancePercentage ?? '-'}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Course Materials</h3>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors"
            >
              <i className="ri-upload-line" />
              Upload
            </button>
          </div>
          <div className="space-y-2">
            {course.materials.map((m) => (
              <div key={m.materialId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-violet-50/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100">
                  <i className={`${m.materialType === 2 ? 'ri-link' : 'ri-file-line'} text-violet-500 text-sm`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{m.title}</p>
                  <p className="text-[10px] text-slate-400">
                    {MATERIAL_TYPE_LABELS[m.materialType as 0 | 1 | 2]} · {new Date(m.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={m.url || '#'}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-100 hover:border-violet-200 transition-colors shrink-0"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="ri-download-line text-slate-400 text-sm" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}