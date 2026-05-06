# 📘 EduBrain — UI Requirements: Admin Portal Flow

## File 2 of 5

---

## 1. Overview

The Admin Portal is the command center of EduBrain. The Admin manages the entire academic infrastructure — from creating academic years and semesters, to defining courses, assigning doctors, managing users, and controlling registration periods. 

### Portal Route Prefix: `/admin`
### Access: `Admin` role only

---

## 2. Admin Sidebar Navigation

| # | Menu Item | Icon | Route |
|---|----------|------|-------|
| 1 | Dashboard | 📊 | `/admin/dashboard` |
| 2 | Academic Years | 📅 | `/admin/academic-years` |
| 3 | Courses | 📚 | `/admin/courses` |
| 4 | Course Instances | 🧩 | `/admin/course-instances` |
| 5 | Departments | 🏛️ | `/admin/departments` |
| 6 | Users | 👥 | `/admin/users` |
| 7 | Registration | 📝 | `/admin/registration` |
| 8 | Schedules & Rooms | 🗓️ | `/admin/schedules` |
| 9 | Finance | 💰 | `/admin/finance` |
| 10 | Notifications | 🔔 | `/admin/notifications` |

---

## 3. Screen Definitions

---

### 3.1 Admin Dashboard

- **Screen Name:** Admin Dashboard
- **Route:** `/admin/dashboard`
- **Purpose:** Provide a system-wide overview with quick stats and shortcuts.

#### Content / Display:

**Welcome Banner:**
- *"Welcome back, [Admin Name]"*
- Current Academic Year & Semester label (e.g., "2025-2026 — First Semester")

**Stat Cards (Row of 6):**

| Card | Icon | Value | Description |
|------|------|-------|-------------|
| Total Students | 🎓 | Dynamic count | All registered students |
| Total Doctors | 👨‍🏫 | Dynamic count | All active doctors |
| Total Courses | 📚 | Dynamic count | All course definitions |
| Active Course Instances | 🧩 | Dynamic count | Instances in current semester |
| Registration Status | 📝 | Open / Closed | Current semester registration |
| Unpaid Fees | 💰 | Dynamic count | Students with pending fees |

**Quick Actions Section:**
- Button: **"+ Add Academic Year"**
- Button: **"+ Add Course Instance"**
- Button: **"Open Registration"** / **"Close Registration"**
- Button: **"+ Add Student"**

**Recent Activity Feed (optional):**
- Last 10 system events (e.g., "New student Mohamed Khaled added", "Registration opened for Fall 2025").

#### Actions:
- Each stat card is clickable → navigates to the relevant management page.
- Quick action buttons trigger modals or navigate to the appropriate form.

---

### 3.2 Academic Years Management

- **Screen Name:** Academic Years
- **Route:** `/admin/academic-years`
- **Purpose:** Create and manage academic years and their semesters.

#### Content / Display:

**Page Header:**
- Title: *"Academic Years"*
- Button: **"+ Add Academic Year"** (top-right)

**Academic Years Table/List:**

| Column | Type | Description |
|--------|------|-------------|
| Name | Text | e.g., "2025-2026" |
| Start Date | Date | e.g., "Sep 1, 2025" |
| End Date | Date | e.g., "Aug 31, 2026" |
| Semesters | Badge Count | Number of semesters (e.g., "3") |
| Status | Badge | Active (green) / Inactive (gray) — based on current date |
| Actions | Buttons | **Edit** ✏️, **View Semesters** 📋, **Delete** 🗑️ |

> **Designer Note:** Each row can be expandable to show the semesters inline, or clicking "View Semesters" navigates to a detail page.

#### Inputs: None on this screen (inputs are in modals).

#### Actions:

| # | Action | Behavior |
|---|--------|----------|
| 1 | **"+ Add Academic Year"** | Opens the **Add Academic Year Modal** |
| 2 | **"Edit"** (per row) | Opens the **Edit Academic Year Modal** with pre-filled data |
| 3 | **"View Semesters"** (per row) | Navigates to the Academic Year Detail page OR expands inline |
| 4 | **"Delete"** (per row) | Shows confirmation dialog: *"Are you sure you want to delete the academic year '2025-2026'? This cannot be undone."* → Confirm / Cancel |

