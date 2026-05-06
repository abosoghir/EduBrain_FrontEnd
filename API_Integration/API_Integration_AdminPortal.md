# 📘 EduBrain — API Integration: Admin Portal

## File 2 of 5

---

## 1. Overview

This document defines all RESTful API endpoints required to support the Admin Portal UI screens. Each endpoint is strictly mapped to the UI Requirements defined in `UI_Flows/02_Admin_Portal.md`.

### Base URL: `/api`
### Access: `Admin` role only (unless otherwise specified)

---

## 📊 1. Admin Dashboard

### 1.1 Get Dashboard Statistics

**Route:** `GET /api/admin/dashboard/stats`

**Full URL Example:**
```http
GET /api/admin/dashboard/stats
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalStudents": 1250,
    "totalDoctors": 45,
    "totalCourses": 78,
    "activeCourseInstances": 156,
    "registrationStatus": "Open",
    "unpaidFeesCount": 23,
    "currentAcademicYear": "2025-2026",
    "currentSemester": "First"
  }
}
```

---

### 1.2 Get Recent Activity Feed

**Route:** `GET /api/admin/dashboard/activity`

**Full URL Example:**
```http
GET /api/admin/dashboard/activity?limit=10
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Number of recent activities to return (default: 10) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "event": "New student Mohamed Khaled added",
      "performedBy": "Admin",
      "timestamp": "2025-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "event": "Registration opened for Fall 2025",
      "performedBy": "Admin",
      "timestamp": "2025-01-14T09:00:00Z"
    }
  ]
}
```

---

### 1.3 Toggle Registration Status

**Route:** `POST /api/admin/registration/toggle`

**Full URL Example:**
```http
POST /api/admin/registration/toggle
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "semesterId": 10,
  "action": "open"
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| semesterId | Yes | Valid semester ID |
| action | Yes | Enum: "open" or "close" |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Registration is now open",
  "data": {
    "status": "Open",
    "semester": "First 2025-2026"
  }
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 400 | InvalidAction | "Invalid action. Use 'open' or 'close'" |
| 404 | SemesterNotFound | "Semester not found" |
| 400 | AlreadyOpen | "Registration is already open for this semester" |
| 400 | AlreadyClosed | "Registration is already closed for this semester" |

---

## 📅 2. Academic Years Management

### 2.1 List Academic Years

**Route:** `GET /api/admin/academic-years`

**Full URL Example:**
```http
GET /api/admin/academic-years
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "2025-2026",
      "startDate": "2025-09-01",
      "endDate": "2026-06-30",
      "semestersCount": 2,
      "status": "Active"
    },
    {
      "id": 2,
      "name": "2024-2025",
      "startDate": "2024-09-01",
      "endDate": "2025-06-30",
      "semestersCount": 2,
      "status": "Inactive"
    }
  ]
}
```

---

### 2.2 Create Academic Year

**Route:** `POST /api/admin/academic-years`

**Full URL Example:**
```http
POST /api/admin/academic-years
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "name": "2025-2026",
  "startDate": "2025-09-01",
  "endDate": "2026-06-30"
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| name | Yes | Non-empty, max 50 chars, unique |
| startDate | Yes | Valid date (yyyy-MM-dd) |
| endDate | Yes | Valid date, must be after startDate |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Academic year created successfully",
  "data": {
    "id": 3
  }
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 400 | ValidationError | "End date must be after start date" |
| 400 | DuplicateName | "Academic year name already exists" |
| 403 | Forbidden | "Admin role required" |

---

### 2.3 Update Academic Year

**Route:** `PUT /api/admin/academic-years/{id}`

**Full URL Example:**
```http
PUT /api/admin/academic-years/1
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "name": "2025-2026 Updated",
  "startDate": "2025-09-15",
  "endDate": "2026-07-15"
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| name | No | If provided, non-empty, max 50 chars, unique |
| startDate | No | Valid date |
| endDate | No | Valid date, must be after startDate |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Academic year updated successfully"
}
```

---

### 2.4 Delete Academic Year

**Route:** `DELETE /api/admin/academic-years/{id}`

