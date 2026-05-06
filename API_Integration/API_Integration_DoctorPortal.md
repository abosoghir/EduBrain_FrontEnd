# 📘 EduBrain — API Integration: Doctor Portal

## File 3 of 5

---

## 1. Overview

This document defines all RESTful API endpoints required to support the Doctor Portal UI screens. Each endpoint is strictly mapped to the UI Requirements defined in `UI_Flows/03_Doctor_Portal.md`.

### Base URL: `/api/doctor`
### Access: `Doctor` role only

---

## 📊 1. Doctor Dashboard

### 1.1 Get Dashboard Statistics

**Route:** `GET /api/doctor/dashboard`

**Full URL Example:**
```http
GET /api/doctor/dashboard
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "coursesThisSemester": 3,
    "totalStudents": 127,
    "pendingQuizzes": 0,
    "eventsSentToday": 2,
    "todaySchedule": [
      {
        "courseScheduleId": 101,
        "startTime": "09:00:00",
        "endTime": "10:30:00",
        "courseCode": "CS301",
        "courseName": "Data Structures",
        "roomName": "Room A204",
        "type": 0
      }
    ],
    "recentAnnouncements": [
      {
        "notificationId": 1,
        "title": "Midterm Exam Schedule",
        "type": 1,
        "sentDate": "2025-01-15T10:00:00Z",
        "recipientsCount": 45
      }
    ]
  }
}
```

---

## 📚 2. My Courses Management

### 2.1 List My Courses

**Route:** `GET /api/doctor/courses`

**Full URL Example:**
```http
GET /api/doctor/courses?semesterId=10
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semesterId | integer | No | Filter by semester ID (default: current semester) |

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
        "semesterName": "First 2025-2026",
        "enrolledCount": 45,
        "maxCapacity": 60,
        "enrollmentPercentage": 75.0
      },
      {
        "courseInstanceId": 102,
        "courseCode": "CS401",
        "courseName": "Advanced Database Systems",
        "creditHours": 3,
        "semesterName": "First 2025-2026",
        "enrolledCount": 32,
        "maxCapacity": 40,
        "enrollmentPercentage": 80.0
      }
    ]
  }
}
```

---

### 2.2 Get Course Students

**Route:** `GET /api/doctor/courses/{courseInstanceId}/students`

**Full URL Example:**
```http
GET /api/doctor/courses/101/students?search=mohamed
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search by student name or code |

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "courseInstanceId": 101,
    "courseName": "Data Structures",
    "students": [
      {
        "studentId": 1001,
        "studentCode": "STU-2025-001",
        "studentName": "Mohamed Khaled",
        "section": "A",
        "attendancePercentage": 85.0,
        "status": "Enrolled"
      },
      {
        "studentId": 1002,
        "studentCode": "STU-2025-002",
        "studentName": "Ahmed Ali",
        "section": "A",
        "attendancePercentage": 92.0,
        "status": "Enrolled"
      }
    ]
  }
}
```

---

### 2.3 Export Course Students

**Route:** `GET /api/doctor/courses/{courseInstanceId}/students/export`

**Full URL Example:**
```http
GET /api/doctor/courses/101/students/export?format=excel
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| format | string | No | Export format: "excel" or "csv" (default: "excel") |

**Request Body:** None

**Response:** File download (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

---

## 📄 3. Course Materials Management

### 3.1 Get Course Materials

**Route:** `GET /api/doctor/courses/{courseInstanceId}/materials`

**Full URL Example:**
```http
GET /api/doctor/courses/101/materials
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "courseInstanceId": 101,
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
            "downloadCount": 0,
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
            "downloadCount": 0,
            "isVisible": true
          }
        ]
      }
    ]
  }
}
```

---

### 3.2 Create Course Material

**Route:** `POST /api/doctor/courses/{courseInstanceId}/materials`

**Full URL Example:**
```http
POST /api/doctor/courses/101/materials
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Request Body:**
```json
{
  "title": "Lecture 3 - Linked Lists",
  "type": 1,
  "contentUrl": "https://storage.example.com/materials/lecture3.pdf",
  "weekNumber": 3
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| title | Yes | Non-empty, max 200 chars |
| type | Yes | Enum: `1`=File, `2`=Link |
| contentUrl | Yes | Valid URL. For type=File, must be a valid absolute URL. For type=Link, must be a valid absolute URL |
| weekNumber | Yes | Positive integer |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Material uploaded successfully",
  "data": {
    "materialId": 4,
    "title": "Lecture 3 - Linked Lists",
    "type": 1,
    "weekNumber": 3,
    "createdOn": "2025-09-29T10:00:00Z"
  }
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 400 | ValidationError | "Title is required" / "Invalid material type" |
| 400 | InvalidUrl | "ContentUrl must be a valid absolute URL" |
| 403 | Forbidden | "You can only add materials to your own courses" |

---

### 3.3 Delete Course Material

**Route:** `DELETE /api/doctor/materials/{materialId}`

**Full URL Example:**
```http
DELETE /api/doctor/materials/4
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Material deleted successfully"
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 404 | NotFound | "Material not found" |
| 403 | Forbidden | "You can only delete materials from your own courses" |

