# 📘 EduBrain — UI Requirements: Academic Advisor Portal Flow

## File 5 of 5

---

## 1. Overview

The Academic Advisor Portal empowers advisors to oversee and guide their assigned students throughout the academic journey. Advisors monitor academic performance, review registration requests, issue warnings, manage schedule adjustments, and handle fee-related tasks. This portal is designed to feel like a **student management cockpit** — everything the advisor needs to support their advisees is accessible from one place.

### Portal Route Prefix: `/advisor`
### Access: `AcademicAdvisor` role only

---

## 2. Advisor Sidebar Navigation

| # | Menu Item | Icon | Route |
|---|----------|------|-------|
| 1 | Dashboard | 📊 | `/advisor/dashboard` |
| 2 | My Students | 🎓 | `/advisor/students` |
| 3 | Warnings | ⚠️ | `/advisor/warnings` |
| 4 | Schedule Adjustments | 🔄 | `/advisor/schedule-adjustments` |
| 5 | Fees Management | 💰 | `/advisor/fees` |
| 6 | Notifications | 🔔 | `/advisor/notifications` |
| 7 | Profile | 👤 | `/advisor/profile` |

---

## 3. Screen Definitions

---

### 3.1 Advisor Dashboard

- **Screen Name:** Advisor Dashboard
- **Route:** `/advisor/dashboard`
- **Purpose:** Overview of the advisor's workload — student stats, students needing immediate attention, and pending actions.

#### Content / Display:

**Welcome Banner:**
- *"Welcome, Prof. [Name]"*
- Current Semester label

**Stat Cards (Row of 4):**

| Card | Icon | Value | Color Logic |
|------|------|-------|-------------|
| Total Students | 🎓 | e.g., 45 | Blue |
| Active Warnings | ⚠️ | e.g., 3 | Yellow (if >0), green (if 0) |
| Unpaid Fees | 💰 | e.g., 5 | Red (if >0), green (if 0) |
| Pending Adjustments | 🔄 | e.g., 0 | Gray |

**Students Needing Attention Section:**
- Title: *"Students Needing Attention"*
- Priority list of students with issues, ordered by severity:

Each item shows:

| Element | Display |
|---------|---------|
| Avatar | Student photo or initials |
| Name | Student full name |
| Student Code | e.g., "STU-2025-042" |
| GPA | e.g., "1.8" (red text if < 2.0) |
| Issue Type | Badge: 🔴 Low GPA / 🟡 High Absence / 🟠 Unpaid Fees |
| Issue Description | e.g., "GPA below 2.0 — academic probation risk" |

**Empty State (no issues):** *"All your students are on track! 🎉 No immediate issues to address."*

#### Actions:
- Click stat card → navigates to relevant page
- Click student row → navigates to Student Detail page

---

### 3.2 My Students (List View)

- **Screen Name:** My Students
- **Route:** `/advisor/students`
- **Purpose:** Browse, search, and manage all students assigned to the advisor.

#### Content / Display:

**Page Header:**
- Title: *"My Students"*
- Quick Stats Bar:
  - Total: 45 | Dean's List: 8 | At Risk: 3 | Average GPA: 2.87

**Filters & Search Bar:**

| # | Filter | Type | Notes |
|---|--------|------|-------|
| 1 | Search | Text Input | Search by name or student code |
| 2 | Year Level | Dropdown | All / Freshman / Sophomore / Junior / Senior |
| 3 | Academic Status | Dropdown | All / Good Standing / Dean's List / Warning / Probation |

**Students Table (paginated):**

| Column | Type | Description |
|--------|------|-------------|
| # | Number | Row number |
| Avatar | Image | Student photo |
| Student Code | Text | e.g., "STU-2025-001" |
| Student Name | Text | Full name |
| Year Level | Badge | Freshman (gray) / Sophomore (blue) / Junior (purple) / Senior (gold) |
| GPA | Number + Color | e.g., 3.45 (green), 1.8 (red) |
| Attendance % | Progress Badge | e.g., 92% (green), 68% (red) |
| Fees Status | Badge | ✅ Paid / 🟡 Partial / ❌ Unpaid |
| Academic Status | Badge | 🟢 Good / 🌟 Dean's List / ⚠️ Warning / 🔴 Probation |
| Warnings | Number | Count of active warnings |
| Actions | Button | **"View Profile"** |

