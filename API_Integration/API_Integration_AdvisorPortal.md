# 📘 EduBrain — API Integration: Academic Advisor Portal

## File 5 of 5

---

## 1. Overview

This document defines all RESTful API endpoints required to support the Academic Advisor Portal UI screens. Each endpoint is strictly mapped to the UI Requirements defined in `UI_Flows/05_Advisor_Portal.md`.

### Base URL: `/api/advisor`
### Access: `AcademicAdvisor` role only

---

## 📊 1. Advisor Dashboard

### 1.1 Get Dashboard Statistics

**Route:** `GET /api/advisor/dashboard`

**Full URL Example:**
```http
GET /api/advisor/dashboard
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalStudents": 45,
    "activeWarnings": 3,
    "unpaidFees": 5,
    "pendingAdjustments": 0,
    "studentsNeedingAttention": [
      {
        "studentId": 1001,
        "studentCode": "STU-2025-042",
        "studentName": "Mohamed Khaled",
        "profilePictureUrl": "https://storage.example.com/profiles/mohamed.jpg",
        "gpa": 1.8,
        "issueType": 0,
        "issueDescription": "GPA below 2.0 — academic probation risk"
      },
      {
        "studentId": 1005,
        "studentCode": "STU-2025-015",
        "studentName": "Ahmed Samir",
        "profilePictureUrl": null,
        "gpa": 2.5,
        "issueType": 1,
        "issueDescription": "High absence rate (68%) — attendance warning"
      }
    ]
  }
}
```

---

## 🎓 2. My Students Management

### 2.1 List My Students

**Route:** `GET /api/advisor/students`

**Full URL Example:**
```http
GET /api/advisor/students?search=mohamed&level=1&status=2&page=1&pageSize=20
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search by student name or code |
| level | integer | No | Filter by YearLevel: `0`=Freshman, `1`=Sophomore, `2`=Junior, `3`=Senior |
| status | integer | No | Filter by StudentStatusFilter: `0`=GoodStanding, `1`=DeanList, `2`=AcademicWarning, `3`=Probation |
| page | integer | No | Page number (default: 1) |
| pageSize | integer | No | Items per page (default: 20, max: 100) |

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "students": {
      "items": [
        {
          "studentId": 1001,
          "studentCode": "STU-2025-042",
          "studentName": "Mohamed Khaled",
          "profilePictureUrl": "https://storage.example.com/profiles/mohamed.jpg",
          "yearLevel": 1,
          "gpa": 1.8,
          "attendancePercentage": 68.0,
          "feesStatus": 2,
          "academicStatus": 2,
          "warningsCount": 1
        },
        {
          "studentId": 1002,
          "studentCode": "STU-2025-001",
          "studentName": "Sarah Ali",
          "profilePictureUrl": null,
          "yearLevel": 2,
          "gpa": 3.7,
          "attendancePercentage": 92.0,
          "feesStatus": 0,
          "academicStatus": 1,
          "warningsCount": 0
        }
      ],
      "page": 1,
      "pageSize": 20,
      "totalCount": 45,
      "totalPages": 3
    },
    "totalStudents": 45,
    "deanListCount": 8,
    "atRiskCount": 3,
    "averageGPA": 2.87
  }
}
```

---

### 2.2 Get Student Profile (Advisor View)

**Route:** `GET /api/advisor/students/{studentId}/profile`

**Full URL Example:**
```http
GET /api/advisor/students/1001/profile
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentId": 1001,
    "studentCode": "STU-2025-042",
    "studentName": "Mohamed Khaled",
    "profilePictureUrl": "https://storage.example.com/profiles/mohamed.jpg",
    "email": "m.khaled@uni.edu",
    "phoneNumber": "+20 1234567890",
    "yearLevel": 1,
    "yearLevelDisplay": "Sophomore",
    "departmentName": "Computer Science",
    "cumulativeGPA": 1.8,
    "currentSemesterGPA": 2.2,
    "totalCreditHours": 45,
    "isOnAcademicProbation": false,
    "overallAttendancePercentage": 68.0,
    "courseAttendances": [
      {
        "courseInstanceId": 101,
        "courseCode": "CS301",
        "courseName": "Data Structures",
        "attendancePercentage": 85.7,
        "absences": 2
      },
      {
        "courseInstanceId": 102,
        "courseCode": "MATH201",
        "courseName": "Calculus II",
        "attendancePercentage": 50.0,
        "absences": 7
      }
    ],
    "currentSemesterFees": {
      "studentFeeId": 50,
      "tuitionFees": 4000.00,
      "booksFees": 500.00,
      "discount": 0.00,
      "totalAmount": 4500.00,
      "paidAmount": 3000.00,
      "remainingAmount": 1500.00,
      "status": 2,
      "paymentMethod": 3
    },
    "currentSchedule": [
      {
        "enrollmentId": 500,
        "courseInstanceId": 101,
        "courseCode": "CS301",
        "courseName": "Data Structures",
        "doctorName": "Dr. Ahmed Hassan",
        "sectionInfo": "Section A",
        "scheduleSlots": [
          {
            "day": 0,
            "startTime": "09:00:00",
            "endTime": "10:30:00",
            "roomName": "Room A204",
            "type": 0
          }
        ],
        "status": 0
      }
    ],
    "warnings": [
      {
        "warningId": 1,
        "reason": "Low Academic Performance",
        "warningLevel": 2,
        "dateIssued": "2025-01-10T10:00:00Z",
        "status": 0
      }
    ]
  }
}
```

