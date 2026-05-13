import React from 'react';
import type { DraftCourse } from '@/types/student';
import type { ClientScheduleConflict } from './useRegistrationDraft';
import { DAY_OF_WEEK_LABELS } from '@/lib/enums';

interface Props {
  courses: DraftCourse[];
  conflicts: ClientScheduleConflict[];
  validationErrors: string[];
  onRemove: (courseInstanceId: number) => void;
  onClear: () => void;
  onSubmit: () => void;
  submitting: boolean;
  isRegistrationOpen: boolean;
  totalSelectedCredits: number;
  registeredHours: number;
  maxCreditHours: number;
}

function fmtTime(t: string) {
  return t?.substring(0, 5) || t;
}

export default function SelectedCoursesPanel({
  courses, conflicts, validationErrors, onRemove, onClear, onSubmit,
  submitting, isRegistrationOpen, totalSelectedCredits, registeredHours, maxCreditHours
}: Props) {
  const hasConflict = (courseInstanceId: number) =>
    conflicts.some(c => c.courseInstanceId1 === courseInstanceId || c.courseInstanceId2 === courseInstanceId);

  const canSubmit = courses.length > 0 && validationErrors.length === 0 && isRegistrationOpen && !submitting;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          Selected ({courses.length})
        </h3>
        {courses.length > 0 && (
          <button
            onClick={onClear}
            className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10">
          <svg className="w-10 h-10 mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-xs font-medium">No courses selected</p>
          <p className="text-[11px] mt-1">Select courses from the left panel</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ maxHeight: 'calc(100vh - 440px)' }}>
          {courses.map(course => {
            const isConflict = hasConflict(course.courseInstanceId);
            return (
              <div
                key={course.courseInstanceId}
                className={`border rounded-lg p-3 transition-all ${
                  isConflict
                    ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-bold text-blue-600">{course.courseCode}</span>
                      <span className="text-[10px] text-slate-400">{course.creditHours} CR</span>
                      {isConflict && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                          Conflict!
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-700 truncate">{course.courseName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{course.doctorName}</p>
                    {course.schedule.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {course.schedule.map((s, i) => (
                          <span key={i} className="text-[9px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded">
                            {DAY_OF_WEEK_LABELS[s.day as keyof typeof DAY_OF_WEEK_LABELS]?.substring(0, 3)} {fmtTime(s.startTime)}-{fmtTime(s.endTime)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onRemove(course.courseInstanceId)}
                    className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Remove"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {validationErrors.map((err, i) => (
            <div key={i} className="text-[11px] bg-rose-50 text-rose-700 px-3 py-2 rounded-lg border border-rose-200 flex items-start gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {err}
            </div>
          ))}
        </div>
      )}

      {/* Conflict Details */}
      {conflicts.length > 0 && (
        <div className="mt-2 space-y-1">
          {conflicts.map((c, i) => (
            <div key={i} className="text-[10px] bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-lg border border-amber-200">
              ⚡ {c.courseName1} ↔ {c.courseName2} ({DAY_OF_WEEK_LABELS[c.day as keyof typeof DAY_OF_WEEK_LABELS]})
            </div>
          ))}
        </div>
      )}

      {/* Summary & Submit */}
      {courses.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Selected Credits</span>
            <span className="font-bold text-slate-800">{totalSelectedCredits}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>Projected Total</span>
            <span className={`font-bold ${registeredHours + totalSelectedCredits > maxCreditHours ? 'text-rose-600' : 'text-slate-800'}`}>
              {registeredHours + totalSelectedCredits} / {maxCreditHours}
            </span>
          </div>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit Registration
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
