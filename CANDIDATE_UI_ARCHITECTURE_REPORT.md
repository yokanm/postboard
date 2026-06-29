# CANDIDATE_UI_ARCHITECTURE_REPORT.md

> **Phase 8A — Candidate Experience UI Architecture, UX & Journey Audit**
>
> **Date:** 2026-06-28
> **Status:** READ-ONLY Audit Complete
> **Scope:** Auth, Dashboard, Profile, Applications, Saved Jobs, Notifications, Navigation

---

## Executive Summary

The Candidate Experience is the primary user journey for job seekers. This audit covers 12 Design mockups (with code.html), 5 candidate route files, 6 feature modules, and 89 implementation files totaling ~6,500 lines.

**Overall Candidate Experience Design Fidelity: ~40%**

| Dimension | Assessment |
|-----------|------------|
| **Dashboard** | ~35% — Stat tiles and quick actions exist, but missing activity timeline, suggested roles, market intel, followed companies section |
| **Profile** | ~50% — RHF+Zod form works, but missing avatar upload, work history, portfolio links, phone field, completeness bar |
| **Applications** | ~55% — List with filters works, timeline exists, but missing proper card layout, pagination mismatch, missing application detail design |
| **Saved Jobs** | ~25% — Stub only. Loads ALL jobs client-side, filters by saved IDs. Missing filter tabs, card grid, followed companies |
| **Notifications** | ~60% — Drawer and list page work with real API. Missing time-grouped headers, metadata tags, action buttons |
| **Auth** | ~78% — Login and Register match design closely. Minor deviations in typography and spacing |
| **Apply Modal** | ~40% — Basic form works. Missing profile card, resume display, character counter, confirmation checkbox |
| **Mobile** | ~20% — CandidateLayout has mobile tabs, but no mobile-specific page designs implemented |

**Key Strengths:**
- Auth flow is solid (login, register, forgot/reset password, email verification all functional)
- Applications feature has complete API integration with cursor pagination
- Notifications have real-time polling (30s) and full CRUD operations
- Profile uses RHF+Zod with proper validation
- All routes protected with `requireRole(["CANDIDATE"])` guard

**Critical Gaps:**
- Dashboard is a flat stat grid — missing the rich bento layout from Design
- No mobile-specific page layouts (only tabs exist)
- Saved Jobs is client-side only (no backend endpoint exists)
- Profile missing avatar, work history, phone, portfolio links
- Apply Modal missing profile card, resume display, character counter
- No followed companies feature (backend endpoint missing)
- No candidate analytics page (Design shows one in sidebar)

---

## 1. Design Coverage Matrix

### 1.1 Candidate Pages

| # | Page | Design Mockup(s) | Implementation | Fidelity | Status |
|---|------|------------------|----------------|----------|--------|
| 1 | Dashboard (Desktop) | `candidate_dashboard_overview`, `candidate_dashboard_overview_refined_nav`, `candidate_dashboard_followed_companies` | `CandidateDashboardPage.tsx` (255L) | **~35%** | △ Partial |
| 2 | Dashboard (Mobile) | `candidate_dashboard_mobile_view` | `CandidateLayout.tsx` mobile tabs only | **~20%** | △ Partial |
| 3 | Profile Editor (Desktop) | `candidate_profile_editor` | `CandidateProfilePage.tsx` (173L) + `ProfileFormFields.tsx` (140L) + `SkillsSection.tsx` (64L) + `ResumeSection.tsx` (73L) | **~50%** | △ Partial |
| 4 | Profile Editor (Mobile) | `candidate_profile_editor_mobile_view` | Same as desktop (no mobile-specific layout) | **~15%** | △ Partial |
| 5 | Applications List | `candidate_applications_list_view` | `CandidateApplicationsPage.tsx` (141L) + `ApplicationCard.tsx` (76L) | **~55%** | △ Partial |
| 6 | Application Detail | (no dedicated Design mockup) | `CandidateApplicationDetailPage.tsx` (214L) + `ApplicationTimeline.tsx` (61L) | **N/A** | ✓ Functional |
| 7 | Application Modal (Desktop) | `job_application_modal` | `ApplyModal.tsx` (155L) | **~40%** | △ Partial |
| 8 | Application Modal (Mobile) | `job_application_modal_mobile_view` | Same as desktop (no mobile-specific layout) | **~20%** | △ Partial |
| 9 | Saved Jobs (Desktop) | `candidate_saved_roles_dashboard` | `SavedJobsPage.tsx` (48L) | **~25%** | △ Partial |
| 10 | Saved Jobs (Mobile) | `candidate_saved_roles_mobile_view` | Same as desktop | **~10%** | △ Partial |
| 11 | Notifications (Desktop) | `notification_center_desktop_drawer` | `NotificationDrawer.tsx` (215L) + `NotificationListPage.tsx` (201L) | **~60%** | △ Partial |
| 12 | Notifications (Mobile) | `notification_center_mobile_view` | `NotificationListPage.tsx` (no mobile-specific) | **~30%** | △ Partial |
| 13 | Login | `login_page` | `LoginPage.tsx` (158L) | **~75%** | ✓ Mostly Complete |
| 14 | Register | `register_page` | `RegisterPage.tsx` (273L) | **~80%** | ✓ Mostly Complete |
| 15 | Forgot Password | `forgot_password_page` | `ForgotPasswordPage.tsx` (132L) | **~70%** | ✓ Mostly Complete |
| 16 | Reset Password | `reset_password_page` | `ResetPasswordPage.tsx` (182L) | **~70%** | ✓ Mostly Complete |
| 17 | Email Verification | `verify_email_sent_desktop` | `VerifyEmailPage.tsx` (751L) | **~70%** | ✓ Mostly Complete |

### 1.2 Missing Design Coverage

