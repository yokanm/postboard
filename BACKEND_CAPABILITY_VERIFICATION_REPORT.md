# BACKEND CAPABILITY VERIFICATION REPORT

**Phase:** 10B.5
**Date:** 2026-06-28
**Scope:** Verify every "backend blocked" claim from Phase 10B through comprehensive backend investigation; integrate existing but unused backend functionality into the frontend.

---

## Executive Summary

All five "backend blocked" claims from Phase 10B were investigated through full execution-flow tracing (routes → controllers → services → Prisma). **Two claims were confirmed as genuinely missing backend features. Two claims were intentional by design. One claim requires architectural clarification.**

Additionally, **four integration bugs** were discovered and fixed: one HTTP method mismatch (HIGH), two query param name mismatches (MEDIUM), and one dead-code removal (LOW). No backend code was modified — all fixes are frontend-only.

---

## Verification Matrix

Each Phase 10B claim is verified below with exact file paths and execution traces.

### Claim 1: SuperAdmin Audit Logs — "Backend blocked"

**Verdict: PARTIALLY CORRECT — clarification needed.**

| Layer | Admin (`/admin/audit-logs`) | SuperAdmin (`/superadmin/*`) |
|-------|---------------------------|------------------------------|
| Route | `admin.route.ts:398` — `GET /audit-logs` | **NO audit-logs route** |
| Controller | `admin.ts:85-95` — `listAuditLogs` | Missing |
| Service | `admin.service.ts:292-314` — `listAuditLogsService` | Missing |
| Prisma model | `schema.prisma:272-293` — `AdminAuditLog` | Same model (would reuse) |
| Auth middleware | `authMiddleware` + `authorize(['ADMIN'])` | `superAdminAuth` (separate JWT) |

**Evidence:**

- `jobboard\src\routes\v1\admin.route.ts:34-35`: Middleware chain is `authMiddleware` + `authorize(['ADMIN'])` — checks the **User** model with role `ADMIN`
- `jobboard\src\routes\v1\admin.route.ts:398`: `router.get('/audit-logs', listAuditLogs)`
- `jobboard\src\routes\v1\superadmin.route.ts`: Complete route listing — NO audit logs endpoint
- `jobboard\src\middleware\superAdminAuth.ts`: Uses `JWT_SUPERADMIN_SECRET`, sets `req.superAdminId`, looks up in **SuperAdmin** model — completely separate auth domain
- `jobboard\src\middleware\authorization.ts`: `authorize(['ADMIN'])` checks `User.role` — SuperAdmin records don't exist in User model

**Key insight:** The admin audit logs endpoint EXISTS and works correctly for ADMIN-role users (used by admin dashboard). SuperAdmins cannot access it because:
1. Their JWT is signed with `JWT_SUPERADMIN_SECRET` — fails `authMiddleware` (uses `JWT_ACCESS_SECRET`)
2. Even if auth passed, `authorize(['ADMIN'])` checks `User.role` — SuperAdmin exists in a separate model

**Frontend state:**
- `features/admin/api/audit-logs.ts`: ✅ Correctly calls `GET /admin/audit-logs` — works for ADMINS
- `features/admin/pages/AdminDashboardPage.tsx`: ✅ Uses audit logs for activity feed
- `features/superadmin/pages/SuperAdminAuditLogsPage.tsx`: ❌ Stub — empty state with message
- SuperAdmin `api/index.ts`: ❌ No audit-logs API function

**Requires backend change to fix:** Add `GET /superadmin/audit-logs` route in `superadmin.route.ts` or modify `adminsAuth` middleware (currently unused on audit-logs route) to handle both token types.

---

### Claim 2: Platform Settings — "Backend blocked"

**Verdict: CONFIRMED — genuinely missing at every layer.**

| Layer | Exists? |
|-------|---------|
| Prisma model | ❌ No `Setting`, `Config`, `PlatformSetting`, or similar model |
| Route | ❌ No settings route in any file |
| Controller | ❌ No settings controller |
| Service | ❌ No settings service |
| Validator | ❌ No settings validator |

**Evidence:**

- `jobboard\prisma\schema.prisma`: All 14 models listed — no settings/config model exists
- `jobboard\src\routes\v1\index.ts`: All route mounts listed — no `/settings`, `/config`, `/platform`
- `jobboard\src\config\index.ts`: ✅ Exists — but only reads env vars (infrastructure config), not runtime settings
- Frontend `SuperAdminPlatformPage.tsx`: Misleading name — only handles ownerless company recovery, not settings

**Suggested architecture for future implementation:**
- Prisma: `PlatformSetting { key String @unique, value Json, description String?, updatedAt DateTime }`
- Routes: `GET /superadmin/settings`, `PATCH /superadmin/settings/:key`
- Frontend: Rewrite `SuperAdminPlatformPage.tsx` to include actual settings management