**Full URL Example:**
```http
DELETE /api/admin/academic-years/3
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Academic year deleted successfully"
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 404 | NotFound | "Academic year not found" |
| 400 | CannotDelete | "Cannot delete academic year with semesters" |

---

### 2.5 Get Academic Year Details (with Semesters)

**Route:** `GET /api/admin/academic-years/{id}`

**Full URL Example:**
```http
GET /api/admin/academic-years/1
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "2025-2026",
    "startDate": "2025-09-01",
    "endDate": "2026-06-30",
    "semesters": [
      {
        "id": 10,
        "semesterNumber": 0,
        "semesterNumberDisplay": "First",
        "startDate": "2025-09-01",
        "endDate": "2026-01-15",
        "midtermStart": "2025-11-01",
        "midtermEnd": "2025-11-15",
        "finalExamStart": "2026-01-05",
        "finalExamEnd": "2026-01-15",
        "maxCreditHoursPerStudent": 18,
        "minCreditHoursPerStudent": 12,
        "tuitionFees": 15000.00,
        "isCurrent": true,
        "courseInstancesCount": 45
      },
      {
        "id": 11,
        "semesterNumber": 1,
        "semesterNumberDisplay": "Second",
        "startDate": "2026-01-20",
        "endDate": "2026-06-30",
        "maxCreditHoursPerStudent": 18,
        "minCreditHoursPerStudent": 12,
        "tuitionFees": 15000.00,
        "isCurrent": false,
        "courseInstancesCount": 42
      }
    ]
  }
}
```

---

## 📅 3. Semesters Management

### 3.1 Create Semester

**Route:** `POST /api/admin/academic-years/{academicYearId}/semesters`

**Full URL Example:**
```http
POST /api/admin/academic-years/1/semesters
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "semesterNumber": 0,
  "startDate": "2025-09-01",
  "endDate": "2026-01-15",
  "midtermStart": "2025-11-01",
  "midtermEnd": "2025-11-15",
  "finalExamStart": "2026-01-05",
  "finalExamEnd": "2026-01-15",
  "maxCreditHoursPerStudent": 18,
  "minCreditHoursPerStudent": 12,
  "tuitionFees": 15000.00,
  "isCurrent": true
}
```

**Validation Rules:**
| Field | Required | Default | Validation |
|-------|----------|---------|------------|
| semesterNumber | Yes | - | Enum: 0 (First), 1 (Second), 2 (Summer) |
| startDate | Yes | - | Valid date, within academic year |
| endDate | Yes | - | Valid date, after startDate, within academic year |
| midtermStart | No | null | Valid date, within semester |
| midtermEnd | No | null | Valid date, after midtermStart |
| finalExamStart | No | null | Valid date, within semester |
| finalExamEnd | No | null | Valid date, after finalExamStart |
| maxCreditHoursPerStudent | No | 18 | Positive integer |
| minCreditHoursPerStudent | No | 12 | Positive integer, ≤ maxCreditHours |
| tuitionFees | No | null | Positive decimal |
| isCurrent | No | false | Boolean |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Semester created successfully",
  "data": {
    "id": 12
  }
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 400 | ValidationError | "Invalid SemesterNumber" |
| 400 | AlreadyExists | "Semester already exists for this academic year" |
| 400 | DateOutOfRange | "Semester dates must be within academic year" |
| 404 | NotFound | "Academic year not found" |

---

### 3.2 Update Semester

**Route:** `PUT /api/admin/semesters/{id}`

**Full URL Example:**
```http
PUT /api/admin/semesters/10
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "startDate": "2025-09-05",
  "endDate": "2026-01-20",
  "midtermStart": "2025-11-05",
  "midtermEnd": "2025-11-20",
  "finalExamStart": "2026-01-10",
  "finalExamEnd": "2026-01-20",
  "maxCreditHoursPerStudent": 21,
  "minCreditHoursPerStudent": 12,
  "tuitionFees": 16000.00
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| startDate | No | Valid date |
| endDate | No | Valid date, after startDate |
| midtermStart | No | Valid date |
| midtermEnd | No | Valid date, after midtermStart |
| finalExamStart | No | Valid date |
| finalExamEnd | No | Valid date, after finalExamStart |
| maxCreditHoursPerStudent | No | Positive integer |
| minCreditHoursPerStudent | No | Positive integer, ≤ maxCreditHours |
| tuitionFees | No | Positive decimal |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Semester updated successfully"
}
```

---

### 3.3 Delete Semester

**Route:** `DELETE /api/admin/semesters/{id}`

**Full URL Example:**
```http
DELETE /api/admin/semesters/12
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Semester deleted successfully"
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 404 | NotFound | "Semester not found" |
| 400 | CannotDelete | "Cannot delete semester with course instances" |

---

### 3.4 Set Current Semester

**Route:** `PUT /api/admin/semesters/{id}/set-current`

**Full URL Example:**
```http
PUT /api/admin/semesters/11/set-current
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Current semester updated successfully",
  "data": {
    "previousCurrentSemesterId": 10,
    "newCurrentSemesterId": 11
  }
}
```

---

## 📚 4. Courses Management

### 4.1 List Courses

**Route:** `GET /api/admin/courses`

**Full URL Example:**
```http
GET /api/admin/courses?departmentId=1&courseType=0&search=CS301&page=1&pageSize=50
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| departmentId | integer | No | Filter by department ID |
| courseType | integer | No | Filter by type: `0`=Compulsory, `1`=Elective |
| search | string | No | Search by course code or name |
| page | integer | No | Page number (default: 1) |
| pageSize | integer | No | Items per page (default: 50) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 50,
        "code": "CS301",
        "name": "Data Structures",
        "description": "Fundamental data structures and algorithms",
        "creditHours": 3,
        "theoryHours": 2,
        "practicalHours": 2,
        "courseType": 0,
        "courseTypeDisplay": "Compulsory",
        "price": 1500.00,
        "pricePerCreditHour": 500.00,
        "passingGrade": 50.0,
        "departments": ["Computer Science", "IT"],
        "prerequisites": ["CS201", "CS202"],
        "gradeWeights": {
          "midterm": 30,
          "final": 40,
          "practical": 20,
          "quizzes": 10,
          "oral": 0
        }
      }
    ],
    "page": 1,
    "pageSize": 50,
    "totalCount": 78,
    "totalPages": 2
  }
}
```

---

### 4.2 Get Course Details

**Route:** `GET /api/admin/courses/{id}`