---

### 3.2.1 Add / Edit Academic Year Modal

- **Screen Name:** Add Academic Year (Modal)
- **Trigger:** "+" button from Academic Years list
- **Purpose:** Create or update an academic year.

#### Inputs:

| # | Field Name | Type | Required | Validation | Placeholder / Notes |
|---|-----------|------|----------|------------|---------------------|
| 1 | Name | Text Input | ✅ Yes | Must not be empty, max 50 chars | "e.g., 2025-2026" |
| 2 | Start Date | Date Picker | ✅ Yes | Must be before End Date | "Select start date" |
| 3 | End Date | Date Picker | ✅ Yes | Must be after Start Date | "Select end date" |

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Save"** (Primary) | Validates → Creates/Updates academic year → Closes modal → Refreshes list → Shows success toast |
| 2 | **"Cancel"** (Secondary) | Closes modal without saving |

---

### 3.3 Academic Year Detail / Semesters Management

- **Screen Name:** Academic Year Detail — Semesters
- **Route:** `/admin/academic-years/{id}/semesters`
- **Purpose:** Manage semesters within a specific academic year.

#### Content / Display:

**Page Header:**
- Breadcrumb: *Academic Years > 2025-2026*
- Title: *"Semesters — 2025-2026"*
- Button: **"+ Add Semester"** (top-right)

**Academic Year Summary Card:**
- Name, Start Date, End Date, Total Semesters count

**Semesters Table:**

| Column | Type | Description |
|--------|------|-------------|
| Semester Type | Badge | First (blue) / Second (green) / Summer (orange) |
| Start Date | Date | e.g., "Sep 15, 2025" |
| End Date | Date | e.g., "Jan 15, 2026" |
| Midterm Period | Date Range | e.g., "Nov 1 – Nov 15, 2025" |
| Final Exam Period | Date Range | e.g., "Jan 5 – Jan 15, 2026" |
| Credit Hours | Text | Min–Max (e.g., "12 – 18") |
| Is Current | Toggle / Badge | ✅ Current / – |
| Course Instances | Count | Number of active course instances |
| Actions | Buttons | **Edit** ✏️, **Delete** 🗑️ |

#### Actions:

| # | Action | Behavior |
|---|--------|----------|
| 1 | **"+ Add Semester"** | Opens the **Add Semester Modal** |
| 2 | **"Edit"** (per row) | Opens the **Edit Semester Modal** with pre-filled data |
| 3 | **"Delete"** (per row) | Confirmation dialog → Deletes semester |

---

### 3.3.1 Add / Edit Semester Modal

- **Screen Name:** Add Semester (Modal)
- **Trigger:** "+" button from Semesters list
- **Purpose:** Create or update a semester within an academic year.

#### Inputs:

| # | Field Name | Type | Required | Validation | Placeholder / Notes |
|---|-----------|------|----------|------------|---------------------|
| 1 | Semester Type | Dropdown | ✅ Yes | Must select one | Options: First, Second, Summer |
| 2 | Start Date | Date Picker | ✅ Yes | Must be within the academic year date range | "Select semester start date" |
| 3 | End Date | Date Picker | ✅ Yes | Must be after Start Date, within academic year | "Select semester end date" |
| 4 | Midterm Start Date | Date Picker | ❌ Optional | Must be within semester dates | "Midterm exam start" |
| 5 | Midterm End Date | Date Picker | ❌ Optional | Must be after Midterm Start | "Midterm exam end" |
| 6 | Final Exam Start Date | Date Picker | ❌ Optional | Must be within semester dates | "Final exam start" |
| 7 | Final Exam End Date | Date Picker | ❌ Optional | Must be after Final Exam Start | "Final exam end" |
| 8 | Min Credit Hours | Number Input | ✅ Yes | Positive integer, default: 12 | "12" |
| 9 | Max Credit Hours | Number Input | ✅ Yes | Positive integer, ≥ Min, default: 18 | "18" |
| 10 | Tuition Fees | Currency Input | ❌ Optional | Positive decimal | "e.g., 5000.00" |
| 11 | Set as Current | Toggle Switch | ❌ Optional | Boolean | "Mark as the current active semester" |

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Save"** (Primary) | Validates → Creates/Updates semester → Closes modal → Refreshes list → Success toast |
| 2 | **"Cancel"** (Secondary) | Closes modal without saving |

