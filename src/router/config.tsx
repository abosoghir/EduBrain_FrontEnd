import React from 'react';
import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import LoginPage from "../pages/login/page";
import ForgotPasswordPage from "../pages/forgot-password/page";
import ResetPasswordPage from "../pages/reset-password/page";
import ProtectedRoute from "./ProtectedRoute";
import PortalLayout from "../components/layout/PortalLayout";
import { Role } from "../lib/enums";

/* Dashboards */
import AdminDashboard from "../pages/admin/dashboard/page";
import StudentDashboard from "../pages/student/dashboard/page";
import DoctorDashboard from "../pages/doctor/dashboard/page";
import AdvisorDashboard from "../pages/advisor/dashboard/page";

/* Admin */
import AdminStudents from "../pages/admin/users/students/page";
import AdminDoctors from "../pages/admin/users/doctors/page";
import AdminAdvisors from "../pages/admin/users/advisors/page";
import AdminDepartments from "../pages/admin/departments/page";
import AdminCourses from "../pages/admin/courses/page";
import AdminSchedules from "../pages/admin/schedules/page";
import AdminGrading from "../pages/admin/grading/page";
import AdminFees from "../pages/admin/fees/page";
import AdminRooms from "../pages/admin/rooms/page";
import AdminAcademicYears from "../pages/admin/academic-years/page";
import AdminNotifications from "../pages/admin/notifications/page";
import AdminSettings from "../pages/admin/settings/page";

/* Student */
import StudentCourses from "../pages/student/courses/page";
import StudentCourseDetail from "../pages/student/courses/detail/page";
import StudentRegistration from "../pages/student/registration/page";
import StudentSchedule from "../pages/student/schedule/page";
import StudentExams from "../pages/student/exams/page";
import StudentGrades from "../pages/student/grades/page";
import StudentAttendance from "../pages/student/attendance/page";
import StudentFees from "../pages/student/fees/page";
import StudentNotifications from "../pages/student/notifications/page";
import StudentProfile from "../pages/student/profile/page";

/* Doctor */
import DoctorCourses from "../pages/doctor/courses/page";
import DoctorCourseDetail from "../pages/doctor/courses/detail/page";
import DoctorSchedule from "../pages/doctor/schedule/page";
import DoctorAttendance from "../pages/doctor/attendance/page";
import DoctorGrades from "../pages/doctor/grades/page";
import DoctorAnnouncements from "../pages/doctor/announcements/page";
import DoctorProfile from "../pages/doctor/profile/page";

/* Advisor */
import AdvisorStudents from "../pages/advisor/students/page";
import AdvisorStudentDetail from "../pages/advisor/students/detail/page";
import AdvisorWarnings from "../pages/advisor/warnings/page";
import AdvisorScheduleAdjust from "../pages/advisor/schedule-adjustments/page";
import AdvisorFees from "../pages/advisor/fees/page";
import AdvisorNotifications from "../pages/advisor/notifications/page";
import AdvisorProfile from "../pages/advisor/profile/page";