**Full URL Example:**
```http
GET /api/admin/courses/50
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 50,
    "code": "CS301",
    "name": "Data Structures",
    "description": "Fundamental data structures and algorithms",
    "creditHours": 3,
    "theoryHours": 2,
    "practicalHours": 2,
    "price": 1500.00,
    "pricePerCreditHour": 500.00,
    "courseType": 0,
    "courseTypeDisplay": "Compulsory",
    "passingGrade": 50.0,
    "gradeWeights": {
      "midterm": 30,
      "final": 40,
      "practical": 20,
      "quizzes": 10,
      "oral": 0
    },
    "departments": [
      {
        "id": 1,
        "name": "Computer Science",
        "code": "CS"
      },
      {
        "id": 2,
        "name": "Information Technology",
        "code": "IT"
      }
    ],
    "prerequisites": [
      {
        "id": 45,
        "code": "CS201",
        "name": "Programming Fundamentals"
      }
    ],
    "instances": [
      {
        "id": 101,
        "semesterName": "Fall 2025",
        "doctorName": "Dr. Ahmed Hassan",
        "maxCapacity": 50,
        "currentEnrolled": 45,
        "isFull": false
      }
    ]
  }
}
```

---

### 4.3 Create Course

**Route:** `POST /api/admin/courses`

**Full URL Example:**
```http
POST /api/admin/courses
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "code": "CS401",
  "name": "Advanced Database Systems",
  "description": "Advanced concepts in database management systems",
  "creditHours": 3,
  "theoryHours": 2,
  "practicalHours": 2,
  "courseType": 0,
  "price": 1800.00,
  "pricePerCreditHour": 600.00,
  "passingGrade": 50.0,
  "departmentIds": [1, 2],
  "prerequisiteIds": [45],
  "gradeWeights": {
    "midterm": 30,
    "final": 40,
    "practical": 20,
    "quizzes": 10,
    "oral": 0
  }
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| code | Yes | Non-empty, max 10 chars, unique |
| name | Yes | Non-empty, max 200 chars |
| description | No | Max 1000 chars |
| creditHours | Yes | Integer 1–6, default: 3 |
| theoryHours | Yes | Integer ≥ 0 |
| practicalHours | Yes | Integer ≥ 0 |
| courseType | Yes | Enum: 0 (Compulsory), 1 (Elective) |
| price | No | Decimal ≥ 0 |
| pricePerCreditHour | No | Decimal ≥ 0 |
| passingGrade | Yes | Decimal 0–100, default: 50 |
| departmentIds | Yes | Array of valid department IDs, min 1 |
| prerequisiteIds | No | Array of valid course IDs |
| gradeWeights | Yes | Object with midterm+final+practical+quizzes+oral = 100 |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": 51
  }
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 400 | ValidationError | "Code is required" / "Invalid CourseType" |
| 400 | DuplicateCode | "Course code already exists" |
| 400 | InvalidWeights | "Grade weights must sum to exactly 100%" |
| 400 | InvalidDepartment | "Invalid department ID" |
| 400 | CircularPrerequisite | "Cannot add circular prerequisite" |
| 403 | Forbidden | "Admin role required" |

---

### 4.4 Update Course

**Route:** `PUT /api/admin/courses/{id}`

**Full URL Example:**
```http
PUT /api/admin/courses/50
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** (All fields optional)
```json
{
  "code": "CS301-NEW",
  "name": "Data Structures and Algorithms",
  "description": "Updated description",
  "creditHours": 4,
  "theoryHours": 3,
  "practicalHours": 2,
  "courseType": 0,
  "price": 2000.00,
  "pricePerCreditHour": 500.00,
  "passingGrade": 60.0,
  "departmentIds": [1],
  "prerequisiteIds": [45, 46],
  "gradeWeights": {
    "midterm": 30,
    "final": 40,
    "practical": 20,
    "quizzes": 10,
    "oral": 0
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Course updated successfully"
}
```

---

### 4.5 Delete Course

**Route:** `DELETE /api/admin/courses/{id}`

**Full URL Example:**
```http
DELETE /api/admin/courses/51
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 404 | NotFound | "Course not found" |
| 400 | CannotDelete | "Cannot delete course with active instances" |

---

### 4.6 Add Prerequisite to Course

**Route:** `POST /api/admin/courses/{courseId}/prerequisites`

**Full URL Example:**
```http
POST /api/admin/courses/50/prerequisites
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "prerequisiteCourseId": 45
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Prerequisite added successfully"
}
```

---

### 4.7 Remove Prerequisite from Course

**Route:** `DELETE /api/admin/courses/{courseId}/prerequisites/{prerequisiteCourseId}`

**Full URL Example:**
```http
DELETE /api/admin/courses/50/prerequisites/45
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Prerequisite removed successfully"
}
```

---

## 🧩 5. Course Instances Management

### 5.1 List Course Instances

**Route:** `GET /api/admin/course-instances`

**Full URL Example:**
```http
GET /api/admin/course-instances?semesterId=10&departmentId=1&doctorId=5&search=CS301&page=1&pageSize=50
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semesterId | integer | No | Filter by semester ID |
| departmentId | integer | No | Filter by department ID |
| doctorId | integer | No | Filter by doctor ID |
| search | string | No | Search by course code or name |
| page | integer | No | Page number (default: 1) |
| pageSize | integer | No | Items per page (default: 50) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 101,
        "courseId": 50,
        "courseCode": "CS301",
        "courseName": "Data Structures",
        "semesterId": 10,
        "semesterName": "First 2025-2026",
        "doctorId": 5,
        "doctorName": "Dr. Ahmed Hassan",
        "doctorTitle": 0,
        "doctorTitleDisplay": "Professor",
        "maxCapacity": 60,
        "currentEnrolled": 45,
        "enrollmentPercentage": 75,
        "status": "Open"
      }
    ],
    "page": 1,
    "pageSize": 50,
    "totalCount": 156,
    "totalPages": 4
  }
}
```

---

### 5.2 Create Course Instance

**Route:** `POST /api/admin/course-instances`

**Full URL Example:**
```http
POST /api/admin/course-instances
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "courseId": 50,
  "semesterId": 10,
  "doctorId": 5,
  "maxCapacity": 60
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| courseId | Yes | Valid course ID |
| semesterId | Yes | Valid semester ID |
| doctorId | Yes | Valid doctor ID |
| maxCapacity | Yes | Positive integer, min: 1 |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Course instance created successfully",
  "data": {
    "id": 102
  }
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 404 | NotFound | "Course not found" / "Semester not found" / "Doctor not found" |
| 400 | AlreadyExists | "Course instance already exists for this course and semester" |
| 403 | Forbidden | "Admin role required" |

