# Postboard — Master Implementation Backlog

> **Status:** Single Source of Truth for all remaining engineering work.
> **Generated:** Phase 1 — Comprehensive Repository Audit (2026-06-27)
> **Scope:** Frontend, Backend, Database, Design Compliance
>
> Every future implementation phase will complete one or more items from this backlog.
> Never delete completed items — mark them as completed with references to the implementation phase that resolved them.

---

## 1. Executive Audit Summary

### Overall Project Health: **RC2 (Release Candidate 2)**

| Dimension | Score | Assessment |
|-----------|-------|------------|
| **Architecture** | 7/10 | Strong foundation, but two API client layers, duplicate components, and inconsistent aliases erode clarity |
| **Code Quality** | 8/10 | Phase 11B removed 11 dead files, 0 `any` types remaining, 0 console.log |
| **UI Consistency** | 7/10 | Phase 11B consolidated duplicate components, improved accessibility |
| **Backend Integration** | 7/10 | Backend is well-architected but has 2 critical bugs (hardcoded email, wrong application default status) |
| **Documentation** | 9/10 | 7 core documents authoritative; engineering journal, knowledge base, and rules document all well-maintained |
| **Security** | 7/10 | Improved from Phase 11A audit. Secrets not committed, XSS vectors removed, role not in localStorage |
| **Performance** | 7/10 | Phase 11B removed notification polling. DEV-only DevTools confirmed. Route-level lazy loading still pending |
| **Accessibility** | 7/10 | Phase 11B added aria-label, aria-busy, error icons. Skip-to-content present, focus management improved |
| **Production Readiness** | 8/10 | Phase 11B resolved all verifiable Critical/High issues. Remaining items are backend/deployment concerns |

### Key Strengths
- Backend is well-architected with strong security practices, comprehensive multi-tenant isolation
- Documentation is excellent — 7 authoritative documents, engineering journal, complete API contract
- Design directory is comprehensive (98 subdirectories, 91% implementation coverage)
- Auth architecture is sound (access tokens in memory, httpOnly cookies, separate SuperAdmin domain)

### Key Weaknesses
- ~~2 build-blocking TypeScript errors in shadcn/ui primitives (popover, tooltip)~~ ✅ Resolved Phase 5B
- ~~7 CRITICAL technical debt items unresolved~~ ✅ Resolved across Phases 2-11B
- ~~Duplicate component implementations (4 versions of SearchInput, 3 versions of ErrorState)~~ ✅ Consolidated Phase 11B
- ~~Hardcoded `localhost:5000` in multiple API files (ignores `VITE_API_URL`)~~ ✅ Consolidated to env.ts Phase 10B.5
- ~~`lucide-react` present despite Hugeicons-only rule~~ ✅ Removed Phase 5B
- ~~SuperAdmin sidebar links broken, session not restored on refresh~~ ✅ Fixed Phase 3
- No shared public route layout (8+ pages duplicate header/footer)
- Type duplication across features (auth vs shared, applications vs jobs)
- Candidate/Recruiter dashboards are stubs with placeholder data
- Guard `beforeLoad` runs before AuthInitializer restores session

---

## 2. Missing Pages

| # | Page | Expected Route | Design Reference | Backend Dependency | Priority |
|---|------|---------------|-----------------|-------------------|----------|
| 1 | **Pricing Page** | `/pricing` | `Design/pricing_page_coming_soon/` (code.html + screen.png exist) | None (static marketing) | LOW |
| 2 | **Recruiter Talent Pool / Candidate CRM** | `/recruiter/talent-pool` | `Design/recruiter_talent_pool/`, `recruiter_talent_pool_mobile_view/`, `recruiter_talent_pool_candidate_crm/` | `GET /job/applications` (existing) | MEDIUM |
| 3 | **Company Creation / Onboarding Flow** | `/company/create` | `Design/company_creation_form/`, `company_creation_form_mobile_view/` | `POST /auth/register/company` (existing) | MEDIUM |
| 4 | **Maintenance Page** | System-wide guard | `Design/maintenance_page/`, `maintenance_page_platform_service/` | Backend flag endpoint | LOW |

---

## 3. Broken Pages

| # | Page | Route | Issue | Severity |
|---|------|-------|-------|----------|
| 1 | **SuperAdmin Dashboard** | `/superadmin/dashboard` | Sidebar links route to `/admin/*` instead of `/superadmin/*`; session not restored on refresh | CRITICAL |
| 2 | **SuperAdmin Users** | `/superadmin/users` | Uses offset-based pagination (backend uses cursor); query keys not centralized in factory | HIGH |
| 3 | **SuperAdmin Security** | `/superadmin/security` | Placeholder page — no real data integration | MEDIUM |
| 4 | **SuperAdmin Platform** | `/superadmin/platform` | Placeholder page — no real data integration | MEDIUM |
| 5 | **SuperAdmin Audit Logs** | `/superadmin/audit-logs` | Placeholder page — no real data integration | MEDIUM |
| 6 | **Candidate Dashboard** | `/candidate/dashboard` | Stub with placeholder data — design shows 6 stat tiles, charts, company follow feed | HIGH |
| 7 | **Recruiter Dashboard** | `/recruiter/dashboard` | Stub — design shows 6 stat tiles + quick actions | HIGH |
| 8 | **Recruiter Analytics** | `/recruiter/analytics` | Exists but likely incomplete — not verified against design | MEDIUM |
| 9 | **Candidate Profile** | `/candidate/profile` | Uses raw `useState` instead of RHF + Zod (CRIT-04) | CRITICAL |
| 10 | **Job Marketplace** | `/jobs` | Uses single-column layout (design specifies 2-column grid) | MEDIUM |
| 11 | **Job Detail** | `/jobs/$jobId` | Description is single block (design shows Responsibilities/Requirements sections); similar roles uses same-company filtering (design shows cross-company) | MEDIUM |
| 12 | **Public Landing Page** | `/` | Hardcoded `bg-[#080808]` instead of CSS variable | LOW |

---

## 4. Broken Navigation