---

### 2.3 Export Student List

**Route:** `GET /api/advisor/students/export`

**Full URL Example:**
```http
GET /api/advisor/students/export?format=excel
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| format | string | No | Export format: "excel" or "csv" (default: "excel") |

**Request Body:** None

**Response:** File download (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

---

## ⚠️ 3. Warnings Management

### 3.1 List Warnings

**Route:** `GET /api/advisor/warnings`

**Full URL Example:**
```http
GET /api/advisor/warnings?status=0&search=mohamed&page=1&pageSize=20
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | integer | No | Filter by WarningStatus: `0`=Active, `1`=Resolved |
| search | string | No | Search by student name or code |
| page | integer | No | Page number (default: 1) |
| pageSize | integer | No | Items per page (default: 20, max: 100) |

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "warnings": [
      {
        "warningId": 1,
        "studentId": 1001,
        "studentName": "Mohamed Khaled",
        "studentCode": "STU-2025-042",
        "courseCode": "CS301",
        "reason": "Low Academic Performance",
        "warningLevel": 2,
        "dateIssued": "2025-01-10T10:00:00Z",
        "status": 0,
        "resolutionNotes": null
      },
      {
        "warningId": 2,
        "studentId": 1005,
        "studentName": "Ahmed Samir",
        "studentCode": "STU-2025-015",
        "courseCode": null,
        "reason": "Exceeded Absence Limit",
        "warningLevel": 1,
        "dateIssued": "2025-01-08T14:30:00Z",
        "status": 1,
        "resolutionNotes": "Student improved attendance to 85%"
      }
    ],
    "totalActive": 1,
    "totalResolved": 1
  }
}
```

---

### 3.2 Send Warning

**Route:** `POST /api/advisor/warnings`

**Full URL Example:**
```http
POST /api/advisor/warnings
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Request Body:**
```json
{
  "studentId": 1001,
  "courseInstanceId": 101,
  "reason": 1,
  "customReason": null,
  "warningLevel": 2,
  "message": "Your GPA has fallen below the minimum requirement. Please meet with me to discuss an improvement plan."
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| studentId | Yes | Valid student ID, must be advisor's student |
| courseInstanceId | No | Valid course instance ID (optional) |
| reason | Yes | Enum: `0`=ExceededAbsenceLimit, `1`=LowAcademicPerformance, `2`=UnpaidFees, `3`=Other |
| customReason | Conditional | Required if reason=3, max 200 chars |
| warningLevel | Yes | Integer 1-3 |
| message | Yes | Max 2000 chars |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Warning sent to Mohamed Khaled",
  "data": {
    "warningId": 3,
    "studentId": 1001,
    "warningLevel": 2,
    "dateIssued": "2025-01-20T10:30:00Z"
  }
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 400 | ValidationError | "Warning level must be between 1 and 3" |
| 400 | CustomReasonRequired | "Custom reason is required when reason is 'Other'" |
| 403 | Forbidden | "You can only send warnings to your assigned students" |

---

### 3.3 Resolve Warning

**Route:** `PUT /api/advisor/warnings/{warningId}/resolve`

**Full URL Example:**
```http
PUT /api/advisor/warnings/1/resolve
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Request Body:**
```json
{
  "resolutionNotes": "Student improved attendance to 85%"
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| resolutionNotes | No | Max 500 chars |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Warning resolved"
}
```

---

## 🔄 4. Schedule Adjustments

### 4.1 Get Student Schedule for Adjustment

**Route:** `GET /api/advisor/students/{studentId}/schedule-adjustment`

