# PostBoard — Comprehensive Project Audit (Revision 2)

**Audit Date:** 2026-06-25
**Auditor:** Principal Software Architect / Senior Frontend Engineer / UI-UX Reviewer / Technical Auditor
**Codebase Revision:** Postboard Fix R (Second Submission)
**Backend Reference:** JobBoard (read-only)
**Prior Audit:** Postboard Fix R (First Submission) — June 24, 2026
**New Documentation Files Found:** `DESIGN_COMPLIANCE.md`, `DESIGN_COVERAGE.md`, `ARCHITECTURE.md`, `DEPLOYMENT.md`

---

## Changelog Since Prior Audit

| Item | Prior Status | Current Status |
|------|-------------|----------------|
| CRIT-01: `endpoints.ts` hardcodes `localhost:5000` | OPEN | **OPEN — Not Fixed** |
| CRIT-02: SuperAdmin API files hardcode `localhost:5000` | OPEN | **OPEN — Not Fixed** |
| CRIT-03: `lucide-react` installed and used | OPEN | **OPEN — Not Fixed** |
| CRIT-04: `CandidateProfilePage` bypasses RHF+Zod | OPEN | **OPEN — Not Fixed** |
| CRIT-05: TanStack Table not used anywhere | OPEN | **OPEN — Not Fixed** |
| CRIT-06: SuperAdmin sidebar links broken | OPEN | **OPEN — Not Fixed** |
| CRIT-07: SuperAdmin session not restored on refresh | OPEN | **OPEN — Not Fixed** |
| HIGH-01: Auth server state duplicated in Zustand | OPEN | **OPEN — Not Fixed** |
| HIGH-02: `--radius` token not zeroed | OPEN | **OPEN — Not Fixed** |
| HIGH-03: Shadows in shadcn components | OPEN | **OPEN — Not Fixed** |
| HIGH-04: Candidate/Recruiter dashboards are stubs | OPEN | **OPEN — Not Fixed** |
| HIGH-05: Recruiter analytics missing | OPEN | **OPEN — Not Fixed** |
| HIGH-06: Public landing page missing | OPEN | **OPEN — Not Fixed** |
| HIGH-07: Legacy CSS tokens pollute stylesheet | OPEN | **OPEN — Not Fixed** |
| HIGH-08: DevTools ship in production | OPEN | **OPEN — Not Fixed** |
| HIGH-09: SavedJobs uses raw `localStorage` | OPEN | **OPEN — Not Fixed** |
| HIGH-10: Analytics uses hardcoded hex colors | OPEN | **OPEN — Not Fixed** |
| MED-01: Recruiter sidebar "Applicants" link broken | OPEN | **OPEN — Not Fixed** |
| MED-03: SSR risk in root route `beforeLoad` | OPEN | **FIXED** — `if (typeof window === "undefined") return` added |
| MED-05: Gradient tokens missing from `styles.css` | OPEN | **FIXED** — `--gradient-a/b/c/d` added to CSS |
| MED-06: SuperAdmin query keys not centralized | OPEN | **OPEN — Not Fixed** |

**New issues discovered** from the Design folder (87 screens vs the prior audit which lacked Design folder access):

- N-01: Recruiter Talent Pool feature missing (design exists)
- N-02: Companies Directory page missing (design exists)
- N-03: 9 public website pages missing (Features, About, Contact, Privacy, Terms, Pricing, Maintenance, Access Restricted, Action Not Allowed)
- N-04: Body text size drift — DESIGN.md specifies 15px; many components use 13px
- N-05: Job card layout — design shows 2-column grid; implementation uses 1-column stack
- N-06: SuperAdmin has no mobile navigation whatsoever
- N-07: Icon system drift — design uses Material Symbols Outlined; implementation uses HugeIcons
- N-08: Candidate dashboard design exists (full stats, charts) but implementation is still a stub
- N-09: Empty States Reference Guide design exists (`Design/empty_states_reference_guide/`) but no shared empty state component library was built against it

---

## Executive Summary

| Dimension | Score | Delta |
|-----------|-------|-------|
| **Architecture Compliance** | 72 / 100 | ↔ No change — zero critical items resolved |
| **Design Compliance** | 55 / 100 | ↓ Lower with full Design folder visibility (87 screens, 38% unimplemented) |
| **API Compliance** | 65 / 100 | ↔ No change |
| **Production Readiness** | 35 / 100 | ↔ No change — all release blockers open |
| **Overall Health** | 55 / 100 | ↓ Slightly lower with full picture of missing screens |

---

## Critical Issues

> All 7 critical issues from the prior audit remain open. They are re-documented here with updated evidence.

---

### CRIT-01 — `endpoints.ts` Hardcodes `localhost:5000` — `VITE_API_URL` Ignored

**Status:** UNRESOLVED

**Evidence:** `src/lib/api/endpoints.ts` line 1: `const BASE_URL = "http://localhost:5000/api/v1"`. `src/lib/env.ts` correctly validates `VITE_API_URL` with a fallback, but `endpoints.ts` never imports `env`. Every primary API domain (auth, user, job, company, notification, admin) hits the hardcoded address.

**Impact:** The application is non-deployable. Setting `VITE_API_URL` in any CI/CD environment has zero effect.

**Recommended Fix:** `import { env } from "@/lib/env"` and change `const BASE_URL` to `const BASE_URL = env.apiUrl`.

**Priority:** P0 — Release Blocker
**Affected Files:** `src/lib/api/endpoints.ts`

---

### CRIT-02 — SuperAdmin API Files Independently Hardcode `localhost:5000`

**Status:** UNRESOLVED

**Evidence:** All five files confirmed: `src/features/superadmin/api/auth.ts`, `users.ts`, `dashboard.ts`, `companies.ts`, `jobs.ts` each declare `const BASE_URL = "http://localhost:5000/api/v1"`.

**Impact:** SuperAdmin feature is non-functional in any deployment even after CRIT-01 is fixed.

**Recommended Fix:** Remove per-file `BASE_URL`. Extend the shared `endpoints` object with a `superadmin` namespace using `env.apiUrl`.

