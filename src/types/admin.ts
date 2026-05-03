// ============================================================
// Admin Types — Aligned with Backend API Contract
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

// ---- Student List (GET /api/students) ----

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

// ---- Student Detail (GET /api/students/{id}) ----

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

// ---- Create Student (POST /api/users/students) ----

export interface CreateStudentForm {
  email: string;
  name: string;
  phoneNumber: string;
  nationalId: string;
  yearLevel: number;
  departmentId?: number;
  academicAdvisorId?: number;
}

export interface CreateStudentResponse {
  studentId: number;
  studentCode: string;
  email: string;
  temporaryPassword: string;
}

// ---- Update Student (PUT /api/students/{id}) ----

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

// ---- Doctor List (GET /api/doctors) ----

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

// ---- Doctor Detail (GET /api/doctors/{id}) ----

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

// ---- Create Doctor (POST /api/users/doctors) ----

export interface CreateDoctorForm {
  email: string;
  name: string;
  phoneNumber: string;
  nationalId: string;
  title: number;
  departmentId: number;
  officeRoomId?: number;
}

export interface CreateDoctorResponse {
  doctorId: number;
  doctorCode: string;
  email: string;
  temporaryPassword: string;
}

// ---- Update Doctor (PUT /api/doctors/{id}) ----

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

// ---- Advisor List (GET /api/admin/users/advisors) ----

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

// ---- Advisor Detail (GET /api/admin/users/advisors/{id}) ----

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

// ---- Create Advisor (POST /api/users/advisors) ----

export interface CreateAdvisorForm {
  email: string;
  name: string;
  phoneNumber: string;
  nationalId: string;
  officeRoomId?: number;
}

export interface CreateAdvisorResponse {
  advisorId: number;
  advisorCode: string;
  email: string;
  temporaryPassword: string;
}

// ---- Update Advisor (PUT /api/admin/users/advisors/{id}) ----

export interface UpdateAdvisorForm {
  advisorId: number;
  name: string;
  phoneNumber: string;
  officeRoomId?: number | null;
}

// ---- Dropdown Data Sources ----

// ---- Department List (GET /api/admin/departments) ----

export interface DepartmentListItem {
  id: number;
  departmentType: number;
  code: string;
  description: string;
  studentsCount: number;
  doctorsCount: number;
  coursesCount: number;
  headOfDepartmentId: number | null;
  headOfDepartmentName: string | null;
}

// ---- Department Detail (GET /api/admin/departments/{id}) ----

export interface DeptStudent {
  id: number;
  name: string;
  email: string;
  yearLevel: string;
}

export interface DeptDoctor {
  id: number;
  name: string;
  email: string;
  title: string;
}

export interface DeptCourse {
  id: number;
  code: string;
  name: string;
  creditHours: number;
}

export interface DepartmentDetail {
  id: number;
  departmentType: string;
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

// ---- Create Department (POST /api/admin/departments) ----

export interface CreateDepartmentForm {
  departmentType: number;
  code: string;
  description?: string;
}

// ---- Update Department (PUT /api/admin/departments/{id}) ----

export interface UpdateDepartmentForm {
  code?: string;
  description?: string;
}

// ---- Dropdown Data Sources ----

export interface DepartmentOption {
  id: number;
  description: string;
}

export interface AdvisorOption {
  id: number;
  fullName: string;
}

export interface RoomOption {
  id: number;
  name: string;
}

// ---- Course List (GET /api/admin/courses) ----

export interface CourseListItem {
  id: number;
  name: string;
  code: string;
  description: string;
  creditHours: number;
  theoryHours: number;
  practicalHours: number;
  courseType: number;
  passingGrade: number;
  prerequisitesCount: number;
  departmentsCount: number;
  instancesCount: number;
}

// ---- Course Detail (GET /api/admin/courses/{id}) ----

export interface CoursePrerequisite {
  id: number;
  courseCode: string;
  courseName: string;
}

export interface CourseDepartment {
  id: number;
  departmentType: string;
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
  price: number;
  pricePerCreditHour: number;
  courseType: number;
  passingGrade: number;
  prerequisites: CoursePrerequisite[];
  departments: CourseDepartment[];
  instances: CourseInstance[];
}

// ---- Create Course (POST /api/admin/courses) ----

export interface CreateCourseForm {
  name: string;
  code: string;
  description?: string;
  creditHours: number;
  theoryHours: number;
  practicalHours: number;
  price?: number;
  pricePerCreditHour?: number;
  courseType: number;
  passingGrade: number;
}

// ---- Update Course (PUT /api/admin/courses/{id}) ----

export interface UpdateCourseForm {
  name?: string;
  code?: string;
  description?: string;
  creditHours?: number;
  theoryHours?: number;
  practicalHours?: number;
  price?: number;
  pricePerCreditHour?: number;
  courseType?: number;
  passingGrade?: number;
}

// ---- Course Instance (POST /api/admin/courses/{id}/instances) ----

export interface CreateCourseInstanceForm {
  semesterId: number;
  doctorId: number;
  maxCapacity: number;
}

// ---- Course Schedule (GET /api/schedules) ----

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

// ---- Create Course Schedule (POST /api/schedules) ----

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

// ---- Update Course Schedule (PUT /api/schedules/{id}) ----

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
  type: string;
  roomName: string | null;
  message: string;
}