---

### 5.3 Update Course Instance

**Route:** `PUT /api/admin/course-instances/{id}`

**Full URL Example:**
```http
PUT /api/admin/course-instances/101
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** (All fields optional)
```json
{
  "doctorId": 6,
  "maxCapacity": 70
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Course instance updated successfully"
}
```

---

### 5.4 Delete Course Instance

**Route:** `DELETE /api/admin/course-instances/{id}`

**Full URL Example:**
```http
DELETE /api/admin/course-instances/102
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Course instance deleted successfully"
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 404 | NotFound | "Course instance not found" |
| 400 | CannotDelete | "Cannot delete course instance with enrolled students" |

---

### 5.5 Get Course Instance Enrollments

**Route:** `GET /api/admin/course-instances/{id}/enrollments`

**Full URL Example:**
```http
GET /api/admin/course-instances/101/enrollments?page=1&pageSize=50
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "enrollmentId": 500,
        "studentId": 1001,
        "studentName": "Mohamed Khaled",
        "studentCode": "20230001",
        "enrollmentDate": "2025-09-05",
        "status": "Active"
      }
    ],
    "page": 1,
    "pageSize": 50,
    "totalCount": 45,
    "totalPages": 1
  }
}
```

---

## 🏛️ 6. Departments Management

### 6.1 List Departments

**Route:** `GET /api/admin/departments`

**Full URL Example:**
```http
GET /api/admin/departments?type=1&hasHead=true&page=1&pageSize=50
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | integer | No | Filter by DepartmentType: `0`=General, `1`=ComputerScience, `2`=InformationTechnology, `3`=SoftwareEngineering, `4`=ArtificialIntelligence, `5`=CyberSecurity |
| hasHead | boolean | No | Filter by whether department has a head assigned |
| page | integer | No | Page number (default: 1) |
| pageSize | integer | No | Items per page (default: 50) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Computer Science",
        "code": "CS",
        "description": "Department of Computer Science",
        "departmentType": 1,
        "departmentTypeDisplay": "Computer Science",
        "headDoctorId": 5,
        "headDoctorName": "Dr. Ahmed Hassan",
        "coursesCount": 25,
        "studentsCount": 450,
        "doctorsCount": 12
      }
    ],
    "page": 1,
    "pageSize": 50,
    "totalCount": 6,
    "totalPages": 1
  }
}
```

---

### 6.2 Create Department

**Route:** `POST /api/admin/departments`

**Full URL Example:**
```http
POST /api/admin/departments
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "name": "Artificial Intelligence",
  "code": "AI",
  "description": "Department of Artificial Intelligence and Machine Learning",
  "departmentType": 4,
  "headDoctorId": null
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| name | Yes | Non-empty, max 100 chars, unique |
| code | Yes | Non-empty, max 10 chars, unique |
| description | No | Max 500 chars |
| departmentType | Yes | Valid enum value |
| headDoctorId | No | Valid doctor ID (optional) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": 7
  }
}
```

---

### 6.3 Update Department

**Route:** `PUT /api/admin/departments/{id}`

**Full URL Example:**
```http
PUT /api/admin/departments/1
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** (All fields optional)
```json
{
  "name": "Computer Science and Engineering",
  "code": "CSE",
  "description": "Updated description",
  "departmentType": 1,
  "headDoctorId": 6
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Department updated successfully"
}
```

---

### 6.4 Delete Department

**Route:** `DELETE /api/admin/departments/{id}`

**Full URL Example:**
```http
DELETE /api/admin/departments/7
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Department deleted successfully"
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 404 | NotFound | "Department not found" |
| 400 | CannotDelete | "Cannot delete department with courses" |
| 400 | CannotDelete | "Cannot delete department with students" |

---

### 6.5 Set Department Head

**Route:** `PUT /api/admin/departments/{id}/set-head`

**Full URL Example:**
```http
PUT /api/admin/departments/1/set-head
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "doctorId": 6
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Department head updated successfully",
  "data": {
    "previousHeadDoctorId": 5,
    "newHeadDoctorId": 6
  }
}
```

---

## 👥 7. Users Management

### 7.1 List Users

**Route:** `GET /api/admin/users`