| # | Location | Issue | Severity |
|---|----------|-------|----------|
| 1 | **Sidebar.tsx** — Recruiter nav | "Applicants" links to `/recruiter/applicants` — no route exists (correct route is `/recruiter/jobs/$jobId/applications`) | HIGH |
| 2 | **MobileNav.tsx** — Recruiter nav | Same broken `/recruiter/applicants` link | HIGH |
| 3 | **UserMenu.tsx** | Settings link always goes to `/candidate/profile` regardless of role (recruiters/admins go to wrong page) | MEDIUM |
| 4 | **SuperAdminSidebar** | All nav links route to `/admin/*` instead of `/superadmin/*` | CRITICAL |
| 5 | **Sidebar.tsx** — SuperAdmin nav | Same broken `/admin/*` links | CRITICAL |
| 6 | **Topbar** — Search input | Decorative — no search handler attached | LOW |
| 7 | **Notifications Bell** | Unread count badge polling not implemented | LOW |

---

## 5. UI Deviations

### Missing Sections
- Candidate dashboard missing: 6 stat tiles, application breakdown chart, company follow feed (design shows these)
- Recruiter dashboard missing: 6 stat tiles, quick action buttons, recent activity feed (design shows these)
- Job Detail missing: Responsibilities section, Requirements section, Benefits section (design shows these)
- Job Marketplace missing: 2-column grid layout (uses single-column)
- SuperAdmin missing: mobile navigation (no bottom nav on mobile)

### Incorrect Layouts
- Admin routes use inline `<div className="p-6">` instead of shared layout pattern
- Job cards in marketplace use single-column (design shows 2-column grid)
- AuthLayout left panel branding overlaps with verification page content

### Typography Inconsistencies
- `mono-label` uses 12px instead of design spec 11px
- Body text uses 13px in some places (design spec varies)
- `--radius: 0.625rem` in CSS variables (should be 0px for Industrial Broadsheet)

### Spacing Issues
- Shadow utilities present in shadcn/ui primitives (violates zero-radius, no-shadow design rule)
- Card padding inconsistent across features

### Missing Components
- Pricing page not built (design exists)
- Talent Pool / Candidate CRM not built (3 design variants exist)
- Company creation/onboarding form not built (2 design variants exist)
- Maintenance page not integrated (2 design variants exist)

### Incorrect Icons
- `LockIcon` used as substitute for Material Symbols `shield_lock` (not in installed Hugeicons version)
- `lucide-react` icons present in 4 shadcn components despite Hugeicons-only rule
- Icon system drift — some components use inline SVGs or different icon sizes

### Responsive Issues
- SuperAdmin has no mobile navigation
- Tables do not collapse to card lists on mobile (design specifies this for <768px)
- No bottom padding for mobile nav on some authenticated pages

### Accessibility Concerns
- Dialogs missing `aria-describedby` on some instances
- No skip-to-content link (AppShell has one but it may not work)
- Focus management gaps in dialog/drawer implementations
- Some icon-only buttons lack `sr-only` text

---

## 6. Backend Integration Issues

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 1 | **Hardcoded localhost:5000** in `endpoints.ts` ignores `VITE_API_URL` | `src/lib/api/endpoints.ts` | CRITICAL |
| 2 | **Hardcoded localhost:5000** in 5 SuperAdmin API files | `src/features/superadmin/api/auth.ts` (+ 4 other files) | CRITICAL |
| 3 | **SuperAdmin auth bypasses endpoint definitions** — hardcodes URL strings instead of `endpoints.superadmin.*` | `src/features/superadmin/api/auth.ts` | HIGH |
| 4 | **Backend: Hardcoded email recipient** — all emails go to hardcoded address in production | `jobboard/src/lib/email.ts:30` | CRITICAL (backend) |
| 5 | **Backend: Application default status is SHORTLISTED** instead of PENDING | `jobboard/prisma/schema.prisma` | CRITICAL (backend) |
| 6 | **Backend: Missing `/ready` readiness endpoint** — API contract defines it but not implemented | `jobboard/src/` | HIGH (backend) |
| 7 | **Backend: Zod in dependencies but unused** — all validation uses express-validator | `jobboard/package.json` | LOW (backend) |
| 8 | **Backend: Nodemailer in dependencies but unused** — only Resend is used | `jobboard/package.json` | LOW (backend) |
| 9 | **Broken pagination strategy** — SuperAdmin uses offset-based pagination but backend uses cursor-based | `src/features/superadmin/types/` | HIGH |
| 10 | **Missing mutations** — No way to update profile from candidate/recruiter pages? Check if PATCH /user/current is wired | Profile pages | MEDIUM |
| 11 | **No prefetching** — Route loaders don't use `prefetchQuery` or `ensureQueryData` despite guidelines | All routes | MEDIUM |
| 12 | **Notifications use 30s polling** — no WebSocket support for real-time updates | `src/features/notifications/` | LOW |
| 13 | **`apiFetch` 401 refresh race condition** — original request retried with potentially aborted controller signal | `src/shared/api/client.ts` | MEDIUM |

---

## 7. Authentication Issues

### Auth Architecture Trace (Login Flow)

```
LoginPage.tsx
  └─ useLogin().mutate()
       ├─ loginUser() → POST /auth/login → { accessToken, ... }
       ├─ setAccessToken() → Zustand: accessToken, isAuthenticated=true, isInitialized=true
       ├─ fetchCurrentUser() → GET /user/current → user data
       ├─ setUser(user) → Zustand: user, role, isAuthenticated=true
       ├─ invalidateQueries(queryKeys.auth.all) → marks useCurrentUser() cache stale
       └─ navigate(to: getDefaultDashboardByRole(role))
```

### Auth Architecture Trace (Session Restore Flow)

```
AuthInitializer.tsx (mounts inside AppProvider)
  └─ useEffect (mount)
       ├─ restoreSession()
       │    ├─ apiFetch("POST /auth/refresh-token") → { accessToken }
       │    ├─ setAccessToken(accessToken)
       │    └─ apiFetch("GET /user/current") → setUser(user)
       │    └─ catch → clearAuth()
       │    └─ finally → setInitialized()
       │
       └─ restoreSuperAdminSession()
            ├─ apiFetch("POST /superadmin/refresh") → { accessToken, admin }
            ├─ saSetAccessToken(accessToken)
            ├─ saSetAdmin(admin)  (conditional)
            └─ catch → saClearAuth()
            └─ finally → saSetInitialized()
       │
       └─ Both must complete → ready = isInitialized && saIsInitialized
```

