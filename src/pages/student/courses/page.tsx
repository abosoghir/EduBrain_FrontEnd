import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStudentCourses } from '@/lib/studentPortalApi';
import type { StudentCourse, StudentCoursesResponse } from '@/types/student';
import { ENROLLMENT_STATUS_LABELS, GRADE_LABELS } from '@/lib/enums';

export default function StudentCourses() {
  const navigate = useNavigate();
  const [response, setResponse] = useState<StudentCoursesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudentCourses()
      .then(setResponse)
      .catch(() => setResponse(null))
      .finally(() => setLoading(false));
  }, []);

  const courses: StudentCourse[] = response?.courses ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.courseCode.toLowerCase().includes(q) ||
        c.courseName.toLowerCase().includes(q) ||
        c.doctorName.toLowerCase().includes(q)
    );
  }, [courses, search]);

  const attendanceBadge = (pct: number) => {
    if (pct >= 85) return 'text-emerald-600 bg-emerald-50';
    if (pct >= 75) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Courses</h1>
          {response && (
            <p className="text-xs text-slate-500 mt-0.5">
              {response.totalCourses} courses · {response.totalCreditHours} credit hours
            </p>
          )}
        </div>
        <div className="relative max-w-xs">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
          />
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                  <div className="h-5 w-32 bg-gray-200 rounded" />
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
              </div>
              <div className="h-3 w-24 bg-gray-100 rounded mb-4" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-gray-100 rounded-lg" />
                <div className="h-12 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {!loading && filtered.map((course) => (
          <div
            key={course.enrollmentId}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:border-emerald-200 transition-all cursor-pointer group"
            onClick={() => navigate(`/student/courses/${course.courseInstanceId}`)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600 mb-2">
                  {course.courseCode}
                </span>
                <h3 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  {course.courseName}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <i className="ri-book-line text-emerald-600 text-sm" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-4">
              <span className="flex items-center gap-1">
                <i className="ri-user-line" />
                {course.doctorName}
              </span>
              <span className="text-slate-300">|</span>
              <span>{course.creditHours} cr</span>
              <span className="text-slate-300">|</span>
              <span className={`px-1.5 py-0.5 rounded ${course.status === 1 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {ENROLLMENT_STATUS_LABELS[course.status as 0 | 1 | 2 | 3 | 4]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-[10px] text-slate-400 mb-0.5">Current Grade</p>
                <p className="text-sm font-bold text-slate-700">
                  {course.currentGrade !== null ? (
                    <>
                      {course.currentGrade.toFixed(1)}
                      <span className="text-[10px] font-normal text-slate-400">/100</span>
                    </>
                  ) : (
                    <span className="text-slate-400 font-normal text-xs">In Progress</span>
                  )}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-[10px] text-slate-400 mb-0.5">Attendance</p>
                <p className={`text-sm font-bold ${attendanceBadge(course.attendancePercentage ?? 0).split(' ')[0]}`}>
                  {(course.attendancePercentage ?? 0).toFixed(1)}
                  <span className="text-[10px] font-normal text-slate-400">%</span>
                </p>
              </div>
            </div>

            {/* Attendance bar */}
            <div className="mt-3">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (course.attendancePercentage ?? 0) >= 85
                      ? 'bg-emerald-500'
                      : (course.attendancePercentage ?? 0) >= 75
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((course.attendancePercentage ?? 0), 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end">
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 group-hover:underline">
                Details <i className="ri-arrow-right-line" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-book-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">
            {search ? 'No courses match your search.' : 'No courses enrolled yet.'}
          </p>
        </div>
      )}
    </div>
  );
}