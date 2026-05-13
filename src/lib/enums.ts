// All enums from backend — EXACT values and names

export enum Role {
  Admin = 0,
  Student = 1,
  Doctor = 2,
  AcademicAdvisor = 3,
}

export enum YearLevel {
  Freshman = 0,
  Sophomore = 1,
  Junior = 2,
  Senior = 3,
}

export enum SemesterNumber {
  First = 0,
  Second = 1,
  Summer = 2,
}

export enum EnrollmentStatus {
  Enrolled = 0,
  Waitlisted = 1,
  Dropped = 2,
  Completed = 3,
  Failed = 4,
}

export enum DoctorTitle {
  Professor = 0,
  AssociateProfessor = 1,
  AssistantProfessor = 2,
  Lecturer = 3,
  TeachingAssistant = 4,
}

export enum RoomType {
  Office = 0,
  LectureHall = 1,
  Lab = 2,
  ExamHall = 3,
}

export enum NotificationType {
  LectureCancelled = 0,
  ExamReminder = 1,
  AcademicWarning = 2,
  GeneralAnnouncement = 3,
  FeesDue = 4,
  RegistrationOpen = 5,
  RegistrationClosed = 6,
  GradePublished = 7,
  QuizAdded = 8,
  ScheduleChanged = 9,
}

export enum CourseType {
  Compulsory = 0,
  Elective = 1,
}

export enum ScheduleType {
  Lecture = 0,
  Lab = 1,
  Tutorial = 2,
}

export enum ExamType {
  Midterm = 0,
  Final = 1,
  Practical = 2,
  Oral = 3,
}

export enum FeeStatus {
  Pending = 0,
  PartiallyPaid = 1,
  Paid = 2,
  Overdue = 3,
  Waived = 4,
  Refunded = 5,
}

export enum FeeType {
  Tuition = 0,
  Administrative = 1,
  Services = 2,
  Fines = 3,
  Deposit = 4,
}

export enum PaymentMethod {
  BankTransfer = 0,
  Cash = 1,
  CreditCard = 2,
  Check = 3,
  Scholarship = 4,
}

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

export enum Gender {
  Male = 0,
  Female = 1,
}

export enum AttendanceStatus {
  Present = 0,
  Absent = 1,
  Late = 2,
}

export enum MaterialType {
  None = 0,
  File = 1,
  Link = 2,
}

export enum Grade {
  APlus = 0,
  A = 1,
  AMinus = 2,
  BPlus = 3,
  B = 4,
  BMinus = 5,
  CPlus = 6,
  C = 7,
  CMinus = 8,
  DPlus = 9,
  D = 10,
  F = 11,
}

export enum DepartmentType {
  General = 0,
  ComputerScience = 1,
  InformationTechnology = 2,
  SoftwareEngineering = 3,
  ArtificialIntelligence = 4,
  CyberSecurity = 5,
}

export enum CourseAvailabilityStatus {
  Open = 0,
  AlmostFull = 1,
  Full = 2,
  WaitlistAvailable = 3,
}

export enum StudentStatusFilter {
  Normal = 0,
  AtRisk = 1,
  DeanList = 2,
}

export enum AttentionType {
  LowGPA = 0,
  HighAbsence = 1,
  UnpaidFees = 2,
}

export enum WarningLevel {
  Minor = 1,
  Moderate = 2,
  Severe = 3,
}

export enum WarningReason {
  ExceededAbsenceLimit = 0,
  LowAcademicPerformance = 1,
  UnpaidFees = 2,
  Other = 3,
}

export enum AlertType {
  UnpaidFees = 0,
  HighAbsence = 1,
  LowGPA = 2,
  CourseConflict = 3,
  RoomConflict = 4,
  RegistrationDeadline = 5,
  System = 6,
}

// UI-friendly labels
export const ROLE_LABELS: Record<Role, string> = {
  [Role.Admin]: 'Administrator',
  [Role.Student]: 'Student',
  [Role.Doctor]: 'Doctor / Faculty',
  [Role.AcademicAdvisor]: 'Academic Advisor',
};

export const YEAR_LEVEL_LABELS: Record<YearLevel, string> = {
  [YearLevel.Freshman]: 'First Year',
  [YearLevel.Sophomore]: 'Second Year',
  [YearLevel.Junior]: 'Third Year',
  [YearLevel.Senior]: 'Fourth Year',
};

export const DOCTOR_TITLE_LABELS: Record<DoctorTitle, string> = {
  [DoctorTitle.Professor]: 'Professor',
  [DoctorTitle.AssociateProfessor]: 'Associate Professor',
  [DoctorTitle.AssistantProfessor]: 'Assistant Professor',
  [DoctorTitle.Lecturer]: 'Lecturer',
  [DoctorTitle.TeachingAssistant]: 'Teaching Assistant',
};

export const SEMESTER_NUMBER_LABELS: Record<SemesterNumber, string> = {
  [SemesterNumber.First]: 'First Semester',
  [SemesterNumber.Second]: 'Second Semester',
  [SemesterNumber.Summer]: 'Summer Semester',
};

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  [EnrollmentStatus.Enrolled]: 'Enrolled',
  [EnrollmentStatus.Waitlisted]: 'Waitlisted',
  [EnrollmentStatus.Dropped]: 'Dropped',
  [EnrollmentStatus.Completed]: 'Completed',
  [EnrollmentStatus.Failed]: 'Failed',
};

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  [RoomType.Office]: 'Office',
  [RoomType.LectureHall]: 'Lecture Hall',
  [RoomType.Lab]: 'Lab',
  [RoomType.ExamHall]: 'Exam Hall',
};

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  [ScheduleType.Lecture]: 'Lecture',
  [ScheduleType.Lab]: 'Lab',
  [ScheduleType.Tutorial]: 'Tutorial',
};

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  [ExamType.Midterm]: 'Midterm',
  [ExamType.Final]: 'Final',
  [ExamType.Practical]: 'Practical',
  [ExamType.Oral]: 'Oral',
};

