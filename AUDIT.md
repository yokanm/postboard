# PostBoard Audit Report

## Design Compliance

| Check | Status |
|-------|--------|
| Zero-radius (`rounded-none`) | ✓ All components |
| DM Sans, Playfair Display, JetBrains Mono | ✓ styles.css |
| No glassmorphism | ✓ |
| No shadow-heavy UI | ✓ |
| No Lucide icons (Hugeicons only) | ✓ |
| Shadcn tokens overridden for zero-radius | ✓ |
| Press Grid utility classes | ✓ styles.css:329-372 |

## Architecture Compliance

| Check | Status |
|-------|--------|
| Feature-based structure | ✓ `src/features/auth/` |
| Route files are orchestration only | ✓ |
| TanStack Query for server state | ✓ `src/features/auth/hooks/` |
| Zustand for client state | ✓ `src/stores/auth-store.ts`, `src/stores/sidebar-store.ts` |
| No server state in Zustand | ✓ |
| shadcn/ui + Radix UI primitives | ✓ |
| React Hook Form + Zod for forms | ✓ |
| Tailwind CSS for styling | ✓ |
| Fetch API only (no Axios) | ✓ `src/lib/api/request.ts` |

---

# PHASE 2.5 — AUTH INFRASTRUCTURE + BACKEND INTEGRATION

## 1. Backend Contract Audit

The backend is at `http://localhost:5000/api/v1` (Express.js + Prisma + PostgreSQL). All routes mounted under `/api/v1`.

### Base URL

```
VITE_API_BASE_URL = http://localhost:5000/api/v1
```

### Refresh Token Strategy

| Aspect | Detail |
|--------|--------|
| Storage | **httpOnly cookie** (not accessible from JavaScript) |
| Set by | Login, Register, Refresh-token endpoints |
| Sent by | Browser automatically with `credentials: "include"` |
| Fallback | Backend also accepts `refreshToken` in request body |

### Auth Endpoints

| Endpoint | Method | Auth | Request | Response | Status |
|----------|--------|------|---------|----------|--------|
| `/auth/login` | POST | No | `{ email, password }` | `{ user: { userName, email, role }, accessToken }` + Set-Cookie | ✓ |
| `/auth/register` | POST | No | `{ userName, firstName, lastName, email, password, role?, phone?, companyId? }` | `{ user: { id, userName, email, role, isVerified, message }, accessToken }` + Set-Cookie | ✓ |
| `/auth/logout` | POST | Yes | (reads cookie) | `204 No Content` | ✓ |
| `/auth/refresh-token` | POST | Cookie | (reads cookie or body) | `{ accessToken }` + Set-Cookie | ✓ |
| `/auth/forgot-password` | POST | No | `{ email }` | Always `{ message }` (200) | ✓ |
| `/auth/reset-password` | POST | Query | `?token=...` + `{ password }` | `{ message }` | ✓ |
| `/auth/verify-email` | GET | Query | `?token=...` | `{ message }` | ✓ |
| `/auth/send-verification-email` | POST | No | `{ email }` | `{ message }` | ✓ |
| `/auth/change-password` | POST | Yes | `{ currentPassword, newPassword }` | `{ message }` | ✓ |
| `/user/current` | GET | Bearer | — | `{ user: UserWithProfile }` | ✓ |

### Response Shapes (from backend source)

```typescript
// Login response (auth/login.controller.ts)
{ user: UserSummary, accessToken: string }
// UserSummary = { userName: string, email: string, role: UserRole }

// Register response (auth/register.controller.ts)
{ user: UserPublic, accessToken: string }
// UserPublic = { id: string, userName: string, email: string, role: UserRole, isVerified: boolean }
// Also includes "message" in response (from controller)

// Refresh response (auth/refreshToken.controller.ts)
{ accessToken: string }
// New refreshToken set as httpOnly cookie; no refreshToken in JSON body

// Current user response (user/currentUser.controller.ts)
{ user: UserWithProfile }
/* UserWithProfile = {
  id: string, userName: string, firstName: string, lastName: string,
  email: string, phone: string | null, role: UserRole,
  isVerified: boolean, companyId: string | null, createdAt: string,
  profile: UserProfile | null
}
UserProfile = {
  bio: string | null, resumeUrl: string | null, linkedinUrl: string | null,
  githubUrl: string | null, skills: string[], location: string | null
}
*/

// Error responses
{ message: string }
// No "code" or "statusCode" in JSON body — just { message }
// HTTP status conveys the error category
```

### User Roles

| Role | Source | Frontend Support |
|------|--------|------------------|
| `CANDIDATE` | Self-registration | ✓ |
| `RECRUITER` | Self-registration (requires `companyId`) | ✓ |
| `ADMIN` | Server-assigned | ✓ |
| `SUPERADMIN` | Separate auth domain (different JWT + `/superadmin` routes) | Not implemented |

### Field Name Differences