**Full URL Example:**
```http
GET /api/advisor/students/1001/schedule-adjustment
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentId": 1001,
    "studentName": "Mohamed Khaled",
    "currentCreditHours": 16,
    "maxCreditHours": 18,
    "currentCourses": [
      {
        "enrollmentId": 500,
        "courseInstanceId": 101,
        "courseCode": "CS301",
        "courseName": "Data Structures",
        "creditHours": 3,
        "doctorName": "Dr. Ahmed Hassan",
        "sectionInfo": "Section A",
        "scheduleSlots": [
          {
            "day": 0,
            "startTime": "09:00:00",
            "endTime": "10:30:00",
            "roomName": "Room A204",
            "type": 0
          }
        ],
        "canDrop": true,
        "availableSectionsForSwap": [
          {
            "courseInstanceId": 105,
            "sectionInfo": "Section B",
            "doctorName": "Dr. Hassan",
            "scheduleSlots": [
              {
                "day": 1,
                "startTime": "11:00:00",
                "endTime": "12:30:00",
                "roomName": "Room B305",
                "type": 0
              }
            ],
            "availableSeats": 5
          }
        ]
      }
    ]
  }
}
```

---

### 4.2 Drop Course (Advisor Override)

**Route:** `POST /api/advisor/schedule-adjustments/drop`

**Full URL Example:**
```http
POST /api/advisor/schedule-adjustments/drop
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Request Body:**
```json
{
  "studentId": 1001,
  "enrollmentId": 500,
  "reason": "Student overwhelmed with workload",
  "notifyStudent": true
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| studentId | Yes | Valid student ID, must be advisor's student |
| enrollmentId | Yes | Valid enrollment ID |
| reason | No | Max 500 chars |
| notifyStudent | No | Boolean (default: true) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "CS301 dropped for Mohamed Khaled",
  "data": {
    "enrollmentId": 500,
    "newTotalHours": 13,
    "belowMinimumWarning": true
  }
}
```

---

### 4.3 Swap Section

**Route:** `POST /api/advisor/schedule-adjustments/swap-section`

**Full URL Example:**
```http
POST /api/advisor/schedule-adjustments/swap-section
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Request Body:**
```json
{
  "studentId": 1001,
  "currentEnrollmentId": 500,
  "newCourseInstanceId": 105,
  "reason": "Schedule conflict resolved"
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| studentId | Yes | Valid student ID, must be advisor's student |
| currentEnrollmentId | Yes | Valid enrollment ID |
| newCourseInstanceId | Yes | Valid course instance ID, different from current |
| reason | No | Max 500 chars |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Section swapped to Section B",
  "data": {
    "newEnrollmentId": 510,
    "newCourseInstanceId": 105,
    "newSection": "Section B"
  }
}
```

---

### 4.4 Manual Course Add (Override)

**Route:** `POST /api/advisor/schedule-adjustments/add-course`

**Full URL Example:**
```http
POST /api/advisor/schedule-adjustments/add-course
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Request Body:**
```json
{
  "studentId": 1001,
  "courseInstanceId": 110,
  "overrideReason": "Student needs this course for graduation requirements",
  "notifyStudent": true
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| studentId | Yes | Valid student ID, must be advisor's student |
| courseInstanceId | Yes | Valid course instance ID, not already enrolled |
| overrideReason | Yes | Non-empty, max 500 chars |
| notifyStudent | No | Boolean (default: true) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "CS401 added for Mohamed Khaled",
  "data": {
    "enrollmentId": 511,
    "courseCode": "CS401",
    "courseName": "Advanced Database Systems",
    "newTotalHours": 19,
    "overMaxHoursWarning": true
  }
}
```

---

## 💰 5. Fees Management

### 5.1 Get Student Fees (Advisor View)

**Route:** `GET /api/advisor/students/{studentId}/fees`

**Full URL Example:**
```http
GET /api/advisor/students/1001/fees
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentId": 1001,
    "studentName": "Mohamed Khaled",
    "semesterFees": [
      {
        "studentFeeId": 50,
        "semesterName": "First 2025-2026",
        "tuitionFees": 4000.00,
        "booksFees": 500.00,
        "labFees": 0.00,
        "otherFees": 0.00,
        "discount": 0.00,
        "totalAmount": 4500.00,
        "paidAmount": 3000.00,
        "remainingAmount": 1500.00,
        "status": 2,
        "dueDate": "2026-01-15T00:00:00Z",
        "installments": []
      },
      {
        "studentFeeId": 40,
        "semesterName": "Second 2024-2025",
        "tuitionFees": 4000.00,
        "booksFees": 500.00,
        "labFees": 0.00,
        "otherFees": 0.00,
        "discount": 0.00,
        "totalAmount": 4500.00,
        "paidAmount": 4500.00,
        "remainingAmount": 0.00,
        "status": 0,
        "dueDate": null,
        "installments": []
      }
    ],
    "totalOutstanding": 1500.00
  }
}
```

---

### 5.2 Assign Fees

**Route:** `POST /api/advisor/fees/assign`

**Full URL Example:**
```http
POST /api/advisor/fees/assign
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Request Body:**
```json
{
  "studentId": 1001,
  "semesterId": 11,
  "tuitionFees": 4000.00,
  "booksFees": 500.00,
  "discount": 0.00,
  "dueDate": "2026-01-15",
  "installmentCount": null,
  "sendInvoice": true
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| studentId | Yes | Valid student ID, must be advisor's student |
| semesterId | Yes | Valid semester ID |
| tuitionFees | Yes | Decimal ≥ 0 |
| booksFees | No | Decimal ≥ 0 |
| discount | No | Decimal ≥ 0 |
| dueDate | No | Valid future date |
| installmentCount | No | Positive integer |
| sendInvoice | No | Boolean (default: true) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Fees assigned to Mohamed Khaled for Second 2025-2026",
  "data": {
    "studentFeeId": 51,
    "totalAmount": 4500.00,
    "sentInvoice": true
  }
}
```

