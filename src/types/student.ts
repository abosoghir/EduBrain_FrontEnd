// ============================================================
// Student Portal Types -- Aligned with API_Integration_StudentPortal.md
// Base URL: /api/student
// ============================================================

// ---- Dashboard (GET /api/student/dashboard) ----

export interface StudentDashboardScheduleSlot {
  courseCode: string;
  courseName: string;
  startTime: string;       // "09:00:00"
  endTime: string;         // "10:30:00"
  roomName: string;
  scheduleType: number;    // ScheduleType: 0=Lecture, 1=Lab, 2=Tutorial
}

export interface StudentDashboardNotification {
  notificationId: number;
  title: string;
  message: string;
  type: number;            // NotificationType enum
  sentDate: string;
  isRead: boolean;
}

export interface StudentDashboardExam {
  examScheduleId: number;
  courseCode: string;
  courseName: string;
  examType: number;        // ExamType: 0=Midterm, 1=Final, 2=Practical, 3=Oral
  examDate: string;
  startTime: string;
  hallName: string;
  daysRemaining: number;
}

export interface StudentDashboardData {
  studentName: string;
  academicYear: string;
  yearLevel: number;
  yearLevelDisplay: string;
  registeredCoursesCount: number;
  totalCreditHours: number;
  registeredHours: number;
  cumulativeGPA: number;
  upcomingExamsCount: number;
  unreadNotificationsCount: number;
  todaySchedule: StudentDashboardScheduleSlot[];
  recentNotifications: StudentDashboardNotification[];
  upcomingExams: StudentDashboardExam[];
}

// ---- Registration Status (GET /api/student/registration/status) ----

export interface RegistrationStatus {
  isOpen: boolean;
  opensOn: string | null;
  closesOn: string | null;
  registeredHours: number;
  maxCreditHours: number;
  minCreditHours: number;
  remainingHours: number;
}

// ---- Available Courses (GET /api/student/registration/available-courses) ----

export interface AvailableCourseScheduleSlot {
  day: number;             // DayOfWeek enum
  startTime: string;
  endTime: string;
}

export interface AvailableCourse {
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  doctorName: string;
  schedule: AvailableCourseScheduleSlot[];
  maxCapacity: number;
  currentEnrolled: number;
  seatsRemaining: number;
  enrollmentPercentage: number;
  availabilityStatus: number;  // CourseAvailabilityStatus: 0=Open,1=AlmostFull,2=Full,3=WaitlistAvailable
  isAlreadyRegistered: boolean;
  hasPrerequisites: boolean;
  prerequisitesMet: boolean;
  unmetPrerequisites: string[];
}

export interface AvailableCoursesResponse {
  courses: AvailableCourse[];
}

// ---- Register for Course (POST /api/student/registration/register) ----

export interface RegisterCourseRequest {
  courseInstanceId: number;
}

export interface RegisterCourseResponse {
  enrollmentId: number;
  courseCode: string;
  courseName: string;
  status: number;
  registrationDate: string;
}

// ---- Drop Course (DELETE /api/student/registration/drop/{enrollmentId}) ----

export interface DropCourseResponse {
  enrollmentId: number;
  newTotalHours: number;
  belowMinimumWarning: boolean;
}

// ---- My Courses (GET /api/student/courses) ----

export interface StudentCourse {
  enrollmentId: number;
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  doctorName: string;
  doctorAvatarUrl: string | null;
  attendancePercentage: number;
  currentGrade: number | null;
  status: number;          // EnrollmentStatus: 0=Enrolled, 1=Waitlisted
}

export interface StudentCoursesResponse {
  totalCourses: number;
  totalCreditHours: number;
  courses: StudentCourse[];
}

// ---- Course Detail (GET /api/student/courses/{courseInstanceId}) ----

export interface CourseGradeWeights {
  midterm: number;
  final: number;
  practical: number;
  quizzes: number;
  oral: number;
}

export interface CourseCurrentGrades {
  midterm: number | null;
  final: number | null;
  practical: number | null;
  quizzes: number | null;
  oral: number | null;
  totalScore: number | null;
  letterGrade: number | null;  // Grade enum
  status: string;              // "In Progress" | "Passed" | "Failed"
}

export interface CourseAttendanceSummary {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
  hasWarning: boolean;
}

export interface StudentCourseDetail {
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  doctorName: string;
  doctorAvatarUrl: string | null;
  enrollmentDate: string;
  departmentName: string;
  gradeWeights: CourseGradeWeights;
  currentGrades: CourseCurrentGrades;
  attendance: CourseAttendanceSummary;
}

// ---- Course Materials (GET /api/student/courses/{courseInstanceId}/materials) ----

export interface StudentCourseMaterial {
  materialId: number;
  title: string;
  type: number;            // MaterialType: 1=File, 2=Link
  contentUrl: string;
  createdOn: string;
  downloadCount: number;
  isVisible: boolean;
}

export interface StudentCourseMaterialWeek {
  weekNumber: number;
  materials: StudentCourseMaterial[];
}

export interface StudentCourseMaterialsResponse {
  weeks: StudentCourseMaterialWeek[];
}

// ---- Course Attendance Detail (GET /api/student/courses/{courseInstanceId}/attendance) ----

export interface StudentAttendanceSession {
  attendanceId: number;
  date: string;
  weekNumber: number;
  status: number;          // AttendanceStatus: 0=Present, 1=Absent, 2=Late
  notes: string | null;
}

export interface CourseAttendanceDetail {
  courseInstanceId: number;
  courseName: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  attendancePercentage: number;
  hasWarning: boolean;
  sessions: StudentAttendanceSession[];
}

// ---- Schedule (GET /api/student/schedule/weekly) ----