| Backend | Frontend (old) | Frontend (fixed) |
|---------|---------------|------------------|
| `userName` | `username` | `userName` |
| `isVerified` | (missing) | `isVerified` |
| `createdAt` | (missing) | `createdAt` |

### Critical Deviations (old → corrected)

| Aspect | Old (broken) | Correct (actual backend) |
|--------|-------------|-------------------------|
| Login response wrapper | `{ user, tokens: { accessToken, refreshToken } }` | `{ user, accessToken }` (no `tokens` wrapper) |
| Register response wrapper | `{ user, tokens: { accessToken, refreshToken } }` | `{ user, accessToken }` (no `tokens` wrapper) |
| Refresh endpoint path | `/auth/refresh` | `/auth/refresh-token` |
| Refresh response | `{ accessToken, refreshToken }` | `{ accessToken }` only |
| Current user endpoint | `GET /auth/me` | `GET /user/current` |
| Current user response | `{ id, email, ... }` (flat) | `{ user: UserWithProfile }` (wrapped) |
| Verify email method | POST | **GET** `?token=...` |
| Reset password token | In request body | **Query param** `?token=...` |
| Send verification | `POST /auth/send-verification` (authenticated) | `POST /auth/send-verification-email` (public, `{ email }`) |
| Error shape | `{ message, code, statusCode }` | `{ message }` only |
| Register field | `username` | `userName` |
| Register recruiter field | `organizationAccessKey` | `companyId` (UUID) |
| Credentials | — | Must use `credentials: "include"` for cookies |
| Refresh token storage | `localStorage` | httpOnly cookie (not in JS) |
| Session detection | Check refresh token in storage | Check access token OR auth flag |
| Logout response | JSON body | `204 No Content` |

---

## 2. Frontend Architecture

### Auth Store (`src/stores/auth-store.ts`)
- `user: AuthUser | null` — current authenticated user
- `isAuthenticated: boolean` — derived from user presence
- `isInitialized: boolean` — tracks session restoration completion
- `role: UserRole | null` — current user role
- `setUser(user)` — sets user + marks authenticated
- `clearUser()` — clears all auth state
- `setInitialized()` — marks initialization complete

### API Layer (`src/lib/api/`)
| File | Purpose |
|------|---------|
| `client.ts` | Barrel exports |
| `request.ts` | Fetch wrapper with `credentials: "include"`, auth headers, refresh interceptor |
| `endpoints.ts` | Base URL + all endpoint paths |
| `auth.ts` | Token storage (sessionStorage for access token, localStorage for auth flag) |
| `errors.ts` | `ApiRequestError` class + response parser (parses `{ message }` only) |
| `refresh.ts` | Cookie-based token refresh with deduplication |
| `query-keys.ts` | Centralized TanStack Query key factory |

### Auth Feature API (`src/features/auth/api/`)
- `loginUser()` — POST `/auth/login` → `{ user, accessToken }`
- `registerUser()` — POST `/auth/register` → `{ user, accessToken }`
- `logoutUser()` — POST `/auth/logout` → `204 No Content`
- `fetchCurrentUser()` — GET `/user/current` → unwraps `data.user`
- `refreshAccessToken()` — POST `/auth/refresh-token` → `{ accessToken }`
- `requestPasswordReset()` — POST `/auth/forgot-password` → `{ message }`
- `resetPassword()` — POST `/auth/reset-password?token=...` → `{ message }`
- `verifyEmail()` — GET `/auth/verify-email?token=...` → `{ message }`
- `requestVerificationEmail()` — POST `/auth/send-verification-email` → `{ message }`
- `changePassword()` — POST `/auth/change-password` → `{ message }`

### React Query Hooks (`src/features/auth/hooks/`)
| Hook | Type | Description |
|------|------|-------------|
| `useCurrentUser()` | Query | Fetches current user from `/user/current`, populates auth store |
| `useLogin()` | Mutation | Stores access token, sets partial user from login response, redirects by role |
| `useRegister()` | Mutation | Stores access token, sets user from register response, redirects by role |
| `useLogout()` | Mutation | Calls logout API (sends cookie), clears tokens + cache, redirects |
| `useForgotPassword()` | Mutation | Requests password reset email |
| `useResetPassword()` | Mutation | Resets password with token (query param) + new password (body) |
| `useVerifyEmail()` | Mutation | Verifies email with token (GET query param) |
| `useResendVerificationEmail()` | Mutation | Resends verification email (takes email, not authenticated) |

### Auth Initializer (`src/providers/AuthInitializer.tsx`)
- Mounts inside `AppProvider` (after `QueryProvider`)
- Checks for existing session via `tokenStorage.hasSession()` (access token OR auth flag)
- If session detected: fires `useCurrentUser()` query to restore full user
- If no session: clears store, marks initialized immediately
- Blocks rendering with "INITIALIZING_SESSION..." until completed

