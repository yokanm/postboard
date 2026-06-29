# Postboard Authentication Architecture Report

> **Phase:** Phase 2 — Authentication & Session Architecture Investigation
> **Date:** 2026-06-27
> **Status:** Investigation Complete — No source code modified
> **Scope:** Backend auth, Frontend auth, State management, UI compliance, Route guards, Permission matrix

---

## 1. Authentication Lifecycle Diagram

### 1.1 Login Flow (Full Trace)

```
Frontend                              Backend
─────────────────────────────────────────────────────────────────────
LoginPage.tsx
  └─ RHF form (Zod validation)
       └─ useLogin().mutate(credentials)
            └─ loginUser()                  ──POST──►  /auth/login
                                                          └─ authLimiter (10/15min/IP)
                                                          └─ loginUserRules validation
                                                          └─ loginUserController
                                                               └─ loginUserService
                                                                    ├─ findUnique user by email
                                                                    ├─ verifyPassword (argon2)
                                                                    ├─ generateAccessToken (JWT, 15m)
                                                                    ├─ generateRefreshToken (JWT, 7d)
                                                                    ├─ hashToken(refreshToken) → SHA-256
                                                                    ├─ store hash in refresh_token table
                                                                    └─ return { user, accessToken, refreshToken }
                                                          └─ res.cookie('refreshToken', ..., { httpOnly, secure, sameSite:strict })
                                                          └─ sendSuccess({ data: { user, accessToken } })
                                                                    │
            ◄──JSON── { data: { user, accessToken } }
            │
            ├─ setAccessToken(accessToken)   → Zustand: token + isAuthenticated=true + isInitialized=true
            ├─ fetchCurrentUser()            ──GET──►  /user/current
            │     (MANUAL — before query)               └─ authMiddleware (verify JWT)
            │                                           └─ authorize(['ADMIN','RECRUITER','CANDIDATE'])
            │                                           └─ getCurrentUser controller
            │◄──JSON── { data: { user } }
            │
            ├─ setUser(user)                 → Zustand: user + role + isAuthenticated=true
            ├─ invalidateQueries(auth.all)   → useCurrentUser() refetches (DUPLICATE #2)
            ├─ toast.success("Signed in")
            └─ navigate(to: dashboard)
```

### 1.2 Session Restore Flow

```
Page Load
  └─ TanStack Router initializes
       └─ beforeLoad fires for all matched routes
       └─ requireAuth() reads Zustand: isAuthenticated=false → redirect to /login
  └─ React renders AppProvider
       └─ Router renders matched route (login page)
       └─ AuthInitializer mounts
            └─ useEffect fires
                 ├─ restoreSession()
                 │    ├─ POST /auth/refresh-token (httpOnly cookie sent automatically)
                 │    ├─ on success: { accessToken }
                 │    │    └─ setAccessToken(accessToken)
                 │    │    └─ GET /user/current (with Bearer token)
                 │    │    └─ setUser(userData)
                 │    └─ on failure: clearAuth()
                 │    └─ finally: setInitialized()
                 │
                 └─ restoreSuperAdminSession()
                      ├─ POST /superadmin/refresh (SA httpOnly cookie)
                      ├─ on success: { accessToken, admin }
                      │    └─ saSetAccessToken(accessToken)
                      │    └─ saSetAdmin(admin) — conditional
                      └─ on failure: saClearAuth()
                      └─ finally: saSetInitialized()
       └─ ready = isInitialized && saIsInitialized
            └─ false → loading screen "// RESTORING_SESSION"
            └─ true → render children
```

### 1.3 Token Refresh Flow (401 Queue)

```
apiFetch request → 401 response
  └─ isRefreshing? 
       ├─ NO:
       │    ├─ isRefreshing = true
       │    ├─ POST /auth/refresh-token (or /superadmin/refresh)
       │    │    ├─ Success: new access token → update store → processQueue(null, token)
       │    │    └─ Failure: clearAuth → processQueue(error, null) → redirect to login
       │    └─ Retry original request with new token
       │
       └─ YES (concurrent):
            └─ Push to refreshQueue as Promise
            └─ Wait for in-progress refresh to resolve
            └─ Retry original with queued token
```

### 1.4 Logout Flow

```
UserMenu → handleLogout()
  └─ useLogout().mutate()
       ├─ POST /auth/logout (Bearer token)
       │    └─ Backend: revokes refresh token hash, clears cookie
       ├─ onSuccess: toast "Signed out"
       └─ onSettled:
            ├─ clearAuth() → Zustand reset
            ├─ queryClient.clear() → all TanStack Query caches wiped
            └─ navigate({ to: "/login" })
```

### 1.5 Guard Execution Flow

```
Route Resolution (TanStack Router)
  │
  ├─ _public/* routes (public pages)
  │    └─ redirectIfAuthenticated()
  │         └─ reads useAuthStore.getState().isAuthenticated + role
  │         └─ if authenticated → redirect to dashboard
  │
  ├─ /login, /register, /forgot-password
  │    └─ redirectIfAuthenticated()
  │
  ├─ _authenticated layout
  │    └─ requireAuth()
  │         └─ reads useAuthStore.getState().isAuthenticated
  │         └─ false → redirect /login
  │    └─ then role-specific guard (e.g., requireRole(["CANDIDATE"]))
  │
  └─ _superadmin layout
       └─ requireSuperAdmin()
            └─ reads useSuperAdminAuthStore.getState().isAuthenticated
            └─ false → redirect /superadmin/login
```

---

## 2. Backend Architecture

### 2.1 Auth Routes (`jobboard/src/routes/v1/auth.route.ts`)

