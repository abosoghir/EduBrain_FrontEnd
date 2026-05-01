import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '../../../lib/api';
import type { ApiResponse } from '../../../lib/api';
import type { RegistrationCourse, RegistrationSummary, CourseRegistrationRequest } from '../../../types/student';

import { COURSE_TYPE_LABELS } from '../../../lib/enums';

export default function StudentRegistration() {
  const [courses, setCourses] = useState<RegistrationCourse[]>([]);
  const [summary, setSummary] = useState<RegistrationSummary>({
  registeredCourses: 0,
  totalCredits: 0,
  maxAllowedCredits: 0,
});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<RegistrationCourse[]>>('/api/student/registration/courses'),
      api.get<ApiResponse<RegistrationSummary>>('/api/student/registration/summary'),
    ])
      .then(([coursesRes, sumRes]) => {
        if (coursesRes.data.isSuccess && coursesRes.data.hasData && Array.isArray(coursesRes.data.data)) {
          setCourses(coursesRes.data.data);
          setSelectedIds(coursesRes.data.data.filter((c) => c.isRegistered).map((c) => c.courseInstanceId));
        } else {
          setCourses([]);
        }
        if (sumRes.data.isSuccess && sumRes.data.hasData && sumRes.data.data) {
          setSummary(sumRes.data.data);
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

  const toggleCourse = useCallback((courseInstanceId: number, credits: number) => {
    setSelectedIds((prev) => {
      const exists = prev.includes(courseInstanceId);
      if (exists) {
        return prev.filter((id) => id !== courseInstanceId);
      }
      // Check credit limit
      const newTotal = summary.totalCredits + credits;
      if (newTotal > summary.maxAllowedCredits) {
        setMessage({ type: 'error', text: `Credit limit exceeded. Max allowed: ${summary.maxAllowedCredits}` });
        return prev;
      }
      setMessage(null);
      return [...prev, courseInstanceId];
    });
  }, [summary]);

  const handleRegister = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    const payload: CourseRegistrationRequest = { courseInstanceIds: selectedIds };
    try {
      const res = await api.post<ApiResponse<unknown>>('/api/student/registration', payload);
      if (res.data.isSuccess) {
        setMessage({ type: 'success', text: 'Course registration submitted successfully!' });
      } else {
        setMessage({ type: 'error', text: res.data.error?.description || 'Registration failed.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  }, [selectedIds]);

  const selectedCourses = useMemo(() => {
    return courses.filter((c) => selectedIds.includes(c.courseInstanceId));
  }, [courses, selectedIds]);

  const totalSelectedCredits = useMemo(() => {
    return selectedCourses.reduce((sum, c) => sum + c.credits, 0);
  }, [selectedCourses]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-slate-800">Course Registration</h1>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">
            <span className="font-medium text-slate-700">{totalSelectedCredits}</span> / {summary.maxAllowedCredits} credits
          </div>
          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min((totalSelectedCredits / summary.maxAllowedCredits) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading available courses...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by code, name, or doctor..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
            />
          </div>

          {filtered.map((course) => {
            const isSelected = selectedIds.includes(course.courseInstanceId);
            const full = course.availableSeats === 0;
            const disabled = full || !course.prerequisitesMet;
            return (
              <div
                key={course.courseInstanceId}
                className={`bg-white rounded-xl border p-4 transition-all ${
                  isSelected ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-100'
                } ${disabled ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => !disabled && toggleCourse(course.courseInstanceId, course.credits)}
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 hover:border-emerald-400'
                    } ${disabled ? 'cursor-not-allowed' : ''}`}
                    disabled={disabled}
                  >
                    {isSelected && <i className="ri-check-line text-xs" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-800">{course.courseName}</h3>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500">{course.courseCode}</span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-slate-400">{COURSE_TYPE_LABELS[course.courseType as 0 | 1]}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{course.doctorName}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <i className="ri-time-line" />
                        {course.scheduleSummary}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="ri-user-line" />
                        {course.availableSeats} / {course.maxCapacity} seats
                      </span>
                      <span>{course.credits} cr</span>
                    </div>
                    {!course.prerequisitesMet && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-red-50 text-[10px] text-red-600 font-medium">
                        Prerequisites not met
                      </span>
                    )}
                    {full && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-50 text-[10px] text-amber-600 font-medium">
                        Course full
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">No courses match your search.</p>
            </div>
          )}
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Registration Summary</h3>
            {selectedCourses.length > 0 ? (
              <div className="space-y-2 mb-4">
                {selectedCourses.map((c) => (
                  <div key={c.courseInstanceId} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{c.courseName}</p>
                      <p className="text-[10px] text-slate-400">{c.courseCode} · {c.credits} cr</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCourse(c.courseInstanceId, c.credits)}
                      className="text-red-400 hover:text-red-600 shrink-0"
                    >
                      <i className="ri-close-line" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-4">No courses selected yet.</p>
            )}

            <div className="pt-3 border-t border-gray-100 space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Courses</span>
                <span className="font-medium text-slate-700">{selectedCourses.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Credits</span>
                <span className="font-medium text-slate-700">{totalSelectedCredits} / {summary.maxAllowedCredits}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min((totalSelectedCredits / summary.maxAllowedCredits) * 100, 100)}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleRegister}
              disabled={saving || selectedCourses.length === 0}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Confirm Registration'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}