> **Designer Note:** If "Set as Current" is toggled ON, any previously current semester should be automatically deactivated. Show a warning: *"This will replace the currently active semester."*

---

### 3.4 Courses Management

- **Screen Name:** Courses Catalog
- **Route:** `/admin/courses`
- **Purpose:** Manage the master course catalog (reusable course definitions).

#### Content / Display:

**Page Header:**
- Title: *"Course Catalog"*
- Button: **"+ Add Course"** (top-right)
- Search bar: Search by course code or name
- Filters: Department dropdown, Course Type dropdown (Mandatory/Elective)

**Courses Table:**

| Column | Type | Description |
|--------|------|-------------|
| Course Code | Text | e.g., "CS301" |
| Course Name | Text | e.g., "Data Structures" |
| Credit Hours | Number | e.g., 3 |
| Type | Badge | Mandatory (blue) / Elective (purple) |
| Department(s) | Tags | e.g., "Computer Science", "IT" |
| Prerequisites | Tags / Count | e.g., "CS201, CS202" or "2 prerequisites" |
| Grade Weights | Mini chart or text | e.g., "Mid:30, Final:40, Prac:20, Quiz:10" |
| Actions | Buttons | **Edit** ✏️, **View Details** 👁️, **Delete** 🗑️ |

#### Actions:

| # | Action | Behavior |
|---|--------|----------|
| 1 | **"+ Add Course"** | Opens the **Add Course Modal / Page** |
| 2 | **"Edit"** | Opens the **Edit Course Modal** pre-filled |
| 3 | **"View Details"** | Opens a course detail view showing all fields, prerequisites, and associated instances |
| 4 | **"Delete"** | Confirmation dialog → Deletes course (if no instances exist) |

---

### 3.4.1 Add / Edit Course Modal

- **Screen Name:** Add Course (Modal or Page)
- **Purpose:** Define a new course or edit an existing one.

#### Inputs:

| # | Field Name | Type | Required | Validation | Notes |
|---|-----------|------|----------|------------|-------|
| 1 | Course Code | Text Input | ✅ Yes | Unique, max 10 chars | "e.g., CS301" |
| 2 | Course Name | Text Input | ✅ Yes | Max 200 chars | "e.g., Data Structures" |
| 3 | Description | Textarea | ❌ Optional | Max 1000 chars | Course description |
| 4 | Credit Hours | Number Input | ✅ Yes | 1–6 | Default: 3 |
| 5 | Theory Hours | Number Input | ✅ Yes | ≥ 0 | Lecture hours per week |
| 6 | Practical Hours | Number Input | ✅ Yes | ≥ 0 | Lab/practical hours per week |
| 7 | Course Type | Dropdown | ✅ Yes | — | Mandatory / Elective |
| 8 | Price | Currency Input | ❌ Optional | ≥ 0 | Books/materials price |
| 9 | Price Per Credit Hour | Currency Input | ❌ Optional | ≥ 0 | For summer courses |
| 10 | Passing Grade | Number Input | ✅ Yes | 0–100, default: 50 | Minimum passing score |
| 11 | Departments | Multi-Select Dropdown | ✅ Yes | At least one | Select departments this course belongs to |
| 12 | Prerequisites | Multi-Select Dropdown | ❌ Optional | — | Select prerequisite courses from the catalog |

**Grade Weight Section (collapsible):**

| # | Field | Type | Default | Validation |
|---|-------|------|---------|------------|
| 13 | Midterm Weight | Number (%) | 30 | 0–100 |
| 14 | Final Weight | Number (%) | 40 | 0–100 |
| 15 | Practical Weight | Number (%) | 20 | 0–100 |
| 16 | Quizzes Weight | Number (%) | 10 | 0–100 |
| 17 | Oral Weight | Number (%) | 0 | 0–100 |

