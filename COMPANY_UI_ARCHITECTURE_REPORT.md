# COMPANY_UI_ARCHITECTURE_REPORT.md

**Phase 6A — Company Module UI Architecture & UX Audit**

**Generated:** 2026-06-27
**Scope:** Public Company Directory, Public Company Profile, Recruiter Company Profile, Company Settings/Branding/Verification/Social Links/Statistics/Jobs/Overview/Gallery/Contact/Navigation, Company Empty/Loading/Error States
**Status:** READ-ONLY audit — no source code modifications

---

## 1. Executive Summary

### Overall Company Module Design Fidelity: **~45%**

| Area | Coverage | Assessment |
|------|----------|------------|
| **Company Directory (Public)** | 85% | Mock data, matches design grid/cards/search/pagination |
| **Company Profile (Public)** | 20% | Basic info card only — missing hero, about, jobs, sidebar, culture, tech stack, leadership |
| **Company Creation/Onboarding** | 0% | Not built — design exists with 5-section form + sidebar |
| **Company Admin Dashboard** | 40% | 4 stat tiles + info card — missing 8-tile grid, system health, activity feed |
| **Company Admin Profile** | 60% | Logo upload + basic form — missing brand color, HQ, founded, about textarea, verification |
| **Company Team** | 75% | DataTable with invite/promote/remove/transfer — functional |
| **Company Analytics** | 50% | 4 stat cards + Recharts — missing sparklines, system health band |
| **Company Audit Logs** | 70% | DataTable with expand/pagination — functional |
| **Company Notifications** | 70% | Notification list with mark read — functional |
| **Verification Badge** | 30% | Boolean text display only — no visual badge, no status machine |
| **Responsive Design** | 45% | Desktop sidebar works, mobile tabs work — but company profile/directory missing mobile-specific layouts |
| **Accessibility** | 40% | Semantic HTML present — missing ARIA labels on some buttons, no skip-to-content |

### Key Strengths
- Companies Directory page closely matches design (grid, cards, search, pagination)
- Company Team page is fully functional with DataTable, invite, role management
- Company Audit Logs and Notifications pages work with cursor-based pagination
- Company Admin Profile uses react-hook-form + Zod validation
- Recharts lazy-loaded in Analytics page

### Critical Gaps
- **Company Profile (Public)** is a bare-bones info card — design shows full profile with hero, about, jobs, sidebar
- **Company Creation/Onboarding** is not built — design shows 5-section form with sidebar
- **Verification Badge** has no visual implementation — just text color
- **Company Admin Dashboard** missing 4 of 8 stat tiles, system health, activity feed
- **Company Admin Profile** missing brand color, HQ, founded, about textarea, verification section
- No public company route (`/companies/$companyId`) — CompaniesPage links to non-existent route

---

## 2. Design Coverage Matrix

### 2.1 Company Profile Page (Public)

| Design Section | Design File | Implementation | Status |
|---------------|-------------|----------------|--------|
| Hero Section (logo + name + meta tags) | `company_profile_page/code.html` | NOT IMPLEMENTED | **MISSING** |
| Stats Bar (Team Strength, Established, HQ) | `company_profile_page/code.html` | NOT IMPLEMENTED | **MISSING** |
| About Us section | `company_profile_page/code.html` | NOT IMPLEMENTED | **MISSING** |
| Open Roles section (filter chips + job cards) | `company_profile_page/code.html` | NOT IMPLEMENTED | **MISSING** |
| Sidebar Action Card (Follow/View Jobs) | `company_profile_page/code.html` | NOT IMPLEMENTED | **MISSING** |
| Culture Metrics (progress bars) | `company_profile_page/code.html` | NOT IMPLEMENTED | **MISSING** |
| Tech Stack (tag chips) | `company_profile_page/code.html` | NOT IMPLEMENTED | **MISSING** |
| Leadership (avatar list) | `company_profile_page/code.html` | NOT IMPLEMENTED | **MISSING** |
| Mobile-specific layout (centered logo, bottom nav) | `company_profile_page_mobile_view/code.html` | NOT IMPLEMENTED | **MISSING** |
| Follow/Following state machine | `company_profile_page_following_state/code.html` | NOT IMPLEMENTED | **MISSING** |
| Refined Action variant (View Jobs) | `company_profile_page_refined_action/code.html` | NOT IMPLEMENTED | **MISSING** |

**Current Implementation:** `CompanyProfilePage.tsx` (NOT routed)
- Shows: logo, info card (email, industry, size, website), statistics card (jobs, members)
- Missing: hero section, stats bar, about section, open roles, sidebar, culture, tech stack, leadership, follow functionality, mobile layout

### 2.2 Company Directory (Public)

| Design Section | Design File | Implementation | Status |
|---------------|-------------|----------------|--------|
| Hero Section (breadcrumb + heading) | `companies_directory_page/code.html` | CompaniesPage.tsx | **MATCHES** |
| Search Box (label + input + EXECUTE button) | `companies_directory_page/code.html` | CompaniesPage.tsx | **MATCHES** |
| Grid Controls (results count + FILTER + SORT) | `companies_directory_page/code.html` | CompaniesPage.tsx | **MATCHES** |
| Company Grid (3-col, cards with logo/badge/name/industry/description/stats) | `companies_directory_page/code.html` | CompaniesPage.tsx | **MATCHES** |
| Pagination (terminal-style PREV/page numbers/NEXT) | `companies_directory_page/code.html` | CompaniesPage.tsx | **MATCHES** |
| Mobile Bottom Nav | `companies_directory_page/code.html` | NOT IMPLEMENTED | **MISSING** |