### Auth Architecture Trace (Route Guard Timing)

```
Page Refresh
  └─ TanStack Router resolves route tree
       └─ _authenticated.tsx beforeLoad: requireAuth()
            └─ useAuthStore.getState()
                 └─ isAuthenticated: false (AuthInitializer hasn't mounted yet)
                 └─ throws redirect to /login
  └─ React renders AppProvider
       └─ AuthInitializer mounts
            └─ useEffect fires (AFTER guards already ran)
            └─ Session restored → isAuthenticated: true
  └─ LoginPage renders
       └─ useEffect detects isAuthenticated became true
       └─ navigate(to: dashboard)
```

**Result:** Every page refresh causes a flash-redirect to `/login` → `/dashboard`. The user sees the login page briefly before being redirected.

### Auth Architecture Trace (Header/UserMenu)

```
Topbar.tsx (inside AppShell)
  ├─ ThemeToggle
  ├─ NotificationsManager
  └─ UserMenu
       └─ useCurrentUser()  ← TanStack Query, enabled only when accessToken exists
            ├─ Loading: shows "PB" initials fallback
            ├─ Success: shows user initials (e.g., "EL" for Erik Larsson)
            └─ Error: shows "PB" fallback (query has retry: false)

Sidebar.tsx
  └─ useAuthStore((s) => s.role)
       └─ role determines which navConfig is rendered
       └─ null role → falls back to CANDIDATE nav (line 61)

PublicHeader.tsx (on public pages only)
  └─ useAuthStore((s) => s.isAuthenticated)
       └─ true → "Dashboard" button
       └─ false → "Sign In" + "Post a Job" buttons
```

### Auth Architecture Trace (Logout Flow)

```
UserMenu → handleLogout()
  └─ useLogout().mutate()
       ├─ POST /auth/logout (backend revokes refresh token)
       ├─ onSuccess → toast "Signed out"
       ├─ onSettled → clearAuth() → Zustand: isAuthenticated=false, user=null, role=null
       ├─ onSettled → queryClient.clear() → all caches wiped
       └─ onSettled → navigate(to: "/login")
```

### Auth Architecture Trace (SuperAdmin Auth)

```
SuperAdminLayout.tsx
  └─ useSuperAdminAuthStore() → admin, tokens
  └─ Logout button → clearAuth() → resets store BUT does NOT redirect
       └─ requireSuperAdmin guard fires on next render → redirects to /superadmin/login

SuperAdminLoginPage.tsx
  └─ Raw useState + onSubmit handler (NO react-hook-form, NO Zod validation)
  └─ superAdminLogin() → POST /superadmin/login
       └─ Uses hardcoded `${BASE_URL}/superadmin/login` (not endpoints.superadmin.login)
  └─ setAccessToken() → isAuthenticated=true (but isInitialized stays false)
  └─ setAdmin() → isAuthenticated=true, isInitialized=true

SuperAdmin session restore (in AuthInitializer):
  └─ POST /superadmin/refresh → { accessToken, admin }
  └─ saSetAccessToken → isAuthenticated=true BUT isInitialized stays false
  └─ saSetAdmin (if admin returned) → isInitialized=true
  └─ finally → saSetInitialized() → isInitialized=true
       Problem: saSetAccessToken doesn't set isInitialized=true
       (regular auth store's setAccessToken DOES set isInitialized=true)
```

### Auth Architecture Trace (Email Verification)

```
/verify-email?token=xxx&email=yyy
  └─ VerifyEmailPage
       ├─ Token present → auto-fires useVerifyEmail(token) on mount
       ├─ Success → "Email verified" + link to /login
       ├─ Already verified → message + link to /login
       ├─ Expired/Invalid → error card with metadata + resend form
       └─ No token → show resend form

Note: The verification auto-fire logic is fragile:
  verifyMutation.isIdle === false  // Double negation — confusing
  The mutation fires ON EVERY RENDER until it completes
```

### Auth Architecture Trace (Access Restricted)

```
AccessRestricted.tsx (at shared/components/ux/AccessRestricted.tsx)
  └─ Used by route guards when role mismatch detected
  └─ Wrapped in press-grid decorative background
  └─ Shows ERR_403_FORBIDDEN, title, message, dashboard link, contact link

Note: This component EXISTS and is correctly placed.
Previous audit reports claiming it was missing were incorrect.
```

### Auth Architecture Trace (Dashboard Routing)

```
Login Success → getDefaultDashboardByRole(role):
  └─ CANDIDATE  → /candidate/dashboard
  └─ RECRUITER  → /recruiter/dashboard
  └─ ADMIN      → /admin/dashboard
  └─ SUPERADMIN → /superadmin/dashboard
  └─ null/undefined → /login (fallback — would redirect a logged-in user to login)

Role guard mismatch → redirect to own dashboard by role:
  └─ If RECRUITER tries /candidate/dashboard →
       requireRole(["CANDIDATE"]) fires →
       redirect to /recruiter/dashboard
```

---

### Documented Issues

