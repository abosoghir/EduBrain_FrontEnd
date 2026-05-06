# 📘 EduBrain — UI Requirements: Authentication & Authorization Flow

## File 1 of 5

---

## 1. Overview

The Authentication module is the single entry point for all four user roles. It handles login, password recovery, and role-based redirection. There is **no public registration** — all accounts are created by the Admin.

### Supported Roles
| Role | Enum Value | Redirects To |
|------|-----------|--------------|
| Admin | `Admin` | Admin Dashboard |
| Student | `Student` | Student Dashboard |
| Doctor | `Doctor` | Doctor Dashboard |
| Academic Advisor | `AcademicAdvisor` | Advisor Dashboard |

---

## 2. Screen Definitions

---

### 2.1 Login Screen

- **Screen Name:** Login
- **Route:** `/login`
- **Purpose:** Authenticate users and redirect them to their role-specific portal.

#### Content / Display:
- University logo and system name ("EduBrain") at the top
- A welcome headline: *"Welcome to EduBrain Academic Management System"*
- A brief subtitle: *"Sign in to access your portal"*
- Login form (centered card on desktop, full-width on mobile)
- A "Forgot Password?" link below the form
- Footer with university copyright

#### Inputs:

| # | Field Name | Type | Required | Validation | Placeholder / Notes |
|---|-----------|------|----------|------------|---------------------|
| 1 | Email | Text Input (email) | ✅ Yes | Must be a valid email format | "Enter your email address" |
| 2 | Password | Password Input | ✅ Yes | Cannot be empty | "Enter your password" |
| 3 | Role | Dropdown / Segmented Control | ✅ Yes | Must select one | Options: Admin, Student, Doctor, Academic Advisor |

> **Designer Note:** The Role selector can be designed as either:
> - A dropdown select
> - A segmented button group (4 tabs: Admin | Student | Doctor | Advisor)
> - Radio buttons with role icons
> 
> *Recommended: Segmented button group with icons for a clean, modern look.*

#### Actions:

| # | Button / Action | Behavior |
|---|----------------|----------|
| 1 | **"Sign In"** (Primary Button) | Validates inputs → Authenticates user → On success: redirects to the appropriate portal dashboard. On failure: shows inline error message. |
| 2 | **"Forgot Password?"** (Text Link) | Navigates to the Forgot Password screen. |

#### Error States:

| Condition | Error Message (inline) |
|-----------|----------------------|
| Empty email | "Email is required" |
| Invalid email format | "Please enter a valid email address" |
| Empty password | "Password is required" |
| No role selected | "Please select your role" |
| Wrong credentials | "Invalid email or password. Please try again." |
| Account locked | "Your account has been locked. Please contact the administration." |
| Role mismatch | "You do not have access to the selected role." |

#### Behavior Notes:
- After successful login, the system stores authentication tokens securely.
- If the user is already logged in and visits `/login`, redirect them to their portal automatically.
- Session timeout: After inactivity, the user is logged out and redirected to the login screen with a message: *"Your session has expired. Please log in again."*

---

### 2.2 Forgot Password Screen

- **Screen Name:** Forgot Password
- **Route:** `/forgot-password`
- **Purpose:** Allow users to request a password reset link via email.

#### Content / Display:
- University logo
- Heading: *"Forgot Your Password?"*
- Subtext: *"Enter your email address and we'll send you instructions to reset your password."*
- A form with a single email field
- A "Back to Login" link

#### Inputs:

| # | Field Name | Type | Required | Validation | Placeholder |
|---|-----------|------|----------|------------|-------------|
| 1 | Email | Text Input (email) | ✅ Yes | Must be a valid registered email | "Enter your registered email" |

#### Actions:

| # | Button / Action | Behavior |
|---|----------------|----------|
| 1 | **"Send Reset Link"** (Primary Button) | Validates email → Sends a password reset link to the email → Shows success confirmation screen. |
| 2 | **"Back to Login"** (Text Link) | Navigates back to the Login screen. |

#### Success State:
- After clicking "Send Reset Link", show a **confirmation screen**:
  - Icon: ✉️ Email sent icon
  - Heading: *"Check Your Email"*
  - Message: *"We've sent a password reset link to **[email@example.com]**. Please check your inbox and follow the instructions."*
  - Subtext: *"Didn't receive the email? Check your spam folder or [try again]."*
  - Button: **"Back to Login"**

#### Error States:

| Condition | Error Message |
|-----------|--------------|
| Empty email | "Email is required" |
| Invalid email format | "Please enter a valid email address" |
| Email not found | "No account found with this email address" |

---

### 2.3 Reset Password Screen

- **Screen Name:** Reset Password
- **Route:** `/reset-password?token=...&email=...`
- **Purpose:** Allow users to set a new password using the reset token from their email.

#### Content / Display:
- University logo
- Heading: *"Reset Your Password"*
- Subtext: *"Enter your new password below."*
- Password strength indicator bar (real-time)

#### Inputs:

| # | Field Name | Type | Required | Validation | Placeholder |
|---|-----------|------|----------|------------|-------------|
| 1 | New Password | Password Input | ✅ Yes | Min 8 chars, must include: uppercase, lowercase, number, special character | "Enter new password" |
| 2 | Confirm Password | Password Input | ✅ Yes | Must match New Password | "Confirm new password" |

#### Actions:

