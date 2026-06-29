# ADMIN UI ARCHITECTURE REPORT

> **Phase 10A — Admin & SuperAdmin Architecture Audit**
> **Generated:** 2026-06-28 | **Status:** READ-ONLY AUDIT COMPLETE
> **Scope:** All Admin + SuperAdmin pages, components, API, guards, design mockups

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Admin Subsystem](#3-admin-subsystem)
4. [SuperAdmin Subsystem](#4-superadmin-subsystem)
5. [Security & RBAC Audit](#5-security--rbac-audit)
6. [Design Coverage Matrix](#6-design-coverage-matrix)
7. [Backend Integration Matrix](#7-backend-integration-matrix)
8. [Component Inventory](#8-component-inventory)
9. [UX Findings & Gaps](#9-ux-findings--gaps)
10. [Feature Completeness Matrix](#10-feature-completeness-matrix)
11. [E2E Operational Journeys](#11-e2e-operational-journeys)
12. [Engineering Blueprint Per Page](#12-engineering-blueprint-per-page)
13. [Deferred Items & Blockers](#13-deferred-items--blockers)
14. [Priority Remediation Roadmap](#14-priority-remediation-roadmap)

---

## 1. Executive Summary

### Overall System Design Fidelity: ~40%

| Subsystem | Fidelity | Status |
|-----------|----------|--------|
| Admin Dashboard | 35% | Basic stat grid, missing system health + activity feed |
| Admin Users | 50% | DataTable with search/filter, detail drawer, deactivation |
| Admin Companies | 50% | DataTable with search/filter, verify/unverify toggle |
| Admin Jobs | 55% | DataTable with search/filter, force-close + delete |
| Admin Analytics | 45% | Charts (bar, pie) + metrics table, missing real-time data |
| SuperAdmin Dashboard | 30% | 7-tile stat grid only, no charts/activity |
| SuperAdmin Users | 35% | Candidate-only, no recruiter/admin management |
| SuperAdmin Companies | 45% | Search, verify/unverify, delete |
| SuperAdmin Jobs | 40% | List + force-close, no search/filter |
| SuperAdmin Audit Logs | 5% | **PLACEHOLDER** — just EmptyState |
| SuperAdmin Security | 30% | Event table, no search/filter by type/severity |
| SuperAdmin Platform | 25% | Ownerless companies only, no platform settings |
| SuperAdmin Login | 80% | Functional, missing password field toggle |

### Key Findings

1. **SuperAdmin Audit Logs is a placeholder** — the page renders `EmptyState` with a message saying "audit logs are available in the Admin panel." No data fetching, no table, no functionality.

2. **Admin has no dedicated layout** — Admin routes use the shared `Sidebar.tsx` nav config, while SuperAdmin has its own `SuperAdminLayout.tsx` with a standalone sidebar.

3. **SuperAdmin user management is candidate-only** — The API endpoint `GET /superadmin/candidates` only returns candidate accounts. No ability to manage recruiter or admin accounts from SuperAdmin.

4. **Duplicate functionality between Admin and SuperAdmin** — Both have user management, company management, and job management pages with overlapping but slightly different capabilities.

5. **No platform settings page** — SuperAdmin Platform page only shows ownerless companies. No global platform configuration (maintenance mode, feature flags, etc.).

6. **Design mockups exist but are largely unimplemented** — 13+ design files for admin/superadmin views, but current implementations match only basic structural patterns.

7. **Security events page has no filtering** — Despite the API supporting `eventType` and `severity` filters, the UI only provides cursor pagination.

---

## 2. System Architecture Overview

### Dual Auth Domains

```
┌─────────────────────────────────────────────────┐
│                   AUTH SYSTEM                     │
├──────────────────────┬──────────────────────────┤
│   Admin Auth Domain  │  SuperAdmin Auth Domain   │
│                      │                           │
│  useAuthStore        │  useSuperAdminAuthStore    │
│  Access Token Memory │  Access Token Memory       │
│  Refresh: httpOnly   │  Refresh: httpOnly         │
│  Role: ADMIN         │  Separate admin object     │
│                      │                           │
│  Login: /login       │  Login: /superadmin/login  │
│  Guard: requireAuth  │  Guard: requireSuperAdmin  │
│  + requireRole       │                           │
│  (["ADMIN","SUPERADMIN"])                        │
└──────────────────────┴──────────────────────────┘
```

### Route Architecture

```
_authenticated/
├── admin/
│   ├── dashboard.tsx      → requireRole(["ADMIN", "SUPERADMIN"])
│   ├── users.tsx          → requireRole(["ADMIN", "SUPERADMIN"])
│   ├── jobs.tsx           → requireRole(["ADMIN", "SUPERADMIN"])
│   ├── companies.tsx      → requireRole(["ADMIN", "SUPERADMIN"])
│   └── analytics.tsx      → requireRole(["ADMIN", "SUPERADMIN"])

_superadmin/
└── superadmin/
    ├── dashboard.tsx      → requireSuperAdmin()
    ├── users.tsx          → requireSuperAdmin()
    ├── jobs.tsx           → requireSuperAdmin()
    ├── companies.tsx      → requireSuperAdmin()
    ├── audit-logs.tsx     → requireSuperAdmin()
    ├── security.tsx       → requireSuperAdmin()
    └── platform.tsx       → requireSuperAdmin()
```

### Guard Hierarchy

| Guard | Function | Store | Redirect |
|-------|----------|-------|----------|
| `requireAuth()` | Checks `isAuthenticated` + `accessToken` | `useAuthStore` | `/login` |
| `requireRole(roles[])` | Calls `requireAuth()` + checks role | `useAuthStore` | Default dashboard by role |
| `requireSuperAdmin()` | Checks `isAuthenticated` + `accessToken` | `useSuperAdminAuthStore` | `/superadmin/login` |
| `redirectIfAuthenticated()` | Redirects authenticated users | Both stores | Role-based dashboard |

**Critical Observation:** Admin routes use `requireRole(["ADMIN", "SUPERADMIN"])`, meaning SUPERADMIN role holders can access Admin routes. This is intentional — SuperAdmins have Admin-level access plus their own dedicated SuperAdmin routes.

### Sidebar Navigation Configs

| Role | Nav Items | File |
|------|-----------|------|
| ADMIN | Dashboard, Users, Jobs, Companies, Analytics, Notifications | `Sidebar.tsx` (shared) |
| SUPERADMIN | Dashboard, Users, Jobs, Companies, Audit Logs, Security, Platform | `Sidebar.tsx` (shared) + `SuperAdminLayout.tsx` (own) |

**Issue:** Admin nav includes "Analytics" but no "Audit Logs". SuperAdmin nav includes "Audit Logs" but no "Analytics". The shared `Sidebar.tsx` nav config for SUPERADMIN matches the `SuperAdminLayout.tsx` nav items.

---

## 3. Admin Subsystem

### 3.1 Feature Structure

```
features/admin/
├── api/index.ts              → 5 API modules (audit-logs, companies, dashboard, jobs, users)
├── components/
│   ├── analytics/            → AnalyticsSection (Recharts bar + pie charts)
│   ├── companies/            → CompanyTable (DataTable with verify/unverify)
│   ├── dashboard/            → StatsCard, StatsGrid (5-tile grid)
│   └── users/                → UserTable (DataTable with role filter), UserDetailDrawer
├── hooks/index.ts            → 6 hooks (useAdminStats, useAdminUsers, useAdminJobs, etc.)
├── pages/                    → 5 pages (Dashboard, Users, Companies, Jobs, Analytics)
└── types/index.ts            → 5 type modules (audit-logs, companies, dashboard, jobs, users)
```

### 3.2 Page-by-Page Analysis

#### AdminDashboardPage (`admin/dashboard`)
- **Lines:** 46
- **Stats:** 5-tile grid (Total Users, Total Recruiters/Companies, Total Jobs, Total Applications, Platform Activity)
- **Design Match:** Partial — 5-tile grid matches design's 8-tile pattern but missing: System Health, Uptime %, Response Time, Active Sessions
- **Loading:** Skeleton (5 tiles)
- **Error:** ErrorState with retry
- **Missing:** System health indicators, activity feed, uptime dots, response time metrics

#### AdminUsersPage (`admin/users`)
- **Lines:** 31 (page) + 236 (UserTable) + 95 (UserDetailDrawer) = 362 total
- **Features:** Search, role filter (CANDIDATE/RECRUITER/ADMIN), cursor pagination, user detail drawer, deactivate
- **Design Match:** Partial — DataTable matches design structure, but design shows: status toggle (Active/Inactive tabs), ban reason modal, last active timestamp
- **Missing:** Status filter tabs, ban reason field, last active display, user detail drawer shows `companyId` as raw ID instead of company name

#### AdminCompaniesPage (`admin/companies`)
- **Lines:** 14 (page) + 249 (CompanyTable) = 263 total
- **Features:** Search, verified filter (All/Verified/Unverified), cursor pagination, verify/unverify toggle
- **Design Match:** Partial — Design shows: company logo, plan badge, job count, member count, created date, actions (Verify/Unverify, Delete)
- **Missing:** Company logo, plan display, delete action (only verify/unverify in current implementation)

#### AdminJobsPage (`admin/jobs`)
- **Lines:** 14 (page) + 262 (AdminJobTable) = 276 total
- **Features:** Search, status filter (All/Open/Draft/Closed/Expired), cursor pagination, force-close, delete
- **Design Match:** Good — matches design table structure with status badges, company name, application count
- **Missing:** Job detail link (no link to view full job), applicant count as "Apps" column header is unclear

#### AdminAnalyticsPage (`admin/analytics`)
- **Lines:** 50 (page) + 219 (AnalyticsSection) = 269 total
- **Features:** Bar chart (Platform Composition), Pie charts (Job Status, Application Status), Platform Metrics table
- **Design Match:** Partial — Design mockups show more detailed metrics with date range filters, trend indicators
- **Missing:** Date range filter, trend indicators (up/down arrows), real-time updates, export functionality

### 3.3 Admin API Endpoints

| Endpoint | Method | Purpose | Implemented |
|----------|--------|---------|-------------|
| `/admin/stats` | GET | Platform statistics | ✅ |
| `/admin/users` | GET | List users with search/role/status/company | ✅ |
| `/admin/users/:id` | GET | User detail | ✅ |
| `/admin/users/:id/deactivate` | POST | Deactivate user | ✅ |
| `/admin/companies` | GET | List companies with search/verified/plan | ✅ |
| `/admin/companies/:id` | GET | Company detail | ✅ |
| `/admin/companies/:id/verify` | POST | Verify/unverify company | ✅ |
| `/admin/jobs` | GET | List jobs with search/status/company | ✅ |
| `/admin/jobs/:id/force-close` | POST | Force-close job | ✅ |
| `/admin/jobs/:id` | DELETE | Delete job | ✅ |
| `/admin/audit-logs` | GET | Audit logs with action/admin filters | ✅ (API only) |

**Note:** The `fetchAuditLogs` function exists in `api/audit-logs.ts` but is exported from `api/index.ts` and never used in any page component. The audit logs page is not implemented.

### 3.4 Admin Components

| Component | Lines | Purpose | Quality |
|-----------|-------|---------|---------|
| `StatsCard` | 23 | Single stat tile | ✅ Good — clean, minimal |
| `StatsGrid` | 43 | 5-tile stat grid | ✅ Good — responsive layout |
| `UserTable` | 236 | DataTable with search/filter/pagination | ⚠️ Functional but missing design features |
| `UserDetailDrawer` | 95 | Side sheet with user details | ⚠️ Shows companyId as raw ID |
| `CompanyTable` | 249 | DataTable with search/filter/pagination | ⚠️ Functional but missing delete action |
| `AdminJobTable` | 262 | DataTable with search/filter/pagination | ✅ Good — has force-close + delete |
| `AnalyticsSection` | 219 | Charts + metrics | ⚠️ Basic charts, no date range |

---

## 4. SuperAdmin Subsystem

### 4.1 Feature Structure

```
features/superadmin/
├── api/                      → 7 API modules (auth, companies, dashboard, jobs, ownerless, security, users)
├── hooks/                    → 6 hook files
├── layout/                   → SuperAdminLayout.tsx (standalone sidebar + mobile nav)
├── pages/                    → 8 pages
├── types/                    → 3 type modules (dashboard, jobs, users)
└── [no components/]          → All UI inline in pages
```

**Architecture Difference from Admin:** SuperAdmin has its own layout component (`SuperAdminLayout.tsx`) with a standalone sidebar, while Admin uses the shared `Sidebar.tsx` nav config. This is because SuperAdmin has a separate auth domain and different navigation structure.

### 4.2 Page-by-Page Analysis

#### SuperAdminDashboardPage (`superadmin/dashboard`)
- **Lines:** 81
- **Stats:** 7-tile grid (Total Users, Candidates, Recruiters, Companies, Total Jobs, Open Jobs, Applications)
- **Design Match:** Low — Design shows: 8-tile stat grid, system health panel, activity feed, uptime indicators
- **Loading:** Skeleton (7 tiles)
- **Error:** ErrorState with retry
- **Missing:** System health indicators, activity feed, uptime dots, response time, platform version

#### SuperAdminUsersPage (`superadmin/users`)
- **Lines:** 194
- **Features:** Search candidates, cursor pagination, ban confirmation
- **Design Match:** Low — Design shows: role toggle (Candidates/Recruiters/Admins tabs), stats tiles (total candidates, active, suspended), table with avatar, status badges, bulk actions
- **Critical Gap:** Only manages candidate accounts. No recruiter or admin management from SuperAdmin.
- **Missing:** Role filter tabs, stats summary tiles, user avatar display, bulk actions, user detail view

#### SuperAdminCompaniesPage (`superadmin/companies`)
- **Lines:** 230
- **Features:** Search, cursor pagination, verify/unverify toggle, delete with confirmation
- **Design Match:** Moderate — Design shows: search, filters, table with industry, verified badge, jobs count, members count, actions
- **Missing:** Company detail view, industry filter, plan filter, member list view

#### SuperAdminJobsPage (`superadmin/jobs`)
- **Lines:** 178
- **Features:** List jobs, cursor pagination, force-close with confirmation
- **Design Match:** Low — No specific design mockup for SuperAdmin jobs
- **Missing:** Search, status filter, company filter, job detail link, bulk actions

#### SuperAdminAuditLogsPage (`superadmin/audit-logs`)
- **Lines:** 21
- **Status:** ⚠️ **PLACEHOLDER** — EmptyState only
- **Design Match:** 0% — Design shows: date range picker, actor search, action type filter, detailed table with timestamps, actor info, target info, metadata
- **Missing:** EVERYTHING — no data fetching, no table, no filters, no pagination

#### SuperAdminSecurityPage (`superadmin/security`)
- **Lines:** 134
- **Features:** List security events, cursor pagination, event type badges
- **Design Match:** Low — Design shows: date range filter, severity filter, event type filter, detailed event cards
- **Missing:** Search, date range filter, severity filter, event type filter, event detail view

#### SuperAdminPlatformPage (`superadmin/platform`)
- **Lines:** 172
- **Features:** List ownerless companies, recover ownership
- **Design Match:** Low — Design shows: platform settings (maintenance mode, feature flags), system info
- **Missing:** Platform settings, maintenance mode toggle, feature flags, system info, notification templates

#### SuperAdminLoginPage (`superadmin/login`)
- **Lines:** 89
- **Features:** Email/password login, error display, loading state
- **Design Match:** Good — Clean form with monospace labels, matches Industrial Broadsheet style
- **Missing:** Password visibility toggle, forgot password link

### 4.3 SuperAdmin API Endpoints

| Endpoint | Method | Purpose | Implemented |
|----------|--------|---------|-------------|
| `/superadmin/login` | POST | Admin login | ✅ |
| `/superadmin/refresh-token` | POST | Refresh access token | ✅ |
| `/superadmin/logout` | POST | Admin logout | ✅ |
| `/superadmin/stats` | GET | Platform statistics | ✅ |
| `/superadmin/candidates` | GET | List candidates | ✅ |
| `/superadmin/candidates/:id/ban` | POST | Ban candidate | ✅ |
| `/superadmin/companies` | GET | List companies | ✅ |
| `/superadmin/companies/:id/verify` | POST | Verify/unverify | ✅ |
| `/superadmin/companies/:id` | DELETE | Delete company | ✅ |
| `/superadmin/jobs` | GET | List jobs | ✅ |
| `/superadmin/jobs/:id/force-close` | POST | Force-close job | ✅ |
| `/superadmin/security-events` | GET | Security events | ✅ |
| `/superadmin/ownerless-companies` | GET | Ownerless companies | ✅ |
| `/superadmin/ownerless-companies/:id/assign-owner` | POST | Assign owner | ✅ |
| `/superadmin/ownerless-companies/:id/recover-ownership` | POST | Recover ownership | ✅ |
| `/superadmin/audit-logs` | GET | Audit logs | ❌ **API exists in admin, not in superadmin** |

### 4.4 SuperAdmin Components

| Component | Lines | Purpose | Quality |
|-----------|-------|---------|---------|
| `SuperAdminLayout` | 188 | Standalone sidebar + mobile nav | ✅ Good — clean, responsive |
| `SuperAdminSidebar` | (embedded) | Navigation items | ✅ Good — matches design |
| `SuperAdminLoginPage` | 89 | Login form | ✅ Good — functional |
| All page components | — | Inline UI | ⚠️ No shared components, all inline |

**Note:** SuperAdmin has NO shared components directory. All UI is inline in page components. This is a deviation from the Admin feature structure which has `components/` with reusable pieces.

---

## 5. Security & RBAC Audit

### 5.1 Auth Store Isolation

| Store | Token Storage | Persistence | Role Field |
|-------|--------------|-------------|------------|
| `useAuthStore` | In-memory only | ❌ No persistence | `role: UserRole` |
| `useSuperAdminAuthStore` | In-memory only | ❌ No persistence | No role field (implicit SUPERADMIN) |

**Security Assessment:**
- ✅ Access tokens stored in memory only (not localStorage/sessionStorage)
- ✅ Refresh tokens in httpOnly cookies (not accessible from JS)
- ✅ Separate auth domains prevent cross-contamination
- ⚠️ SuperAdmin store has no role field — relies on separate store for implicit role assertion

### 5.2 Route Guard Analysis

| Route | Guard | Protected By | Vulnerability |
|-------|-------|-------------|---------------|
| `/admin/*` | `requireRole(["ADMIN", "SUPERADMIN"])` | `useAuthStore` | ✅ Secure |
| `/superadmin/*` | `requireSuperAdmin()` | `useSuperAdminAuthStore` | ✅ Secure |
| `/login` | `redirectIfAuthenticated()` | Both stores | ✅ Secure |
| `/superadmin/login` | `redirectIfAuthenticated()` | Both stores | ✅ Secure |

**Critical Security Finding:**
- Admin routes allow both ADMIN and SUPERADMIN roles. This means a SUPERADMIN can access `/admin/*` routes.
- SuperAdmin routes only allow SUPERADMIN. An ADMIN cannot access `/superadmin/*`.
- This is intentional design — SuperAdmins have elevated access across the platform.

### 5.3 API Authorization

| Endpoint | Backend Middleware | Frontend Enforcement |
|----------|-------------------|---------------------|
| `GET /admin/stats` | `requireAuth` + `requireRole(["ADMIN"])` | Route guard in `beforeLoad` |
| `POST /admin/users/:id/deactivate` | `requireAuth` + `requireRole(["ADMIN"])` | Route guard in `beforeLoad` |
| `POST /admin/companies/:id/verify` | `requireAuth` + `requireRole(["ADMIN"])` | Route guard in `beforeLoad` |
| `GET /superadmin/candidates` | `requireSuperAdmin` | Route guard in `beforeLoad` |
| `POST /superadmin/companies/:id/delete` | `requireSuperAdmin` | Route guard in `beforeLoad` |
| `POST /superadmin/jobs/:id/force-close` | `requireSuperAdmin` | Route guard in `beforeLoad` |

**Security Assessment:**
- ✅ Backend enforces role-based access on all admin/superadmin endpoints
- ✅ Frontend route guards provide early redirect (before page load)
- ✅ `beforeLoad` hooks prevent component rendering for unauthorized users
- ⚠️ No client-side RBAC component-level guards (e.g., hiding buttons based on role)
- ⚠️ SuperAdmin can access Admin routes but Admin cannot access SuperAdmin routes — this asymmetry should be documented

### 5.4 Cross-Tenant Data Access

| Concern | Status | Notes |
|---------|--------|-------|
| Admin accessing recruiter data | ✅ Safe | Admin endpoints are platform-wide, not tenant-scoped |
| SuperAdmin accessing candidate data | ✅ Safe | `/superadmin/candidates` returns all candidates |
| SuperAdmin deleting companies | ✅ Safe | `DELETE /superadmin/companies/:id` is platform-wide |
| Admin deactivating users | ✅ Safe | `POST /admin/users/:id/deactivate` is platform-wide |
| Cross-role data leakage | ⚠️ Risk | Admin can see all users/companies/jobs — no tenant isolation for admin endpoints |

**Recommendation:** Admin endpoints should have audit logging for all destructive actions (deactivate, delete, verify/unverify). The audit logs API exists but the UI is not implemented.

---

## 6. Design Coverage Matrix

### Admin Design Files

| Design File | Lines | Key Features | Current Coverage |
|-------------|-------|--------------|-----------------|
| `admin_dashboard_overview_1/code.html` | 367 | 8-tile stat grid, system health, activity feed | 35% — only stat grid |
| `admin_dashboard_overview_2/code.html` | 412 | Platform health, metrics, bar charts, uptime dots | 30% — basic charts |
| `admin_dashboard_overview_mobile_view/code.html` | 256 | Mobile admin dashboard | 25% — responsive grid exists |

### SuperAdmin Design Files

| Design File | Lines | Key Features | Current Coverage |
|-------------|-------|--------------|-----------------|
| `super_admin_company_management/code.html` | 432 | Company table with filters, search, actions | 45% — table + search |
| `super_admin_company_management_mobile_view/code.html` | — | Mobile company management | 30% — basic table |
| `super_admin_user_management_1/code.html` | 440 | User table with search/filters | 35% — table + search |
| `super_admin_user_management_2/code.html` | 512 | Stats tiles, sticky search, role toggles | 20% — basic table only |
| `super_admin_user_management_mobile_view_1/code.html` | — | Mobile user management | 15% |
| `super_admin_user_management_mobile_view_2/code.html` | — | Mobile user management variant | 15% |
| `super_admin_user_management_mobile_view_3/code.html` | — | Mobile user management variant | 15% |
| `super_admin_audit_logs/code.html` | 364 | Date range, actor search, action filter, table | 0% — **PLACEHOLDER** |
| `super_admin_audit_logs_mobile_view/code.html` | — | Mobile audit logs | 0% |

### Design Fidelity Summary

| Category | Admin | SuperAdmin |
|----------|-------|------------|
| Dashboard | 35% | 30% |
| User Management | 50% | 35% |
| Company Management | 50% | 45% |
| Job Management | 55% | 40% |
| Audit Logs | N/A | 5% (placeholder) |
| Security | N/A | 30% |
| Platform | N/A | 25% |
| Analytics | 45% | N/A |
| **Average** | **46%** | **30%** |

---

## 7. Backend Integration Matrix

### Admin API Integration

| Endpoint | Hook | Loading | Error | Pagination | Status |
|----------|------|---------|-------|------------|--------|
| `GET /admin/stats` | `useAdminStats` | Skeleton | ErrorState | N/A | ✅ Complete |
| `GET /admin/users` | `useAdminUsers` | Skeleton | ErrorState | Cursor | ✅ Complete |
| `POST /admin/users/:id/deactivate` | `useDeactivateUser` | — | — | — | ✅ Complete |
| `GET /admin/companies` | `useAdminCompanies` | Skeleton | ErrorState | Cursor | ✅ Complete |
| `POST /admin/companies/:id/verify` | `useVerifyCompany` | — | — | — | ✅ Complete |
| `GET /admin/jobs` | `useAdminJobs` | Skeleton | ErrorState | Cursor | ✅ Complete |
| `POST /admin/jobs/:id/force-close` | `useForceCloseJob` | — | — | — | ✅ Complete |
| `DELETE /admin/jobs/:id` | `useAdminDeleteJob` | — | — | — | ✅ Complete |
| `GET /admin/audit-logs` | `fetchAuditLogs` (unused) | — | — | — | ⚠️ API exists, UI missing |

### SuperAdmin API Integration

| Endpoint | Hook | Loading | Error | Pagination | Status |
|----------|------|---------|-------|------------|--------|
| `POST /superadmin/login` | Direct call | — | — | — | ✅ Complete |
| `GET /superadmin/stats` | `useSuperAdminStats` | Skeleton | ErrorState | N/A | ✅ Complete |
| `GET /superadmin/candidates` | `useSuperAdminCandidates` | Skeleton | ErrorState | Cursor | ✅ Complete |
| `POST /superadmin/candidates/:id/ban` | `useBanCandidate` | — | — | — | ✅ Complete |
| `GET /superadmin/companies` | `useSuperAdminCompanies` | Skeleton | ErrorState | Cursor | ✅ Complete |
| `POST /superadmin/companies/:id/verify` | `useSuperAdminVerifyCompany` | — | — | — | ✅ Complete |
| `DELETE /superadmin/companies/:id` | `useSuperAdminDeleteCompany` | — | — | — | ✅ Complete |
| `GET /superadmin/jobs` | `useSuperAdminJobs` | Skeleton | ErrorState | Cursor | ✅ Complete |
| `POST /superadmin/jobs/:id/force-close` | `useSuperAdminForceCloseJob` | — | — | — | ✅ Complete |
| `GET /superadmin/security-events` | `useSuperAdminSecurityEvents` | Skeleton | ErrorState | Cursor | ✅ Complete |
| `GET /superadmin/ownerless-companies` | `useSuperAdminOwnerlessCompanies` | Skeleton | ErrorState | Cursor | ✅ Complete |
| `POST /superadmin/ownerless-companies/:id/assign-owner` | `useSuperAdminAssignOwner` | — | — | — | ✅ Complete |
| `POST /superadmin/ownerless-companies/:id/recover-ownership` | `useSuperAdminRecoverOwnership` | — | — | — | ✅ Complete |

### Pagination Implementation

Both Admin and SuperAdmin use cursor-based pagination with a manual `cursorStack` pattern:

```typescript
// Common pattern across all pages
const [cursor, setCursor] = useState<string | undefined>(undefined);
const [cursorStack, setCursorStack] = useState<string[]>([]);

const goNext = () => {
  if (data?.nextCursor) {
    setCursorStack((prev) => [...prev, cursor ?? ""]);
    setCursor(data.nextCursor);
  }
};

const goPrev = () => {
  const prev = [...cursorStack];
  const prevCursor = prev.pop();
  setCursorStack(prev);
  setCursor(prevCursor || undefined);
};
```

**Issue:** This pattern is duplicated across 8+ pages. Should be extracted into a shared `useCursorPagination` hook.

---

## 8. Component Inventory

### Admin Components (6 components)

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| `StatsCard` | `admin/components/dashboard/StatsCard.tsx` | 23 | Single stat tile |
| `StatsGrid` | `admin/components/dashboard/StatsGrid.tsx` | 43 | 5-tile stat grid |
| `UserTable` | `admin/components/users/UserTable.tsx` | 236 | DataTable with search/filter |
| `UserDetailDrawer` | `admin/components/users/UserDetailDrawer.tsx` | 95 | Side sheet with user info |
| `CompanyTable` | `admin/components/companies/CompanyTable.tsx` | 249 | DataTable with search/filter |
| `AdminJobTable` | `admin/components/jobs/AdminJobTable.tsx` | 262 | DataTable with search/filter |
| `AnalyticsSection` | `admin/components/analytics/AnalyticsSection.tsx` | 219 | Charts + metrics |

### SuperAdmin Components (0 shared components)

All UI is inline in page components. No shared component directory.

### Shared Infrastructure Used

| Component | Used By | Purpose |
|-----------|---------|---------|
| `DataTable` | Admin UserTable, CompanyTable, AdminJobTable | TanStack Table wrapper |
| `SearchInput` | All list pages | Search field |
| `ConfirmDialog` | All action pages | Confirmation modal |
| `EmptyState` | All list pages | Empty state display |
| `ErrorState` | All data pages | Error state with retry |
| `Skeleton` | All data pages | Loading skeleton |
| `Sheet`/`SheetContent` | SuperAdminLayout, UserDetailDrawer | Side panel |
| `HugeiconsIcon` | All layouts/nav | Icon rendering |

---

## 9. UX Findings & Gaps

### 9.1 Critical UX Issues

1. **SuperAdmin Audit Logs is a placeholder** — Users navigating to Audit Logs see a message saying "audit logs are available in the Admin panel" with an EmptyState. This is confusing because:
   - The Admin panel has no Audit Logs page
   - The audit logs API exists in Admin (`fetchAuditLogs`) but is never used
   - The SuperAdmin sidebar prominently lists "Audit Logs" as a nav item

2. **Admin UserDetailDrawer shows raw companyId** — When viewing user details, the company field shows the raw UUID instead of the company name. The `UserDetailDrawer` component receives `AdminUser` which has `companyId: string | null` but no company name.

3. **SuperAdmin user management is candidate-only** — The page title says "USER MANAGEMENT" but the API only returns candidates. There's no way to manage recruiter or admin accounts from SuperAdmin.

4. **No delete action in Admin CompanyTable** — Design shows Delete action for companies, but the current `CompanyTable` only has Verify/Unverify. The SuperAdmin version has both Verify and Delete.

5. **Inconsistent pagination UI** — Admin uses `DataTable` with built-in cursor pagination. SuperAdmin uses manual Previous/Next buttons. The UX is inconsistent across roles.

### 9.2 Moderate UX Issues

6. **No company name in Admin UserDetailDrawer** — Shows `companyId` as raw UUID instead of resolving to company name.

7. **No job detail link in SuperAdmin Jobs** — Jobs table shows title but no link to view job details.

8. **No date range filter in Security Events** — API supports `eventType` and `severity` filters but UI has no filter controls.

9. **No role filter in SuperAdmin Users** — Design shows role toggle tabs (Candidates/Recruiters/Admins) but current implementation only shows candidates.

10. **Missing "Notifications" route for Admin** — Sidebar nav config includes Notifications link but no `/admin/notifications` route exists.

### 9.3 Minor UX Issues

11. **No password visibility toggle in SuperAdmin Login** — Password field has no show/hide toggle.

12. **No forgot password link in SuperAdmin Login** — Standard UX pattern missing.

13. **Stats labels use `// PREFIX` format** — Consistent with Industrial Broadsheet style but may confuse non-technical users.

14. **No confirmation for bulk actions** — No bulk action support at all.

15. **No export functionality** — No CSV/JSON export for any data tables.

---

## 10. Feature Completeness Matrix

| Feature | Admin | SuperAdmin | Design Target | Gap |
|---------|-------|------------|---------------|-----|
| Dashboard stats | ✅ 5 tiles | ✅ 7 tiles | 8 tiles + health | Missing health metrics |
| System health | ❌ | ❌ | Uptime, response time | Not implemented |
| Activity feed | ❌ | ❌ | Recent actions timeline | Not implemented |
| User list | ✅ DataTable | ✅ Manual table | DataTable with filters | SuperAdmin needs DataTable |
| User detail | ✅ Drawer | ❌ | Full detail view | SuperAdmin missing |
| User search | ✅ | ✅ | Search + role filter | SuperAdmin missing role filter |
| User deactivation | ✅ | ❌ (ban only) | Deactivate + ban | Admin/SuperAdmin split |
| Company list | ✅ DataTable | ✅ Manual table | DataTable with filters | SuperAdmin needs DataTable |
| Company detail | ❌ | ❌ | Detail view with members | Not implemented |
| Company verify | ✅ | ✅ | Verify/unverify toggle | ✅ Complete |
| Company delete | ❌ | ✅ | Delete with confirmation | Admin missing |
| Job list | ✅ DataTable | ✅ Manual table | DataTable with filters | SuperAdmin needs DataTable |
| Job detail | ❌ | ❌ | Full job detail view | Not implemented |
| Job force-close | ✅ | ✅ | Force-close action | ✅ Complete |
| Job delete | ✅ | ❌ | Delete action | SuperAdmin missing |
| Audit logs | ❌ | ❌ (placeholder) | Full audit log viewer | Not implemented |
| Security events | ❌ | ✅ Basic | Filterable event viewer | Missing filters |
| Platform settings | ❌ | ❌ (partial) | Settings + ownerless | Missing settings |
| Analytics | ✅ Charts | ❌ | Charts + date range | Missing date range |
| Notifications | ❌ (route missing) | ❌ | Notification management | Not implemented |
| Export | ❌ | ❌ | CSV/JSON export | Not implemented |
| Bulk actions | ❌ | ❌ | Select + bulk operations | Not implemented |

---

## 11. E2E Operational Journeys

### 11.1 Admin: Review and Deactivate User

```
1. Navigate to /admin/users
2. See DataTable with all users
3. Use search to find user by name/email
4. Use role filter to narrow by CANDIDATE/RECRUITER/ADMIN
5. Click user name → opens UserDetailDrawer
6. Review user details (name, email, role, status, company, joined date)
7. Close drawer
8. Click "Deactivate" button in row
9. ConfirmDialog appears with warning
10. Confirm → user deactivated, table refreshes
```

**Gap:** Step 6 shows `companyId` as raw UUID. Step 7 has no way to reactivate.

### 11.2 Admin: Verify Company

```
1. Navigate to /admin/companies
2. See DataTable with all companies
3. Use search to find company by name
4. Use verified filter to narrow results
5. Click "Verify" or "Unverify" button
6. ConfirmDialog appears
7. Confirm → company status toggled, table refreshes
```

**Gap:** No company detail view. No delete action (SuperAdmin has it).

### 11.3 SuperAdmin: Force-Close Job

```
1. Navigate to /superadmin/jobs
2. See table with all jobs
3. Find job (no search available)
4. Click "Force Close" button (only for OPEN/DRAFT jobs)
5. ConfirmDialog appears with warning
6. Confirm → job status changes to CLOSED, table refreshes
```

**Gap:** No search, no status filter, no job detail link.

### 11.4 SuperAdmin: Recover Ownership

```
1. Navigate to /superadmin/platform
2. See "OWNERLESS COMPANIES" section
3. See table of companies without owners
4. Click "Recover" button
5. ConfirmDialog appears
6. Confirm → ownership recovery initiated
```

**Gap:** No platform settings, no maintenance mode, no feature flags.

---

## 12. Engineering Blueprint Per Page

### Admin Pages

#### AdminDashboardPage
**Current:** 46 lines, 5-tile StatsGrid
**Target:** 8-tile grid + system health + activity feed
**Effort:** Medium
**Changes:**
- Extend `PlatformStats` type with health metrics (uptime, response time, active sessions)
- Add `SystemHealthPanel` component
- Add `ActivityFeed` component (recent admin actions from audit logs)
- Update `StatsGrid` to render 8 tiles

#### AdminUsersPage
**Current:** 362 lines total (page + UserTable + UserDetailDrawer)
**Target:** DataTable with role/status tabs, detail drawer with company name
**Effort:** Medium
**Changes:**
- Add role filter tabs (All/Candidates/Recruiters/Admins)
- Add status filter tabs (All/Active/Inactive)
- Fix UserDetailDrawer to resolve company name from ID
- Add "Last Active" timestamp column
- Add ban reason modal (currently only deactivation)

#### AdminCompaniesPage
**Current:** 263 lines total
**Target:** DataTable with industry/plan filters, delete action
**Effort:** Low-Medium
**Changes:**
- Add industry filter dropdown
- Add plan filter dropdown
- Add delete action with ConfirmDialog
- Add company detail drawer (similar to UserDetailDrawer)

#### AdminJobsPage
**Current:** 276 lines total
**Target:** DataTable with job detail link
**Effort:** Low
**Changes:**
- Add job title link to `/admin/jobs/$jobId` (or external link)
- Improve "Apps" column header to "Applications"

#### AdminAnalyticsPage
**Current:** 269 lines total
**Target:** Charts with date range filter and trend indicators
**Effort:** Medium
- Add date range picker (This Week/This Month/This Quarter/All Time)
- Add trend indicators (up/down arrows) to metrics
- Add export button for chart data

### SuperAdmin Pages

#### SuperAdminDashboardPage
**Current:** 81 lines, 7-tile grid
**Target:** 8-tile grid + system health + activity feed
**Effort:** Medium
**Changes:**
- Add system health metrics (uptime, response time, active sessions)
- Add activity feed (recent admin actions)
- Add platform version display

#### SuperAdminUsersPage
**Current:** 194 lines
**Target:** Role-toggleable user management with stats
**Effort:** High
**Changes:**
- Add role filter tabs (Candidates/Recruiters/Admins)
- Add stats summary tiles (total, active, suspended)
- Add user detail view (currently only ban action)
- Add avatar display in table
- Switch from manual table to DataTable component

#### SuperAdminCompaniesPage
**Current:** 230 lines
**Target:** DataTable with industry/plan filters
**Effort:** Medium
**Changes:**
- Switch from manual table to DataTable component
- Add industry filter
- Add plan filter
- Add company detail drawer

#### SuperAdminJobsPage
**Current:** 178 lines
**Target:** DataTable with search and filters
**Effort:** Medium
**Changes:**
- Switch from manual table to DataTable component
- Add search input
- Add status filter
- Add company filter
- Add job detail link

#### SuperAdminAuditLogsPage
**Current:** 21 lines (PLACEHOLDER)
**Target:** Full audit log viewer with filters
**Effort:** High
**Changes:**
- Implement data fetching from `/superadmin/audit-logs` (or `/admin/audit-logs`)
- Add date range picker
- Add actor search
- Add action type filter
- Add DataTable with columns: Timestamp, Actor, Action, Target, Details
- Add pagination

#### SuperAdminSecurityPage
**Current:** 134 lines
**Target:** Filterable security event viewer
**Effort:** Medium
**Changes:**
- Add event type filter dropdown
- Add severity filter dropdown
- Add date range picker
- Add event detail expand/view
- Switch to DataTable component

#### SuperAdminPlatformPage
**Current:** 172 lines
**Target:** Platform settings + ownerless companies
**Effort:** High
**Changes:**
- Add platform settings section (maintenance mode, feature flags)
- Add system info display (version, uptime, environment)
- Keep ownerless companies section
- Add notification template management

#### SuperAdminLoginPage
**Current:** 89 lines
**Target:** Enhanced login with password toggle
**Effort:** Low
**Changes:**
- Add password visibility toggle
- Add forgot password link (if applicable)

---

## 13. Deferred Items & Blockers

### Backend Blockers

| Feature | Required Endpoint | Status | Workaround |
|---------|------------------|--------|------------|
| SuperAdmin audit logs | `GET /superadmin/audit-logs` | ❌ Not available | Use Admin endpoint `GET /admin/audit-logs` |
| SuperAdmin user management (all roles) | `GET /superadmin/users` (not just candidates) | ❌ Not available | Admin panel has full user management |
| Platform settings | `GET/PUT /superadmin/settings` | ❌ Not available | Hardcoded values |
| Notification templates | `GET/PUT /superadmin/notification-templates` | ❌ Not available | Not implemented |
| Maintenance mode toggle | `POST /superadmin/maintenance` | ❌ Not available | Not implemented |

### Frontend Deferred

| Feature | Priority | Effort | Depends On |
|---------|----------|--------|------------|
| SuperAdmin Audit Logs implementation | HIGH | High | Backend endpoint or reuse Admin endpoint |
| System health metrics | MEDIUM | Medium | Backend health endpoint |
| Activity feed | MEDIUM | Medium | Audit logs data |
| User detail view (SuperAdmin) | MEDIUM | Medium | Backend user detail endpoint for SuperAdmin |
| Company detail view | LOW | Medium | Backend company detail endpoint for Admin |
| Date range picker component | MEDIUM | Low | None (pure UI) |
| Bulk actions | LOW | High | Backend bulk action endpoints |
| Export functionality | LOW | Medium | Backend export endpoints |
| Platform settings | LOW | High | Backend settings endpoints |

---

## 14. Priority Remediation Roadmap

### P0 — Critical (Immediate)

1. **Implement SuperAdmin Audit Logs** — The page is a placeholder. Either:
   - Reuse `GET /admin/audit-logs` with SuperAdmin auth, OR
   - Request new `GET /superadmin/audit-logs` endpoint from backend
   - Implement full table with date range, actor search, action filter

2. **Fix Admin UserDetailDrawer company display** — Show company name instead of raw UUID. Either:
   - Add company name to `AdminUser` type from backend, OR
   - Fetch company detail separately when drawer opens

### P1 — High (Next Sprint)

3. **SuperAdmin user management scope** — Currently candidate-only. Options:
   - Add role filter tabs and call different endpoints per role, OR
   - Document limitation and direct admins to Admin panel for full user management

4. **Consolidate pagination patterns** — Extract `useCursorPagination` hook to replace duplicated cursorStack logic across 8+ pages.

5. **Add missing Admin delete action** — CompanyTable needs delete button matching SuperAdmin's implementation.

### P2 — Medium (Following Sprints)

6. **Switch SuperAdmin tables to DataTable** — All SuperAdmin list pages use manual HTML tables. Switch to `DataTable` component for consistency.

7. **Add filter controls to SuperAdmin Security Events** — API supports eventType and severity filters.

8. **Admin Analytics date range** — Add date range picker to AnalyticsSection.

9. **System health metrics** — Add uptime, response time, active sessions to both Admin and SuperAdmin dashboards.

### P3 — Low (Backlog)

10. **Platform settings page** — Maintenance mode, feature flags, system info.
11. **Export functionality** — CSV/JSON export for all data tables.
12. **Bulk actions** — Select multiple items and perform batch operations.
13. **Company/User detail views** — Full detail pages for both Admin and SuperAdmin.

---

## Appendix A: File Inventory

### Admin Feature Files

| File | Lines | Purpose |
|------|-------|---------|
| `features/admin/api/index.ts` | 5 | API exports |
| `features/admin/api/audit-logs.ts` | — | Audit logs API (unused) |
| `features/admin/api/companies.ts` | — | Companies API |
| `features/admin/api/dashboard.ts` | — | Dashboard stats API |
| `features/admin/api/jobs.ts` | — | Jobs API |
| `features/admin/api/users.ts` | — | Users API |
| `features/admin/components/analytics/AnalyticsSection.tsx` | 219 | Charts + metrics |
| `features/admin/components/companies/CompanyTable.tsx` | 249 | Company DataTable |
| `features/admin/components/dashboard/StatsCard.tsx` | 23 | Stat tile |
| `features/admin/components/dashboard/StatsGrid.tsx` | 43 | Stat grid |
| `features/admin/components/jobs/AdminJobTable.tsx` | 262 | Job DataTable |
| `features/admin/components/users/UserDetailDrawer.tsx` | 95 | User detail side sheet |
| `features/admin/components/users/UserTable.tsx` | 236 | User DataTable |
| `features/admin/hooks/index.ts` | 8 | Hook exports |
| `features/admin/pages/AdminAnalyticsPage.tsx` | 50 | Analytics page |
| `features/admin/pages/AdminCompaniesPage.tsx` | 14 | Companies page |
| `features/admin/pages/AdminDashboardPage.tsx` | 46 | Dashboard page |
| `features/admin/pages/AdminJobsPage.tsx` | 14 | Jobs page |
| `features/admin/pages/AdminUsersPage.tsx` | 31 | Users page |
| `features/admin/types/index.ts` | 5 | Type exports |
| `features/admin/types/audit-logs.ts` | 28 | Audit log types |
| `features/admin/types/companies.ts` | 27 | Company types |
| `features/admin/types/dashboard.ts` | 15 | Dashboard types |
| `features/admin/types/jobs.ts` | — | Job types |
| `features/admin/types/users.ts` | 39 | User types |

### SuperAdmin Feature Files

| File | Lines | Purpose |
|------|-------|---------|
| `features/superadmin/api/auth.ts` | — | Auth API |
| `features/superadmin/api/companies.ts` | — | Companies API |
| `features/superadmin/api/dashboard.ts` | — | Dashboard API |
| `features/superadmin/api/index.ts` | 26 | API exports |
| `features/superadmin/api/jobs.ts` | — | Jobs API |
| `features/superadmin/api/ownerless.ts` | — | Ownerless companies API |
| `features/superadmin/api/security.ts` | 49 | Security events API |
| `features/superadmin/api/users.ts` | — | Users API |
| `features/superadmin/hooks/index.ts` | 17 | Hook exports |
| `features/superadmin/hooks/useSuperAdminCompanies.ts` | — | Companies hooks |
| `features/superadmin/hooks/useSuperAdminDashboard.ts` | — | Dashboard hook |
| `features/superadmin/hooks/useSuperAdminJobs.ts` | — | Jobs hook |
| `features/superadmin/hooks/useSuperAdminOwnerlessCompanies.ts` | — | Ownerless companies hooks |
| `features/superadmin/hooks/useSuperAdminSecurityEvents.ts` | — | Security events hook |
| `features/superadmin/hooks/useSuperAdminUsers.ts` | — | Users hook |
| `features/superadmin/layout/SuperAdminLayout.tsx` | 188 | Standalone layout |
| `features/superadmin/pages/SuperAdminAuditLogsPage.tsx` | 21 | **PLACEHOLDER** |
| `features/superadmin/pages/SuperAdminCompaniesPage.tsx` | 230 | Companies page |
| `features/superadmin/pages/SuperAdminDashboardPage.tsx` | 81 | Dashboard page |
| `features/superadmin/pages/SuperAdminJobsPage.tsx` | 178 | Jobs page |
| `features/superadmin/pages/SuperAdminLoginPage.tsx` | 89 | Login page |
| `features/superadmin/pages/SuperAdminPlatformPage.tsx` | 172 | Platform page |
| `features/superadmin/pages/SuperAdminSecurityPage.tsx` | 134 | Security page |
| `features/superadmin/pages/SuperAdminUsersPage.tsx` | 194 | Users page |
| `features/superadmin/types/dashboard.ts` | 12 | Dashboard types |
| `features/superadmin/types/index.ts` | 3 | Type exports |
| `features/superadmin/types/jobs.ts` | 28 | Job types |
| `features/superadmin/types/users.ts` | 56 | User + Company types |

### Route Files

| File | Lines | Guard |
|------|-------|-------|
| `routes/_authenticated/admin/dashboard.tsx` | 16 | `requireRole(["ADMIN", "SUPERADMIN"])` |
| `routes/_authenticated/admin/users.tsx` | 16 | `requireRole(["ADMIN", "SUPERADMIN"])` |
| `routes/_authenticated/admin/jobs.tsx` | 16 | `requireRole(["ADMIN", "SUPERADMIN"])` |
| `routes/_authenticated/admin/companies.tsx` | 16 | `requireRole(["ADMIN", "SUPERADMIN"])` |
| `routes/_authenticated/admin/analytics.tsx` | 16 | `requireRole(["ADMIN", "SUPERADMIN"])` |
| `routes/_superadmin/superadmin/dashboard.tsx` | — | `requireSuperAdmin()` |
| `routes/_superadmin/superadmin/users.tsx` | — | `requireSuperAdmin()` |
| `routes/_superadmin/superadmin/jobs.tsx` | — | `requireSuperAdmin()` |
| `routes/_superadmin/superadmin/companies.tsx` | — | `requireSuperAdmin()` |
| `routes/_superadmin/superadmin/audit-logs.tsx` | — | `requireSuperAdmin()` |
| `routes/_superadmin/superadmin/security.tsx` | — | `requireSuperAdmin()` |
| `routes/_superadmin/superadmin/platform.tsx` | — | `requireSuperAdmin()` |

---

*Report generated by Phase 10A audit. All findings are read-only observations. No code was modified during this audit.*