| Route | Method | Auth | Rate Limit | Validation |
|-------|--------|------|------------|------------|
| `/auth/register` | POST | None | 10/15min | registerUserRules |
| `/auth/login` | POST | None | 10/15min | loginUserRules |
| `/auth/register/company` | POST | None | 10/15min | registerCompanyRules |
| `/auth/login/company` | POST | None | 10/15min | loginCompanyRules |
| `/auth/refresh-token` | POST | Cookie | None | None |
| `/auth/logout` | POST | Bearer | None | None |
| `/auth/send-verification-email` | POST | None | 10/15min | emailRules |
| `/auth/verify-email` | GET | None | None | Query: token |
| `/auth/forgot-password` | POST | None | 10/15min | emailRules |
| `/auth/reset-password` | POST | None | 10/15min | resetPasswordRules |
| `/auth/change-password` | POST | Bearer | 10/15min | changePasswordRules |
| `/auth/company/send-verification-email` | POST | None | 10/15min | emailRules |
| `/auth/company/verify-email` | GET | None | None | Query: token |
| `/auth/company/forgot-password` | POST | None | 10/15min | emailRules |
| `/auth/company/reset-password` | POST | None | 10/15min | resetPasswordRules |

### 2.2 SuperAdmin Routes (`jobboard/src/routes/v1/superadmin.route.ts`)

| Route | Method | Auth | Rate Limit |
|-------|--------|------|------------|
| `/superadmin/login` | POST | None | authLimiter (10/15min) |
| `/superadmin/refresh` | POST | Cookie | authLimiter |
| `/superadmin/logout` | POST | Bearer SA | superAdminAuth |
| `/superadmin/stats` | GET | Bearer SA | superAdminAuth |
| `/superadmin/companies` | GET | Bearer SA | superAdminAuth |
| `/superadmin/companies/:id/verify` | PATCH | Bearer SA | superAdminAuth |
| `/superadmin/companies/:id` | DELETE | Bearer SA | superAdminAuth |
| `/superadmin/jobs` | GET | Bearer SA | superAdminAuth |
| `/superadmin/jobs/:id/force-close` | DELETE | Bearer SA | superAdminAuth |
| `/superadmin/candidates` | GET | Bearer SA | superAdminAuth |
| `/superadmin/candidates/:id/ban` | DELETE | Bearer SA | superAdminAuth |
| `/superadmin/security-events` | GET | Bearer SA | superAdminAuth |
| `/superadmin/ownerless-companies` | GET | Bearer SA | superAdminAuth |
| `/superadmin/companies/:id/assign-owner` | POST | Bearer SA | superAdminAuth |
| `/superadmin/companies/:id/recover-ownership` | POST | Bearer SA | superAdminAuth |

### 2.3 User Routes (`jobboard/src/routes/v1/user.route.ts`)

| Route | Method | Auth Middleware | Authorization |
|-------|--------|----------------|---------------|
| `/user/current` | GET | authMiddleware | authorize([ADMIN, RECRUITER, CANDIDATE]) |
| `/user/current` | PATCH | authMiddleware | authorize([ADMIN, RECRUITER, CANDIDATE]) |
| `/user/current` | DELETE | authMiddleware | authorize([ADMIN, RECRUITER, CANDIDATE]) |
| `/user/current/profile` | GET | authMiddleware | authorize([ADMIN, RECRUITER, CANDIDATE]) |
| `/user/current/profile` | PUT | authMiddleware | authorize([ADMIN, RECRUITER, CANDIDATE]) |
| `/user/current/profile/resume` | POST | authMiddleware | authorize([ADMIN, RECRUITER, CANDIDATE]) |
| `/user/current/profile/resume` | DELETE | authMiddleware | authorize([ADMIN, RECRUITER, CANDIDATE]) |

### 2.4 Middleware Chain

#### authMiddleware (`src/middleware/authentication.ts`)
```
Location: jobboard/src/middleware/authentication.ts
Purpose: Verify JWT access token, extract userId/companyId
Flow:
  1. Check Authorization: Bearer header exists
  2. Split token from header
  3. verifyAccessToken(token) using JWT_ACCESS_SECRET
  4. If payload.type === 'company': req.companyId = payload.sub
  5. If payload.type === 'user': req.userId = payload.sub
  6. On TokenExpiredError: return 401 "Access token expired"
  7. On other JWT errors: return 401 "Invalid access token"
```

#### authorize(roles) (`src/middleware/authorization.ts`)
```
Location: jobboard/src/middleware/authorization.ts
Purpose: DB role check, email verification check, companyId injection
Flow:
  1. Verify req.userId exists
  2. prisma.user.findUnique({ id: req.userId })
     Select: id, role, companyId, isVerified, deletedAt
  3. Reject if: !user || user.deletedAt → 401
  4. Reject if: !user.isVerified → 403 "Email verification required"
  5. Reject if: role not in allowedRoles → 403 "No permission"
  6. Set req.companyId = user.companyId
  7. next()
Key insight: Role is ALWAYS re-checked from DB, never trusted from JWT claim.
```

#### authorizeCompany(roles) (`src/middleware/authorization.ts`)
```
Location: jobboard/src/middleware/authorization.ts
Purpose: Company-scoped authorization with tenant isolation
Additional checks:
  1. user.companyId must exist
  2. If req.params.companyId matches user.companyId (or is absent)
  3. Same role + verification checks as authorize()
```

#### requireVerifiedUser (`src/middleware/authorization.ts`)
```
Location: jobboard/src/middleware/authorization.ts
Purpose: Lighter check — just ensures user is not deleted and email is verified
Used by: Routes that need any authenticated user (e.g., change-password)
```

#### superAdminAuth (`src/middleware/superAdminAuth.ts`)
```
Location: jobboard/src/middleware/superAdminAuth.ts
Purpose: Verify SuperAdmin JWT (separate secret), DB lookup for existence
Flow:
  1. Check Authorization: Bearer header
  2. verifySuperAdminToken(token) using JWT_SUPERADMIN_SECRET
  3. Verify payload.type === 'superadmin'
  4. prisma.superAdmin.findUnique({ id: payload.sub })
  5. Reject if not found
  6. Set req.superAdminId = admin.id
  7. next()
```

### 2.5 JWT Strategy (`src/lib/jwt.ts`)

| Token | Secret | Lifetime | Purpose |
|-------|--------|----------|---------|
| User/Company Access | JWT_ACCESS_SECRET | 15m (`ACCESS_EXPIRES`) | API authorization header |
| User/Company Refresh | JWT_REFRESH_SECRET | 7d (`REFRESH_EXPIRES`) | Silent token refresh |
| SuperAdmin Access | JWT_SUPERADMIN_SECRET | 4h (hardcoded) | SA API authorization |
| SuperAdmin Refresh | JWT_SUPERADMIN_SECRET | 7d (hardcoded) | SA session refresh |

