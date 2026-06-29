# RECRUITER_UI_ARCHITECTURE_REPORT.md

> **Status:** Authoritative engineering blueprint for Phase 9B implementation
>
> **Generated:** Phase 9A — Recruiter Experience UI Architecture, UX & Workflow Audit
>
> **Scope:** All recruiter-facing functionality — Dashboard, Job Management, Candidate Management, Pipeline, Analytics, Notifications, Profile, Company, Navigation

---

## 1. Executive Summary

### Overall Recruiter Experience Quality: **~45% Design Fidelity**

The recruiter experience has functional pages with real backend integration, but significant Design deviations, broken navigation, dead code, and missing features. The `RecruiterLayout` (115 lines) is completely unused — all routes render inside the global `AppShell`. Three shared components (`FilterToolbar`, `AnalyticsCard`, `ActionMenu`) are defined but never consumed. The application detail page has a blocking data-fetching bug (empty jobId). The job management table shows hardcoded placeholder data for applicant counts.

### Key Strengths
- All 12 routes are protected with `requireRole(["RECRUITER"])`
- Backend integration is real (no mock data) across all pages
- Kanban pipeline with drag-and-drop is implemented
- Job CRUD (create, edit, status toggle) works end-to-end
- Backend tenant isolation is comprehensive (`authorizeCompany` + `permissions.ts`)

### Key Weaknesses
- `RecruiterLayout` is dead code — no recruiter-specific sidebar/navigation
- "Applicants" nav link duplicates "Jobs" link (both point to `/recruiter/jobs`)
- Analytics route exists but is missing from Sidebar/MobileNav
- Application detail page broken (passes empty string to `useJobApplications`)
- Job management table shows "—" for applicant count (hardcoded)
- No Talent Pool / Candidate CRM page (Design mockups exist)
- No mobile-specific layouts (Design shows mobile mockups for all pages)
- No search/filter on job management page

---

## 2. Design Coverage Matrix

### Recruiter Design Mockups (14 total)

| # | Mockup | Design File | Implementation | Fidelity | Notes |
|---|--------|-------------|----------------|----------|-------|
| 1 | Dashboard Desktop | `recruiter_dashboard_overview/code.html` | `RecruiterDashboardPage.tsx` | **~50%** | Missing: 3×2 stat grid (has 5 stats, Design shows 6), pipeline health bar chart, recent activity feed with color-coded dots, market trends widget, press-grid decorations |
| 2 | Dashboard Mobile | `recruiter_dashboard_mobile_view/code.html` | (uses global MobileNav) | **~20%** | Missing: 2×2 stat grid with trend indicators, quick actions section, card-based recent activity, bottom nav with 5 tabs |
| 3 | Job Management Desktop | `recruiter_job_management/code.html` | `RecruiterJobManagement.tsx` | **~40%** | Missing: filter tabs (All/Active/Draft/Closed/Archived), three-dot action menu, search, proper pagination (prev/next), status badges matching Design |
| 4 | Job Management Mobile | `recruiter_job_management_mobile_view/code.html` | (no mobile layout) | **~0%** | Missing: card-based job list, FAB for quick creation, status badges with color-coded backgrounds, bottom nav |
| 5 | Job Post Form Mobile | `job_post_form_mobile_view/code.html` | `CreateJobPage.tsx` (desktop only) | **~30%** | Missing: sticky header/footer, form sections with `// SECTION_NAME` headers, requirements checklist, visibility radio cards, salary toggle switch |
| 6 | Job Post Edit Form Desktop | `job_post_edit_form/code.html` | `EditJobPage.tsx` | **~45%** | Missing: 2-column form grid, visibility card selector (Public/Unlisted/Draft), company name field, toggle switch for salary |
| 7 | Talent Pool Desktop | `recruiter_talent_pool/code.html` | (NOT IMPLEMENTED) | **~0%** | No page exists. Design shows: candidate grid with avatar/name/title/skills, filter bar with search + role + skills, "Move to Pipeline" action, Export CSV |
| 8 | Talent Pool Mobile | `recruiter_talent_pool_mobile_view/code.html` | (NOT IMPLEMENTED) | **~0%** | No page exists. Design shows: collapsible filter bottom sheet, card stack, FAB, bottom nav |
| 9 | Pipeline Mobile | `recruiter_pipeline_mobile_view/code.html` | `RecruiterApplicantPipelinePage.tsx` (desktop kanban only) | **~25%** | Missing: LIST/KANBAN toggle, stage navigation with counts, search/filter bar, card-based list view, FAB |
| 10 | Pipeline Kanban Desktop | `applicant_pipeline_kanban_view/code.html` | `RecruiterApplicantPipelinePage.tsx` | **~60%** | Has kanban columns with drag-and-drop. Missing: column header menus, ghost "Add Candidate" buttons, candidate rating badges, match percentages, proper card layout |
| 11 | Analytics Desktop | `recruiter_analytics_dashboard/code.html` | `RecruiterAnalyticsPage.tsx` | **~35%** | Missing: date range toggle (7d/30d/90d/Custom), conversion funnel chart, application volume line chart, top performing jobs table, export CSV |
| 12 | Analytics Mobile | `recruiter_analytics_mobile_view/code.html` | (no mobile layout) | **~0%** | Missing: date filter pills, 2×2 stat grid, vertical funnel bars, stacked job cards, press-grid decoration |
| 13 | Candidate Detail Desktop | `candidate_detail_drawer/code.html` | `CandidateDetailDrawer.tsx` | **~50%** | Has right drawer with candidate info. Missing: contact grid, skills chips, application notes textarea, pipeline stage selector, evaluation metric heatmap, "Send to Offer" / "Reject" actions |
| 14 | Candidate Detail Mobile | `candidate_detail_mobile_drawer/code.html` | (no mobile layout) | **~0%** | Missing: bottom sheet drawer, tappable contact rows, dossier blockquote, resume preview, "Move Stage" / "Reject" sticky buttons |