| # | Issue | Root Cause | Location | Severity |
|---|-------|-----------|----------|----------|
| 1 | **SuperAdmin session not restored on page refresh** | `isRestoringSession` never set to `true` in SA store; `setAccessToken` doesn't set `isInitialized` (inconsistent with regular store) | `src/stores/superadmin-auth-store.ts` | CRITICAL |
| 2 | **Guard `beforeLoad` runs before AuthInitializer restores session** | Guards are synchronous during route resolution; AuthInitializer's useEffect hasn't fired yet | `src/guards/`, `src/providers/AuthInitializer.tsx` | HIGH |
| 3 | **Every page refresh causes login-page flash** | Direct consequence of issue #2 — user sees `/login` briefly then redirected to dashboard | All authenticated routes | HIGH |
| 4 | **SuperAdmin login uses raw `useState` instead of RHF+Zod** | Bypasses form validation framework; no error linking, no field-level validation | `src/features/superadmin/pages/SuperAdminLoginPage.tsx` | HIGH |
| 5 | **SuperAdmin API auth hardcodes URLs** | Bypasses `endpoints.superadmin.*` factory; uses raw string interpolation with `env.apiUrl` | `src/features/superadmin/api/auth.ts` | HIGH |
| 6 | **Duplicate `/user/current` fetch on login** | `useLogin().onSuccess` manually calls `fetchCurrentUser()` then invalidates auth query — causes 2 network calls | `src/features/auth/hooks/index.ts:53-55` | MEDIUM |
| 7 | **UserMenu Settings link hardcoded to candidate profile** | `navigate({ to: "/candidate/profile" })` regardless of user role (recruiter or admin would see wrong page) | `src/components/layout/UserMenu.tsx:53` | MEDIUM |
| 8 | **`redirectIfAuthenticated` ignores SuperAdmin auth store** | Only checks `useAuthStore`, not `useSuperAdminAuthStore` — SA logged in could see /login | `src/guards/auth-guards.ts:43` | MEDIUM |
| 9 | **SuperAdmin auth store missing `setRestoringSession` setter** | State interface declares `isRestoringSession` but no action sets it | `src/stores/superadmin-auth-store.ts` | MEDIUM |
| 10 | **Recruiter sidebar "Applicants" link dead** | Links to `/recruiter/applicants` — no route file exists for this path | `src/components/layout/Sidebar.tsx:34`, `MobileNav.tsx:29` | MEDIUM |
| 11 | **AuthInitializer loading screen waits for both sessions** | Regular auth + SA auth restore run in parallel but both must complete before render | `src/providers/AuthInitializer.tsx:81` | LOW |
| 12 | **UserMenu avatar always shows "PB" during loading** | No separate loading state from error/empty state — all show "PB" fallback | `src/components/layout/UserMenu.tsx:28-30` | LOW |
| 13 | **SA logout button doesn't navigate** | `clearAuth()` resets store but no redirect; next guard trigger redirects implicitly | `src/features/superadmin/layout/SuperAdminLayout.tsx:79` | LOW |
| 14 | **VerifyEmailPage auto-mutation on every render** | No `isIdle` check before auto-firing; complex condition `!verifyMutation.isIdle === false` | `src/features/auth/components/VerifyEmailPage.tsx:33` | LOW |
| 15 | **`public/landing page` has inline `redirectIfAuthenticated` in `beforeLoad`** | Duplicates the guard that `/login` and `/register` already have; creates inconsistency if one changes | `src/routes/_public/index.tsx:7-12` | LOW |

---

## 8. Feature Completion Matrix

| Feature | Status | Notes | Dependencies |
|---------|--------|-------|-------------|
| **Auth (Login/Register)** | COMPLETE | All flows, email verification, password reset | Backend auth endpoints |
| **Public Landing Page** | COMPLETE | Hero, features grid, CTA | None |
| **Public Marketing Pages** | COMPLETE | About, Features, Contact, Privacy, Terms, Cookies | None |
| **Pricing Page** | MISSING | Design exists at `Design/pricing_page_coming_soon/` | None |
| **Job Marketplace** | PARTIAL | Single-column layout (design: 2-column grid); no prefetching | `GET /job` |
| **Job Detail** | PARTIAL | Single-block description (design: 3 sections); same-company similar roles (design: cross-company) | `GET /job/:id`, `GET /tags` |
| **Company Profile (Public)** | COMPLETE | Profile page with logo, metadata, jobs list | `GET /company/:companyId` |
| **Companies Directory** | COMPLETE | List with search | `GET /admin/companies` (public version?) |
| **Candidate Dashboard** | PARTIAL | Stub — 6 stat tiles, charts, company follow feed missing | `GET /user/current/profile` |
| **Candidate Applications** | COMPLETE | List, detail, status badges, timeline, withdraw | `GET /job/my-applications` |
| **Candidate Saved Jobs** | COMPLETE | Client-side Zustand store, toggle button, list page | None (client-only) |
| **Candidate Profile** | PARTIAL | Raw useState instead of RHF+Zod (CRIT-04) | `GET/PUT /user/current/profile` |
| **Recruiter Dashboard** | PARTIAL | Stub — stat tiles, quick actions, activity feed missing | `GET /company/current/analytics` |
| **Recruiter Job Management** | COMPLETE | List, create, edit, detail, status management | `GET/POST/PATCH /job` |
| **Recruiter Applicant Pipeline** | COMPLETE | Kanban board, drag-and-drop status, detail drawer | `GET /job/:id/applications` |
| **Recruiter Analytics** | PARTIAL | Page exists, data integration unclear | `GET /company/current/recruiters/:id/analytics` |
| **Recruiter Talent Pool** | MISSING | 3 design variants, no route implemented | `GET /job/applications` |
| **Company Admin Dashboard** | COMPLETE | Stats, quick actions | `GET /company/current/analytics` |
| **Company Profile/Edit** | COMPLETE | Profile, logo upload, form | `GET/PATCH /company/current` |
| **Company Team Management** | COMPLETE | Invite, promote, remove, transfer ownership | Team endpoints |
| **Company Analytics** | COMPLETE | Charts, stats | `GET /company/current/analytics` |
| **Company Audit Logs** | COMPLETE | List with filters | `GET /company/current/audit-logs` |
| **Company Notifications** | COMPLETE | List, mark read, delete | Notification endpoints |
| **Company Creation Onboarding** | MISSING | 2 design variants, no route | `POST /auth/register/company` |
| **Admin Dashboard** | COMPLETE | Stats, charts | `GET /admin/stats` |
| **Admin Users** | PARTIAL | Hand-crafted table (no TanStack Table), no sorting/filtering | `GET /admin/users` |
| **Admin Companies** | PARTIAL | Hand-crafted table, no sorting/filtering | `GET /admin/companies` |
| **Admin Jobs** | PARTIAL | Hand-crafted table, no sorting/filtering | `GET /admin/jobs` |
| **Admin Analytics** | COMPLETE | Charts | `GET /admin/stats` |
| **SuperAdmin Dashboard** | COMPLETE | Stats, charts | `GET /superadmin/stats` |
| **SuperAdmin Users** | PARTIAL | Hand-crafted table, offset pagination (wrong), broken links | `GET /superadmin/candidates` |
| **SuperAdmin Companies** | PARTIAL | Hand-crafted table, broken links | `GET /superadmin/companies` |
| **SuperAdmin Jobs** | PARTIAL | Hand-crafted table, broken links | `GET /superadmin/jobs` |
| **SuperAdmin Security** | PLACEHOLDER | Page exists, no real data | `GET /superadmin/security-events` |
| **SuperAdmin Platform** | PLACEHOLDER | Page exists, no real data | Various SA endpoints |
| **SuperAdmin Audit Logs** | PLACEHOLDER | Page exists, no real data | `GET /superadmin/security-events` |
| **SuperAdmin Auth** | PARTIAL | Login works, but session not restored on refresh, sidebar links broken | Backend SA auth |
| **Notifications** | PARTIAL | API complete, list page exists, but unread count badge not in Topbar, no WebSocket | `GET /notifications/user` |
| **Profile (Shared)** | PARTIAL | CandidateProfilePage uses raw useState; RecruiterProfilePage exists | `GET/PUT /user/current/profile` |

