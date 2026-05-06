# 📘 EduBrain — UI/UX Requirements & Action Flow Document

## File 0: Project Overview & Full Example Scenario

---

## 1. Project Description

**EduBrain** is a comprehensive University Academic Management System designed to digitize and streamline every aspect of the academic lifecycle — from the initial creation of an academic year by the administration, all the way through to a student viewing their final transcript.

The platform serves **four distinct user roles**, each with a dedicated portal tailored to their responsibilities:

| Role | Portal | Primary Responsibility |
|------|--------|------------------------|
| **Admin** | Admin Portal | Manages academic structure (years, semesters, courses, users, departments, schedules, registration periods) |
| **Doctor** (Professor/Lecturer) | Doctor Portal | Manages assigned courses — views enrolled students, uploads materials, records attendance, and enters grades |
| **Student** | Student Portal | Views dashboard, registers for courses, views schedule, tracks grades/attendance/fees, and manages profile |
| **Academic Advisor** | Advisor Portal | Oversees assigned students — monitors academic performance, reviews registration, issues warnings, and manages schedule adjustments |

### Design Principles
- **Role-Based Access**: Each user only sees screens and actions relevant to their role.
- **Academic Year → Semester → Course Instance**: This is the core hierarchy. Everything (enrollment, grades, schedules) is tied to a specific Course Instance within a Semester.
- **Mobile-First, Responsive Design**: All portals must work seamlessly on mobile, tablet, and desktop.
- **Minimal Cognitive Load**: Group related actions together; avoid overwhelming users with too many options on a single screen.

---

## 2. Key Domain Terminology (for the Designer)

| Term | What It Means in EduBrain |
|------|---------------------------|
| **Academic Year** | A named period (e.g., "2025-2026") with a start and end date, containing semesters. |
| **Semester** | A subdivision of an Academic Year (First / Second / Summer). Has its own dates, exam periods, credit hour limits, and tuition fees. |
| **Course** | A reusable course definition (e.g., "CS301 — Data Structures", 3 credit hours). Contains grade weights and prerequisites. |
| **Course Instance** | A specific offering of a Course in a particular Semester, taught by a particular Doctor, with a capacity limit. This is what students enroll in. |
| **Enrollment** | A student's registration record for a specific Course Instance. Has a status (Enrolled, Waitlisted, Dropped, Completed, Failed). |
| **Department** | An academic department (e.g., Computer Science). Courses and users belong to departments. |
| **Credit Hours** | The weight/value of a course (typically 2 or 3). Students must register within a min–max range per semester. |
| **GPA** | Grade Point Average — cumulative academic performance score (0.0 – 4.0 scale). |
| **Registration Period** | A window of time (Open/Closed) during which students can register for courses. Controlled by the Admin. |

---

## 3. User Roles & Their Capabilities (High-Level Summary)

### 🔵 Admin
- Creates and manages **Academic Years** and **Semesters**
- Defines **Courses** and their prerequisites
- Creates **Course Instances** per semester (assigns a Doctor, sets capacity)
- Manages **Users** (creates students, doctors, advisors; assigns advisors to students)
- Opens and closes **Registration Periods**
- Manages **Departments**, **Rooms**, and **Schedules**
- Manages **Finance** (fee structures)
- Views the **Admin Dashboard** (system-wide statistics)