### Related Design Mockups (Company Profile — used by recruiters)

| # | Mockup | Design File | Implementation | Fidelity | Notes |
|---|--------|-------------|----------------|----------|-------|
| 15 | Company Profile Desktop | `company_profile_page/code.html` | `CompanyManagementPage.tsx` | **~40%** | Missing: hero section with company name/logo/metadata, stats bar, about us section, open roles filter tabs, culture metrics, technical stack, leadership cards |
| 16 | Company Profile Mobile | `company_profile_page_mobile_view/code.html` | (no mobile layout) | **~0%** | Missing: centered hero, FOLLOW/FOLLOWING toggle, stats dividers, culture blockquote, animated bar |

### Overall Design Fidelity: **~45%** (weighted by page importance)

---

## 3. Backend Integration Matrix

### Recruiter-Specific Endpoints

| Endpoint | Method | Frontend Function | Hook | Used By | Status |
|----------|--------|-------------------|------|---------|--------|
| `GET /company/current/recruiters/:id/analytics` | GET | `fetchRecruiterAnalytics` | `useRecruiterAnalytics` | `RecruiterAnalyticsPage` | **Working** |
| `GET /notifications/company` | GET | `fetchRecruiterNotifications` | `useRecruiterNotifications` | `RecruiterNotificationsPage` | **Working** |
| `PATCH /notifications/company/:id/read` | PATCH | `markNotificationRead` | `useMarkNotificationRead` | `RecruiterNotificationsPage` | **Working** |
| `POST /notifications/company/read` | POST | `markAllNotificationsRead` | `useMarkAllNotificationsRead` | `RecruiterNotificationsPage` | **Working** |

### Job Endpoints (Shared with Candidate)

| Endpoint | Method | Frontend Function | Hook | Used By (Recruiter) | Status |
|----------|--------|-------------------|------|---------------------|--------|
| `GET /job` | GET | `listJobs` | `useJobs` | Dashboard, Job Management | **Working** (see bug: no companyId filter on management page) |
| `GET /job/:id` | GET | `getJob` | `useJob` | Job Detail, Edit Job | **Working** |
| `POST /job` | POST | `createJob` | `useCreateJob` | Create Job Page | **Working** |
| `PATCH /job/:id` | PATCH | `updateJob` | `useUpdateJob` | Edit Job Page | **Working** |
| `PATCH /job/:id/status` | PATCH | `updateJobStatus` | `useUpdateJobStatus` | Job Detail, Job Management | **Working** |
| `DELETE /job/:id` | DELETE | `deleteJob` | `useDeleteJob` | Job Management | **Working** (ADMIN only backend) |

### Application Endpoints (Shared with Candidate)

| Endpoint | Method | Frontend Function | Hook | Used By (Recruiter) | Status |
|----------|--------|-------------------|------|---------------------|--------|
| `GET /job/:jobId/applications` | GET | `getJobApplications` | `useJobApplications` | Job Detail, Pipeline, App Detail | **BUGGY** — App Detail passes empty string |
| `PATCH /job/applications/:id/status` | PATCH | `updateApplicationStatus` | `useUpdateApplicationStatus` | Pipeline, App Detail | **Working** |

### Profile & Company Endpoints (Shared)

| Endpoint | Method | Frontend Function | Hook | Used By (Recruiter) | Status |
|----------|--------|-------------------|------|---------------------|--------|
| `GET /user/current` | GET | (auth hook) | `useCurrentUser` | Dashboard, Analytics, Profile | **Working** |
| `GET /user/current/profile` | GET | `fetchProfile` | `useProfile` | Profile Page | **Working** |
| `PUT /user/current/profile` | PUT | `updateProfile` | `useUpdateProfile` | Profile Page | **Working** |
| `GET /company/current` | GET | `fetchCurrentCompany` | `useCurrentCompany` | Dashboard, Analytics, Company | **Working** |

### Missing Backend Endpoints (Design requires, backend doesn't have)

| Feature | Design Reference | Backend Status | Impact |
|---------|-----------------|----------------|--------|
| Talent Pool / Candidate CRM | `recruiter_talent_pool/` | No dedicated endpoint | Cannot implement Talent Pool page |
| Follow/Unfollow Company | `company_profile_page_following_state/` | No `POST /company/:id/follow` | Cannot implement follow functionality |
| Candidate Analytics | `recruiter_analytics_dashboard/` (line chart, funnel) | Partial — has `GET /company/current/recruiters/:id/analytics` but limited data | Cannot show conversion funnel or volume chart |
| Notification Unread Count | Bell badge in TopBar | `GET /notifications/company/unread` exists but no frontend hook | Cannot show unread badge |
| Job Duplication | Three-dot menu "Duplicate" | No `POST /job/:id/duplicate` | Cannot implement duplicate action |

---

## 4. Security Findings

### Multi-Tenant Isolation