| # | Page | Design Exists? | Implementation | Notes |
|---|------|---------------|----------------|-------|
| 1 | Candidate Dashboard — Followed Companies | `candidate_dashboard_followed_companies` | **Not implemented** | Backend has no follow/unfollow endpoint |
| 2 | Candidate Dashboard — Activity Timeline | `candidate_dashboard_overview` (timeline section) | **Not implemented** | Design shows 3-item vertical timeline with timestamps |
| 3 | Candidate Dashboard — Suggested Roles | `candidate_dashboard_overview` (suggested roles section) | **Not implemented** | Design shows match-score cards with salary |
| 4 | Candidate Dashboard — Market Intel | `candidate_dashboard_overview` (market intelligence widget) | **Not implemented** | Design shows demand index + trend |
| 5 | Candidate Profile — Avatar Upload | `candidate_profile_editor` | **Not implemented** | Design shows 120×120 dashed-border upload box |
| 6 | Candidate Profile — Work History | `candidate_profile_editor_mobile_view` | **Not implemented** | Design shows work history cards with title, company, dates |
| 7 | Candidate Profile — Phone Field | `candidate_profile_editor` | **Not implemented** | Design shows phone input |
| 8 | Candidate Profile — Completeness Bar | `candidate_profile_editor_mobile_view` | **Not implemented** | Design shows progress bar at top |
| 9 | Candidate Saved Roles — Filter Tabs | `candidate_saved_roles_dashboard` | **Not implemented** | Design shows ALL/ACTIVE/EXPIRED tabs |
| 10 | Candidate Saved Roles — Followed Companies | `candidate_saved_roles_dashboard` | **Not implemented** | Design shows horizontal scroll of followed companies |
| 11 | Notifications — Time-Grouped Headers | `notification_center_desktop_drawer` | **Not implemented** | Design shows TODAY/YESTERDAY/EARLIER groups |
| 12 | Notifications — Metadata Tags | `notification_center_desktop_drawer` | **Not implemented** | Design shows match score tags |
| 13 | Notifications — Action Buttons | `notification_center_desktop_drawer` | **Not implemented** | Design shows VIEW_DETAILS buttons |

---

## 2. Backend Integration Matrix

### 2.1 API Endpoints (Candidate-Relevant)

| # | Endpoint | Method | Auth | Implementation | Status |
|---|----------|--------|------|----------------|--------|
| 1 | `/auth/login` | POST | None | `loginUser()` → `useLogin()` | ✓ Complete |
| 2 | `/auth/register` | POST | None | `registerUser()` → `useRegister()` | ✓ Complete |
| 3 | `/auth/refresh-token` | POST | Cookie | `refreshAccessToken()` → `AuthInitializer` | ✓ Complete |
| 4 | `/auth/logout` | POST | Bearer | `logoutUser()` → `useLogout()` | ✓ Complete |
| 5 | `/auth/forgot-password` | POST | None | `requestPasswordReset()` → `useForgotPassword()` | ✓ Complete |
| 6 | `/auth/reset-password` | POST | None | `resetPassword()` → `useResetPassword()` | ✓ Complete |
| 7 | `/auth/send-verification-email` | POST | None | `requestVerificationEmail()` → `useResendVerificationEmail()` | ✓ Complete |
| 8 | `/auth/verify-email` | GET | None | `verifyEmail()` → `useVerifyEmail()` | ✓ Complete |
| 9 | `/auth/change-password` | POST | Bearer | `changePassword()` → `useChangePassword()` | ✓ Complete |
| 10 | `/user/current` | GET | Bearer | `fetchCurrentUser()` → `useCurrentUser()` | ✓ Complete |
| 11 | `/user/current/profile` | GET | Bearer | `fetchProfile()` → `useProfile()` | ✓ Complete |
| 12 | `/user/current/profile` | PUT | Bearer | `updateProfile()` → `useUpdateProfile()` | ✓ Complete |
| 13 | `/user/current/profile/resume` | POST | Bearer | `uploadResume()` → `useUploadResume()` | ✓ Complete |
| 14 | `/user/current/profile/resume` | DELETE | Bearer | `deleteResume()` → `useDeleteResume()` | ✓ Complete |
| 15 | `/job` | GET | None | `listJobs()` → `useJobs()` | ✓ Complete |
| 16 | `/job/:id` | GET | None | `getJob()` → `useJob()` | ✓ Complete |
| 17 | `/job/:id/apply` | POST | Bearer | `applyToJob()` → `useApplyToJob()` | ✓ Complete |
| 18 | `/job/my-applications` | GET | Bearer | `getMyApplications()` → `useMyApplications()` | ✓ Complete |
| 19 | `/job/applications/:id` | DELETE | Bearer | `withdrawApplication()` → `useWithdrawApplication()` | ✓ Complete |
| 20 | `/notifications/user` | GET | Bearer | `fetchUserNotifications()` → `useNotifications()` | ✓ Complete |
| 21 | `/notifications/user/unread-count` | GET | Bearer | `fetchUnreadCount()` → `useUnreadCount()` | ✓ Complete |
| 22 | `/notifications/user/read` | PATCH | Bearer | `markNotificationsRead()` → `useMarkNotificationsRead()` | ✓ Complete |
| 23 | `/notifications/user/:id` | DELETE | Bearer | `deleteNotification()` → `useDeleteNotification()` | ✓ Complete |

### 2.2 Missing Backend Endpoints

| # | Feature | Expected Endpoint | Status | Impact |
|---|---------|-------------------|--------|--------|
| 1 | Saved Jobs (server-synced) | `POST /saved-jobs`, `GET /saved-jobs`, `DELETE /saved-jobs/:id` | **Missing** | Saved jobs are client-side only (Zustand + localStorage). No cross-device sync. |
| 2 | Follow/Unfollow Company | `POST /company/:id/follow`, `DELETE /company/:id/follow` | **Missing** | Followed companies section cannot be implemented. |
| 3 | Application Detail (single) | `GET /job/applications/:applicationId` | **Missing** | CandidateApplicationDetailPage uses `useMyApplications()` and finds by ID in client — loads ALL applications to find one. |
| 4 | Candidate Analytics | `GET /user/current/analytics` | **Missing** | Design shows analytics in sidebar — no endpoint exists. |
| 5 | Candidate Dashboard Stats | `GET /users/current/dashboard/stats` | **Exists** | `fetchCandidateDashboardStats()` hits this endpoint. Used by `useCandidateDashboardStats()` hook. |

### 2.3 Mock Data / Client-Side Only

| # | Feature | Data Source | Issue |
|---|---------|------------|-------|
| 1 | Saved Jobs | Zustand `saved-jobs-store.ts` (localStorage) | No server persistence. Lost on clear-cache. No cross-device sync. |
| 2 | Profile Completion % | Client-computed from `useProfile()` fields | 5-field heuristic (bio, location, skills, resume, linkedin). Not from backend. |
| 3 | Recommended Jobs | `useJobs()` — first 5 jobs from marketplace | No personalization. Just arbitrary first 5. |
| 4 | Application Count Stats | Client-computed from `useMyApplications()` | Filters by status client-side. No backend aggregation. |

---

## 3. Component Inventory

### 3.1 Candidate-Specific Components

