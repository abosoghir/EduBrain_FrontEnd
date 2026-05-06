# 📘 EduBrain — API Integration: Student Portal

## File 4 of 5

---

## 1. Overview

This document defines all RESTful API endpoints required to support the Student Portal UI screens. Each endpoint is strictly mapped to the UI Requirements defined in `UI_Flows/04_Student_Portal.md`.

### Base URL: `/api/student`
### Access: `Student` role only

---

## 🏠 1. Student Dashboard

### 1.1 Get Dashboard Statistics

**Route:** `GET /api/student/dashboard`

**Full URL Example:**
```http
GET /api/student/dashboard
```

**Authorization:** `Bearer {token}` (Role: Student)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentName": "Mohamed Khaled",
    "academicYear": "2025-2026",
    "yearLevel": 1,
    "yearLevelDisplay": "Sophomore",
    "registeredCoursesCount": 6,
    "totalCreditHours": 18,
    "registeredHours": 16,
    "cumulativeGPA": 3.24,
    "upcomingExamsCount": 3,
    "unreadNotificationsCount": 2,
    "todaySchedule": [
      {
        "courseCode": "CS301",
        "courseName": "Data Structures",
        "startTime": "09:00:00",
        "endTime": "10:30:00",
        "roomName": "Room A204",
        "scheduleType": 0
      },
      {
        "courseCode": "MATH201",
        "courseName": "Calculus II",
        "startTime": "11:00:00",
        "endTime": "12:30:00",
        "roomName": "Room B102",
        "scheduleType": 0
      }
    ],
    "recentNotifications": [
      {
        "notificationId": 1,
        "title": "Midterm Exam Schedule",
        "message": "Your midterm exam for CS301 is scheduled for Nov 10, 2025",
        "type": 1,
        "sentDate": "2025-01-15T10:00:00Z",
        "isRead": false
      }
    ],
    "upcomingExams": [
      {
        "examScheduleId": 101,
        "courseCode": "CS301",
        "courseName": "Data Structures",
        "examType": 0,
        "examDate": "2025-11-10T00:00:00Z",
        "startTime": "09:00:00",
        "hallName": "Hall 3",
        "daysRemaining": 5
      }
    ]
  }
}
```

---

## 📝 2. Course Registration

### 2.1 Get Registration Status

**Route:** `GET /api/student/registration/status`

**Full URL Example:**
```http
GET /api/student/registration/status
```

**Authorization:** `Bearer {token}` (Role: Student)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "isOpen": true,
    "opensOn": "2025-09-01T00:00:00Z",
    "closesOn": "2025-09-14T23:59:59Z",
    "registeredHours": 16,
    "maxCreditHours": 18,
    "minCreditHours": 12,
    "remainingHours": 2
  }
}
```

---

### 2.2 Get Available Courses

**Route:** `GET /api/student/registration/available-courses`

**Full URL Example:**
```http
GET /api/student/registration/available-courses?departmentId=1&yearLevel=1&electiveOnly=false
```