---

## 📊 4. Grades Management

### 4.1 Get Course Grades

**Route:** `GET /api/doctor/courses/{courseInstanceId}/grades`

**Full URL Example:**
```http
GET /api/doctor/courses/101/grades
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "courseInstanceId": 101,
    "courseName": "Data Structures",
    "weights": {
      "midterm": 30,
      "final": 40,
      "practical": 20,
      "quizzes": 10,
      "oral": 0,
      "total": 100
    },
    "students": [
      {
        "enrollmentId": 500,
        "studentId": 1001,
        "studentCode": "STU-2025-001",
        "studentName": "Mohamed Khaled",
        "midterm": 28.5,
        "final": 36.0,
        "practical": 18.0,
        "quizzes": 9.0,
        "oral": null,
        "totalScore": 91.5,
        "letterGrade": 0
      },
      {
        "enrollmentId": 501,
        "studentId": 1002,
        "studentCode": "STU-2025-002",
        "studentName": "Ahmed Ali",
        "midterm": 25.0,
        "final": 32.0,
        "practical": 16.0,
        "quizzes": 8.0,
        "oral": null,
        "totalScore": 81.0,
        "letterGrade": 3
      }
    ]
  }
}
```

---

### 4.2 Update Student Grades

**Route:** `PUT /api/doctor/enrollments/{enrollmentId}/grades`

