import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import type { ApiResponse } from '../../../lib/api';
import type { StudentCourse } from '../../../types/student';

import { COURSE_TYPE_LABELS } from '../../../lib/enums';

export default function StudentCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get<ApiResponse<StudentCourse[]>>('/api/student/courses')
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && res.data.data) {
          setCourses(res.data.data);
        } else {
          setCourses([]);
        }
      })
      .catch(() => {
        setCourses([]);
      })
      .finally(() => setLoading(false));
  }, []);

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

  const handleViewDetails = useCallback(
    (courseId: number) => {
      navigate(`/student/courses/${courseId}`);
    },
    [navigate]
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-slate-800">My Courses</h1>
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
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading courses...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((course) => (
          <div
            key={course.courseId}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:border-emerald-200 transition-all cursor-pointer group"
            onClick={() => handleViewDetails(course.courseId)}
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
              <span>{course.credits} cr</span>
              <span className="text-slate-300">|</span>
              <span>{COURSE_TYPE_LABELS[course.courseType as 0 | 1]}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-[10px] text-slate-400 mb-0.5">Current Grade</p>
                <p className="text-sm font-bold text-slate-700">
                  {course.currentGrade ?? '-'}
                  <span className="text-[10px] font-normal text-slate-400">/100</span>
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-[10px] text-slate-400 mb-0.5">Attendance</p>
                <p className="text-sm font-bold text-slate-700">
                  {course.attendancePercentage ?? '-'}
                  <span className="text-[10px] font-normal text-slate-400">%</span>
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">{course.departmentName}</span>
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
          <p className="text-sm text-slate-500">No courses found matching your search.</p>
        </div>
      )}
    </div>
  );
}