**Authorization:** `Bearer {token}` (Role: Student)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| departmentId | integer | No | Filter by department ID |
| yearLevel | integer | No | Filter by year level: `0`=Freshman, `1`=Sophomore, `2`=Junior, `3`=Senior |
| electiveOnly | boolean | No | Show only elective courses (default: false) |

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "courseInstanceId": 101,
        "courseCode": "CS301",
        "courseName": "Data Structures",
        "creditHours": 3,
        "doctorName": "Dr. Ahmed Hassan",
        "schedule": [
          {
            "day": 0,
            "startTime": "09:00:00",
            "endTime": "10:30:00"
          },
          {
            "day": 2,
            "startTime": "09:00:00",
            "endTime": "10:30:00"
          }
        ],
        "maxCapacity": 60,
        "currentEnrolled": 45,
        "seatsRemaining": 15,
        "enrollmentPercentage": 75.0,
        "availabilityStatus": 0,
        "isAlreadyRegistered": false,
        "hasPrerequisites": true,
        "prerequisitesMet": true,
        "unmetPrerequisites": []
      },
      {
        "courseInstanceId": 102,
        "courseCode": "CS401",
        "courseName": "Advanced Database Systems",
        "creditHours": 3,
        "doctorName": "Dr. Sarah Ali",
        "schedule": [
          {
            "day": 1,
            "startTime": "11:00:00",
            "endTime": "12:30:00"
          }
        ],
        "maxCapacity": 40,
        "currentEnrolled": 38,
        "seatsRemaining": 2,
        "enrollmentPercentage": 95.0,
        "availabilityStatus": 1,
        "isAlreadyRegistered": false,
        "hasPrerequisites": true,
        "prerequisitesMet": false,
        "unmetPrerequisites": ["CS301", "CS302"]
      }
    ]
  }
}
```

---

### 2.3 Register for Course

**Route:** `POST /api/student/registration/register`

**Full URL Example:**
```http
POST /api/student/registration/register
```

**Authorization:** `Bearer {token}` (Role: Student)

**Request Body:**
```json
{
  "courseInstanceId": 101
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| courseInstanceId | Yes | Valid course instance ID, not already registered, prerequisites met, seats available |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Successfully registered for CS301 — Data Structures",
  "data": {
    "enrollmentId": 500,
    "courseCode": "CS301",
    "courseName": "Data Structures",
    "status": 0,
    "registrationDate": "2025-09-05T10:30:00Z"
  }
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 400 | RegistrationClosed | "Registration is currently closed" |
| 400 | PrerequisitesNotMet | "Prerequisites not met: CS201, CS202" |
| 400 | CourseFull | "Course is full" |
| 400 | MaxCreditHoursExceeded | "Would exceed maximum credit hours (18)" |
| 400 | AlreadyRegistered | "Already registered for this course" |

---

### 2.4 Get My Registered Courses

**Route:** `GET /api/student/courses`

**Full URL Example:**
```http
GET /api/student/courses?semesterId=10
```

**Authorization:** `Bearer {token}` (Role: Student)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semesterId | integer | No | Filter by semester (default: current semester) |

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalCourses": 6,
    "totalCreditHours": 16,
    "courses": [
      {
        "enrollmentId": 500,
        "courseInstanceId": 101,
        "courseCode": "CS301",
        "courseName": "Data Structures",
        "creditHours": 3,
        "doctorName": "Dr. Ahmed Hassan",
        "doctorAvatarUrl": "https://storage.example.com/avatars/ahmed.jpg",
        "attendancePercentage": 85.0,
        "currentGrade": 75.0,
        "status": 0
      },
      {
        "enrollmentId": 501,
        "courseInstanceId": 102,
        "courseCode": "MATH201",
        "courseName": "Calculus II",
        "creditHours": 3,
        "doctorName": "Dr. Sarah Ali",
        "doctorAvatarUrl": null,
        "attendancePercentage": 92.0,
        "currentGrade": null,
        "status": 0
      }
    ]
  }
}
```

---

### 2.5 Drop Course

**Route:** `DELETE /api/student/registration/drop/{enrollmentId}`

**Full URL Example:**
```http
DELETE /api/student/registration/drop/500
```

**Authorization:** `Bearer {token}` (Role: Student)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Course CS301 dropped successfully",
  "data": {
    "enrollmentId": 500,
    "newTotalHours": 13,
    "belowMinimumWarning": true
  }
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 404 | NotFound | "Enrollment not found" |
| 400 | CannotDrop | "Cannot drop course after deadline" |
| 400 | AlreadyCompleted | "Cannot drop completed course" |

---

## 🗓️ 3. Schedule Management

### 3.1 Get My Weekly Schedule

**Route:** `GET /api/student/schedule/weekly`

**Full URL Example:**
```http
GET /api/student/schedule/weekly?viewType=week
```

**Authorization:** `Bearer {token}` (Role: Student)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| viewType | string | No | "week" or "list" (default: "week") |

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "semesterName": "First 2025-2026",
    "weeklySchedule": [
      {
        "day": 0,
        "slots": [
          {
            "courseScheduleId": 101,
            "courseCode": "CS301",
            "courseName": "Data Structures",
            "startTime": "09:00:00",
            "endTime": "10:30:00",
            "roomName": "Room A204",
            "type": 0,
            "doctorName": "Dr. Ahmed Hassan",
            "colorCode": "#4285F4"
          }
        ]
      },
      {
        "day": 2,
        "slots": [
          {
            "courseScheduleId": 102,
            "courseCode": "MATH201",
            "courseName": "Calculus II",
            "startTime": "11:00:00",
            "endTime": "12:30:00",
            "roomName": "Room B102",
            "type": 0,
            "doctorName": "Dr. Sarah Ali",
            "colorCode": "#34A853"
          }
        ]
      }
    ],
    "listView": [
      {
        "courseScheduleId": 101,
        "day": 0,
        "startTime": "09:00:00",
        "endTime": "10:30:00",
        "courseCode": "CS301",
        "courseName": "Data Structures",
        "doctorName": "Dr. Ahmed Hassan",
        "roomName": "Room A204",
        "type": 0
      }
    ]
  }
}
```