**Current Implementation:** `CompaniesPage.tsx` (routed at `/companies`)
- Uses mock data (6 companies) — no API integration
- Links to `/companies/$companyId` — route does NOT exist
- Matches design closely: search, filter/sort buttons, company cards with logo, HIRING badge, name, industry, description, stats grid, pagination

### 2.3 Company Creation/Onboarding Form

| Design Section | Design File | Implementation | Status |
|---------------|-------------|----------------|--------|
| Sidebar (brand + locked nav + progress) | `company_creation_form/code.html` | NOT IMPLEMENTED | **MISSING** |
| Top Header (status + recruiter ID) | `company_creation_form/code.html` | NOT IMPLEMENTED | **MISSING** |
| Form Header (heading + step counter) | `company_creation_form/code.html` | NOT IMPLEMENTED | **MISSING** |
| Section 1: Company Identity (name, website, industry) | `company_creation_form/code.html` | NOT IMPLEMENTED | **MISSING** |
| Section 2: Brand Assets (logo upload, brand color) | `company_creation_form/code.html` | NOT IMPLEMENTED | **MISSING** |
| Section 3: Company Details (size, HQ, founded) | `company_creation_form/code.html` | NOT IMPLEMENTED | **MISSING** |
| Section 4: About (textarea) | `company_creation_form/code.html` | NOT IMPLEMENTED | **MISSING** |
| Section 5: Verification (tax ID) | `company_creation_form/code.html` | NOT IMPLEMENTED | **MISSING** |
| Action Buttons (Back + Submit) | `company_creation_form/code.html` | NOT IMPLEMENTED | **MISSING** |
| Mobile Layout (no sidebar, fixed bottom bar) | `company_creation_form_mobile_view/code.html` | NOT IMPLEMENTED | **MISSING** |

**Current Implementation:** NONE
- Backend endpoint exists: `POST /auth/register/company`
- No route, no page, no form components
- Listed in MASTER_BACKLOG.md as missing page #3

### 2.4 Company Admin Dashboard

| Design Section | Design File | Implementation | Status |
|---------------|-------------|----------------|--------|
| 8-Tile Stat Grid (4+4 layout) | `admin_dashboard_overview_1/code.html` | 4 tiles only | **PARTIAL** |
| System Health Band (service status indicators) | `admin_dashboard_overview_1/code.html` | NOT IMPLEMENTED | **MISSING** |
| Recent Activity Feed (table with timestamps) | `admin_dashboard_overview_1/code.html` | NOT IMPLEMENTED | **MISSING** |
| Sidebar Navigation (6 items) | `admin_dashboard_overview_1/code.html` | CompanyLayout.tsx | **MATCHES** |
| Mobile Header + Bottom Nav | `admin_dashboard_overview_mobile_view/code.html` | CompanyLayout.tsx (mobile tabs) | **PARTIAL** |

**Current Implementation:** `CompanyDashboardPage.tsx`
- 4 stat tiles: Active Jobs, Applications, Team Members, Recent Activity
- Company Info section: ID, Email, Industry, Verification, Size, Created
- Logo section
- Missing: 4 more stat tiles (NEW_USERS/DAY, APPS_RECEIVED, HIRED_30D, FLAGGED_ACCOUNTS), sparklines, system health band, activity feed table

### 2.5 Company Admin Profile

| Design Section | Design File | Implementation | Status |
|---------------|-------------|----------------|--------|
| Logo Upload/Replace/Remove | `company_creation_form/code.html` | CompanyAdminProfilePage.tsx | **MATCHES** |
| Company Name input | `company_creation_form/code.html` | CompanyAdminProfilePage.tsx | **MATCHES** |
| Website URL input | `company_creation_form/code.html` | CompanyAdminProfilePage.tsx | **MATCHES** |
| Industry input | `company_creation_form/code.html` | CompanyAdminProfilePage.tsx | **MATCHES** |
| Company Size select | `company_creation_form/code.html` | CompanyAdminProfilePage.tsx | **MATCHES** |
| Brand Color picker | `company_creation_form/code.html` | NOT IMPLEMENTED | **MISSING** |
| HQ location input | `company_creation_form/code.html` | NOT IMPLEMENTED | **MISSING** |
| Founded year input | `company_creation_form/code.html` | NOT IMPLEMENTED | **MISSING** |
| About textarea | `company_creation_form/code.html` | NOT IMPLEMENTED | **MISSING** |
| Verification (Tax ID) section | `company_creation_form/code.html` | NOT IMPLEMENTED | **MISSING** |
| Unsaved changes warning | N/A | CompanyAdminProfilePage.tsx | **MATCHES** |

**Current Implementation:** `CompanyAdminProfilePage.tsx` (routed at `/company/profile`)
- Logo upload with preview and remove
- Form: name, website, industry, size (react-hook-form + Zod)
- Missing: brand color, HQ, founded, about textarea, verification section