| Check | Status | Evidence |
|-------|--------|----------|
| Recruiter can only access own company data | **PASS** (backend) | `authorizeCompany` middleware validates `user.companyId` matches target |
| Recruiter can only manage jobs they posted | **PASS** (backend) | `canManageJob()` checks `job.postedById === actor.id` |
| Cross-tenant job access blocked | **PASS** (backend) | `GET /job` is public but only shows published jobs; mutations require `authorizeCompany` |
| Cross-tenant application access blocked | **PASS** (backend) | `canManageApplication()` checks `application.job.companyId === actor.companyId` |
| Role-based route guards on all routes | **PASS** (frontend) | All 12 recruiter routes use `requireRole(["RECRUITER"])` |

### Security Concerns

| # | Finding | Severity | Location |
|---|---------|----------|----------|
| 1 | **Self-registration as RECRUITER for any company** — User can provide any companyId during registration; no invitation required | HIGH | `auth/schemas/index.ts:59`, `RegisterPage.tsx:269-290` |
| 2 | **No CSRF protection** — State-changing operations lack CSRF tokens | HIGH | Backend architecture |
| 3 | **Guard timing race on page refresh** — `beforeLoad` fires before `AuthInitializer`, causing login page flash | MEDIUM | `guards/auth-guards.ts:20-27` |
| 4 | **No graceful UX when recruiter has no company** — `authorizeCompany` returns 403 but frontend shows generic error | MEDIUM | `RecruiterDashboardPage.tsx` |
| 5 | **Job management loads all jobs** — `RecruiterJobManagement` uses `useJobs({ status: "" })` without company filtering | LOW | `RecruiterJobManagement.tsx` |

### Security Strengths

| # | Strength |
|---|----------|
| 1 | Access tokens in-memory only (Zustand, never localStorage) |
| 2 | httpOnly refresh tokens (cookie-based) |
| 3 | Automatic token refresh with queue pattern (prevents stampede) |
| 4 | Backend `authorizeCompany` middleware on all company-scoped endpoints |
| 5 | Backend `canManageJob` requires job poster ownership for recruiters |
| 6 | UUID validation on all backend route parameters |
| 7 | Proper logout with full cache clearing |

---

## 5. Component Inventory

### Shared Recruiter Components (`src/shared/components/recruiter/`)

| Component | File | Used By | Status |
|-----------|------|---------|--------|
| `StatisticsGrid` | `StatisticsGrid.tsx` | Dashboard, Analytics | **Used** |
| `StatusBadge` | `StatusBadge.tsx` | Job Detail | **Used** |
| `TablePaginationFooter` | `TablePaginationFooter.tsx` | Notifications | **Used** |
| `FilterToolbar` | `FilterToolbar.tsx` | **NONE** | **UNUSED** |
| `AnalyticsCard` | `AnalyticsCard.tsx` | **NONE** | **UNUSED** |
| `ActionMenu` | `ActionMenu.tsx` | **NONE** | **UNUSED** |
| `SearchInput` | `SearchInput.tsx` | FilterToolbar (indirectly) | **Indirectly used** |

### Shared Application Components (`src/shared/components/`)

| Component | Used By (Recruiter) |
|-----------|---------------------|
| `ApplicationStatusBadge` | Application Detail |
| `ApplicationTimeline` | Application Detail |
| `ConfirmDialog` | Application Detail (reject confirmation) |
| `EmptyState` | Dashboard, Notifications |
| `ErrorState` | Dashboard, Job Detail, Analytics |
| `LoadingState` | (not used — pages use custom skeletons) |

### Feature Components (Recruiter-Specific)

| Component | File | Used By |
|-----------|------|---------|
| `RecruiterDashboardPage` | `features/recruiter/pages/` | Dashboard route |
| `RecruiterJobDetailPage` | `features/recruiter/pages/` | Job detail route |
| `RecruiterApplicationDetailPage` | `features/recruiter/pages/` | Application detail route |
| `RecruiterNotificationsPage` | `features/recruiter/pages/` | Notifications route |
| `RecruiterAnalyticsPage` | `features/recruiter/pages/` | Analytics route |
| `RecruiterJobManagement` | `features/jobs/components/` | Job management route |
| `CreateJobPage` | `features/jobs/components/` | Job create route |
| `EditJobPage` | `features/jobs/components/` | Job edit route |
| `RecruiterApplicantPipelinePage` | `features/applications/pages/recruiter/` | Pipeline route |
| `CandidateDetailDrawer` | `features/applications/components/` | Pipeline (card click) |
| `KanbanBoard` / `KanbanColumn` / `KanbanCard` | `features/applications/components/` | Pipeline |
| `RecruiterProfilePage` | `features/profile/pages/recruiter/` | Profile route |
| `CompanyManagementPage` | `features/company/pages/` | Company route |
| `RecruiterLayout` | `features/recruiter/layout/` | **DEAD CODE** (never imported) |

### Duplicate Components

| Component | Locations | Issue |
|-----------|-----------|-------|
| `StatusBadge` | `shared/components/recruiter/StatusBadge.tsx`, `features/applications/components/ApplicationStatusBadge.tsx` | Overlapping functionality |
| `SearchInput` | `shared/components/recruiter/SearchInput.tsx`, `shared/components/candidate/EnhancedJobFilters.tsx` (inline) | Duplicate search patterns |
| `Notification hooks` | `features/recruiter/hooks/`, `features/company/hooks/`, `features/notifications/hooks/` | 3 implementations for different notification endpoints |
| `ApplicationStatus` type | `features/jobs/types/`, `features/applications/types/`, `features/recruiter/types/` | Defined in 3 places |

---

## 6. UX Findings

### Navigation