| # | Component | File | Lines | Used By | Status |
|---|-----------|------|-------|---------|--------|
| 1 | `CandidateLayout` | `candidate/layout/CandidateLayout.tsx` | 97 | Candidate pages (but NOT used in routes — pages render without it) | ✓ Exists, unused |
| 2 | `CandidateDashboardPage` | `candidate/pages/CandidateDashboardPage.tsx` | 255 | `/candidate/dashboard` route | ✓ Active |
| 3 | `CandidateProfilePage` | `profile/pages/candidate/CandidateProfilePage.tsx` | 173 | `/candidate/profile` route | ✓ Active |
| 4 | `ProfileFormFields` | `profile/components/ProfileFormFields.tsx` | 140 | `CandidateProfilePage` | ✓ Active |
| 5 | `SkillsSection` | `profile/components/SkillsSection.tsx` | 64 | `CandidateProfilePage` | ✓ Active |
| 6 | `ResumeSection` | `profile/components/ResumeSection.tsx` | 73 | `CandidateProfilePage` | ✓ Active |
| 7 | `CandidateApplicationsPage` | `applications/pages/candidate/CandidateApplicationsPage.tsx` | 141 | `/candidate/applications` route | ✓ Active |
| 8 | `CandidateApplicationDetailPage` | `applications/pages/candidate/CandidateApplicationDetailPage.tsx` | 214 | `/candidate/applications/$applicationId` route | ✓ Active |
| 9 | `ApplicationCard` | `applications/components/ApplicationCard.tsx` | 76 | `CandidateApplicationsPage` | ✓ Active |
| 10 | `ApplicationStatusBadge` | `applications/components/ApplicationStatusBadge.tsx` | 28 | `ApplicationCard`, `CandidateDashboardPage` | ✓ Active |
| 11 | `ApplicationTimeline` | `applications/components/ApplicationTimeline.tsx` | 61 | `CandidateApplicationDetailPage` | ✓ Active |
| 12 | `WithdrawConfirmDialog` | `applications/components/WithdrawConfirmDialog.tsx` | 62 | `CandidateApplicationsPage`, `CandidateApplicationDetailPage` | ✓ Active |
| 13 | `SavedJobsPage` | `jobs/components/SavedJobsPage.tsx` | 48 | `/candidate/jobs/saved` route | ✓ Active |
| 14 | `SavedJobsButton` | `jobs/components/SavedJobsButton.tsx` | 29 | `JobCard`, `JobDetailPage` | ✓ Active |
| 15 | `ApplyModal` | `jobs/components/ApplyModal.tsx` | 155 | `JobDetailPage` | ✓ Active |
| 16 | `NotificationDrawer` | `notifications/components/NotificationDrawer.tsx` | 215 | `NotificationsManager` (Topbar) | ✓ Active |
| 17 | `NotificationListPage` | `notifications/pages/NotificationListPage.tsx` | 201 | `/notifications` route | ✓ Active |
| 18 | `NotificationBell` | `notifications/components/NotificationBell.tsx` | 40 | `NotificationsManager` | ✓ Active |
| 19 | `NotificationsManager` | `notifications/components/NotificationsManager.tsx` | 17 | `Topbar` | ✓ Active |

### 3.2 Shared Reusable Components

| # | Component | File | Lines | Reuse Potential |
|---|-----------|------|-------|-----------------|
| 1 | `LoadingState` | `shared/components/ux/LoadingState.tsx` | 54 | Used by dashboard skeleton — could replace manual skeletons |
| 2 | `EmptyState` | `shared/components/ux/EmptyState.tsx` | 80 | Used by dashboard — good reuse |
| 3 | `ErrorState` | `shared/components/ux/ErrorState.tsx` | 22 | Used by applications — good reuse |
| 4 | `Breadcrumbs` | `shared/components/ux/Breadcrumbs.tsx` | 98 | Auto-rendered via `_public.tsx` — not used in candidate routes |
| 5 | `VerificationBadge` | `shared/components/ux/VerificationBadge.tsx` | 78 | Could be used in profile/company sections |
| 6 | `ConfirmDialog` | `shared/components/dialogs/ConfirmDialog.tsx` | 64 | Could replace `WithdrawConfirmDialog` (which is feature-specific) |
| 7 | `PasswordField` | `shared/components/forms/PasswordField.tsx` | 226 | Used by auth pages — good reuse |
| 8 | `ThemeToggle` | `shared/components/theme/ThemeToggle.tsx` | 40 | Used by Topbar |
| 9 | `PressGrid` | `shared/components/PressGrid.tsx` | 19 | Used by auth brand panels, empty states |
| 10 | `DataTable` | `shared/components/table/DataTable.tsx` | 133 | Not used by candidate — could be used for applications table |

### 3.3 Duplicate Components

| # | Component | Location 1 | Location 2 | Issue |
|---|-----------|-----------|-----------|-------|
| 1 | `SearchInput` | `shared/components/ux/SearchInput.tsx` (21L) | `shared/components/recruiter/SearchInput.tsx` (31L) | Different APIs (recruiter has optional label). Should consolidate. |
| 2 | `StatusBadge` | `applications/components/ApplicationStatusBadge.tsx` (28L) | `shared/components/recruiter/StatusBadge.tsx` (28L) | Similar but different implementations. Should consolidate. |
| 3 | `WithdrawConfirmDialog` | `applications/components/WithdrawConfirmDialog.tsx` (62L) | `shared/components/dialogs/ConfirmDialog.tsx` (64L) | Feature-specific dialog could use shared ConfirmDialog. |

---

## 4. Navigation Audit

### 4.1 Sidebar Navigation (Desktop)

| # | Nav Item | Route | Exists | Guard | Status |
|---|----------|-------|--------|-------|--------|
| 1 | Dashboard | `/candidate/dashboard` | ✓ | `requireRole(["CANDIDATE"])` | ✓ Working |
| 2 | Jobs | `/candidate/jobs` | ✓ | Redirect → `/jobs` | ✓ Working (redirect) |
| 3 | Applications | `/candidate/applications` | ✓ | `requireRole(["CANDIDATE"])` | ✓ Working |
| 4 | Profile | `/candidate/profile` | ✓ | `requireRole(["CANDIDATE"])` | ✓ Working |
| 5 | Notifications | `/notifications` | ✓ | `requireAuth` (shared) | ✓ Working |

**Design vs Implementation:**
- Design `candidate_dashboard_overview` sidebar: Dashboard, My Applications, Saved Roles, Analytics, Company Profile, My Profile (6 items)
- Design `candidate_dashboard_overview_refined_nav` sidebar: Dashboard, My Applications, Saved Roles, Analytics, Company Profile (5 items — no My Profile)
- Implementation `Sidebar.tsx` CANDIDATE config: Dashboard, Jobs, Applications, Profile, Notifications (5 items)
- Implementation `CandidateLayout.tsx`: Dashboard, Browse Jobs, Applications, Saved, Notifications, Profile (6 items)
- **Mismatch:** Design shows "Saved Roles" and "Analytics" — implementation has "Jobs" (redirect) and "Notifications" (separate page). No "Analytics" or "Company Profile" for candidates.