### 2.6 Company Team

| Design Section | Design File | Implementation | Status |
|---------------|-------------|----------------|--------|
| Invite Member form | N/A (no design) | CompanyTeamPage.tsx | **EXISTS** |
| DataTable with columns | N/A (no design) | CompanyTeamPage.tsx | **EXISTS** |
| Role management (promote/demote) | N/A (no design) | CompanyTeamPage.tsx | **EXISTS** |
| Remove member (confirm dialog) | N/A (no design) | CompanyTeamPage.tsx | **EXISTS** |
| Transfer ownership (confirm dialog) | N/A (no design) | CompanyTeamPage.tsx | **EXISTS** |

**Current Implementation:** `CompanyTeamPage.tsx` (routed at `/company/team`)
- Full functionality: invite, search, DataTable, role management, remove, transfer
- No design reference — implemented from scratch

### 2.7 Company Analytics

| Design Section | Design File | Implementation | Status |
|---------------|-------------|----------------|--------|
| Overview Stats (4 cards) | `admin_dashboard_overview_2/code.html` | CompanyAnalyticsPage.tsx | **MATCHES** |
| Recent Applications (bar chart) | N/A (no design) | CompanyAnalyticsPage.tsx | **EXISTS** |
| Status Distribution (pie chart) | N/A (no design) | CompanyAnalyticsPage.tsx | **EXISTS** |
| Hiring Trend (bar chart) | N/A (no design) | CompanyAnalyticsPage.tsx | **EXISTS** |
| Sparklines on stat tiles | `admin_dashboard_overview_1/code.html` | NOT IMPLEMENTED | **MISSING** |

**Current Implementation:** `CompanyAnalyticsPage.tsx` (routed at `/company/analytics`)
- 4 stat cards + 3 Recharts visualizations (lazy-loaded)
- Missing: sparklines on stat tiles

### 2.8 Company Audit Logs

| Design Section | Design File | Implementation | Status |
|---------------|-------------|----------------|--------|
| DataTable with expandable rows | N/A (no design) | CompanyAuditLogsPage.tsx | **EXISTS** |
| Search + Action filter | N/A (no design) | CompanyAuditLogsPage.tsx | **EXISTS** |
| Cursor-based pagination | N/A (no design) | CompanyAuditLogsPage.tsx | **EXISTS** |

**Current Implementation:** `CompanyAuditLogsPage.tsx` (routed at `/company/audit-logs`)
- Full functionality: search, filter, DataTable, expandable detail, pagination
- No design reference — implemented from scratch

### 2.9 Company Notifications

| Design Section | Design File | Implementation | Status |
|---------------|-------------|----------------|--------|
| Notification list with read/unread | N/A (no design) | CompanyNotificationsPage.tsx | **EXISTS** |
| Mark as read / Mark all read | N/A (no design) | CompanyNotificationsPage.tsx | **EXISTS** |
| Cursor-based pagination | N/A (no design) | CompanyNotificationsPage.tsx | **EXISTS** |

**Current Implementation:** `CompanyNotificationsPage.tsx` (routed at `/company/notifications`)
- Full functionality: notification list, mark read, mark all read, pagination
- No design reference — implemented from scratch

---

## 3. Component Inventory

### 3.1 Shared Components Used by Company Feature

| Component | Path | Used By | Status |
|-----------|------|---------|--------|
| `DataTable` | `src/shared/components/table/DataTable.tsx` | TeamPage, AuditLogsPage | **EXISTS** |
| `TableToolbar` | `src/shared/components/table/TableToolbar.tsx` | TeamPage, AuditLogsPage | **EXISTS** |
| `TablePagination` | `src/shared/components/table/TablePagination.tsx` | AuditLogsPage | **EXISTS** |
| `ConfirmDialog` | `src/shared/components/dialogs/ConfirmDialog.tsx` | TeamPage | **EXISTS** |
| `LoadingState` | `src/shared/components/ux/LoadingState.tsx` | DashboardPage, AnalyticsPage, NotificationsPage, ProfilePage | **EXISTS** |
| `ErrorState` | `src/shared/components/ux/ErrorState.tsx` | DashboardPage, AnalyticsPage, NotificationsPage, ProfilePage | **EXISTS** |
| `EmptyState` | `src/shared/components/ux/EmptyState.tsx` | NOT USED | **NOT USED** |

### 3.2 Company-Specific Components

| Component | Path | Status |
|-----------|------|--------|
| `CompanyLayout` | `src/features/company/layout/CompanyLayout.tsx` | **EXISTS** — sidebar (desktop) + tabs (mobile) |
| `CompanyEditForm` | `src/features/company/components/CompanyEditForm.tsx` | **EXISTS** — unused (legacy, replaced by ProfilePage) |
| `CompanyLogoUpload` | `src/features/company/components/CompanyLogoUpload.tsx` | **EXISTS** — unused (legacy, replaced by ProfilePage) |
| `TeamSection` | `src/features/company/components/TeamSection.tsx` | **EXISTS** — unused (legacy, replaced by TeamPage) |

### 3.3 Missing Components (Design References Exist)

