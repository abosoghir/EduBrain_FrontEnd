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

// ---- Student Registration (API Integration Student Course Registration) ----

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

export interface StudentRegistrationStatus {
  studentId: number;
  studentCode: string;
  studentName: string;
  studentEmail: string;
  studentYear: number;
  semesterId: number;
  semesterName: string;
  registrationStatus: number;  // 0=Open, 1=Closed
  registrationStatusDisplay: string;
  isRegistrationOpen: boolean;
  registrationCloseDate: string | null;
  daysRemaining: number;
  creditHoursSummary: CreditHoursSummary;
  enrollments: Enrollment[];
  cartItems: CartItem[];
  notifications: RegistrationNotification[];
}

export interface Prerequisite {
  courseId: number;
  courseCode: string;
  courseName: string;
  completed: boolean;
}

export interface Schedule {
  days: string[];
  startTime: string;
  endTime: string;
  room: string;
}

export interface Section {
  sectionId: number;
  sectionName: string;
  instructorId: number;
  instructorName: string;
  schedule: Schedule;
  capacity: number;
  enrolled: number;
  availableSeats: number;
  isFull: boolean;
  waitlistAvailable: boolean;
  currentWaitlistCount: number;
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
  prerequisites: Prerequisite[];
  sections: Section[];
}

export interface CartItem {
  cartItemId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  sectionId: number;
  sectionName: string;
  instructorName: string;
  schedule: Schedule;
  creditHours: number;
  addedAt: string;
  willEnrollAs: string;
  status: string;
  waitlistPosition?: number;
}

export interface CartSummary {
  totalCourses: number;
  totalCredits: number;
  minRequiredCredits: number;
  maxAllowedCredits: number;
  meetsMinimum: boolean;
  withinMaximum: boolean;
  conflicts: any[];
}

export interface CartData {
  cartId: number;
  items: CartItem[];
  summary: CartSummary;
}

export interface AddToCartRequest {
  courseId: number;
  sectionId: number;
}

export interface Attendance {
  // Attendance object shape if needed, otherwise 'any'
  [key: string]: any;
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
  schedule: Schedule;
  creditHours: number;
  status: number; // EnrollmentStatus
  statusDisplay: string;
  enrolledAt: string;
  dropDeadline: string | null;
  canDrop: boolean;
  isWaitlisted: boolean;
  waitlistPosition: number | null;
  grade: string | null;
  attendance: Attendance | null;
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
  attendancePercentage: number;
  hasAttendanceWarning: boolean;
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
}

export interface ChangeStudentPasswordRequest {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