**Full URL Example:**
```http
GET /api/admin/users?role=Student&departmentId=1&yearLevel=1&status=Active&search=mohamed&page=1&pageSize=50
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| role | string | No | Filter by role: "Student", "Doctor", "Advisor" |
| departmentId | integer | No | Filter by department ID |
| yearLevel | integer | No | Filter students by year level: `0`=Freshman, `1`=Sophomore, `2`=Junior, `3`=Senior |
| status | string | No | Filter by status: "Active", "Inactive" |
| search | string | No | Search by name, email, or student code |
| page | integer | No | Page number (default: 1) |
| pageSize | integer | No | Items per page (default: 50) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1001,
        "fullName": "Mohamed Khaled",
        "email": "mohamed.khaled@example.com",
        "role": "Student",
        "roleDisplay": "Student",
        "departmentName": "Computer Science",
        "status": "Active",
        "details": {
          "yearLevel": 1,
          "yearLevelDisplay": "Sophomore",
          "gpa": 3.5
        }
      },
      {
        "id": 2001,
        "fullName": "Dr. Ahmed Hassan",
        "email": "ahmed.hassan@example.com",
        "role": "Doctor",
        "roleDisplay": "Doctor",
        "departmentName": "Computer Science",
        "status": "Active",
        "details": {
          "title": 0,
          "titleDisplay": "Professor"
        }
      },
      {
        "id": 3001,
        "fullName": "Prof. Sara Ali",
        "email": "sara.ali@example.com",
        "role": "Advisor",
        "roleDisplay": "Academic Advisor",
        "departmentName": "Computer Science",
        "status": "Active",
        "details": {
          "adviseesCount": 45
        }
      }
    ],
    "page": 1,
    "pageSize": 50,
    "totalCount": 1250,
    "totalPages": 25
  }
}
```

---

### 7.2 Create Student

**Route:** `POST /api/admin/users/students`

**Full URL Example:**
```http
POST /api/admin/users/students
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "fullName": "Mohamed Khaled",
  "email": "mohamed.khaled@example.com",
  "phoneNumber": "+201234567890",
  "nationalId": "12345678901234",
  "gender": 0,
  "dateOfBirth": "2000-05-15",
  "nationality": "Egyptian",
  "religion": "Islam",
  "address": "123 Main Street",
  "city": "Qena",
  "fatherPhone": "+201234567891",
  "fatherJob": "Engineer",
  "previousQualification": "High School Diploma",
  "departmentId": 1,
  "advisorId": 3001,
  "yearLevel": 0,
  "password": "TempPass123!"
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| fullName | Yes | Non-empty, max 200 chars |
| email | Yes | Valid email format, unique |
| phoneNumber | No | Valid phone format |
| nationalId | Yes | Non-empty, unique |
| gender | Yes | Enum: `0`=Male, `1`=Female |
| dateOfBirth | Yes | Valid date, past date |
| nationality | Yes | Non-empty |
| religion | Yes | Non-empty |
| address | Yes | Non-empty |
| city | Yes | Non-empty |
| fatherPhone | Yes | Valid phone format |
| fatherJob | No | Max 100 chars |
| previousQualification | No | Max 200 chars |
| departmentId | No | Valid department ID |
| advisorId | No | Valid advisor ID |
| yearLevel | Yes | Enum: `0`=Freshman, `1`=Sophomore, `2`=Junior, `3`=Senior |
| password | Yes | Min 8 chars, at least 1 uppercase, 1 number |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student created successfully. Welcome email sent.",
  "data": {
    "id": 1002,
    "studentCode": "20240002"
  }
}
```

---

### 7.3 Create Doctor

**Route:** `POST /api/admin/users/doctors`

**Full URL Example:**
```http
POST /api/admin/users/doctors
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "fullName": "Dr. Ahmed Hassan",
  "email": "ahmed.hassan@example.com",
  "phoneNumber": "+201234567890",
  "title": 0,
  "departmentId": 1,
  "officeRoomId": 25,
  "password": "TempPass123!"
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| fullName | Yes | Non-empty, max 200 chars |
| email | Yes | Valid email format, unique |
| phoneNumber | No | Valid phone format |
| title | Yes | Enum: `0`=Professor, `1`=AssociateProfessor, `2`=AssistantProfessor, `3`=Lecturer, `4`=TeachingAssistant |
| departmentId | Yes | Valid department ID |
| officeRoomId | No | Valid room ID |
| password | Yes | Min 8 chars, at least 1 uppercase, 1 number |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Doctor created successfully",
  "data": {
    "id": 2002
  }
}
```

---

### 7.4 Create Academic Advisor

**Route:** `POST /api/admin/users/advisors`

**Full URL Example:**
```http
POST /api/admin/users/advisors
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "fullName": "Prof. Sara Ali",
  "email": "sara.ali@example.com",
  "phoneNumber": "+201234567890",
  "officeRoomId": 30,
  "password": "TempPass123!"
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| fullName | Yes | Non-empty, max 200 chars |
| email | Yes | Valid email format, unique |
| phoneNumber | No | Valid phone format |
| officeRoomId | No | Valid room ID |
| password | Yes | Min 8 chars, at least 1 uppercase, 1 number |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Academic advisor created successfully",
  "data": {
    "id": 3002
  }
}
```

---

### 7.5 Get User Details

**Route:** `GET /api/admin/users/{id}`