| Component | Design Reference | Priority |
|-----------|-----------------|----------|
| `CompanyHeroSection` | `company_profile_page/code.html` | HIGH |
| `CompanyStatsBar` | `company_profile_page/code.html` | HIGH |
| `CompanyAboutSection` | `company_profile_page/code.html` | HIGH |
| `CompanyOpenRoles` | `company_profile_page/code.html` | HIGH |
| `CompanySidebar` (Follow/ViewJobs, Culture, TechStack, Leadership) | `company_profile_page/code.html` | HIGH |
| `CompanyFollowButton` | `company_profile_page_following_state/code.html` | HIGH |
| `CompanyCreationForm` (5 sections) | `company_creation_form/code.html` | HIGH |
| `CompanyCreationSidebar` (locked nav + progress) | `company_creation_form/code.html` | MEDIUM |
| `SystemHealthBand` | `admin_dashboard_overview_1/code.html` | MEDIUM |
| `ActivityFeed` | `admin_dashboard_overview_1/code.html` | MEDIUM |
| `VerificationBadge` | Design concept (no specific file) | HIGH |
| `BrandColorPicker` | `company_creation_form/code.html` | MEDIUM |

---

## 4. Company Verification Badge Recommendations

### Current Implementation
- `CompanyProfile.isVerified` is a boolean field
- Dashboard shows text: "Verified" (green) or "Not verified" (amber)
- No visual badge component exists
- No verification status machine (pending/suspended)

### Design Analysis
- No verification badge appears in any company profile design files
- Company creation form has a "Verification" section (Section 5) for tax ID input
- Companies Directory has "HIRING" badges but no verification badges
- The `isVerified` field exists in `CompanyProfile` type

### Recommendations

| Item | Recommendation | Priority |
|------|---------------|----------|
| **Badge Visual** | Create a `VerificationBadge` component with shield icon + "VERIFIED" text in mono-label, `text--live` color, `border--live` border | HIGH |
| **Badge Placement** | Add next to company name in: Company Profile Hero, Company Directory Cards, Job Listing Company Info | HIGH |
| **Status Machine** | Extend `isVerified: boolean` to `verificationStatus: "PENDING" | "VERIFIED" | "SUSPENDED" | "NONE"` | MEDIUM |
| **Badge Variants** | PENDING = amber pulsing dot, VERIFIED = green shield check, SUSPENDED = red shield alert, NONE = no badge | MEDIUM |
| **Accessibility** | Badge should have `aria-label="Company verified"` or `aria-label="Company not verified"` | HIGH |
| **Iconography** | Use `Shield01Icon` or `ShieldTick01Icon` from Hugeicons | HIGH |
| **Color** | VERIFIED: `--live` (green), PENDING: `--primary-container` (amber), SUSPENDED: `--destructive` (red) | HIGH |

---

## 5. Recruiter Company Profile Findings

### Current Implementation
- `CompanyAdminProfilePage.tsx` at `/company/profile`
- Logo upload/delete with preview
- Form: name, website, industry, size (react-hook-form + Zod)
- Unsaved changes warning, Cancel/Save buttons

### Missing Sections (vs Design)

| Section | Design Reference | Status | Priority |
|---------|-----------------|--------|----------|
| Brand Color picker | `company_creation_form/code.html` Section 2 | MISSING | MEDIUM |
| HQ location input | `company_creation_form/code.html` Section 3 | MISSING | MEDIUM |
| Founded year input | `company_creation_form/code.html` Section 3 | MISSING | MEDIUM |
| About textarea | `company_creation_form/code.html` Section 4 | MISSING | HIGH |
| Verification (Tax ID) section | `company_creation_form/code.html` Section 5 | MISSING | HIGH |
| Company banner/cover image | Not in design | MISSING | LOW |
| Social links (LinkedIn, Twitter, etc.) | Not in design | MISSING | LOW |

### Validation Requirements
- Name: string, 2-100 chars (EXISTS)
- Website: URL format (EXISTS)
- Industry: string, max 100 chars (EXISTS)
- Size: enum of companySizes (EXISTS)
- Brand Color: hex color format (MISSING)
- HQ: string (MISSING)
- Founded: year format YYYY (MISSING)
- About: textarea (MISSING)
- Tax ID: string (MISSING)

### Backend Dependencies
- `PATCH /company/current` — update company (EXISTS)
- `POST /company/current/logo` — upload logo (EXISTS)
- `DELETE /company/current/logo` — delete logo (EXISTS)
- Missing: brand color, HQ, founded, about, tax ID fields in `UpdateCompanyPayload`

---

## 6. Public Company Profile Findings

### Current Implementation
- `CompanyProfilePage.tsx` — NOT ROUTED (no route file)
- Shows: logo, info card (email, industry, size, website), statistics (jobs, members)
- Unauthenticated view shows limited info with login prompt

### Missing Sections (vs Design)