const routes: RouteObject[] = [
  { path: "/", element: <LoginPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },

  /* Admin */
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute allowedRole={Role.Admin}>
        <PortalLayout allowedRole={Role.Admin}><AdminDashboard /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users/students",
    element: (
      <ProtectedRoute allowedRole={Role.Admin}>
        <PortalLayout allowedRole={Role.Admin}><AdminStudents /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users/doctors",
    element: (
      <ProtectedRoute allowedRole={Role.Admin}>
        <PortalLayout allowedRole={Role.Admin}><AdminDoctors /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users/advisors",
    element: (
      <ProtectedRoute allowedRole={Role.Admin}>
        <PortalLayout allowedRole={Role.Admin}><AdminAdvisors /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/departments",
    element: (
      <ProtectedRoute allowedRole={Role.Admin}>
        <PortalLayout allowedRole={Role.Admin}><AdminDepartments /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/courses",
    element: (
      <ProtectedRoute allowedRole={Role.Admin}>
        <PortalLayout allowedRole={Role.Admin}><AdminCourses /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/schedules",
    element: (
      <ProtectedRoute allowedRole={Role.Admin}>
        <PortalLayout allowedRole={Role.Admin}><AdminSchedules /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/grading",
    element: (
      <ProtectedRoute allowedRole={Role.Admin}>
        <PortalLayout allowedRole={Role.Admin}><AdminGrading /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/fees",
    element: (
      <ProtectedRoute allowedRole={Role.Admin}>
        <PortalLayout allowedRole={Role.Admin}><AdminFees /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/rooms",
    element: (
      <ProtectedRoute allowedRole={Role.Admin}>
        <PortalLayout allowedRole={Role.Admin}><AdminRooms /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/academic-years",
    element: (
      <ProtectedRoute allowedRole={Role.Admin}>
        <PortalLayout allowedRole={Role.Admin}><AdminAcademicYears /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/notifications",
    element: (
      <ProtectedRoute allowedRole={Role.Admin}>
        <PortalLayout allowedRole={Role.Admin}><AdminNotifications /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <ProtectedRoute allowedRole={Role.Admin}>
        <PortalLayout allowedRole={Role.Admin}><AdminSettings /></PortalLayout>
      </ProtectedRoute>
    ),
  },

  /* Student */
  {
    path: "/student/dashboard",
    element: (
      <ProtectedRoute allowedRole={Role.Student}>
        <PortalLayout allowedRole={Role.Student}><StudentDashboard /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/courses",
    element: (
      <ProtectedRoute allowedRole={Role.Student}>
        <PortalLayout allowedRole={Role.Student}><StudentCourses /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/courses/:id",
    element: (
      <ProtectedRoute allowedRole={Role.Student}>
        <PortalLayout allowedRole={Role.Student}><StudentCourseDetail /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/registration",
    element: (
      <ProtectedRoute allowedRole={Role.Student}>
        <PortalLayout allowedRole={Role.Student}><StudentRegistration /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/schedule",
    element: (
      <ProtectedRoute allowedRole={Role.Student}>
        <PortalLayout allowedRole={Role.Student}><StudentSchedule /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/exams",
    element: (
      <ProtectedRoute allowedRole={Role.Student}>
        <PortalLayout allowedRole={Role.Student}><StudentExams /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/grades",
    element: (
      <ProtectedRoute allowedRole={Role.Student}>
        <PortalLayout allowedRole={Role.Student}><StudentGrades /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/attendance",
    element: (
      <ProtectedRoute allowedRole={Role.Student}>
        <PortalLayout allowedRole={Role.Student}><StudentAttendance /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/fees",
    element: (
      <ProtectedRoute allowedRole={Role.Student}>
        <PortalLayout allowedRole={Role.Student}><StudentFees /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/notifications",
    element: (
      <ProtectedRoute allowedRole={Role.Student}>
        <PortalLayout allowedRole={Role.Student}><StudentNotifications /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/profile",
    element: (
      <ProtectedRoute allowedRole={Role.Student}>
        <PortalLayout allowedRole={Role.Student}><StudentProfile /></PortalLayout>
      </ProtectedRoute>
    ),
  },

  /* Doctor */
  {
    path: "/doctor/dashboard",
    element: (
      <ProtectedRoute allowedRole={Role.Doctor}>
        <PortalLayout allowedRole={Role.Doctor}><DoctorDashboard /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/doctor/courses",
    element: (
      <ProtectedRoute allowedRole={Role.Doctor}>
        <PortalLayout allowedRole={Role.Doctor}><DoctorCourses /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/doctor/courses/:id",
    element: (
      <ProtectedRoute allowedRole={Role.Doctor}>
        <PortalLayout allowedRole={Role.Doctor}><DoctorCourseDetail /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/doctor/schedule",
    element: (
      <ProtectedRoute allowedRole={Role.Doctor}>
        <PortalLayout allowedRole={Role.Doctor}><DoctorSchedule /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/doctor/attendance",
    element: (
      <ProtectedRoute allowedRole={Role.Doctor}>
        <PortalLayout allowedRole={Role.Doctor}><DoctorAttendance /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/doctor/grades",
    element: (
      <ProtectedRoute allowedRole={Role.Doctor}>
        <PortalLayout allowedRole={Role.Doctor}><DoctorGrades /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/doctor/announcements",
    element: (
      <ProtectedRoute allowedRole={Role.Doctor}>
        <PortalLayout allowedRole={Role.Doctor}><DoctorAnnouncements /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/doctor/profile",
    element: (
      <ProtectedRoute allowedRole={Role.Doctor}>
        <PortalLayout allowedRole={Role.Doctor}><DoctorProfile /></PortalLayout>
      </ProtectedRoute>
    ),
  },

  /* Advisor */
  {
    path: "/advisor/dashboard",
    element: (
      <ProtectedRoute allowedRole={Role.AcademicAdvisor}>
        <PortalLayout allowedRole={Role.AcademicAdvisor}><AdvisorDashboard /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/advisor/students",
    element: (
      <ProtectedRoute allowedRole={Role.AcademicAdvisor}>
        <PortalLayout allowedRole={Role.AcademicAdvisor}><AdvisorStudents /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/advisor/students/:id",
    element: (
      <ProtectedRoute allowedRole={Role.AcademicAdvisor}>
        <PortalLayout allowedRole={Role.AcademicAdvisor}><AdvisorStudentDetail /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/advisor/warnings",
    element: (
      <ProtectedRoute allowedRole={Role.AcademicAdvisor}>
        <PortalLayout allowedRole={Role.AcademicAdvisor}><AdvisorWarnings /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/advisor/schedule-adjustments",
    element: (
      <ProtectedRoute allowedRole={Role.AcademicAdvisor}>
        <PortalLayout allowedRole={Role.AcademicAdvisor}><AdvisorScheduleAdjust /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/advisor/fees",
    element: (
      <ProtectedRoute allowedRole={Role.AcademicAdvisor}>
        <PortalLayout allowedRole={Role.AcademicAdvisor}><AdvisorFees /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/advisor/notifications",
    element: (
      <ProtectedRoute allowedRole={Role.AcademicAdvisor}>
        <PortalLayout allowedRole={Role.AcademicAdvisor}><AdvisorNotifications /></PortalLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/advisor/profile",
    element: (
      <ProtectedRoute allowedRole={Role.AcademicAdvisor}>
        <PortalLayout allowedRole={Role.AcademicAdvisor}><AdvisorProfile /></PortalLayout>
      </ProtectedRoute>
    ),
  },

  { path: "*", element: <NotFound /> },
];

export default routes;