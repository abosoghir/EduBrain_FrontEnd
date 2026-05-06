# 📘 EduBrain — UI Requirements: Student Portal Flow

## File 4 of 5

---

## 1. Overview

The Student Portal is the most user-facing part of EduBrain. It provides students with a comprehensive view of their academic life — from course registration and schedule management to viewing grades, tracking attendance, managing fees, and receiving notifications. The design must be intuitive, mobile-friendly, and feel like a modern student companion app.

### Portal Route Prefix: `/student`
### Access: `Student` role only

---

## 2. Student Sidebar Navigation

| # | Menu Item | Icon | Route |
|---|----------|------|-------|
| 1 | Dashboard | 🏠 | `/student/dashboard` |
| 2 | Course Registration | 📝 | `/student/registration` |
| 3 | My Schedule | 🗓️ | `/student/schedule` |
| 4 | My Courses | 📚 | `/student/courses` |
| 5 | My Grades | 📊 | `/student/grades` |
| 6 | My Attendance | ✅ | `/student/attendance` |
| 7 | Exam Schedule | 📋 | `/student/exams` |
| 8 | Fees | 💰 | `/student/fees` |
| 9 | Notifications | 🔔 | `/student/notifications` |
| 10 | Profile | 👤 | `/student/profile` |

---

## 3. Screen Definitions

---

### 3.1 Student Dashboard

- **Screen Name:** Student Dashboard
- **Route:** `/student/dashboard`
- **Purpose:** A single-glance overview of the student's academic life — GPA, today's classes, notifications, and upcoming exams.

#### Content / Display:

**Welcome Banner:**
- *"Welcome back, [Student Name]!"*
- Academic Year + Semester label (e.g., "2025-2026 — First Semester")
- Year Level badge (e.g., "Sophomore")

**Stat Cards (Row of 6 on desktop, 2×3 grid on mobile):**

| Card | Icon | Value | Color |
|------|------|-------|-------|
| Registered Courses | 📚 | e.g., 6 | Blue |
| Credit Hours | ⏱️ | e.g., "16 / 18" (registered/max) | Teal |
| Cumulative GPA | 📊 | e.g., 3.24 | Green (if ≥2.0), Red (if <2.0) |
| Upcoming Exams | 📋 | e.g., 3 | Orange |
| Unread Notifications | 🔔 | e.g., 2 | Red (if >0) |
| Registered Hours | 📐 | e.g., 16 | Purple |

**Today's Schedule Section:**
- Title: *"Today's Schedule"*
- If no classes: *"No classes today! 🎉"*
- If classes exist: Timeline cards:

| Element | Display |
|---------|---------|
| Time | "9:00 AM — 10:30 AM" |
| Course | "CS301 — Data Structures" |
| Type | Lecture / Lab badge |
| Room | "Room A204" |
| Doctor | "Dr. Ahmed Hassan" |

**Recent Notifications Section:**
- Title: *"Recent Notifications"*
- Last 5 notifications with: Title, message preview (100 chars), type icon, date, read/unread indicator
- Link: *"View All Notifications →"*

**Upcoming Exams Section:**
- Title: *"Upcoming Exams"*
- Next 3 upcoming exams:

| Element | Display |
|---------|---------|
| Course | "CS301 — Data Structures" |
| Exam Type | Midterm / Final badge |
| Date | "Nov 10, 2025" |
| Time | "9:00 AM" |
| Hall | "Hall 3" |
| Countdown | "In 5 days" |

#### Actions:
- Stat cards are clickable → navigate to relevant pages
- Notification items → navigate to notification detail
- "View All Notifications" → navigates to `/student/notifications`
- Exam items → navigate to `/student/exams`

---

### 3.2 Course Registration

- **Screen Name:** Course Registration
- **Route:** `/student/registration`
- **Purpose:** Browse available courses, check prerequisites, and register for courses during the open registration period.

#### Content / Display:

**Registration Status Banner (top of page):**

| State | Display |
|-------|---------|
| Registration OPEN | 🟢 Green banner: *"Registration is OPEN — Closes on September 14, 2025"* |
| Registration CLOSED | 🔴 Red banner: *"Registration is currently CLOSED"* (all register buttons disabled) |