**Priority:** P0 — Release Blocker
**Affected Files:** `src/features/superadmin/api/*.ts` (5 files)

---

### CRIT-03 — `lucide-react` Present Despite Explicit Prohibition

**Status:** UNRESOLVED

**Evidence:** `package.json` lists `"lucide-react": "^0.577.0"`. Four shadcn component files confirmed: `dropdown-menu.tsx` (CheckIcon, ChevronRightIcon, CircleIcon), `dialog.tsx` (XIcon), `sheet.tsx` (XIcon), `select.tsx` (CheckIcon, ChevronDownIcon, ChevronUpIcon). CLAUDE.md Forbidden Technologies section explicitly lists "Lucide Icons."

**Impact:** Governance violation. Two competing icon systems in the production bundle.

**Recommended Fix:** Replace Lucide imports in the four shadcn components with equivalent HugeIcons. Remove `lucide-react` from `package.json`.

**Priority:** P0 — Architecture Violation
**Affected Files:** `src/components/ui/dropdown-menu.tsx`, `dialog.tsx`, `sheet.tsx`, `select.tsx`, `package.json`

---

### CRIT-04 — `CandidateProfilePage` Does Not Use React Hook Form + Zod

**Status:** UNRESOLVED

**Evidence:** `src/features/profile/pages/candidate/CandidateProfilePage.tsx` lines 20–28 confirm raw `useState` management for `firstName`, `lastName`, `bio`, `location`, `linkedinUrl`, `githubUrl`, `skills`. `profileSchema` is defined in `src/features/profile/schemas/index.ts` but never imported.

**Impact:** Direct violation of AGENTS.md Forms Agent mandate. No field-level validation, no schema-driven error display.

**Recommended Fix:** Migrate to `useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) })` with shadcn Form primitives.

**Priority:** P0 — Policy Violation
**Affected Files:** `src/features/profile/pages/candidate/CandidateProfilePage.tsx`

---

### CRIT-05 — TanStack Table Not Used Anywhere

**Status:** UNRESOLVED

**Evidence:** `grep -rn "useReactTable" src/` returns zero results. All data tables in `AdminUsersPage`, `AdminJobsPage`, `AdminCompaniesPage`, `SuperAdminUsersPage`, `SuperAdminCompaniesPage`, `SuperAdminAuditLogsPage`, `RecruiterJobManagement` use custom `<table>` HTML with array mapping.

**Impact:** Core technology mandate unmet. Missing column sorting, filtering, visibility toggling, row selection, bulk actions.

**Recommended Fix:** Create shared `<DataTable<T>>` wrapper using `useReactTable`. Migrate admin tables first, then recruiter tables.

**Priority:** P0 — Architecture Mandate Not Met
**Affected Files:** All table components in `src/features/admin/` and `src/features/superadmin/` and `src/features/jobs/components/RecruiterJobManagement.tsx`

---

### CRIT-06 — SuperAdmin Sidebar Links Route to Admin-Protected Routes

**Status:** UNRESOLVED

**Evidence:** `src/components/layout/Sidebar.tsx` `navConfig.SUPERADMIN` confirmed:
```
{ label: "Users", href: "/admin/users" }
{ label: "Jobs", href: "/admin/jobs" }
{ label: "Companies", href: "/admin/companies" }
{ label: "Analytics", href: "/admin/analytics" }
```
These routes use `requireRole(["ADMIN"])`. SuperAdmin role is not in that allowlist.

**Impact:** Every SuperAdmin sidebar link except Dashboard silently fails authorization and redirects back to the SuperAdmin dashboard. The SuperAdmin portal is navigationally broken.

**Recommended Fix:** Update `navConfig.SUPERADMIN` to use `/superadmin/users`, `/superadmin/companies`, `/superadmin/dashboard`. Analytics requires a new route or shared route that permits both roles.

**Priority:** P0 — Functional Regression
**Affected Files:** `src/components/layout/Sidebar.tsx`

---

### CRIT-07 — SuperAdmin Session Not Restored on Page Refresh

**Status:** UNRESOLVED

**Evidence:** `src/stores/superadmin-auth-store.ts` confirmed: `isInitialized: true` (hardcoded initial value), no `restoreSession()` method. `AuthInitializer` only calls `useAuthStore.restoreSession()` — no SuperAdmin equivalent. On page load, `isAuthenticated` resets to `false`, and `requireSuperAdmin()` redirects to `/superadmin/login`.

**Impact:** SuperAdmin users are logged out on every page refresh. The portal is unusable for any workflow spanning a page reload.

**Recommended Fix:** Add `restoreSession()` to `useSuperAdminAuthStore` — check `superAdminTokenStorage.hasSession()` and call `/superadmin/current` or decode JWT. Call it in `AuthInitializer` alongside the regular session restore.

**Priority:** P0 — Functional Regression
**Affected Files:** `src/stores/superadmin-auth-store.ts`, `src/providers/AuthInitializer.tsx`

---

## High Priority Issues

> All 10 high-priority issues from the prior audit remain open.

---

### HIGH-01 — Auth Store Duplicates Server State in Zustand

**Status:** UNRESOLVED

**Evidence:** `src/features/auth/hooks/index.ts` `useCurrentUser()` — the query function calls `setUser(user)` on the Zustand store after each successful fetch. `useLogin()` and `useRegister()` also call `setUser(user)` directly. The Zustand `auth-store` stores `user: CurrentUser | null` and `role: UserRole | null` — both are server state from `/user/current`.

**Impact:** Potential stale role/profile data in UI when TanStack Query refetches but Zustand update is missed. Violates AGENTS.md: "Never store server state in Zustand."

**Recommended Fix:** Remove `user` and `role` fields from `useAuthStore`. Keep only `isAuthenticated`, `isInitialized`, `isRestoringSession`. Components needing user data call `useCurrentUser()` directly.

**Priority:** P1
**Affected Files:** `src/stores/auth-store.ts`, `src/features/auth/hooks/index.ts`

---