---

### Claim 3: Reports & Abuse — "Backend blocked"

**Verdict: CONFIRMED — genuinely missing at every layer.**

| Layer | Reports/Abuse | Moderation Workflow |
|-------|--------------|---------------------|
| Prisma model | ❌ No `Report`, `Flag`, `AbuseReport` model | ❌ No `JobModeration`, `ContentReview` model |
| Route | ❌ No report routes | ❌ No moderation routes |
| Controller | ❌ No report controller | ❌ No moderation controller |
| Service | ❌ No report service | ❌ No moderation service |

**Evidence:**

- `jobboard\prisma\schema.prisma`: 14 models listed — zero related to reports, flags, or moderation
- `rg -i "report\|flag\|abuse\|moderat\|review" --include "*.ts" jobboard\src\`: 22 matches — ALL false positives (e.g., `isVerified` flag, `REVIEWED` application status, section comment headers)
- `admin.service.ts` has a comment `// ─── Job moderation ───` at line 205, but the section only contains `adminListJobsService`, `adminForceCloseJobService`, `adminDeleteJobService` — no approval queue
- `job.service.ts`: Status machine is `DRAFT → OPEN → CLOSED → []` — no `PENDING_REVIEW`, `FLAGGED`, or moderation step

**Tangentially related features that DO exist:**
- `forceCloseJob`: Sets job to CLOSED (for policy violations)
- `adminDeactivateUserService`: Soft-deletes a user
- `banCandidate`: Soft-deletes a candidate
- `adminVerifyCompany`: Toggles `isVerified` flag
- `AuditLog` and `SecurityEvent`: Recording/observing activity, not a moderation queue

---

### Claim 4: Admin Company Delete — "Backend blocked"

**Verdict: CORRECT — but INTENTIONAL by design.**

| Endpoint | Admin | SuperAdmin |
|----------|-------|-----------|
| DELETE company | ❌ Does not exist | ✅ `DELETE /superadmin/companies/:id` |
| List companies | ✅ `GET /admin/companies` | ✅ `GET /superadmin/companies` |
| Verify company | ✅ `PATCH /admin/companies/:id/verify` | ✅ `PATCH /superadmin/companies/:id/verify` |

**Evidence:**

- `admin.route.ts`: Only company endpoint is `PATCH /admin/companies/:companyId/verify` (line 397)
- `superadmin.route.ts`: Has full company CRUD including `DELETE /superadmin/companies/:id` (line 296)
- `admin.service.ts`: No `adminDeleteCompanyService` — only `adminVerifyCompanyService`
- `superadmin.ts` controller lines 147-168: Direct Prisma call for cascade delete (company + jobs + users)
- `AGENTS.md`: "ADMIN is NOT a platform administrator. SUPERADMIN is the only platform administrator."

**Design rationale:** Company deletion cascades to all jobs, users, and refresh tokens — the most destructive operation in the system. Correctly reserved for SuperAdmin (separate auth domain, separate model, separate JWT secret).

**Frontend state:**
- Admin companies page: ✅ Has verify button only — no delete
- SuperAdmin companies page: ✅ Has verify + delete buttons with ConfirmDialog

---

### Claim 5: Moderation Workflow — "Backend blocked"

**Verdict: Subsumed by Reports & Abuse (Claim 3) — genuinely missing.**

No separate moderation workflow (approval queue, content review, flagging) exists. The closest features are:
- `forceCloseJob` (punitive closure, not approval)
- `adminDeleteJob` (soft-delete, not moderation)
- `adminDeactivateUser` (soft-delete user)

A moderation system would require new Prisma models, routes, controllers, and services (see Reports & Abuse section above).

---

## Integration Findings & Fixes Applied

### HIGH Impact — Fixed

#### Fix 1: Company "Mark All Notifications Read" — HTTP Method Mismatch

| Before | After |
|--------|-------|
| `http.post(...)` to `PATCH /notifications/company/read` | `http.patch(...)` to `PATCH /notifications/company/read` |

**Backend:** `notification.route.ts:113` — `router.patch('/company/read', ...)`
**Frontend:** `features/company/api/index.ts:143` — was `http.post`, now `http.patch`

**Root cause:** The backend route uses PATCH but the frontend was sending POST — would always 405.

#### Fix 2: Candidate Dashboard Stats — Removed Dead Code

**Frontend:** `features/candidate/api/index.ts:4-8` — called `${BASE_URL}/user/current/dashboard/stats`
**Backend:** No such route exists in any route file
**Status:** Code was dead — the dashboard page (`CandidateDashboardPage.tsx`) derives stats from `useMyApplications()`, `useProfile()`, `useSavedJobsStore()`, etc. Removed the API function, hook, and unused type.

---

### MEDIUM Impact — Fixed

