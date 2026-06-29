# JOB MODULE — UI Architecture, UX & Integration Audit

> **Phase 7A Deliverable** | READ-ONLY Audit
> **Date**: 2026-06-28 | **Status**: Complete
> **Scope**: Public (Marketplace, Job Detail), Candidate (Saved Jobs, Applications), Recruiter (Job Management, Create/Edit), Super Admin (Jobs Oversight)

---

## EXECUTIVE SUMMARY

The Job subsystem is the **largest feature module** in Postboard. This audit covers 10 components, 8 API functions, 9 hooks, 11 routes, 15 Design directories (30+ assets), and 14 backend endpoints.

| Metric | Value |
|--------|-------|
| **Overall Design Fidelity** | **~40%** (behind Company module at 45%) |
| Components | 10 (all in `components/`, no `pages/` directory) |
| API Functions | 8 (listJobs, getJob, createJob, updateJob, updateJobStatus, deleteJob, listTags, + hook-level getCompanyJobs) |
| Hooks | 9 (useJobs infinite query, useJob, useCreateJob, useUpdateJob, useUpdateJobStatus, useDeleteJob, useTags, useCompanyJobs, useSavedJobs) |
| Routes | 11 job-related routes across public, candidate, recruiter, superadmin |
| Design Assets | 15 directories, 30+ files (17 HTML + 13+ PNGs) |
| Backend Endpoints | 14 (5 public/auth-required, 4 recruiter, 3 applications, 2 saved) |

### Critical Gaps

1. **Job Marketplace**: No hero section, no search bar in page header, no 2-column card grid with `gap-px` pattern, no company logos on cards, no "Apply Role" CTA per card, no sort dropdown, no proper pagination — just infinite scroll "Load More"
2. **Job Detail**: Missing "Responsibilities" and "Requirements" sections (numbered list pattern), missing "Employment Type" badge, Apply card not matching Design (missing Applicants count, misplaced Share button), Company card missing Company Size/Funding, no mobile bottom CTA bar
3. **Job Application Modal**: Missing profile section (avatar + name + email + verified badge), missing resume file display with Replace link, missing confirmation checkbox, missing character counter, missing press-grid accent decoration
4. **Saved Jobs**: Stub implementation — no filter tabs (ALL/ACTIVE/EXPIRED), no followed companies section, no proper card grid layout, loads ALL jobs client-side instead of using saved jobs API
5. **Recruiter Job Management**: Missing filter tabs (All/Active/Draft/Closed/Archived), missing Views/Deadline/Actions columns, no Kanban view, no pagination, action menu not matching Design (no "View Applicants" / "Duplicate" / "Close Role" options)
6. **Job Post/Edit Form**: Missing sidebar navigation (6 sections), missing progress indicator, missing "Preview & Publish" guide card, missing visibility selector (3-card: PUBLIC/PRIVATE/UNLISTED), no draft/publish dual-action buttons

---

## 1. DESIGN COVERAGE MATRIX

### 1.1 Public Pages

| Design Asset | Directory | Status | Implementation File | Fidelity |
|---|---|---|---|---|
| `jobs_marketplace_grid` | `Design/jobs_marketplace_grid/` | △ Partial | `JobsMarketplace.tsx` | **35%** |
| `jobs_marketplace_public_page` | `Design/jobs_marketplace_public_page/` | △ Partial | `JobsMarketplace.tsx` | **25%** |
| `jobs_landing_page` | `Design/jobs_landing_page/` | ❌ Missing | — | **0%** |
| `job_detail_page` | `Design/job_detail_page/` | △ Partial | `JobDetailPage.tsx` | **55%** |
| `job_detail_page_mobile_view` | `Design/job_detail_page_mobile_view/` | ❌ Missing | — | **0%** |
| `job_application_modal` | `Design/job_application_modal/` | △ Partial | `ApplyModal.tsx` | **30%** |
| `job_application_modal_mobile_view` | `Design/job_application_modal_mobile_view/` | ❌ Missing | — | **0%** |

### 1.2 Candidate Pages

| Design Asset | Directory | Status | Implementation File | Fidelity |
|---|---|---|---|---|
| `candidate_saved_roles_dashboard` | `Design/candidate_saved_roles_dashboard/` | △ Stub | `SavedJobsPage.tsx` | **15%** |
| `candidate_applications_list_view` | `Design/candidate_applications_list_view/` | ❌ Missing | — | **0%** |

### 1.3 Recruiter Pages

| Design Asset | Directory | Status | Implementation File | Fidelity |
|---|---|---|---|---|
| `recruiter_job_management` | `Design/recruiter_job_management/` | △ Partial | `RecruiterJobManagement.tsx` | **40%** |
| `recruiter_job_management_mobile_view` | `Design/recruiter_job_management_mobile_view/` | ❌ Missing | — | **0%** |
| `job_post_form` (no `job_post_form/` directory) | — | — | `CreateJobPage.tsx` | **30%** |
| `job_post_form_mobile_view` | `Design/job_post_form_mobile_view/` | △ Partial | `CreateJobPage.tsx` | **20%** |
| `job_post_edit_form` | `Design/job_post_edit_form/` | △ Partial | `EditJobPage.tsx` | **30%** |

### 1.4 Super Admin Pages

| Design Asset | Directory | Status | Notes |
|---|---|---|---|
| `super_admin_jobs_marketplace_table` | `Design/super_admin_jobs_marketplace_table/` | ⏳ Future | Not in scope for this phase |
| `super_admin_marketplace_page` | `Design/super_admin_marketplace_page/` | ⏳ Future | Not in scope for this phase |
| `super_admin_job_preview_page` | `Design/super_admin_job_preview_page/` | ⏳ Future | Not in scope for this phase |

---

## 2. BACKEND INTEGRATION AUDIT

### 2.1 API Endpoints (14 Total)

| Endpoint | Method | Auth | Used By | Status |
|---|---|---|---|---|
| `GET /jobs` | GET | Optional | `listJobs()` → `useJobs` | ✅ Wired |
| `GET /jobs/:id` | GET | Optional | `getJob()` → `useJob` | ✅ Wired |
| `POST /jobs` | POST | RECRUITER+ | `createJob()` → `useCreateJob` | ✅ Wired |
| `PATCH /jobs/:id` | PATCH | RECRUITER+ | `updateJob()` → `useUpdateJob` | ✅ Wired |
| `PATCH /jobs/:id/status` | PATCH | RECRUITER+ | `updateJobStatus()` → `useUpdateJobStatus` | ✅ Wired |
| `DELETE /jobs/:id` | DELETE | ADMIN+ | `deleteJob()` → `useDeleteJob` | ✅ Wired |
| `GET /jobs/:id/related` | GET | Optional | `getRelatedJobs()` (via `useCompanyJobs`) | ⚠️ Proxy via `listJobs({companyId})` |
| `GET /jobs/:id/applicants` | GET | RECRUITER+ | Not implemented | ❌ Missing |
| `PATCH /jobs/:id/applications/:appId/status` | PATCH | RECRUITER+ | Not implemented | ❌ Missing |
| `POST /jobs/:id/apply` | POST | CANDIDATE | `useApplyToJob` (applications feature) | ✅ Wired |
| `GET /jobs/:id/applications/my` | GET | CANDIDATE | Not implemented | ❌ Missing |
| `DELETE /jobs/:id/applications/my` | DELETE | CANDIDATE | Not implemented | ❌ Missing |
| `POST /jobs/:id/save` | POST | CANDIDATE | `useSaveJob` (via `SavedJobsButton`) | ✅ Wired |
| `DELETE /jobs/:id/save` | DELETE | CANDIDATE | `useUnsaveJob` (via `SavedJobsButton`) | ✅ Wired |

