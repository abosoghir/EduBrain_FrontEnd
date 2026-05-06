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

export interface DashboardStats {
  totalStudents: number;
  totalDoctors: number;
  totalCourses: number;
  activeCourseInstances: number;
  registrationStatus: string; // "Open" | "Closed"
  unpaidFeesCount: number;
  currentAcademicYear: string;
  currentSemester: string;
}

export interface ActivityItem {
  id: number;
  event: string;
  performedBy: string;
  timestamp: string;
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
// REGISTRATION (GET /api/admin/registration/status)
// ============================================================

export interface RegistrationStatus {
  semesterId: number;
  semesterName: string;
  status: string; // "Open" | "Closed"
  openedOn: string | null;
  closesOn: string | null;
  totalRegistrations: number;
  pendingApprovals: number;
}

// Open Registration (POST /api/admin/registration/open)
export interface OpenRegistrationForm {
  semesterId: number;
  openDate: string;
  closeDate: string;
}

// Close Registration (POST /api/admin/registration/close)
export interface CloseRegistrationForm {
  semesterId: number;
}

// ============================================================
// COURSES (GET /api/admin/courses)
// ============================================================

export interface GradeWeights {
  midterm: number;
  final: number;
  practical: number;
  quizzes: number;
  oral: number;
}

export interface CourseListItem {
  id: number;
  code: string;
  name: string;
  description: string;
  creditHours: number;
  theoryHours: number;
  practicalHours: number;
  courseType: number;              // 0=Compulsory, 1=Elective
  courseTypeDisplay: string;
  price: number | null;
  pricePerCreditHour: number | null;
  passingGrade: number;
  departments: string[];
  prerequisites: string[];
  gradeWeights: GradeWeights;
}

export interface CoursePrerequisite {
  id: number;
  code: string;
  name: string;
}

export interface CourseDepartment {
  id: number;
  name: string;
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
  code: string;
  name: string;
  description: string;
  creditHours: number;
  theoryHours: number;
  practicalHours: number;
  price: number | null;
  pricePerCreditHour: number | null;
  courseType: number;
  courseTypeDisplay: string;
  passingGrade: number;
  gradeWeights: GradeWeights;
  departments: CourseDepartment[];
  prerequisites: CoursePrerequisite[];
  instances: CourseInstance[];
}

// Create Course (POST /api/admin/courses)
export interface CreateCourseForm {
  code: string;
  name: string;
  description?: string;
  creditHours: number;
  theoryHours: number;
  practicalHours: number;
  courseType: number;
  price?: number;
  pricePerCreditHour?: number;
  passingGrade: number;
  departmentIds: number[];
  prerequisiteIds?: number[];
  gradeWeights: GradeWeights;
}

// Update Course (PUT /api/admin/courses/{id})
export interface UpdateCourseForm {
  code?: string;
  name?: string;
  description?: string;
  creditHours?: number;
  theoryHours?: number;
  practicalHours?: number;
  courseType?: number;
  price?: number;
  pricePerCreditHour?: number;
  passingGrade?: number;
  departmentIds?: number[];
  prerequisiteIds?: number[];
  gradeWeights?: GradeWeights;
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

// Create Student (POST /api/admin/users/students)
export interface CreateStudentForm {
  fullName: string;
  email: string;
  phoneNumber?: string;
  nationalId: string;
  gender: number;              // 0=Male, 1=Female
  dateOfBirth: string;
  nationality: string;
  religion: string;
  address: string;
  city: string;
  fatherPhone: string;
  fatherJob?: string;
  previousQualification?: string;
  departmentId?: number;
  advisorId?: number;
  yearLevel: number;           // 0=Freshman, 1=Sophomore, 2=Junior, 3=Senior
  password: string;
}

export interface CreateStudentResponse {
  id: number;
  studentCode: string;
}

// Update Student (PUT /api/admin/users/{id})
export interface UpdateStudentForm {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  departmentId?: number;
  advisorId?: number;
  yearLevel?: number;
  status?: string;
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

// Create Doctor (POST /api/admin/users/doctors)
export interface CreateDoctorForm {
  fullName: string;
  email: string;
  phoneNumber?: string;
  title: number;               // 0=Professor … 4=TeachingAssistant
  departmentId: number;
  officeRoomId?: number;
  password: string;
}

export interface CreateDoctorResponse {
  id: number;
  doctorCode?: string;
}

// Update Doctor (PUT /api/admin/users/{id})
export interface UpdateDoctorForm {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  title?: number;
  departmentId?: number;
  officeRoomId?: number;
  status?: string;
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
  fullName: string;
  email: string;
  phoneNumber?: string;
  officeRoomId?: number;
  password: string;
}

export interface CreateAdvisorResponse {
  id: number;
  advisorCode?: string;
}

// Update Advisor (PUT /api/admin/users/{id})
export interface UpdateAdvisorForm {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  officeRoomId?: number | null;
  status?: string;
}

// ============================================================
// ROOMS (GET /api/admin/rooms)
// ============================================================

export interface RoomListItem {
  id: number;
  name: string;
  roomType: number;            // 0=LectureHall, 1=Lab, 2=Office
  roomTypeDisplay: string;
  building: string;
  floor: number;
  capacity: number;
  isActive: boolean;
}

// Create Room (POST /api/admin/rooms)
export interface CreateRoomForm {
  name: string;
  roomType: number;
  building: string;
  floor?: number;
  capacity: number;
}

// Update Room (PUT /api/admin/rooms/{id})
export interface UpdateRoomForm {
  name?: string;
  roomType?: number;
  building?: string;
  floor?: number;
  capacity?: number;
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
  dayDisplay: string;
  startTime: string;
  endTime: string;
  scheduleType: number;
  scheduleTypeDisplay: string;
  roomId: number | null;
  roomName: string | null;
  roomBuilding: string | null;
  doctorId: number;
  doctorName: string;
  doctorTitle: number;
  doctorTitleDisplay: string;
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
  scheduleType: number;
  roomId?: number | null;
}

export interface CreateCourseScheduleResponse {
  scheduleId: number;
  courseCode: string;
  courseName: string;
  day: number;
  startTime: string;
  endTime: string;
  scheduleType: string;
  roomName: string | null;
  hasConflict: boolean;
  conflictMessage: string | null;
}

export interface UpdateCourseScheduleForm {
  day?: number;
  startTime?: string;
  endTime?: string;
  scheduleType?: number;
  roomId?: number | null;
}

export interface UpdateCourseScheduleResponse {
  scheduleId: number;
  courseCode: string;
  courseName: string;
  day: number;
  startTime: string;
  endTime: string;
  scheduleType: string;
  roomName: string | null;
  message: string;
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