### 🟢 Doctor (Professor)
- Views a **Dashboard** (today's schedule, course stats, recent announcements)
- Views **My Courses** (card grid of assigned course instances)
- For each course: views **Enrolled Students**, **Materials**, **Grades**, and **Attendance**
- **Uploads course materials** (files and links, organized by week)
- **Records attendance** per session (Present/Absent for each student)
- **Enters and updates grades** per student (Midterm, Final, Practical, Quizzes, Oral)
- Sends **Announcements** to students (all students, specific course, or specific students)
- Views and updates their **Profile**

### 🟡 Student
- Views a **Dashboard** (GPA, registered courses, today's schedule, upcoming exams, notifications)
- **Registers for courses** during open registration (checks prerequisites, capacity, credit hour limits)
- Views **My Schedule** (weekly timetable or list view)
- Views **My Courses** (enrolled courses with grades, attendance, and materials per course)
- Views **My Grades** (per-semester breakdown, GPA history chart)
- Views **My Attendance** (overall and per-course session history)
- Views **Exam Schedule** (upcoming exams with hall and seat info)
- Views and pays **Fees** (tuition breakdown, payment history)
- Views **Notifications** (announcements, warnings, system alerts)
- Views and updates their **Profile** & changes password

### 🟠 Academic Advisor
- Views a **Dashboard** (total advisees, students needing attention, warnings, unpaid fees)
- Views **My Students** (paginated list with GPA, attendance %, fees status, and risk badges)
- Views **Detailed Student Profile** (full academic, attendance, fees, schedule, and warning history)
- Issues **Academic Warnings** (with level 1–3 severity and reason)
- Manages **Schedule Adjustments** (drops courses, swaps sections, manual course adds for students)
- Manages student **Fees** (assigns fees, views fee status, records payments)
- Sends **Notifications** to advisees
- Views and updates their **Profile**

---

## 4. End-to-End Scenario: A Full Academic Year

> This scenario walks through a complete real-world flow from the Admin setting up the academic year to the student viewing their final grades. Use this as a reference to understand how all portals connect.

### 🔷 Phase 1: Admin Sets Up the Academic Year

1. The **Admin** logs in → lands on the **Admin Dashboard** showing system-wide stats.
2. Admin navigates to **Academic Years** → clicks **"+ Add Academic Year"** → fills in the form:
   - **Name**: "2025-2026"
   - **Start Date**: September 1, 2025
   - **End Date**: August 31, 2026
   - Clicks **"Save"**.
3. The new Academic Year appears in the list. Admin clicks on it → sees the **Semesters** section → clicks **"+ Add Semester"**:
   - **Semester Type**: First
   - **Start Date**: September 15, 2025
   - **End Date**: January 15, 2026
   - **Midterm Period**: November 1–15, 2025
   - **Final Exam Period**: January 5–15, 2026
   - **Min Credit Hours**: 12
   - **Max Credit Hours**: 18
   - **Tuition Fees**: 5,000 EGP
   - Admin checks the **"Set as Current Semester"** toggle → clicks **"Save"**.

### 🔷 Phase 2: Admin Opens Course Instances

4. Admin navigates to **Courses** → a catalog of all courses is displayed (e.g., CS301, MATH201, ENG101).
5. Admin navigates to **Course Instances** → clicks **"+ Add Course Instance"** for the Fall 2025 semester:
   - **Select Course**: CS301 — Data Structures
   - **Select Semester**: First Semester 2025-2026
   - **Assign Doctor**: Dr. Ahmed Hassan (dropdown of doctors)
   - **Max Capacity**: 60 students
   - Clicks **"Save"**.
6. Admin repeats this for all courses that will be offered this semester.

### 🔷 Phase 3: Admin Opens Registration

7. Admin navigates to **Registration Management** → clicks **"Open Registration"**:
   - **Semester**: First Semester 2025-2026
   - **Registration Open Date**: September 1, 2025
   - **Registration Close Date**: September 14, 2025
   - Clicks **"Open Registration"**.
8. A success banner appears: *"Registration is now OPEN for First Semester 2025-2026."*

### 🔷 Phase 4: Doctor Sees Assigned Courses

9. **Dr. Ahmed Hassan** logs in → lands on the **Doctor Dashboard**:
   - Sees stat cards: **3 Courses This Semester**, **127 Total Students**, **Today's Schedule**.
   - Today's schedule shows: *CS301 — Lecture, 9:00 AM, Room A204*.
10. Doctor clicks **"My Courses"** → sees a card grid of his 3 assigned courses.
11. Doctor clicks on **"CS301 — Data Structures"** → navigates to the **Course Detail** page with tabs:
    - **Students** tab: (initially empty — registration hasn't closed yet)
    - **Materials** tab: Doctor clicks **"+ Add Material"** → uploads a syllabus PDF (Title: "Course Syllabus", Type: File, Week: 1).
    - **Grades** tab: (shows an empty grade table with column headers: Student, Midterm/30, Final/40, Practical/20, Quizzes/10).
    - **Attendance** tab: (no sessions taken yet).

### 🔷 Phase 5: Advisor Reviews Students

12. **Prof. Sarah Ali** (Academic Advisor) logs in → lands on the **Advisor Dashboard**:
    - Sees: **45 Total Students**, **3 Active Warnings**, **5 Students with Unpaid Fees**.
    - A priority list shows "Students Needing Attention" (low GPA, high absence, unpaid fees).
13. Advisor clicks **"My Students"** → paginated list with columns: Name, ID, Year Level, GPA, Attendance %, Fees Status, Risk Badge.
14. Advisor searches for "Mohamed Khaled" → clicks on his row → sees the **Student Detail View** with academic history, current schedule, attendance, fees, and warnings.

### 🔷 Phase 6: Student Registers for Courses

15. **Mohamed Khaled** (Student) logs in → lands on the **Student Dashboard**:
    - Welcome banner: *"Welcome back, Mohamed! — Semester: First 2025-2026"*
    - Stat cards: **0 Registered Courses**, **0/18 Credit Hours**, **GPA: 3.2**, **2 Unread Notifications**.
    - A notification reads: *"Registration is now open! Register before Sep 14."*
16. Student clicks **"Course Registration"** → sees the **Registration Screen**:
    - **Status Banner**: *"Registration is OPEN — Closes September 14, 2025"*
    - **Registered Hours**: 0 / 18 (min 12)
    - **Available Courses** table with columns: Course Code, Course Name, Credit Hours, Doctor, Schedule, Seats Remaining, Status.
    - Filter dropdowns: Department, Year Level, Elective Only toggle.
17. Student selects **CS301 — Data Structures** → checks prerequisites (✅ Met) → clicks **"Register"**.
    - A success toast appears: *"Successfully registered for CS301!"*
    - Registered hours update to: **3/18**.
18. Student registers for 5 more courses (total: 16 credit hours).
19. Student clicks **"My Registered Courses"** tab → sees all 6 courses with status "Enrolled" and the option to **"Drop"** each one.

### 🔷 Phase 7: Advisor Monitors and Intervenes

20. The Advisor's dashboard updates to reflect Mohamed's registration.
21. Advisor navigates to **Mohamed's profile** → sees his 6 registered courses.
22. Advisor notices a schedule conflict → navigates to **Schedule Adjustments** → uses **"Swap Section"** to move Mohamed from CS301 Section A to Section B → clicks **"Confirm Swap"** → student gets notified.

### 🔷 Phase 8: Admin Closes Registration

23. Admin navigates to **Registration Management** → clicks **"Close Registration"** for the current semester.
24. Students can no longer register or drop courses without advisor intervention.

### 🔷 Phase 9: Semester in Progress

25. **Doctor** takes attendance weekly → navigates to **Attendance** → selects course → selects date → marks each student Present/Absent → clicks **"Save Attendance"**.
26. Doctor uploads weekly materials (lecture slides, assignments) under the **Materials** tab.
27. After midterm exams, Doctor enters midterm grades:
    - Goes to **Grades** tab for CS301 → sees the grade table → clicks an inline cell to enter scores → clicks **"Save Grades"** when done.

### 🔷 Phase 10: Student Views Progress

28. Student views **My Courses** → clicks CS301 → sees:
    - **Grades** tab: Midterm: 25/30, Final: (pending), Practical: (pending).
    - **Attendance** tab: 12/14 sessions attended (85.7%).
    - **Materials** tab: Downloads lecture slides for Week 7.
29. Student views **My Grades** → selects "First Semester 2025-2026" → sees a table of all courses with available grades.
30. Student views **My Schedule** → sees a color-coded weekly timetable.

### 🔷 Phase 11: End of Semester — Final Grades

31. Doctor enters final exam grades and practical scores → system auto-calculates total score, letter grade (A+, A, B+...), and grade points.
32. Student views **My Grades** → sees complete grade breakdown for all courses.
33. Student views the **GPA History** chart → sees semester GPA and cumulative GPA trend line.
34. Student checks **Transcript** → printable/downloadable view of all semesters and final grades.

### 🔷 Phase 12: Advisor End-of-Semester Review

35. Advisor views all students with final GPAs → identifies students below 2.0 → issues **Level 1 Academic Warnings**.
36. Advisor reviews unpaid fees → sends fee reminders.
37. Advisor prepares for the next semester cycle.

---

## 5. System-Wide Navigation Structure

```
┌─────────────────────────────────────────────────────────┐
│                    LOGIN SCREEN                          │
│  (Email + Password + Role Selection → Redirects to Portal)│
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        ▼             ▼             ▼             ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  ADMIN   │  │  DOCTOR  │  │ STUDENT  │  │ ADVISOR  │
  │  PORTAL  │  │  PORTAL  │  │  PORTAL  │  │  PORTAL  │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Sidebar Navigation (per portal):

| Admin Portal | Doctor Portal | Student Portal | Advisor Portal |
|---|---|---|---|
| Dashboard | Dashboard | Dashboard | Dashboard |
| Academic Years | My Courses | Course Registration | My Students |
| Semesters | My Schedule | My Schedule | Warnings |
| Courses | Attendance | My Courses | Schedule Adjustments |
| Course Instances | Announcements | My Grades | Fees Management |
| Departments | Profile | My Attendance | Notifications |
| Users (CRUD) | | Exam Schedule | Profile |
| Registration | | Fees | |
| Rooms & Schedules | | Notifications | |
| Finance | | Profile | |
| Notifications | | | |

---

## 6. Visual Design Guidelines for the Designer

| Aspect | Guideline |
|--------|-----------|
| **Color Scheme** | Use a university-branded palette. Suggest: Deep Navy (#1A237E) + Gold (#FFD54F) + Clean White (#FAFAFA). Each portal can have a subtle accent color. |
| **Typography** | Clean sans-serif (Inter, Poppins, or Cairo for Arabic support). |
| **Card-Based Layout** | Use stat cards on dashboards, course cards for lists, and data tables for detailed views. |
| **Status Badges** | Use color-coded badges: 🟢 Green (Enrolled/Paid/Good), 🟡 Yellow (Warning/Pending), 🔴 Red (Danger/Failed/Unpaid). |
| **Modals vs. Pages** | Use modals for quick actions (Add/Edit forms). Use full pages for detailed views (Student Profile, Course Detail). |
| **Responsive Breakpoints** | Desktop (1200px+), Tablet (768px–1199px), Mobile (< 768px). |
| **Empty States** | Design empty states for every list/table (e.g., "No courses registered yet. Start by browsing available courses.") |
| **Loading States** | Skeleton loaders for cards and tables. Spinner for form submissions. |
| **Error States** | Inline error messages under form fields. Toast notifications for success/failure actions. |
| **RTL Support** | Layout must support Right-to-Left for Arabic language. |

---

*Next File →* [01_Auth_Flow.md](./01_Auth_Flow.md) — Authentication & Authorization Flow