**Academic Status Derivation (for designer reference):**
- **Dean's List** (🌟): GPA ≥ 3.5
- **Good Standing** (🟢): GPA ≥ 2.0 and < 3.5
- **Academic Warning** (⚠️): GPA < 2.0
- **Probation** (🔴): Flagged by system (IsOnAcademicProbation = true)

**Pagination:** Page numbers + page size selector (10 / 20 / 50)

#### Actions:
- Click student row or "View Profile" → navigates to Student Detail page
- Export: **"Export Student List"** → Downloads Excel

---

### 3.3 Student Detail View (Advisor Perspective)

- **Screen Name:** Student Detail
- **Route:** `/advisor/students/{studentId}`
- **Purpose:** Comprehensive view of a student's academic profile with action buttons for the advisor.

#### Content / Display:

**Student Profile Header:**
- Avatar, Name, Student Code, Email, Phone
- Year Level badge, Department, Academic Status badge
- GPA (large number, color coded)
- Button Row: **"Send Warning"**, **"Adjust Schedule"**, **"Assign Fees"**

**Tab Bar:** **Academic** | **Attendance** | **Fees** | **Schedule** | **Warnings**

---

#### 3.3.1 Academic Tab

**GPA Summary Card:**

| Element | Display |
|---------|---------|
| Cumulative GPA | 3.24 (large) |
| Current Semester GPA | 2.8 |
| Total Credit Hours | 64 |
| On Academic Probation? | ❌ No / ⚠️ Yes |

**Current Semester Courses Table:**

| Column | Type |
|--------|------|
| Course Code | Text |
| Course Name | Text |
| Doctor | Text |
| Credit Hours | Number |
| Current Grade | Score or "In Progress" |
| Status | Enrolled / Waitlisted / Dropped |

---

#### 3.3.2 Attendance Tab

**Overall Attendance:**
- Circular progress ring showing overall percentage (e.g., 87%)

**Per-Course Attendance Table:**

| Column | Type |
|--------|------|
| Course | Code + Name |
| Attended | Number |
| Absent | Number |
| Attendance % | Progress bar |
| Status | 🟢 Good / 🟡 Warning / 🔴 Danger |

---

#### 3.3.3 Fees Tab

**Current Semester Fee Card:**

| Element | Display |
|---------|---------|
| Tuition | 4,000 EGP |
| Books | 500 EGP |
| Discount | -0 EGP |
| Total | 4,500 EGP |
| Paid | 3,000 EGP |
| Remaining | 1,500 EGP |
| Status | 🟡 Partially Paid |
| Payment Method | Bank Transfer / Cash / — |

**Fee History Table (per semester):**

| Semester | Total | Paid | Status |
|----------|-------|------|--------|
| First 2025-2026 | 4,500 EGP | 3,000 EGP | Partial |
| Second 2024-2025 | 4,500 EGP | 4,500 EGP | Paid ✅ |

#### Actions:
- **"Assign Fees"** → Opens Assign Fees Modal (see section 3.6.1)
- **"Record Payment"** → Opens payment recording modal

---

#### 3.3.4 Schedule Tab

**Weekly Timetable:**
- Same format as Student's My Schedule view
- Read-only for the advisor (view only)
- Shows: Course Code, Time, Room, Doctor, Type

**Current Registration Summary:**
- Registered Hours: 16 / 18
- Min Required: 12

#### Actions:
- **"Adjust Schedule"** → Navigates to Schedule Adjustments page filtered for this student

---

#### 3.3.5 Warnings Tab

**Warnings History Table:**

| Column | Type |
|--------|------|
| Date Issued | DateTime |
| Warning Level | Badge: Level 1 (yellow), Level 2 (orange), Level 3 (red) |
| Reason | Text (e.g., "Exceeded Absence Limit") |
| Course | Course code (if applicable) |
| Status | Active (red) / Resolved (green) |
| Actions | **"Resolve"** button |

**Empty State:** *"No warnings have been issued to this student."*

#### Actions:
- **"Send Warning"** → Opens Send Warning Modal
- **"Resolve"** (per warning) → Opens Resolve Warning dialog

---

### 3.4 Warnings Management

- **Screen Name:** Warnings
- **Route:** `/advisor/warnings`
- **Purpose:** View and manage all academic warnings issued by the advisor.