| Issue | Severity | Location |
|-------|----------|----------|
| "Applicants" nav link duplicates "Jobs" (both → `/recruiter/jobs`) | **HIGH** | `Sidebar.tsx:34`, `MobileNav.tsx:29` |
| Analytics route missing from Sidebar/MobileNav | **MEDIUM** | `Sidebar.tsx`, `MobileNav.tsx` |
| Pipeline route missing from Sidebar/MobileNav | **MEDIUM** | `Sidebar.tsx`, `MobileNav.tsx` |
| Notifications link goes to `/notifications` (shared) not `/recruiter/notifications` | **MEDIUM** | `Sidebar.tsx:37`, `MobileNav.tsx:32` |
| Sidebar uses exact-match active detection (sub-routes don't highlight parent) | **LOW** | `Sidebar.tsx:80` |
| No breadcrumbs on any recruiter page | **LOW** | All recruiter pages |

### Job Creation Flow

| Step | Status | Issue |
|------|--------|-------|
| Navigate to Create Job | **Working** | Via Dashboard quick action or "+ New Job" button |
| Fill form fields | **Working** | RHF + Zod validation |
| Select tags | **Working** | Tags fetched from API |
| Submit | **Working** | `useCreateJob` mutation |
| Redirect to job list | **Working** | Navigates to `/recruiter/jobs` |
| **Missing:** Visibility selector (Public/Unlisted/Draft) | **HIGH** | Design shows 3-option card selector; implementation has no visibility field |
| **Missing:** Salary toggle (show publicly) | **MEDIUM** | Design shows toggle switch |
| **Missing:** Requirements checklist | **MEDIUM** | Design shows checkbox list with "Add Requirement" |
| **Missing:** Loading skeleton during tag fetch | **LOW** | Form renders before tags load |

### Candidate Review Experience

| Step | Status | Issue |
|------|--------|-------|
| View pipeline kanban | **Working** | Drag-and-drop columns |
| Click candidate card | **Working** | Opens `CandidateDetailDrawer` |
| View candidate info | **Partial** | Missing skills chips, contact grid, evaluation heatmap |
| Update application status | **Working** | Status transition buttons |
| Reject with reason | **Working** | Modal with textarea |
| **Missing:** Application notes | **MEDIUM** | Design shows auto-saved notes textarea |
| **Missing:** Resume preview in drawer | **MEDIUM** | Design shows PDF preview image |
| **Missing:** Pipeline stage selector dropdown | **MEDIUM** | Design shows dropdown in drawer |

### Mobile Experience

| Page | Mobile Status | Issue |
|------|--------------|-------|
| Dashboard | **No mobile layout** | Uses global MobileNav only |
| Job Management | **No mobile layout** | Table doesn't collapse to cards |
| Create Job | **No mobile layout** | Form works but no sticky footer |
| Job Detail | **No mobile layout** | Two-column doesn't stack |
| Pipeline | **No mobile layout** | Kanban doesn't switch to list view |
| Application Detail | **No mobile layout** | Two-column doesn't stack |
| Analytics | **No mobile layout** | Stats grid doesn't adapt |
| Notifications | **No mobile layout** | List works but no time groups |
| Profile | **No mobile layout** | Form works but no sticky save |
| Company | **No mobile layout** | Form works but minimal |

---

## 7. Engineering Blueprint

### 7.1 Dashboard Page

**Route:** `/recruiter/dashboard`
**Files:**
- `src/routes/_authenticated/recruiter/dashboard.tsx` (route)
- `src/features/recruiter/pages/RecruiterDashboardPage.tsx` (page)

**Current Implementation:**
- Welcome header with user's first name
- `StatisticsGrid` with 5 stats (Total Jobs, Open, Closed, Drafts, Applications)
- Quick Actions grid (3 cards)
- Recent Jobs list (top 5)

**Design Target (`recruiter_dashboard_overview/code.html`):**
- Mono-label breadcrumb `// recruiter_overview`
- Greeting with Playfair Display 32px
- Two CTAs: "Post New Role" (primary) + "View All Applicants" (outlined)
- 3×2 stat grid (6 tiles): Active Jobs, Total Applicants, New This Week, Avg Time to Hire, Hired (30d), Pipeline Health (stacked bar)
- Recent Activity feed (4 events with color-coded dots) + Market Trends widget (mini bar chart)
- Press-grid decorative backgrounds

**Reusable Components:**
- `StatisticsGrid` (existing, needs 6-tile variant)
- `EmptyState`, `ErrorState` (existing)

**Backend APIs:**
- `GET /user/current` (user data)
- `GET /company/current` (company data)
- `GET /job?companyId=...` (jobs list)
- `GET /job/:jobId/applications` (application counts)

**Acceptance Criteria:**
- [ ] 3×2 stat grid with 6 tiles matching Design
- [ ] Pipeline Health stacked bar chart (Recharts, lazy-loaded)
- [ ] Recent Activity feed with color-coded event dots
- [ ] Market Trends mini bar chart widget
- [ ] Press-grid decorative background
- [ ] Mobile: 2×2 stat grid + quick actions + card-based activity

**Security:** Requires `requireRole(["RECRUITER"])`. Data scoped to user's companyId.

---

### 7.2 Job Management Page

**Route:** `/recruiter/jobs`
**Files:**
- `src/routes/_authenticated/recruiter/jobs.tsx` (route)
- `src/features/jobs/components/RecruiterJobManagement.tsx` (page)

**Current Implementation:**
- HTML `<table>` with columns: Title, Status, Level, Type, Applicants, Posted, Actions
- Actions: Edit link, Close/Reopen toggle, Delete dialog
- No search, no filter tabs, hardcoded "—" for applicant count

**Design Target (`recruiter_job_management/code.html`):**
- `// my_jobs` mono-label + "My Jobs" headline + "+ Post New Role" CTA
- Filter tabs: All (active), Active, Draft, Closed, Archived (border-b-2 indicator)
- 7-column data table: Role Title, Status, Applicants, Views, Deadline, Posted, Actions
- Status badges: `[OPEN]` green, `[DRAFT]` dashed, `[CLOSED]` line-through
- Three-dot action menu: Edit, View Applicants, Duplicate, Close Role, Delete
- Prev/Next pagination with "Page X of Y"

**Reusable Components:**
- `StatusBadge` (existing, needs status-specific variants)
- `FilterToolbar` (existing, unused — adopt for filter tabs)
- `ActionMenu` (existing, unused — adopt for three-dot menu)
- `SearchInput` (existing, adopt for search)
- `TablePaginationFooter` (existing, adopt for pagination)

**Backend APIs:**
- `GET /job?companyId=...&status=...&cursor=...` (filtered job list)
- `PATCH /job/:id/status` (status toggle)
- `DELETE /job/:id` (delete, ADMIN only)

**Acceptance Criteria:**
- [ ] Filter tabs: All / Active / Draft / Closed / Archived with count badges
- [ ] Search input for job title filtering
- [ ] Three-dot action menu per row (Edit, View Applicants, Duplicate, Close, Delete)
- [ ] Applicant count from `_count.applications` (not hardcoded "—")
- [ ] Status badges matching Design (OPEN green, DRAFT dashed, CLOSED dim)
- [ ] Prev/Next pagination
- [ ] Links to `/recruiter/jobs/$jobId` (not public `/jobs/$jobId`)
- [ ] Mobile: card-based job list with FAB

**Security:** Requires `requireRole(["RECRUITER"])`. Backend `canManageJob` enforces poster ownership.

---

### 7.3 Create Job Page

**Route:** `/recruiter/jobs/create`
**Files:**
- `src/routes/_authenticated/recruiter/jobs.create.tsx` (route)
- `src/features/jobs/components/CreateJobPage.tsx` (page)

**Current Implementation:**
- RHF + Zod form with fields: title, description, location, locationType, experienceLevel, salaryMin, salaryMax, expiresAt, tags
- Submit creates job and navigates to `/recruiter/jobs`

**Design Target (`job_post_form_mobile_view/code.html`, `job_post_edit_form/code.html`):**
- `// JOB_ENTRY_SYSTEM` mono-label + "Draft: [Title]" headline
- Form sections with `// SECTION_NAME` headers: basics, description, compensation, visibility
- Requirements checklist with checkboxes + "Add Requirement" action
- Visibility selector: Public / Unlisted / Draft (3 card options with icons)
- Salary toggle: "Show salary publicly"
- Sticky footer: Save Draft + Publish Role

**Reusable Components:**
- `PasswordField` pattern (for form field styling)
- `AuthErrorBanner` (existing, for API errors)

**Backend APIs:**
- `POST /job` (create job)
- `GET /tags` (tag list for multi-select)

**Acceptance Criteria:**
- [ ] Form sections with `// SECTION_NAME` mono-label headers
- [ ] Visibility selector (Public / Unlisted / Draft) as 3 card options
- [ ] Salary visibility toggle switch
- [ ] Requirements checklist with add/remove
- [ ] Sticky footer with Save Draft + Publish Role buttons
- [ ] Mobile: single-column form with sticky footer

**Security:** Requires `requireRole(["RECRUITER"])`. Backend `authorizeCompany` sets companyId from JWT.

---

### 7.4 Job Detail Page

**Route:** `/recruiter/jobs/$jobId`
**Files:**
- `src/routes/_authenticated/recruiter/jobs.$jobId.tsx` (route)
- `src/features/recruiter/pages/RecruiterJobDetailPage.tsx` (page)

**Current Implementation:**
- Back link, job title, status toggle, edit link
- 4-stat grid: Status, Applications, Pending Review, Shortlisted
- Two-column: description + recent applicants | details sidebar + tags + company

**Design Target:** No dedicated Design mockup for recruiter job detail. Current layout is reasonable.

**Acceptance Criteria:**
- [ ] Status toggle (OPEN↔CLOSED, DRAFT→OPEN)
- [ ] Application counts with status breakdown
- [ ] Recent applicants list with "View all" link
- [ ] Edit link to `/recruiter/jobs/$jobId/edit`
- [ ] Company info sidebar
- [ ] Mobile: stacked single-column layout

**Security:** Requires `requireRole(["RECRUITER"])`. Backend `canManageJob` enforces poster ownership.

---

### 7.5 Pipeline Page (Kanban)

**Route:** `/recruiter/jobs/$jobId/applications`
**Files:**
- `src/routes/_authenticated/recruiter/jobs.$jobId.applications.tsx` (route)
- `src/features/applications/pages/recruiter/RecruiterApplicantPipelinePage.tsx` (page)
- `src/features/applications/components/CandidateDetailDrawer.tsx` (drawer)
- `src/features/applications/components/KanbanBoard.tsx`, `KanbanColumn.tsx`, `KanbanCard.tsx`

**Current Implementation:**
- Kanban board with 5 columns (PENDING, REVIEWED, SHORTLISTED, REJECTED, ACCEPTED)
- Drag-and-drop between columns
- `CandidateDetailDrawer` on card click
- `UpdateApplicationStatusDialog` for status transitions

**Design Target (`applicant_pipeline_kanban_view/code.html`, `recruiter_pipeline_mobile_view/code.html`):**
- `// applicant_pipeline` + "Pipeline" headline + List/Kanban toggle
- 5 columns: APPLIED, REVIEWING, INTERVIEW, OFFER, HIRED (different statuses from current)
- Column header menus (more_vert)
- Candidate cards with: avatar, name, title, applied date, rating badge, match percentage
- Ghost "Add Candidate" buttons per column
- Mobile: LIST/KANBAN toggle, horizontal stage nav with counts, card-based list view

**Reusable Components:**
- `KanbanBoard`, `KanbanColumn`, `KanbanCard` (existing)
- `CandidateDetailDrawer` (existing)
- `ApplicationStatusBadge` (existing)

**Backend APIs:**
- `GET /job/:jobId/applications` (application list)
- `PATCH /job/applications/:id/status` (status update)

**Acceptance Criteria:**
- [ ] LIST/KANBAN view toggle
- [ ] Column stages: APPLIED, REVIEWING, INTERVIEW, OFFER, HIRED
- [ ] Column header counts and menus
- [ ] Candidate cards with avatar, name, title, applied date
- [ ] Match percentage display
- [ ] Rating badges
- [ ] Ghost "Add Candidate" buttons
- [ ] Mobile: horizontal stage nav + card-based list view

**Security:** Requires `requireRole(["RECRUITER"])`. Backend `canManageApplication` checks company.

---

### 7.6 Application Detail Page

**Route:** `/recruiter/applications/$applicationId`
**Files:**
- `src/routes/_authenticated/recruiter/applications.$applicationId.tsx` (route)
- `src/features/recruiter/pages/RecruiterApplicationDetailPage.tsx` (page)

**Current Implementation:**
- **BUG:** Passes empty string to `useJobApplications("")` — page always shows "Application not found"
- Back link, candidate name, status transition buttons
- Two-column: candidate info + cover letter + resume | timeline + details + rejection reason

**Design Target (`candidate_detail_drawer/code.html`):**
- Right drawer (480px) with: contact grid, skills chips, application notes, pipeline stage selector, evaluation metric heatmap
- Footer actions: "Send to Offer" + "Reject" + "Schedule Next Round"

**Reusable Components:**
- `ApplicationStatusBadge`, `ApplicationTimeline` (existing)
- `ConfirmDialog` (existing)

**Backend APIs:**
- `GET /job/:jobId/applications` (needs valid jobId — current bug)
- `PATCH /job/applications/:id/status` (status update)

**Acceptance Criteria:**
- [ ] **FIX BUG:** Pass valid jobId to `useJobApplications` (or create single-application endpoint)
- [ ] Candidate info with skills chips
- [ ] Application notes textarea (auto-saved)
- [ ] Pipeline stage selector dropdown
- [ ] "Send to Offer" / "Reject" actions
- [ ] Mobile: bottom sheet layout

**Security:** Requires `requireRole(["RECRUITER"])`. Backend `canManageApplication` checks company.

---

### 7.7 Analytics Page

**Route:** `/recruiter/analytics`
**Files:**
- `src/routes/_authenticated/recruiter/analytics.tsx` (route)
- `src/features/recruiter/pages/RecruiterAnalyticsPage.tsx` (page)

**Current Implementation:**
- Title with company name
- `StatisticsGrid` with 4 stats
- 4 individual metric cards
- Recent Activity list

**Design Target (`recruiter_analytics_dashboard/code.html`):**
- `// hiring_intelligence` + "Analytics" headline + date range toggle (7d/30d/90d/Custom)
- 4-column stat row: Applications Received, Avg Days to Hire, Offer Accept Rate, Pipeline Velocity
- Conversion Funnel (5 horizontal bars with progressive opacity)
- Application Volume line chart (SVG polyline)
- Top Performing Jobs table with conversion % progress bars
- Export CSV button
- Live Intelligence Feed log panel

**Reusable Components:**
- `StatisticsGrid` (existing)
- Recharts (lazy-loaded) for funnel and line chart

**Backend APIs:**
- `GET /company/current/recruiters/:id/analytics` (limited data — may need extension)

**Acceptance Criteria:**
- [ ] Date range toggle (7d / 30d / 90d / Custom)
- [ ] 4-column stat row with trend indicators
- [ ] Conversion funnel chart (Recharts horizontal bar)
- [ ] Application volume line chart (Recharts line)
- [ ] Top Performing Jobs table with conversion bars
- [ ] Export CSV button
- [ ] Mobile: 2×2 stat grid, vertical funnel, stacked cards

**Security:** Requires `requireRole(["RECRUITER"])`. Backend `canViewRecruiterAnalytics` restricts to own data.

---

### 7.8 Talent Pool Page (NOT IMPLEMENTED)

**Route:** `/recruiter/talent-pool` (does not exist)
**Files:** None

**Design Target (`recruiter_talent_pool/code.html`):**
- `// talent_pool` + "Talent Pool" headline + Export CSV + "+ Add Candidate" buttons
- Sticky filter bar: search + role filter + skills chips
- 2-column candidate grid: avatar, name, title, location, skills chips, source, "View Full Profile" link, "Move to Pipeline" dropdown
- Empty state with 3×2 press-grid tiles

**Backend APIs:** No dedicated Talent Pool endpoint. Would need `GET /job/applications` aggregated across jobs.

**Acceptance Criteria:** Depends on backend providing a Talent Pool endpoint.

**Security:** Would require `authorizeCompany` scoping.

---

### 7.9 Notifications Page

**Route:** `/recruiter/notifications`
**Files:**
- `src/routes/_authenticated/recruiter/notifications.tsx` (route)
- `src/features/recruiter/pages/RecruiterNotificationsPage.tsx` (page)

**Current Implementation:**
- Header with "Mark All Read" button
- Notification list with unread indicator, title, message, timestamp
- Cursor-based pagination

**Design Target:** No dedicated Design mockup for recruiter notifications. Shared notification patterns apply.

**Acceptance Criteria:**
- [ ] Time-grouped headers (TODAY / YESTERDAY / EARLIER) — match candidate notification pattern
- [ ] Unread count badge in TopBar
- [ ] Mark All Read functionality
- [ ] Individual read/delete actions

**Security:** Requires `requireRole(["RECRUITER"])`. Backend scopes to company.

---

### 7.10 Profile Page

**Route:** `/recruiter/profile`
**Files:**
- `src/routes/_authenticated/recruiter/profile.tsx` (route)
- `src/features/profile/pages/recruiter/RecruiterProfilePage.tsx` (page)

**Current Implementation:**
- Company association badge
- RHF + Zod form: firstName, lastName, bio, location, linkedinUrl, githubUrl
- Save Changes button

**Design Target:** No dedicated Design mockup for recruiter profile. Uses shared profile patterns.

**Acceptance Criteria:**
- [ ] Loading skeleton (not plain text)
- [ ] Error state using `ErrorState` component
- [ ] Phone field (if backend supports)
- [ ] Website URL field
- [ ] Completeness progress bar

**Security:** Requires `requireRole(["RECRUITER"])`. Profile scoped to user.

---

### 7.11 Company Page

**Route:** `/recruiter/company`
**Files:**
- `src/routes/_authenticated/recruiter/company.tsx` (route)
- `src/features/company/pages/CompanyManagementPage.tsx` (page)

**Current Implementation:**
- Company header with name
- `CompanyLogoUpload` component
- Company information form
- Team section

**Design Target (`company_profile_page/code.html`):**
- Hero section with logo, company name (Playfair 96px), industry, size
- Stats bar: Team Strength, Established, HQ Coordinates
- About Us section with hero image
- Open Roles with filter tabs
- Sidebar: Culture Metrics (progress bars), Technical Stack (chips), Leadership cards

**Acceptance Criteria:**
- [ ] Loading skeleton (not plain text)
- [ ] Hero section with company branding
- [ ] Stats bar with company metrics
- [ ] Open Roles section with filter tabs
- [ ] Culture Metrics progress bars
- [ ] Technical Stack chips
- [ ] Mobile: centered hero, single-column layout

**Security:** Requires `requireRole(["RECRUITER"])`. Company scoped to user's companyId.

---

## 8. Feature Completeness Matrix

| Feature | UI | Backend | Integrated | Tested | Missing |
|---------|-----|---------|------------|--------|---------|
| Dashboard | △ Partial | ✓ Complete | ✓ Working | ✗ No | Pipeline health chart, market trends, activity feed |
| Job Management | △ Partial | ✓ Complete | △ Partial | ✗ No | Filter tabs, search, action menu, applicant count |
| Create Job | △ Partial | ✓ Complete | ✓ Working | ✗ No | Visibility selector, salary toggle, requirements checklist |
| Edit Job | △ Partial | ✓ Complete | ✓ Working | ✗ No | Same as Create Job |
| Job Detail | ✓ Good | ✓ Complete | ✓ Working | ✗ No | — |
| Pipeline (Kanban) | ✓ Good | ✓ Complete | ✓ Working | ✗ No | List/Kanban toggle, match %, rating badges |
| Application Detail | ✗ Broken | ✓ Complete | ✗ Broken | ✗ No | **BUG: empty jobId** |
| Analytics | △ Partial | △ Partial | ✓ Working | ✗ No | Funnel chart, line chart, top jobs table |
| Talent Pool | ✗ Missing | ✗ Missing | ✗ Missing | ✗ No | Entire feature |
| Notifications | ✓ Good | ✓ Complete | ✓ Working | ✗ No | Time groups, unread badge |
| Profile | △ Partial | ✓ Complete | ✓ Working | ✗ No | Loading skeleton, completeness bar |
| Company | △ Partial | ✓ Complete | ✓ Working | ✗ No | Hero, stats, culture, tech stack |
| Mobile Layouts | ✗ Missing | — | — | ✗ No | All pages |

---

## 9. End-to-End Recruiter Journey Validation

### Happy Path: Recruiter creates job and reviews applicants

| Step | Action | Status | Issue |
|------|--------|--------|-------|
| 1 | Recruiter registers | ⚠️ | Self-registration allows any companyId — security concern |
| 2 | Recruiter logs in | ✓ | Works — redirects to `/recruiter/dashboard` |
| 3 | Dashboard loads | ✓ | Shows stats, quick actions, recent jobs |
| 4 | Navigate to Job Management | ⚠️ | "Applicants" link broken; Analytics missing from nav |
| 5 | Click "+ Post New Job" | ✓ | Opens Create Job form |
| 6 | Fill form and submit | ✓ | Job created, navigates to job list |
| 7 | Job appears in list | ⚠️ | Applicant count shows "—" (hardcoded) |
| 8 | Click job to view detail | ✓ | Shows job info, stats, recent applicants |
| 9 | Navigate to pipeline | ✓ | Kanban board loads with columns |
| 10 | Drag candidate to new column | ✓ | Status updated via mutation |
| 11 | Click candidate card | ✓ | Drawer opens with candidate info |
| 12 | View application detail | ✗ | **BROKEN — "Application not found" (empty jobId bug)** |
| 13 | Reject candidate | ✓ | Modal with rejection reason works |
| 14 | Check notifications | ✓ | Notification list loads with pagination |
| 15 | View analytics | ⚠️ | Basic stats load; no funnel/chart data |
| 16 | Edit company profile | ✓ | Company form loads and saves |
| 17 | Log out | ✓ | Clean logout with cache clearing |

### Journey Score: **12/17 steps working, 3 partially working, 1 broken, 1 security concern**

---

## 10. Recommended Implementation Priority (Phase 9B)

### Priority 1 — Critical Fixes
1. **Fix Application Detail bug** — Pass valid jobId or create single-application fetch
2. **Fix navigation** — "Applicants" link, add Analytics + Pipeline to Sidebar/MobileNav
3. **Fix notification link** — Route to `/recruiter/notifications` not `/notifications`

### Priority 2 — Design Compliance (Dashboard)
4. **Rewrite Dashboard** — 3×2 stat grid, pipeline health chart, activity feed, market trends
5. **Mobile Dashboard** — 2×2 stat grid, quick actions, card-based activity

### Priority 3 — Design Compliance (Job Management)
6. **Enhance Job Management** — Filter tabs, search, action menu, real applicant count
7. **Enhance Create/Edit Job** — Visibility selector, salary toggle, requirements checklist

### Priority 4 — Design Compliance (Pipeline + Analytics)
8. **Enhance Pipeline** — List/Kanban toggle, match %, rating badges, mobile list view
9. **Enhance Analytics** — Date range, funnel chart, line chart, top jobs table

### Priority 5 — Missing Features
10. **Talent Pool page** (requires backend endpoint)
11. **Mobile layouts** for all pages
12. **Notification unread badge** in TopBar

---

## Appendix A: File Inventory

### Route Files (12)
```
src/routes/_authenticated/recruiter/index.tsx
src/routes/_authenticated/recruiter/dashboard.tsx
src/routes/_authenticated/recruiter/jobs.tsx
src/routes/_authenticated/recruiter/jobs.create.tsx
src/routes/_authenticated/recruiter/jobs.$jobId.tsx
src/routes/_authenticated/recruiter/jobs.$jobId.edit.tsx
src/routes/_authenticated/recruiter/jobs.$jobId.applications.tsx
src/routes/_authenticated/recruiter/applications.$applicationId.tsx
src/routes/_authenticated/recruiter/analytics.tsx
src/routes/_authenticated/recruiter/notifications.tsx
src/routes/_authenticated/recruiter/profile.tsx
src/routes/_authenticated/recruiter/company.tsx
```

### Feature Files
```
src/features/recruiter/pages/RecruiterDashboardPage.tsx (170L)
src/features/recruiter/pages/RecruiterJobDetailPage.tsx (200L)
src/features/recruiter/pages/RecruiterApplicationDetailPage.tsx (370L)
src/features/recruiter/pages/RecruiterNotificationsPage.tsx (180L)
src/features/recruiter/pages/RecruiterAnalyticsPage.tsx (150L)
src/features/recruiter/api/index.ts (58L)
src/features/recruiter/hooks/index.ts (56L)
src/features/recruiter/types/index.ts (48L)
src/features/recruiter/layout/RecruiterLayout.tsx (115L) — DEAD CODE
src/features/jobs/components/RecruiterJobManagement.tsx (200L)
src/features/jobs/components/CreateJobPage.tsx (250L)
src/features/jobs/components/EditJobPage.tsx (290L)
src/features/applications/pages/recruiter/RecruiterApplicantPipelinePage.tsx (180L)
src/features/applications/components/CandidateDetailDrawer.tsx (150L)
src/features/applications/components/KanbanBoard.tsx (80L)
src/features/applications/components/KanbanColumn.tsx (60L)
src/features/applications/components/KanbanCard.tsx (50L)
src/features/profile/pages/recruiter/RecruiterProfilePage.tsx (100L)
src/features/company/pages/CompanyManagementPage.tsx (80L)
```

### Shared Components
```
src/shared/components/recruiter/StatisticsGrid.tsx
src/shared/components/recruiter/StatusBadge.tsx
src/shared/components/recruiter/TablePaginationFooter.tsx
src/shared/components/recruiter/FilterToolbar.tsx — UNUSED
src/shared/components/recruiter/AnalyticsCard.tsx — UNUSED
src/shared/components/recruiter/ActionMenu.tsx — UNUSED
src/shared/components/recruiter/SearchInput.tsx
```

### Design Files Consulted
```
Design/recruiter_dashboard_overview/code.html
Design/recruiter_dashboard_mobile_view/code.html
Design/recruiter_job_management/code.html
Design/recruiter_job_management_mobile_view/code.html
Design/job_post_form_mobile_view/code.html
Design/job_post_edit_form/code.html
Design/recruiter_talent_pool/code.html
Design/recruiter_talent_pool_mobile_view/code.html
Design/recruiter_pipeline_mobile_view/code.html
Design/applicant_pipeline_kanban_view/code.html
Design/recruiter_analytics_dashboard/code.html
Design/recruiter_analytics_mobile_view/code.html
Design/candidate_detail_drawer/code.html
Design/candidate_detail_mobile_drawer/code.html
Design/company_profile_page/code.html
Design/company_profile_page_mobile_view/code.html
```