### HIGH-02 — shadcn Components Retain Rounded Corners — `--radius: 0.625rem`

**Status:** UNRESOLVED

**Evidence:** `src/styles.css` line 63: `--radius: 0.625rem`. Lines 219–222 cascade `--radius-sm/md/lg/xl` from it. `dialog.tsx` applies `rounded-lg`, `dropdown-menu.tsx` applies `rounded-md`, `select.tsx` applies `rounded-md` and `rounded-sm`. DESIGN.md: "Default: 0px."

**Impact:** Every modal, dropdown, and select renders with 8–10px rounded corners, contradicting the Industrial Broadsheet zero-radius geometry.

**Recommended Fix:** Set `--radius: 0px` in the CSS design token block. Replace `rounded-md/lg/sm` in shadcn components with `rounded-none`. Keep `rounded-[2px]` only for status badges.

**Priority:** P1
**Affected Files:** `src/styles.css`, `src/components/ui/dialog.tsx`, `src/components/ui/dropdown-menu.tsx`, `src/components/ui/select.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/tabs.tsx`

---

### HIGH-03 — Shadow Utilities in shadcn Components Violate Design Rules

**Status:** UNRESOLVED

**Evidence:** `dialog.tsx`: `shadow-lg`. `dropdown-menu.tsx`: `shadow-md`, `shadow-lg`. `select.tsx`: `shadow-xs`, `shadow-md`. `sheet.tsx`: `shadow-lg`. DESIGN.md: "Shadows: Not allowed. Use Borders, Contrast, Tonal Layering."

**Recommended Fix:** Remove all `shadow-*` utilities. Replace with `border border-(--rule)` on floating surfaces.

**Priority:** P1
**Affected Files:** `src/components/ui/dialog.tsx`, `src/components/ui/dropdown-menu.tsx`, `src/components/ui/select.tsx`, `src/components/ui/sheet.tsx`

---

### HIGH-04 — Candidate and Recruiter Dashboards Are Placeholder Stubs

**Status:** UNRESOLVED

**Evidence:** Both `_authenticated/candidate/dashboard.tsx` and `_authenticated/recruiter/dashboard.tsx` confirmed: static welcome text only. Design reference `Design/candidate_dashboard_overview/code.html` shows 6 stat tiles (Applications, Interviews, Offers, Active, Saved, Views), a radar chart, and a company follow feed. `Design/recruiter_dashboard_overview/code.html` shows 6 stat tiles (Active Jobs, Total Applicants, New This Week, Avg. Time to Hire, Hired 30d, Pipeline Health) with quick action buttons. `DESIGN_COMPLIANCE.md` scores Recruiter Dashboard at 25%, Candidate Dashboard at 75% (candidate has partial shell, recruiter has none).

**Impact:** The two most-visited routes for regular users deliver zero functional value.

**Recommended Fix:** Implement `CandidateDashboardPage` in `src/features/`. Use `useMyApplications()` for stats, Recharts RadarChart for skills/activity, and followed companies list. Implement `RecruiterDashboardPage` using `useJobs()`, pipeline summary from applications, and Recharts BarChart for time-to-hire.

**Priority:** P1
**Affected Files:** `src/routes/_authenticated/candidate/dashboard.tsx`, `src/routes/_authenticated/recruiter/dashboard.tsx` (+ new feature pages)

---

### HIGH-05 — Recruiter Analytics Feature Missing

**Status:** UNRESOLVED

**Evidence:** `find src/ -name "*analytic*" | grep -i recruiter` returns nothing. Design folder contains `Design/recruiter_analytics_dashboard/code.html` and `Design/recruiter_analytics_mobile_view/code.html` — both with full Recharts-compatible hiring funnel, conversion rates, and KPI sections.

**Recommended Fix:** Create `src/features/applications/pages/recruiter/RecruiterAnalyticsPage.tsx` and route `_authenticated/recruiter/analytics.tsx`.

**Priority:** P1
**Affected Files:** New files required

---

### HIGH-06 — Public Landing Page Missing

**Status:** UNRESOLVED

**Evidence:** `src/routes/index.tsx` confirmed: `throw redirect({ to: "/login" })` for unauthenticated users. Design folder has `Design/landing_page_desktop/code.html`, `Design/public_landing_page/code.html`, and `Design/landing_page_mobile_view/code.html` with full Press Grid hero, stats bar, feature sections, CTA band.

**Impact:** The root URL renders the login page for all unauthenticated visitors. Zero public surface area. SEO nonexistent.

**Recommended Fix:** Implement a public landing page at `/` that only redirects authenticated users. For unauthenticated users, render the marketing page.

**Priority:** P1
**Affected Files:** `src/routes/index.tsx`

---

### HIGH-07 — Legacy CSS Tokens Pollute `styles.css`

**Status:** UNRESOLVED

**Evidence:** `styles.css` lines 19–31 confirmed: `--sea-ink`, `--sea-ink-soft`, `--lagoon`, `--lagoon-deep`, `--palm`, `--sand`, `--foam`, `--bg-base` in light block. Lines 137–149: same tokens in dark block with different values. These are remnants of a prior ocean/nature design system unrelated to Industrial Broadsheet.

**Recommended Fix:** Remove all legacy tokens. The design token namespace should contain only Industrial Broadsheet-defined variables.

**Priority:** P1
**Affected Files:** `src/styles.css`

---

### HIGH-08 — DevTools Ship Unconditionally in Production Bundle

**Status:** UNRESOLVED

**Evidence:** `src/routes/__root.tsx` unconditionally imports and renders `TanStackRouterDevtoolsPanel` and `TanStackDevtools`. `src/providers/QueryProvider.tsx` unconditionally renders `<ReactQueryDevtools initialIsOpen={false} />`. No environment guard exists.

**Recommended Fix:** Wrap all devtools with `import.meta.env.DEV`. Use dynamic imports for zero production bundle impact.

**Priority:** P1
**Affected Files:** `src/routes/__root.tsx`, `src/providers/QueryProvider.tsx`

---

### HIGH-09 — `SavedJobsButton` Uses Raw `localStorage` — No Zustand Store

