// ============================================================
// Admin Types — Aligned with Backend API Contract
// API Integration Document: API_Integration_AdminPortal.md
// ============================================================

// ---- Generic Paginated Response ----

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ============================================================
// DASHBOARD (GET /api/admin/dashboard/stats)
// ============================================================

export interface DepartmentEnrollment {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  studentCount: number;
  color: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalDoctors: number;
  activeCourses: number;
  currentSemester: string;
  currentSemesterId: number;
  enrollmentByDepartment: DepartmentEnrollment[];
  lastSemesterEnrollmentByDepartment: DepartmentEnrollment[];
  isRegistrationOpen: boolean;
  pendingApprovals: number;
  unpaidFeesCount: number;
  highAbsenceAlerts: number;
}

// GET /api/admin/dashboard/recent-registrations
export interface RecentRegistration {
  enrollmentId: number;
  registrationDate: string;
  studentId: number;
  studentCode: string;
  studentName: string;
  studentYear: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  status: number;
  statusDisplay: string;
  statusColor: string;
}

// GET /api/admin/dashboard/alerts
export interface SystemAlert {
  alertId: number;
  type: number;                 // AlertType enum
  typeDisplay: string;
  title: string;
  description: string;
  severity: string;             // "high" | "medium" | "low"
  actionLink: string;
  createdAt: string;
  isRead: boolean;
}

// ============================================================
// ACADEMIC YEARS (GET /api/admin/academic-years)
// ============================================================

export interface AcademicYearListItem {
  id: number;
  name: string;
  startDate: string;            // ISO 8601
  endDate: string;              // ISO 8601
  semestersCount: number;
}

export interface SemesterItem {
  id: number;
  semesterNumber: number;              // 0=First, 1=Second, 2=Summer
  startDate: string;                   // ISO 8601
  endDate: string;                     // ISO 8601
  midtermStart: string | null;
  midtermEnd: string | null;
  finalExamStart: string | null;
  finalExamEnd: string | null;
  maxCreditHoursPerStudent: number;
  minCreditHoursPerStudent: number;
  tuitionFees: number | null;
  courseInstancesCount: number;
}

export interface ActiveSemesterDropdownItem {
  id: number;
  name: string;
  semesterNumber: number; // 0=FirstSemester, 1=SecondSemester, 2=SummerSemester
  isCurrent: boolean;
}

export interface AcademicYearDetail {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  semesters: SemesterItem[];
}

// Create Academic Year (POST /api/admin/academic-years)
export interface CreateAcademicYearForm {
  name: string;
  startDate: string;
  endDate: string;
}

// Update Academic Year (PUT /api/admin/academic-years/{id})
export interface UpdateAcademicYearForm {
  name?: string;
  startDate?: string;
  endDate?: string;
}

// Create Semester (POST /api/admin/academic-years/{academicYearId}/semesters)
export interface CreateSemesterForm {
  semesterNumber: number;              // 0=First, 1=Second, 2=Summer
  startDate: string;
  endDate: string;
  midtermStart?: string | null;
  midtermEnd?: string | null;
  finalExamStart?: string | null;
  finalExamEnd?: string | null;
  maxCreditHoursPerStudent?: number;   // default 18
  minCreditHoursPerStudent?: number;   // default 12
  tuitionFees?: number | null;
}

// Update Registration Dates (PUT /api/admin/semesters/{semesterId}/registration-dates)
export interface UpdateRegistrationDatesForm {
  addDropDeadline?: string | null;     // date string
  withdrawDeadline?: string | null;    // date string
}

// Update Semester (PUT /api/admin/semesters/{id})
export interface UpdateSemesterForm {
  startDate?: string;
  endDate?: string;
  midtermStart?: string | null;
  midtermEnd?: string | null;
  finalExamStart?: string | null;
  finalExamEnd?: string | null;
  maxCreditHoursPerStudent?: number;
  minCreditHoursPerStudent?: number;
  tuitionFees?: number | null;
}

// ============================================================
// REGISTRATION (GET /api/registration-control/settings)
// ============================================================