**Payload shape:**
```typescript
{ sub: string; type: 'user' | 'company' | 'superadmin' }
```

**Token generation:**
- `generateAccessToken(id, type)` — signs with JWT_ACCESS_SECRET
- `generateRefreshToken(id, type)` — signs with JWT_REFRESH_SECRET
- `generateSuperAdminAccessToken(id)` — signs with JWT_SUPERADMIN_SECRET
- `generateSuperAdminRefreshToken(id)` — signs with JWT_SUPERADMIN_SECRET

**Token verification:**
- `verifyAccessToken(token)` — verifies with JWT_ACCESS_SECRET
- `verifyRefreshToken(token)` — verifies with JWT_REFRESH_SECRET
- `verifySuperAdminToken(token)` — verifies with JWT_SUPERADMIN_SECRET

### 2.6 Cookie Configuration

**User/Company refresh cookie:**
```typescript
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
});
```

**SuperAdmin refresh cookie:**
```typescript
res.cookie('superAdminRefreshToken', refreshToken, {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
});
```

**Key difference:** User and SuperAdmin use DIFFERENT cookie names (`refreshToken` vs `superAdminRefreshToken`) — this is what allows a user to be logged into both sessions simultaneously.

### 2.7 Refresh Token Service (`src/services/v1/auth/refreshToken.service.ts`)

**Token rotation (atomic):**
1. Verify refresh token JWT
2. Find stored hash in `refresh_token` table
3. **Token reuse detection:** If stored token is already revoked, write CRITICAL security event
4. Verify user/company exists and is not soft-deleted
5. **Within $transaction:**
   a. Revoke old refresh token (`isRevoked: true`)
   b. Generate new access + refresh token pair
   c. Store new refresh token hash
6. Return new access + refresh tokens

### 2.8 Prisma Auth Models

```
User:
  id, userName, firstName, lastName, email, password (argon2id), phone,
  role (CANDIDATE|RECRUITER|ADMIN), companyId, isVerified,
  emailVerifyToken, emailVerifyExpiresAt,
  passwordResetToken, passwordResetExpiresAt,
  deletedAt (soft delete)

Company:
  id, name, slug, email, password (argon2id),
  isVerified, emailVerifyToken, emailVerifyExpiresAt,
  passwordResetToken, passwordResetExpiresAt, deletedAt

RefreshToken:
  id, token (SHA-256 hash), userId?, companyId?,
  isRevoked, expiresAt — polymorphic (belongs to User OR Company)

SuperAdmin (separate model):
  id, email, password, firstName, lastName

SuperAdminRefreshToken (separate model):
  id, token (SHA-256 hash), superAdminId, isRevoked, expiresAt
```

---

## 3. Frontend Architecture

### 3.1 Auth Feature (`src/features/auth/`)

**File structure:**
```
features/auth/
├── api/index.ts           — API functions (loginUser, fetchCurrentUser, refreshAccessToken, etc.)
├── components/            — UI components (LoginPage, RegisterPage, ForgotPasswordPage, etc.)
├── hooks/index.ts         — TanStack Query hooks (useLogin, useRegister, useCurrentUser, etc.)
├── layout/AuthLayout.tsx  — Two-panel layout (brand + form)
├── schemas/index.ts       — Zod validation schemas
├── types/index.ts         — TypeScript types
└── utils/                 — (empty)
```

### 3.2 Auth Hooks (`src/features/auth/hooks/index.ts`)

| Hook | Type | Purpose |
|------|------|---------|
| `useCurrentUser()` | `useQuery` | Fetch current user, enabled when accessToken exists. staleTime: 5min |
| `useLogin()` | `useMutation` | Login, store token, fetch user, invalidate query, navigate |
| `useRegister()` | `useMutation` | Register, toast, navigate to /login |
| `useLogout()` | `useMutation` | POST /auth/logout, clearAuth, clear cache, navigate |
| `useForgotPassword()` | `useMutation` | Request password reset |
| `useResetPassword()` | `useMutation` | Reset password with token |
| `useVerifyEmail()` | `useMutation` | Verify email with token |
| `useResendVerificationEmail()` | `useMutation` | Resend verification email |
| `useChangePassword()` | `useMutation` | Change password (authenticated) |

### 3.3 API Client Dual Layer

**Two client layers coexist:**

1. **`src/shared/api/client.ts`** — `apiFetch<T>()`
   - Modern single entry point
   - Auto-injects Authorization from Zustand stores
   - 30s AbortController timeout
   - 401 auto-refresh with queue pattern
   - Auto-unwraps `{ data: T }` backend envelope
   - `mapPaginated<T>()` helper for pagination

2. **`src/lib/api/request.ts`** — `http` object (legacy)
   - Backward-compatible wrapper used by all feature API files
   - Delegates to apiFetch internally via `src/lib/api/client.ts` re-exports
   - Still used by: `features/auth/api/index.ts`, `features/superadmin/api/auth.ts`
   - Adding `authenticated: boolean` parameter that is now dead code (apiFetch handles auth auto-injection)

**Auth hook flow uses the LEGACY `http` object:**
```typescript
// features/auth/api/index.ts
export async function loginUser(credentials): Promise<LoginResponse> {
  return http.post<LoginResponse>(endpoints.auth.login, credentials);
}
```

**AuthInitializer uses the MODERN `apiFetch`:**
```typescript
// providers/AuthInitializer.tsx
const data = await apiFetch<RefreshTokenResponse>("/auth/refresh-token", {
  method: "POST",
});
```

### 3.4 Route Files (Auth Pages)

