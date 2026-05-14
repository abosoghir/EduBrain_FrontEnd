// ============================================================
// Doctor Portal Types — Aligned with API_Integration_DoctorPortal.md
// Base URL: /api/doctor
// ============================================================

// ---- Dashboard ----

export interface DoctorDashboardScheduleSlot {
  courseScheduleId: number;
  startTime: string;         // "09:00:00"
  endTime: string;           // "10:30:00"
  courseCode: string;
  courseName: string;
  roomName: string;
  type: number;              // ScheduleType enum: 0=Lecture, 1=Lab, 2=Tutorial
}

export interface DoctorDashboardAnnouncement {
  notificationId: number;
  title: string;
  type: number;              // NotificationType enum
  sentDate: string;
  recipientsCount: number;
}

export interface DoctorDashboardData {
  coursesThisSemester: number;
  totalStudents: number;
  pendingQuizzes: number;
  eventsSentToday: number;
  todaySchedule: DoctorDashboardScheduleSlot[];
  recentAnnouncements: DoctorDashboardAnnouncement[];
}

// ---- My Courses ----

export interface DoctorCourse {
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  semesterName: string;
  enrolledCount: number;
  maxCapacity: number;
  enrollmentPercentage: number;
}

export interface DoctorCoursesResponse {
  courses: DoctorCourse[];
}

// ---- Course Students (GET /api/doctor/courses/{id}/students) ----

export interface DoctorCourseStudent {
  studentId: number;
  studentCode: string;
  studentName: string;
  profilePictureUrl: string | null;
  section: string;
  attendancePercentage?: number | null;
  status: number;            // EnrollmentStatus: 0=Enrolled, 1=Waitlisted, 2=Dropped, 3=Completed, 4=Failed
}

export interface DoctorCourseStudentsResponse {
  courseInstanceId: number;
  courseName: string;
  students: DoctorCourseStudent[];
}

// ---- Course Materials (GET /api/doctor/courses/{id}/materials) ----

export interface DoctorCourseMaterial {
  materialId: number;
  title: string;
  type: number;              // MaterialType: 1=File, 2=Link
  contentUrl: string;
  createdOn: string;
  downloadCount: number;
  isVisible: boolean;
}

export interface DoctorMaterialWeek {
  weekNumber: number;
  materials: DoctorCourseMaterial[];
}

export interface DoctorCourseMaterialsResponse {
  courseInstanceId: number;
  weeks: DoctorMaterialWeek[];
}

export interface CreateMaterialForm {
  title: string;
  type: number;              // 1=File, 2=Link
  contentUrl?: string;
  file?: File;
}

// ---- Course Detail (composite — assembled from multiple endpoints) ----

export interface DoctorCourseDetail {
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  semesterName: string;
  enrolledCount: number;
  maxCapacity: number;
}

// ---- Schedule (GET /api/doctor/schedule) ----

export interface DoctorScheduleSlot {
  courseScheduleId: number;
  startTime: string;
  endTime: string;
  courseCode: string;
  courseName: string;
  roomName: string;
  type: number;              // ScheduleType: 0=Lecture, 1=Lab, 2=Tutorial
  colorCode: string;
}

export interface DoctorScheduleDay {
  day: number;               // DayOfWeek: 0=Sunday … 6=Saturday
  slots: DoctorScheduleSlot[];
}

export interface DoctorScheduleData {
  totalSessions: number;
  lectureSessions: number;
  labSessions: number;
  totalHoursPerWeek: number;
  weeklySchedule: DoctorScheduleDay[];
}

// ---- Attendance ----

// GET /api/doctor/attendance/sessions
export interface DoctorAttendanceStudent {
  studentId: number;
  studentCode: string;
  studentName: string;
  profilePictureUrl: string | null;
  currentStatus: number | null;  // AttendanceStatus: 0=Present, 1=Absent, 2=Late; null = not marked
}

export interface DoctorAttendanceSession {
  courseInstanceId: number;
  courseName: string;
  selectedDate: string;
  weekNumber: number;
  attendanceAlreadyTaken: boolean;
  students: DoctorAttendanceStudent[];
}

// POST /api/doctor/attendance
export interface AttendanceStudentRecord {
  studentId: number;
  status: number;            // 0=Present, 1=Absent, 2=Late
}

export interface RecordAttendanceRequest {
  courseInstanceId: number;
  date: string;
  weekNumber: number;
  notes?: string;
  students: AttendanceStudentRecord[];
}

// GET /api/doctor/courses/{id}/attendance-summary
export interface DoctorAttendanceSummaryStudent {
  studentId: number;
  studentCode: string;
  studentName: string;
  sessionsAttended: number;
  sessionsAbsent: number;
  totalSessions: number;
  attendancePercentage?: number | null;
  warningStatus: number;     // 0=Good, 1=Warning, 2=Danger
}

export interface DoctorAttendanceSummary {
  courseInstanceId: number;
  courseName: string;
  totalSessions: number;
  students: DoctorAttendanceSummaryStudent[];
}

// ---- Grades (GET /api/doctor/courses/{id}/grades) ----

export interface GradeWeights {
  midterm: number;
  final: number;
  practical: number;
  quizzes: number;
  oral: number;
  total: number;
}

export interface DoctorGradeStudent {
  enrollmentId: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  midterm: number | null;
  final: number | null;
  practical: number | null;
  quizzes: number | null;
  oral: number | null;
  totalScore: number | null;
  letterGrade: number | null; // Grade enum
}

export interface DoctorGradesData {
  courseInstanceId: number;
  courseName: string;
  weights: GradeWeights;
  students: DoctorGradeStudent[];
}

// PUT /api/doctor/enrollments/{enrollmentId}/grades
export interface SubmitGradesRequest {
  midterm?: number | null;
  final?: number | null;
  practical?: number | null;
  quizzes?: number | null;
  oral?: number | null;
}

// ---- Announcements (GET /api/doctor/announcements) ----

export interface DoctorAnnouncement {
  notificationId: number;
  title: string;
  messagePreview: string;
  type: number;              // NotificationType enum
  sentDate: string;
  recipientsCount: number;
  targetCourseNames: string[];
}

export interface DoctorAnnouncementsPaginatedList {
  items: DoctorAnnouncement[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface DoctorAnnouncementsResponse {
  announcements: DoctorAnnouncementsPaginatedList;
  totalSentToday: number;
}

// POST /api/doctor/announcements
export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  type: number;              // NotificationType enum
  target: number;            // AnnouncementTarget: 0=AllMyStudents, 1=SpecificCourse, 2=SpecificStudents
  courseInstanceId?: number | null;
  studentIds?: number[] | null;
  sendInApp?: boolean;
  sendEmail?: boolean;
  sendSms?: boolean;
}

export interface CreateAnnouncementResponse {
  notificationId: number;
  recipientsCount: number;
  sentAt: string;
}

// ---- Profile (GET /api/doctor/profile) ----

export interface DoctorProfile {
  userId: string;
  email: string;
  phoneNumber: string | null;
  profilePictureUrl: string | null;
  doctorId: number;
  title: number;             // DoctorTitle enum
  departmentName: string;
  officeRoomName: string | null;
  totalCourses: number;
  totalStudents: number;
}

// PUT /api/doctor/profile
export interface UpdateDoctorProfileRequest {
  phoneNumber?: string;
  profilePictureUrl?: string;
  officeRoomId?: number | null;
}
