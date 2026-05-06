# 📘 EduBrain — UI Requirements: Doctor Portal Flow

## File 3 of 5

---

## 1. Overview

The Doctor Portal enables professors/lecturers to manage their assigned courses — view enrolled students, upload learning materials, record student attendance, enter grades, and send announcements. The portal is designed around the **"My Courses"** concept: every action is scoped to courses assigned to the logged-in doctor.

### Portal Route Prefix: `/doctor`
### Access: `Doctor` role only

---

## 2. Doctor Sidebar Navigation

| # | Menu Item | Icon | Route |
|---|----------|------|-------|
| 1 | Dashboard | 📊 | `/doctor/dashboard` |
| 2 | My Courses | 📚 | `/doctor/courses` |
| 3 | My Schedule | 🗓️ | `/doctor/schedule` |
| 4 | Attendance | ✅ | `/doctor/attendance` |
| 5 | Announcements | 📢 | `/doctor/announcements` |
| 6 | Profile | 👤 | `/doctor/profile` |

---

## 3. Screen Definitions

---

### 3.1 Doctor Dashboard

- **Screen Name:** Doctor Dashboard
- **Route:** `/doctor/dashboard`
- **Purpose:** Quick overview of the doctor's current academic load and today's activities.

#### Content / Display:

**Welcome Banner:**
- *"Good morning, Dr. [Name]"*
- Current Semester label

**Stat Cards (Row of 4):**

| Card | Icon | Value | Description |
|------|------|-------|-------------|
| Courses This Semester | 📚 | e.g., 3 | Number of assigned course instances |
| Total Students | 🎓 | e.g., 127 | Sum of enrolled students across all courses |
| Pending Quizzes | 📝 | 0 | Placeholder (future feature) |
| Announcements Today | 📢 | e.g., 2 | Notifications sent today |

**Today's Schedule Section:**
- Title: *"Today's Schedule"*
- If no classes today: Empty state — *"No classes scheduled for today. Enjoy your day! 🎉"*
- If classes exist: Timeline/card list:

| Element | Display |
|---------|---------|
| Time | "9:00 AM — 10:30 AM" |
| Course | "CS301 — Data Structures" |
| Type Badge | Lecture (blue) / Lab (green) |
| Room | "Room A204" |

**Recent Announcements Section:**
- Title: *"Recent Announcements"*
- List of last 5 sent announcements: Title, Type badge, Date, Recipients count
- Link: *"View All Announcements →"*

#### Actions:
- Clicking a course name → navigates to Course Detail page
- Clicking a schedule item → navigates to Attendance for that course/date
- "View All Announcements" → navigates to Announcements page

---

### 3.2 My Courses (Card Grid)

- **Screen Name:** My Courses
- **Route:** `/doctor/courses`
- **Purpose:** View all courses assigned to the doctor in the current semester as a card grid.

#### Content / Display:

**Page Header:**
- Title: *"My Courses"*
- Semester filter dropdown (default: Current Semester)

**Course Cards Grid** (responsive: 3 columns desktop, 2 tablet, 1 mobile):

Each card displays:

| Element | Display |
|---------|---------|
| Course Code | "CS301" (large, bold) |
| Course Name | "Data Structures" |
| Credit Hours | "3 Credit Hours" |
| Semester | "First 2025-2026" |
| Enrollment Bar | Progress bar: 45/60 (75%) with color: green <80%, yellow 80–99%, red 100% |
| Quick Stats | Enrolled: 45 | Capacity: 60 |

#### Actions:
- Clicking a course card → navigates to the **Course Detail** page

---

### 3.3 Course Detail (Tabbed View)

- **Screen Name:** Course Detail
- **Route:** `/doctor/courses/{courseInstanceId}`
- **Purpose:** Central hub for managing a specific course — students, materials, grades, and attendance.

#### Content / Display:

**Course Header:**
- Course Code + Name (e.g., "CS301 — Data Structures")
- Credit Hours badge, Semester label, Section info
- Enrollment: "45 / 60 students enrolled"

**Tab Bar (4 tabs):**

| Tab | Icon | Purpose |
|-----|------|---------|
| Students | 👥 | View enrolled students |
| Materials | 📄 | Upload/manage course materials |
| Grades | 📊 | Enter and view student grades |
| Attendance | ✅ | View attendance summary |

---

### 3.3.1 Students Tab