---

## 📚 4. Course Details & Materials

### 4.1 Get Course Details

**Route:** `GET /api/student/courses/{courseInstanceId}`

**Full URL Example:**
```http
GET /api/student/courses/101
```

**Authorization:** `Bearer {token}` (Role: Student)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "courseInstanceId": 101,
    "courseCode": "CS301",
    "courseName": "Data Structures",
    "creditHours": 3,
    "doctorName": "Dr. Ahmed Hassan",
    "doctorAvatarUrl": "https://storage.example.com/avatars/ahmed.jpg",
    "enrollmentDate": "2025-09-05",
    "departmentName": "Computer Science",
    "gradeWeights": {
      "midterm": 30,
      "final": 40,
      "practical": 20,
      "quizzes": 10,
      "oral": 0
    },
    "currentGrades": {
      "midterm": 25.0,
      "final": null,
      "practical": 18.0,
      "quizzes": 8.0,
      "oral": null,
      "totalScore": 51.0,
      "letterGrade": null,
      "status": "In Progress"
    },
    "attendance": {
      "totalSessions": 14,
      "presentCount": 12,
      "absentCount": 2,
      "attendancePercentage": 85.7,
      "hasWarning": false
    }
  }
}
```

---

### 4.2 Get Course Materials

**Route:** `GET /api/student/courses/{courseInstanceId}/materials`

**Full URL Example:**
```http
GET /api/student/courses/101/materials
```

**Authorization:** `Bearer {token}` (Role: Student)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "weeks": [
      {
        "weekNumber": 1,
        "materials": [
          {
            "materialId": 1,
            "title": "Course Syllabus",
            "type": 1,
            "contentUrl": "https://storage.example.com/materials/syllabus.pdf",
            "createdOn": "2025-09-15T10:00:00Z",
            "downloadCount": 45,
            "isVisible": true
          },
          {
            "materialId": 2,
            "title": "Intro Video",
            "type": 2,
            "contentUrl": "https://youtube.com/watch?v=intro",
            "createdOn": "2025-09-15T11:00:00Z",
            "downloadCount": 0,
            "isVisible": true
          }
        ]
      },
      {
        "weekNumber": 2,
        "materials": [
          {
            "materialId": 3,
            "title": "Lecture 2 - Arrays",
            "type": 1,
            "contentUrl": "https://storage.example.com/materials/lecture2.pdf",
            "createdOn": "2025-09-22T10:00:00Z",
            "downloadCount": 38,
            "isVisible": true
          }
        ]
      }
    ]
  }
}
```

---

## 📊 5. Grades Management

### 5.1 Get My Grades

**Route:** `GET /api/student/grades`

**Full URL Example:**
```http
GET /api/student/grades?semesterId=10
```