**Status:** UNRESOLVED

**Evidence:** `src/features/jobs/components/SavedJobsButton.tsx` confirmed unchanged: `localStorage.getItem`, `localStorage.setItem`, plain function `getSavedJobs()` outside any reactive store. CLAUDE.md: "Client State → Zustand only."

**Recommended Fix:** Create `src/stores/saved-jobs-store.ts` with Zustand `persist` middleware. Replace all `localStorage` calls in `SavedJobsButton` and `SavedJobsPage`.

**Priority:** P1
**Affected Files:** `src/features/jobs/components/SavedJobsButton.tsx`, `src/features/jobs/components/SavedJobsPage.tsx`

---

### HIGH-10 — Analytics Charts Use Hardcoded Hex Colors

**Status:** UNRESOLVED

**Evidence:** `src/features/admin/components/analytics/AnalyticsSection.tsx` line 19: `const COLORS = ["#6366f1", "#22c55e", "#ef4444", "#eab308", "#a855f7"]`. Note: `--gradient-a/b/c/d` tokens were added to `styles.css` in this revision (MED-05 fixed), but `AnalyticsSection.tsx` was not updated to use them.

**Recommended Fix:** Replace the `COLORS` array with `["var(--gradient-a)", "var(--gradient-b)", "var(--gradient-c)", "var(--gradient-d)"]`.

**Priority:** P1
**Affected Files:** `src/features/admin/components/analytics/AnalyticsSection.tsx`

---

## New Issues Discovered in This Revision

---

### NEW-01 — Recruiter Talent Pool Feature Missing

**Evidence:** `Design/recruiter_talent_pool/code.html` and `Design/recruiter_talent_pool_mobile_view/code.html` both exist with full specifications: candidate database with search/filter, saved candidate cards, gradient data chips, talent pool management. No corresponding route, page, hook, or API function exists in the codebase.

**Impact:** Recruiters have no way to maintain a proprietary talent pool — a core recruiter value-add.

**Priority:** P1 — Missing Feature

---

### NEW-02 — Companies Directory Page Missing

**Evidence:** `Design/companies_directory_page/code.html` exists. No route or page component implements this. The public company profile is locked behind `_authenticated` route group. Unauthenticated users cannot browse or discover companies.

**Impact:** Public discoverability of companies is zero. The "Companies" public surface — critical for both employer branding and candidate discovery — is absent.

**Priority:** P2 — Missing Feature

---

### NEW-03 — Body Text Size Drift — 15px vs 13px

**Evidence:** `DESIGN_COMPLIANCE.md` documents this across the codebase: DESIGN.md specifies `DM Sans 15px / 1.6 / 400` as the body base. Multiple components use `text-[13px]` (e.g., `SuperAdminAuditLogsPage`, `SuperAdminPlatformPage` confirmed at `font-sans text-[13px]`). The global `body {}` CSS block uses `--foreground` (oklch value from shadcn defaults) rather than `--on-surface` for color.

**Impact:** Body text is rendered at 13px instead of 15px in areas using `text-[13px]`, reducing readability. Also, `body { color }` maps to the shadcn oklch foreground, not the design token `--on-surface`, creating potential color inconsistency on re-themed browsers.

**Recommended Fix:** Audit all `text-[13px]` usages and replace with the correct body size where appropriate. Change `body { color: var(--foreground) }` to `body { color: var(--on-surface) }` in `styles.css`.

**Priority:** P2
**Affected Files:** `src/styles.css`, multiple feature components

---

### NEW-04 — Job Card Layout Is Single-Column — Design Specifies 2-Column Grid

**Evidence:** `DESIGN_COMPLIANCE.md` confirms: `Design/jobs_marketplace_grid/code.html` uses `grid grid-cols-2 gap-px`. The implementation in `JobsMarketplace.tsx` uses `flex-col gap-px` (single column stack).

**Impact:** Jobs marketplace has 50% of the designed information density. On desktop, candidates see a vertical list instead of the editorial grid layout.

**Recommended Fix:** Change `JobsMarketplace` container from `flex-col` to `grid md:grid-cols-2 gap-px`.

**Priority:** P2
**Affected Files:** `src/features/jobs/components/JobsMarketplace.tsx`

---

### NEW-05 — SuperAdmin Has No Mobile Navigation

**Evidence:** `DESIGN_COMPLIANCE.md` confirms: `SuperAdminLayout` sidebar uses `hidden md:flex`, meaning it is entirely hidden on mobile. There is no `MobileNav`, hamburger toggle, or bottom navigation for the SuperAdmin portal — unlike the main `AppShell` which has a `<MobileNav>` component.

**Impact:** SuperAdmin users on mobile or small-viewport devices cannot navigate. The portal is entirely unusable on any screen below the `md` breakpoint.

**Recommended Fix:** Add hamburger menu + drawer or bottom nav to `SuperAdminLayout`. Reference the pattern in `src/components/layout/MobileNav.tsx`.

**Priority:** P1
**Affected Files:** `src/features/superadmin/layout/SuperAdminLayout.tsx`

---

### NEW-06 — Icon System Drift — Design Uses Material Symbols; Implementation Uses HugeIcons

**Evidence:** `DESIGN_COMPLIANCE.md` §Typography/Icons: "Design uses Material Symbols Outlined via font-variation-settings. Implementation uses HugeIcons (`@hugeicons/core-free-icons`, `@hugeicons/react`) — SVG-based React components with a different stroke personality."

**Impact:** The editorial, sharp-geometric character of Material Symbols is different from HugeIcons' rounded strokes. This is a medium visual fidelity deviation — the design's iconographic language is not reproduced.

**Note:** This is an approved deviation for practical reasons (HugeIcons is already in use consistently), but the discrepancy should be formally acknowledged in DESIGN.md and CLAUDE.md as the approved icon system, and the Design HTML files should be considered for visual fidelity comparison only, not icon-system specification.

**Priority:** P3 — Document the approved deviation; no code change required

---

### NEW-07 — Empty States Reference Guide Not Used as Shared Library