**Full URL Example:**
```http
PUT /api/doctor/enrollments/500/grades
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Request Body:**
```json
{
  "midterm": 28.5,
  "final": 36.0,
  "practical": 18.0,
  "quizzes": 9.0,
  "oral": null
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| midterm | No | Decimal ≥ 0, max = course midterm weight |
| final | No | Decimal ≥ 0, max = course final weight |
| practical | No | Decimal ≥ 0, max = course practical weight |
| quizzes | No | Decimal ≥ 0, max = course quizzes weight |
| oral | No | Decimal ≥ 0, max = course oral weight |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Grades updated successfully",
  "data": {
    "enrollmentId": 500,
    "totalScore": 91.5,
    "letterGrade": 0
  }
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 404 | NotFound | "Enrollment not found" |
| 400 | ValidationError | "Grade cannot exceed maximum weight" |
| 403 | Forbidden | "You can only grade students in your own courses" |

---

### 4.3 Export Grades

**Route:** `GET /api/doctor/courses/{courseInstanceId}/grades/export`

**Full URL Example:**
```http
GET /api/doctor/courses/101/grades/export?format=excel
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| format | string | No | Export format: "excel" or "csv" (default: "excel") |

**Request Body:** None

**Response:** File download (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

---

## 🗓️ 5. Schedule Management

### 5.1 Get My Schedule

**Route:** `GET /api/doctor/schedule`

**Full URL Example:**
```http
GET /api/doctor/schedule?semesterId=10
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semesterId | integer | No | Filter by semester ID (default: current semester) |

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalSessions": 12,
    "lectureSessions": 6,
    "labSessions": 4,
    "totalHoursPerWeek": 18,
    "weeklySchedule": [
      {
        "day": 0,
        "slots": [
          {
            "courseScheduleId": 101,
            "startTime": "09:00:00",
            "endTime": "10:30:00",
            "courseCode": "CS301",
            "courseName": "Data Structures",
            "roomName": "Room A204",
            "type": 0,
            "colorCode": "#4285F4"
          }
        ]
      },
      {
        "day": 2,
        "slots": [
          {
            "courseScheduleId": 102,
            "startTime": "11:00:00",
            "endTime": "12:30:00",
            "courseCode": "CS401",
            "courseName": "Advanced Database Systems",
            "roomName": "Lab B305",
            "type": 1,
            "colorCode": "#34A853"
          }
        ]
      }
    ]
  }
}
```

---

## ✅ 6. Attendance Management

### 6.1 Get Attendance Sessions

**Route:** `GET /api/doctor/attendance/sessions`

**Full URL Example:**
```http
GET /api/doctor/attendance/sessions?courseInstanceId=101&date=2025-09-15
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| courseInstanceId | integer | Yes | Course instance ID |
| date | date | No | Filter by date (yyyy-MM-dd). Default: today |

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "courseInstanceId": 101,
    "courseName": "Data Structures",
    "date": "2025-09-15",
    "weekNumber": 3,
    "isAttendanceTaken": true,
    "students": [
      {
        "studentId": 1001,
        "studentCode": "STU-2025-001",
        "studentName": "Mohamed Khaled",
        "status": 0
      },
      {
        "studentId": 1002,
        "studentCode": "STU-2025-002",
        "studentName": "Ahmed Ali",
        "status": 0
      }
    ]
  }
}
```

---

### 6.2 Take Attendance

**Route:** `POST /api/doctor/attendance`

**Full URL Example:**
```http
POST /api/doctor/attendance
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Request Body:**
```json
{
  "courseInstanceId": 101,
  "date": "2025-09-15",
  "weekNumber": 3,
  "notes": "Regular session",
  "students": [
    {
      "studentId": 1001,
      "status": 0
    },
    {
      "studentId": 1002,
      "status": 0
    },
    {
      "studentId": 1003,
      "status": 1
    }
  ]
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| courseInstanceId | Yes | Valid course instance ID |
| date | Yes | Valid date (not in future) |
| weekNumber | Yes | Positive integer |
| notes | No | Max 500 chars |
| students | Yes | Non-empty array |
| students[].studentId | Yes | Valid student ID |
| students[].status | Yes | Enum: `0`=Present, `1`=Absent, `2`=Late |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Attendance saved for Data Structures on Sep 15, 2025"
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 400 | ValidationError | "Date cannot be in the future" |
| 404 | NotFound | "Course instance not found" |
| 403 | Forbidden | "You can only record attendance for your own courses" |

---

### 6.3 Get Student Attendance Summary

**Route:** `GET /api/doctor/courses/{courseInstanceId}/attendance-summary`

**Full URL Example:**
```http
GET /api/doctor/courses/101/attendance-summary
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "courseInstanceId": 101,
    "courseName": "Data Structures",
    "totalSessions": 14,
    "students": [
      {
        "studentId": 1001,
        "studentCode": "STU-2025-001",
        "studentName": "Mohamed Khaled",
        "sessionsAttended": 12,
        "sessionsAbsent": 2,
        "totalSessions": 14,
        "attendancePercentage": 85.7,
        "warningStatus": 0
      },
      {
        "studentId": 1002,
        "studentCode": "STU-2025-002",
        "studentName": "Ahmed Ali",
        "sessionsAttended": 14,
        "sessionsAbsent": 0,
        "totalSessions": 14,
        "attendancePercentage": 100.0,
        "warningStatus": 0
      }
    ]
  }
}
```

---

### 6.4 Export Attendance Report

**Route:** `GET /api/doctor/courses/{courseInstanceId}/attendance-summary/export`

**Full URL Example:**
```http
GET /api/doctor/courses/101/attendance-summary/export?format=excel
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| format | string | No | Export format: "excel" or "csv" (default: "excel") |

**Request Body:** None