| Section | Design Reference | Status | Priority |
|---------|-----------------|--------|----------|
| Hero Section (centered logo, name, meta tags) | `company_profile_page/code.html` | MISSING | HIGH |
| Stats Bar (Team Strength, Established, HQ) | `company_profile_page/code.html` | MISSING | HIGH |
| About Us section | `company_profile_page/code.html` | MISSING | HIGH |
| Open Roles section (filter chips + job cards) | `company_profile_page/code.html` | MISSING | HIGH |
| Sidebar Action Card (Follow/View Jobs CTA) | `company_profile_page/code.html` | MISSING | HIGH |
| Culture Metrics (progress bars) | `company_profile_page/code.html` | MISSING | MEDIUM |
| Tech Stack (tag chips) | `company_profile_page/code.html` | MISSING | MEDIUM |
| Leadership (avatar list) | `company_profile_page/code.html` | MISSING | MEDIUM |
| Follow/Following state machine | `company_profile_page_following_state/code.html` | MISSING | HIGH |
| Mobile-specific layout | `company_profile_page_mobile_view/code.html` | MISSING | HIGH |
| Bottom Navigation Bar (mobile) | `company_profile_page_mobile_view/code.html` | MISSING | MEDIUM |

### Backend Dependencies
- `GET /company/:companyId` — public company detail (EXISTS via `endpoints.company.byId`)
- Missing: public company jobs list endpoint
- Missing: public company "about" content field
- Missing: follow/unfollow company endpoint
- Missing: company culture/tech stack/leadership data fields

### Route Requirements
- Need route file: `src/routes/_public/companies.$companyId.tsx`
- Need page component: new `PublicCompanyProfilePage.tsx` or reuse/adapt `CompanyProfilePage.tsx`
- Need to add public layout wrapper (breadcrumbs, header/footer)

---

## 7. Navigation Audit

### 7.1 Company Listing Navigation

| Link | Target | Exists | Status |
|------|--------|--------|--------|
| Header "Companies" link | `/companies` | YES | **WORKS** |
| CompaniesPage card click | `/companies/$companyId` | NO | **BROKEN** — route does not exist |
| Footer "Companies" link | `/companies` | YES | **WORKS** |

### 7.2 Company Profile Navigation

| Link | Target | Exists | Status |
|------|--------|--------|--------|
| Back button (mobile) | Previous page | N/A | **MISSING** — no mobile layout |
| "View Jobs" CTA | Company jobs page | NO | **MISSING** — no jobs section |
| "Follow" button | Follow action | NO | **MISSING** — no follow functionality |
| Header nav → company page | `/companies/$companyId` | NO | **BROKEN** — route does not exist |

### 7.3 Company Admin Navigation

| Link | Target | Exists | Status |
|------|--------|--------|--------|
| Sidebar "Dashboard" | `/company` | YES | **WORKS** |
| Sidebar "Profile" | `/company/profile` | YES | **WORKS** |
| Sidebar "Team" | `/company/team` | YES | **WORKS** |
| Sidebar "Analytics" | `/company/analytics` | YES | **WORKS** |
| Sidebar "Audit Logs" | `/company/audit-logs` | YES | **WORKS** |
| Sidebar "Notifications" | `/company/notifications` | YES | **WORKS** |
| Mobile tabs | Same as sidebar | YES | **WORKS** |

### 7.4 Breadcrumbs

| Page | Breadcrumb | Status |
|------|-----------|--------|
| Companies Directory | Home / Companies | **WORKS** (via Breadcrumbs component) |
| Company Profile | Home / Companies / [Company] | **MISSING** — route does not exist |
| Company Admin pages | Home / Company / [Section] | **NOT APPLICABLE** — authenticated routes |

### 7.5 Broken Links Summary

| Link | Location | Issue | Severity |
|------|----------|-------|----------|
| `/companies/$companyId` | CompaniesPage card click | Route does not exist | **CRITICAL** |
| "View Jobs" CTA | Company Profile sidebar | No jobs section/route | **HIGH** |
| "Follow" button | Company Profile sidebar | No follow functionality | **HIGH** |
| Company admin → public profile | No link exists | Admin cannot view public profile | **MEDIUM** |

---

## 8. UX Audit

### 8.1 Visual Hierarchy

| Page | Hierarchy | Assessment |
|------|-----------|------------|
| Companies Directory | Heading → Search → Grid Controls → Company Cards → Pagination | **GOOD** — matches design |
| Company Profile | NOT BUILT | **N/A** |
| Company Admin Dashboard | Heading → Stats → Info Card → Logo | **FAIR** — missing visual density |
| Company Admin Profile | Heading → Logo Section → Form | **GOOD** — clear section separation |
| Company Team | Heading → Invite Button → Search → DataTable | **GOOD** — functional layout |
| Company Analytics | Heading → Stats → Charts | **GOOD** — clear data presentation |
| Company Audit Logs | Heading → Search/Filter → DataTable → Pagination | **GOOD** — functional layout |
| Company Notifications | Heading → Mark All Read → Notification List → Pagination | **GOOD** — functional layout |

### 8.2 Trust Indicators

| Indicator | Design | Implementation | Status |
|-----------|--------|----------------|--------|
| Verification Badge | Not in design files | Text only ("Verified"/"Not verified") | **WEAK** |
| Company Logo | Design shows 64×64 with border | 16×16 in dashboard, 14×14 in profile | **UNDERSIZED** |
| Company Stats | Design shows 3-col bar (Team Strength, Established, HQ) | Not implemented | **MISSING** |
| Social Proof | Design shows "HIRING" badge in directory | Implemented in CompaniesPage | **EXISTS** |
| About Section | Design shows rich text + hero image | Not implemented | **MISSING** |

### 8.3 CTA Placement