### Completion Summary

| Status | Count | % |
|--------|-------|---|
| COMPLETE | 17 | 40% |
| PARTIAL | 15 | 35% |
| MISSING | 5 | 12% |
| PLACEHOLDER | 4 | 9% |
| BLOCKED | 2 | 5% |

BLOCKED items: Maintenance page (needs backend flag), Talent Pool (needs route)

---

## 9. Technical Debt Register

### CRITICAL (7 items)

| ID | Description | Location | Recommended Phase |
|----|-------------|----------|-----------------|
| CRIT-01 | `endpoints.ts` hardcodes `localhost:5000` — ignores `VITE_API_URL` | `src/lib/api/endpoints.ts` | Phase 2 |
| CRIT-02 | 5 SuperAdmin API files hardcode `localhost:5000` | `src/features/superadmin/api/` | Phase 2 |
| CRIT-03 | `lucide-react` in package.json despite Hugeicons-only rule | `package.json`, 4 shadcn components | Phase 2 |
| CRIT-04 | `CandidateProfilePage` uses raw `useState` — bypasses RHF + Zod | `src/features/profile/pages/candidate/` | Phase 3 |
| CRIT-05 | TanStack Table not used anywhere — manual DOM tables | `features/admin/`, `features/superadmin/` | Phase 4 |
| CRIT-06 | SuperAdmin sidebar links route to `/admin/*` paths | `features/superadmin/layout/` | Phase 2 |
| CRIT-07 | SuperAdmin session not restored on page refresh | `src/stores/superadmin-auth-store.ts` | Phase 2 |

### HIGH (14 items)

| ID | Description | Location | Recommended Phase |
|----|-------------|----------|-----------------|
| HIGH-01 | Pre-existing TS errors in `popover.tsx` and `tooltip.tsx` (Radix namespace) | `src/components/ui/popover.tsx`, `tooltip.tsx` | Phase 2 |
| HIGH-02 | No shared public route layout — 8+ pages duplicate header/footer | `src/routes/_public/*.tsx` | Phase 3 |
| HIGH-03 | Guard `beforeLoad` runs before AuthInitializer restores session — causes flash-redirect on every refresh | `src/guards/`, `src/providers/AuthInitializer.tsx` | Phase 2a |
| HIGH-04 | SuperAdmin pagination uses offset strategy — backend uses cursor | `src/features/superadmin/types/` | Phase 4 |
| HIGH-05 | Notifications use 30s polling — no WebSocket support | `src/features/notifications/` | Phase 6 |
| HIGH-06 | Candidate/Recruiter dashboards are stubs with placeholder data | `candidate/pages/`, `recruiter/pages/` | Phase 5 |
| HIGH-07 | Broken "/recruiter/applicants" sidebar link | `src/components/layout/Sidebar.tsx:34`, `MobileNav.tsx:29` | Phase 3 |
| HIGH-08 | Auth server state duplicated in Zustand (`user` and `role` fields) | `src/stores/auth-store.ts` | Phase 2a |
| HIGH-09 | DevTools ship unconditionally in production bundle | `src/routes/__root.tsx`, `src/providers/QueryProvider.tsx` | Phase 2 |
| HIGH-10 | SuperAdmin login uses raw `useState` — bypasses RHF + Zod validation | `src/features/superadmin/pages/SuperAdminLoginPage.tsx` | Phase 2a |
| HIGH-11 | SuperAdmin API `auth.ts` hardcodes URL strings — bypasses `endpoints.superadmin.*` | `src/features/superadmin/api/auth.ts` | Phase 2a |
| HIGH-12 | Guard timing: beforeLoad fires before AuthInitializer mounts — login-page flash on refresh | Architecture-wide | Phase 2a |
| HIGH-13 | Duplicate `/user/current` fetch on every login (manual fetch + query refetch) | `src/features/auth/hooks/index.ts:53-55` | Phase 2a |
| HIGH-14 | SuperAdmin session restore incomplete: `setAccessToken` doesn't set `isInitialized` | `src/stores/superadmin-auth-store.ts:27` | Phase 2a |

### MEDIUM (14 items)