**Response:** File download (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

---

## 📢 7. Announcements Management

### 7.1 List My Announcements

**Route:** `GET /api/doctor/announcements`

**Full URL Example:**
```http
GET /api/doctor/announcements?type=3&page=1&pageSize=20
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | integer | No | Filter by NotificationType |
| page | integer | No | Page number (default: 1) |
| pageSize | integer | No | Items per page (default: 20, max: 100) |

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "Midterm Exam Schedule",
        "type": 1,
        "typeDisplay": "Exam Reminder",
        "target": "CS301 — Data Structures",
        "recipientsCount": 45,
        "sentDate": "2025-01-15T10:00:00Z"
      },
      {
        "id": 2,
        "title": "Assignment Deadline Extended",
        "type": 3,
        "typeDisplay": "General Announcement",
        "target": "All My Students",
        "recipientsCount": 127,
        "sentDate": "2025-01-14T09:30:00Z"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalCount": 25,
    "totalPages": 2,
    "sentToday": 2
  }
}
```

---

### 7.2 Create Announcement

**Route:** `POST /api/doctor/announcements`

**Full URL Example:**
```http
POST /api/doctor/announcements
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Request Body:**
```json
{
  "title": "Midterm Exam Schedule",
  "message": "The midterm exam will be held on January 25, 2025 at 10:00 AM in Hall A. Please bring your student ID.",
  "type": 1,
  "target": 1,
  "courseInstanceId": 101,
  "studentIds": null,
  "sendInApp": true,
  "sendEmail": false,
  "sendSms": false
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| title | Yes | Non-empty, max 200 chars |
| message | Yes | Non-empty, max 2000 chars |
| type | Yes | Valid NotificationType enum |
| target | Yes | Enum: `0`=AllMyStudents, `1`=SpecificCourse, `2`=SpecificStudents |
| courseInstanceId | Conditional | Required if target=1 |
| studentIds | Conditional | Required if target=2, non-empty array |
| sendInApp | No | Boolean (default: true) |
| sendEmail | No | Boolean (default: false) |
| sendSms | No | Boolean (default: false) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Announcement sent to 45 students",
  "data": {
    "announcementId": 3,
    "recipientsCount": 45,
    "sentDate": "2025-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 400 | ValidationError | "Title is required" / "Message is required" |
| 400 | TargetRequired | "CourseInstanceId is required for SpecificCourse target" |
| 400 | TargetRequired | "StudentIds is required for SpecificStudents target" |
| 403 | Forbidden | "You can only send announcements to your own students" |

---

## 👤 8. Profile Management

### 8.1 Get Doctor Profile

**Route:** `GET /api/doctor/profile`

**Full URL Example:**
```http
GET /api/doctor/profile
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "doc-2001",
    "email": "ahmed.hassan@university.edu",
    "phoneNumber": "+20 1234567890",
    "profilePictureUrl": "https://storage.example.com/profiles/ahmed.jpg",
    "doctorId": 5,
    "title": 0,
    "departmentName": "Computer Science",
    "officeRoomName": "Room B305",
    "totalCourses": 3,
    "totalStudents": 127
  }
}
```

---

### 8.2 Update Doctor Profile

**Route:** `PUT /api/doctor/profile`

**Full URL Example:**
```http
PUT /api/doctor/profile
```

**Authorization:** `Bearer {token}` (Role: Doctor)

**Request Body:**
```json
{
  "phoneNumber": "+20 9876543210",
  "profilePictureUrl": "https://storage.example.com/profiles/ahmed-new.jpg",
  "officeRoomId": 30
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

## 📊 Enum Reference for Doctor Portal

| Enum | Values |
|------|--------|
| **ScheduleType** | `0`=Lecture, `1`=Lab, `2`=Tutorial |
| **MaterialType** | `0`=None, `1`=File, `2`=Link |
| **NotificationType** | `0`=LectureCancelled, `1`=ExamReminder, `2`=AcademicWarning, `3`=GeneralAnnouncement, `4`=FeesDue, `5`=RegistrationOpen, `6`=RegistrationClosed, `7`=GradePublished, `8`=QuizAdded, `9`=ScheduleChanged |
| **AttendanceStatus** | `0`=Present, `1`=Absent, `2`=Late |
| **AttendanceWarningStatus** | `0`=Good (≥85%), `1`=Warning (75-84%), `2`=Danger (<75%) |
| **Grade** | `0`=APlus, `1`=A, `2`=AMinus, `3`=BPlus, `4`=B, `5`=CPlus, `6`=C, `7`=DPlus, `8`=D, `9`=DMinus, `10`=F |
| **DoctorTitle** | `0`=Professor, `1`=AssociateProfessor, `2`=AssistantProfessor, `3`=Lecturer, `4`=TeachingAssistant |
| **AnnouncementTarget** | `0`=AllMyStudents, `1`=SpecificCourse, `2`=SpecificStudents |
| **DayOfWeek** | `0`=Sunday, `1`=Monday, `2`=Tuesday, `3`=Wednesday, `4`=Thursday, `5`=Friday, `6`=Saturday |

---

## 🎯 UI Dropdown Data Sources

| Dropdown | API Endpoint | Display Field | Value Field |
|----------|--------------|---------------|-------------|
| Semester | `GET /api/admin/academic-years` → semesters | `SemesterNumber` (as text) | `Id` |
| Course Instance | `GET /api/doctor/courses` | `CourseCode` + `CourseName` | `CourseInstanceId` |
| Material Type | Static enum | "File", "Link" | 1-2 |
| Week Number | Static (1-16) | "Week 1", "Week 2", etc. | Integer |
| Notification Type | Static enum | "Exam Reminder", "General Announcement", etc. | 0-9 |
| Announcement Target | Static enum | "All My Students", "Specific Course", "Specific Students" | 0-2 |
| Attendance Status | Static enum | "Present", "Absent", "Late" | 0-2 |
| Room | `GET /api/admin/rooms` | `Name` | `Id` |
| Student | `GET /api/doctor/courses/{id}/students` | `StudentName` + `StudentCode` | `StudentId` |

---

## 📝 Route Summary

### Dashboard
| Operation | Route |
|-----------|-------|
| Get Dashboard | `GET /api/doctor/dashboard` |

### My Courses
| Operation | Route |
|-----------|-------|
| List My Courses | `GET /api/doctor/courses` |
| Get Course Students | `GET /api/doctor/courses/{courseInstanceId}/students` |
| Export Course Students | `GET /api/doctor/courses/{courseInstanceId}/students/export` |

### Course Materials
| Operation | Route |
|-----------|-------|
| Get Materials | `GET /api/doctor/courses/{courseInstanceId}/materials` |
| Create Material | `POST /api/doctor/courses/{courseInstanceId}/materials` |
| Delete Material | `DELETE /api/doctor/materials/{materialId}` |

### Grades
| Operation | Route |
|-----------|-------|
| Get Course Grades | `GET /api/doctor/courses/{courseInstanceId}/grades` |
| Update Student Grades | `PUT /api/doctor/enrollments/{enrollmentId}/grades` |
| Export Grades | `GET /api/doctor/courses/{courseInstanceId}/grades/export` |

### Schedule
| Operation | Route |
|-----------|-------|
| Get My Schedule | `GET /api/doctor/schedule` |

### Attendance
| Operation | Route |
|-----------|-------|
| Get Attendance Sessions | `GET /api/doctor/attendance/sessions` |
| Take Attendance | `POST /api/doctor/attendance` |
| Get Attendance Summary | `GET /api/doctor/courses/{courseInstanceId}/attendance-summary` |
| Export Attendance | `GET /api/doctor/courses/{courseInstanceId}/attendance-summary/export` |

### Announcements
| Operation | Route |
|-----------|-------|
| List My Announcements | `GET /api/doctor/announcements` |
| Create Announcement | `POST /api/doctor/announcements` |

### Profile
| Operation | Route |
|-----------|-------|
| Get Profile | `GET /api/doctor/profile` |
| Update Profile | `PUT /api/doctor/profile` |

---

*← Previous:* [API_Integration_AdminPortal.md](./API_Integration_AdminPortal.md)  
*→ Next:* [API_Integration_StudentPortal.md](./API_Integration_StudentPortal.md)