### 4.2 Mobile Navigation

| # | Nav Item | Route | Implementation | Status |
|---|----------|-------|----------------|--------|
| 1 | Overview | `/candidate/dashboard` | `MobileNav.tsx` bottom tab | ✓ Working |
| 2 | Jobs | `/candidate/jobs` | `MobileNav.tsx` bottom tab (redirects to `/jobs`) | ✓ Working |
| 3 | Apps | `/candidate/applications` | `MobileNav.tsx` bottom tab | ✓ Working |
| 4 | Profile | `/candidate/profile` | `MobileNav.tsx` bottom tab | ✓ Working |
| 5 | Notifications | `/notifications` | `MobileNav.tsx` bottom tab | ✓ Working |

**Design vs Implementation:**
- Design `candidate_dashboard_mobile_view` bottom nav: Overview, Apps, Saved, Stats, Profile (5 tabs)
- Implementation `MobileNav.tsx` CANDIDATE config: Overview, Jobs, Apps, Profile, Notifications (5 tabs)
- **Mismatch:** Design shows "Saved" and "Stats" — implementation has "Jobs" (redirect) and "Notifications". No "Saved" tab on mobile.

### 4.3 CandidateLayout (Feature-Level)

The `CandidateLayout.tsx` component exists (97 lines) with its own sidebar and mobile tabs, but **is NOT used by any route**. All candidate routes render directly inside the `_authenticated` layout (`AppShell`), which uses the global `Sidebar.tsx` and `MobileNav.tsx`.

**Impact:** The CandidateLayout's 6-item nav (Dashboard, Browse Jobs, Applications, Saved, Notifications, Profile) is never rendered. The global sidebar's 5-item nav (Dashboard, Jobs, Applications, Profile, Notifications) is used instead.

### 4.4 Dead Routes / Broken Links

| # | Route | Issue | Severity |
|---|-------|-------|----------|
| 1 | `/candidate/jobs` | Redirects to `/jobs` — no dedicated candidate jobs page | Low (by design) |
| 2 | `/candidate/jobs/saved` | Works but `SavedJobsPage` loads ALL jobs client-side | Medium |
| 3 | `/notifications` | Shared route — same page for all roles | Low (by design) |

---

## 5. UX Findings

### 5.1 Application Flow

**Current Flow:**
1. Browse jobs → `/jobs` (public marketplace)
2. Click job → `/jobs/$jobId` (public detail)
3. Click "Apply Now" → `ApplyModal` opens
4. Fill cover letter + resume URL → Submit
5. Check applications → `/candidate/applications`
6. Click application → `/candidate/applications/$applicationId`
7. View timeline + details

**Issues:**
- **ApplyModal missing profile card** — Design shows avatar + name + email + verified badge at top of modal
- **ApplyModal missing resume display** — Design shows current resume filename with [Replace] button. Implementation uses URL input instead.
- **ApplyModal missing character counter** — Design shows `0 / 1000` counter on cover letter
- **ApplyModal missing confirmation checkbox** — Design shows "I confirm..." checkbox before submit
- **Application detail loads ALL applications** — `CandidateApplicationDetailPage` calls `useMyApplications()` (fetches all) then filters by ID client-side. Should use a single-application endpoint.
- **ApplicationCard layout mismatch** — Design shows horizontal card with job title left, status badge center, timestamp + actions right. Implementation shows vertical stack.

### 5.2 Profile Completion Flow

**Current Flow:**
1. Navigate to `/candidate/profile`
2. Fill firstName, lastName, location, bio, linkedinUrl, githubUrl
3. Add skills (Enter key to add)
4. Upload resume (PDF/DOC/DOCX, max 10MB)
5. Click "Save Changes"

**Issues:**
- **Missing avatar upload** — Design shows 120×120 dashed-border upload area. Not implemented.
- **Missing phone field** — Design shows phone input. Not in form schema.
- **Missing work history** — Design (mobile) shows work history cards with title, company, dates, description. Not implemented.
- **Missing portfolio links** — Design shows LinkedIn, GitHub, Website inputs with leading icons. Implementation has LinkedIn + GitHub but no Website.
- **Missing completeness bar** — Design (mobile) shows progress bar at top. Not implemented.
- **Save button placement** — Design shows sticky bottom CTA on mobile. Implementation has inline button.
- **Profile completion %** — Computed client-side from 5 fields (bio, location, skills, resume, linkedin). Not from backend.

### 5.3 Resume Upload Experience

**Current Flow:**
1. Profile page → ResumeSection
2. Click "Upload Resume" → file picker opens
3. Select PDF/DOC/DOCX → auto-uploads
4. Shows "View Resume" link + "Remove" button

**Issues:**
- **No file preview** — Design shows filename + file icon. Implementation shows link.
- **No drag-and-drop** — Design (mobile) doesn't show drag-and-drop either, but it's a nice-to-have.
- **No file size feedback** — Silently rejects files > 10MB. No user feedback.
- **No upload progress** — Shows "Uploading..." text but no progress bar.

### 5.4 Notifications Experience

**Current Flow:**
1. Click bell icon in Topbar → NotificationDrawer opens
2. View notifications with mark-read/delete actions
3. Or navigate to `/notifications` → full-page list

**Issues:**
- **Missing time-grouped headers** — Design shows TODAY/YESTERDAY/EARLIER sticky headers. Implementation shows flat list.
- **Missing metadata tags** — Design shows `// MATCH_SCORE: 98%` tags. Not implemented.
- **Missing action buttons** — Design shows VIEW_DETAILS buttons on relevant notifications. Not implemented.
- **Missing notification type icons** — Design shows colored icons per type. Implementation shows text labels only.
- **Drawer uses `shadow-lg`** — Design shows flat border, no shadow. Minor deviation.

### 5.5 Saved Jobs Experience

**Current Flow:**
1. Click bookmark on job card → toggles saved state (localStorage)
2. Navigate to `/candidate/jobs/saved` → see saved jobs

**Issues:**
- **No filter tabs** — Design shows ALL/ACTIVE/EXPIRED tabs. Implementation has none.
- **No followed companies section** — Design shows horizontal scroll of followed companies. Not implemented (no backend).
- **No card grid** — Design shows 2-column grid with `gap-px bg-rule` pattern. Implementation shows single-column list.
- **No "Unsave" action on cards** — Design shows UNSAVE button on each card. Implementation uses the same `JobCard` from marketplace.
- **Loads ALL jobs** — `SavedJobsPage` calls `useJobs()` (fetches all), then filters by saved IDs client-side. Doesn't scale.