export interface StudentScheduleSlot {
  courseScheduleId: number;
  courseCode: string;
  courseName: string;
  startTime: string;
  endTime: string;
  roomName: string;
  type: number;            // ScheduleType: 0=Lecture, 1=Lab, 2=Tutorial
  doctorName: string;
  colorCode: string;
}

export interface StudentScheduleDay {
  day: number;             // DayOfWeek: 0=Sunday...6=Saturday
  slots: StudentScheduleSlot[];
}

export interface StudentScheduleListItem {
  courseScheduleId: number;
  day: number;
  startTime: string;
  endTime: string;
  courseCode: string;
  courseName: string;
  doctorName: string;
  roomName: string;
  type: number;
}

export interface StudentScheduleData {
  semesterName: string;
  weeklySchedule: StudentScheduleDay[];
  listView: StudentScheduleListItem[];
}

// ---- Grades (GET /api/student/grades) ----

export interface AvailableSemester {
  semesterId: number;
  name: string;
  isCurrent: boolean;
}

export interface StudentGrade {
  enrollmentId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  midterm: number | null;
  final: number | null;
  practical: number | null;
  quizzes: number | null;
  oral: number | null;
  totalScore: number | null;
  letterGrade: number | null;  // Grade enum
  gradePoints: number | null;
  status: string;              // "In Progress" | "Passed" | "Failed"
}

export interface StudentGradesData {
  availableSemesters: AvailableSemester[];
  selectedSemesterId: number;
  selectedSemesterName: string;
  semesterGPA: number | null;
  creditHours: number;
  academicStanding: string;
  isDeansListEligible: boolean;
  grades: StudentGrade[];
  cumulativeGPA: number;
  totalCreditHoursEarned: number;
}

// ---- GPA History (GET /api/student/grades/gpa-history) ----

export interface GpaHistoryEntry {
  semesterId: number;
  semesterName: string;
  semesterGPA: number;
  cumulativeGPA: number;
  creditHoursAttempted: number;
  creditHoursEarned: number;
}

export interface GpaHistoryData {
  history: GpaHistoryEntry[];
}

// ---- Attendance Overview (GET /api/student/attendance) ----

export interface CourseAttendanceOverview {
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  attendedSessions: number;
  totalSessions: number;
  attendancePercentage: number;
  statusBadge: number;     // 0=Normal(>=85%), 1=Warning(75-84%), 2=Danger(<75%)
}

export interface StudentAttendanceData {
  overallAttendanceRate: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  courseAttendances: CourseAttendanceOverview[];
}

// ---- Exam Schedule (GET /api/student/exam-schedule) ----

export interface StudentExam {
  examScheduleId: number;
  courseCode: string;
  courseName: string;
  examType: number;        // ExamType: 0=Midterm, 1=Final, 2=Practical, 3=Oral
  examDate: string;
  day: number;
  startTime: string;
  endTime: string;
  hallName: string;
  seatNumber: number | null;
  daysRemaining: number;
  notes: string | null;
}

export interface NextExamSummary {
  examScheduleId: number;
  courseName: string;
  examType: number;
  examDate: string;
  startTime: string;
  hallName: string;
  seatNumber: number | null;
  daysRemaining: number;
}

export interface StudentExamData {
  totalExams: number;
  daysToFirstExam: number | null;
  firstExamDate: string | null;
  nextExamCourseName: string | null;
  nextExam: NextExamSummary | null;
  exams: StudentExam[];
}

// ---- Fees (GET /api/student/fees) ----

export interface FeeBreakdownItem {
  feeType: string;
  amount: number;
  status: number;          // 0=Paid, 1=Unpaid
  paidDate: string | null;
}

export interface PaymentHistoryItem {
  id: number;
  paymentDate: string;
  amount: number;
  method: number;          // PaymentMethod: 0=Cash,1=Card,2=Online,3=BankTransfer
  receiptNumber: string;
}

export interface StudentFeesData {
  availableSemesters: AvailableSemester[];
  selectedSemesterId: number;
  selectedSemesterName: string;
  totalDue: number;
  amountPaid: number;
  remainingAmount: number;
  paidPercentage: number;
  paymentStatus: number;   // 0=Paid, 1=Unpaid, 2=PartiallyPaid
  dueDate: string | null;
  isOverdue: boolean;
  feeBreakdown: FeeBreakdownItem[];
  paymentHistory: PaymentHistoryItem[];
}

// ---- Notifications (GET /api/student/notifications) ----

export interface StudentNotification {
  notificationId: number;
  title: string;
  message: string;
  preview: string;
  type: number;            // NotificationType enum
  typeLabel: string;
  sentDate: string;
  senderName: string;
  isRead: boolean;
  readAt: string | null;
}

export interface StudentNotificationsPage {
  items: StudentNotification[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface StudentNotificationsData {
  unreadCount: number;
  notifications: StudentNotificationsPage;
}

// ---- Profile (GET /api/student/profile) ----

export interface StudentProfile {
  studentId: number;
  studentCode: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  profilePictureUrl: string | null;
  yearLevel: number;       // YearLevel enum
  yearLevelDisplay: string;
  departmentName: string;
  academicAdvisorName: string | null;
  cumulativeGPA: number;
  totalCreditHours: number;
  nationalId: string | null;
  nationality: string | null;
  gender: number;          // Gender: 0=Male, 1=Female
  genderDisplay: string;
  religion: string | null;
  dateOfBirth: string | null;
  address: string | null;
  city: string | null;
  fatherPhone: string | null;
  fatherJob: string | null;
  previousQualification: string | null;
}

export interface UpdateStudentProfileRequest {
  phoneNumber?: string;
  address?: string;
  city?: string;
  fatherPhone?: string;
  fatherJob?: string;
}