**Authorization:** `Bearer {token}` (Role: Student)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semesterId | integer | No | Filter by semester (default: current semester) |

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "availableSemesters": [
      {
        "semesterId": 10,
        "name": "First 2025-2026",
        "isCurrent": true
      },
      {
        "semesterId": 9,
        "name": "Second 2024-2025",
        "isCurrent": false
      }
    ],
    "selectedSemesterId": 10,
    "selectedSemesterName": "First 2025-2026",
    "semesterGPA": 3.1,
    "creditHours": 16,
    "academicStanding": "Good Standing",
    "isDeansListEligible": true,
    "grades": [
      {
        "enrollmentId": 500,
        "courseCode": "CS301",
        "courseName": "Data Structures",
        "creditHours": 3,
        "midterm": 25.0,
        "final": null,
        "practical": 18.0,
        "quizzes": 8.0,
        "oral": null,
        "totalScore": 51.0,
        "letterGrade": null,
        "gradePoints": null,
        "status": "In Progress"
      },
      {
        "enrollmentId": 502,
        "courseCode": "MATH201",
        "courseName": "Calculus II",
        "creditHours": 3,
        "midterm": 28.0,
        "final": 35.0,
        "practical": null,
        "quizzes": null,
        "oral": null,
        "totalScore": 63.0,
        "letterGrade": 3,
        "gradePoints": 3.0,
        "status": "Passed"
      }
    ],
    "cumulativeGPA": 3.24,
    "totalCreditHoursEarned": 64
  }
}
```

---

### 5.2 Get GPA History

**Route:** `GET /api/student/grades/gpa-history`

**Full URL Example:**
```http
GET /api/student/grades/gpa-history
```

**Authorization:** `Bearer {token}` (Role: Student)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "semesterId": 8,
        "semesterName": "First 2024-2025",
        "semesterGPA": 3.0,
        "cumulativeGPA": 3.0,
        "creditHoursAttempted": 15,
        "creditHoursEarned": 15
      },
      {
        "semesterId": 9,
        "semesterName": "Second 2024-2025",
        "semesterGPA": 3.5,
        "cumulativeGPA": 3.25,
        "creditHoursAttempted": 16,
        "creditHoursEarned": 16
      },
      {
        "semesterId": 10,
        "semesterName": "First 2025-2026",
        "semesterGPA": 3.1,
        "cumulativeGPA": 3.24,
        "creditHoursAttempted": 16,
        "creditHoursEarned": 16
      }
    ]
  }
}
```

---

## ✅ 6. Attendance Management

### 6.1 Get Attendance Overview

**Route:** `GET /api/student/attendance`

**Full URL Example:**
```http
GET /api/student/attendance
```

**Authorization:** `Bearer {token}` (Role: Student)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overallAttendanceRate": 87.0,
    "totalPresent": 68,
    "totalAbsent": 10,
    "totalLate": 0,
    "courseAttendances": [
      {
        "courseInstanceId": 101,
        "courseCode": "CS301",
        "courseName": "Data Structures",
        "attendedSessions": 12,
        "totalSessions": 14,
        "attendancePercentage": 85.7,
        "statusBadge": 0
      },
      {
        "courseInstanceId": 102,
        "courseCode": "MATH201",
        "courseName": "Calculus II",
        "attendedSessions": 14,
        "totalSessions": 14,
        "attendancePercentage": 100.0,
        "statusBadge": 0
      }
    ]
  }
}
```

---

### 6.2 Get Course Attendance Details

**Route:** `GET /api/student/courses/{courseInstanceId}/attendance`

**Full URL Example:**
```http
GET /api/student/courses/101/attendance
```

**Authorization:** `Bearer {token}` (Role: Student)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "courseInstanceId": 101,
    "courseName": "Data Structures",
    "totalSessions": 14,
    "presentCount": 12,
    "absentCount": 2,
    "excusedCount": 0,
    "attendancePercentage": 85.7,
    "hasWarning": false,
    "sessions": [
      {
        "attendanceId": 1,
        "date": "2025-09-15T00:00:00Z",
        "weekNumber": 1,
        "status": 0,
        "notes": null
      },
      {
        "attendanceId": 2,
        "date": "2025-09-17T00:00:00Z",
        "weekNumber": 1,
        "status": 0,
        "notes": null
      },
      {
        "attendanceId": 5,
        "date": "2025-09-29T00:00:00Z",
        "weekNumber": 3,
        "status": 1,
        "notes": "Absent without excuse"
      }
    ]
  }
}
```

---

## 📋 7. Exam Schedule

### 7.1 Get Exam Schedule

**Route:** `GET /api/student/exam-schedule`

**Full URL Example:**
```http
GET /api/student/exam-schedule?view=list
```

