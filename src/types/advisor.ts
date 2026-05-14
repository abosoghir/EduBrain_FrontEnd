// ============================================================
// Advisor Portal Types — Aligned with Backend API Contract
// Backend: EduBrain.Features.AdvisorPortal
// ============================================================

import type {
  PaymentStatus,
  WarningStatus,
  NotificationType,
  YearLevel,
  EnrollmentStatus,
  ScheduleType,
  PaymentMethod,
  WarningReason,
} from '@/lib/enums';

// ---- Generic Paginated List (matches backend PaginatedList<T>) ----

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ============================================================
// DASHBOARD (GET /api/advisor/dashboard)
// ============================================================

export interface AdvisorDashboardData {
  totalStudents: number;
  activeWarnings: number;
  unpaidFees: number;
  pendingAdjustments: number;
  studentsNeedingAttention: AttentionStudentDto[];
}

export interface AttentionStudentDto {
  studentId: number;
  studentCode: string;
  studentName: string;
  profilePictureUrl: string | null;
  gpa: number;
  issueType: number; // AttentionType enum: 0=LowGPA, 1=HighAbsence, 2=UnpaidFees
  issueDescription: string;
}

// ============================================================
// FEES DASHBOARD (GET /api/advisor/fees/dashboard)
// ============================================================

export interface FeesDashboardData {
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  overdueStudents: number;
  recentFeeAssignments: FeesDashboardStudentDto[];
}

export interface FeesDashboardStudentDto {
  studentFeeId: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  semesterName: string;
  totalAmount: number;
  status: PaymentStatus;
  dueDate: string | null;
}

// ============================================================
// STUDENTS LIST (GET /api/advisor/students)
// ============================================================

export interface GetMyStudentsResponse {
  students: PaginatedList<AdvisorStudentDto>;
  totalStudents: number;
  deanListCount: number;
  atRiskCount: number;
  averageGPA: number;
}

export interface AdvisorStudentDto {
  studentId: number;
  studentCode: string;
  studentName: string;
  profilePictureUrl: string | null;
  yearLevel: YearLevel;
  gpa: number;
  attendancePercentage: number | null;
  feesStatus: PaymentStatus;
  academicStatus: number; // StudentStatusFilter: 0=GoodStanding, 1=DeanList, 2=AcademicWarning, 3=Probation
  warningsCount: number;
}

export interface GetMyStudentsParams {
  search?: string;
  level?: number;
  status?: number;
  page?: number;
  pageSize?: number;
}

// ============================================================
// STUDENT PROFILE (GET /api/advisor/students/{id}/profile)
// ============================================================

export interface StudentProfileForAdvisor {
  studentId: number;
  studentCode: string;
  studentName: string;
  profilePictureUrl: string | null;
  email: string;
  phoneNumber: string;
  yearLevel: YearLevel;
  departmentName: string;

  cumulativeGPA: number;
  currentSemesterGPA: number | null;
  totalCreditHours: number;
  isOnAcademicProbation: boolean;

  overallAttendancePercentage: number | null;
  courseAttendances: CourseAttendanceDto[];

  currentSemesterFees: StudentFeeSummaryDto | null;
  currentSchedule: StudentScheduleItemDto[];
  warnings: StudentWarningDto[];
}

export interface CourseAttendanceDto {
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  attendancePercentage: number;
  absences: number;
}

export interface StudentFeeSummaryDto {
  studentFeeId: number;
  tuitionFees: number;
  booksFees: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod | null;
}

export interface StudentScheduleItemDto {
  enrollmentId: number;
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  doctorName: string;
  sectionInfo: string;
  scheduleSlots: ScheduleSlotDto[];
  status: EnrollmentStatus;
}

export interface ScheduleSlotDto {
  day: number; // DayOfWeek: 0=Sunday..6=Saturday
  startTime: string; // TimeSpan serialized as "HH:MM:SS"
  endTime: string;
  roomName: string;
  type: ScheduleType;
}

export interface StudentWarningDto {
  warningId: number;
  reason: string;
  warningLevel: number; // 1, 2, or 3
  dateIssued: string;
  status: WarningStatus;
}

// ============================================================
// SEND STUDENT MESSAGE (POST /api/advisor/students/{id}/message)
// ============================================================

export interface SendStudentMessageRequest {
  subject: string;
  message: string;
}

// ============================================================
// FEES MANAGEMENT
// ============================================================

// GET /api/advisor/students/{studentId}/fees
export interface GetStudentFeesResponse {
  studentId: number;
  studentName: string;
  semesterFees: SemesterFeeDto[];
  totalOutstanding: number;
}

export interface SemesterFeeDto {
  studentFeeId: number;
  semesterName: string;
  tuitionFees: number;
  booksFees: number;
  labFees: number;
  otherFees: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: PaymentStatus;
  dueDate: string | null;
  installments: InstallmentDto[];
}

