import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDoctorCourses } from '@/lib/doctorPortalApi';
import type { DoctorCourse } from '@/types/doctor';

function enrollmentColor(pct: number): string {
  if (pct >= 100) return 'bg-red-500';
  if (pct >= 80) return 'bg-amber-400';
  return 'bg-emerald-500';
}

export default function DoctorCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<DoctorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDoctorCourses()
      .then(({ data }) => setCourses(data?.courses ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.courseCode.toLowerCase().includes(q) ||
        c.courseName.toLowerCase().includes(q) ||
        c.semesterName.toLowerCase().includes(q)
    );
  }, [courses, search]);

  const handleViewDetails = useCallback(
    (courseInstanceId: number) => {
      navigate(`/doctor/courses/${courseInstanceId}`);
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
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
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
        {filtered.map((course) => {
          const pct = Math.round(course.enrollmentPercentage);
          return (
            <div
              key={course.courseInstanceId}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:border-violet-200 transition-all cursor-pointer group"
              onClick={() => handleViewDetails(course.courseInstanceId)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600 mb-2">
                    {course.courseCode}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                    {course.courseName}
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                  <i className="ri-book-line text-violet-600 text-sm" />
                </div>
              </div>

              <p className="text-[10px] text-slate-400 mb-3">
                {course.semesterName} · {course.creditHours} credit hrs
              </p>

              {/* Enrollment bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500">Enrollment</span>
                  <span className="text-[10px] font-medium text-slate-600">{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${enrollmentColor(pct)}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-400 mb-0.5">Enrolled</p>
                  <p className="text-sm font-bold text-slate-700">{course.enrolledCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-400 mb-0.5">Capacity</p>
                  <p className="text-sm font-bold text-slate-700">{course.maxCapacity}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end">
                <span className="text-xs text-violet-600 font-medium flex items-center gap-1 group-hover:underline">
                  Manage <i className="ri-arrow-right-line" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-book-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">
            {search ? 'No courses found matching your search.' : 'No courses assigned this semester.'}
          </p>
        </div>
      )}
    </div>
  );
}