**Registration Summary Card:**
- Registered Hours: **16** / 18 (max)
- Minimum Required: 12
- Remaining Available: **2** credit hours
- Progress bar showing registered vs max

**Tab Bar:** **Available Courses** | **My Registered Courses**

---

#### 3.2.1 Available Courses Tab

**Filters Bar:**

| # | Filter | Type | Notes |
|---|--------|------|-------|
| 1 | Search | Text Input | Search by course code or name |
| 2 | Department | Dropdown | Filter by department |
| 3 | Year Level | Dropdown | Freshman / Sophomore / Junior / Senior |
| 4 | Elective Only | Toggle Switch | Show only elective courses |

**Available Courses Table:**

| Column | Type | Description |
|--------|------|-------------|
| Course Code | Text | e.g., "CS301" |
| Course Name | Text | e.g., "Data Structures" |
| Credit Hours | Number | e.g., 3 |
| Doctor | Text | e.g., "Dr. Ahmed Hassan" |
| Schedule | Text / Tags | e.g., "Mon 9AM, Wed 9AM" |
| Seats | Progress | e.g., "45/60" with visual bar |
| Availability | Badge | 🟢 Open / 🟡 Almost Full (≥80%) / 🔴 Full |
| Prerequisites | Icon + Tooltip | ✅ Met / ❌ Not Met (show missing courses in tooltip) |
| Action | Button | **"Register"** (enabled/disabled) |

**Row States:**
- ✅ Prerequisites met + seats available → **"Register"** button enabled (blue)
- ❌ Prerequisites NOT met → Button disabled, tooltip: *"Prerequisites not met: CS201, CS202"*
- ⚠️ Already registered → Button shows *"Registered"* (green badge, no click)
- 🔴 Course full → Button shows *"Full"* (disabled) or **"Join Waitlist"** (if available)
- ⛔ Would exceed max credit hours → Button disabled, tooltip: *"Would exceed maximum credit hours"*

#### Register Action Flow:
1. Student clicks **"Register"** → confirmation dialog:
   - *"Register for CS301 — Data Structures (3 credit hours)?"*
   - *"This will bring your total to 19/18 credit hours."* (if applicable, show warning)
   - Buttons: **"Confirm Registration"** / **"Cancel"**
2. On success → Toast: *"Successfully registered for CS301!"* → Table refreshes, button changes to "Registered"
3. On failure → Error toast with specific message (e.g., *"Registration is closed"*, *"Prerequisites not met"*)

---

#### 3.2.2 My Registered Courses Tab

**Content:**
- Summary: *"You are registered for 6 courses (16 credit hours)"*

**Registered Courses Table:**

| Column | Type | Description |
|--------|------|-------------|
| Course Code | Text | |
| Course Name | Text | |
| Credit Hours | Number | |
| Doctor | Text | |
| Schedule | Tags | |
| Status | Badge | Enrolled (green) / Waitlisted (yellow) |
| Registration Date | Date | |
| Action | Button | **"Drop"** (red outline) |

**Drop Action Flow:**
1. Student clicks **"Drop"** → confirmation dialog:
   - *"Are you sure you want to drop CS301 — Data Structures?"*
   - *"This will reduce your registered hours to 13."*
   - Warning if dropping below minimum: *"⚠️ Warning: This will put you below the minimum required credit hours (12)."*
   - Buttons: **"Confirm Drop"** (red) / **"Cancel"**
2. On success → Toast: *"Course CS301 dropped successfully."* → Refreshes list

---

### 3.3 My Schedule

- **Screen Name:** My Schedule
- **Route:** `/student/schedule`
- **Purpose:** View the weekly timetable of enrolled courses.

#### Content / Display:

**Page Header:**
- Title: *"My Schedule"*
- Semester label
- View Toggle: **Week View** (default) | **List View**

**Week View (Timetable Grid):**
- Y-axis: Time slots (8:00 AM → 6:00 PM)
- X-axis: Days (Saturday → Thursday)
- Color-coded course blocks:
  - Each course gets a unique color
  - Block shows: Course Code, Course Name (abbreviated), Room, Type icon

**List View (Flat sorted list):**

| Column | Type |
|--------|------|
| Day | Saturday, Sunday, etc. |
| Time | "9:00 AM – 10:30 AM" |
| Course | Code + Name |
| Doctor | Doctor name |
| Room | Room name |
| Type | Lecture / Lab / Tutorial badge |