export interface RegistrationSettings {
  semesterId: number;
  windowId?: number;
  semesterName: string;
  status: number;                       // 0=Open, 1=Closed
  statusDisplay: string;
  isOpen: boolean;
  registrationOpenDate: string | null;
  registrationCloseDate: string | null;
  daysRemaining: number;
  minCreditHours: number;
  maxCreditHours: number;
  allowWaitlist: boolean;
  totalRegisteredStudents: number;
  coursesWithWaitlist: number;
  studentsNotYetRegistered: number;
  totalEnrollments: number;
  waitlistedEnrollments: number;
}

// PUT /api/registration-control/settings
export interface UpdateRegistrationSettingsForm {
  semesterId: number;
  minCreditHours?: number;
  maxCreditHours?: number;
  allowWaitlist?: boolean;
}

// POST /api/admin/registration/windows
export interface OpenRegistrationWindowForm {
  semesterId: number;
  startDate: string;
  endDate: string;
}

// GET /api/registration-control/activity-log
export interface RegistrationActivityLogItem {
  enrollmentId: number;
  activityDate: string;
  studentId: number;
  studentCode: string;
  studentName: string;
  studentEmail: string;
  studentYear: number;
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  sectionName: string;
  doctorName: string;
  status: number;                       // EnrollmentStatus enum
  statusDisplay: string;
  notes: string;
}