### Route Guards (`src/guards/auth-guards.ts`)
| Guard | Function | Implementation |
|-------|----------|----------------|
| `requireAuth()` | Redirects to `/login` if no session | Checks `tokenStorage.hasSession()` |
| `requireRole(roles)` | Redirects to correct dashboard if wrong role | Reads role from `useAuthStore.getState().role` |
| `redirectIfAuthenticated()` | Redirects to dashboard if session exists | Checks `tokenStorage.hasSession()` |

### Role Route Protection
| Route | Guard | Redirect Target |
|-------|-------|-----------------|
| `/_authenticated/candidate/dashboard` | `requireRole(["CANDIDATE"])` | `/recruiter/dashboard` or `/admin/dashboard` |
| `/_authenticated/recruiter/dashboard` | `requireRole(["RECRUITER"])` | `/candidate/dashboard` or `/admin/dashboard` |
| `/_authenticated/admin/dashboard` | `requireRole(["ADMIN"])` | `/candidate/dashboard` or `/recruiter/dashboard` |
| `/login`, `/register`, `/forgot-password` | `redirectIfAuthenticated` | `/candidate/dashboard` |
| `/reset-password`, `/verify-email` | None (public with token) | — |

### Token Refresh Flow
1. `request.ts` sends all requests with `credentials: "include"` (sends cookies)
2. For authenticated requests, `Authorization: Bearer <accessToken>` is added
3. On `401`, `fetchWithRefresh` intercepts and calls `attemptRefresh()`
4. `attemptRefresh()` POSTs to `/auth/refresh-token` (cookie travels automatically)
5. Response `{ accessToken }` is stored, original request is retried
6. Concurrent 401s share a single refresh promise (deduplication)
7. On failure: tokens cleared, redirect to `/login`

---

## 3. Testing Checklist

| Test Case | Status | Notes |
|-----------|--------|-------|
| Login | ✓ | Uses `{ email, password }`, gets `{ user, accessToken }` |
| Register Candidate | ✓ | Uses `userName`, no companyId required |
| Register Recruiter | ✓ | Sends `companyId` as UUID (not `organizationAccessKey`) |
| Logout | ✓ | Calls POST `/auth/logout`, cookie-based, 204 response |
| Session Restore | ✓ | AuthInitializer fetches `/user/current` on mount |
| Refresh Token | ✓ | Cookie-based, POST `/auth/refresh-token`, deduplicated |
| Verify Email | ✓ | GET `/auth/verify-email?token=...` (not POST) |
| Forgot Password | ✓ | POST `/auth/forgot-password` with `{ email }` |
| Reset Password | ✓ | POST `/auth/reset-password?token=...` with `{ password }` |
| Candidate Guard | ✓ | `requireRole(["CANDIDATE"])` on candidate routes |
| Recruiter Guard | ✓ | `requireRole(["RECRUITER"])` on recruiter routes |
| Admin Guard | ✓ | `requireRole(["ADMIN"])` on admin routes |
| App Refresh Persistence | ✓ | Auth flag + sessionStorage access token |
| Unauthorized Redirects | ✓ | Redirects to `/login` when no session |
| Error Parsing | ✓ | Parses `{ message }` only (no `code`/`statusCode`) |
| Cookie-based Auth | ✓ | All requests use `credentials: "include"` |

---

## 4. Lint & TypeCheck

- **TypeScript**: `tsc --noEmit` — zero errors
- **Biome lint**: Warnings are pre-existing `noCommentText` (intentional `// LABEL` design pattern)
- **Build**: Both client and SSR builds succeed

---

## 5. Bundle Impact

| Route Bundle | Size (SSR) |
|-------------|-----------|
| `login-*.js` | 6.04 kB |
| `register-*.js` | 12.41 kB |
| `forgot-password-*.js` | 5.01 kB |
| `reset-password-*.js` | 6.52 kB |
| `verify-email-*.js` | 4.53 kB |
| `hooks-*.js` (shared auth hooks) | 9.35 kB |
| `dashboard-*.js` (candidate) | 0.76 kB |
| `dashboard-*.js` (recruiter) | 0.77 kB |
| `dashboard-*.js` (admin) | 0.77 kB |
| `_authenticated-*.js` (shell) | 19.58 kB |

---

## 6. Remaining Tasks Before Phase 3 (Jobs)

### High Priority
- [ ] Verify all endpoints against actual running backend
- [ ] Test refresh token flow end-to-end
- [ ] Test session restore across full page reload
- [ ] Test cross-tab session (new tab, cookie exists, no access token)
- [ ] Add loading skeletons to dashboard pages
- [ ] Wire up real email verification flow (backend must send emails)

### Medium Priority
- [ ] Add rate-limit error handling for auth endpoints
- [ ] Add "remember me" functionality
- [ ] Add password strength indicator on register form
- [ ] Add email verification badge/status on user profile

### Low Priority
- [ ] Add SuperAdmin role support when backend implements it
- [ ] Add OAuth/SSO provider abstraction
- [ ] Add session timeout warning
- [ ] Add multi-device session management UI