**Authorization:** `Bearer {token}` (Role: Student)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| view | string | No | "list" or "calendar" (default: "list") |

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalExams": 12,
    "daysToFirstExam": 5,
    "firstExamDate": "2025-11-10T00:00:00Z",
    "nextExamCourseName": "CS301 — Data Structures",
    "nextExam": {
      "examScheduleId": 101,
      "courseName": "Data Structures",
      "examType": 0,
      "examDate": "2025-11-10T00:00:00Z",
      "startTime": "09:00:00",
      "hallName": "Hall 3",
      "seatNumber": 25,
      "daysRemaining": 5
    },
    "exams": [
      {
        "examScheduleId": 101,
        "courseCode": "CS301",
        "courseName": "Data Structures",
        "examType": 0,
        "examDate": "2025-11-10T00:00:00Z",
        "day": 1,
        "startTime": "09:00:00",
        "endTime": "11:00:00",
        "hallName": "Hall 3",
        "seatNumber": 25,
        "daysRemaining": 5,
        "notes": "Bring student ID and calculator"
      },
      {
        "examScheduleId": 102,
        "courseCode": "MATH201",
        "courseName": "Calculus II",
        "examType": 1,
        "examDate": "2026-01-15T00:00:00Z",
        "day": 1,
        "startTime": "10:00:00",
        "endTime": "12:00:00",
        "hallName": "Hall 1",
        "seatNumber": 42,
        "daysRemaining": 70,
        "notes": null
      }
    ]
  }
}
```

---

### 7.2 Export Exam Schedule

**Route:** `GET /api/student/exam-schedule/export`

**Full URL Example:**
```http
GET /api/student/exam-schedule/export?format=pdf
```

**Authorization:** `Bearer {token}` (Role: Student)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| format | string | No | Export format: "pdf" (default: "pdf") |

**Request Body:** None

**Response:** File download (application/pdf)

---

## 💰 8. Fees Management

### 8.1 Get My Fees

**Route:** `GET /api/student/fees`

**Full URL Example:**
```http
GET /api/student/fees?semesterId=10
```

**Authorization:** `Bearer {token}` (Role: Student)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semesterId | integer | No | Filter by semester (default: current semester) |

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "availableSemesters": [
      {
        "semesterId": 10,
        "name": "First 2025-2026",
        "isCurrent": true
      },
      {
        "semesterId": 9,
        "name": "Second 2024-2025",
        "isCurrent": false
      }
    ],
    "selectedSemesterId": 10,
    "selectedSemesterName": "First 2025-2026",
    "totalDue": 5000.00,
    "amountPaid": 3000.00,
    "remainingAmount": 2000.00,
    "paidPercentage": 60.0,
    "paymentStatus": 2,
    "dueDate": "2026-01-15T00:00:00Z",
    "isOverdue": false,
    "feeBreakdown": [
      {
        "feeType": "Tuition Fees",
        "amount": 4000.00,
        "status": 0,
        "paidDate": "2025-09-15T00:00:00Z"
      },
      {
        "feeType": "Books Fees",
        "amount": 500.00,
        "status": 0,
        "paidDate": "2025-09-15T00:00:00Z"
      },
      {
        "feeType": "Lab Fees",
        "amount": 300.00,
        "status": 1,
        "paidDate": null
      },
      {
        "feeType": "Other Fees",
        "amount": 200.00,
        "status": 1,
        "paidDate": null
      }
    ],
    "paymentHistory": [
      {
        "id": 1,
        "paymentDate": "2025-09-15T10:30:00Z",
        "amount": 3000.00,
        "method": 3,
        "receiptNumber": "REC-2025-001"
      }
    ]
  }
}
```

---

### 8.2 Download Fee Statement

**Route:** `GET /api/student/fees/statement`

**Full URL Example:**
```http
GET /api/student/fees/statement?semesterId=10&format=pdf
```

**Authorization:** `Bearer {token}` (Role: Student)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semesterId | integer | No | Filter by semester |
| format | string | No | Export format: "pdf" (default: "pdf") |

**Request Body:** None

**Response:** File download (application/pdf)

---

## 🔔 9. Notifications

### 9.1 Get My Notifications

**Route:** `GET /api/student/notifications`

**Full URL Example:**
```http
GET /api/student/notifications?type=1&isRead=false&page=1&pageSize=20
```