**Empty State:** *"You haven't registered for any courses yet."* → Button: *"Go to Registration →"*

#### Actions:
- Clicking a course block → navigates to Course Detail page (`/student/courses/{id}`)

---

### 3.4 My Courses

- **Screen Name:** My Enrolled Courses
- **Route:** `/student/courses`
- **Purpose:** View all enrolled courses with quick stats (grades, attendance).

#### Content / Display:

**Page Header:**
- Title: *"My Courses"*
- Summary: *"6 Courses — 16 Credit Hours"*

**Course Cards (Grid layout):**

Each card shows:

| Element | Display |
|---------|---------|
| Course Code | "CS301" |
| Course Name | "Data Structures" |
| Doctor | "Dr. Ahmed Hassan" (with avatar) |
| Credit Hours | "3 hrs" |
| Attendance | Mini progress ring: 85% |
| Current Grade | e.g., "75/100 (B+)" or "In Progress" |
| Status | Enrolled (green badge) |

#### Actions:
- Clicking a card → navigates to **Course Detail** page

---

### 3.4.1 Course Detail (Student View)

- **Screen Name:** Course Detail
- **Route:** `/student/courses/{courseInstanceId}`
- **Purpose:** View detailed information about a specific enrolled course.

#### Content / Display:

**Course Header:**
- Course Code + Name
- Doctor name + avatar
- Credit Hours, Enrollment Date

**Tab Bar:** **Grades** | **Attendance** | **Materials**

---

##### Grades Tab:

**Grade Components Table:**

| Component | Score | Max | Percentage |
|-----------|-------|-----|------------|
| Midterm | 25 | 30 | 83.3% |
| Final | — | 40 | Pending |
| Practical | 18 | 20 | 90% |
| Quizzes | 8 | 10 | 80% |
| Oral | — | 0 | N/A |
| **Total** | **51** | **100** | **In Progress** |

**Final Result (if all grades entered):**
- Total: 82/100
- Letter Grade: B+
- Grade Points: 3.3
- Status: ✅ Passed

---

##### Attendance Tab:

**Summary Card:**
- Total Sessions: 14
- Present: 12 | Absent: 2
- Attendance Rate: 85.7%
- Status Badge: 🟢 Good / 🟡 Warning / 🔴 Danger

**Session History Table:**

| Column | Type |
|--------|------|
| Date | "Nov 5, 2025" |
| Week | "Week 7" |
| Status | ✅ Present / ❌ Absent badge |

---

##### Materials Tab:

**Materials grouped by week** (same structure as Doctor view, but read-only):

```
📁 Week 1
   📄 Course Syllabus          PDF     [Download ⬇️]
   🔗 Intro Video              Link    [Open 🔗]

📁 Week 2
   📄 Lecture 2 — Arrays       PDF     [Download ⬇️]
```

- Locked materials show a 🔒 lock icon with: *"Available from Nov 15, 2025"*

#### Actions:
- Download button for each file material
- Open link button for each link material

---

### 3.5 My Grades

- **Screen Name:** My Grades
- **Route:** `/student/grades`
- **Purpose:** View grades for all courses, per semester, with GPA summary and history.

#### Content / Display:

**Semester Selector:**
- Dropdown: Select semester (e.g., "First 2025-2026", "Second 2024-2025")
- Default: Current semester
- Each option shows if it's current: "First 2025-2026 ★"

**Semester Summary Card:**

| Element | Display |
|---------|---------|
| Semester GPA | e.g., 3.1 (large text) |
| Credit Hours | e.g., 16 |
| Academic Standing | "Good Standing" (green) / "Academic Probation" (red) |
| Dean's List | ✅ / — |

**Grades Table (per semester):**

| Column | Type |
|--------|------|
| Course Code | Text |
| Course Name | Text |
| Credit Hours | Number |
| Midterm | Score (e.g., 25/30) |
| Final | Score (e.g., 35/40) |
| Practical | Score (e.g., 18/20) |
| Quizzes | Score (e.g., 8/10) |
| Oral | Score (or N/A) |
| Total | Score (e.g., 86/100) |
| Letter Grade | Badge (A+, A, B+, etc.) |
| Grade Points | Number (e.g., 3.7) |
| Status | In Progress / Passed ✅ / Failed ❌ |