> **Validation Rule:** Weights 13–17 must sum to exactly 100%. Show a live "Total: X%" indicator that turns red if ≠ 100%.

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Save Course"** | Validates → Creates/Updates course → Navigates back to list |
| 2 | **"Cancel"** | Discards → Returns to list |

---

### 3.5 Course Instances Management

- **Screen Name:** Course Instances
- **Route:** `/admin/course-instances`
- **Purpose:** Create and manage specific course offerings per semester (assign doctors, set capacity).

#### Content / Display:

**Page Header:**
- Title: *"Course Instances"*
- Button: **"+ Add Course Instance"** (top-right)
- Filters: Semester dropdown, Department dropdown, Doctor dropdown, Search by course name/code

**Course Instances Table:**

| Column | Type | Description |
|--------|------|-------------|
| Course Code | Text | e.g., "CS301" |
| Course Name | Text | e.g., "Data Structures" |
| Semester | Badge | e.g., "First 2025-2026" |
| Doctor | Text with avatar | e.g., "Dr. Ahmed Hassan" |
| Capacity | Progress Bar / Text | e.g., "45/60 (75%)" — shows current enrolled vs max capacity |
| Status | Badge | Open (seats available) / Full (at capacity) |
| Actions | Buttons | **Edit** ✏️, **View Enrollments** 👥, **Delete** 🗑️ |

#### Actions:

| # | Action | Behavior |
|---|--------|----------|
| 1 | **"+ Add Course Instance"** | Opens the **Add Course Instance Modal** |
| 2 | **"Edit"** | Opens the **Edit Course Instance Modal** |
| 3 | **"View Enrollments"** | Navigates to a list of enrolled students for this instance |
| 4 | **"Delete"** | Confirmation → Deletes instance (only if no enrollments exist) |

---

### 3.5.1 Add / Edit Course Instance Modal

- **Screen Name:** Add Course Instance (Modal)
- **Purpose:** Create a new course offering for a semester.

#### Inputs:

| # | Field Name | Type | Required | Validation | Notes |
|---|-----------|------|----------|------------|-------|
| 1 | Course | Searchable Dropdown | ✅ Yes | Must select from catalog | Search by code or name |
| 2 | Semester | Dropdown | ✅ Yes | Must select | Shows: "First 2025-2026", "Second 2025-2026", etc. |
| 3 | Doctor | Searchable Dropdown | ✅ Yes | Must select a doctor | Shows doctor name with title (e.g., "Dr. Ahmed Hassan") |
| 4 | Max Capacity | Number Input | ✅ Yes | Positive integer, min: 1 | "e.g., 60" |

> **Designer Note:** When a Course is selected, show a read-only info card below the dropdown:
> - Course Code, Credit Hours, Prerequisites, Grade Weights
> This helps the admin confirm they selected the right course.

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Save"** | Validates → Creates instance → Closes modal → Refreshes list |
| 2 | **"Cancel"** | Closes modal |

---

### 3.6 Registration Management

- **Screen Name:** Registration Control
- **Route:** `/admin/registration`
- **Purpose:** Open and close course registration periods for semesters.

#### Content / Display:

**Current Registration Status Card:**
- Semester name (e.g., "First Semester 2025-2026")
- Status badge: 🟢 **OPEN** or 🔴 **CLOSED**
- If open: "Opened on: Sep 1, 2025 — Closes on: Sep 14, 2025"
- If closed: "Registration is currently closed"

**Registration History Table (optional):**

| Column | Type |
|--------|------|
| Semester | Text |
| Action | Open / Close |
| Date | DateTime |
| Performed By | Admin name |

#### Actions:

| # | Action | Behavior |
|---|--------|----------|
| 1 | **"Open Registration"** (if currently Closed) | Opens the **Open Registration Modal** |
| 2 | **"Close Registration"** (if currently Open) | Shows confirmation: *"Are you sure you want to close registration? Students will no longer be able to register for courses."* → Confirm → Closes registration → Updates status |