#### Content / Display:

**Page Header:**
- Title: *"Academic Warnings"*
- Button: **"+ Issue Warning"**
- Stats: Active: 3 | Resolved: 12

**Filters:**
- Status: All / Active / Resolved
- Search: Student name or code

**Warnings Table:**

| Column | Type |
|--------|------|
| Student | Name + Code |
| Course | Course code (optional) |
| Warning Level | Badge: 1 / 2 / 3 |
| Reason | Text |
| Date Issued | DateTime |
| Status | Active / Resolved |
| Actions | **"Resolve"** / **"View Student"** |

---

### 3.4.1 Send Warning Modal

- **Screen Name:** Issue Warning (Modal)
- **Purpose:** Create and send an academic warning to a student.

#### Inputs:

| # | Field Name | Type | Required | Validation | Notes |
|---|-----------|------|----------|------------|-------|
| 1 | Student | Searchable Dropdown | ✅ Yes | Must be advisor's student | Search by name or code |
| 2 | Warning Level | Segmented Control | ✅ Yes | 1, 2, or 3 | Level 1 (First Warning) / Level 2 (Serious) / Level 3 (Final) |
| 3 | Reason | Dropdown | ✅ Yes | — | Options: Exceeded Absence Limit / Low Academic Performance / Unpaid Fees / Other |
| 4 | Custom Reason | Text Input | ✅ If Reason = "Other" | Max 200 chars | "Specify reason..." |
| 5 | Related Course | Dropdown | ❌ Optional | — | Select from student's courses |
| 6 | Message | Textarea | ✅ Yes | Max 2000 chars | Detailed warning message |

**Warning Level Visual Guide (shown to advisor):**

| Level | Severity | Color | Typical Use |
|-------|----------|-------|-------------|
| 1 | First Warning | 🟡 Yellow | Initial notice of concern |
| 2 | Serious | 🟠 Orange | Repeated issue, escalation |
| 3 | Final Warning | 🔴 Red | Last chance before academic consequences |

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Send Warning"** (Primary) | Validates → Sends → Creates notification for student → Success toast: *"Warning sent to Mohamed Khaled."* |
| 2 | **"Cancel"** | Closes modal |

---

### 3.4.2 Resolve Warning Dialog

- **Screen Name:** Resolve Warning (Dialog)
- **Purpose:** Mark a warning as resolved with optional notes.

#### Inputs:

| # | Field Name | Type | Required | Notes |
|---|-----------|------|----------|-------|
| 1 | Resolution Notes | Textarea | ❌ Optional | "e.g., Student improved attendance to 85%" |

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Resolve"** | Marks warning as resolved → Updates status badge → Toast: *"Warning resolved."* |
| 2 | **"Cancel"** | Closes dialog |

---

### 3.5 Schedule Adjustments

- **Screen Name:** Schedule Adjustments
- **Route:** `/advisor/schedule-adjustments`
- **Purpose:** Drop courses, swap sections, or manually add courses for students.

#### Content / Display:

**Page Header:**
- Title: *"Schedule Adjustments"*

**Step 1: Select Student**
- Searchable dropdown: Select a student from advisees
- After selection → shows student summary card (Name, GPA, Credit Hours: 16/18)

**Step 2: Current Courses Table (after student selected):**

| Column | Type | Description |
|--------|------|-------------|
| Course Code | Text | |
| Course Name | Text | |
| Credit Hours | Number | |
| Doctor | Text | |
| Section | Text | |
| Schedule | Tags | e.g., "Mon 9AM, Wed 9AM" |
| Can Drop? | ✅/❌ | Based on deadline rules |
| Actions | Buttons | **"Drop"**, **"Swap Section"** |

**Available Courses Section (for manual add):**
- Button: **"+ Add Course"** → Opens course selection

---

#### 3.5.1 Drop Course (Advisor Override)

Advisor clicks **"Drop"** on a student's course:

**Confirmation Dialog:**
- *"Drop CS301 — Data Structures for Mohamed Khaled?"*
- *"This will reduce their credit hours from 16 to 13."*

#### Inputs:

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | Reason | Textarea | ❌ Optional |
| 2 | Notify Student | Toggle | Default: ✅ On |

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Confirm Drop"** | Drops course → Notifies student (if toggle on) → Refreshes table → Toast: *"CS301 dropped for Mohamed."* |
| 2 | **"Cancel"** | Closes dialog |

