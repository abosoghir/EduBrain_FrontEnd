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

// ---- Student Registration (aligned with actual backend DTOs) ----

// GET /api/student/registration/status → GetRegistrationStatusResponse
export interface RegistrationStatusData {
  status: number;  // RegistrationStatus: 0=Open, 1=Closed
  registrationOpenDate: string | null;
  registrationCloseDate: string | null;
  statusMessage: string | null;
  registeredHours: number;
  maxCreditHours: number;
  minCreditHours: number;
  remainingHours: number;  // computed on backend
  canRegisterMore: boolean; // computed on backend
  meetsMinimumHours: boolean; // computed on backend
}

// Prerequisite info from GetAvailableCourses
export interface PrerequisiteInfo {
  courseId: number;
  courseCode: string;
  courseName: string;
}

// Schedule entry from GetAvailableCourses
export interface ScheduleEntry {
  day: number;  // DayOfWeek: 0=Sunday...6=Saturday
  startTime: string;  // "HH:mm:ss"
  endTime: string;    // "HH:mm:ss"
  type: number; // ScheduleType: 0=Lecture, 1=Lab, 2=Tutorial
}

// GET /api/student/registration/available-courses → AvailableCourseDto
export interface AvailableCourse {
  courseInstanceId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  courseType: number; // CourseType: 0=Compulsory, 1=Elective
  doctorName: string;
  schedule: ScheduleEntry[];
  maxCapacity: number;
  currentEnrolled: number;
  seatsRemaining: number;  // computed
  enrollmentPercentage: number;  // computed
  availabilityStatus: number; // CourseAvailabilityStatus: 0=Open, 1=AlmostFull, 2=Full, 3=WaitlistAvailable
  isAlreadyRegistered: boolean;
  hasPrerequisites: boolean;
  prerequisitesMet: boolean;
  unmetPrerequisites: PrerequisiteInfo[];
}

// GET /api/student/courses/registered → RegisteredCourseDto
export interface RegisteredCourse {
  enrollmentId: number;
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  doctorName: string;
  status: number; // EnrollmentStatus
  enrollmentDate: string;
  schedule: ScheduleEntry[];
}

export interface RegisteredCoursesData {
  totalCreditHours: number;
  courses: RegisteredCourse[];
}

// POST /api/student/registration/validate-batch → BatchValidationResultDto
export interface ScheduleConflict {
  courseInstanceId1: number;
  courseName1: string;
  courseInstanceId2: number;
  courseName2: string;
  conflictDay: number;
  overlapStart: string;
  overlapEnd: string;
}

export interface CourseValidationItem {
  courseInstanceId: number;
  courseName: string;
  isValid: boolean;
  predictedStatus: number; // EnrollmentStatus
  errors: string[];
}

export interface BatchValidationResult {
  isValid: boolean;
  totalCreditHours: number;
  maxCreditHours: number;
  minCreditHours: number;
  currentRegisteredHours: number;
  creditHoursExceeded: boolean;
  scheduleConflicts: ScheduleConflict[];
  duplicateCourses: string[];
  unmetPrerequisites: string[];
  unavailableCourses: string[];
  courseResults: CourseValidationItem[];
}

// POST /api/student/registration/submit → SubmitRegistrationResponse
export interface SubmitRegistrationItemResult {
  courseInstanceId: number;
  courseName: string;
  enrollmentId: number;
  status: number; // EnrollmentStatus
  message: string;
}

export interface SubmitRegistrationResponse {
  success: boolean;
  message: string;
  totalRegistered: number;
  totalWaitlisted: number;
  results: SubmitRegistrationItemResult[];
}

// Client-side draft state (localStorage-backed)
export interface DraftCourse {
  courseInstanceId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  courseType: number;
  doctorName: string;
  schedule: ScheduleEntry[];
  maxCapacity: number;
  currentEnrolled: number;
  availabilityStatus: number;
}

// ---- Legacy types kept for backward compatibility ----
// (used in old registration page sections that haven't been refactored yet)

export interface StudentRegistrationStatus {
  studentId: number;
  studentCode: string;
  studentName: string;
  studentEmail: string;
  studentYear: number;
  semesterId: number;
  semesterName: string;
  registrationStatus: number;
  registrationStatusDisplay: string;
  isRegistrationOpen: boolean;
  registrationCloseDate: string | null;
  daysRemaining: number;
  creditHoursSummary: CreditHoursSummary;
  enrollments: Enrollment[];
  cartItems: CartItem[];
  notifications: RegistrationNotification[];
}