| Route File | Page Component | Guard in beforeLoad |
|------------|---------------|---------------------|
| `src/routes/login.tsx` | `LoginPage` | `redirectIfAuthenticated` |
| `src/routes/register.tsx` | `RegisterPage` | `redirectIfAuthenticated` |
| `src/routes/forgot-password.tsx` | `ForgotPasswordPage` | `redirectIfAuthenticated` |
| `src/routes/reset-password.tsx` | `ResetPasswordPage` | None |
| `src/routes/verify-email.tsx` | `VerifyEmailPage` | None |
| `src/routes/superadmin/login.tsx` | `SuperAdminLoginPage` | `superAdminTokenStorage.hasSession()` |

### 3.5 Layout Hierarchy

```
Public Pages
  ├─ PublicHeader + Page Content + PublicFooter
  └─ No common layout (each page individually wraps components)

Auth Pages
  └─ AuthLayout
       ├─ AuthBrandPanel (left: brand + press grid)
       └─ AuthFormPanel (right: form content)

Authenticated Pages (AppShell)
  ├─ Topbar (ThemeToggle, NotificationsBell, UserMenu)
  ├─ Sidebar (role-based navigation)
  ├─ Main Content (Outlet)
  └─ MobileNav (bottom-docked on mobile)

SuperAdmin Pages
  └─ SuperAdminLayout
       ├─ Sidebar (SA-specific nav)
       ├─ Topbar (Platform Governance)
       └─ Main Content
```

---

## 4. State Management

### 4.1 Zustand Stores (Client State)

**auth-store.ts:**
```typescript
interface AuthState {
  accessToken: string | null;        // In-memory ONLY
  user: CurrentUser | null;          // ← SERVER STATE (violates rule)
  role: UserRole | null;             // ← SERVER STATE (violates rule)
  isAuthenticated: boolean;          // Derived from accessToken presence
  isInitialized: boolean;            // AuthInitializer has completed
  isRestoringSession: boolean;       // Session restore in progress
}
```

**superadmin-auth-store.ts:**
```typescript
interface SuperAdminAuthState {
  accessToken: string | null;        // In-memory ONLY
  admin: SuperAdminUser | null;      // Server state
  isAuthenticated: boolean;
  isInitialized: boolean;
  isRestoringSession: boolean;       // Declared but NO setter action exists!
}
```

### 4.2 TanStack Query (Server State)

```typescript
// queryKeys.auth factory
auth: {
  all: ["auth"] as const,
  user: () => ["auth", "user"] as const,
}

// useCurrentUser
useQuery({
  queryKey: queryKeys.auth.user(),
  queryFn: fetchCurrentUser,   // GET /user/current
  enabled: !!accessToken,      // Only runs when token exists
  staleTime: 5 * 60 * 1000,    // 5 minutes
  gcTime: 10 * 60 * 1000,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
})
```

### 4.3 Dual State Redundancy

**Problem:** User data exists in TWO places simultaneously:

1. **Zustand** — `auth-store.user` and `auth-store.role` (set by `setUser()`)
2. **TanStack Query** — `useCurrentUser()` cache (key: `["auth", "user"]`)

**Flow demonstrating the redundancy:**

```
Login:
  1. POST /auth/login → accessToken
  2. setAccessToken(token) → Zustand
  3. fetchCurrentUser() → GET /user/current (MANUAL, not via query)
  4. setUser(user) → Zustand (user + role stored)
  5. invalidateQueries(["auth"]) → useCurrentUser refetches
  6. fetchCurrentUser() → GET /user/current (DUPLICATE via query)
  7. setUser(user) → Zustand (again, inside useCurrentUser queryFn)

Result: 2 identical network requests, 2 writes to Zustand
```

### 4.4 Store Hydration Chain

```
App boots → AppProvider mounts
  ├─ ThemeProvider (reads persisted theme)
  ├─ QueryProvider (TanStack Query client)
  └─ AuthInitializer
       ├─ useEffect fires
       │    ├─ restoreSession()
       │    │    ├─ POST /auth/refresh-token
       │    │    ├─ setAccessToken(token)
       │    │    ├─ GET /user/current
       │    │    └─ setUser(user)
       │    └─ restoreSuperAdminSession()
       │         ├─ POST /superadmin/refresh
       │         ├─ saSetAccessToken(token)
       │         ├─ saSetAdmin(admin)  — conditional
       │         └─ saSetInitialized()
       │
       └─ ready = isInitialized && saIsInitialized
            └─ false → RESTORING_SESSION loading screen
            └─ true → render children (router)
```

---

## 5. API Endpoints

### 5.1 Frontend Endpoint Configuration (`src/lib/api/endpoints.ts`)

All endpoints use `${BASE_URL}` which reads from `env.apiUrl` (VITE_API_URL):

```typescript
const BASE_URL = env.apiUrl;  // Now correctly reads VITE_API_URL

auth: {
  login: `${BASE_URL}/auth/login`,
  register: `${BASE_URL}/auth/register`,
  refresh: `${BASE_URL}/auth/refresh-token`,
  logout: `${BASE_URL}/auth/logout`,
  verifyEmail: `${BASE_URL}/auth/verify-email`,
  sendVerificationEmail: `${BASE_URL}/auth/send-verification-email`,
  forgotPassword: `${BASE_URL}/auth/forgot-password`,
  resetPassword: `${BASE_URL}/auth/reset-password`,
  changePassword: `${BASE_URL}/auth/change-password`,
}

superadmin: {
  login: `${BASE_URL}/superadmin/login`,
  refresh: `${BASE_URL}/superadmin/refresh`,
  logout: `${BASE_URL}/superadmin/logout`,
  // ... all SA endpoints defined
}
```

### 5.2 SuperAdmin API Bypasses Endpoint Factory (`src/features/superadmin/api/auth.ts`)

**Problem:** SuperAdmin API file hardcodes URL strings instead of using `endpoints.superadmin.*`:

```typescript
const BASE_URL = env.apiUrl;

export async function superAdminLogin(email, password) {
  return http.post<LoginResponse>(
    `${BASE_URL}/superadmin/login`,  // Should be: endpoints.superadmin.login
    { email, password },
    false
  )
}
```

This pattern repeats for `superAdminRefresh` and `superAdminLogout`.

---

## 6. Route Guards

### 6.1 Guard Definitions