---

#### 3.5.2 Swap Section

Advisor clicks **"Swap Section"** on a course:

**Swap Section Modal:**
- Current Section: "CS301 — Section A, Dr. Ahmed, Mon/Wed 9AM"
- Available Sections Table:

| Section | Doctor | Schedule | Available Seats | Action |
|---------|--------|----------|-----------------|--------|
| Section B | Dr. Hassan | Tue/Thu 11AM | 5 | **"Select"** |
| Section C | Dr. Ali | Sun/Tue 2PM | 12 | **"Select"** |

#### Inputs:

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | Reason | Textarea | ❌ Optional |

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Confirm Swap"** | Swaps enrollment → Notifies student → Toast: *"Section swapped to Section B."* |
| 2 | **"Cancel"** | Closes modal |

---

#### 3.5.3 Manual Course Add (Override)

Advisor clicks **"+ Add Course"**:

**Add Course Modal:**

#### Inputs:

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 1 | Course Instance | Searchable Dropdown | ✅ Yes | Search from current semester courses |
| 2 | Override Reason | Textarea | ✅ Yes | Required for audit trail |
| 3 | Notify Student | Toggle | Default: ✅ On | |

**Info Panel (after course selected):**
- Course details: Code, Name, Doctor, Credit Hours, Available Seats
- Prerequisite check result: ✅ Met / ❌ Not Met (advisor can still override)
- Credit hour check: "Student will have 19/18 hrs" (warning if exceeds max)

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Add Course"** | Enrolls student → Bypasses restrictions → Toast: *"CS401 added for Mohamed."* |
| 2 | **"Cancel"** | Closes modal |

> **Designer Note:** Show clear warnings when overriding restrictions (exceeded hours, unmet prerequisites). Use ⚠️ yellow warning cards, but allow the advisor to proceed — they have override authority.

---

### 3.6 Fees Management

- **Screen Name:** Fees Dashboard
- **Route:** `/advisor/fees`
- **Purpose:** Overview of fee status across all advisees with tools to assign and track fees.

#### Content / Display:

**Fees Summary Cards:**

| Card | Value |
|------|-------|
| Total Expected | 202,500 EGP |
| Total Collected | 165,000 EGP |
| Total Pending | 37,500 EGP |
| Overdue Students | 5 |

**Students Fee Status Table:**

| Column | Type |
|--------|------|
| Student Name | Text |
| Student Code | Text |
| Semester | Text |
| Total Amount | Currency |
| Paid | Currency |
| Remaining | Currency |
| Status | Badge: Paid ✅ / Partial 🟡 / Unpaid ❌ |
| Actions | **"View Details"**, **"Assign Fees"** |

#### Actions:
- **"View Details"** → Navigates to student's Fees tab
- **"Assign Fees"** → Opens Assign Fees Modal

---

### 3.6.1 Assign Fees Modal

- **Screen Name:** Assign Fees (Modal)
- **Purpose:** Assign semester fees to a student.

#### Inputs:

| # | Field Name | Type | Required | Validation |
|---|-----------|------|----------|------------|
| 1 | Student | Searchable Dropdown | ✅ Yes | Must be advisor's student |
| 2 | Semester | Dropdown | ✅ Yes | Select semester |
| 3 | Tuition Fees | Currency Input | ✅ Yes | > 0 |
| 4 | Books Fees | Currency Input | ❌ Optional | ≥ 0 |
| 5 | Discount | Currency Input | ❌ Optional | ≥ 0, default: 0 |
| 6 | Due Date | Date Picker | ❌ Optional | — |
| 7 | Send Invoice | Toggle | Default: ✅ On | |

**Auto-calculated fields:**
- **Total Amount** = Tuition + Books − Discount (displayed as read-only)

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Assign Fees"** | Validates → Creates fee record → Notifies student (if toggle on) → Toast: *"Fees assigned to Mohamed for First 2025-2026."* |
| 2 | **"Cancel"** | Closes modal |

---

### 3.7 Notifications (Advisor)

- **Screen Name:** Advisor Notifications
- **Route:** `/advisor/notifications`
- **Purpose:** View system notifications and send custom notifications to students.