**Authorization:** `Bearer {token}` (Role: Student)

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
          "title": "Midterm Exam Schedule",
          "message": "Your midterm exam for CS301 is scheduled for Nov 10, 2025 at 9:00 AM in Hall 3.",
          "preview": "Your midterm exam for CS301 is scheduled for Nov 10, 2025 at 9:00 AM in Hall 3.",
          "type": 1,
          "typeLabel": "ExamReminder",
          "sentDate": "2025-01-15T10:00:00Z",
          "senderName": "Dr. Ahmed Hassan",
          "isRead": false,
          "readAt": null
        },
        {
          "notificationId": 2,
          "title": "New Course Material",
          "message": "Lecture 5 materials have been uploaded for CS301.",
          "preview": "Lecture 5 materials have been uploaded for CS301.",
          "type": 8,
          "typeLabel": "QuizAdded",
          "sentDate": "2025-01-14T14:30:00Z",
          "senderName": "Dr. Ahmed Hassan",
          "isRead": true,
          "readAt": "2025-01-14T15:00:00Z"
        }
      ],
      "page": 1,
      "pageSize": 20,
      "totalCount": 25,
      "totalPages": 2
    }
  }
}
```

---

### 9.2 Mark Notification as Read

**Route:** `PUT /api/student/notifications/{notificationId}/mark-read`

**Full URL Example:**
```http
PUT /api/student/notifications/1/mark-read
```

**Authorization:** `Bearer {token}` (Role: Student)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 9.3 Mark All Notifications as Read

**Route:** `PUT /api/student/notifications/mark-all-read`

**Full URL Example:**
```http
PUT /api/student/notifications/mark-all-read
```

**Authorization:** `Bearer {token}` (Role: Student)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "markedCount": 2
  }
}
```

---

## 👤 10. Profile Management

### 10.1 Get Student Profile

**Route:** `GET /api/student/profile`

**Full URL Example:**
```http
GET /api/student/profile
```