**Evidence:** `Design/empty_states_reference_guide/code.html` exists as a full design reference. However, empty state implementations across the app are bespoke: `AdminEmptyState`, `SAEmptyState`, `NotFoundPage` all implement their own empty state patterns independently with no shared abstraction.

**Impact:** Inconsistent empty state UX across features. Each feature team invents its own empty state. The design guide is being ignored.

**Recommended Fix:** Create `src/components/ui/EmptyState.tsx` following the design reference. Migrate all bespoke empty state components to use it.

**Priority:** P2
**Affected Files:** `src/features/admin/components/shared/AdminEmptyState.tsx`, `src/features/superadmin/components/shared/SAEmptyState.tsx`, new `src/components/ui/EmptyState.tsx`

---

### NEW-08 — 9 Public Website Pages Designed But Not Implemented

**Evidence from Design folder:**
- `Design/features_page_desktop/code.html` — Features marketing page
- `Design/pricing_page_coming_soon/code.html` — Pricing / Coming Soon
- `Design/about_page_desktop/code.html` — About page
- `Design/contact_page_desktop/code.html` — Contact page
- `Design/privacy_policy_page_desktop/code.html` — Privacy Policy
- `Design/terms_of_service_page_desktop/code.html` — Terms of Service
- `Design/maintenance_page/code.html` — Maintenance mode
- `Design/access_restricted_desktop/code.html` + `access_restricted_mobile_view/code.html` — Auth error page
- `Design/action_not_allowed_desktop/code.html` + `action_not_allowed_mobile_view/code.html` — Permission error page

None of these have corresponding route files or page components.

**Priority:** P3 for marketing pages (Features, About, Contact, Privacy, Terms, Pricing); P2 for system pages (Maintenance, Access Restricted, Action Not Allowed)

---

## Medium Priority Issues

---

### MED-01 — Recruiter Sidebar "Applicants" Dead Link

**Status:** UNRESOLVED

**Evidence:** `Sidebar.tsx` RECRUITER nav: `{ label: "Applicants", href: "/recruiter/applicants" }`. No route file at `_authenticated/recruiter/applicants.tsx`. Applications are only accessible at `/recruiter/jobs/$jobId/applications`.

**Recommended Fix:** Either implement a generic applicants list page, or change the sidebar link to open the jobs page with a note that applications are per-job.

**Priority:** P2
**Affected Files:** `src/components/layout/Sidebar.tsx`

---

### MED-02 — SuperAdmin Query Keys Not Centralized

**Status:** UNRESOLVED

**Evidence:** `useSuperAdminDashboard.ts` line 6: `queryKey: ["superadmin", "stats"]`. Line 7: `queryKey: ["superadmin", "candidates", filters]`. Ad-hoc string arrays outside the `queryKeys` factory in `src/lib/api/query-keys.ts`.

**Recommended Fix:** Add `superadmin` namespace to `queryKeys`. Update all SuperAdmin hooks to use it.

**Priority:** P2
**Affected Files:** `src/lib/api/query-keys.ts`, `src/features/superadmin/hooks/`

---

### MED-03 — Company Notification Endpoints Defined But Unused

**Status:** UNRESOLVED

**Evidence:** `endpoints.notification.company.*` defined in `endpoints.ts`. All notification hooks and components use `endpoints.notification.user.*` regardless of role. Recruiters receive no company-level notification feed.

**Priority:** P2
**Affected Files:** `src/features/notifications/api/index.ts`, `src/features/notifications/hooks/index.ts`

---

### MED-04 — SuperAdmin Pagination Uses Offset Strategy — Backend Uses Cursor

**Status:** UNRESOLVED (not in prior audit — discovered in v1 but not catalogued separately)

**Evidence:** `SuperAdminUserFilters` type includes `page: number` (offset pagination). Backend SuperAdmin endpoints use cursor-based pagination consistent with all other backend endpoints. SuperAdmin pagination will malfunction when page > 1.

**Priority:** P2
**Affected Files:** `src/features/superadmin/types/index.ts`, `src/features/superadmin/api/users.ts`

---

### MED-05 — Profile Update Does Not Invalidate Auth Query

**Status:** UNRESOLVED

**Evidence:** `useUpdateProfile()` invalidates `queryKeys.profile.detail()` but not `queryKeys.auth.user()`. Updating `firstName`/`lastName` leaves the topbar/sidebar displaying the old name until a window refocus triggers the 5-minute stale query.

**Priority:** P2
**Affected Files:** `src/features/profile/hooks/index.ts`

---

### MED-06 — `SuperAdminAuditLogsPage` Is a Documented Placeholder

**Evidence:** The page explicitly states "Audit logs are available in the Admin panel. The SuperAdmin API does not expose a dedicated audit log endpoint." The `Design/super_admin_audit_logs/code.html` shows a full-width monospace audit log table with date range, actor search, and export. The page delivers an empty state with an explanation note.

**Priority:** P2 — either the endpoint needs to be exposed or the route needs to link to the Admin audit logs view.

---

## Low Priority Issues

---

### LOW-01 — Error Boundary Not Used at Route Level

**Status:** UNRESOLVED from prior audit

**Priority:** P3

---

### LOW-02 — Dialog Components Missing `aria-describedby`

**Status:** UNRESOLVED from prior audit

**Priority:** P3

---

### LOW-03 — No Offline State Detection

**Status:** UNRESOLVED from prior audit

**Priority:** P3

---

### LOW-04 — Notifications Use 30s Polling — No WebSocket

**Status:** UNRESOLVED from prior audit

**Priority:** P3

---

### LOW-05 — Mono Label Size 12px vs Design Spec 11px

**Evidence:** `DESIGN_COMPLIANCE.md` Typography section: `.mono-label` is 12px in implementation; DESIGN.md specifies 11px.

**Priority:** P3

---

### LOW-06 — `restoring_session_desktop` Design Screen Underimplemented