**Cumulative Stats Footer:**
- Cumulative GPA: **3.24**
- Total Credit Hours Earned: **64**

**GPA History Chart:**
- Line chart with two lines:
  - 🔵 Semester GPA (per semester)
  - 🟢 Cumulative GPA (running average)
- X-axis: Semesters
- Y-axis: GPA (0.0 – 4.0)

> **Designer Note:** The GPA chart is an important visual element. Use a clean line chart with smooth curves and hover tooltips showing exact values.

---

### 3.6 My Attendance

- **Screen Name:** Attendance Overview
- **Route:** `/student/attendance`
- **Purpose:** View overall attendance across all courses and drill down into per-course details.

#### Content / Display:

**Overall Stats Card:**
- Overall Attendance Rate: **87%** (circular progress ring)
- Total Present: 68 | Total Absent: 10 | Total Late: 0

**Per-Course Attendance Table:**

| Column | Type |
|--------|------|
| Course Code | Text |
| Course Name | Text |
| Sessions Attended | Number |
| Total Sessions | Number |
| Attendance % | Progress Bar |
| Status | Badge: 🟢 Normal (≥85%) / 🟡 Warning (75–84%) / 🔴 Danger (<75%) |

#### Actions:
- Click a course row → navigates to Course Detail → Attendance tab for the full session history.

---

### 3.7 Exam Schedule

- **Screen Name:** Exam Schedule
- **Route:** `/student/exams`
- **Purpose:** View upcoming midterm and final exams with dates, times, halls, and seat assignments.

#### Content / Display:

**Exam Stats Bar:**
- Total Exams: 12
- Days to First Exam: 5
- Next Exam: "CS301 — Midterm (Nov 10)"

**Next Exam Highlight Card (Hero):**
- Large card showing the next exam in detail:
  - Course Name, Exam Type (Midterm / Final), Date, Time, Hall Name, Seat Number
  - Countdown: "In 5 days, 3 hours"

**Full Exam List:**

| Column | Type |
|--------|------|
| Course Code | Text |
| Course Name | Text |
| Exam Type | Badge (Midterm / Final) |
| Date | "Nov 10, 2025" |
| Day | "Monday" |
| Time | "9:00 AM — 11:00 AM" |
| Hall | "Hall 3" |
| Seat No. | Number (if assigned) |
| Days Until | Countdown (e.g., "5 days") |

**View Toggle:** **List View** (default) | **Calendar View**

**Calendar View:**
- Monthly calendar with exam dates highlighted
- Clicking a date shows exams for that day

#### Actions:
- **"Export as PDF"** → Downloads printable exam schedule

---

### 3.8 Fees

- **Screen Name:** My Fees
- **Route:** `/student/fees`
- **Purpose:** View tuition fees, payment status, and payment history.

#### Content / Display:

**Semester Selector:** Dropdown (same pattern as grades)

**Fee Summary Card:**

| Element | Display |
|---------|---------|
| Total Due | "5,000 EGP" |
| Amount Paid | "3,000 EGP" |
| Remaining | "2,000 EGP" |
| Payment Status | Badge: Paid ✅ / Partially Paid 🟡 / Unpaid ❌ |
| Due Date | "Jan 15, 2026" |
| Overdue? | ⚠️ Warning if past due date |

**Fee Progress Bar:**
- Visual bar showing paid vs remaining (e.g., 60% paid)

**Fee Breakdown Table:**

| Fee Type | Amount | Status |
|----------|--------|--------|
| Tuition Fees | 4,000 EGP | Paid ✅ |
| Books Fees | 500 EGP | Paid ✅ |
| Lab Fees | 300 EGP | Unpaid ❌ |
| Other Fees | 200 EGP | Unpaid ❌ |
| **Total** | **5,000 EGP** | |
| Discount | -0 EGP | |
| **Net Total** | **5,000 EGP** | |

**Payment History Table:**

| Date | Amount | Method | Receipt # |
|------|--------|--------|-----------|
| Sep 15, 2025 | 3,000 EGP | Bank Transfer | REC-2025-001 |

#### Actions:
- **"Download Fee Statement"** → Downloads PDF statement
- **"Pay Now"** (Future) → Opens payment gateway

---

### 3.9 Notifications