export interface CreditHoursSummary {
  completedCredits: number;
  registeredCredits: number;
  pendingCredits: number;
  currentCredits: number;
  minRequiredCredits: number;
  maxAllowedCredits: number;
  remainingCreditCapacity: number;
}

export interface RegistrationNotification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  createdAt?: string;
}

export interface CourseCatalogItem {
  courseId: number;
  courseCode: string;
  courseName: string;
  courseDescription: string;
  departmentId: number;
  departmentName: string;
  creditHours: number;
  level: number;
  prerequisites: { courseId: number; courseCode: string; courseName: string; completed: boolean }[];
  sections: { sectionId: number; sectionName: string; instructorId: number; instructorName: string; schedule: { days: string[]; startTime: string; endTime: string; room: string }; capacity: number; enrolled: number; availableSeats: number; isFull: boolean; waitlistAvailable: boolean; currentWaitlistCount: number }[];
}

export interface CartItem {
  cartItemId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  sectionId: number;
  sectionName: string;
  instructorName: string;
  schedule: { days: string[]; startTime: string; endTime: string; room: string };
  creditHours: number;
  addedAt: string;
  willEnrollAs: string;
  status: string;
  waitlistPosition?: number;
}

export interface CartData {
  cartId: number;
  items: CartItem[];
  summary: { totalCourses: number; totalCredits: number; minRequiredCredits: number; maxAllowedCredits: number; meetsMinimum: boolean; withinMaximum: boolean; conflicts: any[] };
}

export interface AddToCartRequest {
  courseId: number;
  sectionId: number;
}

export interface Enrollment {
  enrollmentId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  sectionId: number;
  sectionName: string;
  instructorName: string;
  instructorEmail: string;
  schedule: { days: string[]; startTime: string; endTime: string; room: string };
  creditHours: number;
  status: number;
  statusDisplay: string;
  enrolledAt: string;
  dropDeadline: string | null;
  canDrop: boolean;
  isWaitlisted: boolean;
  waitlistPosition: number | null;
  grade: string | null;
  attendance: { [key: string]: any } | null;
}

export interface EnrollmentsData {
  semesterId: number;
  semesterName: string;
  totalCredits: number;
  enrollments: Enrollment[];
  statistics: {
    totalEnrollments: number;
    enrolledCount: number;
    waitlistedCount: number;
    totalCredits: number;
    droppedCount: number;
  };
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
  attendancePercentage?: number | null;
  currentGrade: number | null;
  status: number;          // EnrollmentStatus: 0=Enrolled, 1=Waitlisted
}

export interface StudentCoursesResponse {
  totalCourses: number;
  totalCreditHours: number;
  courses: StudentCourse[];
}

// ---- Course Detail (GET /api/student/courses/{courseInstanceId}) ----

export interface StudentCourseDetail {
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  description: string;
  creditHours: number;
  doctorName: string;
  doctorAvatarUrl: string | null;
  enrollmentId: number;
  enrollmentStatus: number;
  enrollmentDate: string;
  midterm: number | null;
  final: number | null;
  practical: number | null;
  quizzes: number | null;
  oral: number | null;
  totalGrade: number | null;
  letterGrade: number | null;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage?: number | null;
  hasAttendanceWarning: boolean;
}

// ---- Course Materials (GET /api/student/courses/{courseInstanceId}/materials) ----

export interface StudentCourseMaterial {
  materialId: number;
  title: string;
  type: number;            // MaterialType: 1=File, 2=Link
  contentUrl: string | null;
  createdAt: string;
  isLocked: boolean;
}

export interface StudentCourseMaterialWeek {
  weekNumber: number;
  weekTitle: string;
  materials: StudentCourseMaterial[];
  isLocked: boolean;
}

export interface StudentCourseMaterialsResponse {
  courseInstanceId: number;
  courseName: string;
  weeklyMaterials: StudentCourseMaterialWeek[];
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
  attendancePercentage?: number | null;
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

// ---- Course Grades Detailed (GET /api/student/courses/{courseInstanceId}/grades) ----

export interface CourseGradeComponent {
  componentName: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface CourseGradesDetailed {
  courseInstanceId: number;
  courseName: string;
  components: CourseGradeComponent[];
  totalScore: number;
  letterGrade: number; // Grade enum
  gradePoints: number;
  status: string;
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
  attendancePercentage?: number | null;
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
  paymentStatus: number;   // 0=Paid, 1=PartiallyPaid, 2=Unpaid
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
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
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
  nationality?: string;
  gender?: 0 | 1; // 0 = Male, 1 = Female
  religion?: string;
  dateOfBirth?: string; // ISO date string
}

export interface ChangeStudentPasswordRequest {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