| CTA | Design | Implementation | Status |
|-----|--------|----------------|--------|
| "Follow" (Company Profile) | Sidebar card, full-width | NOT IMPLEMENTED | **MISSING** |
| "View Jobs" (Company Profile) | Sidebar card variant | NOT IMPLEMENTED | **MISSING** |
| "Post a Job" (Dashboard) | NOT IN DESIGN | NOT IMPLEMENTED | **N/A** |
| "Invite Member" (Team) | NOT IN DESIGN | Top-right button | **EXISTS** |
| "EXECUTE" (Directory Search) | Right-aligned button | Implemented | **MATCHES** |

### 8.4 Responsive Design

| Page | Desktop | Mobile | Assessment |
|------|---------|--------|------------|
| Companies Directory | 3-col grid | Single column | **GOOD** — but missing mobile bottom nav |
| Company Profile | NOT BUILT | NOT BUILT | **N/A** |
| Company Admin Dashboard | Sidebar + content | Top tabs + content | **GOOD** — layout works |
| Company Admin Profile | Full width form | Full width form | **GOOD** — responsive grid for fields |
| Company Team | DataTable | DataTable (responsive) | **GOOD** — hideOnMobile columns |
| Company Analytics | 2-col charts | Single column | **GOOD** — ResponsiveContainer |
| Company Audit Logs | DataTable | DataTable (responsive) | **GOOD** — hideOnMobile columns |
| Company Notifications | Full width list | Full width list | **GOOD** — no issues |

### 8.5 Accessibility

| Feature | Status | Assessment |
|---------|--------|------------|
| Semantic HTML | `<header>`, `<main>`, `<nav>`, `<section>` | **GOOD** |
| ARIA labels on nav | `aria-label="Company administration navigation"` | **GOOD** |
| aria-current on active nav | `aria-current="page"` | **GOOD** |
| Form labels | `htmlFor` on all inputs | **GOOD** |
| Focus indicators | `focus-visible:outline` on interactive elements | **GOOD** |
| Skip-to-content | NOT IMPLEMENTED | **MISSING** |
| aria-describedby on errors | NOT IMPLEMENTED | **MISSING** |
| Screen reader text for icons | `aria-hidden="true"` on decorative icons | **GOOD** |
| Keyboard navigation | Standard tab order | **GOOD** |

---

## 9. Engineering Blueprint

### 9.1 Public Company Profile Page

**Expected Files:**
- `src/routes/_public/companies.$companyId.tsx` (NEW — route file)
- `src/features/public/pages/PublicCompanyProfilePage.tsx` (NEW — page component)

**Reusable Components:**
- `Breadcrumbs` (from `src/shared/components/ux/Breadcrumbs.tsx`)
- `LoadingState` (from `src/shared/components/ux/LoadingState.tsx`)
- `ErrorState` (from `src/shared/components/ux/ErrorState.tsx`)
- `EmptyState` (from `src/shared/components/ux/EmptyState.tsx`)
- `PublicHeader` / `PublicFooter` (from `_public.tsx` layout)
- `HugeiconsIcon` + Hugeicons (Shield01Icon, Location01Icon, etc.)

**Backend Dependencies:**
- `GET /company/:companyId` — public company detail (EXISTS)
- `GET /job?companyId=:id` — public company jobs (MISSING — need public endpoint)

**New Data Fields Required:**
- `about: string` — company description/bio
- `founded: string` — year founded
- `headquarters: string` — HQ location
- `brandColor: string` — hex color
- `techStack: string[]` — array of technologies
- `culture: string` — culture description
- `leadership: { name: string, role: string, avatarUrl: string }[]` — team leaders
- `socialLinks: { linkedin?: string, twitter?: string, github?: string }` — social profiles

**Design References:**
- `Design/company_profile_page/code.html` — desktop hero, about, jobs, sidebar
- `Design/company_profile_page_mobile_view/code.html` — mobile layout
- `Design/company_profile_page_following_state/code.html` — following state
- `Design/company_profile_page_refined_action/code.html` — non-auth variant

**Acceptance Criteria:**
- [ ] Route exists at `/companies/$companyId`
- [ ] Hero section with centered logo (64px), company name, meta tags (industry, size)
- [ ] Stats bar (3-col): Team Strength, Established, HQ
- [ ] About Us section with text + hero image placeholder
- [ ] Open Roles section with filter chips + job cards
- [ ] Sidebar: Action Card (Follow/View Jobs), Culture Metrics, Tech Stack, Leadership
- [ ] Follow/Following state machine (auth-only)
- [ ] Mobile layout: centered logo, bottom nav, adapted sections
- [ ] Breadcrumbs: Home / Companies / [Company Name]
- [ ] Loading/error/empty states handled
- [ ] Responsive: single-column mobile, 2-column desktop (8+4 grid)
- [ ] Accessible: semantic HTML, ARIA labels, keyboard navigation

**Potential Risks:**
- Backend may not have public company detail endpoint (need to verify)
- Backend may not have company jobs listing endpoint (need to create)
- New data fields (about, techStack, culture, leadership) need backend schema changes
- Follow/unfollow functionality needs new API endpoint
- Mobile layout differs significantly from desktop (two separate designs)

### 9.2 Company Creation/Onboarding Form

