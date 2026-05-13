import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  RegistrationStatusData,
  AvailableCourse,
  RegisteredCoursesData,
  SubmitRegistrationResponse,
  ScheduleEntry,
} from '@/types/student';
import {
  fetchRegistrationStatus,
  fetchAvailableCourses,
  fetchRegisteredCourses,
  submitRegistration,
  dropCourse,
} from '@/lib/studentRegistrationApi';
import { useRegistrationDraft } from './useRegistrationDraft';
import CreditHoursSummary from './CreditHoursSummary';
import AvailableCoursesList from './AvailableCoursesList';
import SelectedCoursesPanel from './SelectedCoursesPanel';
import WeeklyScheduleGrid from './WeeklyScheduleGrid';
import EnrolledCoursesList from './EnrolledCoursesList';

type TabId = 'register' | 'enrolled';

export default function StudentRegistrationPage() {
  // --- Tab ---
  const [activeTab, setActiveTab] = useState<TabId>('register');

  // --- Data State ---
  const [regStatus, setRegStatus] = useState<RegistrationStatusData | null>(null);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [registeredData, setRegisteredData] = useState<RegisteredCoursesData | null>(null);

  // --- Loading State ---
  const [statusLoading, setStatusLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [enrolledLoading, setEnrolledLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Messages ---
  const [submitResult, setSubmitResult] = useState<SubmitRegistrationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- Derived values ---
  const isRegistrationOpen = regStatus?.status === 0;
  const registeredHours = regStatus?.registeredHours ?? 0;
  const maxCreditHours = regStatus?.maxCreditHours ?? 21;

  // Enrolled course schedules for conflict checking against existing enrollments
  const enrolledSchedules = useMemo(() => {
    if (!registeredData?.courses) return [];
    return registeredData.courses
      .filter(c => c.status === 0) // only Enrolled
      .map(c => ({
        courseInstanceId: c.courseInstanceId,
        courseName: c.courseName,
        entries: c.schedule,
      }));
  }, [registeredData]);

  // --- Draft Hook ---
  const {
    selectedCourses,
    addCourse,
    removeCourse,
    clearDraft,
    isSelected,
    isCourseIdSelected,
    totalSelectedCredits,
    conflicts,
    validationErrors,
  } = useRegistrationDraft(maxCreditHours, registeredHours, enrolledSchedules);

  // --- Data Fetching ---
  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const data = await fetchRegistrationStatus();
      if (data) setRegStatus(data);
    } catch (err) {
      console.error('Failed to load registration status:', err);
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const loadAvailableCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const courses = await fetchAvailableCourses();
      setAvailableCourses(courses);
    } catch (err) {
      console.error('Failed to load available courses:', err);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  const loadRegisteredCourses = useCallback(async () => {
    setEnrolledLoading(true);
    try {
      const data = await fetchRegisteredCourses();
      if (data) setRegisteredData(data);
    } catch (err) {
      console.error('Failed to load registered courses:', err);
    } finally {
      setEnrolledLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    loadAvailableCourses();
    loadRegisteredCourses();
  }, [loadStatus, loadAvailableCourses, loadRegisteredCourses]);

  // --- Actions ---
  const handleAddCourse = useCallback((course: AvailableCourse) => {
    setErrorMessage(null);
    setSubmitResult(null);
    addCourse(course);
  }, [addCourse]);

  const handleSubmit = useCallback(async () => {
    if (selectedCourses.length === 0 || validationErrors.length > 0) return;

    setSubmitting(true);
    setErrorMessage(null);
    setSubmitResult(null);

    try {
      const ids = selectedCourses.map(c => c.courseInstanceId);
      const result = await submitRegistration(ids);
      setSubmitResult(result);
      clearDraft();
      // Refresh data after successful registration
      await Promise.all([loadStatus(), loadAvailableCourses(), loadRegisteredCourses()]);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedCourses, validationErrors, clearDraft, loadStatus, loadAvailableCourses, loadRegisteredCourses]);

  const handleDrop = useCallback(async (enrollmentId: number) => {
    if (!confirm('Are you sure you want to drop this course?')) return;
    setActionLoading(true);
    try {
      await dropCourse(enrollmentId);
      await Promise.all([loadStatus(), loadAvailableCourses(), loadRegisteredCourses()]);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to drop course');
    } finally {
      setActionLoading(false);
    }
  }, [loadStatus, loadAvailableCourses, loadRegisteredCourses]);

  // --- Schedule data for the grid ---
  const allScheduleData = useMemo(() => {
    const enrolled = (registeredData?.courses ?? [])
      .filter(c => c.status === 0)
      .map(c => ({
        courseInstanceId: c.courseInstanceId,
        courseCode: c.courseCode,
        courseName: c.courseName,
        schedule: c.schedule,
        isEnrolled: true,
      }));

    const selected = selectedCourses.map(c => ({
      courseInstanceId: c.courseInstanceId,
      courseCode: c.courseCode,
      courseName: c.courseName,
      schedule: c.schedule,
      isEnrolled: false,
    }));

    return [...enrolled, ...selected];
  }, [registeredData, selectedCourses]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Course Registration</h1>
              <div className="flex items-center gap-2 mt-1">
                {statusLoading ? (
                  <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                ) : (
                  <>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isRegistrationOpen
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isRegistrationOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {isRegistrationOpen ? 'Open' : 'Closed'}
                    </span>
                    {regStatus?.registrationCloseDate && (
                      <span className="text-xs text-slate-400">
                        Closes: {new Date(regStatus.registrationCloseDate).toLocaleDateString()}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              {([
                { id: 'register' as TabId, label: 'Register', icon: '📝' },
                { id: 'enrolled' as TabId, label: 'My Courses', icon: '📚' },
              ]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="mr-1.5">{tab.icon}</span>{tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Messages */}
      {submitResult && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-emerald-800">{submitResult.message}</p>
              <div className="flex gap-4 mt-1 text-xs text-emerald-600">
                {submitResult.totalRegistered > 0 && <span>✓ {submitResult.totalRegistered} enrolled</span>}
                {submitResult.totalWaitlisted > 0 && <span>⏳ {submitResult.totalWaitlisted} waitlisted</span>}
              </div>
            </div>
            <button onClick={() => setSubmitResult(null)} className="ml-auto text-emerald-400 hover:text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-rose-700">{errorMessage}</p>
            <button onClick={() => setErrorMessage(null)} className="ml-auto text-rose-400 hover:text-rose-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'register' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Available Courses */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                  Available Courses
                </h2>
                <AvailableCoursesList
                  courses={availableCourses}
                  onSelect={handleAddCourse}
                  isSelected={isSelected}
                  isCourseIdSelected={isCourseIdSelected}
                  isRegistrationOpen={isRegistrationOpen}
                  loading={coursesLoading}
                />
              </div>
            </div>

            {/* Middle: Selected Courses + Credit Summary */}
            <div className="lg:col-span-3 space-y-4">
              {regStatus && (
                <CreditHoursSummary
                  status={regStatus}
                  selectedCredits={totalSelectedCredits}
                />
              )}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <SelectedCoursesPanel
                  courses={selectedCourses}
                  conflicts={conflicts}
                  validationErrors={validationErrors}
                  onRemove={removeCourse}
                  onClear={clearDraft}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                  isRegistrationOpen={isRegistrationOpen}
                  totalSelectedCredits={totalSelectedCredits}
                  registeredHours={registeredHours}
                  maxCreditHours={maxCreditHours}
                />
              </div>
            </div>

            {/* Right: Weekly Schedule Grid */}
            <div className="lg:col-span-5">
              <WeeklyScheduleGrid
                selectedSchedules={allScheduleData}
                conflicts={conflicts}
              />
            </div>
          </div>
        )}

        {activeTab === 'enrolled' && (
          <div>
            {enrolledLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : (
              <EnrolledCoursesList
                courses={registeredData?.courses ?? []}
                totalCreditHours={registeredData?.totalCreditHours ?? 0}
                onDrop={handleDrop}
                actionLoading={actionLoading}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}