- **Tab Name:** Students
- **Purpose:** View the list of enrolled students for this course.

#### Content / Display:

**Student Count:** "45 Students Enrolled"

**Students Table:**

| Column | Type | Description |
|--------|------|-------------|
| # | Number | Row number |
| Avatar | Image | Student photo or initials |
| Student Code | Text | e.g., "STU-2025-001" |
| Student Name | Text | Full name |
| Section | Badge | e.g., "A" |
| Attendance % | Progress Badge | e.g., "85%" — color coded: green ≥85%, yellow 75–84%, red <75% |
| Status | Badge | Enrolled (green) / Waitlisted (yellow) |

**Search bar:** Search by name or code

#### Actions:
- Clicking a student row → could expand to show quick details (optional)
- Export button: **"Export to Excel"** (downloads student list)

---

### 3.3.2 Materials Tab

- **Tab Name:** Materials
- **Purpose:** Upload and manage course materials organized by week.

#### Content / Display:

**Button:** **"+ Add Material"** (top-right)

**Materials List (grouped by week):**

```
📁 Week 1
   📄 Course Syllabus          PDF     Sep 15, 2025     [Delete 🗑️]
   🔗 Intro Video              Link    Sep 15, 2025     [Delete 🗑️]

📁 Week 2
   📄 Lecture 2 - Arrays       PDF     Sep 22, 2025     [Delete 🗑️]

📁 Week 3
   (No materials yet)
```

Each material row shows:
- Icon: 📄 for File, 🔗 for Link
- Title
- Type badge (File / Link)
- Upload date
- Delete button

**Empty State:** *"No materials uploaded yet. Click '+ Add Material' to upload your first resource."*

#### Actions:

| # | Action | Behavior |
|---|--------|----------|
| 1 | **"+ Add Material"** | Opens the **Add Material Modal** |
| 2 | **"Delete"** (per item) | Confirmation dialog: *"Delete 'Course Syllabus'?"* → Deletes material |

---

### 3.3.2.1 Add Material Modal

- **Screen Name:** Add Material (Modal)
- **Purpose:** Upload a new course material (file or link).

#### Inputs:

| # | Field Name | Type | Required | Validation | Notes |
|---|-----------|------|----------|------------|-------|
| 1 | Title | Text Input | ✅ Yes | Max 200 chars | "e.g., Lecture 3 — Linked Lists" |
| 2 | Type | Radio Buttons | ✅ Yes | — | Options: **File** / **Link** |
| 3 | File Upload | File Picker | ✅ If Type = File | Accepted: PDF, DOCX, PPTX, ZIP (max 50MB) | Drag-and-drop zone |
| 4 | URL | Text Input | ✅ If Type = Link | Must be a valid URL | "https://..." |
| 5 | Week Number | Number Input or Dropdown | ✅ Yes | 1–16 | "Select week" |

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Upload"** (Primary) | Validates → Uploads file/link → Closes modal → Refreshes list → Success toast: *"Material uploaded successfully!"* |
| 2 | **"Cancel"** (Secondary) | Closes modal |

> **Designer Note:** The File Upload should support drag-and-drop with a visual upload area. Show a progress bar during file upload.

---

### 3.3.3 Grades Tab

- **Screen Name:** Course Grades
- **Purpose:** View and enter grades for all enrolled students in this course.

#### Content / Display:

**Grade Weights Header:**
- Display the course's grade component weights as a summary bar:
  - *"Midterm: 30 | Final: 40 | Practical: 20 | Quizzes: 10 | Oral: 0 | Total: 100"*

**Grades Table (Editable Spreadsheet-like):**

| Column | Type | Width | Description |
|--------|------|-------|-------------|
| # | Number | Narrow | Row number |
| Student Code | Text | Medium | Read-only |
| Student Name | Text | Wide | Read-only |
| Midterm | Number Input | Narrow | Editable, max = Midterm Weight (e.g., /30) |
| Final | Number Input | Narrow | Editable, max = Final Weight (e.g., /40) |
| Practical | Number Input | Narrow | Editable, max = Practical Weight (e.g., /20) |
| Quizzes | Number Input | Narrow | Editable, max = Quizzes Weight (e.g., /10) |
| Oral | Number Input | Narrow | Editable, max = Oral Weight (e.g., /0) — hidden if weight is 0 |
| Total | Calculated | Narrow | Auto-calculated: Sum of all entered grades (read-only) |
| Letter Grade | Badge | Narrow | Auto-determined from total (A+, A, B+, etc.) — read-only |