#### Content / Display:
- Same structure as Student Notifications (Section 3.9 in Student Portal)
- Additional button: **"+ Send Notification"** → Opens a compose form similar to Doctor's Create Announcement modal

---

### 3.8 Advisor Profile

- **Screen Name:** My Profile
- **Route:** `/advisor/profile`
- **Purpose:** View and edit advisor profile.

#### Content / Display:

**Profile Card:**

| Field | Display | Editable |
|-------|---------|----------|
| Avatar | Profile picture | ✅ Change Photo |
| Full Name | "Prof. Sarah Ali" | ❌ No |
| Email | "sarah.ali@uni.edu" | ❌ No |
| Phone | "+20 1234567890" | ✅ Yes |
| Office Room | "Room C201" | ✅ Yes (dropdown) |

**Workload Summary:**
- Total Advisees: 45
- Active Warnings Issued: 3
- Last Password Change: "March 22, 2025"

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Save Changes"** | Saves editable fields |
| 2 | **"Change Password"** | Opens Change Password modal |

---

## 4. Key Advisor Workflows (Summary)

### Workflow A: Reviewing a Struggling Student

```
Dashboard → See "Students Needing Attention" (Low GPA)
  → Click student "Mohamed Khaled"
  → View Academic Tab (GPA: 1.8, multiple failing courses)
  → View Attendance Tab (68% — Danger zone)
  → Click "Send Warning" → Level 2, Reason: Low Academic Performance
  → Switch to Schedule Tab → Consider dropping a course
  → Click "Adjust Schedule" → Drop overloaded course
  → Notify student via email
```

### Workflow B: Managing Registration Requests

```
My Students → See student with Waitlisted courses
  → Click student → View Schedule Tab
  → Click "Add Course" → Manually override and enroll
  → Click "Swap Section" → Move to less crowded section
  → Confirm changes → Student gets notified
```

### Workflow C: Fee Assignment and Follow-up

```
Fees Management → See unpaid students list
  → Click "Assign Fees" for a new semester
  → Fill in Tuition, Books, Discount → Assign
  → Student receives fee notification
  → Monitor payment status over time
```

---

## 5. Advisor Portal Wireframe Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo] EduBrain — Advisor Portal         🔔(3) 👤 Prof.Ali▾│
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│  📊 Dashboard  │  Welcome, Prof. Sarah Ali                    │
│  🎓 Students   │  First Semester 2025-2026                    │
│  ⚠️ Warnings   │                                              │
│  🔄 Schedule   │  ┌────┐ ┌────┐ ┌────┐ ┌────┐                │
│    Adjustments│  │ 45 │ │ 3  │ │ 5  │ │ 0  │                │
│  💰 Fees       │  │Stud│ │Warn│ │Fees│ │Adj.│                │
│  🔔 Notifs     │  └────┘ └────┘ └────┘ └────┘                │
│  👤 Profile    │                                              │
│               │  Students Needing Attention                  │
│               │  ┌──────────────────────────────┐            │
│               │  │ 🔴 Mohamed K.  GPA:1.8       │            │
│               │  │ 🟡 Ahmed S.    Absence:32%   │            │
│               │  │ 🟠 Sara M.     Unpaid Fees   │            │
│               │  └──────────────────────────────┘            │
│               │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

---

## 6. Cross-Portal Interaction Summary

| Action by | Affects | What Happens |
|-----------|---------|--------------|
| Admin opens registration | Student portal | Students see "Registration OPEN" banner and can register |
| Admin creates course instance | Doctor portal | Doctor sees new course in "My Courses" |
| Doctor enters grades | Student portal | Student sees grades in "My Grades" and "Course Detail" |
| Doctor takes attendance | Student + Advisor portals | Student sees attendance %, Advisor sees attendance summary |
| Doctor sends announcement | Student portal | Student sees notification in "Notifications" |
| Advisor sends warning | Student portal | Student receives warning notification |
| Advisor drops course | Student portal | Course removed from student's schedule and registration |
| Advisor assigns fees | Student portal | Student sees fee record in "My Fees" |
| Student registers for course | Doctor + Advisor portals | Doctor sees student in enrolled list, Advisor sees updated schedule |

---

*← Previous:* [04_Student_Portal.md](./04_Student_Portal.md)  
*This is the final document in the UI/UX Requirements series.*