| Guard | File | Check | Redirect |
|-------|------|-------|----------|
| `requireAuth()` | `src/guards/auth-guards.ts` | `isAuthenticated && accessToken` | `/login` |
| `requireRole(roles[])` | `src/guards/auth-guards.ts` | Calls `requireAuth()` + checks `role` | Role dashboard or `/login` if null |
| `requireSuperAdmin()` | `src/guards/superadmin-guard.ts` | `isAuthenticated && accessToken` (SA store) | `/superadmin/login` |
| `redirectIfAuthenticated()` | `src/guards/auth-guards.ts` | `isAuthenticated && role` | Role dashboard |
| `getDefaultDashboardByRole(role)` | `src/guards/auth-guards.ts` | Switch on role | Corresponding dashboard |

### 6.2 Guard Application per Route

| Route Group | Route Pattern | Guard(s) |
|-------------|---------------|----------|
| Public | `/`, `/jobs`, `/companies/*` | `redirectIfAuthenticated` (landing only) |
| Auth | `/login`, `/register`, `/forgot-password` | `redirectIfAuthenticated` |
| Auth | `/reset-password`, `/verify-email` | None |
| Authenticated (any role) | `/notifications` | `requireAuth` + none (no role filter) |
| Candidate | `/candidate/*` | `requireAuth` + `requireRole(["CANDIDATE"])` |
| Recruiter | `/recruiter/*` | `requireAuth` + `requireRole(["RECRUITER"])` |
| Company | `/company/*` | `requireAuth` + `requireRole(["RECRUITER","ADMIN"])` |
| Admin | `/admin/*` | `requireAuth` + `requireRole(["ADMIN","SUPERADMIN"])` |
| SuperAdmin | `/superadmin/*` | `requireSuperAdmin` |
| SA Login | `/superadmin/login` | `superAdminTokenStorage.hasSession()` |

### 6.3 CRITICAL: Guard Timing Bug

**Root Cause:** `beforeLoad` in TanStack Router fires synchronously during route resolution, BEFORE `AuthInitializer`'s `useEffect` runs.

```
Synchronous (route resolution):
  beforeLoad fires → requireAuth() → store.isAuthenticated === false → redirect /login

Asynchronous (React render):
  AuthInitializer mounts → useEffect fires → session restored → store updated

Result: Login page renders briefly, AuthInitializer runs, LoginPage detects auth → redirects to dashboard
```

**Mitigation (fragile):** LoginPage and RegisterPage both have `useEffect` that checks `isAuthenticated` and navigates to dashboard — this is the workaround for the timing bug.

---

## 7. Permission Matrix

### 7.1 Role-Based Access

| Page/Route | CANDIDATE | RECRUITER | ADMIN | SUPERADMIN |
|------------|-----------|-----------|-------|------------|
| `/candidate/dashboard` | ✅ | ❌ | ❌ | ❌ |
| `/candidate/applications` | ✅ | ❌ | ❌ | ❌ |
| `/candidate/profile` | ✅ | ❌ | ❌ | ❌ |
| `/recruiter/dashboard` | ❌ | ✅ | ❌ | ❌ |
| `/recruiter/jobs/*` | ❌ | ✅ | ❌ | ❌ |
| `/recruiter/profile` | ❌ | ✅ | ❌ | ❌ |
| `/company/*` | ❌ | ✅ | ✅ | ❌ |
| `/admin/dashboard` | ❌ | ❌ | ✅ | ✅ |
| `/admin/users` | ❌ | ❌ | ✅ | ✅ |
| `/superadmin/dashboard` | ❌ | ❌ | ❌ | ✅ |
| `/superadmin/companies` | ❌ | ❌ | ❌ | ✅ |
| `/notifications` | ✅ | ✅ | ✅ | ✅ |

### 7.2 Frontend Enforcement

**Frontend enforces roles via:**
1. `requireRole()` guard in `beforeLoad` — redirects on mismatch
2. `requireSuperAdmin()` guard — redirects SA users
3. Sidebar renders role-specific nav config — limits visible links

**Frontend gaps:**
- `redirectIfAuthenticated` does NOT check SuperAdmin auth store — a SA logged into both sessions will see `/login` instead of being redirected to `/superadmin/dashboard`
- Settings link in UserMenu is hardcoded to `/candidate/profile` regardless of role
- SuperAdmin users can still see the `/login` page even when authenticated as SA

### 7.3 Backend Enforcement

**Backend enforces roles via middleware chain:**
1. `authMiddleware` — verifies JWT (user, company, or SA)
2. `authorize(roles)` — re-checks role from DB (never trusts JWT claims)
3. `authorizeCompany(roles)` — same + tenant isolation
4. `superAdminAuth` — separate JWT secret, DB existence check

**Backend gaps:**
- SuperAdmin login controller does NOT rate limit the refresh token endpoint (note: route does apply `authLimiter`)
- No CSRF protection on cookie-based refresh endpoints (mitigated by SameSite=strict)

---

## 8. Design Comparison

### 8.1 Auth Pages Overview

| Auth Page | Design File | Implementation | Status |
|-----------|-------------|----------------|--------|
| Login | `Design/login_page/` | `LoginPage.tsx` | ✅ Matches layout, form, branding panel |
| Register | `Design/register_page/` | `RegisterPage.tsx` | ✅ Matches layout with role selection |
| Forgot Password | `Design/forgot_password_page_restored/` | `ForgotPasswordPage.tsx` | ✅ Matches layout |
| Reset Password | `Design/reset_password_page/` | `ResetPasswordPage.tsx` | ✅ Matches layout |
| Verify Email (sent) | `Design/verify_email_sent_desktop/` | `VerifyEmailPage.tsx` | ✅ Rewritten in Phase 2 to match |
| Verify Email (invalid/expired) | `Design/verification_link_invalid_desktop/` | `VerifyEmailPage.tsx` | ✅ Error states implemented |
| Email Verified (success) | `Design/email_verified_success_desktop/` | `VerifyEmailPage.tsx` | ✅ Success state implemented |
| Session Restore | `Design/restoring_session_desktop/` | `AuthInitializer.tsx` | ⚠️ Has progress bar + label, but no variant variations (design shows 3 variants) |
| Access Restricted | `Design/access_restricted_desktop/` | `AccessRestricted.tsx` | ✅ Rewritten in Phase 2 to match |
| Onboarding Role Selector | `Design/onboarding_role_selector/` | None | ❌ Not implemented |