**Expected Files:**
- `src/routes/_authenticated/company/create.tsx` (NEW — route file)
- `src/features/company/pages/CompanyCreationPage.tsx` (NEW — page component)
- `src/features/company/components/CompanyCreationSidebar.tsx` (NEW — sidebar component)
- `src/features/company/components/CompanyCreationForm.tsx` (NEW — form component)

**Reusable Components:**
- `LoadingState`, `ErrorState`
- `HugeiconsIcon` + Hugeicons (FactoryIcon, UploadFileIcon, ShieldIcon, etc.)
- `PasswordField` pattern (from `src/shared/components/forms/PasswordField.tsx`)

**Backend Dependencies:**
- `POST /auth/register/company` — create company (EXISTS)

**New Schema Fields:**
- `brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/)` — hex color
- `headquarters: z.string().max(200)` — HQ location
- `founded: z.string().regex(/^\d{4}$/)` — year
- `about: z.string().max(2000)` — description
- `taxId: z.string().max(100)` — business tax ID

**Design References:**
- `Design/company_creation_form/code.html` — desktop 5-section form + sidebar
- `Design/company_creation_form_mobile_view/code.html` — mobile layout

**Acceptance Criteria:**
- [ ] Route exists at `/company/create`
- [ ] Sidebar with brand, locked nav items, progress indicator (Step 02)
- [ ] 5-section form: Company Identity, Brand Assets, Company Details, About, Verification
- [ ] Logo upload zone (dashed border, 2MB max, SVG/PNG)
- [ ] Brand color picker (native color input + hex display)
- [ ] Company size select, HQ input, Founded year input
- [ ] About textarea with helper text
- [ ] Verification section with tax ID input
- [ ] Back/Submit action buttons
- [ ] Mobile layout: no sidebar, fixed bottom submit bar
- [ ] Form validation with Zod
- [ ] Loading/success/error states
- [ ] Redirect to dashboard on success

**Potential Risks:**
- Backend `POST /auth/register/company` may not accept all new fields
- Brand color picker needs careful UX (native input is inconsistent across browsers)
- Sidebar locked nav items need careful implementation (CSS grayscale + not-allowed cursor)
- Mobile fixed bottom bar needs safe area insets (`pb-safe`)

### 9.3 Company Profile Updates (Admin)

**Expected Files:**
- Modify: `src/features/company/pages/CompanyAdminProfilePage.tsx`
- Modify: `src/features/company/schemas/index.ts`
- Modify: `src/features/company/types/index.ts`
- Modify: `src/features/company/api/index.ts`

**New Form Fields to Add:**
- Brand Color (color picker)
- HQ Location (text input)
- Founded Year (number input)
- About (textarea)
- Verification Status (read-only display)

**Design References:**
- `Design/company_creation_form/code.html` — form field patterns

**Acceptance Criteria:**
- [ ] Brand color picker with hex display
- [ ] HQ location input
- [ ] Founded year input (YYYY format)
- [ ] About textarea with character count
- [ ] Verification status display (badge component)
- [ ] All new fields in Zod schema
- [ ] All new fields in API payload
- [ ] Backend endpoint updated to accept new fields

### 9.4 Verification Badge Component

**Expected Files:**
- `src/shared/components/ux/VerificationBadge.tsx` (NEW)

**Design References:**
- Design concept (no specific file) — shield icon + status text

**Acceptance Criteria:**
- [ ] Accepts `status: "VERIFIED" | "PENDING" | "SUSPENDED" | "NONE"`
- [ ] VERIFIED: green shield check + "VERIFIED" text
- [ ] PENDING: amber pulsing dot + "PENDING" text
- [ ] SUSPENDED: red shield alert + "SUSPENDED" text
- [ ] NONE: no badge rendered
- [ ] `aria-label` for screen readers
- [ ] Configurable size (sm/md/lg)
- [ ] Used in: Company Profile Hero, Company Directory Cards, Job Listing Company Info

---

## 10. Backend Dependencies

### 10.1 Existing Endpoints (Used by Company Feature)

| Endpoint | Method | Used By | Status |
|----------|--------|---------|--------|
| `/company/current` | GET | DashboardPage, ProfilePage | **EXISTS** |
| `/company/:id` | GET | CompanyProfilePage | **EXISTS** |
| `/company/current` | PATCH | AdminProfilePage | **EXISTS** |
| `/company/current/logo` | POST | AdminProfilePage | **EXISTS** |
| `/company/current/logo` | DELETE | AdminProfilePage | **EXISTS** |
| `/company/team` | GET | TeamPage | **EXISTS** |
| `/company/invite` | POST | TeamPage | **EXISTS** |
| `/company/team/:id/role` | PATCH | TeamPage | **EXISTS** |
| `/company/team/:id` | DELETE | TeamPage | **EXISTS** |
| `/company/transfer-ownership/:id` | POST | TeamPage | **EXISTS** |
| `/company/analytics` | GET | AnalyticsPage | **EXISTS** |
| `/company/audit-logs` | GET | AuditLogsPage | **EXISTS** |
| `/company/notifications` | GET | NotificationsPage | **EXISTS** |
| `/company/notifications/:id/read` | PATCH | NotificationsPage | **EXISTS** |
| `/company/notifications/read` | POST | NotificationsPage | **EXISTS** |