**Column Headers with max scores:**
- Each editable column header shows the maximum possible score, e.g., "Midterm (/30)"

#### Actions:

| # | Action | Behavior |
|---|--------|----------|
| 1 | **"Save Grades"** (Primary Button, sticky bottom) | Validates all entered grades → Saves all changes in bulk → Success toast: *"Grades saved successfully!"* |
| 2 | **"Export Grades"** (Secondary Button) | Downloads grades as Excel/CSV |
| 3 | **Inline cell editing** | Each grade cell is an editable input. Tab key moves to next cell. |

#### Validation Rules (per cell):
- Value must be ≥ 0
- Value must be ≤ the column's maximum weight
- Cells can be left empty (grade not yet entered)
- Red border on cells with invalid values

> **Designer Note:** This screen is critical. It should feel like a spreadsheet — fast, clean, and efficient. Consider:
> - Fixed header row (scrolls with table)
> - Fixed first 2 columns (Student Code, Name) so they're always visible when scrolling horizontally
> - Keyboard navigation (Tab between cells)
> - Visual indication for modified/unsaved cells (e.g., yellow background)
> - A "Changes Unsaved" indicator at the top if there are pending changes

---

### 3.4 My Schedule

- **Screen Name:** Doctor Schedule
- **Route:** `/doctor/schedule`
- **Purpose:** View the doctor's weekly teaching schedule.

#### Content / Display:

**Schedule Stats Bar:**
- Total Sessions: e.g., 12
- Lectures: 6 | Labs: 4 | Tutorials: 2
- Total Hours/Week: 18

**View Toggle:** **Week View** (default) | **List View**

**Week View (Timetable Grid):**
- Y-axis: Time slots (8:00 AM → 6:00 PM, 1-hour increments)
- X-axis: Days (Saturday → Thursday)
- Each slot is a colored card:
  - Course code + name
  - Time range
  - Room
  - Type icon (Lecture / Lab)
  - Color: Each course gets a unique color

**List View (Flat list):**

| Column | Type |
|--------|------|
| Day | Text |
| Time | "9:00 AM – 10:30 AM" |
| Course | Code + Name |
| Type | Badge |
| Room | Text |

**Empty State:** *"No schedule found for the current semester."*

#### Actions:
- Clicking a schedule slot → navigates to the Course Detail page for that course

---

### 3.5 Attendance Module

- **Screen Name:** Take Attendance
- **Route:** `/doctor/attendance`
- **Purpose:** Record student attendance for a specific course and date.

#### Content / Display:

**Page Header:**
- Title: *"Take Attendance"*

**Filters (top bar):**

| # | Filter | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | Course | Dropdown | ✅ Yes | Only shows doctor's courses |
| 2 | Date | Date Picker | ✅ Yes | Default: Today. Cannot be in the future. |

**After selecting Course + Date:**

**Session Info Card:**
- Course Name, Date (formatted), Week Number (auto-calculated)
- Status badge: ✅ "Attendance Taken" (if already recorded) / ⏳ "Not Taken Yet"

**Attendance Table:**

| Column | Type | Description |
|--------|------|-------------|
| # | Number | Row number |
| Avatar | Image | Student photo |
| Student Code | Text | |
| Student Name | Text | |
| Status | Toggle / Radio | **Present** (green) / **Absent** (red) |

**Bulk Actions Bar (above table):**
- Button: **"Mark All Present"** — Sets all students to Present
- Button: **"Mark All Absent"** — Sets all students to Absent

#### Actions:

| # | Action | Behavior |
|---|--------|----------|
| 1 | **Toggle per student** | Toggles between Present ✅ and Absent ❌ |
| 2 | **"Mark All Present"** | Sets all toggles to Present |
| 3 | **"Mark All Absent"** | Sets all toggles to Absent |
| 4 | **"Save Attendance"** (Primary, sticky bottom) | Validates → Saves all records → Success toast: *"Attendance saved for [Course] on [Date]!"* |

#### Visual Notes:
- Each student row has a clear visual toggle (green chip = Present, red chip = Absent)
- If attendance was already taken for this date, the table loads with saved values and allows editing
- Show a warning if the date is not today: *"You are recording attendance for a past date."*

---

### 3.5.1 Attendance Summary (per course)