---

### 3.6.1 Open Registration Modal

- **Screen Name:** Open Registration (Modal)
- **Purpose:** Set registration dates for a semester.

#### Inputs:

| # | Field Name | Type | Required | Validation | Notes |
|---|-----------|------|----------|------------|-------|
| 1 | Semester | Dropdown | ✅ Yes | Must select | Only semesters that are not already open |
| 2 | Registration Open Date | Date Picker | ✅ Yes | Cannot be in the past | Default: Today |
| 3 | Registration Close Date | Date Picker | ✅ Yes | Must be after Open Date | Suggested: 2 weeks from Open Date |

#### Actions:

| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Open Registration"** (Primary) | Validates → Opens registration → Shows success: *"Registration is now open!"* |
| 2 | **"Cancel"** (Secondary) | Closes modal |

---

### 3.7 Users Management

- **Screen Name:** Users Management
- **Route:** `/admin/users`
- **Purpose:** Create and manage all user accounts (Students, Doctors, Advisors).

#### Content / Display:

**Page Header:**
- Title: *"User Management"*
- Buttons: **"+ Add Student"**, **"+ Add Doctor"**, **"+ Add Advisor"**
- Tab Bar: **All Users** | **Students** | **Doctors** | **Advisors**
- Search bar: Search by name, email, or student code
- Filters: Department, Year Level (students only), Status

**Users Table:**

| Column | Type | Description |
|--------|------|-------------|
| Avatar | Image | Profile picture or initials |
| Full Name | Text | User's full name |
| Email | Text | Login email |
| Role | Badge | Student (blue) / Doctor (green) / Advisor (orange) |
| Department | Text | Department name |
| Status | Badge | Active / Inactive |
| Details | Role-specific | Student: Year Level, GPA. Doctor: Title. Advisor: Advisees count. |
| Actions | Buttons | **Edit** ✏️, **View Profile** 👁️, **Deactivate** ⛔ |

---

### 3.7.1 Add Student Modal/Page

- **Screen Name:** Add Student

#### Inputs:

| # | Field Name | Type | Required | Notes |
|---|-----------|------|----------|-------|
| 1 | Full Name | Text Input | ✅ Yes | First and last name |
| 2 | Email | Email Input | ✅ Yes | Must be unique |
| 3 | Phone Number | Phone Input | ❌ Optional | |
| 4 | National ID | Text Input | ✅ Yes | Government ID |
| 5 | Gender | Dropdown | ✅ Yes | Male / Female |
| 6 | Date of Birth | Date Picker | ✅ Yes | |
| 7 | Nationality | Text Input | ✅ Yes | |
| 8 | Religion | Text Input | ✅ Yes | |
| 9 | Address | Text Input | ✅ Yes | |
| 10 | City | Text Input | ✅ Yes | |
| 11 | Father Phone | Phone Input | ✅ Yes | |
| 12 | Father Job | Text Input | ❌ Optional | |
| 13 | Previous Qualification | Text Input | ❌ Optional | |
| 14 | Department | Dropdown | ❌ Optional | Select from departments |
| 15 | Academic Advisor | Searchable Dropdown | ❌ Optional | Select from advisors |
| 16 | Year Level | Dropdown | ✅ Yes | Freshman / Sophomore / Junior / Senior |
| 17 | Initial Password | Password Input | ✅ Yes | System can auto-generate |

#### Actions:
| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Create Student"** | Creates account → Sends welcome email with credentials |
| 2 | **"Cancel"** | Discards |

---

### 3.7.2 Add Doctor Modal/Page

- **Screen Name:** Add Doctor

#### Inputs:

| # | Field Name | Type | Required | Notes |
|---|-----------|------|----------|-------|
| 1 | Full Name | Text Input | ✅ Yes | |
| 2 | Email | Email Input | ✅ Yes | Unique |
| 3 | Phone Number | Phone Input | ❌ Optional | |
| 4 | Title | Dropdown | ✅ Yes | Professor / Associate Professor / Assistant Professor / Lecturer |
| 5 | Department | Dropdown | ✅ Yes | |
| 6 | Office Room | Dropdown | ❌ Optional | Select from rooms |
| 7 | Initial Password | Password Input | ✅ Yes | |