### 5.6 Accessibility

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 1 | `CandidateDashboardPage` stat tiles missing `aria-label` | `CandidateDashboardPage.tsx:64-119` | Medium |
| 2 | `ApplicationCard` uses `role="button"` but is a `div` — should be `<button>` | `ApplicationCard.tsx:24` | Medium |
| 3 | `SkillsSection` skill input missing `aria-label` | `SkillsSection.tsx:44` | Low |
| 4 | `ResumeSection` file input hidden but label lacks `aria-label` | `ResumeSection.tsx:49-64` | Low |
| 5 | `NotificationDrawer` missing `aria-describedby` | `NotificationDrawer.tsx:63` | Low |
| 6 | `ApplyModal` missing `aria-describedby` on dialog | `ApplyModal.tsx:68` | Low |
| 7 | `SavedJobsPage` empty state missing `role="status"` | `SavedJobsPage.tsx:32` | Low |
| 8 | Mobile bottom nav missing `aria-label="Mobile navigation"` on individual tabs | `MobileNav.tsx:111` | Low |

### 5.7 Responsiveness

| # | Page | Mobile Handling | Issue |
|---|------|----------------|-------|
| 1 | Dashboard | CandidateLayout mobile tabs + MobileNav bottom bar | No mobile-specific layout. Stat grid uses `sm:grid-cols-2 lg:grid-cols-4` — works but doesn't match Design's 2×2 grid with `gap-px bg-rule`. |
| 2 | Profile | Same as desktop | No mobile-specific layout. Missing sticky bottom CTA, completeness bar, work history cards. |
| 3 | Applications | Same as desktop | No mobile-specific layout. Cards stack vertically — works but doesn't match Design's card layout. |
| 4 | Apply Modal | Same as desktop (centered modal) | No mobile-specific layout. Design shows full-screen modal with fixed top/bottom bars. |
| 5 | Saved Jobs | Same as desktop | No mobile-specific layout. Missing bottom nav integration. |
| 6 | Notifications | Same as desktop | No mobile-specific layout. Design shows sticky wayfinding header + bottom nav. |

---

## 6. Engineering Blueprint

### 6.1 Dashboard Page

**Expected Route:** `/candidate/dashboard`
**Current Route:** `/candidate/dashboard` ✓

**Expected Components:**
- `CandidateLayout` (sidebar + mobile tabs) — EXISTS but UNUSED
- Hero section with `// USER_STATUS: ACTIVE` label + welcome heading
- 4 stat tiles in `grid-cols-4` (desktop) / `grid-cols-2` (mobile) with `gap-px bg-rule`
- Activity timeline (7-col span) with vertical connector line
- Suggested roles (5-col span) with match scores
- Market intelligence widget
- Followed companies section (4-col grid)
- Footer with system status

**Current Components:**
- `CandidateDashboardPage` — flat stat grid, quick actions, recent applications, recommended jobs
- No timeline, no suggested roles, no market intel, no followed companies

**Expected Backend APIs:**
- `GET /user/current/dashboard/stats` (exists, used)
- Activity feed (no endpoint)
- Suggested jobs (uses `GET /job` — no personalization)
- Followed companies (no endpoint)

**Validation:** None (read-only dashboard)

**Acceptance Criteria:**
1. Hero section with user status and welcome message
2. 4 stat tiles with `gap-px bg-rule` grid pattern
3. Activity timeline with timestamps and status indicators
4. Suggested roles with match scores and salary
5. Market intelligence widget with demand index
6. Followed companies horizontal scroll (requires backend)
7. Mobile: 2×2 stat grid, horizontal scroll companies, timeline

**Potential Risks:**
- No backend for activity feed, suggested roles, followed companies
- CandidateLayout is unused — routes need to wrap pages in it
- Stat data comes from multiple hooks (applications, profile, notifications) — waterfall loading

**Regression Risk:** Low — dashboard is standalone, no cross-feature dependencies

---

### 6.2 Profile Editor Page

**Expected Route:** `/candidate/profile`
**Current Route:** `/candidate/profile` ✓

**Expected Components:**
- Avatar upload (120×120 dashed border)
- Completeness progress bar
- Form fields: firstName, lastName, phone, email (read-only), location, bio
- Skills tag manager
- Work history cards (title, company, dates, description)
- Portfolio links: LinkedIn, GitHub, Website (with leading icons)
- Resume upload section
- Sticky save CTA (mobile)

**Current Components:**
- `CandidateProfilePage` — form with RHF+Zod
- `ProfileFormFields` — firstName, lastName, location, bio, linkedinUrl, githubUrl
- `SkillsSection` — tag manager with Enter-to-add
- `ResumeSection` — upload/delete with file input

**Missing:**
- Avatar upload component
- Phone field (not in schema)
- Work history section (not in schema)
- Website portfolio link
- Completeness progress bar
- Mobile sticky CTA

**Expected Backend APIs:**
- `GET /user/current/profile` ✓
- `PUT /user/current/profile` ✓
- `POST /user/current/profile/resume` ✓
- `DELETE /user/current/profile/resume` ✓
- Avatar upload (no endpoint — would need `POST /user/current/avatar`)

**Validation:** Zod schema (`profileSchema`) — firstName required, lastName required, bio max 500, URLs validated

**Acceptance Criteria:**
1. Avatar upload with preview
2. All form fields with validation
3. Skills tag manager
4. Work history CRUD
5. Portfolio links with icons
6. Resume upload/replace/delete
7. Completeness progress bar
8. Mobile: sticky save CTA, full-width avatar

**Potential Risks:**
- Avatar upload has no backend endpoint
- Work history has no backend endpoint
- Profile completion is client-computed, not from backend

**Regression Risk:** Low — profile is self-contained

---

### 6.3 Applications List Page

**Expected Route:** `/candidate/applications`
**Current Route:** `/candidate/applications` ✓

**Expected Components:**
- Header with `// my_applications` label
- Filter tabs (All, Active, Archived) — Design shows tabs, implementation uses `<select>`
- Application cards in horizontal layout (title left, status center, actions right)
- Status badges: [APPLIED], [REVIEWING], [REJECTED]
- Action buttons: [Withdraw], [View], [Archive]
- Pagination: ← Prev | Page X of Y | Next →

**Current Components:**
- `CandidateApplicationsPage` — status filter dropdown, card list, Load More button
- `ApplicationCard` — vertical card with title, company, status, metadata, withdraw button

**Missing:**
- Filter tabs (uses dropdown instead)
- Horizontal card layout (uses vertical stack)
- Archive functionality
- Prev/Next pagination (uses Load More / infinite scroll)