#### Fix 3: Admin Audit Logs — Query Param Name Mismatch

| Layer | Param Name |
|-------|-----------|
| Frontend sent | `adminId` |
| Backend expects | `actorId` |
| Backend controller | `admin.ts:86` — extracts `req.query.actorId` |
| Backend service | `admin.service.ts:296` — filters by `actorId` |

**Files changed:**
- `features/admin/api/audit-logs.ts:11`: `adminId` → `actorId`
- `features/admin/types/audit-logs.ts:27`: `adminId` → `actorId`

**Before:** Filtering by admin silently ignored (param name didn't match backend)
**After:** Filtering by admin works correctly

#### Fix 4: Company Audit Logs — Query Param Name Mismatch

| Layer | Date Param Names |
|-------|-----------------|
| Frontend sent | `from`, `to` |
| Backend expects | `startDate`, `endDate` |
| Backend controller | `audit.ts:21` — extracts `startDate`, `endDate` |
| Backend service | `audit.service.ts:8-9` — accepts `startDate`, `endDate` |

**File changed:** `features/company/api/index.ts` lines 104-105, 111-112
**Also removed:** `search` param (backend doesn't support it — was silently ignored)

---

### LOW Impact — Documented, Not Fixed

#### Finding: Admin Verify Company — Only Sets Verified=True

`adminVerifyCompanyService` (`admin.service.ts:184-201`) always sets `isVerified: true` and throws 409 if already verified. Cannot unverify via admin endpoint. The frontend shows "Unverify" button but the backend will reject it. SuperAdmin has a working toggle.

**No fix applied** — would require either backend change or frontend UX adjustment (hide/handle the toggle for ADMIN role).

#### Finding: SuperAdmin Jobs — Search Param Sent But Backend Ignores

Frontend sends `search` param to `/superadmin/jobs` but the SuperAdmin controller (`superadmin.ts:171`) only reads `cursor`, `limit`, `status`, `companyId`. The Admin controller DOES support `search`.

**No fix applied** — backend limitation, not a frontend bug.

#### Finding: Security Events — Missing `startDate`, `endDate`, `companyId` Filters

The SuperAdmin controller (`securityEvents.ts`) reads `eventType`, `severity`, `startDate`, `endDate`, `companyId` but the frontend only passes `eventType` and `severity`.

**No fix applied** — frontend wasn't using these filters; they need UI controls first.

---

## Security Verification

Every finding was reviewed for security implications:

| Issue | Security Risk | Verdict |
|-------|--------------|---------|
| Admin company delete missing | ✅ **Positive** — prevents unauthorized escalation | Intentional by design |
| SuperAdmin audit logs missing | ⚠️ SuperAdmins can't view audit logs | Missing feature, not a vulnerability |
| Admin audit logs accessible via User JWT | ✅ Properly scoped — requires `role === 'ADMIN'` | Correct |
| Company audit logs scoped by companyId | ✅ Tenant isolation enforced | Correct |
| No privilege escalation found | ✅ All endpoints verify role + ownership | Correct |

**No security vulnerabilities were discovered.** The auth domains (User vs SuperAdmin) are correctly separated at the JWT secret and middleware levels.

---

## Engineering Actions Summary

| # | Action | Impact | Status | Files Changed |
|--|--------|--------|--------|---------------|
| 1 | Fix Company markAllNotificationsRead: POST→PATCH | HIGH | ✓ Fixed | `features/company/api/index.ts:143` |
| 2 | Remove dead candidate dashboard stats API+type | HIGH | ✓ Fixed | `features/candidate/api/index.ts`, `hooks/index.ts`, `types/index.ts` |
| 3 | Fix admin audit logs param: `adminId`→`actorId` | MEDIUM | ✓ Fixed | `features/admin/api/audit-logs.ts`, `types/audit-logs.ts` |
| 4 | Fix company audit logs params: `from/to`→`startDate/endDate` | MEDIUM | ✓ Fixed | `features/company/api/index.ts` |
| 5 | Document Platform Settings as missing backend feature | N/A | ✓ Documented | This report |
| 6 | Document Reports & Abuse as missing backend feature | N/A | ✓ Documented | This report |
| 7 | Document Admin Company Delete as intentional design | N/A | ✓ Documented | This report |
| 8 | Document SuperAdmin Audit Logs as requiring backend change | N/A | ✓ Documented | This report |

## Files Modified (Total: 6)

1. `src/features/company/api/index.ts` — HTTP method fix + query param fix
2. `src/features/admin/api/audit-logs.ts` — query param rename
3. `src/features/admin/types/audit-logs.ts` — type rename
4. `src/features/candidate/api/index.ts` — dead code removal
5. `src/features/candidate/hooks/index.ts` — dead code removal
6. `src/features/candidate/types/index.ts` — dead type removal