### 2.2 Data Flow Issues

| Issue | Location | Impact | Fix Required |
|---|---|---|---|
| **Related Jobs via listJobs** | `useCompanyJobs` hook | Works but inefficient — fetches all jobs and filters client-side | Use `GET /jobs/:id/related` endpoint instead |
| **Saved Jobs via client store** | `SavedJobsPage.tsx` | Loads ALL jobs from API, filters by saved IDs client-side — doesn't scale | Use `GET /jobs/saved` endpoint (if exists) or keep client-side for MVP |
| **No applicant count** | `JobDetailPage.tsx` sidebar | Design shows "Applicants: 144" — no `_count` on `JobSummary` for public view | Backend may not expose applicant count on public job detail |
| **No applicant tracking** | `RecruiterJobManagement.tsx` | Shows "—" for applicants column | Wire to `GET /jobs/:id/applicants` or add count to `listJobs` response |
| **No job verification** | Job cards/detail | No company verification badge displayed | Reuse `VerificationBadge` from shared components |
| **Missing application status check** | `ApplyModal.tsx` | No check if user already applied to this job | Use `GET /jobs/:id/applications/my` before showing Apply button |

### 2.3 Auth Requirements

| Route | Auth Required | Role Guard | Notes |
|---|---|---|---|
| `/_public/jobs` | No | — | Public marketplace |
| `/_public/jobs/$jobId` | No | — | Public job detail |
| `/candidate/jobs` | Yes | CANDIDATE | Redirects to public `/jobs` |
| `/candidate/jobs/saved` | Yes | CANDIDATE | Saved jobs page |
| `/recruiter/jobs` | Yes | RECRUITER | Job management dashboard |
| `/recruiter/jobs/create` | Yes | RECRUITER | Create job form |
| `/recruiter/jobs/$jobId` | Yes | RECRUITER | Job detail (recruiter view) |
| `/recruiter/jobs/$jobId/edit` | Yes | RECRUITER | Edit job form |
| `/recruiter/jobs/$jobId/applications` | Yes | RECRUITER | Applicant pipeline |

---

## 3. COMPONENT INVENTORY

### 3.1 Feature Components (`src/features/jobs/components/`)

| Component | Lines | Purpose | Design Match | Status |
|---|---|---|---|---|
| `JobDetailPage.tsx` | 301 | Public job detail page | `job_detail_page` | △ Partial — missing responsibilities, requirements, mobile bottom CTA |
| `JobsMarketplace.tsx` | 94 | Public job listing | `jobs_marketplace_grid` | △ Partial — missing hero, search bar, 2-col grid, proper cards |
| `JobCard.tsx` | 71 | Reusable job card | `jobs_marketplace_grid` cards | △ Partial — missing company logo, Apply CTA, hover border-l-4 |
| `JobFilters.tsx` | 91 | Legacy filter (unused) | — | ⚠️ Superseded by `EnhancedJobFilters` |
| `ApplyModal.tsx` | 155 | Application dialog | `job_application_modal` | △ Partial — missing profile, resume, char count, confirmation |
| `SavedJobsPage.tsx` | 48 | Saved jobs list (stub) | `candidate_saved_roles_dashboard` | ❌ Stub — no filter tabs, no followed companies |
| `SavedJobsButton.tsx` | 29 | Bookmark toggle | — | ✅ Functional (uses Zustand + API) |
| `CreateJobPage.tsx` | 271 | Recruiter create form | `job_post_edit_form` | △ Partial — missing sidebar nav, visibility, progress |
| `EditJobPage.tsx` | 309 | Recruiter edit form | `job_post_edit_form` | △ Partial — same issues as CreateJobPage |
| `RecruiterJobManagement.tsx` | 250 | Recruiter dashboard | `recruiter_job_management` | △ Partial — missing filter tabs, columns, pagination |

### 3.2 Shared Components Used

| Component | Location | Usage | Status |
|---|---|---|---|
| `Skeleton` | `@/components/ui/skeleton` | Loading states | ✅ Used |
| `ErrorState` | `@/shared/components/ux/ErrorState` | Error display | ✅ Used |
| `EmptyState` | `@/shared/components/ux/EmptyState` | Empty states | ✅ Used |
| `EnhancedJobFilters` | `@/shared/components/candidate/EnhancedJobFilters` | Filter sidebar | ✅ Used |
| `Dialog/DialogContent/DialogHeader/DialogTitle` | `@/components/ui/dialog` | Modals | ✅ Used |
| `Form/FormField/FormItem/FormLabel/FormControl/FormMessage` | `@/components/ui/form` | Forms | ✅ Used |
| `Input` | `@/components/ui/input` | Form inputs | ✅ Used |
| `VerificationBadge` | `@/shared/components/ux/VerificationBadge` | Company verification | ❌ **NOT used** — needs integration |
| `Breadcrumbs` | `@/shared/components/ux/Breadcrumbs` | Navigation | ❌ **NOT used** — should be added |
| `LoadingState` | `@/shared/components/ux/LoadingState` | Page loading | ❌ **NOT used** — using raw Skeleton |
| `HugeiconsIcon` | `@/components/ui/HugeiconsIcon` | Icons | ❌ **NOT used** — using text labels only |

### 3.3 Missing Components (Referenced in Design but Not Implemented)

| Design Pattern | Component Needed | Priority |
|---|---|---|
| Hero section (marketplace) | `JobMarketplaceHero` | HIGH |
| Search bar (sticky filter) | `JobSearchBar` | HIGH |
| Filter pills (horizontal sticky) | `JobFilterPills` | HIGH |
| Job card (2-col grid item) | `JobCardGrid` (new design-compliant version) | HIGH |
| Sort dropdown | `JobSortDropdown` | MEDIUM |
| Job detail hero (desktop) | Already in `JobDetailPage` — needs refactor | HIGH |
| Responsibilities list | `NumberedList` (numbered pattern: 01, 02, 03...) | HIGH |
| Requirements list | `SlashList` (slash pattern: /, /, /...) | HIGH |
| Company sidebar card | Already exists — needs additional fields | MEDIUM |
| Apply sidebar card | Already exists — needs Applicants count | MEDIUM |
| Mobile bottom CTA bar | `JobDetailMobileBar` | HIGH |
| Mobile bottom nav | `JobDetailMobileNav` | HIGH |
| Profile section (modal) | `ApplicationProfileSection` | HIGH |
| Confirmation checkbox | `ApplicationConfirmation` | MEDIUM |
| Character counter | `CharCounter` (reusable) | LOW |
| Press-grid accent | `PressGridAccent` (decorative) | LOW |
| Saved jobs filter tabs | `SavedJobsTabs` | HIGH |
| Followed companies section | `FollowedCompanies` | MEDIUM |
| Recruiter filter tabs | `RecruiterJobTabs` | HIGH |
| Recruiter action menu | `JobActionMenu` (dropdown with Edit/View/Duplicate/Close/Delete) | HIGH |
| Job form sidebar nav | `JobFormSidebarNav` | MEDIUM |
| Job form progress indicator | `JobFormProgress` | MEDIUM |
| Visibility selector | `JobVisibilitySelector` (3-card: PUBLIC/PRIVATE/UNLISTED) | MEDIUM |

