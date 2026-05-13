import React, { useMemo } from 'react';
import type { ScheduleEntry } from '@/types/student';
import { DAY_OF_WEEK_LABELS, SCHEDULE_TYPE_LABELS } from '@/lib/enums';
import type { ClientScheduleConflict } from './useRegistrationDraft';

interface ScheduleBlock {
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  day: number;
  startTime: string;
  endTime: string;
  type: number;
  color: string;
  isEnrolled: boolean;
}

interface Props {
  selectedSchedules: { courseInstanceId: number; courseCode: string; courseName: string; schedule: ScheduleEntry[]; isEnrolled: boolean }[];
  conflicts: ClientScheduleConflict[];
}

// Generate consistent colors for courses
const COURSE_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-emerald-100 border-emerald-300 text-emerald-800',
  'bg-violet-100 border-violet-300 text-violet-800',
  'bg-amber-100 border-amber-300 text-amber-800',
  'bg-rose-100 border-rose-300 text-rose-800',
  'bg-cyan-100 border-cyan-300 text-cyan-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-teal-100 border-teal-300 text-teal-800',
  'bg-indigo-100 border-indigo-300 text-indigo-800',
];

function timeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

// Display days: Saturday through Thursday (typical Middle East university week)
const DISPLAY_DAYS = [6, 0, 1, 2, 3, 4]; // Sat, Sun, Mon, Tue, Wed, Thu

const GRID_START = 8 * 60;   // 8:00 AM
const GRID_END = 18 * 60;    // 6:00 PM
const SLOT_HEIGHT = 3;        // rem per hour

export default function WeeklyScheduleGrid({ selectedSchedules, conflicts }: Props) {
  const blocks = useMemo(() => {
    const result: ScheduleBlock[] = [];
    selectedSchedules.forEach((course, idx) => {
      const color = COURSE_COLORS[idx % COURSE_COLORS.length];
      course.schedule.forEach(s => {
        result.push({
          courseInstanceId: course.courseInstanceId,
          courseCode: course.courseCode,
          courseName: course.courseName,
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          type: s.type,
          color,
          isEnrolled: course.isEnrolled,
        });
      });
    });
    return result;
  }, [selectedSchedules]);

  const hasConflict = (courseInstanceId: number) =>
    conflicts.some(c => c.courseInstanceId1 === courseInstanceId || c.courseInstanceId2 === courseInstanceId);

  const hours: number[] = [];
  for (let h = GRID_START / 60; h < GRID_END / 60; h++) {
    hours.push(h);
  }

  if (blocks.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
        <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-medium text-slate-500">Schedule Preview</p>
        <p className="text-xs text-slate-400 mt-1">Select courses to see your weekly timetable</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Weekly Schedule</h3>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header Row */}
          <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-slate-100">
            <div className="p-2 text-[10px] font-medium text-slate-400 uppercase">Time</div>
            {DISPLAY_DAYS.map(day => (
              <div key={day} className="p-2 text-[11px] font-bold text-slate-600 text-center border-l border-slate-100">
                {DAY_OF_WEEK_LABELS[day as keyof typeof DAY_OF_WEEK_LABELS]?.substring(0, 3)}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="relative grid grid-cols-[60px_repeat(6,1fr)]">
            {/* Time labels */}
            <div className="relative">
              {hours.map(h => (
                <div key={h} className="border-b border-slate-50 flex items-start" style={{ height: `${SLOT_HEIGHT}rem` }}>
                  <span className="text-[10px] text-slate-400 px-1.5 pt-0.5">
                    {h.toString().padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DISPLAY_DAYS.map(day => (
              <div key={day} className="relative border-l border-slate-100">
                {/* Hour grid lines */}
                {hours.map(h => (
                  <div key={h} className="border-b border-slate-50" style={{ height: `${SLOT_HEIGHT}rem` }} />
                ))}

                {/* Course blocks */}
                {blocks.filter(b => b.day === day).map((block, idx) => {
                  const startMin = timeToMinutes(block.startTime);
                  const endMin = timeToMinutes(block.endTime);
                  const topPx = ((startMin - GRID_START) / 60) * SLOT_HEIGHT;
                  const heightPx = ((endMin - startMin) / 60) * SLOT_HEIGHT;
                  const conflict = hasConflict(block.courseInstanceId);

                  return (
                    <div
                      key={`${block.courseInstanceId}-${idx}`}
                      className={`absolute left-0.5 right-0.5 rounded-md border px-1.5 py-1 overflow-hidden transition-all ${
                        conflict
                          ? 'bg-rose-100 border-rose-400 text-rose-800 ring-1 ring-rose-300'
                          : block.color
                      } ${block.isEnrolled ? 'opacity-60' : ''}`}
                      style={{
                        top: `${topPx}rem`,
                        height: `${heightPx}rem`,
                        minHeight: '1.5rem',
                        zIndex: conflict ? 10 : 5,
                      }}
                      title={`${block.courseCode} - ${block.courseName}\n${block.startTime.substring(0, 5)} - ${block.endTime.substring(0, 5)}\n${SCHEDULE_TYPE_LABELS[block.type as keyof typeof SCHEDULE_TYPE_LABELS] ?? ''}`}
                    >
                      <p className="text-[10px] font-bold truncate leading-tight">{block.courseCode}</p>
                      {heightPx >= 2.5 && (
                        <p className="text-[9px] truncate opacity-80">{block.startTime.substring(0, 5)}-{block.endTime.substring(0, 5)}</p>
                      )}
                      {conflict && (
                        <span className="absolute top-0.5 right-0.5 text-[8px]">⚠️</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2.5 border-t border-slate-100 flex flex-wrap gap-3 text-[10px] text-slate-500">
        {selectedSchedules.map((course, idx) => (
          <div key={course.courseInstanceId} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-sm border ${COURSE_COLORS[idx % COURSE_COLORS.length].split(' ').slice(0, 2).join(' ')}`} />
            <span>{course.courseCode} {course.isEnrolled ? '(enrolled)' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