- **Screen Name:** Notifications Center
- **Route:** `/student/notifications`
- **Purpose:** View all received notifications with filtering and read/unread management.

#### Content / Display:

**Page Header:**
- Title: *"Notifications"*
- Unread count badge
- Button: **"Mark All as Read"**

**Filters:**
- Type: All / General / Exam / Assignment / Important / Warning
- Status: All / Unread / Read

**Notifications List (paginated):**

Each notification card:

| Element | Display |
|---------|---------|
| Icon | Type-based icon (📢 General, 📋 Exam, 📝 Assignment, ⚠️ Warning) |
| Title | Bold text |
| Message Preview | First 100 characters |
| Sender | "Dr. Ahmed Hassan" or "System" |
| Date/Time | "2 hours ago" or "Nov 5, 2025" |
| Read Status | 🔵 Blue dot for unread |

#### Actions:
- Click notification → expands to show full message (or navigates to detail page)
- Auto-marks as read when opened
- **"Mark All as Read"** → Marks all notifications as read

---

### 3.10 Student Profile

- **Screen Name:** My Profile
- **Route:** `/student/profile`
- **Purpose:** View and edit personal information.

#### Content / Display:

**Profile Header Card:**
- Avatar (with Change Photo option)
- Student Name, Student Code, Email
- Department, Year Level, Current Semester
- GPA badge

**Profile Sections (Accordion or Tabs):**

**Section 1: Academic Information (Read-Only)**

| Field | Value |
|-------|-------|
| Student Code | "STU-2025-001" |
| Department | "Computer Science" |
| Year Level | "Sophomore" |
| Current Semester | "First" |
| Cumulative GPA | 3.24 |
| Total Credit Hours | 64 |
| Academic Advisor | "Prof. Sarah Ali" |

**Section 2: Personal Information (Partially Editable)**

| Field | Value | Editable |
|-------|-------|----------|
| Full Name | "Mohamed Khaled" | ❌ No |
| Email | "m.khaled@uni.edu" | ❌ No |
| Phone | "+20 1234567890" | ✅ Yes |
| National ID | "30001234567890" | ❌ No |
| Gender | "Male" | ❌ No |
| Date of Birth | "Jan 15, 2003" | ❌ No |
| Nationality | "Egyptian" | ❌ No |
| Religion | "Islam" | ❌ No |
| Address | "123 Elm Street" | ✅ Yes |
| City | "Cairo" | ✅ Yes |

**Section 3: Family Information (Partially Editable)**

| Field | Value | Editable |
|-------|-------|----------|
| Father's Phone | "+20 1098765432" | ✅ Yes |
| Father's Job | "Engineer" | ✅ Yes |

**Section 4: Security**

| Field | Display |
|-------|---------|
| Last Password Change | "April 15, 2025" |
| Button | **"Change Password"** |

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Save Changes"** | Saves editable fields → Toast: *"Profile updated successfully!"* |
| 2 | **"Change Password"** | Opens Change Password modal (see Auth Flow) |

---

## 4. Student Portal Wireframe Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo] EduBrain — Student Portal          🔔(2) 👤 Mohamed ▾│
├─────────────┬────────────────────────────────────────────────┤
│             │                                                │
│  🏠 Dashboard│  Welcome back, Mohamed!                        │
│  📝 Register │  2025-2026 — First Semester                    │
│  🗓️ Schedule │                                                │
│  📚 Courses  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  📊 Grades   │  │ 6   │ │16/18│ │ 3.24│ │ 3   │ │ 2   │      │
│  ✅ Attend.  │  │Cours│ │Hrs  │ │ GPA │ │Exams│ │Notif│      │
│  📋 Exams    │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘      │
│  💰 Fees     │                                                │
│  🔔 Notifs   │  Today's Schedule                              │
│  👤 Profile  │  ┌──────────────────────────────┐              │
│             │  │ 9:00 AM  CS301  Room A204    │              │
│             │  │ 11:00 AM MATH201 Room B102   │              │
│             │  └──────────────────────────────┘              │
│             │                                                │
└─────────────┴────────────────────────────────────────────────┘
```

---

*← Previous:* [03_Doctor_Portal.md](./03_Doctor_Portal.md)  
*→ Next:* [05_Advisor_Portal.md](./05_Advisor_Portal.md)