---

## 4. JOB DETAIL PAGE — DETAILED ANALYSIS

### 4.1 Design vs Implementation Comparison

**Design Structure** (`Design/job_detail_page/code.html`):

```
<main> max-w-max-width, px-margin, py-12
  <div> grid-cols-12, gap-gutter
    <!-- Main Column (8-col) -->
    <div> md:col-span-8, space-y-12
      <section> Header Info
        <a> ← ALL ROLES (mono-label, text-dim)
        <h1> font-headline-2xl, text-[40px], leading-tight
        <div> Company name (font-ui-lg, text-primary-container) • Location
      </section>
      <hr> border-rule
      <section> // ABOUT_THE_ROLE
        <div> font-body-base, max-w-[640px], paragraphs
      </section>
      <section> // RESPONSIBILITIES
        <ul> list-none, space-y-3
          <li> flex gap-4
            <span> text-primary-container (number: 01, 02, 03, 04)
            <span> description text
      </section>
      <section> // REQUIREMENTS
        <ul> list-none, space-y-3
          <li> flex gap-4
            <span> text-dim (slash: /)
            <span> requirement text
      </section>
      <div> Decorative Asset (h-64, border, "Visualizing Protocol Topology")
    </div>
    <!-- Sidebar Column (4-col) -->
    <aside> md:col-span-4, sticky top-24, space-y-6
      <div> Application Card (bg-surface-container-lowest, border, p-6)
        <button> Apply Now (w-full, bg-primary-container, font-mono-label)
        <div> grid-cols-2
          <div> Posted: 2d ago
          <div> Applicants: 144
      </div>
      <div> Company Card (bg-surface-container-lowest, border, p-6)
        <div> Logo (w-12, h-12) + Company Name + Location
        <div> Industry row
        <div> Company Size row (50-100 Employees)
        <div> Funding row (Series B)
        <a> View Company Profile
      </div>
      <div> Similar Roles
        <div> // SIMILAR_ROLES
        <div> 3x <a> cards (bg-surface-container-low, border, p-4)
          Title + Company / Salary
      </div>
    </aside>
  </div>
</main>
```

**Implementation Structure** (`JobDetailPage.tsx`):

```
<main> max-w-(--max-width), px-(--margin), py-12
  <div> grid-cols-12, gap-(--gutter)
    <div> md:col-span-8, space-y-12
      <section> Header Info
        <a> ← ALL ROLES (matches Design)
        <h1> font-headline, text-[40px] (Design uses font-headline-2xl)
        <div> Company name (font-ui-lg, text-primary-container) • Location (matches)
      </section>
      <hr> border-(--rule) (matches)
      <section> // ABOUT_THE_ROLE (matches)
        <div> font-body-base, max-w-[640px] (matches)
          <p> job.description (single paragraph — Design has multiple)
      </section>
      ❌ MISSING: // RESPONSIBILITIES section (numbered list)
      ❌ MISSING: // REQUIREMENTS section (slash list)
      <section> // TAGS & SKILLS (extra — not in Design)
        Tags displayed as mono-label badges
      </section>
      <div> Decorative Asset (h-64, press-grid pattern — matches Design)
    </div>
    <aside> sticky top-24, md:col-span-4
      <div> Application Card (border, bg-surface-container-lowest, p-6)
        <div> Share button + SavedJobsButton (Design: Apply Now is first element)
        <button> Apply Now (conditional — only for CANDIDATE + OPEN)
        <div> grid-cols-2: Posted, Expires (Design: Posted, Applicants)
        <div> grid-cols-2: Level, Location (not in Design's application card)
      </div>
      <div> Company Card (border, bg-surface-container-lowest, p-6)
        <div> Logo + Company Name + Location
        ❌ MISSING: Industry row (exists but partial)
        ❌ MISSING: Company Size row
        ❌ MISSING: Funding row
        <a> View Company Profile (matches)
      </div>
      <div> Similar Roles (matches structure)
        <div> // SIMILAR ROLES
        <div> 2-3x <Link> cards (matches Design pattern)
      </div>
    </aside>
  </div>
</main>
```

### 4.2 Job Detail — Specific Gaps

| Gap | Design Pattern | Current | Priority |
|---|---|---|---|
| Title font class | `font-headline-2xl` | `font-headline` | HIGH |
| Badge row missing employment type | `FULL-TIME` badge shown | Only status, locationType, experienceLevel, salary | HIGH |
| Responsibilities section | Numbered list (01, 02, 03, 04) with `text-primary-container` numbers | **Missing entirely** | HIGH |
| Requirements section | Slash list (/) with `text-dim` slashes | **Missing entirely** | HIGH |
| Application card — Apply Now first | Apply button at top of card | Share + Save buttons at top | MEDIUM |
| Application card — Applicants count | Shows "Applicants: 144" | Shows "Expires" and "Level" | HIGH |
| Company card — Industry row | `border-b border-rule/50 pb-2` | Exists but styling may differ | LOW |
| Company card — Company Size | "50-100 Employees" | **Missing** | MEDIUM |
| Company card — Funding | "Series B" | **Missing** | MEDIUM |
| Mobile bottom CTA bar | Fixed bottom bar with Apply Now button | **Missing** | HIGH |
| Mobile bottom navigation | Fixed bottom nav (← Back | Share | Save | Apply) | **Missing** | HIGH |
| Share button styling | `bg-surface-container-low, border, px-3 py-2` | `bg-(--surface-container-low), border, px-3 py-2` | ✅ Match |
| SavedJobsButton | Design: `bg-primary, text-on-primary` when saved | Uses `bg-primary-container` when saved | LOW |

---

## 5. JOB MARKETPLACE — DETAILED ANALYSIS

### 5.1 Design vs Implementation

**Design Structure** (`Design/jobs_marketplace_grid/code.html`):

```
<main> max-w-max-width, px-margin
  <section> Page Header (pt-12, pb-6, border-b)
    <div> // open_roles (mono-label, text-dim)
    <h1> All Roles (font-headline-2xl, text-[48px]/[64px])
    <span> 8,412 roles (bg-muted, px-4, py-1.5)
  </section>
  <div> Filter Bar (sticky, border-b, bg-[#080808], py-4)
    <input> Search bar (bg-black, border, font-mono-label, pl-12)
  </div>
  <div> Sticky filter row (top-[73px], z-40, border-b)
    <div> Filter pills: Role Type | Location | Experience | Salary Range | Remote Only (checkbox)
    <div> Sort: Newest (dropdown)
  </div>
  <div> Job Card Grid (grid-cols-2, gap-px, bg-rule, border-x/border-b)
    <div> Job Card (bg-[#080808], p-margin, border-t, hover:border-l-4)
      <div> Company icon (w-10, h-10) + Company Name + Location
      <span> Posted time (mono-label, text-dim)
      <h3> Job Title (font-ui-xl, group-hover:text-primary)
      <div> Tags (Full-time, Hybrid, Rust, C++)
      <div> mt-auto, border-t: Salary ($160k — $220k) | Apply Role button
  </div>
  <nav> Pagination (Prev | Page 2 of 47 | Next)
</main>
```

**Implementation** (`JobsMarketplace.tsx`):