**Evidence:** `Design/restoring_session_desktop/code.html` shows a full-screen centered loading state with progress bar, editorial messaging, and branding. `AuthInitializer` renders a minimal inline progress bar with a label string. `DESIGN_COMPLIANCE.md` scores this at 50%.

**Priority:** P3

---

## Architecture Findings

### Correct

- Feature-based architecture maintained — all features in `src/features/` with consistent `api/`, `components/`, `hooks/`, `schemas/`, `types/`, `pages/` substructure
- Route files remain minimal orchestration layers
- Provider hierarchy correct: `ThemeProvider → QueryProvider → AuthInitializer → children`
- TanStack Router file-based routing auto-generated by the Vite plugin
- Token refresh singleton deduplication remains correct
- Main auth session restore works correctly on page refresh (regular users only)
- SSR guard added to root route `beforeLoad` (MED-03 fixed)

### Incorrect

- **Auth store holds server state** — `user` and `role` in Zustand violate AGENTS.md
- **TanStack Table mandate entirely unmet** — 0/5 entity types migrated
- **SuperAdmin not integrated with shared infrastructure** — 7 independent localhost URLs
- **SuperAdmin no session restore** — portal broken on refresh
- **Saved jobs uses raw localStorage** — violates Zustand-only client state policy
- **No dedicated `recruiter/` feature folder** — recruiter pages spread across `jobs/`, `applications/`, `profile/`
- **Form policy violation** — `CandidateProfilePage` bypasses RHF + Zod

---

## Design Findings

### Screen-by-Screen Compliance Matrix

| Screen | Design Reference | Verdict | Score |
|--------|-----------------|---------|-------|
| Landing Page (/) | `landing_page_desktop/code.html` | **DOES NOT MATCH** — redirect only | 5% |
| Public Landing Page | `public_landing_page/code.html` | **DOES NOT MATCH** — not implemented | 0% |
| Login | `login_page/code.html` | **MATCHES DESIGN** | 88% |
| Register | `register_page/code.html` | **MOSTLY MATCHES** | 82% |
| Forgot Password | `forgot_password_page_restored/code.html` | **MOSTLY MATCHES** | 78% |
| Reset Password | `reset_password_page/code.html` | **MOSTLY MATCHES** | 80% |
| Verify Email Sent | `verify_email_sent_desktop/code.html` | **MOSTLY MATCHES** | 75% |
| Email Verified Success | `email_verified_success_desktop/code.html` | **PARTIALLY MATCHES** | 70% |
| Verification Link Invalid | `verification_link_invalid_desktop/code.html` | **PARTIALLY MATCHES** | 60% |
| Session Restore | `restoring_session_desktop/code.html` | **PARTIALLY MATCHES** — minimal implementation | 50% |
| Onboarding Role Selector | `onboarding_role_selector/code.html` | **PARTIALLY MATCHES** | 65% |
| Jobs Marketplace | `jobs_marketplace_grid/code.html` | **PARTIALLY MATCHES** — 1-col vs 2-col grid | 70% |
| Job Detail | `job_detail_page/code.html` | **MOSTLY MATCHES** | 80% |
| Apply Modal | `job_application_modal/code.html` | **MATCHES DESIGN** | 85% |
| Job Post Form | `job_post_edit_form/code.html` | **PARTIALLY MATCHES** | 70% |
| Candidate Applications | `candidate_applications_list_view/code.html` | **MOSTLY MATCHES** | 78% |
| Applicant Pipeline Kanban | `applicant_pipeline_kanban_view/code.html` | **MOSTLY MATCHES** | 82% |
| Candidate Detail Drawer | `candidate_detail_drawer/code.html` | **MOSTLY MATCHES** | 80% |
| Candidate Dashboard | `candidate_dashboard_overview/code.html` | **PARTIALLY MATCHES** — stub with welcome text only | 25% |
| Candidate Saved Roles | `candidate_saved_roles_dashboard/code.html` | **PARTIALLY MATCHES** | 70% |
| Candidate Profile Editor | `candidate_profile_editor/code.html` | **MOSTLY MATCHES** | 78% |
| Candidate Followed Companies | `candidate_dashboard_followed_companies/code.html` | **DOES NOT MATCH** — not implemented | 0% |
| Recruiter Dashboard | `recruiter_dashboard_overview/code.html` | **DOES NOT MATCH** — stub | 25% |
| Recruiter Job Management | `recruiter_job_management/code.html` | **MOSTLY MATCHES** | 78% |
| Recruiter Analytics | `recruiter_analytics_dashboard/code.html` | **DOES NOT MATCH** — not implemented | 0% |
| Recruiter Talent Pool | `recruiter_talent_pool/code.html` | **DOES NOT MATCH** — not implemented | 0% |
| Applicant Pipeline Mobile | `recruiter_pipeline_mobile_view/code.html` | **PARTIALLY MATCHES** | 70% |
| Company Profile | `company_profile_page/code.html` | **MOSTLY MATCHES** | 75% |
| Company Creation Form | `company_creation_form/code.html` | **PARTIALLY MATCHES** | 30% |
| Companies Directory | `companies_directory_page/code.html` | **DOES NOT MATCH** — not implemented | 0% |
| Notification Center Desktop | `notification_center_desktop_drawer/code.html` | **MOSTLY MATCHES** | 82% |
| Notification Center Mobile | `notification_center_mobile_view/code.html` | **MOSTLY MATCHES** | 75% |
| Admin Dashboard | `admin_dashboard_overview_1/code.html` | **MOSTLY MATCHES** | 80% |
| Admin Users | `super_admin_user_management_1/code.html` | **PARTIALLY MATCHES** — no TanStack Table | 60% |
| SuperAdmin Dashboard | `admin_dashboard_overview_1/code.html` | **MOSTLY MATCHES** | 82% |
| SuperAdmin Users | `super_admin_user_management_1/code.html` | **PARTIALLY MATCHES** | 55% |
| SuperAdmin Audit Logs | `super_admin_audit_logs/code.html` | **DOES NOT MATCH** — placeholder | 20% |
| SuperAdmin Platform | *(no design)* | **DOES NOT MATCH** — placeholder | 10% |
| SuperAdmin Security | *(no design)* | **DOES NOT MATCH** — placeholder | 10% |
| SuperAdmin Mobile Nav | Multiple mobile variants | **DOES NOT MATCH** — no mobile nav | 30% |
| 404 Page | `404_page/code.html` | **PARTIALLY MATCHES** | 72% |
| Access Restricted | `access_restricted_desktop/code.html` | **DOES NOT MATCH** — guard redirect only | 40% |
| Action Not Allowed | `action_not_allowed_desktop/code.html` | **DOES NOT MATCH** — guard redirect only | 40% |
| Maintenance Page | `maintenance_page/code.html` | **DOES NOT MATCH** — not implemented | 0% |
| Features Page | `features_page_desktop/code.html` | **DOES NOT MATCH** — not implemented | 0% |
| About Page | `about_page_desktop/code.html` | **DOES NOT MATCH** — not implemented | 0% |
| Contact Page | `contact_page_desktop/code.html` | **DOES NOT MATCH** — not implemented | 0% |
| Privacy Policy | `privacy_policy_page_desktop/code.html` | **DOES NOT MATCH** — not implemented | 0% |
| Terms of Service | `terms_of_service_page_desktop/code.html` | **DOES NOT MATCH** — not implemented | 0% |
| Pricing Page | `pricing_page_coming_soon/code.html` | **DOES NOT MATCH** — not implemented | 0% |

