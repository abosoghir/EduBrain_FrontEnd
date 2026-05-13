import React, { useState, useMemo } from 'react';
import type { AvailableCourse } from '@/types/student';
import { COURSE_TYPE_LABELS, SCHEDULE_TYPE_LABELS, DAY_OF_WEEK_LABELS } from '@/lib/enums';

interface Props {
  courses: AvailableCourse[];
  onSelect: (course: AvailableCourse) => void;
  isSelected: (courseInstanceId: number) => boolean;
  isCourseIdSelected: (courseId: number) => boolean;
  isRegistrationOpen: boolean;
  loading: boolean;
}

function fmtTime(t: string) {
  // "HH:mm:ss" → "HH:mm"
  return t?.substring(0, 5) || t;
}

const AVAILABILITY_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  0: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Open' },
  1: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Almost Full' },
  2: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Full' },
  3: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Waitlist' },
};

export default function AvailableCoursesList({ courses, onSelect, isSelected, isCourseIdSelected, isRegistrationOpen, loading }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'elective'>('all');

  const filtered = useMemo(() => {
    let list = courses;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.courseCode.toLowerCase().includes(q) ||
        c.courseName.toLowerCase().includes(q) ||
        c.doctorName.toLowerCase().includes(q)
      );
    }
    if (filter === 'available') list = list.filter(c => c.seatsRemaining > 0);
    if (filter === 'elective') list = list.filter(c => c.courseType === 1);
    return list;
  }, [courses, search, filter]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
            <div className="h-3 bg-slate-100 rounded w-2/3 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search & Filter */}
      <div className="mb-4 space-y-2">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'available', 'elective'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'available' ? 'Available' : 'Elective'}
            </button>
          ))}
        </div>
      </div>

      {/* Course List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm font-medium">No courses found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filtered.map(course => {
            const selected = isSelected(course.courseInstanceId);
            const courseIdSelected = isCourseIdSelected(course.courseId);
            const avail = AVAILABILITY_COLORS[course.availabilityStatus] ?? AVAILABILITY_COLORS[0];
            const canSelect = isRegistrationOpen && course.prerequisitesMet && !course.isAlreadyRegistered && !selected && !courseIdSelected;

            return (
              <div
                key={course.courseInstanceId}
                className={`border rounded-xl p-4 transition-all ${
                  selected
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-blue-600">{course.courseCode}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${avail.bg} ${avail.text}`}>
                        {avail.label}
                      </span>
                      {course.courseType === 1 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">Elective</span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 truncate">{course.courseName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{course.doctorName} • {course.creditHours} CR</p>
                  </div>
                  <button
                    onClick={() => onSelect(course)}
                    disabled={!canSelect}
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      selected
                        ? 'bg-blue-600 text-white'
                        : canSelect
                          ? 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'
                          : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}
                    title={
                      selected ? 'Already selected' :
                      courseIdSelected ? 'Another section of this course is selected' :
                      course.isAlreadyRegistered ? 'Already enrolled' :
                      !course.prerequisitesMet ? 'Prerequisites not met' :
                      !isRegistrationOpen ? 'Registration closed' :
                      'Add to selection'
                    }
                  >
                    {selected ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    )}
                  </button>
                </div>

                {/* Schedule */}
                {course.schedule.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {course.schedule.map((s, i) => (
                      <span key={i} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">
                        {DAY_OF_WEEK_LABELS[s.day as keyof typeof DAY_OF_WEEK_LABELS]?.substring(0, 3)} {fmtTime(s.startTime)}-{fmtTime(s.endTime)}
                        {s.type !== undefined && <span className="text-slate-400 ml-1">({SCHEDULE_TYPE_LABELS[s.type as keyof typeof SCHEDULE_TYPE_LABELS]?.substring(0, 3)})</span>}
                      </span>
                    ))}
                  </div>
                )}

                {/* Seats */}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                  <span>{course.currentEnrolled}/{course.maxCapacity} enrolled</span>
                  <span>{course.seatsRemaining} seats left</span>
                </div>

                {/* Prereqs Warning */}
                {!course.prerequisitesMet && course.unmetPrerequisites.length > 0 && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg text-[11px] text-amber-700">
                    <span className="font-semibold">Prerequisites needed:</span>{' '}
                    {course.unmetPrerequisites.map(p => p.courseCode).join(', ')}
                  </div>
                )}

                {course.isAlreadyRegistered && (
                  <div className="mt-2 text-[11px] text-emerald-600 font-medium">✓ Already enrolled</div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 text-xs text-slate-400 text-center">
        {filtered.length} course{filtered.length !== 1 ? 's' : ''} shown
      </div>
    </div>
  );
}