### 8.2 Deviations Found

| Aspect | Design Spec | Implementation | Impact |
|--------|-------------|----------------|--------|
| Login page: Brand panel | Uses Material Symbols icons | Uses Hugeicons equivalents | Minor — icon family differs |
| Login page: Footer | Shows version + region info | Implemented correctly | ✅ |
| Session Restore | 3 variants: editorial split, terminal focus, simple | Only 1 simple variant in AuthInitializer | Missing variants |
| User Avatar | Design shows user photo/initials | Shows "PB" during loading | Functional gap |
| Settings navigation | Context-sensitive per role | Always `/candidate/profile` | Functional gap |
| Forgot Password mobile | Design exists at `forgot_password_mobile_view/` | Not specifically verified | Minor |
| Onboarding role selector | Design exists at `onboarding_role_selector/` + mobile | Not implemented at all | Missing feature |

---

## 9. Identified Issues

### 9.1 Issue Catalog

| # | Issue | Location | Severity | Category |
|---|-------|----------|----------|----------|
| A-1 | Guard `beforeLoad` fires before AuthInitializer restores session — causes login-page flash on every page refresh | `src/guards/auth-guards.ts`, `src/providers/AuthInitializer.tsx` | CRITICAL | Timing |
| A-2 | SuperAdmin auth store: `isRestoringSession` declared but no setter action exists; `setAccessToken` doesn't set `isInitialized` (inconsistent with regular store) | `src/stores/superadmin-auth-store.ts` | CRITICAL | Consistency |
| A-3 | Duplicate `/user/current` fetch on every login: manual call in `useLogin().onSuccess` + query invalidation causing refetch | `src/features/auth/hooks/index.ts:53-55` | HIGH | Performance |
| A-4 | Auth server state duplicated in Zustand: `user`, `role`, `admin` fields cached client-side when they should flow through TanStack Query only | `src/stores/auth-store.ts`, `superadmin-auth-store.ts` | HIGH | Architecture |
| A-5 | SuperAdmin login uses raw `useState` instead of react-hook-form + Zod — bypasses form validation framework | `src/features/superadmin/pages/SuperAdminLoginPage.tsx` | HIGH | Consistency |
| A-6 | SuperAdmin API `auth.ts` hardcodes URL strings — bypasses `endpoints.superadmin.*` factory | `src/features/superadmin/api/auth.ts` | HIGH | Infrastructure |
| A-7 | `redirectIfAuthenticated` ignores SuperAdmin auth store — only checks regular auth store | `src/guards/auth-guards.ts:43` | MEDIUM | Guard |
| A-8 | UserMenu Settings link hardcoded to `/candidate/profile` regardless of role | `src/components/layout/UserMenu.tsx:53` | MEDIUM | Navigation |
| A-9 | Recruiter sidebar "Applicants" link dead — links to `/recruiter/applicants` (no route exists) | `src/components/layout/Sidebar.tsx:34`, `MobileNav.tsx:29` | MEDIUM | Navigation |
| A-10 | SuperAdmin logout button doesn't navigate — `clearAuth()` resets store but no explicit redirect | `src/features/superadmin/layout/SuperAdminLayout.tsx:79` | LOW | UX |
| A-11 | AuthInitializer loading screen waits for BOTH sessions to restore (regular + SA) before rendering children | `src/providers/AuthInitializer.tsx:81` | LOW | Performance |
| A-12 | UserMenu avatar always shows "PB" during loading — no distinction between loading/empty/error states | `src/components/layout/UserMenu.tsx:28-30` | LOW | UX |
| A-13 | VerifyEmailPage auto-mutation fires on every render — `!verifyMutation.isIdle === false` condition is confusing and fragile | `src/features/auth/components/VerifyEmailPage.tsx:33` | LOW | Bug |
| A-14 | Landing page `/` has inline `redirectIfAuthenticated` in `beforeLoad` — duplicates the guard on login/register pages | `src/routes/_public/index.tsx:7-12` | LOW | Consistency |
| A-15 | LoginPage/RegisterPage `useEffect` redirect workaround is fragile — relies on component re-render after store update | `src/features/auth/components/LoginPage.tsx:34-38` | MEDIUM | Timing |
| A-16 | SA login page: `isAuthenticated` effect redirect creates race condition — same as regular auth flash issue | `src/features/superadmin/pages/SuperAdminLoginPage.tsx:17-21` | MEDIUM | Timing |
| A-17 | `apiFetch` 401 refresh: original request retried with potentially ABORTED controller signal after timeout hits | `src/shared/api/client.ts:127-132` | MEDIUM | Bug |
| A-18 | `superAdminTokenStorage.hasSession()` in `/superadmin/login` route `beforeLoad` — uses synchronous store read, same timing issue as regular auth | `src/routes/superadmin/login.tsx:7` | MEDIUM | Timing |

---

## 10. Root Cause Analysis

### 10.1 Root Cause Map

| Symptom | Root Cause | Resolution Approach |
|---------|-----------|---------------------|
| Login-page flash on refresh | beforeLoad sync vs AuthInitializer async timing mismatch | Defer route rendering until AuthInitializer completes (Option C) OR make guards async with initialization check (Option B) |
| Duplicate user fetch on login | Manual fetchCurrentUser() call + query invalidation both trigger fetch | Remove duplicate; use queryClient.setQueryData() instead OR remove manual call entirely |
| Server state in Zustand | Early architecture decision before TanStack Query migration | Remove `user` and `role` from auth-store; derive from useCurrentUser() query |
| SA session lost on refresh | setAccessToken doesn't set isInitialized; no setRestoringSession action | Add setRestoringSession action; fix setAccessToken to set isInitialized=true |
| Settings link wrong role | Hardcoded path without role awareness | Make Settings link role-aware (use getDefaultDashboardByRole pattern) |
| SuperAdmin API hardcoded URLs | SA auth.ts was written before endpoints.superadmin existed | Replace raw strings with endpoints.superadmin.* references |
| SA login form raw state | Component predates RHF+Zod migration | Convert to useForm + zodResolver matching other auth forms |