| # | Button / Action | Behavior |
|---|----------------|----------|
| 1 | **"Reset Password"** (Primary Button) | Validates inputs → Resets password → Shows success message → Redirects to Login. |
| 2 | **"Back to Login"** (Text Link) | Navigates back to the Login screen. |

#### Password Strength Indicator:
- **Weak** (Red): Less than 8 characters or missing requirements
- **Medium** (Yellow): Meets minimum length but missing some character types
- **Strong** (Green): Meets all requirements (8+ chars, uppercase, lowercase, number, special char)

#### Success State:
- Show a confirmation:
  - Icon: ✅ Checkmark
  - Message: *"Your password has been reset successfully! You can now log in with your new password."*
  - Button: **"Go to Login"**

#### Error States:

| Condition | Error Message |
|-----------|--------------|
| Empty password | "Password is required" |
| Password too short | "Password must be at least 8 characters" |
| Missing uppercase | "Password must contain at least one uppercase letter" |
| Missing lowercase | "Password must contain at least one lowercase letter" |
| Missing number | "Password must contain at least one number" |
| Missing special char | "Password must contain at least one special character" |
| Passwords don't match | "Passwords do not match" |
| Invalid/expired token | "This reset link has expired. Please request a new one." |

---

## 3. Role-Based Redirection Map

After successful login, the system redirects based on the user's role:

```
Login Success
    │
    ├─ Role: Admin         → /admin/dashboard
    │
    ├─ Role: Student       → /student/dashboard
    │
    ├─ Role: Doctor        → /doctor/dashboard
    │
    └─ Role: AcademicAdvisor → /advisor/dashboard
```

---

## 4. Session & Token Management (Designer-Relevant Behaviors)

| Behavior | What the User Sees |
|----------|-------------------|
| **Session Timeout** | After 30 minutes of inactivity, a modal appears: *"Your session is about to expire. Would you like to stay logged in?"* with buttons: **"Stay Logged In"** and **"Log Out"**. |
| **Token Refresh** | Happens silently in the background — no UI impact. |
| **Forced Logout** | If the token is revoked (e.g., by admin), the user is redirected to login with a message: *"You have been logged out. Please log in again."* |
| **Remember Me** (Optional) | A "Remember me" checkbox on the Login screen. If checked, the session persists for 7 days. |

---

## 5. Shared Navigation Components

### 5.1 Top Navigation Bar (Persistent — All Portals)

- **Content / Display:**
  - Left: University logo + Portal name (e.g., "EduBrain — Student Portal")
  - Center: Search bar (optional, context-dependent)
  - Right:
    - 🔔 Notification bell icon with unread count badge
    - 👤 User avatar / name dropdown menu

- **User Dropdown Menu:**

| Menu Item | Action |
|-----------|--------|
| Profile | Navigates to the user's profile page |
| Change Password | Opens the Change Password screen/modal |
| Settings (optional) | Opens preferences (language, theme) |
| Log Out | Logs out and redirects to Login screen |

### 5.2 Sidebar Navigation (Persistent — All Portals)

- Collapsible sidebar with icons and labels
- Active item is visually highlighted
- Mobile: Hamburger menu → slides in from left as overlay
- Each portal has its own navigation items (see Project Overview for the full list)

---

## 6. Change Password Screen (In-Portal — All Roles)

- **Screen Name:** Change Password
- **Route:** `/<portal>/profile/change-password` (or a modal triggered from the profile page)
- **Purpose:** Allow authenticated users to change their password.

#### Inputs:

| # | Field Name | Type | Required | Validation | Placeholder |
|---|-----------|------|----------|------------|-------------|
| 1 | Current Password | Password Input | ✅ Yes | Must be correct | "Enter current password" |
| 2 | New Password | Password Input | ✅ Yes | Same rules as Reset Password | "Enter new password" |
| 3 | Confirm New Password | Password Input | ✅ Yes | Must match New Password | "Confirm new password" |

#### Actions:

| # | Button / Action | Behavior |
|---|----------------|----------|
| 1 | **"Update Password"** (Primary Button) | Validates → Changes password → Shows success toast: *"Password changed successfully!"* |
| 2 | **"Cancel"** (Secondary Button) | Discards changes → Navigates back to Profile |

#### Error States:

| Condition | Error Message |
|-----------|--------------|
| Wrong current password | "Current password is incorrect" |
| New password same as current | "New password must be different from current password" |
| Passwords don't match | "Passwords do not match" |
| Weak password | "Password does not meet security requirements" |

---

## 7. Wireframe Guidance for the Designer

### Login Screen Layout (Desktop):
```
┌────────────────────────────────────────────────┐
│                                                │
│            [University Logo]                   │
│          EduBrain Academic System              │
│                                                │
│   ┌──────────────────────────────────┐         │
│   │   Sign in to your portal         │         │
│   │                                  │         │
│   │   [Admin] [Student] [Doctor] [Advisor]     │
│   │   (segmented control)            │         │
│   │                                  │         │
│   │   📧 Email ___________________   │         │
│   │   🔒 Password ________________   │         │
│   │                                  │         │
│   │   ☐ Remember me     Forgot Password?       │
│   │                                  │         │
│   │   [        Sign In          ]    │         │
│   └──────────────────────────────────┘         │
│                                                │
│        © 2026 University Name                  │
└────────────────────────────────────────────────┘
```

---

*← Previous:* [00_Project_Overview.md](./00_Project_Overview.md)  
*→ Next:* [02_Admin_Portal.md](./02_Admin_Portal.md)