| ID | Description | Location | Recommended Phase |
|----|-------------|----------|-----------------|
| MED-01 | 8 Design/ directories lack `code.html` | `Design/` (various) | Phase 8 |
| MED-02 | JobDetailPage same-company filtering (design: cross-company) | `src/features/jobs/components/JobDetailPage.tsx` | Phase 5 |
| MED-03 | JobDetailPage description as single block (design: 3 sections) | `src/features/jobs/components/JobDetailPage.tsx` | Phase 5 |
| MED-04 | Hardcoded `bg-[#080808]` on LandingPage | `src/features/public/components/LandingPage.tsx` | Phase 8 |
| MED-05 | No component tests for shared UX components | `tests/unit/` | Phase 7 |
| MED-06 | No offline state detection | Project-wide | Phase 8 |
| MED-07 | `--radius: 0.625rem` in CSS (should be 0px) | `src/styles.css` | Phase 2 |
| MED-08 | Shadow utilities in shadcn components violate design rules | `dialog.tsx`, `dropdown-menu.tsx`, etc. | Phase 2 |
| MED-09 | Legacy CSS tokens (`--sea-ink`, `--lagoon`, etc.) | `src/styles.css` | Phase 2 |
| MED-10 | Analytics charts use hardcoded hex colors instead of gradient tokens | `AnalyticsSection.tsx` | Phase 5 |
| MED-11 | No mobile navigation for SuperAdmin | `SuperAdminLayout.tsx` | Phase 4 |
| MED-12 | Saved jobs uses raw `localStorage` instead of Zustand store | `SavedJobsButton.tsx` | Phase 3 |
| MED-13 | Body text size drift (13px vs design spec 15px) | Multiple components | Phase 8 |
| MED-14 | Job card layout is single-column (design: 2-column grid) | `JobsMarketplace.tsx` | Phase 5 |

### LOW (12 items)

| ID | Description | Location | Recommended Phase |
|----|-------------|----------|-----------------|
| LOW-01 | SuperAdmin auth uses raw URL strings | `src/features/superadmin/api/auth.ts` | Phase 2 |
| LOW-02 | Duplicate application types in both `applications/` and `jobs/` | Both type files | Phase 4 |
| LOW-03 | Legacy CSS tokens pollute stylesheet | `src/styles.css` | Phase 2 |
| LOW-04 | Icon system drift (Hugeicons vs Material Symbols in design) | Project-wide | Phase 8 |
| LOW-05 | `mono-label` size 12px vs design spec 11px | Project-wide | Phase 8 |
| LOW-06 | `aria-describedby` missing on some dialogs | `dialog.tsx` | Phase 7 |
| LOW-07 | Admin routes use inline `<div className="p-6">` | `admin/*.tsx` routes | Phase 4 |
| LOW-08 | Unread count badge polling not implemented in Topbar | `Topbar.tsx` | Phase 5 |
| LOW-09 | Company `fetchTeam` and Recruiter `fetchRecruiterNotifications` manually unwrap data | Various API files | Phase 3 |
| LOW-10 | Profile update does not invalidate auth query | `profile/hooks/index.ts` | Phase 3 |
| LOW-11 | Empty directories (dead code) — auth/services, auth/validators, company/dialogs, recruiter/schemas, admin/schemas/admin/utils, superadmin/utils | Various feature dirs | Phase 2 |
| LOW-12 | ApplicationStatus type defined in both applications and jobs types | Both features | Phase 4 |

---

## 10. Proposed Implementation Roadmap

### Phase 2a — Authentication & Session Architecture Fixes

**Objective:** Fix the auth architecture root causes that undermine all authenticated pages. Must be completed BEFORE or concurrently with Phase 2 build fixes, as auth state drives header, navigation, routing, and guards.

**Estimated Complexity:** High

**Dependencies:** None (auth is independent of build system)

**Recommended Model:** DeepSeek V4 Flash

**Deliverables (12 auth-specific fixes):**