export interface InstallmentDto {
  installmentNumber: number;
  amount: number;
  dueDate: string;
  isPaid: boolean;
}

// POST /api/advisor/fees/assign
export interface AssignFeesRequest {
  studentId: number;
  semesterId: number;
  tuitionFees: number;
  booksFees?: number;
  discount?: number;
  dueDate?: string;
  installmentCount?: number;
  sendInvoice?: boolean;
}

export interface AssignFeesResponse {
  studentFeeId: number;
  studentId: number;
  totalAmount: number;
  assignedAt: string;
}

// POST /api/advisor/fees/{studentFeeId}/reminder
export interface SendFeeReminderRequest {
  message?: string;
}

// ============================================================
// WARNINGS (GET /api/advisor/warnings)
// ============================================================

export interface GetWarningsResponse {
  warnings: WarningDto[];
  totalActive: number;
  totalResolved: number;
}

export interface WarningDto {
  warningId: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  courseCode: string | null;
  reason: string;
  warningLevel: number; // 1, 2, or 3
  dateIssued: string;
  status: WarningStatus;
  resolutionNotes: string | null;
}

// POST /api/advisor/warnings
export interface SendWarningRequest {
  studentId: number;
  courseInstanceId?: number;
  reason: WarningReason;
  customReason?: string;
  warningLevel: number; // 1, 2, or 3
  message: string;
}

export interface SendWarningResponse {
  warningId: number;
  studentId: number;
  sentAt: string;
}

// PUT /api/advisor/warnings/{warningId}/resolve
export interface ResolveWarningRequest {
  resolutionNotes?: string;
}

// ============================================================
// SCHEDULE ADJUSTMENTS
// ============================================================

// GET /api/advisor/students/{studentId}/schedule-adjustment
export interface GetStudentScheduleForAdjustmentResponse {
  studentId: number;
  studentName: string;
  currentCreditHours: number;
  maxCreditHours: number;
  currentCourses: AdjustableCourseDto[];
}

export interface AdjustableCourseDto {
  enrollmentId: number;
  courseInstanceId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  doctorName: string;
  sectionInfo: string;
  scheduleSlots: ScheduleSlotDto[];
  canDrop: boolean;
  availableSectionsForSwap: AvailableSectionDto[];
}

export interface AvailableSectionDto {
  courseInstanceId: number;
  sectionInfo: string;
  doctorName: string;
  scheduleSlots: ScheduleSlotDto[];
  availableSeats: number;
}

// POST /api/advisor/schedule-adjustments/drop
export interface DropCourseRequest {
  studentId: number;
  enrollmentId: number;
  reason?: string;
  notifyStudent?: boolean;
}

export interface DropCourseResponse {
  enrollmentId: number;
  courseName: string;
  droppedAt: string;
}

// POST /api/advisor/schedule-adjustments/add-course
export interface ManualCourseAddRequest {
  studentId: number;
  courseInstanceId: number;
  overrideReason?: string;
  notifyStudent?: boolean;
}

export interface ManualCourseAddResponse {
  enrollmentId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  enrolledAt: string;
}

// POST /api/advisor/schedule-adjustments/swap-section
export interface SwapSectionRequest {
  studentId: number;
  currentEnrollmentId: number;
  newCourseInstanceId: number;
  reason?: string;
}

export interface SwapSectionResponse {
  oldEnrollmentId: number;
  newEnrollmentId: number;
  courseName: string;
  newSectionInfo: string;
}

// ============================================================
// PROFILE (GET /api/advisor/profile)
// ============================================================

export interface AdvisorProfileResponse {
  userId: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string | null;
  name: string;
  advisorId: number;
  officeRoomName: string | null;
  officeLocation: string | null;
  totalStudents: number;
  activeWarnings: number;
  warningsIssued: number;
}

// PUT /api/advisor/profile
export interface UpdateAdvisorProfileRequest {
  phoneNumber?: string;
  profilePictureUrl?: string;
  officeRoomId?: number;
}

// ============================================================
// NOTIFICATIONS (GET /api/advisor/notifications)
// ============================================================

export interface GetAdvisorNotificationsResponse {
  notifications: PaginatedList<AdvisorNotificationDto>;
  unreadCount: number;
}

export interface AdvisorNotificationDto {
  notificationId: number;
  title: string;
  message: string;
  type: NotificationType;
  dateTime: string;
  isRead: boolean;
  senderName: string | null;
}

export interface GetAdvisorNotificationsParams {
  type?: number;
  isRead?: boolean;
  page?: number;
  pageSize?: number;
}

// ============================================================
// ADD STUDENT (POST /api/advisor/students)
// ============================================================

export interface AddStudentRequest {
  email: string;
  name: string;
  phoneNumber: string;
}