### 10.2 Architectural Dependencies

```
AuthInitializer (providers/AuthInitializer.tsx)
  ├── depends on: apiFetch, auth-store, superadmin-auth-store
  └── controls: isInitialized, saIsInitialized, ready gate

Route Guards (guards/auth-guards.ts, guards/superadmin-guard.ts)
  ├── depends on: auth-store (synchronous getState)
  └── READ ONLY — never mutate store

Auth Hooks (features/auth/hooks/index.ts)
  ├── depends on: auth-store (setAccessToken, setUser, clearAuth)
  ├── depends on: queryClient, router
  └── MUTATES store on every auth action

Auth Layout/Components (features/auth/components/*)
  ├── depends on: auth hooks, auth store (selectors), TanStack Router
  └── PRESENTATION only — no direct store mutations

UserMenu/Sidebar/Topbar (components/layout/*)
  ├── depends on: auth store (selectors), auth hooks (queries)
  └── PRESENTATION + navigation triggers
```

---

## 11. Recommended Implementation Order

### Phase A — Critical Auth Bugs (Highest Priority)

| Order | Issue | Effort | Risk | Impact |
|-------|-------|--------|------|--------|
| 1 | A-2: SA store consistency (setRestoringSession, setAccessToken isInitialized) | Small | Low | Fixes SA session restore |
| 2 | A-1: Guard timing / login flash | Medium | Medium | Fixes all protected routes |
| 3 | A-3: Duplicate user fetch on login | Small | Low | Eliminates extra network call |
| 4 | A-7: redirectIfAuthenticated SA check | Small | Low | Fixes SA login redirect |
| 5 | A-15: Remove useEffect redirect workaround | Small | Low | Cleanup after guard timing fix |

### Phase B — Architecture Cleanup

| Order | Issue | Effort | Risk | Impact |
|-------|-------|--------|------|--------|
| 6 | A-4: Remove server state from Zustand | Medium | Medium | Clean architecture — single source of truth |
| 7 | A-5: SA login RHF+Zod migration | Medium | Low | Form consistency |
| 8 | A-6: SA API use endpoints factory | Small | Low | Infrastructure consistency |
| 9 | A-8: UserMenu Settings role-based | Small | Low | Fixes broken navigation |

### Phase C — UX Polish

| Order | Issue | Effort | Risk | Impact |
|-------|-------|--------|------|--------|
| 10 | A-9: Fix recruiter sidebar link | Small | Low | Fixes dead nav link |
| 10 | A-10: SA logout explicit redirect | Small | Low | Better UX |
| 10 | A-12: UserMenu loading/empty states | Small | Low | Better UX |
| 11 | A-13: Fix VerifyEmailPage auto-mutation | Small | Low | Bug fix |
| 12 | A-17: Fix apiFetch aborted controller retry | Medium | Medium | Prevents potential errors |

---

## 12. Files Likely to Change During Implementation

### Must Change (12 files)

| File | Reason | Phase |
|------|--------|-------|
| `src/stores/superadmin-auth-store.ts` | Add `setRestoringSession`, fix `setAccessToken` `isInitialized` | A |
| `src/providers/AuthInitializer.tsx` | Fix guard timing — possibly move to initialization-gate pattern | A |
| `src/guards/auth-guards.ts` | Update `redirectIfAuthenticated` to check SA store | A |
| `src/features/auth/hooks/index.ts` | Remove duplicate `fetchCurrentUser()` from `useLogin()` | A |
| `src/features/auth/components/LoginPage.tsx` | Remove `useEffect` redirect workaround after guard timing fix | A |
| `src/features/auth/components/RegisterPage.tsx` | Remove `useEffect` redirect workaround after guard timing fix | A |
| `src/stores/auth-store.ts` | Remove `user` and `role` fields (migrate to Query-only) | B |
| `src/features/superadmin/pages/SuperAdminLoginPage.tsx` | Migrate to RHF + Zod | B |
| `src/features/superadmin/api/auth.ts` | Replace `${BASE_URL}/superadmin/login` with `endpoints.superadmin.login` | B |
| `src/components/layout/UserMenu.tsx` | Make Settings link role-aware | B |
| `src/components/layout/Sidebar.tsx` | Fix recruiter Applicants link | C |
| `src/components/layout/MobileNav.tsx` | Fix recruiter Applicants link | C |

### May Change (6 files)

| File | Reason | Phase |
|------|--------|-------|
| `src/features/auth/components/VerifyEmailPage.tsx` | Fix auto-mutation trigger | C |
| `src/routes/_public/index.tsx` | Remove inline redirectIfAuthenticated if consolidating guards | C |
| `src/routes/superadmin/login.tsx` | May update beforeLoad to use proper guard | A |
| `src/features/superadmin/layout/SuperAdminLayout.tsx` | Add explicit navigate after logout | B |
| `src/shared/api/client.ts` | Fix aborted controller retry in 401 refresh flow | C |
| `src/components/layout/Topbar.tsx` | May need updates if sidebar/UserMenu refactored | C |

---

## 13. Risks

### Implementation Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Guard timing fix breaks existing auth flow | Medium | High | Test all auth flows: login, refresh, page refresh, role navigation, logout |
| Removing server state from Zustand breaks components that read `user`/`role` from store | Medium | High | Audit all `useAuthStore((s) => s.role)` calls — update to use `useCurrentUser()` derived data |
| SA store changes break existing SA login | Low | High | Test SA login + session restore + route guard |
| aborted controller fix causes regression in 401 handling | Low | Medium | Review refresh queue logic carefully |

### Architectural Risks

| Risk | Description |
|------|-------------|
| **CSRF** | No CSRF tokens — mitigated by SameSite=strict on cookies, but older browsers may ignore this |
| **Token replay on refresh** | Current implementation has token reuse detection with CRITICAL security event logging — well handled |
| **No refresh token expiry on SA store** | SA store has `isInitialized` but `setAccessToken` doesn't set it — relies on finally() to set |
| **Race condition on session restore** | Regular + SA restore run in parallel, both must complete — if one hangs, app never renders |