**Full URL Example:**
```http
GET /api/admin/users/1001
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Response (200 OK) - Student:**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "fullName": "Mohamed Khaled",
    "email": "mohamed.khaled@example.com",
    "phoneNumber": "+201234567890",
    "nationalId": "12345678901234",
    "gender": 0,
    "genderDisplay": "Male",
    "dateOfBirth": "2000-05-15",
    "nationality": "Egyptian",
    "religion": "Islam",
    "address": "123 Main Street",
    "city": "Qena",
    "fatherPhone": "+201234567891",
    "fatherJob": "Engineer",
    "previousQualification": "High School Diploma",
    "studentCode": "20230001",
    "departmentId": 1,
    "departmentName": "Computer Science",
    "advisorId": 3001,
    "advisorName": "Prof. Sara Ali",
    "yearLevel": 1,
    "yearLevelDisplay": "Sophomore",
    "gpa": 3.5,
    "status": "Active",
    "role": "Student"
  }
}
```

---

### 7.6 Update User

**Route:** `PUT /api/admin/users/{id}`

**Full URL Example:**
```http
PUT /api/admin/users/1001
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** (Role-specific fields based on user role)
```json
{
  "fullName": "Mohamed Khaled Updated",
  "email": "mohamed.updated@example.com",
  "phoneNumber": "+201234567999",
  "departmentId": 2,
  "advisorId": 3002,
  "yearLevel": 2,
  "status": "Active"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

---

### 7.7 Deactivate/Activate User

**Route:** `PUT /api/admin/users/{id}/status`

**Full URL Example:**
```http
PUT /api/admin/users/1001/status
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "status": "Inactive"
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| status | Yes | Enum: "Active", "Inactive" |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User status updated to Inactive"
}
```

---

## 📝 8. Registration Management

### 8.1 Get Registration Status

**Route:** `GET /api/admin/registration/status`

**Full URL Example:**
```http
GET /api/admin/registration/status
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "semesterId": 10,
    "semesterName": "First Semester 2025-2026",
    "status": "Open",
    "openedOn": "2025-09-01T00:00:00Z",
    "closesOn": "2025-09-14T23:59:59Z",
    "totalRegistrations": 1250,
    "pendingApprovals": 15
  }
}
```

---

### 8.2 Open Registration

**Route:** `POST /api/admin/registration/open`

**Full URL Example:**
```http
POST /api/admin/registration/open
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "semesterId": 11,
  "openDate": "2026-01-15",
  "closeDate": "2026-01-29"
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| semesterId | Yes | Valid semester ID, not already open |
| openDate | Yes | Valid date, not in the past |
| closeDate | Yes | Valid date, after openDate |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Registration is now open",
  "data": {
    "semesterId": 11,
    "status": "Open",
    "closesOn": "2026-01-29T23:59:59Z"
  }
}
```

---

### 8.3 Close Registration

**Route:** `POST /api/admin/registration/close`

**Full URL Example:**
```http
POST /api/admin/registration/close
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "semesterId": 10
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Registration is now closed",
  "data": {
    "semesterId": 10,
    "status": "Closed",
    "closedOn": "2025-09-10T10:30:00Z"
  }
}
```

---

## 🗓️ 9. Rooms Management

### 9.1 List Rooms

**Route:** `GET /api/admin/rooms`

**Full URL Example:**
```http
GET /api/admin/rooms?type=0&building=Main&page=1&pageSize=50
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | integer | No | Filter by RoomType: `0`=LectureHall, `1`=Lab, `2`=Office |
| building | string | No | Filter by building name |
| page | integer | No | Page number (default: 1) |
| pageSize | integer | No | Items per page (default: 50) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 25,
        "name": "Room 301",
        "roomType": 0,
        "roomTypeDisplay": "Lecture Hall",
        "building": "Building A",
        "floor": 3,
        "capacity": 60,
        "isActive": true
      }
    ],
    "page": 1,
    "pageSize": 50,
    "totalCount": 50,
    "totalPages": 1
  }
}
```

---

### 9.2 Create Room

**Route:** `POST /api/admin/rooms`

**Full URL Example:**
```http
POST /api/admin/rooms
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "name": "Lab 2",
  "roomType": 1,
  "building": "Building B",
  "floor": 2,
  "capacity": 30
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| name | Yes | Non-empty, max 50 chars, unique within building |
| roomType | Yes | Enum: `0`=LectureHall, `1`=Lab, `2`=Office |
| building | Yes | Non-empty, max 100 chars |
| floor | No | Integer ≥ 0 |
| capacity | Yes | Positive integer |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Room created successfully",
  "data": {
    "id": 51
  }
}
```

---

### 9.3 Update Room

**Route:** `PUT /api/admin/rooms/{id}`

**Full URL Example:**
```http
PUT /api/admin/rooms/25
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** (All fields optional)
```json
{
  "name": "Room 301-A",
  "roomType": 0,
  "building": "Building A",
  "floor": 3,
  "capacity": 70
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Room updated successfully"
}
```

---

### 9.4 Delete Room

**Route:** `DELETE /api/admin/rooms/{id}`

**Full URL Example:**
```http
DELETE /api/admin/rooms/51
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Room deleted successfully"
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 404 | NotFound | "Room not found" |
| 400 | CannotDelete | "Cannot delete room with scheduled classes" |

---

## 🗓️ 10. Course Schedules Management

### 10.1 List Course Schedules

**Route:** `GET /api/schedules`

**Full URL Example:**
```http
GET /api/schedules?semesterId=10&departmentId=1&doctorId=5&roomId=25&day=1
```

**Authorization:** `Bearer {token}` (Roles: Admin, AcademicAdvisor, Doctor, Student)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semesterId | integer | No | Filter by semester ID |
| departmentId | integer | No | Filter by department ID |
| doctorId | integer | No | Filter by doctor ID |
| roomId | integer | No | Filter by room ID |
| day | integer | No | Filter by DayOfWeek: `0`=Sunday, `1`=Monday, `2`=Tuesday, `3`=Wednesday, `4`=Thursday, `5`=Friday, `6`=Saturday |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "scheduleId": 101,
      "courseInstanceId": 45,
      "courseCode": "CS301",
      "courseName": "Data Structures",
      "creditHours": 3,
      "day": 1,
      "dayDisplay": "Monday",
      "startTime": "09:00",
      "endTime": "11:00",
      "scheduleType": 0,
      "scheduleTypeDisplay": "Lecture",
      "roomId": 25,
      "roomName": "Room 301",
      "roomBuilding": "Building A",
      "doctorId": 5,
      "doctorName": "Dr. Ahmed Hassan",
      "doctorTitle": 0,
      "doctorTitleDisplay": "Professor",
      "departmentId": 1,
      "departmentName": "Computer Science",
      "enrolledCount": 45,
      "maxCapacity": 50
    }
  ]
}
```

---

### 10.2 Create Course Schedule

**Route:** `POST /api/schedules`

**Full URL Example:**
```http
POST /api/schedules
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:**
```json
{
  "courseInstanceId": 45,
  "day": 1,
  "startTime": "09:00",
  "endTime": "11:00",
  "scheduleType": 0,
  "roomId": 25
}
```