**Overall design compliance: 68% (DESIGN_COMPLIANCE.md score, 87 screens audited)**

---

## API Findings

Carries forward from prior audit. No new backend endpoints were added; no frontend contract drift was resolved.

| Additional Finding | Detail |
|---|---|
| SuperAdmin login response: `refreshToken` field | Frontend stores `data.refreshToken` (undefined — sent as httpOnly cookie, not in JSON body) |
| SuperAdmin pagination: offset vs cursor | Frontend `SuperAdminUserFilters.page` (offset) vs backend cursor pagination |
| Company notifications unused | `endpoints.notification.company.*` defined; no hook uses them |
| SuperAdmin stats shape | Frontend `SuperAdminStats` type not verified against backend response shape |

---

## Security Findings

| Finding | Severity | Status |
|---------|----------|--------|
| `localhost:5000` hardcoded — non-deployable | HIGH | Open |
| DevTools in production bundle | MEDIUM | Open |
| SuperAdmin `refreshToken` field undefined in response | MEDIUM | Open |
| `lucide-react` governance violation | LOW (security) | Open |
| No `dangerouslySetInnerHTML` usage | PASS | — |
| `credentials: "include"` on all fetch calls | PASS | — |
| Token storage: access in sessionStorage, flag in localStorage | ACCEPTABLE | — |

---

## UX Findings

| State Type | Coverage | Status |
|------------|----------|--------|
| Loading states | Present in most features | Good |
| Error states | Inconsistent — `AdminErrorState`/`SAErrorState` exist; profile page has none | Gap |
| Empty states | Inconsistent — bespoke per feature, not from shared `EmptyState` component | Gap |
| Unauthorized state | Not implemented — guards redirect, no visual error page | Missing |
| Forbidden state | Not implemented — guards redirect, no visual error page | Missing |
| Offline state | Not implemented | Missing |
| Candidate Dashboard | Stub — no real UX | Critical Gap |
| Recruiter Dashboard | Stub — no real UX | Critical Gap |

---

## Accessibility Findings

Carries forward from prior audit.

| Area | Status |
|------|--------|
| Semantic HTML | Partially compliant — layout uses semantic elements; some features use div-only |
| ARIA labels | Partially compliant — auth forms and sidebar labelled; dialogs missing `aria-describedby` |
| Keyboard navigation | Partially compliant — Radix primitives handle it; Kanban has no keyboard fallback |
| Focus management | Partially compliant — Radix Dialog correct; custom drawers may not manage focus |
| Form accessibility | Partially compliant — shadcn Form in auth pages; raw `useState` in candidate profile |
| Screen reader support | Not audited — no test evidence |

---

## Performance Findings

| Area | Status |
|------|--------|
| Route-level code splitting | Present (TanStack Start + Router plugin) |
| DevTools in production bundle | Unresolved — all 4 devtools packages ship unconditionally |
| TanStack Query defaults | `staleTime: 5min, retry: 1, refetchOnWindowFocus: false` — appropriate |
| Notification polling | 30s interval — acceptable |
| No unnecessary `useMemo`/`useCallback` | Correct |
| Recharts tree-shaking | Named imports — should tree-shake correctly |

---

## Testing Findings

| Layer | Files | Tests | Status |
|-------|-------|-------|--------|
| Unit | `tests/unit/auth.test.ts` | 4 | Happy path only |
| Unit | `tests/unit/jobs.test.ts` | 3 | Happy path only |
| Unit | `tests/unit/admin.test.ts` | 1 | Stats only |
| Integration | `tests/integration/` | **0** | Empty folder |
| E2E | `tests/e2e/` | **0** | Empty folder |
| Component | (none) | **0** | Not started |
| Accessibility | (none) | **0** | Not started |

MSW infrastructure (`fixtures/handlers.ts`, `fixtures/server.ts`, `fixtures/test-utils.tsx`) is in place. 8 total tests across 3 files. No new tests added since prior audit.

---

## Phase Completion Matrix