// ---- Exam Schedule (GET /api/exam-schedules) ----

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

// ---- Create Exam Schedule (POST /api/exam-schedules) ----

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

// ---- Update Exam Schedule (PUT /api/exam-schedules/{id}) ----

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

// ---- Dropdown Options for Schedules ----

export interface SemesterOption {
  id: number;
  name: string;
}

export interface DoctorOption {
  id: number;
  fullName: string;
}

// ---- Legacy Aliases ----

/** @deprecated Use DepartmentListItem instead */
export interface AdminDepartment {
  departmentId: number;
  name: string;
  code: string;
  type: number;
  headName?: string;
  totalDoctors: number;
  totalStudents: number;
  totalCourses: number;
}

/** @deprecated Use CreateDepartmentForm instead */
export interface DepartmentForm {
  name: string;
  code: string;
  type: number;
  headDoctorId?: number;
}

/** @deprecated Use CourseListItem instead */
export interface AdminCourse {
  courseId: string;
  courseCode: string;
  courseName: string;
  description?: string;
  credits: number;
  courseType: number;
  departmentId: number;
  departmentName: string;
  totalStudents: number;
  totalDoctors: number;
}

/** @deprecated Use CreateCourseForm instead */
export interface CourseForm {
  courseCode: string;
  courseName: string;
  description?: string;
  credits: number;
  courseType: number;
  departmentId: number;
}

// ---- Legacy Aliases (keep for doctors/advisors pages) ----

/** @deprecated Use StudentListItem instead */
export interface AdminStudent {
  studentId: string;
  studentCode: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  gender: number;
  dateOfBirth?: string;
  departmentId: number;
  departmentName: string;
  yearLevel: number;
  gpa: number;
  creditHours: number;
  status: number;
}

/** @deprecated Use role-specific form types instead */
export interface AdminUserForm {
  name: string;
  email: string;
  phoneNumber: string;
  address?: string;
  gender: number;
  dateOfBirth?: string;
  departmentId: number;
  yearLevel?: number;
  title?: number;
  specialization?: string;
  officeRoom?: string;
  officeHours?: string;
}

// Doctor and Advisor types (kept for their respective pages)
export interface AdminDoctor {
  doctorId: string;
  doctorCode: string;
  name: string;
  email: string;
  phoneNumber?: string;
  gender: number;
  departmentId: number;
  departmentName: string;
  title: number;
  specialization?: string;
  officeRoom?: string;
  officeHours?: string;
  courseCount: number;
  status: number;
}

export interface AdminAdvisor {
  advisorId: string;
  advisorCode: string;
  name: string;
  email: string;
  phoneNumber?: string;
  gender: number;
  departmentId: number;
  departmentName: string;
  studentCount: number;
  officeRoom?: string;
  officeHours?: string;
  status: number;
}