**Validation Rules:**
| Field | Required | Validation |
|-------|----------|------------|
| courseInstanceId | Yes | Valid course instance ID |
| day | Yes | Enum: 0-6 (Sunday-Saturday) |
| startTime | Yes | Time format HH:mm |
| endTime | Yes | Time format HH:mm, after startTime |
| scheduleType | Yes | Enum: `0`=Lecture, `1`=Lab, `2`=Tutorial |
| roomId | No | Valid room ID |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Schedule created successfully",
  "data": {
    "scheduleId": 102,
    "courseCode": "CS301",
    "courseName": "Data Structures",
    "day": 1,
    "startTime": "09:00",
    "endTime": "11:00",
    "scheduleType": "Lecture",
    "roomName": "Room 301",
    "hasConflict": false
  }
}
```

**Error Responses:**
| Status | Code | Message |
|--------|------|---------|
| 400 | Conflict | "Room is already booked at this time" |
| 400 | Conflict | "Doctor has another class at this time" |
| 404 | NotFound | "Course instance not found" |

---

### 10.3 Update Course Schedule

**Route:** `PUT /api/schedules/{scheduleId}`

**Full URL Example:**
```http
PUT /api/schedules/101
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** (All fields optional)
```json
{
  "day": 2,
  "startTime": "10:00",
  "endTime": "12:00",
  "scheduleType": 1,
  "roomId": 30
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Schedule updated successfully"
}
```

---

### 10.4 Delete Course Schedule

**Route:** `DELETE /api/schedules/{scheduleId}`

**Full URL Example:**
```http
DELETE /api/schedules/101
```

