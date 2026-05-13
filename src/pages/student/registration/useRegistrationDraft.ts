import { useState, useCallback, useMemo, useEffect } from 'react';
import type { AvailableCourse, DraftCourse, ScheduleEntry } from '@/types/student';

const STORAGE_KEY = 'edubrain_registration_draft';

function loadDraft(): DraftCourse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DraftCourse[];
  } catch { /* ignore parse errors */ }
  return [];
}

function saveDraft(courses: DraftCourse[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch { /* ignore quota errors */ }
}

export interface ClientScheduleConflict {
  courseInstanceId1: number;
  courseName1: string;
  courseInstanceId2: number;
  courseName2: string;
  day: number;
}

function detectClientConflicts(
  selectedSchedules: { courseInstanceId: number; courseName: string; entries: ScheduleEntry[] }[],
  enrolledSchedules: { courseInstanceId: number; courseName: string; entries: ScheduleEntry[] }[]
): ClientScheduleConflict[] {
  const all = [...selectedSchedules, ...enrolledSchedules];
  const conflicts: ClientScheduleConflict[] = [];

  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i];
      const b = all[j];
      if (a.courseInstanceId === b.courseInstanceId) continue;

      for (const sa of a.entries) {
        for (const sb of b.entries) {
          if (sa.day !== sb.day) continue;
          // Parse times for comparison
          const aStart = sa.startTime;
          const aEnd = sa.endTime;
          const bStart = sb.startTime;
          const bEnd = sb.endTime;
          if (aStart < bEnd && bStart < aEnd) {
            const exists = conflicts.some(c =>
              (c.courseInstanceId1 === a.courseInstanceId && c.courseInstanceId2 === b.courseInstanceId) ||
              (c.courseInstanceId1 === b.courseInstanceId && c.courseInstanceId2 === a.courseInstanceId)
            );
            if (!exists) {
              conflicts.push({
                courseInstanceId1: a.courseInstanceId,
                courseName1: a.courseName,
                courseInstanceId2: b.courseInstanceId,
                courseName2: b.courseName,
                day: sa.day,
              });
            }
          }
        }
      }
    }
  }
  return conflicts;
}

export interface UseRegistrationDraftReturn {
  selectedCourses: DraftCourse[];
  addCourse: (course: AvailableCourse) => boolean;
  removeCourse: (courseInstanceId: number) => void;
  clearDraft: () => void;
  isSelected: (courseInstanceId: number) => boolean;
  isCourseIdSelected: (courseId: number) => boolean;
  totalSelectedCredits: number;
  conflicts: ClientScheduleConflict[];
  validationErrors: string[];
}

export function useRegistrationDraft(
  maxCreditHours: number,
  registeredHours: number,
  enrolledSchedules: { courseInstanceId: number; courseName: string; entries: ScheduleEntry[] }[]
): UseRegistrationDraftReturn {
  const [selectedCourses, setSelectedCourses] = useState<DraftCourse[]>(loadDraft);

  // Persist to localStorage on change
  useEffect(() => {
    saveDraft(selectedCourses);
  }, [selectedCourses]);

  const addCourse = useCallback((course: AvailableCourse): boolean => {
    // Duplicate instance check
    if (selectedCourses.some(c => c.courseInstanceId === course.courseInstanceId)) return false;
    // Duplicate base course check
    if (selectedCourses.some(c => c.courseId === course.courseId)) return false;

    const draft: DraftCourse = {
      courseInstanceId: course.courseInstanceId,
      courseId: course.courseId,
      courseCode: course.courseCode,
      courseName: course.courseName,
      creditHours: course.creditHours,
      courseType: course.courseType,
      doctorName: course.doctorName,
      schedule: course.schedule,
      maxCapacity: course.maxCapacity,
      currentEnrolled: course.currentEnrolled,
      availabilityStatus: course.availabilityStatus,
    };
    setSelectedCourses(prev => [...prev, draft]);
    return true;
  }, [selectedCourses]);

  const removeCourse = useCallback((courseInstanceId: number) => {
    setSelectedCourses(prev => prev.filter(c => c.courseInstanceId !== courseInstanceId));
  }, []);

  const clearDraft = useCallback(() => {
    setSelectedCourses([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isSelected = useCallback((courseInstanceId: number) => {
    return selectedCourses.some(c => c.courseInstanceId === courseInstanceId);
  }, [selectedCourses]);

  const isCourseIdSelected = useCallback((courseId: number) => {
    return selectedCourses.some(c => c.courseId === courseId);
  }, [selectedCourses]);

  const totalSelectedCredits = useMemo(() => {
    return selectedCourses.reduce((sum, c) => sum + c.creditHours, 0);
  }, [selectedCourses]);

  const conflicts = useMemo(() => {
    const selectedScheduleData = selectedCourses.map(c => ({
      courseInstanceId: c.courseInstanceId,
      courseName: c.courseName,
      entries: c.schedule,
    }));
    return detectClientConflicts(selectedScheduleData, enrolledSchedules);
  }, [selectedCourses, enrolledSchedules]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (registeredHours + totalSelectedCredits > maxCreditHours) {
      errors.push(`Total hours (${registeredHours + totalSelectedCredits}) exceed maximum (${maxCreditHours})`);
    }
    if (conflicts.length > 0) {
      errors.push(`${conflicts.length} schedule conflict(s) detected`);
    }
    // Duplicate base course check
    const courseIds = selectedCourses.map(c => c.courseId);
    const duplicateIds = courseIds.filter((id, i) => courseIds.indexOf(id) !== i);
    if (duplicateIds.length > 0) {
      errors.push('Duplicate course selections detected');
    }
    return errors;
  }, [registeredHours, totalSelectedCredits, maxCreditHours, conflicts, selectedCourses]);

  return {
    selectedCourses,
    addCourse,
    removeCourse,
    clearDraft,
    isSelected,
    isCourseIdSelected,
    totalSelectedCredits,
    conflicts,
    validationErrors,
  };
}