### 10.2 Missing Endpoints (Required for New Features)

| Endpoint | Method | Required For | Priority |
|----------|--------|-------------|----------|
| `/company/:id/public` | GET | Public Company Profile | HIGH |
| `/company/:id/jobs` | GET | Public Company Jobs List | HIGH |
| `/company/:id/follow` | POST | Follow Company | HIGH |
| `/company/:id/unfollow` | POST | Unfollow Company | HIGH |
| `/company/:id/is-following` | GET | Check Follow Status | HIGH |
| `/auth/register/company` | POST | Company Creation (EXISTS, may need field updates) | MEDIUM |

### 10.3 Missing Data Fields

| Field | Type | Required For | Priority |
|-------|------|-------------|----------|
| `about` | string | Company Profile, Creation Form | HIGH |
| `founded` | string | Company Profile, Creation Form | HIGH |
| `headquarters` | string | Company Profile, Creation Form | HIGH |
| `brandColor` | string | Creation Form, Profile | MEDIUM |
| `techStack` | string[] | Company Profile Sidebar | MEDIUM |
| `culture` | string | Company Profile Sidebar | MEDIUM |
| `leadership` | object[] | Company Profile Sidebar | MEDIUM |
| `socialLinks` | object | Company Profile | LOW |
| `verificationStatus` | enum | Verification Badge | HIGH |
| `taxId` | string | Creation Form Verification | MEDIUM |

---

## 11. Summary of Findings

### Pages Status

| Page | Route | Status | Priority |
|------|-------|--------|----------|
| Companies Directory | `/companies` | **EXISTS** (mock data) | HIGH |
| Company Profile (Public) | `/companies/$companyId` | **MISSING** | CRITICAL |
| Company Creation | `/company/create` | **MISSING** | HIGH |
| Company Dashboard | `/company` | **PARTIAL** | MEDIUM |
| Company Profile (Admin) | `/company/profile` | **PARTIAL** | MEDIUM |
| Company Team | `/company/team` | **COMPLETE** | LOW |
| Company Analytics | `/company/analytics` | **PARTIAL** | LOW |
| Company Audit Logs | `/company/audit-logs` | **COMPLETE** | LOW |
| Company Notifications | `/company/notifications` | **COMPLETE** | LOW |

### Components Status

| Component | Status | Priority |
|-----------|--------|----------|
| CompanyLayout | **EXISTS** | LOW |
| VerificationBadge | **MISSING** | HIGH |
| CompanyHeroSection | **MISSING** | HIGH |
| CompanyStatsBar | **MISSING** | HIGH |
| CompanyAboutSection | **MISSING** | HIGH |
| CompanyOpenRoles | **MISSING** | HIGH |
| CompanySidebar (Follow/Culture/TechStack/Leadership) | **MISSING** | HIGH |
| CompanyCreationForm | **MISSING** | HIGH |
| CompanyCreationSidebar | **MISSING** | MEDIUM |
| BrandColorPicker | **MISSING** | MEDIUM |
| SystemHealthBand | **MISSING** | LOW |
| ActivityFeed | **MISSING** | LOW |

### Backend Requirements

| Requirement | Type | Priority |
|-------------|------|----------|
| Public company detail endpoint | API | HIGH |
| Public company jobs endpoint | API | HIGH |
| Follow/unfollow company endpoints | API | HIGH |
| Company about/founded/HQ fields | Schema | HIGH |
| Company techStack/culture/leadership fields | Schema | MEDIUM |
| Company verificationStatus field | Schema | HIGH |
| Brand color field | Schema | MEDIUM |

---

## 12. Implementation Roadmap

### Phase 6B — Critical Path (Recommended Next)

| Task | Effort | Dependencies |
|------|--------|-------------|
| Create Public Company Profile route + page | HIGH | Backend public endpoint |
| Create VerificationBadge component | LOW | None |
| Add VerificationBadge to Company Profile, Directory, Job Listing | LOW | VerificationBadge |
| Fix CompaniesPage card links to use real company IDs | LOW | Public company endpoint |

### Phase 6C — Company Creation

| Task | Effort | Dependencies |
|------|--------|-------------|
| Create Company Creation route + page | HIGH | Backend field updates |
| Create Company Creation Sidebar | MEDIUM | None |
| Create Company Creation Form (5 sections) | HIGH | Backend field updates |
| Mobile layout for creation form | MEDIUM | Company Creation page |

### Phase 6D — Profile Enrichment

| Task | Effort | Dependencies |
|------|--------|-------------|
| Add about/founded/HQ fields to Admin Profile | MEDIUM | Backend schema |
| Add brand color picker to Admin Profile | LOW | Backend schema |
| Add about/founded/HQ to Public Profile | MEDIUM | Backend schema |
| Add Company Sidebar (Culture, TechStack, Leadership) | HIGH | Backend schema |

### Phase 6E — Dashboard Enhancement

| Task | Effort | Dependencies |
|------|--------|-------------|
| Add 4 more stat tiles to Dashboard | MEDIUM | None |
| Add sparklines to stat tiles | MEDIUM | None |
| Add System Health Band | LOW | Backend health endpoint |
| Add Activity Feed table | MEDIUM | Backend activity endpoint |

---

**Report Complete — Phase 6A Audit**