**Authorization:** `Bearer {token}` (Role: Student)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentId": 1001,
    "studentCode": "STU-2025-001",
    "fullName": "Mohamed Khaled",
    "email": "m.khaled@uni.edu",
    "phoneNumber": "+20 1234567890",
    "profilePictureUrl": "https://storage.example.com/profiles/mohamed.jpg",
    "yearLevel": 1,
    "yearLevelDisplay": "Sophomore",
    "departmentName": "Computer Science",
    "academicAdvisorName": "Prof. Sarah Ali",
    "cumulativeGPA": 3.24,
    "totalCreditHours": 64,
    "nationalId": "30001234567890",
    "nationality": "Egyptian",
    "gender": 0,
    "genderDisplay": "Male",
    "religion": "Islam",
    "dateOfBirth": "2003-01-15T00:00:00Z",
    "address": "123 Elm Street",
    "city": "Cairo",
    "fatherPhone": "+20 1098765432",
    "fatherJob": "Engineer",
    "previousQualification": "High School Diploma"
  }
}
```

---

### 10.2 Update Student Profile

**Route:** `PUT /api/student/profile`

**Full URL Example:**
```http
PUT /api/student/profile
```

**Authorization:** `Bearer {token}` (Role: Student)

**Request Body:**
```json
{
  "phoneNumber": "+20 9876543210",
  "address": "456 Oak Avenue",
  "city": "Giza",
  "fatherPhone": "+20 1122334455",
  "fatherJob": "Doctor"
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| phoneNumber | No | Valid phone format, max 20 chars |
| address | No | Max 200 chars |
| city | No | Max 100 chars |
| fatherPhone | No | Valid phone format, max 20 chars |
| fatherJob | No | Max 100 chars |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 400 | ValidationError | "Invalid phone number format" |

---

## 📊 Enum Reference for Student Portal

| Enum | Values |
|------|--------|
| **YearLevel** | `0`=Freshman, `1`=Sophomore, `2`=Junior, `3`=Senior |
| **EnrollmentStatus** | `0`=Enrolled, `1`=Waitlisted, `2`=Dropped, `3`=Completed, `4`=Failed |
| **CourseAvailabilityStatus** | `0`=Open, `1`=AlmostFull, `2`=Full, `3`=WaitlistAvailable |
| **ScheduleType** | `0`=Lecture, `1`=Lab, `2`=Tutorial |
| **AttendanceStatus** | `0`=Present, `1`=Absent, `2`=Late |
| **AttendanceStatusBadge** | `0`=Normal (≥85%), `1`=Warning (75-84%), `2`=Danger (<75%) |
| **ExamType** | `0`=Midterm, `1`=Final, `2`=Practical, `3`=Oral |
| **Grade** | `0`=APlus, `1`=A, `2`=AMinus, `3`=BPlus, `4`=B, `5`=CPlus, `6`=C, `7`=DPlus, `8`=D, `9`=DMinus, `10`=F |
| **PaymentStatus** | `0`=Paid, `1`=Unpaid, `2`=PartiallyPaid |
| **PaymentMethod** | `0`=Cash, `1`=Card, `2`=Online, `3`=BankTransfer |
| **NotificationType** | `0`=LectureCancelled, `1`=ExamReminder, `2`=AcademicWarning, `3`=GeneralAnnouncement, `4`=FeesDue, `5`=RegistrationOpen, `6`=RegistrationClosed, `7`=GradePublished, `8`=QuizAdded, `9`=ScheduleChanged |
| **Gender** | `0`=Male, `1`=Female |
| **MaterialType** | `0`=None, `1`=File, `2`=Link |
| **DayOfWeek** | `0`=Sunday, `1`=Monday, `2`=Tuesday, `3`=Wednesday, `4`=Thursday, `5`=Friday, `6`=Saturday |

---

## 🎯 UI Dropdown Data Sources

| Dropdown | API Endpoint | Display Field | Value Field |
|----------|--------------|---------------|-------------|
| Semester | `GET /api/student/grades` or `GET /api/student/fees` | `AvailableSemesters[].Name` | `AvailableSemesters[].SemesterId` |
| Department | `GET /api/admin/departments` | `Name` | `Id` |
| Year Level | Static enum | "Freshman", "Sophomore", etc. | 0-3 |
| Course | `GET /api/student/courses` | `CourseCode` + `CourseName` | `CourseInstanceId` |
| Schedule Type | Static enum | "Lecture", "Lab", "Tutorial" | 0-2 |
| Notification Type | Static enum | "Exam Reminder", "General Announcement", etc. | 0-9 |
| Payment Status | Static enum | "Paid", "Unpaid", "Partially Paid" | 0-2 |
| Gender | Static enum | "Male", "Female" | 0-1 |
| Material Type | Static enum | "File", "Link" | 1-2 |

---

## 📝 Route Summary

### Dashboard
| Operation | Route |
|-----------|-------|
| Get Dashboard | `GET /api/student/dashboard` |

### Course Registration
| Operation | Route |
|-----------|-------|
| Get Registration Status | `GET /api/student/registration/status` |
| Get Available Courses | `GET /api/student/registration/available-courses` |
| Register for Course | `POST /api/student/registration/register` |
| Drop Course | `DELETE /api/student/registration/drop/{enrollmentId}` |

### My Courses
| Operation | Route |
|-----------|-------|
| Get My Courses | `GET /api/student/courses` |
| Get Course Details | `GET /api/student/courses/{courseInstanceId}` |
| Get Course Materials | `GET /api/student/courses/{courseInstanceId}/materials` |

### Schedule
| Operation | Route |
|-----------|-------|
| Get Weekly Schedule | `GET /api/student/schedule/weekly` |

### Grades
| Operation | Route |
|-----------|-------|
| Get My Grades | `GET /api/student/grades` |
| Get GPA History | `GET /api/student/grades/gpa-history` |

### Attendance
| Operation | Route |
|-----------|-------|
| Get Attendance Overview | `GET /api/student/attendance` |
| Get Course Attendance | `GET /api/student/courses/{courseInstanceId}/attendance` |

### Exam Schedule
| Operation | Route |
|-----------|-------|
| Get Exam Schedule | `GET /api/student/exam-schedule` |
| Export Exam Schedule | `GET /api/student/exam-schedule/export` |

### Fees
| Operation | Route |
|-----------|-------|
| Get My Fees | `GET /api/student/fees` |
| Download Fee Statement | `GET /api/student/fees/statement` |

### Notifications
| Operation | Route |
|-----------|-------|
| Get Notifications | `GET /api/student/notifications` |
| Mark as Read | `PUT /api/student/notifications/{notificationId}/mark-read` |
| Mark All as Read | `PUT /api/student/notifications/mark-all-read` |

### Profile
| Operation | Route |
|-----------|-------|
| Get Profile | `GET /api/student/profile` |
| Update Profile | `PUT /api/student/profile` |

---

*← Previous:* [API_Integration_DoctorPortal.md](./API_Integration_DoctorPortal.md)  
*→ Next:* [API_Integration_AdvisorPortal.md](./API_Integration_AdvisorPortal.md)