**Expected Backend APIs:**
- `GET /job/my-applications` ✓ (cursor-based pagination)

**Validation:** None (list view)

**Acceptance Criteria:**
1. Filter tabs (All, Active, Archived)
2. Application cards with proper layout
3. Status badges with correct colors
4. Withdraw action for PENDING applications
5. Pagination (prev/next or infinite scroll)
6. Loading/empty/error states

**Potential Risks:**
- "Archived" filter has no backend support — would need client-side filtering or new endpoint
- Application count shown in filter — Design shows counts per tab

**Regression Risk:** Low — applications list is self-contained

---

### 6.4 Application Detail Page

**Expected Route:** `/candidate/applications/$applicationId`
**Current Route:** `/candidate/applications/$applicationId` ✓

**Expected Components:**
- Back link to applications list
- Job title + company name + status badge
- Job details card (type, level, applied date)
- Cover letter section
- Resume link
- Rejection feedback (if rejected)
- Application timeline sidebar
- Withdraw button (PENDING only)

**Current Components:**
- `CandidateApplicationDetailPage` — all of the above ✓
- `ApplicationTimeline` — 5-status vertical timeline ✓
- `WithdrawConfirmDialog` — confirmation dialog ✓

**Missing:**
- No dedicated Design mockup for this page — implementation is functional

**Expected Backend APIs:**
- `GET /job/my-applications` — loads ALL applications, filters by ID client-side
- `DELETE /job/applications/:applicationId` ✓

**Validation:** None (read-only + withdraw action)

**Acceptance Criteria:**
1. Back navigation to applications list
2. Job details with metadata
3. Cover letter display
4. Resume link
5. Rejection feedback display
6. Status timeline
7. Withdraw action for PENDING status