- **Screen Name:** Course Attendance Summary
- **Route:** Accessible from Course Detail → Attendance Tab
- **Purpose:** Overview of all students' attendance for the semester.

#### Content / Display:

**Summary Card:**
- Course Name, Total Sessions Taken (e.g., 14)

**Students Attendance Table:**

| Column | Type | Description |
|--------|------|-------------|
| Student Code | Text | |
| Student Name | Text | |
| Sessions Attended | Number | e.g., 12 |
| Sessions Absent | Number | e.g., 2 |
| Total Sessions | Number | e.g., 14 |
| Attendance % | Progress Bar | e.g., 85.7% |
| Status | Badge | 🟢 Good (≥85%) / 🟡 Warning (75–84%) / 🔴 Danger (<75%) |

#### Actions:
- **"Export Attendance Report"** → Downloads as Excel

---

### 3.6 Announcements

- **Screen Name:** My Announcements
- **Route:** `/doctor/announcements`
- **Purpose:** View sent announcements and create new ones.

#### Content / Display:

**Page Header:**
- Title: *"Announcements"*
- Button: **"+ New Announcement"**
- Stat: "Sent Today: 2"

**Announcements List (paginated):**

| Column | Type |
|--------|------|
| Title | Text |
| Type | Badge (General / Exam / Assignment / Important / AcademicWarning) |
| Target | Text (e.g., "CS301 — Data Structures" or "All Students") |
| Recipients | Number (e.g., 45) |
| Sent Date | DateTime |

#### Actions:
| # | Action | Behavior |
|---|--------|----------|
| 1 | **"+ New Announcement"** | Opens the **Create Announcement Modal** |

---

### 3.6.1 Create Announcement Modal

- **Screen Name:** Create Announcement (Modal or Full Page)
- **Purpose:** Compose and send a notification to students.

#### Inputs:

| # | Field Name | Type | Required | Validation | Notes |
|---|-----------|------|----------|------------|-------|
| 1 | Title | Text Input | ✅ Yes | Max 200 chars | "Announcement title" |
| 2 | Message | Textarea (Rich Text) | ✅ Yes | Max 2000 chars | "Write your message..." |
| 3 | Type | Dropdown | ✅ Yes | — | General / Exam / Assignment / Important |
| 4 | Target Audience | Radio Buttons | ✅ Yes | — | Options below |
| 5 | Course (if "Specific Course") | Dropdown | Conditional | Only doctor's courses | "Select course" |
| 6 | Students (if "Specific Students") | Multi-Select with Search | Conditional | — | Search and select students |

**Target Audience Options:**
- ○ All My Students (everyone enrolled in any of my courses)
- ○ Specific Course (select one course → all students in that course)
- ○ Specific Students (manually pick students)

**Delivery Channels (optional toggles):**
- ✅ In-App Notification (always on)
- ☐ Email
- ☐ SMS

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Send Announcement"** (Primary) | Validates → Sends to selected recipients → Success: *"Announcement sent to [X] students!"* |
| 2 | **"Cancel"** (Secondary) | Discards |

> **Designer Note:** Show a preview count: *"This announcement will be sent to 45 students."*

---

### 3.7 Doctor Profile

- **Screen Name:** My Profile
- **Route:** `/doctor/profile`
- **Purpose:** View and edit the doctor's profile information.

#### Content / Display:

**Profile Card (Read-Only Section):**

| Field | Display |
|-------|---------|
| Profile Picture | Avatar (with "Change Photo" overlay button) |
| Full Name | e.g., "Dr. Ahmed Hassan" |
| Title | e.g., "Associate Professor" |
| Email | e.g., "ahmed.hassan@university.edu" |
| Phone | e.g., "+20 1234567890" |
| Department | e.g., "Computer Science" |
| Office Room | e.g., "Room B305" |

**Academic Summary Cards:**
- Total Courses: 3
- Total Students: 127
- Last Password Change: "April 15, 2025"

**Editable Fields:**
- Phone Number → Text Input (editable)
- Profile Picture → File Upload
- Office Room → Dropdown (editable)

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Save Changes"** | Saves editable fields |
| 2 | **"Change Password"** | Opens Change Password modal (see Auth Flow) |

---

*← Previous:* [02_Admin_Portal.md](./02_Admin_Portal.md)  
*→ Next:* [04_Student_Portal.md](./04_Student_Portal.md)