#### Actions:
| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Create Doctor"** | Creates account |
| 2 | **"Cancel"** | Discards |

---

### 3.7.3 Add Academic Advisor Modal/Page

- **Screen Name:** Add Academic Advisor

#### Inputs:

| # | Field Name | Type | Required | Notes |
|---|-----------|------|----------|-------|
| 1 | Full Name | Text Input | ✅ Yes | |
| 2 | Email | Email Input | ✅ Yes | Unique |
| 3 | Phone Number | Phone Input | ❌ Optional | |
| 4 | Office Room | Dropdown | ❌ Optional | Select from rooms |
| 5 | Initial Password | Password Input | ✅ Yes | |

#### Actions:
| # | Button | Behavior |
|---|--------|----------|
| 1 | **"Create Advisor"** | Creates account |
| 2 | **"Cancel"** | Discards |

---

### 3.8 Departments Management

- **Screen Name:** Departments
- **Route:** `/admin/departments`

#### Content / Display:
- Title: *"Departments"*
- Button: **"+ Add Department"**
- Table:

| Column | Type |
|--------|------|
| Department Name | Text |
| Type | Badge (Scientific / Literary / Medical / Engineering) |
| Head of Department | Text (Doctor name) |
| Courses Count | Number |
| Students Count | Number |
| Actions | Edit ✏️, Delete 🗑️ |

#### Add / Edit Department Modal Inputs:

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | Department Name | Text Input | ✅ Yes |
| 2 | Department Type | Dropdown | ✅ Yes |
| 3 | Head of Department | Searchable Dropdown (Doctors) | ❌ Optional |

---

### 3.9 Schedules & Rooms Management

- **Screen Name:** Schedules & Rooms
- **Route:** `/admin/schedules`
- **Purpose:** Manage rooms and assign course schedules.

#### Sub-tabs: **Rooms** | **Course Schedules**

#### Rooms Tab:
- Table: Room Name, Type (Lecture Hall / Lab / Office), Building, Capacity, Actions
- Modal to Add/Edit with fields: Name, Type (dropdown), Capacity (number)

#### Course Schedules Tab:
- Table: Course Instance, Day, Start Time, End Time, Room, Schedule Type (Lecture/Lab/Tutorial)
- Modal to Add/Edit:

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | Course Instance | Searchable Dropdown | ✅ Yes |
| 2 | Day | Dropdown | ✅ Yes |
| 3 | Start Time | Time Picker | ✅ Yes |
| 4 | End Time | Time Picker | ✅ Yes |
| 5 | Room | Dropdown | ✅ Yes |
| 6 | Schedule Type | Dropdown | ✅ Yes |

> Options for Day: Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday  
> Options for Schedule Type: Lecture, Lab, Tutorial

---

## 4. Admin Portal Wireframe Layout

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] EduBrain — Admin Portal            🔔 👤 Admin ▾ │
├─────────────┬────────────────────────────────────────────┤
│             │                                            │
│  📊 Dashboard│         [ Page Content Area ]              │
│  📅 Academic │                                            │
│     Years   │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  📚 Courses  │  │Stats│ │Stats│ │Stats│ │Stats│          │
│  🧩 Course   │  └─────┘ └─────┘ └─────┘ └─────┘          │
│   Instances │                                            │
│  🏛️ Depts   │  ┌──────────────────────────────────┐      │
│  👥 Users    │  │                                  │      │
│  📝 Register │  │        Data Table / List          │      │
│  🗓️ Schedule │  │                                  │      │
│  💰 Finance  │  │                                  │      │
│  🔔 Notifs   │  └──────────────────────────────────┘      │
│             │                                            │
└─────────────┴────────────────────────────────────────────┘
```

---

*← Previous:* [01_Auth_Flow.md](./01_Auth_Flow.md)  
*→ Next:* [03_Doctor_Portal.md](./03_Doctor_Portal.md)