---

## 🔔 6. Notifications

### 6.1 Get Advisor Notifications

**Route:** `GET /api/advisor/notifications`

**Full URL Example:**
```http
GET /api/advisor/notifications?type=3&isRead=false&page=1&pageSize=20
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | integer | No | Filter by NotificationType |
| isRead | boolean | No | Filter by read status |
| page | integer | No | Page number (default: 1) |
| pageSize | integer | No | Items per page (default: 20, max: 100) |

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 2,
    "notifications": {
      "items": [
        {
          "notificationId": 1,
          "title": "New Student Assignment",
          "message": "You have been assigned 5 new students for the upcoming semester.",
          "type": 3,
          "dateTime": "2025-01-15T09:00:00Z",
          "isRead": false,
          "senderName": "Admin Office"
        },
        {
          "notificationId": 2,
          "title": "Warning Resolved",
          "message": "The warning for student STU-2025-042 has been resolved.",
          "type": 2,
          "dateTime": "2025-01-14T14:30:00Z",
          "isRead": true,
          "senderName": "System"
        }
      ],
      "page": 1,
      "pageSize": 20,
      "totalCount": 15,
      "totalPages": 1
    }
  }
}
```

---

### 6.2 Mark Notification as Read

**Route:** `PUT /api/advisor/notifications/{notificationId}/mark-read`