| Phase | Description | Status | Evidence |
|-------|-------------|--------|----------|
| **Phase 1** | Foundation — Vite, TanStack, Zustand, Tailwind, shadcn, tokens, providers | **Completed** | All infrastructure present |
| **Phase 2** | Auth pages — Login, Register, Forgot, Reset, Verify, role redirect | **Completed** | All auth pages with RHF+Zod, hooks complete |
| **Phase 2.5** | Auth infrastructure — token storage, refresh, guards, session restore | **Completed** | Refresh deduplication, cookie handling, guards all correct |
| **Phase 3** | Public Jobs Marketplace — list, search, filter, detail, apply | **Completed** | `JobsMarketplace`, `JobDetailPage`, `ApplyModal` implemented |
| **Phase 3.1** | Recruiter Job CRUD — create, edit, status, delete, management table | **Completed** | `CreateJobPage`, `EditJobPage`, `RecruiterJobManagement` all present |
| **Phase 4** | Applications — Candidate list/detail/withdraw; Recruiter Kanban/status | **Completed** | Kanban with drag-drop, status dialog, timeline all present |
| **Phase 5** | Profiles — Candidate profile editor, resume, skills; Recruiter profile | **Partially Completed** | Pages exist; `CandidateProfilePage` violates RHF+Zod (CRIT-04) |
| **Phase 6** | Company Management — profile, edit, logo, team, invite | **Completed** | All company components present |
| **Phase 7** | Notifications — bell, unread, drawer, list, mark read, delete | **Completed** | Full notification system present |
| **Phase 8** | Admin — dashboard, users, companies, jobs, analytics, audit logs | **Completed** (functional) — **Partially Completed** (TanStack Table mandate) | Admin pages present; CRIT-05 unresolved |
| **Phase 9** | SuperAdmin — auth, layout, dashboard, users, companies, platform, security | **Partially Completed** | Pages exist; CRIT-06, CRIT-07 unresolved; platform/security/audit-logs are placeholders |

---

## Recommended Corrections Priority Stack

### Tier 0 — Release Blockers (All 7 Critical Issues Must Be Resolved First)

1. **CRIT-01**: Use `env.apiUrl` in `endpoints.ts`
2. **CRIT-02**: Remove hardcoded `localhost:5000` from 5 SuperAdmin API files
3. **CRIT-03**: Replace Lucide icons in 4 shadcn components; remove from `package.json`
4. **CRIT-04**: Migrate `CandidateProfilePage` to RHF + Zod + shadcn Form
5. **CRIT-05**: Create shared `<DataTable>` with `useReactTable`; migrate admin + recruiter tables
6. **CRIT-06**: Fix `navConfig.SUPERADMIN` to use `/superadmin/*` paths
7. **CRIT-07**: Add `restoreSession()` to `useSuperAdminAuthStore`; call from `AuthInitializer`

### Tier 1 — Core UX and Design System

8. **HIGH-04**: Implement `CandidateDashboardPage` and `RecruiterDashboardPage` feature pages
9. **HIGH-05**: Implement `RecruiterAnalyticsPage`
10. **NEW-01**: Implement `RecruiterTalentPoolPage`
11. **HIGH-06**: Implement public landing page at `/`
12. **NEW-05**: Add mobile navigation to `SuperAdminLayout`
13. **HIGH-02**: Set `--radius: 0px`; strip rounded corners from shadcn components
14. **HIGH-03**: Remove `shadow-*` from shadcn components

### Tier 2 — Architecture and State

15. **HIGH-01**: Decouple user/role from Zustand auth store
16. **HIGH-08**: Guard all devtools with `import.meta.env.DEV`
17. **HIGH-09**: Create Zustand `saved-jobs-store.ts` with `persist`
18. **HIGH-10**: Replace `COLORS` array with gradient token references
19. **HIGH-07**: Remove legacy CSS tokens (`--sea-ink`, `--lagoon`, etc.)
20. **MED-02**: Add `superadmin` namespace to `queryKeys`

### Tier 3 — Content and Polish

21. **MED-01**: Fix recruiter "Applicants" sidebar link
22. **NEW-03**: Fix body text size drift (13px → 15px where appropriate)
23. **NEW-04**: Change JobsMarketplace to 2-column grid
24. **NEW-07**: Create shared `EmptyState` component
25. **NEW-02**: Implement Companies Directory page
26. **MED-03**: Implement company notification hooks for Recruiter/Admin roles
27. **NEW-08**: Implement system pages (Access Restricted, Action Not Allowed, Maintenance)
28. **MED-04**: Fix SuperAdmin pagination to use cursor strategy

### Tier 4 — Low Priority

29. **LOW-01**: Error boundary at route level
30. **LOW-02**: `aria-describedby` on all dialogs
31. **LOW-03**: Offline state detection
32. **LOW-05**: Mono-label 12px → 11px
33. **LOW-06**: Session restore full-screen loading state
34. **MED-05 (Testing)**: Add integration and E2E test suites

---

## Final Verdict

### PARTIALLY READY

**This verdict is unchanged from the prior audit.**

No Critical, High-Priority, or Medium-Priority issues were resolved between submissions. The two fixes applied (SSR guard in root route, gradient tokens in `styles.css`) are welcome incremental improvements but do not meaningfully move the overall readiness score.

**What blocks advancement:**

The 7 Critical issues represent absolute release blockers. Until CRIT-01 and CRIT-02 are resolved, the application cannot be deployed to any environment. Until CRIT-03 is resolved, the technology governance policy is violated in production. Until CRIT-04 and CRIT-05 are resolved, two core agent mandates (Forms Agent, Table Agent) are unmet. Until CRIT-06 and CRIT-07 are resolved, the SuperAdmin portal is functionally broken.

The full Design folder review in this revision reveals a larger scope gap than the prior audit captured: 87 design screens exist; approximately 38% (33 screens) are fully implemented, 30% are partially implemented, and 32% (28 screens) are not implemented at all. The most impactful gaps are the public landing page, recruiter dashboard, recruiter analytics, recruiter talent pool, and the companies directory.

**What is working:**

The authentication system, job marketplace, applicant pipeline (Kanban), notifications, company management, and admin management are functionally solid and broadly compliant with the architecture. The token system, refresh handling, route-level code splitting, and feature-based folder organization are all correctly implemented. The gradient tokens are now in place. The foundation is strong.

**To advance from PARTIALLY READY to READY FOR NEXT PHASE**, the following minimum threshold must be met:
1. All 7 Critical issues resolved
2. At minimum: Candidate dashboard, Recruiter dashboard, public landing page, and SuperAdmin mobile nav implemented
3. At minimum: `--radius` zeroed and shadow violations removed from shadcn components
4. At minimum: DevTools guarded in production build