export const FEE_STATUS_LABELS: Record<FeeStatus, string> = {
  [FeeStatus.Pending]: 'Pending',
  [FeeStatus.PartiallyPaid]: 'Partially Paid',
  [FeeStatus.Paid]: 'Paid',
  [FeeStatus.Overdue]: 'Overdue',
  [FeeStatus.Waived]: 'Waived',
  [FeeStatus.Refunded]: 'Refunded',
};

export const FEE_TYPE_LABELS: Record<FeeType, string> = {
  [FeeType.Tuition]: 'Tuition',
  [FeeType.Administrative]: 'Administrative',
  [FeeType.Services]: 'Services',
  [FeeType.Fines]: 'Fines',
  [FeeType.Deposit]: 'Deposit',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.BankTransfer]: 'Bank Transfer',
  [PaymentMethod.Cash]: 'Cash',
  [PaymentMethod.CreditCard]: 'Credit Card',
  [PaymentMethod.Check]: 'Check',
  [PaymentMethod.Scholarship]: 'Scholarship',
};

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.Sunday]: 'Sunday',
  [DayOfWeek.Monday]: 'Monday',
  [DayOfWeek.Tuesday]: 'Tuesday',
  [DayOfWeek.Wednesday]: 'Wednesday',
  [DayOfWeek.Thursday]: 'Thursday',
  [DayOfWeek.Friday]: 'Friday',
  [DayOfWeek.Saturday]: 'Saturday',
};

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.Male]: 'Male',
  [Gender.Female]: 'Female',
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Present]: 'Present',
  [AttendanceStatus.Absent]: 'Absent',
  [AttendanceStatus.Late]: 'Late',
};

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  [MaterialType.None]: 'None',
  [MaterialType.File]: 'File',
  [MaterialType.Link]: 'Link',
};

export const GRADE_LABELS: Record<Grade, string> = {
  [Grade.APlus]: 'A+',
  [Grade.A]: 'A',
  [Grade.AMinus]: 'A-',
  [Grade.BPlus]: 'B+',
  [Grade.B]: 'B',
  [Grade.BMinus]: 'B-',
  [Grade.CPlus]: 'C+',
  [Grade.C]: 'C',
  [Grade.CMinus]: 'C-',
  [Grade.DPlus]: 'D+',
  [Grade.D]: 'D',
  [Grade.F]: 'F',
};

export const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  [CourseType.Compulsory]: 'Compulsory',
  [CourseType.Elective]: 'Elective',
};

export const DEPARTMENT_TYPE_LABELS: Record<DepartmentType, string> = {
  [DepartmentType.General]: 'General',
  [DepartmentType.ComputerScience]: 'Computer Science',
  [DepartmentType.InformationTechnology]: 'Information Technology',
  [DepartmentType.SoftwareEngineering]: 'Software Engineering',
  [DepartmentType.ArtificialIntelligence]: 'Artificial Intelligence',
  [DepartmentType.CyberSecurity]: 'Cyber Security',
};

export const COURSE_AVAILABILITY_LABELS: Record<CourseAvailabilityStatus, string> = {
  [CourseAvailabilityStatus.Open]: 'Open',
  [CourseAvailabilityStatus.AlmostFull]: 'Almost Full',
  [CourseAvailabilityStatus.Full]: 'Full',
  [CourseAvailabilityStatus.WaitlistAvailable]: 'Waitlist',
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.LectureCancelled]: 'Lecture Cancelled',
  [NotificationType.ExamReminder]: 'Exam Reminder',
  [NotificationType.AcademicWarning]: 'Academic Warning',
  [NotificationType.GeneralAnnouncement]: 'General Announcement',
  [NotificationType.FeesDue]: 'Fees Due',
  [NotificationType.RegistrationOpen]: 'Registration Open',
  [NotificationType.RegistrationClosed]: 'Registration Closed',
  [NotificationType.GradePublished]: 'Grade Published',
  [NotificationType.QuizAdded]: 'Quiz Added',
  [NotificationType.ScheduleChanged]: 'Schedule Changed',
};

export const STUDENT_STATUS_FILTER_LABELS: Record<StudentStatusFilter, string> = {
  [StudentStatusFilter.Normal]: 'Normal',
  [StudentStatusFilter.AtRisk]: 'At Risk',
  [StudentStatusFilter.DeanList]: 'Dean\'s List',
};

export const WARNING_LEVEL_LABELS: Record<WarningLevel, string> = {
  [WarningLevel.Minor]: 'Minor',
  [WarningLevel.Moderate]: 'Moderate',
  [WarningLevel.Severe]: 'Severe',
};

export const WARNING_REASON_LABELS: Record<WarningReason, string> = {
  [WarningReason.ExceededAbsenceLimit]: 'Exceeded Absence Limit',
  [WarningReason.LowAcademicPerformance]: 'Low Academic Performance',
  [WarningReason.UnpaidFees]: 'Unpaid Fees',
  [WarningReason.Other]: 'Other',
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  [AlertType.UnpaidFees]: 'Unpaid Fees',
  [AlertType.HighAbsence]: 'High Absence',
  [AlertType.LowGPA]: 'Low GPA',
  [AlertType.CourseConflict]: 'Course Conflict',
  [AlertType.RoomConflict]: 'Room Conflict',
  [AlertType.RegistrationDeadline]: 'Registration Deadline',
  [AlertType.System]: 'System',
};