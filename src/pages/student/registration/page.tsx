import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchRegistrationStatus, fetchAvailableCourses, fetchMyRegistrationCourses, registerForCourse, dropCourse } from '@/lib/studentPortalApi';
import type { RegistrationStatus, AvailableCourse, RegistrationRegisteredCourse } from '@/types/student';
import { COURSE_AVAILABILITY_LABELS, DAY_OF_WEEK_LABELS } from '@/lib/enums';

type Tab = 'available' | 'registered';
type ToastItem = { id: number; type: 'success' | 'error'; text: string };

let toastId = 0;

export default function StudentRegistration() {
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [courses, setCourses] = useState<AvailableCourse[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<RegistrationRegisteredCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('available');
  const [search, setSearch] = useState('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'register' | 'drop';
    course: AvailableCourse | RegistrationRegisteredCourse;
    enrollmentId?: number;
  } | null>(null);

  const addToast = useCallback((type: 'success' | 'error', text: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [s, c, r] = await Promise.all([
        fetchRegistrationStatus(),
        fetchAvailableCourses(),
        fetchMyRegistrationCourses(),
      ]);
      setStatus(s);
      setCourses(c.courses);
      setRegisteredCourses(r.courses);
    } catch {
      // keep existing data
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const availableCourses = useMemo(() => courses.filter((c) => !c.isAlreadyRegistered), [courses]);

  const filteredAvailable = useMemo(() => {
    if (!search.trim()) return availableCourses;
    const q = search.toLowerCase();
    return availableCourses.filter(
      (c) =>
        c.courseCode.toLowerCase().includes(q) ||
        c.courseName.toLowerCase().includes(q) ||
        c.doctorName.toLowerCase().includes(q)
    );
  }, [availableCourses, search]);

  const filteredRegistered = useMemo(() => {
    if (!search.trim()) return registeredCourses;
    const q = search.toLowerCase();
    return registeredCourses.filter(
      (c) =>
        c.courseCode.toLowerCase().includes(q) ||
        c.courseName.toLowerCase().includes(q) ||
        c.doctorName.toLowerCase().includes(q)
    );
  }, [registeredCourses, search]);

  const handleConfirmRegister = useCallback(async () => {
    if (!confirmAction || confirmAction.type !== 'register') return;
    setPendingId(confirmAction.course.courseInstanceId);
    setConfirmAction(null);
    try {
      await registerForCourse(confirmAction.course.courseInstanceId);
      addToast('success', `Successfully registered for ${confirmAction.course.courseCode}!`);
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      addToast('error', message);
    } finally {
      setPendingId(null);
    }
  }, [confirmAction, addToast, refresh]);

  const handleConfirmDrop = useCallback(async () => {
    if (!confirmAction || confirmAction.type !== 'drop' || confirmAction.enrollmentId === undefined) return;
    const { course, enrollmentId } = confirmAction;
    setPendingId(course.courseInstanceId);
    setConfirmAction(null);
    try {
      const res = await dropCourse(enrollmentId);
      addToast('success', `${course.courseCode} dropped successfully.`);
      if (res.belowMinimumWarning) {
        addToast('error', '⚠️ You are now below the minimum required credit hours.');
      }
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Drop failed.';
      addToast('error', message);
    } finally {
      setPendingId(null);
    }
  }, [confirmAction, addToast, refresh]);

  const availabilityColor = (status: number) => {
    if (status === 0) return 'bg-emerald-50 text-emerald-600';
    if (status === 1) return 'bg-amber-50 text-amber-600';
    if (status === 2) return 'bg-red-50 text-red-600';
    return 'bg-blue-50 text-blue-600';
  };

  const formatSchedule = (slots: AvailableCourse['schedule']) =>
    slots.map((s) => `${DAY_OF_WEEK_LABELS[s.day as 0 | 1 | 2 | 3 | 4 | 5 | 6].slice(0, 3)} ${s.startTime.slice(0, 5)}`).join(', ');

  return (
    <div>
      {/* Toast Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-[fadeUp_0.2s_ease-out] max-w-xs ${
              t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-slate-800 mb-2">
              {confirmAction.type === 'register' ? 'Confirm Registration' : 'Confirm Drop'}
            </h3>
            <p className="text-sm text-slate-600 mb-1">
              {confirmAction.type === 'register'
                ? `Register for ${confirmAction.course.courseName} (${confirmAction.course.creditHours} credit hours)?`
                : `Drop ${confirmAction.course.courseName}?`}
            </p>
            {confirmAction.type === 'register' && status && (
              <p className="text-xs text-slate-400 mb-4">
                This will bring your total to {status.registeredHours + confirmAction.course.creditHours} / {status.maxCreditHours} credit hours.
              </p>
            )}
            {confirmAction.type === 'drop' && status && (
              <p className="text-xs text-slate-400 mb-4">
                This will reduce your total to {Math.max(0, status.registeredHours - confirmAction.course.creditHours)} credit hours.
                {(status.registeredHours - confirmAction.course.creditHours) < status.minCreditHours && (
                  <span className="block mt-1 text-amber-600">⚠️ This puts you below the minimum required credit hours ({status.minCreditHours}).</span>
                )}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-slate-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAction.type === 'register' ? handleConfirmRegister : handleConfirmDrop}
                className={`flex-1 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                  confirmAction.type === 'register' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmAction.type === 'register' ? 'Confirm Registration' : 'Confirm Drop'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-slate-800">Course Registration</h1>
        {status && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">
              {status.registeredHours} / {status.maxCreditHours} credits
            </span>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min((status.registeredHours / status.maxCreditHours) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Registration Status Banner */}
      {status && (
        <div className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
          status.isOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          <i className={status.isOpen ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'} />
          {status.isOpen
            ? `Registration is OPEN${status.closesOn ? ` — Closes on ${new Date(status.closesOn).toLocaleDateString()}` : ''}`
            : `Registration is CLOSED${status.opensOn ? ` — Opens on ${new Date(status.opensOn).toLocaleDateString()}` : ''}`}
        </div>
      )}

      {/* Summary Card */}
      {status && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-slate-800">{status.registeredHours}</p>
              <p className="text-[10px] text-slate-400">Registered Hours</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{status.minCreditHours}</p>
              <p className="text-[10px] text-slate-400">Minimum Required</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{status.remainingHours}</p>
              <p className="text-[10px] text-slate-400">Remaining Available</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading courses...
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'available' as Tab, label: `Available Courses (${availableCourses.length})` },
          { id: 'registered' as Tab, label: `My Registered (${registeredCourses.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              tab === t.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code, name, or doctor..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
        />
      </div>

      {/* Available Courses Tab */}
      {tab === 'available' && (
        <div className="space-y-3">
          {filteredAvailable.map((course) => {
            const isLoading = pendingId === course.courseInstanceId;
            const canRegister = status?.isOpen && course.prerequisitesMet && course.availabilityStatus !== 2 && course.seatsRemaining > 0;
            const wouldExceed = status ? (status.registeredHours + course.creditHours) > status.maxCreditHours : false;
            const isDisabled = !canRegister || wouldExceed || isLoading;

            return (
              <div key={course.courseInstanceId} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-800">{course.courseName}</h3>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500">{course.courseCode}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${availabilityColor(course.availabilityStatus)}`}>
                        {COURSE_AVAILABILITY_LABELS[course.availabilityStatus as 0 | 1 | 2 | 3]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{course.doctorName}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <i className="ri-time-line" />
                        {course.creditHours} cr
                      </span>
                      {course.schedule.length > 0 && (
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line" />
                          {formatSchedule(course.schedule)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <i className="ri-user-line" />
                        {course.seatsRemaining}/{course.maxCapacity} seats
                      </span>
                    </div>
                    {/* Warnings */}
                    <div className="flex gap-1 flex-wrap mt-1">
                      {!course.prerequisitesMet && (
                        <span className="inline-block px-2 py-0.5 rounded bg-red-50 text-[10px] text-red-600 font-medium">
                          Prerequisites not met: {course.unmetPrerequisites.join(', ')}
                        </span>
                      )}
                      {wouldExceed && (
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-[10px] text-amber-600 font-medium">
                          Would exceed max credit hours
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Register Button */}
                  <button
                    type="button"
                    onClick={() => !isDisabled && setConfirmAction({ type: 'register', course })}
                    disabled={isDisabled}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isLoading
                        ? 'bg-gray-100 text-gray-400'
                        : isDisabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" />...</span>
                    ) : (
                      'Register'
                    )}
                  </button>
                </div>
                {/* Seat progress bar */}
                <div className="mt-3">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        course.enrollmentPercentage >= 100 ? 'bg-red-500' : course.enrollmentPercentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(course.enrollmentPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && filteredAvailable.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">
                {search ? 'No courses match your search.' : 'No available courses found.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Registered Courses Tab */}
      {tab === 'registered' && (
        <div className="space-y-3">
          {registeredCourses.length > 0 && (
            <p className="text-xs text-slate-500 mb-2">
              You are registered for {registeredCourses.length} courses ({status?.registeredHours ?? 0} credit hours)
            </p>
          )}
          {filteredRegistered.map((course) => {
            const isLoading = pendingId === course.courseInstanceId;
            return (
              <div key={course.courseInstanceId} className="bg-white rounded-xl border border-emerald-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-800">{course.courseName}</h3>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500">{course.courseCode}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] text-emerald-600 font-medium">Registered</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{course.doctorName}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>{course.creditHours} cr</span>
                      {course.schedule.length > 0 && (
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line" />
                          {formatSchedule(course.schedule)}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Drop Button */}
                  <button
                    type="button"
                    onClick={() => !isLoading && status?.isOpen && setConfirmAction({ type: 'drop', course, enrollmentId: course.enrollmentId })}
                    disabled={isLoading || !status?.isOpen}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isLoading || !status?.isOpen
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-red-200 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" />...</span>
                    ) : (
                      'Drop'
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {!loading && filteredRegistered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">
                {search ? 'No courses match your search.' : 'You have not registered for any courses yet.'}
              </p>
              <button
                type="button"
                onClick={() => setTab('available')}
                className="mt-2 text-xs text-emerald-600 hover:underline"
              >
                Browse available courses →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}