export interface RegistrationActivityLogParams {
  semesterId?: number;
  fromDate?: string;
  toDate?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

export interface RegistrationActivityLogResponse {
  items: RegistrationActivityLogItem[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ============================================================
// COURSES (GET /api/admin/courses)
// ============================================================

export interface CourseListItem {
  id: number;
  name: string;
  code: string;
  description: string;
  creditHours: number;
  theoryHours: number;
  practicalHours: number;
  courseType: number;              // 0=Compulsory, 1=Elective
  passingGrade: number;
  prerequisitesCount: number;
  departmentsCount: number;
  instancesCount: number;
}

export interface CoursePrerequisite {
  id: number;
  courseCode: string;
  courseName: string;
}

export interface CourseDepartment {
  id: number;
  departmentType: string;         // "ComputerScience", "SoftwareEngineering", etc.
  code: string;
}

export interface CourseInstance {
  id: number;
  semesterName: string;
  doctorName: string;
  maxCapacity: number;
  currentEnrolled: number;
  isFull: boolean;
}

export interface CourseDetail {
  id: number;
  name: string;
  code: string;
  description: string;
  creditHours: number;
  theoryHours: number;
  practicalHours: number;
  price: number | null;
  pricePerCreditHour: number | null;
  courseType: number;
  passingGrade: number;
  prerequisites: CoursePrerequisite[];
  departments: CourseDepartment[];
  instances: CourseInstance[];
}

// Create Course (POST /api/admin/courses)
export interface CreateCourseForm {
  name: string;
  code: string;
  description?: string;
  creditHours: number;
  theoryHours: number;
  practicalHours: number;
  price?: number | null;
  pricePerCreditHour?: number | null;
  courseType: number;
  passingGrade: number;
  departmentIds?: number[];
}

// Update Course (PUT /api/admin/courses/{id})
export interface UpdateCourseForm {
  name?: string;
  code?: string;
  description?: string;
  creditHours?: number;
  theoryHours?: number;
  practicalHours?: number;
  price?: number | null;
  pricePerCreditHour?: number | null;
  courseType?: number;
  passingGrade?: number;
}

// Create Course Instance (POST /api/admin/courses/{courseId}/instances)
export interface CreateCourseInstanceForCourseForm {
  semesterId: number;
  doctorId: number;
  maxCapacity: number;
}

// ============================================================
// COURSE INSTANCES (GET /api/admin/course-instances)
// ============================================================

export interface CourseInstanceListItem {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  semesterId: number;
  semesterName: string;
  doctorId: number;
  doctorName: string;
  doctorTitle: number;
  doctorTitleDisplay: string;
  maxCapacity: number;
  currentEnrolled: number;
  enrollmentPercentage: number;
  status: string; // "Open" | "Full"
}

export interface CourseInstanceListParams {
  semesterId?: number;
  departmentId?: number;
  doctorId?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}

// Create Course Instance (POST /api/admin/course-instances)
export interface CreateCourseInstanceForm {
  courseId: number;
  semesterId: number;
  doctorId: number;
  maxCapacity: number;
}

// Update Course Instance (PUT /api/admin/course-instances/{id})
export interface UpdateCourseInstanceForm {
  doctorId?: number;
  maxCapacity?: number;
}

export interface EnrollmentListItem {
  enrollmentId: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  enrollmentDate: string;
  status: string;
}

// ============================================================
// DEPARTMENTS (GET /api/admin/departments)
// ============================================================

export interface DepartmentListItem {
  id: number;
  departmentType: number;              // 0=General … 5=CyberSecurity
  code: string;
  description: string;
  studentsCount: number;
  doctorsCount: number;
  coursesCount: number;
  headOfDepartmentId: number | null;
  headOfDepartmentName: string | null;
}

export interface DeptStudent {
  id: number;
  name: string;
  email: string;
  yearLevel: string;                   // "Sophomore", "Junior", etc.
}

export interface DeptDoctor {
  id: number;
  name: string;
  email: string;
  title: string;                       // "Professor", "AssistantProfessor", etc.
}

export interface DeptCourse {
  id: number;
  code: string;
  name: string;
  creditHours: number;
}

export interface DepartmentDetail {
  id: number;
  departmentType: string;              // "ComputerScience", "General", etc.
  code: string;
  description: string;
  headOfDepartmentId: number | null;
  headOfDepartmentName: string | null;
  studentsCount: number;
  doctorsCount: number;
  coursesCount: number;
  students: DeptStudent[];
  doctors: DeptDoctor[];
  courses: DeptCourse[];
}

// Create Department (POST /api/admin/departments)
export interface CreateDepartmentForm {
  departmentType: number;              // 0=General … 5=CyberSecurity
  code: string;
  description?: string;
}

// Update Department (PUT /api/admin/departments/{id})
export interface UpdateDepartmentForm {
  code?: string;
  description?: string;
}

// ============================================================
// USERS (GET /api/admin/users)
// ============================================================

export interface UserListItem {
  id: number;
  fullName: string;
  email: string;
  role: string;              // "Student" | "Doctor" | "Advisor"
  roleDisplay: string;
  departmentName: string;
  status: string;            // "Active" | "Inactive"
  details: StudentDetails | DoctorDetails | AdvisorDetails;
}

export interface StudentDetails {
  yearLevel: number;
  yearLevelDisplay: string;
  gpa: number;
}

export interface DoctorDetails {
  title: number;
  titleDisplay: string;
}

export interface AdvisorDetails {
  adviseesCount: number;
}

export interface UserListParams {
  role?: string;
  departmentId?: number;
  yearLevel?: number;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// Update User Status (PUT /api/admin/users/{id}/status)
export interface UpdateUserStatusForm {
  status: string; // "Active" | "Inactive"
}

// ---- Student List (GET /api/students) — kept for backward compat ----

export interface StudentListItem {
  id: number;
  studentCode: string;
  fullName: string;
  email: string;
  photoUrl: string | null;
  yearLevel: number;
  departmentName: string;
  departmentCode: string;
  cumulativeGPA: number;
  status: string;
  academicAdvisorName: string | null;
}

export interface StudentListParams {
  searchTerm?: string;
  year?: number;
  departmentId?: number;
  status?: number;
  page?: number;
  pageSize?: number;
}

// ---- Student Detail ----

export interface StudentCourse {
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  doctorName: string;
  status: number;
}

export interface GPATrendItem {
  semesterName: string;
  gpa: number;
}

export interface ScheduleEntry {
  courseName: string;
  courseCode: string;
  day: number;
  startTime: string;
  endTime: string;
  roomName: string;
  scheduleType: number;
  doctorName: string;
}

export interface GradeEntry {
  enrollmentId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  midterm: number;
  final: number;
  practical: number;
  quizzes: number;
  oral: number;
  totalGrade: number;
  letterGrade: number;
  gradePoints: number;
  status: string;
}

export interface SemesterGPAItem {
  semesterName: string;
  semesterGPA: number;
  cumulativeGPA: number;
  creditHoursAttempted: number;
  creditHoursEarned: number;
}

export interface AttendanceEntry {
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  totalLectures: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
  hasAbsenceWarning: boolean;
}

export interface FeeInfo {
  studentFeeId: number;
  semesterName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: number;
}

export interface Installment {
  id: number;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: number;
  paidDate: string | null;
}

export interface PaymentHistoryEntry {
  id: number;
  amount: number;
  paymentDate: string;
  method: number;
  notes: string;
}

export interface StudentDetail {
  id: number;
  studentCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  photoUrl: string | null;
  yearLevel: number;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  cumulativeGPA: number;
  generalGrade: number;
  totalCreditHours: number;
  isOnAcademicProbation: boolean;
  academicAdvisorName: string | null;
  nationality: string;
  gender: number;
  religion: string;
  dateOfBirth: string;
  address: string;
  city: string;
  fatherPhone: string;
  fatherJob: string;
  previousQualification: string;
  nationalId: string;
  currentCourses: StudentCourse[];
  gpaTrend: GPATrendItem[];
  weeklySchedule: ScheduleEntry[];
  grades: GradeEntry[];
  semesterGPAHistory: SemesterGPAItem[];
  courseAttendances: AttendanceEntry[];
  currentFees: FeeInfo | null;
  installments: Installment[];
  paymentHistory: PaymentHistoryEntry[];
}

// Create Student (POST /api/users/students)
export interface CreateStudentForm {
  email: string;
  name: string;
  phoneNumber: string;
  nationalId: string;
  yearLevel: number;
  departmentId?: number;
  academicAdvisorId?: number;
}

// Update Student (PUT /api/students/{studentId})
export interface UpdateStudentForm {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  nationalId?: string;
  yearLevel?: number;
  semesterNumber?: number;
  departmentId?: number;
  academicAdvisorId?: number;
  nationality?: string;
  gender?: number;
  religion?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  fatherPhone?: string;
  fatherJob?: string;
  previousQualification?: string;
}

export interface UpdateStudentResponse {
  studentId: number;
  fullName: string;
  email: string;
  message: string;
}

// ---- Doctor List ----

export interface DoctorListItem {
  id: number;
  doctorCode: string;
  fullName: string;
  email: string;
  photoUrl: string | null;
  title: number;
  departmentName: string;
  departmentCode: string;
  specialization: string;
  officeRoom: string;
  activeCoursesCount: number;
  isDepartmentHead: boolean;
  status: string;
}

export interface DoctorListParams {
  searchTerm?: string;
  departmentId?: number;
  title?: number;
  page?: number;
  pageSize?: number;
}

export interface DoctorCourseItem {
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  enrolledStudents: number;
  maxCapacity: number;
  semesterName: string;
  yearLevel: number;
  status: string;
}

export interface DoctorScheduleEntry {
  courseCode: string;
  courseName: string;
  day: number;
  startTime: string;
  endTime: string;
  roomName: string;
  scheduleType: number;
}

export interface RatingBreakdown {
  starRating: number;
  count: number;
  percentage: number;
}

export interface DoctorReview {
  id: number;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
  courseName: string;
}

export interface DoctorDetail {
  id: number;
  doctorCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  photoUrl: string | null;
  title: number;
  nationalId: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  isDepartmentHead: boolean;
  officeRoomId: number;
  officeRoomName: string;
  officeLocation: string;
  totalCoursesTaught: number;
  activeCoursesCount: number;
  totalStudentsEnrolled: number;
  yearsOfExperience: number;
  joinDate: string;
  currentCourses: DoctorCourseItem[];
  pastCourses: DoctorCourseItem[];
  weeklySchedule: DoctorScheduleEntry[];
  averageRating: number;
  totalRatings: number;
  ratingBreakdown: RatingBreakdown[];
  recentReviews: DoctorReview[];
}

// Create Doctor (POST /api/users/doctors)
export interface CreateDoctorForm {
  email: string;
  name: string;
  phoneNumber: string;
  nationalId: string;
  title: number;               // 0=Professor … 4=TeachingAssistant
  departmentId: number;
  officeRoomId?: number;
}

// Update Doctor (PUT /api/doctors/{doctorId})
export interface UpdateDoctorForm {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  nationalId?: string;
  title?: number;
  departmentId?: number;
  officeRoomId?: number;
}

export interface UpdateDoctorResponse {
  doctorId: number;
  fullName: string;
  email: string;
  message: string;
}

// ---- Advisor List ----

export interface AdvisorListItem {
  id: number;
  advisorCode: string;
  fullName: string;
  email: string;
  photoUrl: string | null;
  officeRoom: string;
  assignedStudentsCount: number;
}

export interface AdvisorListParams {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

export interface AdvisorDetail {
  id: number;
  advisorCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  photoUrl: string | null;
  officeRoomId: number | null;
  officeRoom: string;
  assignedStudentsCount: number;
}

// Create Advisor (POST /api/admin/users/advisors)
export interface CreateAdvisorForm {
  email: string;
  name: string;
  phoneNumber: string;
  nationalId: string;
  officeRoomId?: number;
}

// Update Advisor (PUT /api/admin/users/advisors/{id})
export interface UpdateAdvisorForm {
  name: string;
  phoneNumber: string;
  officeRoomId?: number;
}

// ============================================================
// ROOMS (GET /api/admin/rooms)
// ============================================================

export interface RoomListItem {
  id: number;
  name: string;
  location: string;
  capacity: number;
  hasProjector: boolean;
  hasSmartBoard: boolean;
  roomType: number;              // 0=Office, 1=LectureHall, 2=Lab, 3=ExamHall
}

export interface RoomScheduleEntry {
  id: number;
  courseName: string;
  courseCode: string;
  doctorName: string;
  day: number;
  startTime: string;
  endTime: string;
  scheduleType: number;
}

export interface RoomExamScheduleEntry {
  id: number;
  courseName: string;
  courseCode: string;
  examDate: string;
  startTime: string;
  endTime: string;
  examType: number;
  isPublished: boolean;
}

export interface RoomDetail {
  id: number;
  name: string;
  location: string;
  capacity: number;
  hasProjector: boolean;
  hasSmartBoard: boolean;
  roomType: number;
  schedules: RoomScheduleEntry[];
  examSchedules: RoomExamScheduleEntry[];
}

// Create Room (POST /api/admin/rooms)
export interface CreateRoomForm {
  name: string;
  roomType: number;
  capacity?: number;
  location?: string;
  hasProjector: boolean;
  hasSmartBoard: boolean;
}

// Update Room (PUT /api/admin/rooms/{id})
export interface UpdateRoomForm {
  name?: string;
  roomType?: number;
  capacity?: number;
  location?: string;
  hasProjector?: boolean;
  hasSmartBoard?: boolean;
}

// ============================================================
// COURSE SCHEDULES (GET /api/schedules)
// ============================================================

export interface CourseScheduleItem {
  scheduleId: number;
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  day: number;
  startTime: string;
  endTime: string;
  type: number;
  typeDisplay: string;
  roomId: number | null;
  roomName: string | null;
  roomBuilding: string | null;
  doctorId: number;
  doctorName: string;
  doctorTitle: number;
  departmentId: number;
  departmentName: string;
  enrolledCount: number;
  maxCapacity: number;
  // UI grid helpers
  gridRow: number;
  gridColumn: number;
  durationInHours: number;
}

export interface CourseScheduleFilterParams {
  semesterId?: number;
  departmentId?: number;
  doctorId?: number;
  roomId?: number;
  day?: number;
}

export interface CreateCourseScheduleForm {
  courseInstanceId: number;
  day: number;
  startTime: string;
  endTime: string;
  type: number;
  roomId?: number | null;
}

export interface CreateCourseScheduleResponse {
  scheduleId: number;
  courseCode: string;
  courseName: string;
  day: number;
  startTime: string;
  endTime: string;
  type: string;
  roomName: string | null;
  hasConflict: boolean;
  conflictMessage: string | null;
}

export interface UpdateCourseScheduleForm {
  day?: number;
  startTime?: string;
  endTime?: string;
  type?: number;
  roomId?: number | null;
}

export interface UpdateCourseScheduleResponse {
  scheduleId: number;
  courseCode: string;
  courseName: string;
  day: number;
  startTime: string;
  endTime: string;
  message: string;
}

// ============================================================
// WEEKLY TIMETABLE (GET /api/schedules/timetable)
// ============================================================

export interface TimetableBlock {
  scheduleId: number;
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  day: number;
  startTime: string;
  endTime: string;
  type: number;
  typeDisplay: string;
  roomId: number | null;
  roomName: string | null;
  doctorId: number;
  doctorName: string;
  departmentName: string;
  enrolledCount: number;
  maxCapacity: number;
  gridColumn: number;
  gridRow: number;
  rowSpan: number;
}

export interface WeeklyTimetableResponse {
  blocks: TimetableBlock[];
  totalSchedules: number;
}

// ============================================================
// COURSE INSTANCES DROPDOWN (GET /api/schedules/course-instances)
// ============================================================

export interface CourseInstanceDropdownItem {
  id: number;
  courseCode: string;
  courseName: string;
  doctorName: string;
  currentEnrolled: number;
  maxCapacity: number;
  creditHours: number;
  theoryHours: number;
  practicalHours: number;
  label: string;
}

// ============================================================
// EXAM SCHEDULES (GET /api/exam-schedules)
// ============================================================

export interface ExamScheduleItem {
  examScheduleId: number;
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  yearLevel: number;
  sectionNumber: number;
  enrolledCount: number;
  examType: number;
  examTypeDisplay: string;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: string;
  roomId: number | null;
  roomName: string | null;
  roomBuilding: string | null;
  capacity: number | null;
  isPublished: boolean;
  status: string;
  notes: string | null;
  departmentName: string;
  doctorName: string;
  createdAt: string;
}

export interface ExamScheduleFilterParams {
  semesterId?: number;
  departmentId?: number;
  courseInstanceId?: number;
  startDate?: string;
  endDate?: string;
  examType?: number;
  isPublished?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateExamScheduleForm {
  courseInstanceId: number;
  examType: number;
  examDate: string;
  startTime: string;
  endTime: string;
  roomId?: number | null;
  notes?: string;
  publishImmediately?: boolean;
}

export interface CreateExamScheduleResponse {
  examScheduleId: number;
  courseCode: string;
  courseName: string;
  examType: number;
  examTypeDisplay: string;
  examDate: string;
  startTime: string;
  endTime: string;
  roomName: string | null;
  isPublished: boolean;
  status: string;
  message: string;
}

export interface UpdateExamScheduleForm {
  examDate?: string;
  startTime?: string;
  endTime?: string;
  roomId?: number | null;
  notes?: string;
  publishImmediately?: boolean;
}

export interface UpdateExamScheduleResponse {
  examScheduleId: number;
  courseName: string;
  examType: number;
  examDate: string;
  startTime: string;
  endTime: string;
  isPublished: boolean;
  message: string;
}

// ============================================================
// DROPDOWN OPTIONS
// ============================================================

export interface SemesterOption {
  id: number;
  name: string;
}

export interface DoctorOption {
  id: number;
  fullName: string;
}

export interface DepartmentOption {
  id: number;
  name: string;
}

export interface AdvisorOption {
  id: number;
  fullName: string;
}

export interface RoomOption {
  id: number;
  name: string;
}

export interface CourseOption {
  id: number;
  code: string;
  name: string;
}

// ============================================================
// GRADING MANAGEMENT
// ============================================================

export interface EnrollmentStudentGrade {
  enrollmentId: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  oral: number;
  practical: number;
  quizzes: number;
  midterm: number;
  final: number;
  totalGrade: number;
  letterGrade: string;
  gradePoints: number;
  descriptiveGrade: string;
  isPassed: boolean;
  status: string;
  isGraded: boolean;
}

export interface CourseEnrollmentsData {
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  semesterId: number;
  semesterName: string;
  academicYear: string;
  totalEnrolled: number;
  gradedCount: number;
  passedCount: number;
  failedCount: number;
  students: EnrollmentStudentGrade[];
}

export interface SetGradeForm {
  oral?: number;
  practical?: number;
  quizzes?: number;
  midterm?: number;
  final?: number;
}

export interface SetGradeResponse {
  enrollmentId: number;
  studentId: number;
  studentName: string;
  courseName: string;
  oral: number;
  practical: number;
  quizzes: number;
  midterm: number;
  final: number;
  totalGrade: number;
  letterGrade: string;
  gradePoints: number;
  descriptiveGrade: string;
  isPassed: boolean;
  status: string;
}

export interface AcademicRecordCourse {
  enrollmentId: number;
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  oral: number;
  practical: number;
  quizzes: number;
  midterm: number;
  final: number;
  totalGrade: number;
  letterGrade: string;
  gradePoints: number;
  descriptiveGrade: string;
  isPassed: boolean;
  status: string;
  doctorName: string;
}

export interface AcademicRecordSemester {
  semesterId: number;
  semesterName: string;
  academicYear: string;
  semesterGPA: number;
  cumulativeGPAAtTime: number;
  creditHoursAttempted: number;
  creditHoursEarned: number;
  courses: AcademicRecordCourse[];
}

export interface AcademicRecordData {
  studentId: number;
  studentName: string;
  department: string;
  currentCumulativeGPA: number;
  generalGrade: string;
  descriptiveGrade: string;
  totalCreditHoursEarned: number;
  totalCreditHoursAttempted: number;
  isInGoodStanding: boolean;
  isOnAcademicProbation: boolean;
  qualifiesForHonors: boolean;
  hasAnyFailures: boolean;
  studyYears: number;
  semesters: AcademicRecordSemester[];
  allCourses: AcademicRecordCourse[];
}

// ============================================================
// NOTIFICATIONS MANAGEMENT
// ============================================================

export interface NotificationItem {
  notificationId: number;
  title: string;
  message: string;
  type: number;
  typeDisplay: string;
  sentDate: string;
  senderName: string;
  isRead: boolean;
  readAt: string | null;
  recipientCount: number;
}

export interface NotificationFilterParams {
  studentId?: number;
  type?: number;
  isRead?: boolean;
  page?: number;
  pageSize?: number;
}

export interface SendNotificationForm {
  title: string;
  message: string;
  type: number;
  studentIds?: number[];
  departmentId?: number;
  yearLevel?: number;
  sendToAll?: boolean;
}

export interface SendNotificationResponse {
  notificationId: number;
  recipientCount: number;
  title: string;
  message: string;
}

// ============================================================
// FINANCE MANAGEMENT (FEES)
// ============================================================

export interface SemesterBreakdown {
  totalTuition: number;
  totalAdministrative: number;
  totalServices: number;
  totalFines: number;
}

export interface FeesDashboard {
  totalOutstanding: number;
  totalCollected: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  recentTransactions: number;
  monthlyCollection: number;
  semesterBreakdown: SemesterBreakdown;
}

export interface FeeItem {
  feeItemId: number;
  feeType: number; // FeeType enum
  feeTypeDisplay: string;
  description: string;
  amount: number;
  waivedAmount: number;
}

export interface Payment {
  paymentId: number;
  invoiceId: number;
  invoiceNumber?: string;
  studentId?: number;
  studentName?: string;
  amount: number;
  paymentMethod: number; // PaymentMethod enum
  paymentMethodDisplay: string;
  transactionReference: string;
  paymentDate: string;
  receivedBy: string;
  isRefunded: boolean;
  refundedAmount: number;
}

export interface FeeInvoice {
  invoiceId: number;
  invoiceNumber: string;
  studentId: number;
  studentCode: string;
  studentName: string;
  semesterId: number;
  semesterName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: number; // FeeStatus enum
  statusDisplay: string;
  dueDate: string;
  createdAt: string;
  itemsCount?: number;
  items?: FeeItem[];
  payments?: Payment[];
  notes?: string;
  student?: {
    id: number;
    code: string;
    name: string;
    email: string;
    phone: string;
    departmentName: string;
  };
  semester?: {
    id: number;
    name: string;
  };
}

export interface CreateInvoiceRequest {
  studentId: number;
  semesterId: number;
  dueDate: string;
  items: FeeItemRequest[];
  notes?: string;
}

export interface FeeItemRequest {
  feeItemId?: number; // Needed for update
  feeType: number;
  description: string;
  amount: number;
}

export interface RecordPaymentRequest {
  amount: number;
  paymentMethod: number;
  transactionReference?: string;
  paymentDate: string;
  notes?: string;
}

export interface WaiveFeeRequest {
  amount: number;
  reason: string;
  notes?: string;
}

export interface RefundPaymentRequest {
  amount: number;
  reason: string;
  refundMethod: number; // PaymentMethod
  notes?: string;
}