**Potential Risks:**
- Loads ALL applications to find one by ID — should use single-application endpoint (doesn't exist)
- `useMemo` to find application from full list — performance issue with many applications

**Regression Risk:** Low — detail page is self-contained

---

### 6.5 Apply Modal

**Expected Route:** N/A (modal overlay on job detail page)
**Current Implementation:** `ApplyModal.tsx` (155L)

**Expected Components:**
- Profile card: avatar + name + email + verified badge
- Resume row: filename + [Replace] button
- Cover letter textarea with character counter (0/1000)
- Confirmation checkbox
- Footer: Cancel + Submit Application

**Current Components:**
- `ApplyModal` — cover letter textarea + resume URL input + submit/cancel buttons

**Missing:**
- Profile card (avatar, name, email, verified badge)
- Resume display (shows URL input instead of current resume)
- Character counter on cover letter
- Confirmation checkbox

**Expected Backend APIs:**
- `POST /job/:id/apply` ✓ (multipart: coverLetter + resume)
- `GET /user/current` ✓ (for profile display)
- `GET /user/current/profile` ✓ (for resume URL)

**Validation:** `applyJobSchema` — coverLetter max 3000, resumeUrl optional URL

**Acceptance Criteria:**
1. Profile card with avatar and name
2. Current resume display with Replace option
3. Cover letter with character counter (max 1000)
4. Confirmation checkbox
5. Submit with loading state
6. Success state with confirmation

**Potential Risks:**
- Resume is URL-based in current implementation — Design shows file-based
- Backend accepts multipart (file upload) but frontend sends URL — mismatch

**Regression Risk:** Low — modal is self-contained

---

### 6.6 Saved Jobs Page

**Expected Route:** `/candidate/jobs/saved`
**Current Route:** `/candidate/jobs/saved` ✓

**Expected Components:**
- Header with `// SAVED_ROLES` label
- Filter tabs: ALL, ACTIVE, EXPIRED
- 2-column card grid with `gap-px bg-rule`
- Job cards with company logo, title, status badge, metadata, UNSAVE button, VIEW ROLE button
- Followed companies horizontal scroll
- Decorative placeholder slot

**Current Components:**
- `SavedJobsPage` — header + single-column list of JobCard components

**Missing:**
- Filter tabs
- 2-column grid layout
- Followed companies section
- Company logos on cards
- Dedicated card design (uses marketplace JobCard)

**Expected Backend APIs:**
- `GET /job` — loads ALL jobs, filters by saved IDs client-side
- No saved jobs backend endpoint

**Validation:** None (list view)

**Acceptance Criteria:**
1. Filter tabs (All, Active, Expired)
2. 2-column card grid
3. Job cards with proper layout
4. Unsave action on each card
5. Followed companies section (requires backend)
6. Empty state when no saved jobs

**Potential Risks:**
- Loads ALL jobs to filter — doesn't scale
- No backend for saved jobs — client-side only
- No followed companies endpoint

**Regression Risk:** Low — saved jobs is self-contained

---

### 6.7 Notifications Page

**Expected Route:** `/notifications`
**Current Route:** `/notifications` ✓

**Expected Components:**
- Header with `// NOTIFICATIONS` label + Mark All Read button
- Time-grouped notification list (TODAY, YESTERDAY, EARLIER)
- Notification items with: type icon, message, timestamp, metadata tags, action buttons
- Read/unread visual distinction (accent bar, bold text)
- Empty state (INBOX_ZERO)
- Infinite scroll with auto-loading

**Current Components:**
- `NotificationListPage` — header + flat list + Mark All Read + infinite scroll
- `NotificationDrawer` — side panel with same functionality

**Missing:**
- Time-grouped headers (TODAY/YESTERDAY/EARLIER)
- Metadata tags (match scores, etc.)
- Action buttons (VIEW_DETAILS)
- Type-specific icons (shows text labels only)

**Expected Backend APIs:**
- `GET /notifications/user` ✓
- `GET /notifications/user/unread-count` ✓
- `PATCH /notifications/user/read` ✓
- `DELETE /notifications/user/:id` ✓

**Validation:** None (list view)

**Acceptance Criteria:**
1. Time-grouped notification list
2. Read/unread visual distinction
3. Mark all read functionality
4. Individual mark read + delete
5. Infinite scroll
6. Empty state
7. Drawer version for Topbar integration

**Potential Risks:**
- 30s polling for unread count — no WebSocket support
- No notification sound/vibration on mobile

**Regression Risk:** Low — notifications are self-contained

---

### 6.8 Auth Pages (Login, Register, Forgot/Reset Password, Verify Email)

**Current Status:** All auth pages are functional with good design compliance (~75-80%).

**Minor Deviations:**
- Login: `font-masthead-4xl` used for POSTBOARD title — matches Design
- Register: Role selector cards work with proper styling
- All pages use `AuthLayout` with brand panel (PressGrid + gradient bars)
- Password strength meter in register page ✓

**Acceptance Criteria:** All met.

---

## 7. Root Cause Investigation

### 7.1 Complete Candidate Lifecycle Trace

```
Registration (/register)
  └─ RegisterPage → useRegister() → POST /auth/register
       └─ Success → navigate to /verify-email

Email Verification (/verify-email?token=xxx&email=yyy)
  └─ VerifyEmailPage → useVerifyEmail() → GET /auth/verify-email
       └─ Success → "Email verified" + link to /login

Login (/login)
  └─ LoginPage → useLogin() → POST /auth/login
       └─ Success → setAccessToken() → fetchCurrentUser() → navigate to /candidate/dashboard

Session Restore (page refresh)
  └─ AuthInitializer → POST /auth/refresh-token → GET /user/current
       └─ Success → setAccessToken() + setUser()
       └─ Guard beforeLoad fires BEFORE restore → flash-redirect to /login

Dashboard (/candidate/dashboard)
  └─ CandidateDashboardPage
       ├─ useCurrentUser() → GET /user/current
       ├─ useMyApplications() → GET /job/my-applications
       ├─ useProfile() → GET /user/current/profile
       ├─ useUnreadCount() → GET /notifications/user/unread-count
       ├─ useSavedJobsStore() → localStorage
       └─ useJobs() → GET /job (first 5 for "recommended")

Profile (/candidate/profile)
  └─ CandidateProfilePage
       ├─ useCurrentUser() → GET /user/current (for name)
       ├─ useProfile() → GET /user/current/profile
       ├─ useUpdateProfile() → PUT /user/current/profile
       ├─ useUploadResume() → POST /user/current/profile/resume
       └─ useDeleteResume() → DELETE /user/current/profile/resume

Browse Jobs (/jobs)
  └─ JobsMarketplace → useJobs() → GET /job
       └─ JobCard → SavedJobsButton (localStorage toggle)
       └─ JobDetailPage → ApplyModal → useApplyToJob() → POST /job/:id/apply

Applications (/candidate/applications)
  └─ CandidateApplicationsPage → useMyApplications() → GET /job/my-applications
       └─ ApplicationCard → click → /candidate/applications/$applicationId
       └─ WithdrawConfirmDialog → useWithdrawApplication() → DELETE /job/applications/:id

Saved Jobs (/candidate/jobs/saved)
  └─ SavedJobsPage → useJobs() (ALL) + useSavedJobsStore() (localStorage)
       └─ Filter client-side by saved IDs

Notifications (/notifications)
  └─ NotificationListPage → useNotifications() → GET /notifications/user
       ├─ useMarkNotificationsRead() → PATCH /notifications/user/read
       └─ useDeleteNotification() → DELETE /notifications/user/:id

Logout
  └─ UserMenu → useLogout() → POST /auth/logout
       └─ clearAuth() + queryClient.clear() → navigate to /login
```

### 7.2 Identified Issues

| # | Issue | Root Cause | Location | Severity |
|---|-------|-----------|----------|----------|
| 1 | Dashboard is flat stat grid, not bento layout | Implementation predates Design mockups | `CandidateDashboardPage.tsx` | HIGH |
| 2 | No mobile-specific page layouts | Only CandidateLayout mobile tabs exist | All candidate pages | HIGH |
| 3 | Profile missing avatar, work history, phone | Backend has no fields; schema incomplete | `CandidateProfilePage.tsx`, `profileSchema` | HIGH |
| 4 | ApplyModal missing profile card, resume display | Implementation predates Design mockup | `ApplyModal.tsx` | HIGH |
| 5 | SavedJobsPage loads ALL jobs client-side | No backend endpoint; client-side only | `SavedJobsPage.tsx` | MEDIUM |
| 6 | Application detail loads ALL applications | No single-application endpoint | `CandidateApplicationDetailPage.tsx` | MEDIUM |
| 7 | CandidateLayout exists but is unused | Routes use global Sidebar/MobileNav instead | `CandidateLayout.tsx`, route files | MEDIUM |
| 8 | Notifications missing time-grouped headers | Implementation predates Design mockup | `NotificationListPage.tsx` | LOW |
| 9 | No followed companies feature | Backend has no follow endpoint | N/A | LOW (backend-blocked) |
| 10 | No candidate analytics page | No backend endpoint; not in route config | N/A | LOW (backend-blocked) |

---

## 8. Implementation Priority

### Phase 8B — Candidate Pages (Recommended)

**Priority 1: Dashboard Rewrite**
- Rewrite `CandidateDashboardPage` to match Design bento layout
- Hero section, 4 stat tiles with `gap-px bg-rule`, activity timeline, suggested roles
- Integrate `CandidateLayout` into candidate routes
- Mobile: 2×2 stat grid, horizontal scroll companies

**Priority 2: Profile Enhancement**
- Add avatar upload component (requires new backend endpoint)
- Add phone field to schema + form
- Add work history section (requires new backend endpoint)
- Add completeness progress bar
- Mobile: sticky save CTA, full-width avatar

**Priority 3: Apply Modal Enhancement**
- Add profile card (avatar, name, email, verified badge)
- Add resume display with Replace button
- Add character counter (0/1000)
- Add confirmation checkbox
- Mobile: full-screen modal layout

**Priority 4: Applications Enhancement**
- Change filter from dropdown to tabs
- Improve ApplicationCard layout
- Add archive functionality

**Priority 5: Saved Jobs Enhancement**
- Add filter tabs (ALL/ACTIVE/EXPIRED)
- Improve card grid layout
- Note: Backend endpoint needed for server-side persistence

**Priority 6: Notifications Enhancement**
- Add time-grouped headers (TODAY/YESTERDAY/EARLIER)
- Add metadata tags and action buttons
- Add type-specific icons

---

## 9. Documentation Updates Required

| # | Document | Update |
|---|----------|--------|
| 1 | `AI_ENGINEERING_RULES.md` | Add Phase 8A entry to Phase Log |
| 2 | `PROJECT_KNOWLEDGE.md` | Update Candidate section with audit findings |
| 3 | `IMPLEMENTATION_LOG.md` | Add Phase 8A entry |

---

## Appendix A: File Inventory

### Candidate Feature Module
```
src/features/candidate/
├── api/index.ts                    (6L)    — fetchCandidateDashboardStats
├── hooks/index.ts                  (11L)   — useCandidateDashboardStats
├── layout/CandidateLayout.tsx      (97L)   — sidebar + mobile tabs (UNUSED)
├── pages/CandidateDashboardPage.tsx (255L) — main dashboard
└── types/index.ts                  (7L)    — DashboardStats interface
```

### Profile Feature Module
```
src/features/profile/
├── api/index.ts                    (30L)   — fetchProfile, updateProfile, uploadResume, deleteResume
├── components/
│   ├── FileUpload.tsx              (56L)   — generic file upload
│   ├── ProfileFormFields.tsx       (140L)  — form fields (RHF)
│   ├── ResumeSection.tsx           (73L)   — resume upload/delete
│   └── SkillsSection.tsx           (64L)   — skill tag manager
├── hooks/index.ts                  (49L)   — useProfile, useUpdateProfile, useUploadResume, useDeleteResume
├── pages/
│   ├── candidate/CandidateProfilePage.tsx (173L) — candidate profile
│   └── recruiter/RecruiterProfilePage.tsx (136L) — recruiter profile
├── schemas/index.ts                (24L)   — profileSchema, profileUpdateSchema
└── types/index.ts                  (47L)   — Profile, ProfileResponse, etc.
```

### Applications Feature Module
```
src/features/applications/
├── api/index.ts                    (90L)   — getMyApplications, applyToJob, withdrawApplication, etc.
├── components/
│   ├── ApplicationCard.tsx         (76L)   — candidate application card
│   ├── ApplicationStatusBadge.tsx  (28L)   — status badge
│   ├── ApplicationTimeline.tsx     (61L)   — 5-status vertical timeline
│   ├── CandidateDetailDrawer.tsx   (141L)  — recruiter applicant detail
│   ├── KanbanCard.tsx              (69L)   — draggable kanban card
│   ├── KanbanColumn.tsx            (72L)   — kanban column
│   ├── UpdateApplicationStatusDialog.tsx (137L) — recruiter status change
│   └── WithdrawConfirmDialog.tsx   (62L)   — candidate withdraw confirmation
├── hooks/index.ts                  (102L)  — useMyApplications, useApplyToJob, useWithdrawApplication, etc.
├── pages/
│   ├── candidate/CandidateApplicationsPage.tsx (141L) — applications list
│   ├── candidate/CandidateApplicationDetailPage.tsx (214L) — application detail
│   └── recruiter/RecruiterApplicantPipelinePage.tsx (162L) — kanban board
├── types/index.ts                  (105L)  — ApplicationStatus, MyApplicationItem, etc.
└── utils/application-status.ts     (105L)  — status config, state machine, transitions
```

### Notifications Feature Module
```
src/features/notifications/
├── api/index.ts                    (45L)   — fetchUserNotifications, fetchUnreadCount, markNotificationsRead, deleteNotification
├── components/
│   ├── NotificationBell.tsx        (40L)   — bell icon with unread count
│   ├── NotificationDrawer.tsx      (215L)  — side panel notifications
│   └── NotificationsManager.tsx    (17L)   — bell + drawer composition
├── hooks/index.ts                  (46L)   — useNotifications, useUnreadCount, useMarkNotificationsRead, useDeleteNotification
├── pages/NotificationListPage.tsx  (201L)  — full-page notifications
├── types/index.ts                  (72L)   — NotificationType, NotificationItem, etc.
└── utils/
    ├── notificationTypeMap.ts      (34L)   — type to label/color mapping
    └── notificationNavigation.ts   (40L)   — type to route mapping
```

### Saved Jobs
```
src/stores/saved-jobs-store.ts      (24L)   — Zustand persist store (localStorage)
src/features/jobs/components/
├── SavedJobsButton.tsx             (29L)   — toggle button + useSavedJobs hook
├── SavedJobsPage.tsx               (48L)   — saved jobs list page
└── ApplyModal.tsx                  (155L)   — job application dialog
```

### Auth Feature Module
```
src/features/auth/
├── api/index.ts                    (81L)   — loginUser, registerUser, fetchCurrentUser, etc.
├── components/
│   ├── AuthBrandPanel.tsx          (41L)   — brand panel for auth layout
│   ├── AuthErrorBanner.tsx         (26L)   — error alert
│   ├── AuthSubmitButton.tsx        (45L)   — submit button with loading
│   ├── ForgotPasswordPage.tsx      (132L)  — forgot password form
│   ├── LoginPage.tsx               (158L)  — login form
│   ├── RegisterPage.tsx            (273L)  — registration form
│   ├── ResetPasswordPage.tsx       (182L)  — reset password form
│   ├── RoleCard.tsx                (53L)   — role selection card
│   ├── SuccessBanner.tsx           (24L)   — success alert
│   └── VerifyEmailPage.tsx         (751L)  — email verification (multi-state)
├── hooks/index.ts                  (159L)  — useLogin, useRegister, useLogout, useCurrentUser, etc.
├── layout/AuthLayout.tsx           (26L)   — split-screen auth layout
├── schemas/index.ts                (98L)   — loginSchema, registerSchema, etc.
└── types/index.ts                  (97L)   — UserRole, LoginCredentials, etc.
```

### Shared Components
```
src/shared/components/
├── ux/
│   ├── LoadingState.tsx            (54L)   — spinner/skeleton/page variants
│   ├── EmptyState.tsx              (80L)   — empty state with action
│   ├── ErrorState.tsx              (22L)   — error display with retry
│   ├── SearchInput.tsx             (21L)   — search input
│   ├── Breadcrumbs.tsx             (98L)   — auto-breadcrumbs
│   ├── VerificationBadge.tsx       (78L)   — company verification badge
│   └── AccessRestricted.tsx        (59L)   — 403 page
├── dialogs/ConfirmDialog.tsx       (64L)   — confirmation dialog
├── forms/PasswordField.tsx         (226L)  — password with strength meter
├── theme/ThemeToggle.tsx           (40L)   — light/dark/system toggle
├── PressGrid.tsx                   (19L)   — decorative tile grid
└── table/
    ├── DataTable.tsx               (133L)  — generic data table
    ├── TablePagination.tsx         (43L)   — prev/next pagination
    └── TableToolbar.tsx            (38L)   — search + filter toolbar
```

### Route Files
```
src/routes/_authenticated.tsx       — AppShell layout, requireAuth guard
src/routes/_authenticated/candidate/
├── dashboard.tsx                   (8L)    — /candidate/dashboard
├── applications.tsx                (8L)    — /candidate/applications
├── applications/$applicationId.tsx (15L)   — /candidate/applications/$applicationId
├── jobs.tsx                        (7L)    — /candidate/jobs (redirect → /jobs)
├── jobs.saved.tsx                  (8L)    — /candidate/jobs/saved
└── profile.tsx                     (8L)    — /candidate/profile

src/routes/_authenticated/notifications.tsx — /notifications (shared)
src/routes/login.tsx                — /login
src/routes/register.tsx             — /register
src/routes/forgot-password.tsx      — /forgot-password
src/routes/reset-password.tsx       — /reset-password
src/routes/verify-email.tsx         — /verify-email
```