**Full URL Example:**
```http
PUT /api/advisor/notifications/1/mark-read
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 👤 7. Profile Management

### 7.1 Get Advisor Profile

**Route:** `GET /api/advisor/profile`

**Full URL Example:**
```http
GET /api/advisor/profile
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "adv-3001",
    "email": "sarah.ali@uni.edu",
    "phoneNumber": "+20 1234567890",
    "profilePictureUrl": "https://storage.example.com/profiles/sarah.jpg",
    "name": "Prof. Sarah Ali",
    "advisorId": 3001,
    "officeRoomName": "Room C201",
    "officeLocation": "Building C, Floor 2",
    "totalStudents": 45,
    "activeWarnings": 3,
    "warningsIssued": 12
  }
}
```

---

### 7.2 Update Advisor Profile

**Route:** `PUT /api/advisor/profile`

**Full URL Example:**
```http
PUT /api/advisor/profile
```

**Authorization:** `Bearer {token}` (Role: AcademicAdvisor)

**Request Body:**
```json
{
  "phoneNumber": "+20 9876543210",
  "profilePictureUrl": "https://storage.example.com/profiles/sarah-new.jpg",
  "officeRoomId": 25
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| phoneNumber | No | Max 20 chars |
| profilePictureUrl | No | Max 500 chars |
| officeRoomId | No | Valid room ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

## 📊 Enum Reference for Advisor Portal

| Enum | Values |
|------|--------|
| **AttentionType** | `0`=LowGPA, `1`=HighAbsence, `2`=UnpaidFees |
| **StudentStatusFilter** | `0`=GoodStanding, `1`=DeanList, `2`=AcademicWarning, `3`=Probation |
| **YearLevel** | `0`=Freshman, `1`=Sophomore, `2`=Junior, `3`=Senior |
| **WarningReason** | `0`=ExceededAbsenceLimit, `1`=LowAcademicPerformance, `2`=UnpaidFees, `3`=Other |
| **WarningLevel** | `1`=FirstWarning (Yellow), `2`=Serious (Orange), `3`=FinalWarning (Red) |
| **WarningStatus** | `0`=Active, `1`=Resolved |
| **PaymentStatus** | `0`=Paid, `1`=Unpaid, `2`=PartiallyPaid |
| **PaymentMethod** | `0`=Cash, `1`=Card, `2`=Online, `3`=BankTransfer |
| **EnrollmentStatus** | `0`=Enrolled, `1`=Waitlisted, `2`=Dropped, `3`=Completed, `4`=Failed |
| **ScheduleType** | `0`=Lecture, `1`=Lab, `2`=Tutorial |
| **DayOfWeek** | `0`=Sunday, `1`=Monday, `2`=Tuesday, `3`=Wednesday, `4`=Thursday, `5`=Friday, `6`=Saturday |
| **NotificationType** | `0`=LectureCancelled, `1`=ExamReminder, `2`=AcademicWarning, `3`=GeneralAnnouncement, `4`=FeesDue, `5`=RegistrationOpen, `6`=RegistrationClosed, `7`=GradePublished, `8`=QuizAdded, `9`=ScheduleChanged |
| **Gender** | `0`=Male, `1`=Female |
| **Grade** | `0`=APlus, `1`=A, `2`=AMinus, `3`=BPlus, `4`=B, `5`=CPlus, `6`=C, `7`=DPlus, `8`=D, `9`=DMinus, `10`=F |

---

## 🎯 UI Dropdown Data Sources

| Dropdown | API Endpoint | Display Field | Value Field |
|----------|--------------|---------------|-------------|
| Student | `GET /api/advisor/students` | `StudentName` + `StudentCode` | `StudentId` |
| Year Level | Static enum | "Freshman", "Sophomore", etc. | 0-3 |
| Academic Status | Static enum | "Good Standing", "Dean's List", etc. | 0-3 |
| Warning Level | Static enum | "Level 1 (First)", "Level 2 (Serious)", "Level 3 (Final)" | 1-3 |
| Warning Reason | Static enum | "Exceeded Absence Limit", "Low Academic Performance", etc. | 0-3 |
| Warning Status | Static enum | "Active", "Resolved" | 0-1 |
| Course Instance | `GET /api/advisor/students/{id}/schedule-adjustment` | `CourseCode` + `SectionInfo` | `CourseInstanceId` |
| Room | `GET /api/admin/rooms` | `Name` | `Id` |
| Semester | `GET /api/admin/academic-years` → semesters | `SemesterNumber` (as text) | `Id` |
| Notification Type | Static enum | "General Announcement", "Academic Warning", etc. | 0-9 |

---

## 📝 Route Summary

### Dashboard
| Operation | Route |
|-----------|-------|
| Get Dashboard | `GET /api/advisor/dashboard` |

### My Students
| Operation | Route |
|-----------|-------|
| List My Students | `GET /api/advisor/students` |
| Get Student Profile | `GET /api/advisor/students/{studentId}/profile` |
| Export Student List | `GET /api/advisor/students/export` |

### Warnings
| Operation | Route |
|-----------|-------|
| List Warnings | `GET /api/advisor/warnings` |
| Send Warning | `POST /api/advisor/warnings` |
| Resolve Warning | `PUT /api/advisor/warnings/{warningId}/resolve` |

### Schedule Adjustments
| Operation | Route |
|-----------|-------|
| Get Student Schedule for Adjustment | `GET /api/advisor/students/{studentId}/schedule-adjustment` |
| Drop Course | `POST /api/advisor/schedule-adjustments/drop` |
| Swap Section | `POST /api/advisor/schedule-adjustments/swap-section` |
| Manual Course Add | `POST /api/advisor/schedule-adjustments/add-course` |

### Fees Management
| Operation | Route |
|-----------|-------|
| Get Student Fees | `GET /api/advisor/students/{studentId}/fees` |
| Assign Fees | `POST /api/advisor/fees/assign` |

### Notifications
| Operation | Route |
|-----------|-------|
| Get Notifications | `GET /api/advisor/notifications` |
| Mark as Read | `PUT /api/advisor/notifications/{notificationId}/mark-read` |

### Profile
| Operation | Route |
|-----------|-------|
| Get Profile | `GET /api/advisor/profile` |
| Update Profile | `PUT /api/advisor/profile` |

---

*← Previous:* [API_Integration_StudentPortal.md](./API_Integration_StudentPortal.md)

**End of API Integration Documentation Series**
