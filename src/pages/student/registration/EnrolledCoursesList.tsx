import React from 'react';
import type { RegisteredCourse } from '@/types/student';
import { ENROLLMENT_STATUS_LABELS, DAY_OF_WEEK_LABELS } from '@/lib/enums';

interface Props {
  courses: RegisteredCourse[];
  totalCreditHours: number;
  onDrop: (enrollmentId: number) => void;
  actionLoading: boolean;
}

function fmtTime(t: string) {
  return t?.substring(0, 5) || t;
}

const STATUS_STYLES: Record<number, { bg: string; text: string }> = {
  0: { bg: 'bg-emerald-100', text: 'text-emerald-700' },   // Enrolled
  1: { bg: 'bg-amber-100', text: 'text-amber-700' },       // Waitlisted
  2: { bg: 'bg-slate-200', text: 'text-slate-600' },        // Dropped
  3: { bg: 'bg-blue-100', text: 'text-blue-700' },          // Completed
  4: { bg: 'bg-rose-100', text: 'text-rose-700' },          // Failed
};

export default function EnrolledCoursesList({ courses, totalCreditHours, onDrop, actionLoading }: Props) {
  const activeCourses = courses.filter(c => c.status === 0 || c.status === 1);
  const otherCourses = courses.filter(c => c.status !== 0 && c.status !== 1);

  if (courses.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-sm font-medium text-slate-500">No enrollments yet</p>
        <p className="text-xs text-slate-400 mt-1">Register for courses to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-3 rounded-xl">
          <p className="text-[10px] font-medium text-slate-400 uppercase">Enrolled</p>
          <p className="text-xl font-bold text-slate-800">{activeCourses.filter(c => c.status === 0).length}</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl">
          <p className="text-[10px] font-medium text-slate-400 uppercase">Waitlisted</p>
          <p className="text-xl font-bold text-amber-600">{activeCourses.filter(c => c.status === 1).length}</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl">
          <p className="text-[10px] font-medium text-slate-400 uppercase">Total Credits</p>
          <p className="text-xl font-bold text-blue-600">{totalCreditHours}</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl">
          <p className="text-[10px] font-medium text-slate-400 uppercase">Total Courses</p>
          <p className="text-xl font-bold text-slate-800">{activeCourses.length}</p>
        </div>
      </div>

      {/* Active Enrollments */}
      {activeCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeCourses.map(course => {
            const style = STATUS_STYLES[course.status] ?? STATUS_STYLES[0];
            return (
              <div key={course.enrollmentId} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-blue-600">{course.courseCode}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                        {ENROLLMENT_STATUS_LABELS[course.status as keyof typeof ENROLLMENT_STATUS_LABELS]}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800">{course.courseName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{course.doctorName} • {course.creditHours} CR</p>
                  </div>
                </div>

                {course.schedule.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                    {course.schedule.map((s, i) => (
                      <span key={i} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">
                        {DAY_OF_WEEK_LABELS[s.day as keyof typeof DAY_OF_WEEK_LABELS]?.substring(0, 3)} {fmtTime(s.startTime)}-{fmtTime(s.endTime)}
                      </span>
                    ))}
                  </div>
                )}

                {(course.status === 0 || course.status === 1) && (
                  <button
                    onClick={() => onDrop(course.enrollmentId)}
                    disabled={actionLoading}
                    className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    {course.status === 1 ? 'Leave Waitlist' : 'Drop Course'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Inactive Enrollments */}
      {otherCourses.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">
            Show {otherCourses.length} inactive enrollment{otherCourses.length !== 1 ? 's' : ''} ▸
          </summary>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {otherCourses.map(course => {
              const style = STATUS_STYLES[course.status] ?? STATUS_STYLES[2];
              return (
                <div key={course.enrollmentId} className="bg-slate-50 border border-slate-200 rounded-lg p-3 opacity-60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{course.courseCode}</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                      {ENROLLMENT_STATUS_LABELS[course.status as keyof typeof ENROLLMENT_STATUS_LABELS]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{course.courseName}</p>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