**Authorization:** `Bearer {token}` (Role: Admin)

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Schedule deleted successfully"
}
```

---

## 📊 Enum Reference for Admin Portal

| Enum | Values |
|------|--------|
| **SemesterNumber** | `0`=First, `1`=Second, `2`=Summer |
| **RegistrationStatus** | `0`=Open, `1`=Closed |
| **CourseType** | `0`=Compulsory, `1`=Elective |
| **DepartmentType** | `0`=General, `1`=ComputerScience, `2`=InformationTechnology, `3`=SoftwareEngineering, `4`=ArtificialIntelligence, `5`=CyberSecurity |
| **DoctorTitle** | `0`=Professor, `1`=AssociateProfessor, `2`=AssistantProfessor, `3`=Lecturer, `4`=TeachingAssistant |
| **Gender** | `0`=Male, `1`=Female |
| **YearLevel** | `0`=Freshman, `1`=Sophomore, `2`=Junior, `3`=Senior |
| **ScheduleType** | `0`=Lecture, `1`=Lab, `2`=Tutorial |
| **RoomType** | `0`=LectureHall, `1`=Lab, `2`=Office |
| **DayOfWeek** | `0`=Sunday, `1`=Monday, `2`=Tuesday, `3`=Wednesday, `4`=Thursday, `5`=Friday, `6`=Saturday |
| **UserStatus** | "Active", "Inactive" |
| **UserRole** | "Student", "Doctor", "Advisor", "Admin" |

---

## 🎯 UI Dropdown Data Sources

| Dropdown | API Endpoint | Display Field | Value Field |
|----------|--------------|---------------|-------------|
| Academic Year | `GET /api/admin/academic-years` | `Name` | `Id` |
| Semester | `GET /api/admin/academic-years/{id}` | `SemesterNumber` (as text) | `Id` |
| Semester Number | Static enum | "First", "Second", "Summer" | Integer 0-2 |
| Course | `GET /api/admin/courses` | `Code` + `Name` | `Id` |
| Course Type | Static enum | "Compulsory", "Elective" | 0-1 |
| Department | `GET /api/admin/departments` | `Name` | `Id` |
| Department Type | Static enum | "General", "Computer Science", etc. | 0-5 |
| Doctor | `GET /api/admin/users?role=Doctor` | `FullName` | `Id` |
| Doctor Title | Static enum | "Professor", "Associate Professor", etc. | 0-4 |
| Academic Advisor | `GET /api/admin/users?role=Advisor` | `FullName` | `Id` |
| Student | `GET /api/admin/users?role=Student` | `FullName` + `StudentCode` | `Id` |
| Year Level | Static enum | "Freshman", "Sophomore", etc. | 0-3 |
| Gender | Static enum | "Male", "Female" | 0-1 |
| Room | `GET /api/admin/rooms` | `Name` (Building + Room) | `Id` |
| Room Type | Static enum | "Lecture Hall", "Lab", "Office" | 0-2 |
| Schedule Type | Static enum | "Lecture", "Lab", "Tutorial" | 0-2 |
| Day of Week | Static enum | "Sunday", "Monday", etc. | 0-6 |
| Course Instance | `GET /api/admin/course-instances` | `CourseCode` + `SemesterName` | `Id` |
| Prerequisite Course | `GET /api/admin/courses` | `Code` + `Name` | `Id` |

---

## 📝 Route Summary

### Dashboard
| Operation | Route |
|-----------|-------|
| Get Dashboard Stats | `GET /api/admin/dashboard/stats` |
| Get Recent Activity | `GET /api/admin/dashboard/activity` |
| Toggle Registration | `POST /api/admin/registration/toggle` |

### Academic Years
| Operation | Route |
|-----------|-------|
| List Academic Years | `GET /api/admin/academic-years` |
| Create Academic Year | `POST /api/admin/academic-years` |
| Get Academic Year Details | `GET /api/admin/academic-years/{id}` |
| Update Academic Year | `PUT /api/admin/academic-years/{id}` |
| Delete Academic Year | `DELETE /api/admin/academic-years/{id}` |

### Semesters
| Operation | Route |
|-----------|-------|
| Create Semester | `POST /api/admin/academic-years/{academicYearId}/semesters` |
| Update Semester | `PUT /api/admin/semesters/{id}` |
| Delete Semester | `DELETE /api/admin/semesters/{id}` |
| Set Current Semester | `PUT /api/admin/semesters/{id}/set-current` |

### Courses
| Operation | Route |
|-----------|-------|
| List Courses | `GET /api/admin/courses` |
| Get Course Details | `GET /api/admin/courses/{id}` |
| Create Course | `POST /api/admin/courses` |
| Update Course | `PUT /api/admin/courses/{id}` |
| Delete Course | `DELETE /api/admin/courses/{id}` |
| Add Prerequisite | `POST /api/admin/courses/{courseId}/prerequisites` |
| Remove Prerequisite | `DELETE /api/admin/courses/{courseId}/prerequisites/{prerequisiteCourseId}` |

### Course Instances
| Operation | Route |
|-----------|-------|
| List Course Instances | `GET /api/admin/course-instances` |
| Create Course Instance | `POST /api/admin/course-instances` |
| Update Course Instance | `PUT /api/admin/course-instances/{id}` |
| Delete Course Instance | `DELETE /api/admin/course-instances/{id}` |
| Get Enrollments | `GET /api/admin/course-instances/{id}/enrollments` |

### Departments
| Operation | Route |
|-----------|-------|
| List Departments | `GET /api/admin/departments` |
| Create Department | `POST /api/admin/departments` |
| Update Department | `PUT /api/admin/departments/{id}` |
| Delete Department | `DELETE /api/admin/departments/{id}` |
| Set Department Head | `PUT /api/admin/departments/{id}/set-head` |

### Users
| Operation | Route |
|-----------|-------|
| List Users | `GET /api/admin/users` |
| Create Student | `POST /api/admin/users/students` |
| Create Doctor | `POST /api/admin/users/doctors` |
| Create Advisor | `POST /api/admin/users/advisors` |
| Get User Details | `GET /api/admin/users/{id}` |
| Update User | `PUT /api/admin/users/{id}` |
| Update User Status | `PUT /api/admin/users/{id}/status` |

### Registration Management
| Operation | Route |
|-----------|-------|
| Get Registration Status | `GET /api/admin/registration/status` |
| Open Registration | `POST /api/admin/registration/open` |
| Close Registration | `POST /api/admin/registration/close` |

### Rooms
| Operation | Route |
|-----------|-------|
| List Rooms | `GET /api/admin/rooms` |
| Create Room | `POST /api/admin/rooms` |
| Update Room | `PUT /api/admin/rooms/{id}` |
| Delete Room | `DELETE /api/admin/rooms/{id}` |

### Course Schedules
| Operation | Route |
|-----------|-------|
| List Schedules | `GET /api/schedules` |
| Create Schedule | `POST /api/schedules` |
| Update Schedule | `PUT /api/schedules/{scheduleId}` |
| Delete Schedule | `DELETE /api/schedules/{scheduleId}` |

---

*← Previous:* [API_Integration_Auth.md](./API_Integration_Auth.md)  
*→ Next:* [API_Integration_DoctorPortal.md](./API_Integration_DoctorPortal.md)