```
<div> flex-col, gap-6, p-6
  <header> // JOBS_MARKETPLACE (mono-label)
    <h1> Jobs Marketplace (font-headline)
    <p> Browse open positions...
    <p> {count} positions found
  </header>
  <div> grid-cols-1, lg:grid-cols-[240px_1fr]
    <aside> EnhancedJobFilters (sidebar — Design uses horizontal sticky pills)
    <main> flex-col, gap-4
      Skeleton loading states
      ErrorState
      EmptyState
      {jobs.map} <JobCard> (single column — Design uses 2-column grid)
      "Load More" button (Design uses Prev/Next pagination)
    </main>
  </div>
</div>
```

### 5.2 Job Marketplace — Specific Gaps

| Gap | Design | Current | Priority |
|---|---|---|---|
| Page header | "All Roles" with count badge | "Jobs Marketplace" with inline count | HIGH |
| Hero section | Not in grid view (in `jobs_marketplace_public_page`) | Not implemented | MEDIUM |
| Search bar | Full-width sticky search input | Inside EnhancedJobFilters sidebar | HIGH |
| Filter layout | Horizontal sticky pills below search | Vertical sidebar (240px) | HIGH |
| Filter pills | Role Type, Location, Experience, Salary Range, Remote Only checkbox | Location Type + Experience Level (fewer options) | MEDIUM |
| Sort dropdown | "Sort: Newest" with arrow | Not implemented | MEDIUM |
| Card grid | `grid-cols-2, gap-px, bg-rule` (thin rule separators) | Single column list | HIGH |
| Card structure | Company icon + name, title, tags, salary + Apply CTA at bottom | Title, company, location/type/level, tags, posted date | HIGH |
| Company logo/icon | `w-10, h-10` icon with Material symbol | Not shown (no logo in card) | HIGH |
| Apply CTA per card | "Apply Role" button at bottom of each card | No CTA — entire card is a link | HIGH |
| Hover effect | `hover:border-l-4, hover:border-l-primary-container` | `hover:bg-(--surface-container)` | MEDIUM |
| Salary display | `$160k — $220k` (formatted with k suffix) | Full number format `$160,000–$220,000` | LOW |
| Pagination | Prev / Page X of Y / Next | "Load More" infinite scroll | MEDIUM |
| Count badge | `bg-muted, px-4, py-1.5` styled badge | Inline text | LOW |

---

## 6. JOB APPLICATION MODAL — DETAILED ANALYSIS

### 6.1 Design Structure

```
<Dialog> max-w-[560px], bg-ink, border, shadow-none
  <header> p-6, border-b
    <span> // APPLY (mono-label, text-dim)
    <h2> Apply for Sr. Frontend Developer (font-headline-2xl, text-[24px])
    <p> Company name (font-ui-sm, text-dim)
    <button> Close (X icon)
  </header>
  <form> p-6, space-y-8, max-h-[716px], overflow-y-auto
    <!-- Section 1: Profile -->
    <div> // YOUR_PROFILE
      <div> bg-surface-container-low, border, p-4
        <div> Avatar (w-10, h-10) + Name + Email + Verified badge
        <div> Resume file (border, p-3) with [Replace] link
      </div>
    </div>
    <!-- Section 2: Cover Letter -->
    <div> // COVER_LETTER + 0/1000 counter
      <textarea> rows=5, placeholder, max 1000 chars
    </div>
    <!-- Section 3: Confirmation -->
    <div> Checkbox + "I confirm this application is accurate..."
  </form>
  <footer> p-6, border-t, bg-ink
    <button> [Cancel] (text-dim, hover:text-on-surface)
    <button> Submit Application + send icon (bg-accent, text-ink)
  </footer>
  <!-- Press Grid Accent (decorative corner element) -->
</Dialog>
```

### 6.2 Implementation (`ApplyModal.tsx`)

```
<Dialog> max-w-[480px], bg-(--surface)
  <DialogHeader> border-b, px-5, py-4
    <DialogTitle> "Apply: {jobTitle}" (font-sans, text-[15px])
  </DialogHeader>
  <div> flex-col, gap-4, px-5, py-4
    AuthErrorBanner (if error)
    Success message (if applied)
    <form> flex-col, gap-4
      ❌ MISSING: Profile section (avatar, name, email, resume)
      <FormField> Cover Letter (textarea, rows=5)
      <FormField> Resume URL (text input — Design shows file display with Replace)
      ❌ MISSING: Character counter (0/1000)
      ❌ MISSING: Confirmation checkbox
      <div> Cancel + Submit buttons
    </form>
  </div>
</Dialog>
```

### 6.3 Application Modal — Specific Gaps