---

## 14. Suggested Testing Strategy

### Unit Tests (Current: 26 tests across 6 files)

**Add tests for:**

| Test | What to Verify | Priority |
|------|---------------|----------|
| `useLogin` mutation | Token stored, user fetched, query invalidated, navigation triggered | HIGH |
| `useLogout` mutation | Auth cleared, cache wiped, navigation triggered | HIGH |
| `useCurrentUser` query | Enabled/disabled based on accessToken, staleTime respected | HIGH |
| `auth-store` setAccessToken | isAuthenticated, isInitialized set correctly | MEDIUM |
| `superadmin-auth-store` actions | setAccessToken, setAdmin, clearAuth, setRestoringSession | MEDIUM |
| `requireAuth` guard | Redirect on unauthenticated, pass on authenticated | MEDIUM |
| `requireRole` guard | Redirect on mismatch, pass on match, redirect on null role | MEDIUM |
| `redirectIfAuthenticated` | Redirect on authenticated, pass on unauthenticated | MEDIUM |
| `apiFetch` 401 refresh flow | Queue mechanism, retry, failure cleanup | MEDIUM |

### Integration Tests

| Test | What to Verify | Priority |
|------|---------------|----------|
| Full login flow (MSW mock) | Login → token → user fetch → dashboard redirect | HIGH |
| Full logout flow | Logout → clearAuth → redirect to /login | HIGH |
| Session restore on page refresh | AuthInitializer → refresh token → user fetch → UI | HIGH |
| Guard timing scenario | beforeLoad with/without initialized state | MEDIUM |
| SuperAdmin login + restore | SA auth store consistency | HIGH |

### Current Test Coverage Gaps

- No auth hook tests exist (useLogin, useLogout, useCurrentUser, useRegister)
- No guard tests exist (requireAuth, requireRole, redirectIfAuthenticated)
- No apiFetch unit tests (refresh queue, auto-unwrap, error parsing)
- No AuthInitializer tests (session restore flow)
- No auth store tests

---

## 15. Constraints

- **Do not modify backend source code** — backend is frozen per `jobboard/API_CONTRACT.md`
- **Do not add CSRF implementation** — backend is frozen, CSRF would require backend changes
- **Do not change cookie configuration** — determined by backend
- **Do not change JWT secrets or token lifetimes** — backend config issue
- **Do not modify authentication.ts or authorization.ts middleware** — backend frozen
- **SuperAdmin auth must remain fully separate** from regular auth — intentional design decision
- **Access tokens must stay in-memory only** — no localStorage/sessionStorage per security rules
- **TanStack Query is the source of truth for server state** — Zustand for client-only state
- **Form state must use react-hook-form + Zod** — raw useState is not acceptable for new implementations

---

## 16. Appendix: Auth Design File Index

| Design Directory | Pages | Has code.html | Has screen.png | Implementation Status |
|------------------|-------|---------------|----------------|----------------------|
| `Design/login_page/` | Login | ✅ | ✅ | ✅ Complete |
| `Design/register_page/` | Register | ✅ | ✅ | ✅ Complete |
| `Design/forgot_password_page/` | Forgot Password (old) | ❌ | ✅ | ⚠️ Superseded by restored variant |
| `Design/forgot_password_page_restored/` | Forgot Password | ✅ | ✅ | ✅ Complete |
| `Design/forgot_password_mobile_view/` | Forgot Password (mobile) | ✅ | ✅ | ✅ Responsive |
| `Design/reset_password_page/` | Reset Password | ✅ | ✅ | ✅ Complete |
| `Design/reset_password_mobile_view/` | Reset Password (mobile) | ✅ | ✅ | ✅ Responsive |
| `Design/verify_email_sent_desktop/` | Verify Email Sent | ✅ | ✅ | ✅ Complete |
| `Design/verify_email_sent_mobile_view/` | Verify Email Sent (mobile) | ✅ | ✅ | ✅ Responsive |
| `Design/email_verified_success_desktop/` | Email Verified | ✅ | ✅ | ✅ Complete |
| `Design/email_verified_success_mobile_view/` | Email Verified (mobile) | ✅ | ✅ | ✅ Responsive |
| `Design/verification_link_invalid_desktop/` | Verification Link Invalid | ✅ | ✅ | ✅ Complete |
| `Design/verification_link_invalid_mobile_view/` | Verification Link Invalid (mobile) | ✅ | ✅ | ✅ Responsive |
| `Design/restoring_session_desktop/` | Session Restore | ✅ | ✅ | ⚠️ 1 variant implemented (3 in design) |
| `Design/restoring_session_mobile_view/` | Session Restore (mobile) | ✅ | ✅ | ⚠️ |
| `Design/restoring_session_variant_1_editorial_split/` | Session Restore Variant 1 | ✅ | ✅ | ❌ Not implemented |
| `Design/restoring_session_variant_2_terminal_focus/` | Session Restore Variant 2 | ✅ | ✅ | ❌ Not implemented |
| `Design/onboarding_role_selector/` | Onboarding Role Selector | ✅ | ✅ | ❌ Not implemented |
| `Design/onboarding_role_selector_mobile_view/` | Onboarding Role Selector (mobile) | ✅ | ✅ | ❌ Not implemented |
| `Design/access_restricted_desktop/` | Access Restricted | ✅ | ✅ | ✅ Complete |
| `Design/access_restricted_mobile_view/` | Access Restricted (mobile) | ✅ | ✅ | ✅ Responsive |
| `Design/access_restricted_action_not_allowed/` | Action Not Allowed | ❌ | ✅ | ❌ Not implemented |
| `Design/action_not_allowed_desktop/` | Action Not Allowed | ✅ | ✅ | ❌ Not implemented |
| `Design/action_not_allowed_mobile_view/` | Action Not Allowed (mobile) | ✅ | ✅ | ❌ Not implemented |
| `Design/link_invalid_variant_3_technical_dossier/` | Link Invalid Technical | ✅ | ✅ | ❌ Not implemented |

---

*End of Report — 0 application source files modified.*