**1. Fix SuperAdmin auth store consistency (CRIT-07, HIGH-14)**
- Add `setRestoringSession` action to match regular auth store API
- Fix `setAccessToken` to set `isInitialized: true` (matching regular store behavior)
- Implement actual session restore on app mount (AuthInitializer already attempts this, but store doesn't properly reflect state)

**2. Fix guard `beforeLoad` timing (HIGH-03, HIGH-12)**
- The root cause: TanStack Router `beforeLoad` fires synchronously during route resolution, before React's `useEffect` in AuthInitializer runs
- **Option A:** Make guards async and wait for AuthInitializer to resolve before checking auth state
- **Option B:** In guards, check `isInitialized` first — if false, don't redirect (let AuthInitializer handle it), if true, check auth
- **Option C:** Defer route resolution until initialization completes (e.g., don't render router until ready)
- **Recommended:** Option C — wrap router in an initialization gate after AuthInitializer signals ready. This eliminates the login-page flash entirely.

**3. Eliminate login-page flash (HIGH-03)**
- Once guard timing is fixed, remove the `useEffect` redirect workaround from LoginPage and RegisterPage
- Users on a fresh page load will either go directly to their dashboard (session restored) or to login (no session)

**4. Fix SuperAdmin login form (HIGH-10)**
- Migrate `SuperAdminLoginPage.tsx` from raw `useState` to `react-hook-form` + Zod validation
- Add proper loading/error states, field-level validation, error linking via `aria-describedby`

**5. Fix SuperAdmin API URL hardcoding (HIGH-11)**
- Replace `${BASE_URL}/superadmin/login` with `endpoints.superadmin.login`
- Same for refresh and logout endpoints

**6. Remove duplicate `/user/current` fetch on login (HIGH-13)**
- In `useLogin().onSuccess`, either:
  - Remove manual `fetchCurrentUser()` call (rely on query invalidation + `useCurrentUser()` refetch)
  - Or set the query cache directly from the `setUser()` data (skip re-fetch)
- This eliminates 1 extra network call on every login

**7. Remove auth server state from Zustand (HIGH-08)**
- `user` and `role` in auth-store are server state and should flow through TanStack Query
- Keep `accessToken` and `isAuthenticated` in Zustand (client-only state needed by guards)
- Derive `role` from `useCurrentUser()` query data instead of duplicate Zustand field
- Updated guards and sidebar to use query-based role instead of store-based role

**8. Fix UserMenu Settings link (MEDIUM)**
- Change from hardcoded `/candidate/profile` to role-based routing:
  - CANDIDATE → `/candidate/profile`
  - RECRUITER → `/recruiter/profile`
  - ADMIN → `/admin/dashboard`
  - SUPERADMIN → `/superadmin/platform`

**9. Fix `redirectIfAuthenticated` to check SA auth (MEDIUM)**
- Add check for `useSuperAdminAuthStore.getState().isAuthenticated`
- Redirect SA to `/superadmin/dashboard` instead of showing login page

**10. Fix SA logout to navigate explicitly (LOW)**
- Add `router.navigate({ to: "/superadmin/login" })` after `clearAuth()` in SA layout

**11. Add SuperAdmin session indicator to Sidebar (MEDIUM)**
- The regular Sidebar shows "SESSION_ACTIVE" for regular auth — SuperAdmin layout should show the same

**12. Review and fix VerifyEmailPage auto-mutation trigger (LOW)**
- Simplify the `!verifyMutation.isIdle === false` condition
- Add proper `useEffect` wrapper to prevent re-trigger on re-render

---

### Phase 2b — Critical Infrastructure & Build Fixes

**Objective:** Fix all build-blocking and CRITICAL infrastructure issues that prevent production deployment.

**Estimated Complexity:** Medium

**Dependencies:** Phase 2a (auth fixes are independent but should be prioritized)

**Recommended Model:** DeepSeek V4 Flash

**Deliverables:**
- Fix popover/tooltip Radix imports (HIGH-01) — unblocks production build
- Fix `endpoints.ts` to use `env.apiUrl` (CRIT-01) — unblocks deployment to non-localhost
- Fix 5 SuperAdmin API files to use `env.apiUrl` + `endpoints.*` (CRIT-02, LOW-01)
- Remove `lucide-react` — replace icons with Hugeicons, remove from package.json (CRIT-03)
- Remove DevTools from production bundle (HIGH-09)
- Fix CSS: `--radius: 0`, remove shadows from shadcn components, remove legacy tokens (MED-07, MED-08, MED-09, LOW-03)
- Remove empty dead-code directories (LOW-11)
- **Backend:** Fix hardcoded email recipient in `email.ts` (backend CRIT)
- **Backend:** Fix application default status from SHORTLISTED to PENDING (backend CRIT)
- **Backend:** Implement `/ready` readiness endpoint (backend HIGH)

---

### Phase 3 — Public Route Architecture & Remaining Auth Fixes

**Objective:** Create shared public route layout, fix auth timing issues, and consolidate auth state.

**Estimated Complexity:** Medium

**Dependencies:** Phase 2 (build must succeed)

**Recommended Model:** DeepSeek V4 Flash

**Deliverables:**
- Create shared `_public` layout with PublicHeader + PublicFooter (HIGH-02)
- Fix guard `beforeLoad` timing — ensure AuthInitializer completes before guards execute (HIGH-03)
- Remove server auth state from Zustand — derive from TanStack Query only (HIGH-08)
- Fix redirectIfAuthenticated to check SuperAdmin auth too
- Add `setRestoringSession` to SuperAdmin auth store (consistency)
- Fix broken "/recruiter/applicants" links (HIGH-07)
- Fix UserMenu Settings link to use role-based routing
- Migrate SavedJobsButton from raw localStorage to Zustand store (MED-12)
- Fix profile update auth query invalidation (LOW-10)
- Clean up manual data unwrapping in company/recruiter API files (LOW-09)

---

### Phase 4 — DataTable Migration & Admin Consolidation

**Objective:** Migrate all hand-crafted tables to shared TanStack Table, consolidate admin/superadmin shared components, fix pagination.

**Estimated Complexity:** High

**Dependencies:** Phase 2, Phase 3

**Recommended Model:** DeepSeek V4 Flash

**Deliverables:**
- Migrate Admin & SuperAdmin tables to shared DataTable (CRIT-05)
- Migrate admin shared components to use shared/ux equivalents (remove duplicates)
- Migrate superadmin shared components to use shared/ux equivalents (remove triplicates)
- Fix SuperAdmin pagination from offset to cursor-based (HIGH-04)
- Add sorting, filtering, and column visibility to admin tables
- Consolidate duplicate types across applications/jobs features (LOW-02, LOW-12)
- Standardize admin route layout (remove inline `p-6` divs) (LOW-07)
- Add mobile navigation for SuperAdmin (MED-11)

---

### Phase 5 — Dashboard Implementation & Data Integration

**Objective:** Replace all placeholder/stub dashboards with real data integration matching Design/ directory mockups.

**Estimated Complexity:** High

**Dependencies:** Phase 3 (auth fixes), Phase 4 (table migration)

**Recommended Model:** DeepSeek V4 Flash or Nemotron 3 Ultra

**Deliverables:**
- Implement full Candidate Dashboard with 6 stat tiles, application breakdown chart, company follow feed (HIGH-06)
- Implement full Recruiter Dashboard with 6 stat tiles, quick actions, recent activity (HIGH-06)
- Implement full Recruiter Analytics page against design
- Migrate CandidateProfilePage to RHF + Zod (CRIT-04)
- Fix JobDetailPage: add Responsibilities/Requirements/Benefits sections (MED-03)
- Fix JobDetailPage similar roles to use cross-company filtering (MED-02)
- Fix Job Marketplace to use 2-column grid layout (MED-14)
- Implement unread count badge polling in Topbar (LOW-08)
- Migrate analytics charts to use gradient tokens (MED-10)

---

### Phase 6 — Missing Features & Pages

**Objective:** Build all missing pages from Design/ directory and implement outstanding features.

**Estimated Complexity:** Medium

**Dependencies:** Phase 3 (auth), Phase 5 (data integration patterns established)

**Recommended Model:** DeepSeek V4 Flash

**Deliverables:**
- Implement Pricing Page (`/pricing`) from design
- Implement Recruiter Talent Pool / Candidate CRM (`/recruiter/talent-pool`)
- Implement Company Creation / Onboarding flow
- Implement WebSocket notification support (replace 30s polling) (HIGH-05)
- Implement SuperAdmin Security Events page with real data
- Implement SuperAdmin Platform Settings page with real data
- Implement SuperAdmin Audit Logs page with real data

---

### Phase 7 — Testing & Accessibility

**Objective:** Achieve WCAG AA compliance and comprehensive test coverage.

**Estimated Complexity:** Medium

**Dependencies:** Phases 2-6 (all features stable)

**Recommended Model:** DeepSeek V4 Flash

**Deliverables:**
- Write component tests for all shared UX components (LoadingState, EmptyState, ErrorState, etc.) (MED-05)
- Write integration tests for all feature hooks
- Add `aria-describedby` to all dialogs (LOW-06)
- Verify keyboard navigation across all pages
- Add focus management to dialogs and drawers
- Ensure color contrast meets WCAG AA in both themes
- Add `sr-only` text for icon-only buttons
- Verify screen reader announcements for dynamic content

---

### Phase 8 — Polish & Performance

**Objective:** Final UI polish, performance optimization, and accessibility verification.

**Estimated Complexity:** Low

**Dependencies:** All previous phases

**Recommended Model:** DeepSeek V4 Flash

**Deliverables:**
- Fix body text size consistency (MED-13)
- Fix `mono-label` size to match design spec 11px (LOW-05)
- Fix LandingPage hardcoded background (MED-04)
- Add offline state detection (MED-06)
- Standardize icon system (LOW-04)
- Add prefetching in route loaders
- Add missing `code.html` files to Design/ directory (MED-01)
- Verify 8 Design/ directories without code.html
- Production readiness review

---

## Appendix A: Audit Data Sources

This backlog was generated from the following audit sources:

| Source | Description |
|--------|-------------|
| Frontend source files | 54 routes, 11 features, 6 stores, 3 guards, 19+ shadcn primitives |
| Backend source files | 10 route files, 21 controllers, 21 services, 10 middleware, Prisma schema |
| Design/ directory | 98 subdirectories, 94 design mockup folders |
| Core documents | AI_ENGINEERING_RULES.md, PROJECT_KNOWLEDGE.md, IMPLEMENTATION_LOG.md, CLAUDE.md, AGENTS.md, DESIGN.md, README.md |
| Additional documents | ARCHITECTURE.md, DEPLOYMENT.md, PRODUCTION_READINESS.md, DESIGN_COMPLIANCE.md, AUDIT.md, Audit_v2.md, API_CONTRACT.md |

## Appendix B: Phase Dependency Graph

```
Phase 2 (Critical Infrastructure)
  └── Phase 3 (Public Route Architecture & Auth)
       └── Phase 4 (DataTable Migration & Admin)
            └── Phase 5 (Dashboard Implementation)
                 └── Phase 6 (Missing Features)
                      └── Phase 7 (Testing & Accessibility)
                           └── Phase 8 (Polish & Performance)
```

Phase 2 must complete first (build is currently broken).
Phases 3-4 can partially overlap after Phase 2.
Phases 5-6 depend on Phases 3-4 for stable auth and component foundations.
Phases 7-8 are the final quality gates before production release.

---

## Appendix C: Phase 11A Production Audit Remediation Items

**Generated:** 2026-06-28 — Phase 11A Production Acceptance Audit
**Status:** ✅ ALL VERIFIABLE ITEMS RESOLVED Phase 11B — CSP/CSRF are backend/deployment

### CRITICAL (Production Blocking)

| # | Item | Severity | Files | Phase | Status |
|---|------|----------|-------|-------|--------|
| C1 | Remove `.env` from git history, rotate all credentials | CRITICAL | `jobboard/.env` | 12A | ✅ FALSE POSITIVE — `.env` not git-tracked |
| C2 | Implement CSRF protection on all forms | CRITICAL | All form submissions | 12A | 🔄 Backend concern (middleware) |
| C3 | Sanitize all `dangerouslySetInnerHTML` with DOMPurify | CRITICAL | `JobDetailPage.tsx`, `CompanyOverviewPage.tsx`, `ApplicationDetailPanel.tsx` | 12A | ✅ FALSE POSITIVE — already absent from source |

### HIGH (Must Fix Before Launch)

| # | Item | Severity | Files | Phase | Status |
|---|------|----------|-------|-------|--------|
| H1 | Add Content Security Policy (CSP) headers | HIGH | Backend config | 12A | 🔄 Backend/deployment concern |
| H2 | Remove `role` from localStorage, derive from JWT | HIGH | `auth-store.ts` | 12B | ✅ FALSE POSITIVE — role never persisted |
| H3 | Remove useJobs 30s polling, add manual refresh | HIGH | `jobs/hooks/index.ts` | 12B | ✅ MISIDENTIFIED — notifications had polling, now fixed |
| H4 | Implement route-level lazy loading | HIGH | All route files | 12B | 🔄 Future optimization (not blocking) |
| H5 | Fix dialog `aria-describedby`/`aria-labelledby` | HIGH | `dialog.tsx` | 12B | ✅ FALSE POSITIVE — Radix handles this automatically |
| H6 | Add accessible label to SearchInput | HIGH | `SearchInput.tsx` | 12B | ✅ RESOLVED Phase 11B |

### MEDIUM (Should Fix)

| # | Item | Severity | Files | Phase | Status |
|---|------|----------|-------|-------|--------|
| M1 | Clean up 24+ `console.log` statements | MEDIUM | Multiple files | 12C | ✅ FALSE POSITIVE — zero found |
| M2 | Remove 10+ dead code items | MEDIUM | SA*, shared components | 12C | ✅ RESOLVED Phase 11B (11 files removed) |
| M3 | Fix TypeScript `any` usage | MEDIUM | 10+ locations | 12C | ✅ RESOLVED Phase 11B (0 remaining) |
| M4 | Add `aria-busy` to loading states | MEDIUM | Loading components | 12C | ✅ RESOLVED Phase 11B |
| M5 | Fix table filter keyboard navigation | MEDIUM | `DataTable.tsx` | 12C | ✅ FALSE POSITIVE — no filter popover, native input |
| M6 | Fix color-only error states (add icon) | MEDIUM | `ErrorState.tsx` | 12C | ✅ RESOLVED Phase 11B |

### LOW (Nice to Have)

| # | Item | Severity | Files | Phase | Status |
|---|------|----------|-------|-------|--------|
| L1 | Resolve TODO/FIXME comments | LOW | 7 locations | 12D | ✅ FALSE POSITIVE — zero found |
| L2 | Clean up empty directories | LOW | 8 directories | 12D | ✅ RESOLVED Phase 11B (1 found) |
| L3 | Consolidate duplicate component patterns | LOW | 5+ duplicates | 12D | ✅ RESOLVED Phase 11B |
| L4 | Add error icons to ErrorState | LOW | `ErrorState.tsx` | 12D | ✅ RESOLVED Phase 11B |