| Gap | Design | Current | Priority |
|---|---|---|---|
| Max width | `max-w-[560px]` | `max-w-[480px]` | LOW |
| Background color | `bg-ink` (#0F0F0F) | `bg-(--surface)` (#131313) | LOW |
| Header label | `// APPLY` (mono-label, text-dim) | "Apply: {jobTitle}" (font-sans) | HIGH |
| Header title | `font-headline-2xl, text-[24px]` | `font-sans, text-[15px]` | HIGH |
| Close button | X icon (material-symbols-outlined) | Radix Dialog default X | LOW |
| Profile section | Avatar + name + email + verified badge + resume file | **Missing entirely** | HIGH |
| Resume display | File icon + filename + [Replace] link | Text input for URL | HIGH |
| Character counter | `0 / 1000` next to label | **Missing** | MEDIUM |
| Confirmation checkbox | "I confirm this application is accurate..." | **Missing** | MEDIUM |
| Footer styling | `bg-ink, border-t` | Not separate — part of content | MEDIUM |
| Submit button icon | `send` icon + "Submit Application" | Text only | LOW |
| Press-grid accent | Decorative corner element | **Missing** | LOW |

---

## 7. SAVED JOBS — DETAILED ANALYSIS

### 7.1 Design Structure

```
<main> ml-[220px], pt-16 (sidebar layout)
  <div> p-gutter, max-w-[1200px]
    <!-- Page Header -->
    <div> // SAVED_ROLES, "Your Bookmarks" (font-headline-2xl, text-[64px])
    <!-- Filter Tabs -->
    <div> border-b, flex gap-8
      <button> ALL (active: border-b-2, border-primary, text-primary)
      <button> ACTIVE
      <button> EXPIRED
    </div>
    <!-- Dashboard Content: 2-Column Grid -->
    <div> grid-cols-1, lg:grid-cols-2, gap-px, bg-rule, border
      <div> Card (bg-surface-container-lowest, p-gutter)
        <div> Logo (w-8, h-8) + Company Name (mono-label) + Job Title (font-ui-lg)
        <span> Status badge (OPEN/EXPIRED)
        <div> Tags: [REMOTE] [FULL-TIME] [$180K - $220K]
        <div> Posted date + UNSAVE button + VIEW ROLE button
      </div>
      <!-- Expired State Example -->
      <div> Card (opacity-60, grayscale — hover:grayscale-0)
        EXPIRED badge, CLOSED button (disabled)
      </div>
      <!-- Empty State -->
      <div> Press-grid placeholder + "SLOT_AVAILABLE"
    </div>
    <!-- Followed Companies Section -->
    <section> mt-20
      <div> // FOLLOWED_COMPANIES (header with nav arrows)
      <div> flex, gap-px, border (horizontal scroll)
        <div> Company Card (w-[240px], p-6, items-center)
          Logo (w-16, h-16) + Name + "Following" badge
      </div>
    </section>
  </div>
</main>
```

### 7.2 Implementation (`SavedJobsPage.tsx`)

```
<div> flex-col, gap-6
  <header> // SAVED_JOBS
    <h1> Saved Jobs (font-headline)
    <p> Jobs you have bookmarked...
  </header>
  ❌ MISSING: Filter tabs (ALL/ACTIVE/EXPIRED)
  ❌ MISSING: 2-column card grid
  ❌ MISSING: Followed companies section
  {savedJobs.length === 0 ? (
    <div> Empty state (NO_SAVED_JOBS)
  ) : (
    <div> {savedJobs.map} <JobCard> (single column list)
  )}
</div>
```

### 7.3 Saved Jobs — Specific Gaps

| Gap | Design | Current | Priority |
|---|---|---|---|
| Layout | Sidebar layout (ml-[220px]) with top app bar | Flat page (no sidebar) | HIGH |
| Page title | "Your Bookmarks" (text-[64px]) | "Saved Jobs" (font-headline) | LOW |
| Filter tabs | ALL / ACTIVE / EXPIRED (border-bottom tabs) | **Missing** | HIGH |
| Card grid | `grid-cols-2, gap-px, bg-rule` (2-column) | Single column list | HIGH |
| Card structure | Logo + company name + job title + status badge + tags + saved date + VIEW ROLE | Uses shared `JobCard` (different design) | HIGH |
| Expired state | `opacity-60, grayscale` on expired cards | Not differentiated | MEDIUM |
| Followed companies | Horizontal scroll section with company cards | **Missing entirely** | MEDIUM |
| Data source | Backend API (saved jobs endpoint) | Client-side filter of ALL jobs | HIGH |

---

## 8. RECRUITER JOB MANAGEMENT — DETAILED ANALYSIS

### 8.1 Design Structure

```
<body> flex (sidebar + main)
  <nav> SideNavBar (w-sidebar-width, fixed)
    Brand: POSTBOARD + "Technical Recruitment"
    CTA: POST_NEW_JOB button (bg-amber)
    Nav: // DASHBOARD, // MY_JOBS (active), // PIPELINE, // TALENT_POOL, // ANALYTICS, // ARCHIVE, // SETTINGS
    Footer: Support, Sign Out
  </nav>
  <main> flex-1, ml-sidebar-width
    <header> Mobile only (h-16, bg-surface-container-low)
    <div> p-gutter, max-w-max-width
      <!-- Header Section -->
      <section> border-b, flex justify-between
        <div> // MY_JOBS, "My Jobs" (font-headline-2xl)
        <button> [+ Post New Role] (bg-amber)
      </section>
      <!-- Filter Tabs -->
      <section> border-b, flex gap-8
        <button> All (active: border-b-2, border-amber)
        <button> Active
        <button> Draft
        <button> Closed
        <button> Archived
      </section>
      <!-- Data Table -->
      <section>
        <table>
          <thead>
            <tr>
              <th> Role Title
              <th> Status
              <th> Applicants (clickable link)
              <th> Views
              <th> Deadline
              <th> Posted
              <th> Actions (more_horiz icon)
            </tr>
          </thead>
          <tbody>
            <tr> hover:bg-surface-elevated
              <td> Title (font-ui-lg) + REQ-0042 // Location
              <td> [OPEN] badge (bg-open)
              <td> 128 Pipeline → (amber link)
              <td> 1,024 (views count)
              <td> 2023-11-30 (deadline)
              <td> 14d ago
              <td> more_horiz → dropdown menu
                Edit | View Applicants | Duplicate | --- | Close Role | Delete
            </tr>
          </tbody>
        </table>
      </section>
      <!-- Pagination -->
      <section> border-t, flex justify-between
        Prev | Page 1 of 4 | Next
      </section>
    </div>
  </main>
</body>
```

### 8.2 Implementation (`RecruiterJobManagement.tsx`)

```
<div> flex-col, gap-6
  <header> flex justify-between
    <div> // JOB_MANAGEMENT, "Job Management"
    <Link> + New Job (border, bg-primary-container)
  </header>
  ❌ MISSING: Filter tabs (All/Active/Draft/Closed/Archived)
  <div> overflow-x-auto, border
    <table>
      <thead>
        <tr>
          <th> Title
          <th> Status
          <th> Level
          <th> Type
          <th> Applicants (shows "—")
          <th> Posted
          <th> Actions (center)
        </tr>
      </thead>
      <tbody>
        <tr>
          <td> Title + Company name
          <td> Status badge (OPEN/DRAFT/CLOSED/EXPIRED)
          <td> experienceLevel
          <td> locationType
          <td> "—" (not implemented)
          <td> Posted date
          <td> EDIT | CLOSE/REOPEN | DELETE (inline buttons — Design uses dropdown)
        </tr>
      </tbody>
    </table>
  </div>
  ❌ MISSING: Views column
  ❌ MISSING: Deadline column
  ❌ MISSING: Pagination
  ❌ MISSING: Action dropdown menu (Design: more_horiz → Edit/View Applicants/Duplicate/Close Role/Delete)
  Delete confirmation dialog (functional)
</div>
```

### 8.3 Recruiter Management — Specific Gaps

| Gap | Design | Current | Priority |
|---|---|---|---|
| Filter tabs | All / Active / Draft / Closed / Archived | **Missing** | HIGH |
| Table columns | Role Title, Status, Applicants, Views, Deadline, Posted, Actions | Title, Status, Level, Type, Applicants(—), Posted, Actions | HIGH |
| Applicants column | Clickable "128 Pipeline →" link | Shows "—" | HIGH |
| Views column | "1,024" view count | **Missing** | MEDIUM |
| Deadline column | "2023-11-30" | **Missing** | MEDIUM |
| Action menu | `more_horiz` icon → dropdown (Edit/View Applicants/Duplicate/Close Role/Delete) | Inline buttons (EDIT/CLOSE/DELETE) | HIGH |
| Duplicate action | Available in dropdown | **Missing** | LOW |
| View Applicants | Available in dropdown | **Missing** | HIGH |
| Close Role | Available in dropdown | Partially (REOPEN button) | MEDIUM |
| Row hover | `hover:bg-surface-elevated` | `hover:bg-(--surface-container-low)` | LOW |
| Title cell style | `font-ui-lg, group-hover:text-amber` | `text-[14px], hover:text-primary-container` | LOW |
| Pagination | Prev / Page X of Y / Next | **Missing** | HIGH |
| Post button style | `bg-amber` (#E8610A) | `bg-primary-container` (#f06613) | LOW |
| Mobile layout | Top app bar with search + notifications | Not implemented | MEDIUM |

---

## 9. JOB POST/EDIT FORM — DETAILED ANALYSIS

### 9.1 Design Structure

```
<aside> fixed sidebar (w-sidebar-width)
  Brand + // ADMIN_PANEL
  Nav: Dashboard, Active Pipeline (active), Talent Pool, Analytics, Company Profile, Settings
  CTA: Create New Listing button
  Footer: Support, Documentation
</aside>
<main> ml-sidebar-width, pb-24
  <div> max-w-[720px], mx-auto, pt-20
    <header> // POST_NEW_ROLE, "Post a Job"
    <form> space-y-16
      <!-- Section 1: BASICS -->
      <section>
        <div> Section header: // BASICS + divider line
        Job Title input
        Department select + Work Type select (2-col grid)
        Location input
      </section>
      <!-- Section 2: DESCRIPTION -->
      <section>
        <div> // DESCRIPTION
        Rich text area (min-h-[240px])
      </section>
      <!-- Section 3: REQUIREMENTS -->
      <section>
        <div> // REQUIREMENTS
        Dynamic list with add/remove
      </section>
      <!-- Section 4: COMPENSATION -->
      <section>
        <div> // COMPENSATION
        Salary Range: Min + Max + Currency (3-col)
        Employment Type select
        Experience Level select
      </section>
      <!-- Section 5: PREVIEW & VISIBILITY -->
      <section>
        <div> // VISIBILITY
        3-card selector: PUBLIC | PRIVATE | UNLISTED
      </section>
    </form>
    <!-- Sidebar Actions (sticky) -->
    <div> fixed bottom-0
      Save Draft button | Publish button
      Status badge (DRAFT/OPEN)
      Progress indicator (5 dots)
      Preview & Publish guide
    </div>
  </div>
</main>
```

### 9.2 Implementation

```
<div> max-w-[640px], mx-auto, flex-col, gap-6, p-6
  <header> // CREATE_JOB, "Post a New Job"
  ❌ MISSING: Sidebar navigation
  ❌ MISSING: Section navigation (sticky bottom bar)
  <form> flex-col, gap-5
    <div> BASIC INFO section (border, p-4)
      Job Title input
      Description textarea
      Location input
      Location Type select
    </div>
    <div> COMPENSATION section (border, p-4)
      Min Salary + Max Salary (2-col)
      Experience Level select
      Expires At date input
    </div>
    <div> TAGS section (border, p-4)
      Tag selection (pill buttons)
    </div>
    ❌ MISSING: REQUIREMENTS section
    ❌ MISSING: VISIBILITY section
    <div> Cancel + POST JOB buttons
  </form>
</div>
```

### 9.3 Job Form — Specific Gaps

| Gap | Design | Current | Priority |
|---|---|---|---|
| Sidebar navigation | Fixed sidebar with 6 nav items | **Missing** (flat form) | MEDIUM |
| Section nav | Sticky bottom bar with section indicators | **Missing** | MEDIUM |
| Progress indicator | 5 dots (one per section) | **Missing** | LOW |
| BASICS section | Title, Department, Work Type, Location | Title, Description, Location, LocationType | DIFFERENT |
| DESCRIPTION section | Separate rich text section | Combined in BASIC INFO | MEDIUM |
| REQUIREMENTS section | Dynamic list (add/remove items) | **Missing** | HIGH |
| COMPENSATION section | Salary range + Employment Type + Experience Level | Salary range + Experience Level + ExpiresAt | MEDIUM |
| VISIBILITY section | 3-card selector (PUBLIC/PRIVATE/UNLISTED) | **Missing** | MEDIUM |
| Publish Schedule | Date/time picker for scheduling | Not implemented | LOW |
| Save Draft button | Separate from Publish | Single POST JOB button | MEDIUM |
| Publish button | `bg-amber, text-[#080808]` | Same as save (no draft state) | MEDIUM |
| Status badge | Shows current status (DRAFT/OPEN) | **Missing** | LOW |
| Preview & Publish guide | Guide card in sidebar | **Missing** | LOW |
| Form layout | `max-w-[720px]` with sidebar | `max-w-[640px]` without sidebar | LOW |

---

## 10. UX FINDINGS

### 10.1 Critical UX Issues

| Issue | Location | Impact | Fix |
|---|---|---|---|
| **No mobile layout for job detail** | `JobDetailPage.tsx` | Mobile users get desktop layout — no bottom CTA, no bottom nav | Add mobile-specific layout with fixed bottom bar |
| **No mobile layout for application modal** | `ApplyModal.tsx` | Desktop modal on mobile — not full-screen, hard to use | Design shows full-screen mobile modal |
| **Saved jobs loads ALL jobs** | `SavedJobsPage.tsx` | Performance issue — fetches entire job list to filter client-side | Use backend saved jobs endpoint or implement proper pagination |
| **No job verification badges** | Job cards, detail | Companies without verification shown identically to verified ones | Reuse `VerificationBadge` component |
| **No "already applied" check** | `ApplyModal.tsx` | Users can apply multiple times | Check application status before showing Apply button |
| **No applicant count on public detail** | `JobDetailPage.tsx` sidebar | Design shows "Applicants: 144" — implementation shows "Expires" | May need backend support |
| **Filter sidebar vs horizontal pills** | `JobsMarketplace.tsx` | Design uses horizontal sticky pills — implementation uses 240px sidebar | Redesign filter layout |
| **No sort functionality** | `JobsMarketplace.tsx` | Design has "Sort: Newest" dropdown — not implemented | Add sort parameter to API |

### 10.2 Moderate UX Issues

| Issue | Location | Impact |
|---|---|---|
| No loading skeleton for job cards | `JobsMarketplace.tsx` | Basic skeleton (h-[140px]) doesn't match card design |
| No error boundary for job detail | `JobDetailPage.tsx` | Single ErrorState without retry |
| No breadcrumbs on job detail | `JobDetailPage.tsx` | Design has "← ALL ROLES" but no breadcrumb trail |
| No share functionality on mobile | `JobDetailPage.tsx` | Share button exists but not in mobile bottom nav |
| Job card hover effect | `JobCard.tsx` | Missing `hover:border-l-4` left-border accent |
| No "Load More" visual feedback | `JobsMarketplace.tsx` | Button text changes but no spinner |
| No max character count on cover letter | `ApplyModal.tsx` | Schema allows 3000 chars but no visual counter |
| Delete confirmation too simple | `RecruiterJobManagement.tsx` | Basic dialog — Design has more context |

### 10.3 Accessibility Issues

| Issue | Location | Impact |
|---|---|---|
| No skip-to-content link | All job pages | Screen reader users must tab through nav |
| Missing aria-labels on filter buttons | `JobFilters.tsx` | Buttons have text but no aria-label |
| No focus management in ApplyModal | `ApplyModal.tsx` | Focus may not trap in dialog |
| Table not using semantic markup | `RecruiterJobManagement.tsx` | Using `<table>` but missing `scope` attributes |
| No keyboard navigation for cards | `JobCard.tsx` | Cards are links (accessible) but no arrow key nav |

---

## 11. NAVIGATION MAP

### 11.1 Current Routes

```
/_public/jobs                           → JobsMarketplace
/_public/jobs/$jobId                    → JobDetailPage
/_authenticated/candidate/jobs          → Redirect to /jobs
/_authenticated/candidate/jobs/saved    → SavedJobsPage
/_authenticated/recruiter/jobs          → RecruiterJobManagement
/_authenticated/recruiter/jobs/create   → CreateJobPage
/_authenticated/recruiter/jobs/$jobId   → (route exists — component?)
/_authenticated/recruiter/jobs/$jobId/edit        → EditJobPage
/_authenticated/recruiter/jobs/$jobId/applications → (route exists — component?)
/_authenticated/admin/jobs             → (route exists)
/_superadmin/superadmin/jobs           → (route exists)
```

### 11.2 Missing Routes (Design Implied)

| Route | Purpose | Priority |
|---|---|---|
| `/_public/jobs` with hero | Landing page variant (`jobs_landing_page`) | LOW |
| `/candidate/applications` | Application list view (`candidate_applications_list_view`) | MEDIUM |
| `/recruiter/jobs/$jobId/applicants` | Applicant pipeline view | HIGH |
| `/superadmin/jobs` | Super admin jobs table | LOW |

---

## 12. ENGINEERING BLUEPRINT

### 12.1 Component Architecture

```
src/features/jobs/
├── api/
│   └── index.ts                    # 8 API functions ✅
├── hooks/
│   └── index.ts                    # 9 hooks ✅
├── types/
│   └── index.ts                    # All types ✅
├── schemas/
│   └── index.ts                    # Zod schemas ✅
├── utils/
│   └── application-status.ts       # Re-export shim ✅
├── components/
│   ├── JobDetailPage.tsx           # REFACTOR: Add responsibilities, requirements, mobile layout
│   ├── JobsMarketplace.tsx         # REWRITE: Hero, search bar, 2-col grid, proper cards
│   ├── JobCard.tsx                 # REWRITE: Match Design card structure
│   ├── JobCardGrid.tsx             # NEW: 2-col grid wrapper with gap-px
│   ├── JobFilterPills.tsx          # NEW: Horizontal sticky filter pills
│   ├── JobSortDropdown.tsx         # NEW: Sort dropdown
│   ├── JobMarketplaceHero.tsx      # NEW: Hero section
│   ├── JobDetailMobileBar.tsx      # NEW: Fixed bottom CTA bar
│   ├── JobDetailMobileNav.tsx      # NEW: Fixed bottom navigation
│   ├── ApplyModal.tsx              # REWRITE: Profile section, char count, confirmation
│   ├── ApplicationProfileSection.tsx # NEW: Profile + resume display
│   ├── SavedJobsPage.tsx           # REWRITE: Filter tabs, card grid, followed companies
│   ├── SavedJobsTabs.tsx           # NEW: ALL/ACTIVE/EXPIRED tabs
│   ├── FollowedCompanies.tsx       # NEW: Horizontal scroll company cards
│   ├── CreateJobPage.tsx           # REWRITE: Section-based form with sidebar nav
│   ├── EditJobPage.tsx             # REWRITE: Section-based form with sidebar nav
│   ├── JobFormSidebarNav.tsx       # NEW: Form section navigation
│   ├── JobFormProgress.tsx         # NEW: Progress indicator dots
│   ├── JobVisibilitySelector.tsx   # NEW: 3-card visibility picker
│   ├── RecruiterJobManagement.tsx  # REWRITE: Filter tabs, proper table, pagination
│   ├── RecruiterJobTabs.tsx        # NEW: All/Active/Draft/Closed/Archived tabs
│   ├── JobActionMenu.tsx           # NEW: Dropdown action menu (more_horiz)
│   └── SavedJobsButton.tsx         # Keep as-is ✅
└── data/
    └── mock-jobs.ts                # NEW: Mock data for missing API data
```

### 12.2 Shared Components to Create

| Component | Location | Reuse |
|---|---|---|
| `NumberedList` | `@/shared/components/ux/NumberedList.tsx` | Responsibilities pattern (01, 02, 03...) |
| `SlashList` | `@/shared/components/ux/SlashList.tsx` | Requirements pattern (/ prefix) |
| `CharCounter` | `@/shared/components/ux/CharCounter.tsx` | Character counter for textareas |
| `PressGridAccent` | `@/shared/components/ux/PressGridAccent.tsx` | Decorative corner element |

### 12.3 Implementation Priority

**Phase 7B — Public Pages (HIGH PRIORITY)**:
1. Rewrite `JobsMarketplace.tsx` — Hero, search bar, 2-col grid, filter pills, sort, pagination
2. Rewrite `JobCard.tsx` — Company logo, title, tags, salary, Apply CTA, hover border
3. Refactor `JobDetailPage.tsx` — Add responsibilities, requirements, fix badge row, fix sidebar
4. Add `JobDetailMobileBar.tsx` — Fixed bottom CTA + navigation
5. Add verification badges to job cards and detail

**Phase 7C — Candidate Pages (MEDIUM PRIORITY)**:
1. Rewrite `SavedJobsPage.tsx` — Filter tabs, 2-col card grid, followed companies
2. Rewrite `ApplyModal.tsx` — Profile section, resume display, char count, confirmation checkbox
3. Add `ApplicationProfileSection.tsx`

**Phase 7D — Recruiter Pages (MEDIUM PRIORITY)**:
1. Rewrite `RecruiterJobManagement.tsx` — Filter tabs, proper columns, pagination, action menu
2. Add `JobActionMenu.tsx` dropdown
3. Rewrite `CreateJobPage.tsx` — Section-based form, visibility selector
4. Rewrite `EditJobPage.tsx` — Same as create

---

## 13. REUSABLE COMPONENT INVENTORY

### 13.1 Existing Components to Reuse

| Component | Location | Job Module Usage |
|---|---|---|
| `VerificationBadge` | `src/shared/components/ux/VerificationBadge.tsx` | Job cards, detail sidebar, company card |
| `Breadcrumbs` | `src/shared/components/ux/Breadcrumbs.tsx` | Job detail page navigation |
| `LoadingState` | `src/shared/components/ux/LoadingState.tsx` | Replace raw Skeleton usage |
| `ErrorState` | `src/shared/components/ux/ErrorState.tsx` | Already used ✅ |
| `EmptyState` | `src/shared/components/ux/EmptyState.tsx` | Already used ✅ |
| `HugeiconsIcon` | `src/components/ui/HugeiconsIcon.tsx` | Icons for cards, buttons, navigation |
| `DataTable` | `src/shared/components/table/DataTable.tsx` | Recruiter job management table |
| `TablePagination` | `src/shared/components/table/TablePagination.tsx` | Recruiter table pagination |
| `ConfirmDialog` | `src/shared/components/dialogs/ConfirmDialog.tsx` | Delete confirmation |
| `PasswordField` | `src/shared/components/forms/PasswordField.tsx` | Not needed for jobs |
| `ThemeToggle` | `src/shared/components/theme/ThemeToggle.tsx` | Already in topbar |

### 13.2 New Components to Create

| Component | Purpose | Reusable? |
|---|---|---|
| `NumberedList` | Ordered list with large numbers (01, 02, 03) | Yes — responsibilities |
| `SlashList` | Unordered list with `/` prefix | Yes — requirements |
| `CharCounter` | Character count display for textareas | Yes — any textarea |
| `PressGridAccent` | Decorative corner grid element | Yes — any card/modal |
| `StickyFilterBar` | Horizontal sticky filter container | Yes — any listing page |

---

## 14. BACKEND DATA REQUIREMENTS

### 14.1 Data Available from API

| Field | JobSummary | JobDetail | Source |
|---|---|---|---|
| id | ✅ | ✅ | Direct |
| title | ✅ | ✅ | Direct |
| slug | ✅ | ✅ | Direct |
| description | ❌ | ✅ | Detail only |
| location | ✅ | ✅ | Direct |
| locationType | ✅ | ✅ | Direct |
| salaryMin/Max/Currency | ✅ | ✅ | Direct |
| status | ✅ | ✅ | Direct |
| experienceLevel | ✅ | ✅ | Direct |
| expiresAt | ✅ | ✅ | Direct |
| company.* | ✅ | ✅ | Nested |
| company.logoUrl | ✅ | ✅ | Nested |
| company.industry | ✅ | ✅ | Nested |
| company.size | ❌ | ❌ | **Not in API** |
| tags[] | ✅ | ✅ | Nested |
| postedBy.* | ❌ | ✅ | Detail only |
| _count.applications | ✅ | ❌ | **May not exist** |

### 14.2 Data Not Available (Design Shows, API Doesn't Provide)

| Missing Data | Design Location | Workaround |
|---|---|---|
| Company size | Job detail sidebar | Mock or omit |
| Funding stage | Job detail sidebar | Mock or omit |
| Applicant count (public) | Job detail sidebar | Backend may not expose publicly |
| Views count | Recruiter table | Backend endpoint needed |
| Employment type (Full-time/Contract) | Job cards, detail badges | Not in Prisma schema — use `experienceLevel` or omit |
| Posted "X days ago" relative time | Multiple locations | Compute from `createdAt` |
| Deadline date | Recruiter table | Use `expiresAt` field |

### 14.3 Mock Data Strategy

For fields not available from the API, use the same pattern as Company module:
- Create `src/features/jobs/data/mock-job-details.ts`
- Export supplementary data keyed by job ID
- Use in components where Design requires data the API doesn't provide
- Clearly document as `// MOCK DATA — not from backend`

---

## 15. FILE INVENTORY

### 15.1 Current Implementation Files

| File | Lines | Status | Action |
|---|---|---|---|
| `src/features/jobs/api/index.ts` | 98 | ✅ Complete | Keep |
| `src/features/jobs/hooks/index.ts` | 120 | ✅ Complete | Keep |
| `src/features/jobs/types/index.ts` | 285 | ✅ Complete | Keep |
| `src/features/jobs/schemas/index.ts` | 48 | ✅ Complete | Keep |
| `src/features/jobs/utils/application-status.ts` | 8 | ✅ Complete | Keep |
| `src/features/jobs/components/JobDetailPage.tsx` | 301 | △ Partial | REFACTOR |
| `src/features/jobs/components/JobsMarketplace.tsx` | 94 | △ Partial | REWRITE |
| `src/features/jobs/components/JobCard.tsx` | 71 | △ Partial | REWRITE |
| `src/features/jobs/components/JobFilters.tsx` | 91 | ⚠️ Legacy | Keep (used by EnhancedJobFilters) |
| `src/features/jobs/components/ApplyModal.tsx` | 155 | △ Partial | REWRITE |
| `src/features/jobs/components/SavedJobsPage.tsx` | 48 | ❌ Stub | REWRITE |
| `src/features/jobs/components/SavedJobsButton.tsx` | 29 | ✅ Complete | Keep |
| `src/features/jobs/components/CreateJobPage.tsx` | 271 | △ Partial | REWRITE |
| `src/features/jobs/components/EditJobPage.tsx` | 309 | △ Partial | REWRITE |
| `src/features/jobs/components/RecruiterJobManagement.tsx` | 250 | △ Partial | REWRITE |

### 15.2 Route Files

| File | Status | Notes |
|---|---|---|
| `src/routes/_public/jobs.tsx` | ✅ | Search params validated, SEO meta |
| `src/routes/_public/jobs.$jobId.tsx` | ✅ | SEO meta, renders JobDetailPage |
| `src/routes/_authenticated/candidate/jobs.tsx` | ✅ | Redirect to public /jobs |
| `src/routes/_authenticated/candidate/jobs.saved.tsx` | ✅ | requireRole guard |
| `src/routes/_authenticated/recruiter/jobs.tsx` | ✅ | requireRole guard |
| `src/routes/_authenticated/recruiter/jobs.create.tsx` | ✅ | requireRole guard |
| `src/routes/_authenticated/recruiter/jobs.$jobId.tsx` | ✅ | requireRole guard |
| `src/routes/_authenticated/recruiter/jobs.$jobId.edit.tsx` | ✅ | requireRole guard |
| `src/routes/_authenticated/recruiter/jobs.$jobId.applications.tsx` | ✅ | requireRole guard |
| `src/routes/_authenticated/admin/jobs.tsx` | ✅ | requireRole guard |
| `src/routes/_superadmin/superadmin/jobs.tsx` | ✅ | requireSuperAdmin guard |

### 15.3 Design Asset Files

| Directory | Files | Read Status |
|---|---|---|
| `Design/job_detail_page/` | code.html, screen.png | ✅ Read |
| `Design/job_detail_page_mobile_view/` | code.html, screen.png | ✅ Read |
| `Design/jobs_marketplace_grid/` | code.html, screen.png | ✅ Read |
| `Design/jobs_marketplace_public_page/` | code.html, screen.png | ⏳ Not read |
| `Design/jobs_landing_page/` | code.html, screen.png | ⏳ Not read |
| `Design/job_application_modal/` | code.html, screen.png | ✅ Read |
| `Design/job_application_modal_mobile_view/` | code.html, screen.png | ⏳ Not read |
| `Design/job_post_form_mobile_view/` | code.html, screen.png | ✅ Read |
| `Design/job_post_edit_form/` | code.html, screen.png | ✅ Read |
| `Design/candidate_saved_roles_dashboard/` | code.html, screen.png | ✅ Read |
| `Design/candidate_applications_list_view/` | code.html, screen.png | ⏳ Not read |
| `Design/recruiter_job_management/` | code.html, screen.png | ✅ Read |
| `Design/recruiter_job_management_mobile_view/` | code.html, screen.png | ✅ Read |
| `Design/super_admin_jobs_marketplace_table/` | code.html, screen.png | ⏳ Not read |
| `Design/super_admin_marketplace_page/` | code.html, screen.png | ⏳ Not read |
| `Design/super_admin_job_preview_page/` | code.html, screen.png | ⏳ Not read |

---

## 16. TESTING NOTES

### 16.1 Test Coverage Gaps

| Area | Current Tests | Needed |
|---|---|---|
| Job API functions | None specific | Test all 8 API functions |
| Job hooks | None specific | Test useJobs, useJob, mutations |
| Job components | None | Test JobCard, ApplyModal, filters |
| Job schemas | None | Test Zod validation |
| Route guards | None specific | Test role-based access |

### 16.2 Test Utilities Available

- `tests/fixtures/handlers.ts` — MSW handlers (may need job-specific handlers)
- `tests/fixtures/test-utils.tsx` — Custom render with providers
- `tests/fixtures/server.ts` — MSW server setup

---

## 17. SUMMARY

The Job subsystem has a **solid API layer** (8 functions, 9 hooks, comprehensive types) but **significant UI gaps** compared to Design mockups. The highest-impact improvements are:

1. **Job Marketplace rewrite** — Hero, search, 2-col grid, proper cards (affects 100% of public users)
2. **Job Detail refactor** — Responsibilities, requirements, mobile layout (affects 100% of job viewers)
3. **Application Modal rewrite** — Profile section, char count, confirmation (affects all applicants)
4. **Saved Jobs rewrite** — Filter tabs, card grid, followed companies (affects all candidates)
5. **Recruiter table rewrite** — Filter tabs, columns, pagination, action menu (affects all recruiters)

**Recommended next phase**: Phase 7B — Public Pages (Marketplace + Job Detail + Mobile layouts)
