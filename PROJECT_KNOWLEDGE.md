# Postboard — Project Knowledge Base

> **Status:** Living Document — permanent architectural encyclopedia for the Postboard project.
>
> Unlike `AI_ENGINEERING_RULES.md` (which defines engineering rules), this document records **what actually exists** within the project.
>
> Every future AI agent must read this document before making changes. Every implementation phase must update it.

---

## 1. Executive Summary

### Project Purpose

Postboard is a multi-tenant recruitment SaaS platform connecting job seekers with employers. It serves **five user personas**: public visitors, candidates, recruiters, company admins (admin), and super admins. The design language is **Industrial Broadsheet** — zero-radius, information-dense, monochrome with amber accents.

### Architecture

- **Frontend**: TanStack Start (React 19, SSR) with file-based routing, feature-based architecture, TanStack Query for server state, Zustand for client state
- **Backend**: Express.js with Prisma ORM, PostgreSQL 16, Redis 7, BullMQ for async jobs
- **Auth**: Access tokens (in-memory) + refresh tokens (httpOnly cookies), separate SuperAdmin auth domain
- **Deployment**: Docker Compose (7 services), Nginx reverse proxy, CI/CD via GitHub Actions

### Current Maturity

| Dimension | Status |
|-----------|--------|
| Frontend routes | 56 route files across 7 role groups |
| API endpoints | ~85 across 9 domains |
| Design coverage | 90 directories, 82 with HTML mockups |
| Test coverage | 26 unit tests (Vitest + MSW) |
| Docker services | 7 (nginx, frontend, api, worker, postgres, redis, backup) |
| Production readiness | CONDITIONALLY CERTIFIED — 0 Critical blockers, Phase 12 Independent Certification |
| Dead code | 2 files (CandidateLayout.tsx, RecruiterLayout.tsx — never imported, to be deleted) |
| TypeScript `any` | 0 (all removed Phase 11B) |
| Security audit | 12 Critical/High issues fixed (Phase 11.5), Security Score 9/10 (Phase 12 Certification) |
| OWASP coverage | ≥9/10 categories PASS/RESOLVED (Phase 11.5) |

---

## 2. Repository Structure

```
postboard/
├── AI_ENGINEERING_RULES.md        # Engineering constitution (rules for AI agents)
├── AGENTS.md                       # Agent onboarding guide (project overview, standards)
├── CLAUDE.md                       # Claude coding standards, Do/Don't examples, commands
├── PROJECT_KNOWLEDGE.md            # This file — living architectural encyclopedia
├── IMPLEMENTATION_LOG.md           # Engineering journal — permanent chronological record of all phases
├── DESIGN.md                       # Design system specification (colors, typography, components)
├── README.md                       # Project setup and build instructions
├── ARCHITECTURE.md                 # Frontend system architecture deep-dive
├── DEPLOYMENT.md                   # Production deployment guide
├── PRODUCTION_READINESS.md         # Production readiness report (RC2)
├── RELEASE_CANDIDATE.md            # Release candidate checklist
├── RUNBOOK.md                      # Operations runbook (incident procedures)
├── DESIGN_COMPLIANCE.md            # Design vs implementation audit (68% compliance)
├── DESIGN_COVERAGE.md              # Design coverage analysis (87% screens covered)
├── AUDIT.md                        # Auth infrastructure audit (backend contract)
├── Audit_v2.md                     # Comprehensive project audit (55/100 health)
├── PROJECT_KNOWLEDGE.md            # This file
│
├── Design/                         # UI specification — 90 subdirectories with HTML + screenshots
│   ├── postboard/                  #   Design system tokens (DESIGN.md)
│   ├── login_page/                 #   Auth page mockups
│   ├── job_detail_page/            #   Job detail mockups
│   ├── candidate_dashboard_overview/ # Candidate dashboard
│   ├── recruiter_dashboard_overview/ # Recruiter dashboard
│   ├── admin_dashboard_overview_1/   # Admin dashboard
│   └── ...                         #   90+ design assets organized by page group
│
├── src/                            # Frontend application source
│   ├── components/                 # Application-level components
│   │   ├── devtools/               #   TanStack Router/Query devtools (development only)
│   │   ├── layout/                 #   AppShell, Sidebar, Topbar, MobileNav, UserMenu
│   │   ├── ui/                     #   shadcn/ui primitives (19 components)
│   │   ├── global/                 #   Global shared styles
│   │   ├── ErrorBoundary.tsx       #   React error boundary
│   │   └── NotFoundPage.tsx        #   404 page component
│   │
│   ├── features/                   # Feature modules (single responsibility)
│   │   ├── auth/                   #   Authentication pages, hooks, API
│   │   ├── applications/           #   Application CRUD and status machine
│   │   ├── candidate/              #   Candidate layout & dashboard
│   │   ├── company/                #   Company admin (profile, team, settings)
│   │   ├── jobs/                   #   Job CRUD, marketplace, saved jobs
│   │   ├── notifications/          #   Cross-role notification system
│   │   ├── profile/                #   User profile (candidate + recruiter)
│   │   ├── public/                 #   Landing page, marketing pages
│   │   ├── recruiter/              #   Recruiter workspace and analytics
│   │   ├── admin/                  #   Company-level admin panel
│   │   └── superadmin/             #   Platform-level administration
│   │
│   ├── guards/                     # Route guards (requireAuth, requireRole, requireSuperAdmin)
│   ├── integrations/               # Third-party integration configs (TanStack Query client)
│   ├── lib/                        # Infrastructure layer
│   │   ├── api/                    #   Backward-compat API client, endpoints, query keys
│   │   ├── env.ts                  #   Environment variable access
│   │   ├── observability/          #   Sentry error tracking config
│   │   └── utils.ts                #   General utilities
│   │
│   ├── providers/                  # React context providers (AppProvider, ThemeProvider)
│   ├── routes/                     # TanStack Router route files (file-based)
│   ├── routeTree.gen.ts            # Auto-generated route tree (do not edit)
│   ├── shared/                     # Cross-feature shared code
│   │   ├── api/                    #   Core HTTP client (apiFetch, mapPaginated)
│   │   ├── components/             #   Reusable UI (ux, dialogs, forms, table, theme)
│   │   ├── hooks/                  #   Shared hooks (useMediaQuery)
│   │   ├── types/                  #   Shared DTOs, error types, response envelopes
│   │   └── utils/                  #   cn(), password utilities
│   │
│   ├── stores/                     # Zustand stores (6 total)
│   └── styles/                     # Global CSS (design tokens, animations)
│
├── tests/                          # Test suite
│   ├── fixtures/                   #   MSW handlers, server setup, test utilities
│   └── unit/                       #   Test files (6 files, 26 tests)
│
├── jobboard/                       # Backend application (Express.js)
│   ├── prisma/                     #   Prisma schema + migrations
│   ├── src/                        #   Backend source
│   │   ├── routes/v1/              #     Express route definitions (10 route files)
│   │   ├── controller/v1/          #     Request handlers (9 controller groups)
│   │   ├── services/v1/            #     Business logic (9 service groups)
│   │   ├── middleware/              #     Auth, validation, error handling (10 files)
│   │   ├── validators/             #     express-validator rules (7 files)
│   │   ├── lib/                    #     Prisma, Redis, JWT, email, cache (19 files)
│   │   ├── queues/                 #     BullMQ queue definitions
│   │   ├── workers/                #     BullMQ workers (email worker)
│   │   ├── config/                 #     Environment configuration
│   │   ├── types/                  #     TypeScript types
│   │   └── seeds/                  #     Database seed scripts
│   ├── tests/                      #   Backend test suite
│   ├── Dockerfile                  #   API Docker image
│   ├── Dockerfile.worker           #   Worker Docker image
│   └── API_CONTRACT.md             #   Single source of truth for API contracts
│
├── nginx/                          # Nginx reverse proxy config
├── backups/                        # Backup scripts (PostgreSQL + Redis)
├── .github/workflows/              # CI/CD pipelines
├── docker-compose.yml              # 7-service production stack
├── Dockerfile                       # Frontend Docker image
├── package.json                     # Frontend dependencies
├── vite.config.ts                   # Vite bundler configuration
├── tsconfig.json                    # TypeScript configuration
└── biome.json                       # Biome linting and formatting
```

---

## 3. Frontend Architecture

### 3.1 Feature-Based Architecture

Every feature is self-contained in `src/features/{name}/` with its own API, hooks, components, pages, types, and utils:

```
features/{name}/
├── api/index.ts         # API functions (apiFetch calls)
├── components/          # Feature-specific React components
├── hooks/index.ts       # TanStack Query hooks
├── pages/               # Page-level components consumed by routes
├── types/index.ts       # TypeScript types and interfaces
├── schemas/index.ts     # Zod validation schemas (if forms)
├── utils/               # Feature-specific utilities
└── layout/              # Layout components (if applicable)
```

**Feature Dependency Graph:**
- `auth` → no deps
- `jobs` → `auth`
- `applications` → `auth`, `jobs`
- `candidate` → `auth`, `applications`, `jobs`, `notifications`, `profile`
- `recruiter` → `auth`, `applications`, `jobs`, `company`
- `company` → `auth`
- `admin` → `auth`
- `superadmin` → no deps (separate auth)
- `profile` → `auth`
- `notifications` → `auth`
- `public` → no deps

### 3.2 Routing Strategy

TanStack Router with file-based routing, auto-generated `routeTree.gen.ts`. Route groups:

| Group | Layout | Guard |
|-------|--------|-------|
| Public (`/`, `/jobs`, `/companies`) | `PublicHeader` + `PublicFooter` | None or `redirectIfAuthenticated` |
| Auth (`/login`, `/register`, etc.) | `AuthLayout` | `redirectIfAuthenticated` |
| `_authenticated` | `AppShell` (Sidebar + Topbar + MobileNav) | `requireAuth` |
| Candidate (`/candidate/*`) | `CandidateLayout` | `requireRole(["CANDIDATE"])` |
| Recruiter (`/recruiter/*`) | `RecruiterLayout` | `requireRole(["RECRUITER"])` |
| Company (`/company/*`) | `CompanyLayout` | `requireRole(["RECRUITER", "ADMIN"])` |
| Admin (`/admin/*`) | `AppShell` | `requireRole(["ADMIN", "SUPERADMIN"])` |
| `_superadmin` | `SuperAdminLayout` | `requireSuperAdmin` |
| SA Login (`/superadmin/login`) | None | SA session check |

### 3.3 Layout Hierarchy

```
AppShell (from components/layout/)
├── Topbar (search, notifications bell, UserMenu, ThemeToggle)
├── Sidebar (220px, role-based navigation, hidden on mobile)
├── MobileNav (bottom-docked on mobile only)
└── <main> (content area)

AuthLayout (from features/auth/layout/)
├── AuthBrandPanel (left: brand + PressGrid decorative background)
└── AuthFormPanel (right: form content)

CandidateLayout (from features/candidate/layout/)
├── CandidateSidebar (desktop sidebar)
├── MobileTabBar (mobile)
└── <main>

RecruiterLayout (from features/recruiter/layout/)
├── RecruiterSidebar
└── <main>

CompanyLayout (from features/company/layout/)
├── CompanySidebar
├── MobileTabBar
└── <main>

SuperAdminLayout (from features/superadmin/layout/)
├── SuperAdminSidebar
└── <main>
```

### 3.4 State Management

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Server state | TanStack Query | All API data, query keys factory, mutations, cache invalidation |
| Client state | Zustand | Auth tokens (memory), theme (persisted), sidebar toggle, saved jobs |
| Form state | React Hook Form + Zod | Form validation, field-level errors |
| URL state | TanStack Router | Route params, search params, beforeLoad guards |

**Key rule:** Never store server state in Zustand. All API data flows through TanStack Query.

### 3.5 API Integration

- **Single entry point:** `src/shared/api/client.ts` (`apiFetch<T>()`)
- Auto-injects `Authorization: Bearer` from Zustand stores
- Auto-detects Content-Type (JSON or FormData)
- 30-second timeout via AbortController
- Auto-refresh on 401 with queue pattern (prevents token stampede)
- Auto-unwraps `{ data: T }` backend envelopes
- Pagination helper: `mapPaginated<T>(response, "key")`

### 3.6 Error Handling

- **ApiError** class extends Error with `message`, `status`, `code`, `details`
- **ErrorState** component for inline errors with retry
- **ErrorBoundary** class component wrapping route trees
- **Route errorComponent** for route-level error handling
- **Toast** for mutation errors

### 3.7 Loading Strategy

Every data-fetching component must handle:
- **Loading** → `<LoadingState variant="spinner|skeleton|page" />`
- **Empty** → `<EmptyState title={...} description={...} />`
- **Error** → `<ErrorState message={...} onRetry={...} />`

---

## 4. Backend Architecture

### 4.1 Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + Express 5 |
| Language | TypeScript (strict) |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (via ioredis) |
| Queue | BullMQ |
| Email | Resend (production), console-log (development) |
| Validation | express-validator |
| Auth | JWT (jsonwebtoken) |
| Password | argon2id |
| File upload | Cloudinary (via multer) |
| Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Logging | Winston (structured JSON) |
| Error tracking | Sentry (optional) |
| Testing | Jest + Supertest |

### 4.2 Application Structure (`jobboard/src/`)

```
jobboard/src/
├── app.ts                  # Express app factory (middleware + route mounting)
├── server.ts               # Bootstrap (connect DB/Redis, start listener)
├── config/                 # Environment config (JWT secrets, DB URLs, etc.)
├── routes/v1/              # Route definitions (10 files, all under /api/v1)
│   ├── index.ts            #   Mounts all route groups
│   ├── auth.route.ts       #   Auth endpoints (register, login, refresh, etc.)
│   ├── user.route.ts       #   User profile endpoints
│   ├── company.route.ts    #   Company CRUD, team, analytics, audit
│   ├── job.route.ts        #   Job CRUD, applications
│   ├── tags.route.ts       #   Job tags
│   ├── notification.route.ts # User + company notifications
│   ├── admin.route.ts      #   Admin platform management
│   ├── superadmin.route.ts #   SuperAdmin platform oversight
│   └── bullboard.route.ts  #   Bull Board UI (admin-protected)
├── controller/v1/          # Request handlers (thin — delegate to services)
│   ├── auth/               #   login, register, refreshToken, logout, emailVerification, passwordReset
│   ├── user/               #   profile, current user
│   ├── jobs/               #   CRUD, applications, status
│   ├── company/            #   CRUD, team, analytics, audit, ownership
│   ├── admin/              #   stats, users, jobs, companies, audit-logs
│   ├── superadmin/         #   stats, companies, jobs, candidates, security, recovery
│   ├── notifications/      #   user + company notifications
│   ├── tags/               #   tag listing
│   └── health.ts           #   /health, /ready, /queue/health endpoints
├── services/v1/            # Business logic (authorization + data access)
│   ├── auth/               #   register, login, refresh, email verification, password reset
│   ├── company/            #   CRUD, team, ownership, analytics, audit
│   ├── jobs/               #   CRUD, applications, status
│   ├── notifications/      #   user + company notification logic
│   ├── admin/              #   platform statistics, moderation
│   ├── superadmin/         #   platform oversight, security, recovery
│   ├── user/               #   profile management
│   ├── tags/               #   tag queries
│   └── security/           #   security event logging
├── middleware/              # Express middleware (10 files)
│   ├── authentication.ts   #   JWT verification, AuthRequest type
│   ├── authorization.ts    #   Role-based + company-scoped authorization
│   ├── superAdminAuth.ts   #   Separate SuperAdmin JWT verification
│   ├── adminsAuth.ts       #   Admin-level auth for internal tools
│   ├── errorHandler.ts     #   Centralized error handling + ErrorCodes
│   ├── expressValidates.ts #   express-validator integration
│   ├── requestId.ts        #   X-Request-ID generation
│   ├── requestLogger.ts    #   Structured request logging
│   ├── sanitize.ts         #   Input sanitization (DOMPurify)
│   └── validateUUID.ts     #   UUID parameter validation
├── validators/              # express-validator rule sets (7 files)
├── lib/                     # Infrastructure utilities (19 files)
│   ├── prisma.ts           #   Prisma client singleton with connection pooling
│   ├── redis.ts            #   Redis client singleton + BullMQ connection factory
│   ├── jwt.ts              #   Token generation/verification (access, refresh, SA)
│   ├── email.ts            #   Resend email wrapper + HTML templates
│   ├── password.ts         #   argon2id hashing + verification
│   ├── response.ts         #   sendSuccess, sendPaginated, sendMessage helpers
│   ├── cache.ts            #   Redis cache helpers
│   ├── cloudinary.ts       #   Cloudinary upload config
│   ├── multer.ts           #   File upload middleware
│   ├── express_rate_limit.ts # Rate limiting (express-rate-limit + rate-limit-redis)
│   ├── asyncHandler.ts     #   Async error wrapper for controllers
│   ├── permissions.ts      #   Permission helpers (canManageUser, etc.)
│   ├── notification.ts     #   In-app notification creation helper
│   ├── tokenHash.ts        #   Refresh token hashing for DB storage
│   ├── swagger.ts          #   Swagger doc mounting
│   ├── sentry.ts           #   Sentry initialization (conditional)
│   ├── winston.ts          #   Winston logger configuration
│   ├── cronjob.ts          #   Scheduled job definitions
│   └── index.ts            #   Barrel exports
├── queues/                  # BullMQ queue definitions
│   └── index.ts            #   Email queue (BullMQ)
└── workers/                 # BullMQ workers
    └── email.worker.ts     #   Email sending worker
```

### 4.3 Middleware Pipeline

```
Request → requestId → requestLogger → cors → express.json → cookieParser
  → compression → helmet → rateLimiter → sanitize → morgan (dev only)
  → healthRouter → /api/v1 routes → notFound → errorHandler
```

Protected routes add: `authMiddleware → authorize(roles) → controller → service`

### 4.4 Auth Middleware Chain

1. **authMiddleware** — Verifies `Authorization: Bearer` JWT, extracts `userId` or `companyId`
2. **requireVerifiedUser** — Checks account is not soft-deleted and email is verified
3. **authorize(roles)** — DB re-checks role (bypasses JWT claim trust), sets `companyId` on request
4. **authorizeCompany(roles)** — Same as authorize but also validates company-scoped access
5. **superAdminAuth** — Verifies SuperAdmin JWT (separate secret) for SA routes

### 4.5 Queue Architecture (BullMQ)

- **Email Queue** — handles verification emails, password reset emails
- Jobs are published from auth services on register/forgot-password
- Consumed by `email.worker.ts` which calls `Resend` API
- Bull Board UI mounted at `/admin/queues` (admin-protected)

### 4.6 Caching Strategy

- **Job listings** cached in Redis with 60s TTL
- **Job details** cached with 300s TTL
- **Tags** cached with 600s TTL
- **Notifications** cached with 30s TTL
- Cache invalidated on write operations

### 4.7 Rate Limiting (3 layers)

| Layer | Scope | Limit |
|-------|-------|-------|
| Nginx | Global IP | 100 req/s API, 10 req/m auth, 500 req/s static |
| Express | Auth endpoints | 10 req/15 min per IP |
| Express | Job applications | 5 req/15 min per user |

---

## 5. Database Knowledge

### 5.1 Models & Relationships

**Core Entities:**
- **Company** — tenant root. Has users, jobs, notifications, refresh tokens. Soft-deletable.
- **User** — belongs to Company. Has profile, applications, posted jobs, notifications, audit logs. Soft-deletable.
- **UserProfile** — 1:1 with User. Stores bio, resume, skills, links.
- **Job** — belongs to Company + postedBy User. Has applications, tags. Soft-deletable.
- **JobApplication** — join between Job and User (unique per user per job). Status machine.
- **Tag / JobTag** — M:N between Tag and Job via join table.

**Auth Entities:**
- **RefreshToken** — belongs to User or Company. Hashed token, revocable, with expiry.
- **SuperAdmin** — separate auth domain. Has own refresh tokens.
- **SuperAdminRefreshToken** — belongs to SuperAdmin.

**Audit Entities:**
- **AdminAuditLog** — records admin actions with actor, action, target, company scope, correlation ID.
- **SecurityEvent** — security-relevant events (failed login, permission denied, ownership change). Has severity levels.
- **OwnershipHistory** — tracks company ownership transfers.

### 5.2 Enums

| Enum | Values | Usage |
|------|--------|-------|
| `UserRole` | CANDIDATE, RECRUITER, ADMIN | User.role |
| `JobStatus` | DRAFT, OPEN, CLOSED, EXPIRED | Job.status |
| `LocationType` | REMOTE, ONSITE, HYBRID | Job.locationType |
| `ExperienceLevel` | JUNIOR, MID, SENIOR, LEAD | Job.experienceLevel |
| `ApplicationStatus` | PENDING, REVIEWED, SHORTLISTED, REJECTED, ACCEPTED | Application.status |
| `NotificationType` | APPLICATION_RECEIVED, APPLICATION_STATUS_CHANGED, JOB_POSTED, JOB_EXPIRED, SYSTEM_ALERT | Notification.type |

### 5.3 Key Constraints

- Email is unique on User and Company
- Company slug is unique
- Job slug is unique per company (backed by `@@unique` or unique constraint)
- Applications are unique per user per job (prevents duplicate applications)
- Tags have unique name and slug
- Soft delete via `deletedAt` nullable timestamp (all core entities)

### 5.4 Multi-Tenant Design

- Every company-scoped query includes `companyId` filter
- `authorizeCompany` middleware enforces tenant boundary
- SuperAdmin bypasses tenant isolation (can see all data)
- Refresh tokens are scoped to either a User or a Company (not both)

### 5.5 Pagination

- All list endpoints use cursor-based pagination
- Response: `{ data: T[], meta: { nextCursor, hasNextPage } }`
- Frontend uses `useInfiniteQuery` with `getNextPageParam`

---

## 6. Authentication & Authorization

### 6.1 Auth Flow

```
Registration → argon2 hash → DB insert → email verification sent → JWT issued
Login       → credential check → JWT access token (15m) + httpOnly refresh cookie (7d)
Refresh     → 401 detected → POST /auth/refresh-token → new access token
Logout      → revoke refresh token hash → clear cookie → redirect /login
```

### 6.2 Token Strategy

| Token | Storage | Lifetime | Purpose |
|-------|---------|----------|---------|
| Access Token | Frontend Zustand (memory) | 15 min | API auth header |
| Refresh Token | httpOnly cookie | 7 days | Silent token refresh |
| SA Access Token | Frontend Zustand (memory) | 4 hours | SuperAdmin API auth |
| SA Refresh Token | httpOnly cookie | 7 days | SA token refresh |

### 6.3 Frontend Auth State (Zustand)

**auth-store.ts** (user auth, memory only):
- `accessToken: string | null`
- `user: AuthUser | null` (id, userName, email, role, isVerified, etc.)
- `isAuthenticated: boolean`
- `isInitialized: boolean`
- Actions: `setUser()`, `clearUser()`, `setAccessToken()`, `setInitialized()`

**superadmin-auth-store.ts** (separate SA auth):
- `accessToken: string | null`
- `isAuthenticated: boolean`
- `isInitialized: boolean` (hardcoded true — SA session restore not yet implemented)

### 6.4 Session Restoration

`AuthInitializer` (in `src/providers/AuthInitializer.tsx`):
1. Mounts inside `AppProvider` after `QueryProvider`
2. Checks for existing session via token storage
3. If session detected: fires `useCurrentUser()` query to restore full user
4. If no session: clears store, marks initialized immediately

### 6.5 Route Guards

| Guard | Location | Effect |
|-------|----------|--------|
| `requireAuth()` | `auth-guards.ts` | Redirects unauthenticated to `/login` |
| `requireRole(roles[])` | `auth-guards.ts` | Checks auth + role match, redirects on mismatch |
| `requireSuperAdmin()` | `superadmin-guard.ts` | Redirects to `/superadmin/login` |
| `redirectIfAuthenticated()` | `auth-guards.ts` | Redirects logged-in users from auth pages |

### 6.6 Backend Authorization Middleware

- **`authMiddleware`** — JWT verification, extracts userId/companyId
- **`requireVerifiedUser`** — Checks active + verified account
- **`authorize(roles)`** — DB role check + companyId injection
- **`authorizeCompany(roles)`** — Company-scoped role check
- **`superAdminAuth`** — SuperAdmin JWT verification (separate secret)

### 6.7 SuperAdmin Separation

SuperAdmin auth is completely independent:
- Separate login page: `/superadmin/login`
- Separate store: `superadmin-auth-store.ts`
- Separate middleware: `superAdminAuth`
- Separate JWT secret: `JWT_SUPERADMIN_SECRET`
- Separate refresh endpoint: `/superadmin/refresh`
- A user can be logged into both regular and SA sessions simultaneously

---

## 7. Feature Inventory

### 7.1 Auth (`src/features/auth/`)

| Aspect | Details |
|--------|---------|
| **Purpose** | Authentication (login, register, password reset, email verification, session management) |
| **Location** | `src/features/auth/` |
| **Routes** | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` |
| **API Endpoints** | `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/refresh-token`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/send-verification-email`, `GET /auth/verify-email`, `POST /auth/change-password` |
| **Key Components** | `AuthLayout` (two-panel), `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `VerifyEmailPage`, `AuthBrandPanel`, `PressGrid`, `AuthErrorBanner`, `SuccessBanner`, `RoleCard`, `AuthSubmitButton` |
| **Key Hooks** | `useLogin`, `useRegister`, `useLogout`, `useCurrentUser`, `useForgotPassword`, `useResetPassword`, `useVerifyEmail`, `useResendVerificationEmail`, `useChangePassword` |
| **Status** | Complete |
| **Limitations** | Guard `beforeLoad` runs before AuthInitializer; auth pages use `useEffect` redirect as workaround |

### 7.2 Applications (`src/features/applications/`)

| Aspect | Details |
|--------|---------|
| **Purpose** | Job application submission, status tracking, recruiter pipeline |
| **Routes** | `/candidate/applications`, `/candidate/applications/$applicationId`, `/recruiter/jobs/$jobId/applications` |
| **Key Components** | `CandidateApplicationsPage`, `CandidateApplicationDetailPage`, `RecruiterApplicantPipelinePage` (Kanban) |
| **Status** | Complete — API layer, list/detail pages, Kanban pipeline all implemented |

### 7.3 Candidate (`src/features/candidate/`)

| Aspect | Details |
|--------|---------|
| **Purpose** | Candidate portal — dashboard, job discovery, application tracking, profile management |
| **Routes** | `/candidate/dashboard`, `/candidate/jobs/saved`, `/candidate/applications`, `/candidate/applications/$applicationId`, `/candidate/profile`, `/notifications` (shared) |
| **API Endpoints** | 23 endpoints (auth: 9, profile: 4, jobs: 3, applications: 3, notifications: 4). Saved Jobs: client-side only (no backend). Follow/Unfollow Company: no backend. |
| **Key Components** | `CandidateLayout` (97L, UNUSED by routes), `CandidateDashboardPage` (360L), `CandidateProfilePage` (173L), `CandidateApplicationsPage` (141L), `CandidateApplicationDetailPage` (214L), `ApplicationCard` (76L), `ApplicationTimeline` (61L), `SavedJobsPage` (48L, stub), `ApplyModal` (155L), `NotificationDrawer` (215L), `NotificationListPage` (201L) |
| **Key Hooks** | `useCurrentUser`, `useProfile`, `useUpdateProfile`, `useUploadResume`, `useDeleteResume`, `useMyApplications`, `useApplyToJob`, `useWithdrawApplication`, `useNotifications`, `useUnreadCount`, `useMarkNotificationsRead`, `useDeleteNotification`, `useJobs`, `useSavedJobsStore` |
| **Design Fidelity** | **~75%** overall. Auth ~78%, Dashboard ~85%, Profile ~70%, Applications ~85%, Apply Modal ~85%, Saved Jobs ~65%, Notifications ~80%, Mobile ~50% |
| **Status** | Dashboard rewritten with bento layout — hero, 4 stat tiles, recent apps timeline, recommended roles. Profile enhanced with phone/website/completeness bar/avatar section (avatar upload blocked — no backend). Applications with filter tabs. Apply Modal with profile card/resume/char counter/checkbox. Saved Jobs with filter tabs + 2-col grid (client-side only). Notifications with time-grouped headers. |
| **Limitations** | Profile avatar upload blocked (no `POST /user/current/avatar` endpoint). Work history section unimplemented (no backend). Followed companies unimplemented (no `POST /company/:id/follow`). Candidate analytics page unimplemented (no backend). Saved Jobs client-side only (no backend persistence). No mobile-specific layouts. `CandidateLayout` exists but unused by routes. Application detail loads ALL applications to find one. |

### 7.4 Company (`src/features/company/`)

| Aspect | Details |
|--------|---------|
| **Purpose** | Company administration — profile, team management, analytics, audit logs |
| **Routes** | `/company/`, `/company/profile`, `/company/team`, `/company/notifications`, `/company/audit-logs`, `/company/analytics`, `/company/$companyId` (authenticated), `/companies/$companyId` (public) |
| **API Endpoints** | 15 endpoints covering CRUD, logo, team, analytics, audit, notifications |
| **Key Components** | `CompanyLayout` (sidebar + mobile tabs), `CompanyDashboardPage`, `CompanyAdminProfilePage`, `CompanyTeamPage`, `CompanyNotificationsPage`, `CompanyAuditLogsPage`, `CompanyAnalyticsPage`, `CompanyManagementPage`, `CompanyProfilePage` (public) |
| **Status** | All pages implemented |

### 7.5 Jobs (`src/features/jobs/`)

| Aspect | Details |
|--------|---------|
| **Purpose** | Job listing, detail, creation, editing, marketplace, saved jobs |
| **Routes** | `/jobs`, `/jobs/$jobId`, `/recruiter/jobs`, `/recruiter/jobs/create`, `/recruiter/jobs/$jobId`, `/recruiter/jobs/$jobId/edit`, `/candidate/jobs/saved` |
| **API Endpoints** | `GET /jobs`, `GET /jobs/:id`, `POST /jobs`, `PATCH /jobs/:id`, `PATCH /jobs/:id/status`, `DELETE /jobs/:id`, `GET /tags` |
| **Key Components** | `JobsMarketplace` (309L, rewritten), `JobDetailPage` (337L, rewritten), `JobCard` (129L, rewritten), `JobDetailMobileBar` (118L, new), `JobFilters` (91L, legacy), `ApplyModal` (155L), `SavedJobsPage` (48L, stub), `SavedJobsButton` (29L), `CreateJobPage` (271L), `EditJobPage` (309L), `RecruiterJobManagement` (250L) |
| **Key Hooks** | `useJobs` (infinite), `useJob`, `useCreateJob`, `useUpdateJob`, `useUpdateJobStatus`, `useDeleteJob`, `useTags`, `useCompanyJobs`, `useMyApplications` (from applications feature) |
| **API Functions** | 8 total: `listJobs` (maps `search`→`keyword` for backend), `getJob`, `createJob`, `updateJob`, `updateJobStatus`, `deleteJob`, `listTags`, + hook-level `getCompanyJobs` |
| **Status** | Phase 7B complete — **Public pages ~80% Design fidelity**. Marketplace: hero section, sticky filter bar (search + dropdown pills + sort), 2-column card grid, Load More. Detail: 2-col grid, badge row, about section, sidebar (share/save/apply/applied status), company card, similar roles, mobile bottom CTA bar. API layer updated with `search`→`keyword` mapping. |
| **Design Assets** | 15 directories, 30+ files (17 HTML + 13+ PNGs) across Public, Candidate, Recruiter, SuperAdmin |
| **Limitations** | No `pages/` directory (all in `components/`). Responsibilities/Requirements sections not implemented (backend has single `description` field — no structured data). Funding/size not shown on company card (not in `JobDetail.company` type). `useCompanyJobs` fetches all jobs and filters client-side. `SavedJobsPage` loads ALL jobs to filter. Recruiter management, Saved Jobs enhancement, and Application Modal refinement deferred to Phase 7C. VerificationBadge integrated into JobCard (shows when `isVerified` populated). Applied status indicator on JobDetailPage uses `useMyApplications`. |
| **Phase 7A Report** | `JOB_UI_ARCHITECTURE_REPORT.md` — 17-section comprehensive audit |

### 7.6 Notifications (`src/features/notifications/`)

| Aspect | Details |
|--------|---------|
| **Purpose** | Cross-role notification system |
| **Routes** | `/notifications` |
| **Key Components** | `NotificationListPage` |
| **Status** | API layer complete; list page exists |
| **Limitations** | Unread count badge polling not implemented in Topbar |

### 7.7 Profile (`src/features/profile/`)

| Aspect | Details |
|--------|---------|
| **Purpose** | User profile management (candidate + recruiter) |
| **Routes** | `/candidate/profile`, `/recruiter/profile` |
| **Key Components** | `CandidateProfilePage`, `RecruiterProfilePage` |
| **Status** | API layer complete; both profile pages exist |
| **Limitations** | No shared profile component; `CandidateProfilePage` uses raw `useState` instead of RHF+Zod |

### 7.8 Public (`src/features/public/`)

| Aspect | Details |
|--------|---------|
| **Purpose** | Public-facing marketing pages |
| **Routes** | `/`, `/about`, `/features`, `/contact`, `/privacy`, `/terms`, `/cookies`, `/companies`, `/pricing`, `/maintenance` |
| **Key Components** | `PublicHeader`, `PublicFooter`, `LandingPage`, `AboutPage`, `FeaturesPage`, `ContactPage`, `PrivacyPage`, `TermsPage`, `CookiesPage`, `CompaniesPage`, `PricingPage`, `MaintenancePage` |
| **Status** | Phase 5B complete — all 11 public pages functional with central header/footer via `_public.tsx` layout |
| **Limitations** | CompaniesPage uses mock data (no public backend API); PricingPage is static coming-soon; Terms TOC lacks IntersectionObserver active state |

### 7.9 Recruiter (`src/features/recruiter/`)

| Aspect | Details |
|--------|---------|
| **Purpose** | Recruiter workspace — dashboard, job management, analytics, pipeline |
| **Routes** | `/recruiter/`, `/recruiter/dashboard`, `/recruiter/jobs`, `/recruiter/jobs/create`, `/recruiter/jobs/$jobId`, `/recruiter/jobs/$jobId/edit`, `/recruiter/jobs/$jobId/applications`, `/recruiter/applications/$applicationId`, `/recruiter/profile`, `/recruiter/company`, `/recruiter/analytics`, `/recruiter/notifications` |
| **Key Components** | `RecruiterDashboardPage` (170L), `RecruiterJobDetailPage` (200L), `RecruiterApplicationDetailPage` (370L), `RecruiterNotificationsPage` (180L), `RecruiterAnalyticsPage` (150L), `RecruiterJobManagement` (200L, in jobs feature), `CreateJobPage` (250L, in jobs feature), `EditJobPage` (290L, in jobs feature), `RecruiterApplicantPipelinePage` (180L, in applications feature), `CandidateDetailDrawer` (150L), `KanbanBoard`/`KanbanColumn`/`KanbanCard`, `RecruiterProfilePage` (100L), `CompanyManagementPage` (80L) |
| **Shared Components** | `StatisticsGrid`, `StatusBadge`, `TablePaginationFooter` (used); `FilterToolbar`, `AnalyticsCard`, `ActionMenu`, `SearchInput` (defined but UNUSED) |
| **API Functions** | 4 recruiter-specific (`fetchRecruiterAnalytics`, `fetchRecruiterNotifications`, `markNotificationRead`, `markAllNotificationsRead`) + shared job/application/profile/company hooks |
| **Design Fidelity** | **~45%** overall. Dashboard ~50%, Job Management ~40%, Create/Edit Job ~30-45%, Pipeline ~60%, Application Detail ~50% (buggy), Analytics ~35%, Notifications ~60%, Profile ~40%, Company ~40%, Mobile ~0% |
| **Status** | All 12 routes exist with `requireRole(["RECRUITER"])` guards. Real backend integration across all pages. Kanban pipeline with drag-and-drop. `RecruiterLayout` (115L) exists but is DEAD CODE (never imported). |
| **Bugs** | Application Detail passes empty string to `useJobApplications("")` — page always shows "Application not found". Job Management shows hardcoded "—" for applicant count. "Applicants" nav link duplicates "Jobs" link. Notifications link goes to `/notifications` (shared) not `/recruiter/notifications`. |
| **Limitations** | No Talent Pool / Candidate CRM page (Design mockups exist, no backend endpoint). No mobile-specific layouts for any page. Missing: filter tabs on Job Management, visibility selector on Create/Edit Job, conversion funnel on Analytics, List/Kanban toggle on Pipeline. Self-registration allows any companyId (security concern). No CSRF protection. |

### 7.10 Admin (`src/features/admin/`)

| Aspect | Details |
|--------|---------|
| **Purpose** | Company-level administration — user management, company verification, job moderation, analytics |
| **Routes** | `/admin/dashboard`, `/admin/companies`, `/admin/users`, `/admin/jobs`, `/admin/analytics` |
| **Auth Guard** | `requireRole(["ADMIN", "SUPERADMIN"])` — both Admin and SuperAdmin can access |
| **Layout** | Uses shared `Sidebar.tsx` nav config (no dedicated layout component) |
| **API Endpoints** | 11 endpoints: `GET /admin/stats`, `GET /admin/users`, `POST /admin/users/:id/deactivate`, `GET /admin/companies`, `POST /admin/companies/:id/verify`, `GET /admin/jobs`, `POST /admin/jobs/:id/force-close`, `DELETE /admin/jobs/:id`, `GET /admin/audit-logs` |
| **Key Components** | `StatsCard` (23L), `StatsGrid` (43L, 5-tile), `UserTable` (236L, DataTable), `UserDetailDrawer` (105L, Sheet with company name resolution), `CompanyTable` (249L, DataTable), `AdminJobTable` (262L, DataTable), `AnalyticsSection` (225L, Recharts with date range) |
| **Key Hooks** | `useAdminStats`, `useAdminAuditLogs`, `useAdminUsers`, `useDeactivateUser`, `useAdminCompanies`, `useVerifyCompany`, `useAdminJobs`, `useForceCloseJob`, `useAdminDeleteJob` |
| **Shared Hooks** | `useCursorPagination` (shared, from `src/shared/hooks/`) |
| **Design Fidelity** | **~52%** overall. Dashboard 50% (added activity feed + quick actions), Users 50%, Companies 50%, Jobs 55%, Analytics 55% (added date range filter) |
| **Status** | All 5 pages functional with real backend integration. Dashboard now has activity feed (audit logs) and quick actions. Analytics has date range filter. UserDetailDrawer resolves company names via admin companies API. |
| **UX Issues** | No delete action on CompanyTable (intentional — Admins are company-level, only SuperAdmin can delete companies). No export functionality. No bulk actions. |

### 7.11 SuperAdmin (`src/features/superadmin/`)

| Aspect | Details |
|--------|---------|
| **Purpose** | Platform-level administration — user oversight, company management, security monitoring, platform configuration |
| **Routes** | `/superadmin/dashboard`, `/superadmin/users`, `/superadmin/jobs`, `/superadmin/companies`, `/superadmin/audit-logs`, `/superadmin/security`, `/superadmin/platform` |
| **Auth Guard** | `requireSuperAdmin()` — separate auth domain with `useSuperAdminAuthStore` |
| **Layout** | Standalone `SuperAdminLayout.tsx` (188L) with own sidebar + mobile Sheet nav |
| **API Endpoints** | 15 endpoints: `POST /superadmin/login`, `POST /superadmin/refresh-token`, `POST /superadmin/logout`, `GET /superadmin/stats`, `GET /superadmin/candidates`, `POST /superadmin/candidates/:id/ban`, `GET /superadmin/companies`, `POST /superadmin/companies/:id/verify`, `DELETE /superadmin/companies/:id`, `GET /superadmin/jobs`, `POST /superadmin/jobs/:id/force-close`, `GET /superadmin/security-events`, `GET /superadmin/ownerless-companies`, `POST /superadmin/ownerless-companies/:id/assign-owner`, `POST /superadmin/ownerless-companies/:id/recover-ownership` |
| **Key Components** | `SuperAdminLayout` (188L, standalone sidebar), `SuperAdminLoginPage` (89L), all 7 page components (Companies/Jobs use DataTable, others use manual tables with shared `useCursorPagination` hook) |
| **Key Hooks** | `useSuperAdminStats`, `useSuperAdminCandidates`, `useBanCandidate`, `useSuperAdminCompanies`, `useSuperAdminVerifyCompany`, `useSuperAdminDeleteCompany`, `useSuperAdminJobs`, `useSuperAdminForceCloseJob`, `useSuperAdminSecurityEvents`, `useSuperAdminOwnerlessCompanies`, `useSuperAdminAssignOwner`, `useSuperAdminRecoverOwnership` |
| **Shared Hooks** | `useCursorPagination` (shared, from `src/shared/hooks/`) — used by all SuperAdmin list pages |
| **Design Fidelity** | **~38%** overall. Dashboard 45% (added health metrics + quick actions), Users 35%, Companies 55% (DataTable), Jobs 55% (DataTable + search/filter), AuditLogs 5% (PLACEHOLDER), Security 40% (added event type/severity filters), Platform 25% |
| **Status** | All 8 pages exist. Companies and Jobs pages migrated to DataTable with search/filters. Security Events page has event type and severity filter dropdowns. Dashboard has platform health metrics (verification rate, ratios) and quick actions. All list pages use shared `useCursorPagination` hook for consistent pagination. Users is candidate-only (no recruiter/admin management). Audit Logs is still a placeholder (backend gap). Platform only shows ownerless companies. |
| **UX Issues** | Audit Logs unfilled (Admin endpoint exists but SuperAdmin auth domain is separate — requires backend middleware change). No company/user detail views. No role-filtered user management (backend gap). |

---

## 8. Route Inventory

### 8.1 Public Routes (no auth required)

| Route | Component | Guard | Design Reference |
|-------|-----------|-------|-----------------|
| `/` | `LandingPage` | redirect if auth | `public_landing_page/` |
| `/login` | `LoginPage` | redirect if auth | `login_page/` |
| `/register` | `RegisterPage` | redirect if auth | `register_page/` |
| `/forgot-password` | `ForgotPasswordPage` | redirect if auth | `forgot_password_page_restored/` |
| `/reset-password` | `ResetPasswordPage` | none | `reset_password_page/` |
| `/verify-email` | `VerifyEmailPage` | none | `verify_email_sent_desktop/` |
| `/jobs` | `JobsMarketplace` | none | `jobs_marketplace_public_page/` |
| `/jobs/$jobId` | `JobDetailPage` | none | `job_detail_page/` |
| `/companies` | `CompaniesPage` | none | `companies_directory_page/` |
| `/companies/$companyId` | `CompanyProfilePage` | none | `company_profile_page/` |
| `/about` | `AboutPage` | none | `about_page_desktop/` |
| `/features` | `FeaturesPage` | none | `features_page_desktop/` |
| `/contact` | `ContactPage` | none | `contact_page_desktop/` |
| `/privacy` | `PrivacyPage` | none | `privacy_policy_page_desktop/` |
| `/terms` | `TermsPage` | none | `terms_of_service_page_desktop/` |
| `/cookies` | `CookiesPage` | none | — |
| `/pricing` | `PricingPage` | none | `pricing_page_coming_soon/` |
| `/maintenance` | `MaintenancePage` | none | `maintenance_page_platform_service/` |
| `/superadmin/login` | `SuperAdminLoginPage` | SA session check | — |

### 8.2 Authenticated Routes (under `_authenticated`)

**Shared (any role):**
| Route | Component | Design Reference |
|-------|-----------|-----------------|
| `/notifications` | `NotificationListPage` | `notification_center_desktop_drawer/` |

**Candidate (`requireRole(["CANDIDATE"])`):**
| Route | Component | Design Reference |
|-------|-----------|-----------------|
| `/candidate/dashboard` | `CandidateDashboardPage` | `candidate_dashboard_overview/` |
| `/candidate/jobs/saved` | `SavedJobsPage` | `candidate_saved_roles_dashboard/` |
| `/candidate/applications` | `CandidateApplicationsPage` | `candidate_applications_list_view/` |
| `/candidate/applications/$applicationId` | `CandidateApplicationDetailPage` | `candidate_detail_drawer/` |
| `/candidate/profile` | `CandidateProfilePage` | `candidate_profile_editor/` |

**Recruiter (`requireRole(["RECRUITER"])`):**
| Route | Component | Design Reference |
|-------|-----------|-----------------|
| `/recruiter/dashboard` | `RecruiterDashboardPage` | `recruiter_dashboard_overview/` |
| `/recruiter/jobs` | `RecruiterJobManagement` | `recruiter_job_management/` |
| `/recruiter/jobs/create` | `CreateJobPage` | `job_post_edit_form/` |
| `/recruiter/jobs/$jobId` | `RecruiterJobDetailPage` | — |
| `/recruiter/jobs/$jobId/edit` | `EditJobPage` | `job_post_edit_form/` |
| `/recruiter/jobs/$jobId/applications` | `RecruiterApplicantPipelinePage` | `applicant_pipeline_kanban_view/` |
| `/recruiter/applications/$applicationId` | `RecruiterApplicationDetailPage` | — |
| `/recruiter/profile` | `RecruiterProfilePage` | — |
| `/recruiter/company` | `CompanyManagementPage` | — |
| `/recruiter/analytics` | `RecruiterAnalyticsPage` | `recruiter_analytics_dashboard/` |
| `/recruiter/notifications` | `RecruiterNotificationsPage` | `notification_center_desktop_drawer/` |

**Company (`requireRole(["RECRUITER", "ADMIN"])`):**
| Route | Component | Design Reference |
|-------|-----------|-----------------|
| `/company/` | `CompanyDashboardPage` | `admin_dashboard_overview_1/` |
| `/company/profile` | `CompanyAdminProfilePage` | — |
| `/company/team` | `CompanyTeamPage` | — |
| `/company/notifications` | `CompanyNotificationsPage` | — |
| `/company/audit-logs` | `CompanyAuditLogsPage` | — |
| `/company/analytics` | `CompanyAnalyticsPage` | — |

**Admin (`requireRole(["ADMIN", "SUPERADMIN"])`):**
| Route | Component | Design Reference |
|-------|-----------|-----------------|
| `/admin/dashboard` | `AdminDashboardPage` | `admin_dashboard_overview_1/` |
| `/admin/companies` | `AdminCompaniesPage` | — |
| `/admin/users` | `AdminUsersPage` | — |
| `/admin/jobs` | `AdminJobsPage` | — |
| `/admin/analytics` | `AdminAnalyticsPage` | — |

### 8.3 SuperAdmin Routes (`requireSuperAdmin — under _superadmin`)

| Route | Component | Design Reference |
|-------|-----------|-----------------|
| `/superadmin/dashboard` | `SuperAdminDashboardPage` | — |
| `/superadmin/companies` | `SuperAdminCompaniesPage` | `super_admin_company_management/` |
| `/superadmin/users` | `SuperAdminUsersPage` | `super_admin_user_management_1/` |
| `/superadmin/jobs` | `SuperAdminJobsPage` | — |
| `/superadmin/security` | `SuperAdminSecurityPage` | — |
| `/superadmin/platform` | `SuperAdminPlatformPage` | — |
| `/superadmin/audit-logs` | `SuperAdminAuditLogsPage` | `super_admin_audit_logs/` |

### 8.4 Route Summary

| Category | Count |
|----------|-------|
| Layout routes (pathless) | 3 |
| Public pages | 19 |
| Candidate pages | 5 |
| Recruiter pages | 11 |
| Company admin pages | 6 |
| Admin pages | 5 |
| SuperAdmin pages | 7 |
| **Total route files** | **56** |

---

## 9. API Inventory

### 9.1 Auth API (`/api/v1/auth`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/register` | POST | None | Register user |
| `/auth/login` | POST | None | Login user |
| `/auth/register/company` | POST | None | Register company |
| `/auth/login/company` | POST | None | Login company |
| `/auth/refresh-token` | POST | Cookie | Rotate refresh token |
| `/auth/logout` | POST | Token | Logout, revoke token |
| `/auth/send-verification-email` | POST | None | Resend verification email |
| `/auth/verify-email` | GET | None | Verify email with token |
| `/auth/company/send-verification-email` | POST | None | Company verification email |
| `/auth/company/verify-email` | GET | None | Verify company email |
| `/auth/forgot-password` | POST | None | Request password reset |
| `/auth/reset-password` | POST | None | Reset password with token |
| `/auth/company/forgot-password` | POST | None | Company password reset request |
| `/auth/company/reset-password` | POST | None | Company password reset |
| `/auth/change-password` | POST | Token | Change password |

### 9.2 User API (`/api/v1/user`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/user/current` | GET | Token | Get current user |
| `/user/current` | PATCH | Token | Update profile fields |
| `/user/current` | DELETE | Token | Soft-delete own account |
| `/user/current/profile` | GET | Token | Get extended profile |
| `/user/current/profile` | PUT | Token | Create/update profile |
| `/user/current/profile/resume` | POST | Token | Upload resume |
| `/user/current/profile/resume` | DELETE | Token | Remove resume |

### 9.3 Jobs API (`/api/v1/job`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/job` | GET | None | List public jobs |
| `/job/:id` | GET | None | Get job detail |
| `/job` | POST | Token | Create job |
| `/job/:id` | PATCH | Token | Update job |
| `/job/:id/status` | PATCH | Token | Update job status |
| `/job/:id` | DELETE | Token | Soft-delete job |
| `/job/:id/apply` | POST | Token | Apply to job |
| `/job/:id/applications` | GET | Token | List job applications |
| `/job/my-applications` | GET | Token | My applications |
| `/job/applications/:applicationId/status` | PATCH | Token | Update application status |
| `/job/applications/:applicationId` | DELETE | Token | Withdraw application |

### 9.4 Company API (`/api/v1/company`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/company/current` | GET | Token | Get own company |
| `/company/current` | PATCH | Token | Update company |
| `/company/current/logo` | POST | Token | Upload logo |
| `/company/current/logo` | DELETE | Token | Delete logo |
| `/company/current` | DELETE | Token | Soft-delete company |
| `/company/:companyId` | GET | Token | Get company by ID |
| `/company/current/team` | GET | Token | List team members |
| `/company/current/team/invite` | POST | Token | Invite member |
| `/company/current/team/:memberId/role` | PATCH | Token | Change role |
| `/company/current/team/:memberId` | DELETE | Token | Remove member |
| `/company/current/team/:memberId/transfer-ownership` | PATCH | Token | Transfer ownership |
| `/company/current/analytics` | GET | Token | Company analytics |
| `/company/current/recruiters/:id/analytics` | GET | Token | Recruiter analytics |
| `/company/current/audit-logs` | GET | Token | Audit trail |
| `/company/current/ownership-history` | GET | Token | Ownership history |

### 9.5 Tags API (`/api/v1/tags`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/tags` | GET | None | List tags |

### 9.6 Notifications API (`/api/v1/notifications`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/notifications/company` | GET | Token | Company notifications |
| `/notifications/company/unread-count` | GET | Token | Unread count |
| `/notifications/company/read` | PATCH | Token | Mark read (bulk) |
| `/notifications/company/:notificationId/read` | PATCH | Token | Mark read (single) |
| `/notifications/company/:notificationId` | DELETE | Token | Delete notification |
| `/notifications/user` | GET | Token | User notifications |
| `/notifications/user/unread-count` | GET | Token | Unread count |
| `/notifications/user/read` | PATCH | Token | Mark read (bulk) |
| `/notifications/user/:notificationId` | DELETE | Token | Delete notification |

### 9.7 Admin API (`/api/v1/admin`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/admin/stats` | GET | Token | Platform statistics |
| `/admin/users` | GET | Token | List users |
| `/admin/users/:userId` | DELETE | Token | Deactivate user |
| `/admin/companies` | GET | Token | List companies |
| `/admin/companies/:companyId/verify` | PATCH | Token | Toggle verification |
| `/admin/jobs` | GET | Token | List all jobs |
| `/admin/jobs/:jobId/close` | PATCH | Token | Force-close job |
| `/admin/jobs/:jobId` | DELETE | Token | Delete job |
| `/admin/audit-logs` | GET | Token | Audit log |

### 9.8 SuperAdmin API (`/api/v1/superadmin`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/superadmin/login` | POST | None | SA login |
| `/superadmin/refresh` | POST | Cookie | SA token refresh |
| `/superadmin/logout` | POST | Token | SA logout |
| `/superadmin/stats` | GET | Token | Platform stats |
| `/superadmin/companies` | GET | Token | List companies |
| `/superadmin/companies/:id/verify` | PATCH | Token | Set verification |
| `/superadmin/companies/:id` | DELETE | Token | Delete company |
| `/superadmin/jobs` | GET | Token | List jobs |
| `/superadmin/jobs/:id/force-close` | DELETE | Token | Force-close job |
| `/superadmin/candidates` | GET | Token | List candidates |
| `/superadmin/candidates/:id/ban` | DELETE | Token | Ban candidate |
| `/superadmin/security-events` | GET | Token | Security events |
| `/superadmin/ownerless-companies` | GET | Token | Ownerless companies |
| `/superadmin/companies/:id/assign-owner` | POST | Token | Assign owner |
| `/superadmin/companies/:id/recover-ownership` | POST | Token | Recover ownership |

---

## 10. Design Directory Index

### 10.1 Overview

The `Design/` directory contains **90 subdirectories** of UI specifications. Each subdirectory typically contains:
- `code.html` — Self-contained HTML/CSS mockup (82 directories have this)
- `screen.png` — Screenshot of the design (100% coverage)

### 10.2 Design Assets by Page Group

| Group | Count | With code.html | Includes |
|-------|-------|----------------|----------|
| **Auth** | 16 | 15 (93.8%) | Login, Register, Forgot Password, Reset Password, Verify Email, Email Verified, Verification Link Invalid, Session Restore, Onboarding Role Selector |
| **Public** | 24 | 23 (95.8%) | Landing Page (2 variants), About, Features, Contact, Pricing, Privacy, Terms, Jobs Marketplace, Job Detail, Company Profile, Companies Directory, 404, Maintenance, Access Restricted, Action Not Allowed |
| **Candidate** | 12 | 11 (91.7%) | Dashboard (3 variants), Applications List, Application Detail, Saved Roles, Profile Editor, Followed Companies, Detail Drawer |
| **Recruiter** | 12 | 10 (83.3%) | Dashboard (3 variants), Analytics, Job Management, Applicant Pipeline (Kanban), Talent Pool (2 variants), Pipeline Mobile |
| **Company Admin** | 3 | 3 (100%) | Dashboard Overview (2 variants), Dashboard Mobile |
| **SuperAdmin** | 9 | 9 (100%) | Dashboard, Company Management, User Management (2 variants + 3 mobile), Audit Logs |
| **Error/State** | 13 | 11 (84.6%) | 404, Access Restricted, Action Not Allowed, Maintenance, Empty States Reference, Link Invalid |
| **Cross-cutting** | 6 | 6 (100%) | Notification Center, Job Application Modal, Job Post Edit Form |

### 10.3 Directories Missing `code.html` (8 total)

- `forgot_password_page/` (Auth)
- `companies_directory_public_roster/` (Public)
- `candidate_dashboard_full_mission_control/` (Candidate)
- `recruiter_dashboard_mission_control/` (Recruiter)
- `recruiter_talent_pool_candidate_crm/` (Recruiter)
- `access_restricted_action_not_allowed/` (Error)
- `maintenance_page_platform_service/` (Error)

### 10.4 Design Language: Industrial Broadsheet

| Attribute | Specification |
|-----------|--------------|
| Border radius | **Zero (0px)** everywhere — exceptions: badges 2px, pills 999px |
| Typography | Playfair Display (headlines), DM Sans (UI/body), JetBrains Mono (technical labels) |
| Section labels | `// PREFIX` in `mono-label` (JetBrains Mono, 11px, uppercase) |
| Elevation | Flat — no shadows, depth via tonal layering and border color changes |
| Icons | Hugeicons (outline for UI, filled for active states) |
| Overlays | `rgba(0,0,0,0.8)` dimming — no backdrop blur |

---

## 11. Reusable Components Catalogue

### 11.1 UX Components (`src/shared/components/ux/`)

| Component | Props | When to Use |
|-----------|-------|-------------|
| `LoadingState` | `variant: "spinner" | "skeleton" | "page"`, `message?: string` | Any data-fetching component during loading |
| `EmptyState` | `title: string`, `description?: string`, `action?: { label, onClick, variant }`, `variant?: "default" | "error"`, `highlightTile?: number` | Any data-fetching component with empty results — press-grid illustration, retry action support |
| `ErrorState` | `message: string`, `onRetry?: () => void` | Any data-fetching component with error |
| `SearchInput` | `value, onChange, placeholder?` | Table/list search bars |
| `AccessRestricted` | `title?, message?, dashboardLabel?, dashboardTo?, contactLabel?, contactTo?` | 403/access-denied pages inside AppShell |
| `PressGrid` | none (decorative only) | Decorative 144-tile press-grid background with grain overlay. Used in auth panels, 404, maintenance, empty states. `aria-hidden="true"` | (`src/shared/components/dialogs/`)

| Component | Props | When to Use |
|-----------|-------|-------------|
| `ConfirmDialog` | `open, onOpenChange, title, description, confirmLabel?, onConfirm, isLoading?, variant?: "danger" | "default"` | Destructive or important actions needing confirmation |

### 11.3 Form Components (`src/shared/components/forms/`)

| Component | Props | When to Use |
|-----------|-------|-------------|
| `PasswordField` | React Hook Form field props | Password inputs with strength meter |

### 11.4 Table Components (`src/shared/components/table/`)

| Component | Props | When to Use |
|-----------|-------|-------------|
| `DataTable` | TanStack Table instance + options | Any tabular data display (sortable, selectable) |
| `TablePagination` | pagination state object | Pagination controls for DataTable |
| `TableToolbar` | toolbar action config | Action toolbar above DataTable |

### 11.5 Theme Components (`src/shared/components/theme/`)

| Component | Props | When to Use |
|-----------|-------|-------------|
| `ThemeToggle` | none | Topbar/UserMenu — dark/light/system toggle |

### 11.6 Layout Components (`src/components/layout/`)

| Component | Wraps | When to Use |
|-----------|-------|-------------|
| `AppShell` | All authenticated routes | `_authenticated` layout — provides Sidebar + Topbar + MobileNav |
| `Sidebar` | Inside AppShell | Desktop navigation (220px) |
| `Topbar` | Inside AppShell | Search, notifications, UserMenu |
| `MobileNav` | Inside AppShell | Bottom-docked mobile navigation |
| `UserMenu` | Inside Topbar | User avatar dropdown |

### 11.7 Feature-Specific Layouts

| Layout | Used By | Features |
|--------|---------|----------|
| `AuthLayout` | `/login`, `/register`, etc. | Two-panel: brand left, form right |
| `CandidateLayout` | `/candidate/*` | Sidebar + mobile tabs |
| `RecruiterLayout` | `/recruiter/*` | Sidebar navigation |
| `CompanyLayout` | `/company/*` | Sidebar + mobile tabs |
| `SuperAdminLayout` | `/superadmin/*` | Sidebar navigation |

### 11.8 Public-Facing Components

| Component | Used In | Purpose |
|-----------|---------|---------|
| `PublicHeader` | All public pages | Brand, nav links, auth-aware CTA buttons |
| `PublicFooter` | All public pages | Links grid, copyright, tagline |
| `PricingPage` | `/pricing` | 3-tier coming-soon pricing grid (Free/Pro/Custom) with waitlist |
| `MaintenancePage` | `/maintenance` | Full-screen maintenance with service status indicators |

### 11.9 UI Primitives (`src/components/ui/`)

19 shadcn/ui primitives: `button`, `input`, `label`, `dialog`, `select`, `skeleton`, `badge`, `avatar`, `separator`, `switch`, `tabs`, `command`, `sheet`, `dropdown-menu`, `checkbox`, `radio-group`, `textarea`, `popover`, `tooltip`. Radix imports fixed in Phase 5B — `tsc --noEmit` passes with 0 errors.

---

## 12. Shared Hooks & Utilities

### 12.1 Shared Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useMediaQuery` | `src/shared/hooks/` | Responsive breakpoint detection |

### 12.2 Utilities

| Utility | Location | Purpose |
|---------|----------|---------|
| `cn()` | `src/shared/utils/` | Tailwind class merging (clsx + tailwind-merge) |
| Password utils | `src/shared/utils/` | Password strength calculation, validation rules |
| `apiFetch<T>()` | `src/shared/api/client.ts` | Single HTTP entry point with auto-refresh |
| `mapPaginated()` | `src/shared/api/client.ts` | Renames `data` to feature-specific key for paginated responses |
| `ApiError` | `src/shared/types/api.ts` | Standardized error class |
| Error codes | `src/shared/types/api.ts` | ErrorCode union type (VALIDATION_ERROR, UNAUTHORIZED, etc.) |

---

## 13. State Management

### 13.1 Zustand Stores (Client State Only)

| Store | State Shape | Persisted | Purpose |
|-------|-------------|-----------|---------|
| `auth-store.ts` | `{ accessToken, user, isAuthenticated, isInitialized }` | No (memory) | User auth tokens + current user |
| `superadmin-auth-store.ts` | `{ accessToken, isAuthenticated, isInitialized }` | No (memory) | SuperAdmin auth (separate) |
| `theme-store.ts` | `{ theme: "dark" | "light" | "system" }` | Yes (localStorage) | Theme preference |
| `sidebar-store.ts` | `{ isOpen: boolean }` | No (transient) | Sidebar toggle |
| `saved-jobs-store.ts` | `{ savedJobs: SavedJobEntry[] }` | Yes (localStorage) | Client-side saved jobs |

### 13.2 TanStack Query (Server State)

- **Query key factory:** `src/lib/api/query-keys.ts` — centralized, `as const` for type safety
- **Default stale times:** auth user 5min, tags 10min, dashboard stats 60s, lists ≥30s
- **Mutations:** `useMutation` with `onSuccess` invalidating precise keys
- **Paginated lists:** `useInfiniteQuery` with cursor-based `getNextPageParam`
- **Optimistic updates:** Used for status toggles with `onError` rollback

### 13.3 Context Providers (`src/providers/`)

| Provider | Purpose |
|----------|---------|
| `AppProvider` | Wraps root — provides QueryClient, theme initialization |
| `ThemeProvider` | Reads theme-store, applies `dark`/`light` class to `<html>` |
| `AuthInitializer` | Attempts session restore on page load via refresh token |

---

## 14. Technical Debt Register

### 14.1 TypeScript / Build Issues

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 1 | `popover.tsx` imports from `radix-ui` (umbrella) instead of `@radix-ui/react-popover` | `src/components/ui/popover.tsx` | HIGH — resolved (Phase 5B): named import pattern fixes TS error |
| 2 | `tooltip.tsx` is hand-rolled (no Radix), unused params fixed | `src/components/ui/tooltip.tsx` | HIGH — resolved (Phase 5B): pass-through stub, no Radix dependency needed |

### 14.2 Architecture Issues

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 3 | No shared public route layout — each page wraps PublicHeader/PublicFooter individually | 8+ public pages | MEDIUM |
| 4 | Guard `beforeLoad` runs before AuthInitializer restores session | `src/guards/` + `src/routes/` | MEDIUM |
| 5 | AuthLayout left panel branding overlaps with design mockup content for verification pages | `src/features/auth/` | LOW |

### 14.3 API / Data Issues

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 6 | SuperAdmin auth uses raw URL strings instead of `endpoints.superadmin.*` constants | `src/features/superadmin/api/auth.ts` | LOW |
| 7 | Company `fetchTeam` and Recruiter `fetchRecruiterNotifications` manually unwrap data | `src/features/company/api/`, `src/features/recruiter/api/` | LOW |
| 8 | Application types duplicated in both `applications/types` and `jobs/types` | `src/features/applications/types/`, `src/features/jobs/types/` | LOW |

### 14.4 UI / Design Issues

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 9 | JobDetailPage "similar roles" uses same-company (design shows cross-company) | `src/features/jobs/components/JobDetailPage.tsx` | MEDIUM |
| 10 | JobDetailPage `description` is single block (design shows separate sections) | `src/features/jobs/components/JobDetailPage.tsx` | MEDIUM |
| 11 | Admin routes use inline `<div className="p-6">` instead of shared layout | `src/routes/_authenticated/admin/*.tsx` | LOW |
| 12 | Unread count badge polling not implemented in Topbar | `src/components/layout/Topbar.tsx` | LOW |
| 13 | `endpoints.ts` hardcodes `localhost:5000` — ignores `VITE_API_URL` | `src/lib/api/endpoints.ts` | CRITICAL |
| 14 | SuperAdmin API files independently hardcode `localhost:5000` (5 files) | `src/features/superadmin/api/*.ts` | CRITICAL |
| 15 | `lucide-react` present in package.json despite explicit prohibition | `package.json` + 4 shadcn files | CRITICAL |
| 16 | `CandidateProfilePage` uses raw `useState` — bypasses RHF + Zod | `src/features/profile/pages/candidate/CandidateProfilePage.tsx` | CRITICAL |
| 17 | TanStack Table not used anywhere — all tables use hand-crafted HTML | `src/features/admin/`, `src/features/superadmin/` | CRITICAL |
| 18 | SuperAdmin sidebar links route to admin-protected routes (`/admin/*`) | `src/components/layout/Sidebar.tsx` | CRITICAL |
| 19 | SuperAdmin session not restored on page refresh | `src/stores/superadmin-auth-store.ts` | CRITICAL |
| 20 | `--radius: 0.625rem` in CSS (should be 0px for Industrial Broadsheet) | `src/styles.css` | HIGH |
| 21 | Shadow utilities in shadcn components violate design rules | `dialog.tsx`, `dropdown-menu.tsx`, `select.tsx`, `sheet.tsx` | HIGH |
| 22 | Candidate/Recruiter dashboards are placeholder stubs | `_authenticated/candidate/dashboard.tsx`, `_authenticated/recruiter/dashboard.tsx` | HIGH |
| 23 | Recruiter analytics feature missing | `src/routes/_authenticated/recruiter/` | HIGH |
| 24 | Public landing page missing (redirects to /login) | `src/routes/index.tsx` | HIGH |
| 25 | Legacy CSS tokens pollute stylesheet (`--sea-ink`, `--lagoon`, etc.) | `src/styles.css` | HIGH |
| 26 | DevTools ship unconditionally in production bundle | `src/routes/__root.tsx`, `src/providers/QueryProvider.tsx` | HIGH |
| 27 | Auth server state duplicated in Zustand (`user` and `role` fields) | `src/stores/auth-store.ts` | HIGH |
| 28 | Analytics charts use hardcoded hex colors instead of gradient tokens | `src/features/admin/components/analytics/AnalyticsSection.tsx` | HIGH |
| 29 | No mobile navigation for SuperAdmin | `src/features/superadmin/layout/SuperAdminLayout.tsx` | HIGH |
| 30 | Saved jobs uses raw `localStorage` instead of Zustand store | `src/features/jobs/components/SavedJobsButton.tsx` | HIGH |
| 31 | Recruiter sidebar "Applicants" link dead (no route) | `src/components/layout/Sidebar.tsx` | MEDIUM |
| 32 | SuperAdmin query keys not centralized in `queryKeys` factory | `src/features/superadmin/hooks/` | MEDIUM |
| 33 | Body text size drift (13px used instead of design spec 15px) | Multiple components | MEDIUM |
| 34 | Job card layout is single-column (design specifies 2-column grid) | `Join MarketPlace` | MEDIUM |
| 35 | Profile update does not invalidate auth query | `src/features/profile/hooks/index.ts` | MEDIUM |
| 36 | SuperAdmin pagination uses offset strategy (backend uses cursor) | `src/features/superadmin/types/` | MEDIUM |
| 37 | No component tests for shared UX components | `tests/unit/` | MEDIUM |
| 38 | Pre-existing `--radius` nonzero | Design system | MEDIUM |
| 39 | Icon system drift (Hugeicons vs Material Symbols in design) | Project-wide | LOW |
| 40 | Mono-label size 12px vs design spec 11px | Project-wide | LOW |
| 41 | `aria-describedby` missing on some dialogs | `src/components/ui/dialog.tsx` | LOW |
| 42 | No offline state detection | Project-wide | LOW |
| 43 | Notifications use 30s polling — no WebSocket | `src/features/notifications/` | LOW |

---

## 15. Permissions Matrix

### 15.1 Role Definitions

| Role | Can Access | Cannot Access |
|------|-----------|---------------|
| **CANDIDATE** | `/candidate/*`, `/jobs`, `/jobs/*`, `/companies/*`, `/notifications` | `/recruiter/*`, `/admin/*`, `/company/*`, `/superadmin/*` |
| **RECRUITER** | `/recruiter/*`, `/company/*`, `/jobs`, `/jobs/*`, `/companies/*`, `/notifications` | `/candidate/*`, `/admin/*`, `/superadmin/*` |
| **ADMIN** | `/admin/*`, `/company/*`, `/jobs`, `/jobs/*`, `/companies/*`, `/notifications` | `/candidate/*`, `/recruiter/*`, `/superadmin/*` |
| **SUPERADMIN** | `/superadmin/*`, `/admin/*` (elevated), `/notifications` | `/candidate/*`, `/recruiter/*` |

### 15.2 Guard Application

| Route Group | Guard Applied | Where |
|-------------|---------------|-------|
| Public pages | None (or `redirectIfAuthenticated`) | Individual route `beforeLoad` |
| `/_authenticated` layout | `requireAuth` | Layout `beforeLoad` |
| Candidate routes | `requireRole(["CANDIDATE"])` | Individual route `beforeLoad` |
| Recruiter routes | `requireRole(["RECRUITER"])` | Individual route `beforeLoad` |
| Company routes | `requireRole(["RECRUITER", "ADMIN"])` | Parent `_authenticated/company` `beforeLoad` |
| Admin routes | `requireRole(["ADMIN", "SUPERADMIN"])` | Individual route `beforeLoad` |
| `/_superadmin` layout | `requireSuperAdmin` | Layout `beforeLoad` |

### Phase 5 — Public Website, Navigation & Global Experience (2026-06-27)

**New discoveries:**
- `@hugeicons/core-free-icons` does NOT export `CloseIcon` — the close/X icon is `Cancel01Icon` (aliased to `X` in some versions). The hamburger menu icon is `Menu01Icon`.
- The Design/ directory has 24 public-facing mockups covering landing page (2 variants), about, features, contact, pricing, privacy, terms, jobs marketplace, job detail, company profile, companies directory, 404, maintenance, access restricted, and action not allowed.
- Backend has NO public company listing endpoint — `GET /company/:companyId` requires auth, and there is no `GET /companies` or `GET /public/companies` endpoint for unauthenticated directory browsing.
- Biome's `noCommentText` rule flags the Industrial Broadsheet `//` prefix labels as JS comments — these are intentional visible design elements used across all pages.
- The `_public.tsx` layout handles header/footer wrapping centrally (not per-page), contrary to the IMPLEMENTATION_LOG.md known issue that claimed "each page individually wraps PublicHeader/PublicFooter."
- CSS variable `bg-(--background)` works correctly for theme switching — no need for hardcoded `bg-[#080808]` references.

**Architecture decisions:**
- All public pages use CSS variables for background colors (`bg-(--background)`) instead of hardcoded dark-mode values — this enables proper light/dark theme switching
- PublicHeader detects active route via `useLocation()` from `@tanstack/react-router` for both desktop (bottom border active indicator) and mobile (left border active indicator)
- Mobile menu uses `absolute` positioning below header with `md:hidden` class — no slide-out drawer needed for the simple nav structure
- SEO meta tags use TanStack Router's `head()` function with full og:title, og:description, twitter:title, twitter:description for all public pages

**Technical debt removed:**
- 1 TypeScript error (CloseIcon → Cancel01Icon)
- 66 Biome false positives (noCommentText rule suppressed at project level)
- 5 Biome lint warnings (array index keys, unused function params) fixed
- Hardcoded `bg-[#080808]` theme-breaking references in route files

**New components added to reusable catalogue:**
- None — all components are public-feature-specific

**Known issues:**
- CompaniesPage remains a stub — backend lacks public companies listing endpoint
- Pre-existing TypeScript errors in popover.tsx and tooltip.tsx remain unresolved

---

## 16. Future AI Notes

> **Instructions for future agents:**
>
> After every implementation phase, append a new entry below. Include:
> - New discoveries about the codebase
> - Architecture decisions made during the phase
> - New reusable components or hooks created
> - Components or routes removed
> - Route or API changes
> - Technical debt removed
> - Remaining issues
> - Lessons learned
>
> The companion engineering journal is `IMPLEMENTATION_LOG.md` — it records the full chronological history with standardized template entries.
>
> Never overwrite previous entries. Append only.

### Phase 0 — Project Documentation Foundation (2026-06-27)

**New discoveries:**
- The `Design/` directory contains 90 subdirectories of UI specifications — always inspect the relevant `code.html` before implementing any page
- 8 directories lack `code.html` — these represent potential design gaps
- The project has ~85 API endpoints across 9 domains, 54 route files, and 26 passing tests
- SuperAdmin has a completely separate auth flow (separate store, login, guard, refresh endpoint)
- Two shadcn/ui primitives (popover, tooltip) have broken Radix imports causing TypeScript build errors
- Backend uses Express 5, Prisma 7 with `@prisma/adapter-pg`, argon2id, and separate JWT secrets for user/company/SuperAdmin

**Architecture decisions:**
- Three documents now govern all future work: AI_ENGINEERING_RULES.md (rules), PROJECT_KNOWLEDGE.md (knowledge), IMPLEMENTATION_LOG.md (history)
- All three are append-only — no entries are ever overwritten
- Every phase must update all three before completing

**Lessons learned:**
- Always inspect Design/ HTML mockups BEFORE implementing — previous phases required full rewrites when this was skipped
- The project has extensive audit data already collected across routes, APIs, features, backend, and design assets
- Backend has 3-layer rate limiting, tenant isolation through company-scoped queries, and audit logging for sensitive actions

### Phase 0.1 — Enhanced Project Knowledge Base (2026-06-27)

**New discoveries:**
- Backend has a full BullMQ queue system for async email processing with separate worker container
- Prisma schema uses `@prisma/adapter-pg` for connection pooling (20 max in production, 30s idle timeout)
- Caching strategy uses Redis with per-endpoint TTLs (jobs 60s, details 300s, tags 600s, notifications 30s)
- Separate SuperAdmin auth uses its own JWT secret and refresh token cookie
- `API_CONTRACT.md` in jobboard/ is the definitive API contract — frontend must not guess response shapes
- The backend AGENTS.md (in jobboard/) has strict security-first rules: tenant isolation, authorization in services not controllers, never trust JWT claims without DB verification

**Architecture decisions:**
- PROJECT_KNOWLEDGE.md restructured to match 15-section specification: Executive Summary, Repository Structure, Frontend Architecture, Backend Architecture, Database Knowledge, Auth & Auth, Feature Inventory, Route Inventory, API Inventory, Design Directory Index, Reusable Components, Shared Hooks & Utils, State Management, Technical Debt Register, Future AI Notes
- Backend architecture documented comprehensively for the first time (routes, controllers, services, middleware pipeline, queue system, caching, rate limiting)

**Technical debt added to register:**
- CRIT-01: `endpoints.ts` hardcodes `localhost:5000` — ignores `VITE_API_URL`
- CRIT-02: 5 SuperAdmin API files independently hardcode `localhost:5000`
- CRIT-03: `lucide-react` in package.json despite explicit prohibition
- CRIT-04: `CandidateProfilePage` bypasses RHF + Zod
- CRIT-05: TanStack Table not used anywhere
- CRIT-06: SuperAdmin sidebar links route to admin-protected routes
- CRIT-07: SuperAdmin session not restored on page refresh

**Known Issues Remaining:**
- Pre-existing TypeScript errors in `popover.tsx` and `tooltip.tsx` (radix-ui namespace mismatch)
- No shared public route layout pattern (each public page individually wraps PublicHeader/PublicFooter)
- Guard `beforeLoad` timing issue (runs before AuthInitializer restores session)
- 43 documented technical debt items across build, architecture, API, UI, and testing categories

**Recommended Next Phase:**
1. Fix CRIT-01/CRIT-02: Use `env.apiUrl` in endpoints.ts and SuperAdmin API files
2. Fix CRIT-03: Replace Lucide icons in shadcn components; remove from package.json
3. Fix CRIT-04: Migrate CandidateProfilePage to RHF + Zod
4. Fix CRIT-05: Create shared DataTable with useReactTable; migrate admin tables
5. Fix CRIT-06: Fix SuperAdmin sidebar links to use `/superadmin/*` paths
6. Fix CRIT-07: Add restoreSession() to SuperAdmin auth store

### Phase 0.2 — Establish the Engineering Journal (2026-06-27)

**New discoveries:**
- The three-document governance model is now finalized: AI_ENGINEERING_RULES.md (rules) → PROJECT_KNOWLEDGE.md (knowledge) → IMPLEMENTATION_LOG.md (history)
- IMPLEMENTATION_LOG.md was restructured from a simple changelog to an 8-section engineering journal with standardized phase templates
- Existing Phase 0, 1, 2 entries were preserved verbatim; Phase 0.1 was added retroactively in the new template
- Open Issues Register now centralizes all 7 critical + 5 high-severity items in one place

**Architecture decisions:**
- IMPLEMENTATION_LOG.md now uses 8 permanent sections: Project Timeline, Project Status, Engineering Principles, Phase History (append-only), Current Roadmap, Open Issues Register, AI Session Notes, Documentation Rules
- Current Roadmap covers 15 areas from Documentation through Production Readiness
- Open Issues Register uses severity/description/location/phase/status model — never delete entries, mark as completed

**Lessons learned:**
- Always cross-reference AI_ENGINEERING_RULES.md Phase Log against IMPLEMENTATION_LOG.md before beginning a phase — Phase 0.1 was missing from the log
- Documentation-only phases are valuable for establishing governance — they prevent architectural drift during feature development
- The engineering journal is the authoritative record of evolution; PROJECT_KNOWLEDGE.md is the authoritative record of current state

### Phase 1 — Comprehensive Repository Audit & Master Backlog (2026-06-27)

**New discoveries:**
- The project has significant type duplication — `ApplicationStatus`, `UserRole`, `CurrentUserResponse`, and many other types are defined in 2-3 places each (auth types, shared types, application types, job types)
- There are duplicate component implementations — 4 versions of `SearchInput` (shared/ux, shared/recruiter, admin/shared, superadmin/shared), 3 versions of `ErrorState`
- Two API client layers exist: `shared/api/client.ts` (apiFetch) and `lib/api/request.ts` (legacy http wrapper) — the `authenticated` parameter in `http` is dead code
- `features/admin/components/shared/` and `features/superadmin/components/shared/` both duplicate shared/ux components — a total of 8 duplicates across 4 locations
- The backend has 2 critical bugs: hardcoded email recipient in `email.ts:30` (all emails go to one address) and application status defaults to `SHORTLISTED` instead of `PENDING`
- 8 empty/ dead directories exist across features (auth/services, auth/validators, company/dialogs, recruiter/schemas, admin/schemas, admin/utils, superadmin/utils)
- 5 Design endpoints/URLs are unused (registerCompany, loginCompany, ownershipHistory)

**Architecture decisions:**
- MASTER_BACKLOG.md created as the single source of truth for all remaining engineering work — replaces scattered audit documents
- Implementation roadmap organized into 7 phases (Phase 2→8) with dependency graph
- No application source code modified during this phase — read-only audit only
- Backend critical bugs documented in backlog for Phase 2 remediation

**Technical debt added to register:**
- 43 technical debt items consolidated from previous audits into MASTER_BACKLOG.md section 9
- Backend CRIT-01: Hardcoded email recipient (blocks production)
- Backend CRIT-02: Application default status SHORTLISTED (wrong behavior)
- Backend HIGH-01: Missing `/ready` readiness endpoint

**Known Issues Remaining:**
- All previously documented technical debt items unchanged
- 7 frontend CRITICAL + 2 backend CRITICAL items unresolved
- Build-blocking TypeScript errors in popover/tooltip

### Phase 2 — Authentication & Session Architecture Investigation (2026-06-27)

**New discoveries:**
- **Authenticated pages flash login on every refresh** — `beforeLoad` guards fire synchronously during route resolution BEFORE `AuthInitializer`'s `useEffect` runs. This is the single biggest auth issue. LoginPage/RegisterPage work around it via `useEffect` redirects.
- **Two auth API client layers still active** — Auth hooks use the legacy `http` wrapper (`src/features/auth/api/index.ts`), while AuthInitializer uses the modern `apiFetch` (`src/shared/api/client.ts`). SuperAdmin API in `features/superadmin/api/auth.ts` also uses the legacy `http`.
- **SuperAdmin auth store has `isRestoringSession` in state interface but NO setter action** — `setAccessToken` does NOT set `isInitialized` (unlike regular auth store which does). This means SA session restore relies entirely on `finally(() => saSetInitialized())` in AuthInitializer.
- **User and role in auth-store are server state** — violates the "server state in TanStack Query only" rule. `useCurrentUser()` fetches the same data and has its own `setUser()` callback that writes back to Zustand.
- **Duplicate `/user/current` fetch on every login** — `useLogin().onSuccess` manually calls `fetchCurrentUser()` then immediately invalidates `queryKeys.auth.all`, causing `useCurrentUser()` to re-fetch. Two identical network requests.
- **UserMenu Settings link is hardcoded** to `/candidate/profile` regardless of the user's actual role.
- **Recruiter sidebar "Applicants" link** links to `/recruiter/applicants` — no route file exists at that path.
- **SA logout doesn't navigate** — `clearAuth()` in SuperAdminLayout resets the store but does not call `router.navigate()`. The redirect happens implicitly via the guard on next render.
- **`redirectIfAuthenticated` only checks regular auth** — does not check SuperAdmin auth store. A SA logged into both sessions would not be redirected from `/login`.
- **No Onboarding Role Selector** — design exists at `Design/onboarding_role_selector/` but not implemented.
- **AuthInitializer waits for BOTH sessions to restore** — regular + SA restore run in parallel with `Promise.all`. If one hangs, the app never renders.

**Architecture decisions:**
- Full auth architecture documented in `AUTH_ARCHITECTURE_REPORT.md` — 18 issues cataloged from CRITICAL to LOW
- Report includes: lifecycle diagrams, backend architecture, frontend architecture, state management, endpoint inventory, guard analysis, permission matrix, design comparison, root cause analysis, recommended implementation order, file change list, risks, testing strategy
- Recommended implementation order: Phase A (critical auth bugs) → Phase B (architecture cleanup) → Phase C (UX polish)
- 18 auth-specific issues documented: 2 CRITICAL, 5 HIGH, 5 MEDIUM, 6 LOW
- No application source code modified — investigation only

### Phase 3 — Authentication & Session Completion (2026-06-27)

**Changes made (12 files):**

| File | Change |
|------|--------|
| `src/stores/superadmin-auth-store.ts` | Added `setRestoringSession()` action; `setAccessToken` sets `isInitialized: true` |
| `src/guards/auth-guards.ts` | `requireAuth()`, `requireRole()` guard against `!isInitialized`; `redirectIfAuthenticated()` checks SA store |
| `src/features/auth/hooks/index.ts` | `useLogin()` no longer manually fetches `/user/current` or invalidates query |
| `src/features/auth/components/LoginPage.tsx` | Removed `useEffect` redirect workaround; removed unused imports |
| `src/features/auth/components/RegisterPage.tsx` | Removed `useEffect` redirect workaround; removed unused imports |
| `src/components/layout/UserMenu.tsx` | Settings link role-aware via `getSettingsPath(role)` |
| `src/components/layout/Sidebar.tsx` | Recruiter "Applicants" → `/recruiter/jobs` |
| `src/components/layout/MobileNav.tsx` | Same sidebar fix for mobile |
| `src/features/superadmin/api/auth.ts` | Replaced `${BASE_URL}/superadmin/*` with `endpoints.superadmin.*` |
| `src/features/auth/components/VerifyEmailPage.tsx` | Auto-mutation in `useEffect` instead of render body |
| `src/features/superadmin/layout/SuperAdminLayout.tsx` | Logout navigates to `/superadmin/login` |
| `src/routes/superadmin/login.tsx` | `beforeLoad` uses store instead of `superAdminTokenStorage.hasSession()` |

**Root causes fixed (10 issues):**
- **A-1 (CRITICAL)** — Guard timing: `isInitialized` check in `beforeLoad` prevents redirect before AuthInitializer completes
- **A-2 (CRITICAL)** — SA store: `setRestoringSession()`, `setAccessToken` sets `isInitialized`
- **A-3 (HIGH)** — Duplicate user fetch: removed manual fetch + invalidate from `useLogin`
- **A-6 (HIGH)** — SA API: migrated to `endpoints.superadmin.*`
- **A-7 (MEDIUM)** — `redirectIfAuthenticated` now checks SA store
- **A-8 (MEDIUM)** — Settings link role-aware
- **A-9 (MEDIUM)** — Recruiter sidebar Applicants → `/recruiter/jobs`
- **A-10 (LOW)** — SA logout navigates explicitly
- **A-13 (LOW)** — VerifyEmailPage mutation in `useEffect`
- **A-15/A-16/A-18 (MEDIUM)** — Login/Register/SALogin redirect workarounds removed; SA route `beforeLoad` migrated to store

**Known remaining auth issues:**
- A-4 (HIGH): Remove `user`/`role` from Zustand (server state in Query only)
- A-5 (HIGH): Migrate SA login to RHF + Zod
- A-12 (LOW): UserMenu loading/empty states
- A-17 (MEDIUM): apiFetch aborted controller retry in 401 refresh

### Phase 5B — Public Website Design Conformity & Build Fixes (2026-06-27)

**Changes made (17+ files):**

| File | Change |
|------|--------|
| `src/components/ui/popover.tsx` | Fixed Radix named import pattern |
| `src/components/ui/tooltip.tsx` | Fixed unused params |
| `src/shared/components/PressGrid.tsx` | **NEW** — promoted from auth to shared |
| `src/components/NotFoundPage.tsx` | **REWRITTEN** — press-grid, glitch, trace ID, CTAs |
| `src/features/public/pages/CompaniesPage.tsx` | **REWRITTEN** — mock data directory |
| `src/features/public/pages/ContactPage.tsx` | Updated Hugeicons |
| `src/shared/components/ux/EmptyState.tsx` | **REWRITTEN** — press-grid, variants |
| `src/features/public/pages/MaintenancePage.tsx` | **NEW** |
| `src/routes/_public/maintenance.tsx` | **NEW** route with SEO |
| `src/features/public/pages/PricingPage.tsx` | **NEW** — 3-tier pricing with waitlist |
| `src/routes/_public/pricing.tsx` | **NEW** route with SEO |
| `src/routeTree.gen.ts` | Regenerated |
| `src/features/public/components/PublicHeader.tsx` | Refactored nav, buttons, font, mobile |
| `src/features/public/components/PublicFooter.tsx` | Refactored columns, hover, tagline |
| `src/features/public/pages/LandingPage.tsx` | Refactored icons, grid, font |
| `src/features/public/pages/FeaturesPage.tsx` | Added TerminalIcon |
| `src/styles.css` | Added glitch/texture/press-grid CSS |

**New routes:** `/pricing`, `/maintenance`
**New shared component:** PressGrid (decorative 144-tile grid)
**New public components:** PricingPage, MaintenancePage

**Architecture decisions:**
- PressGrid promoted to shared/ for cross-feature reuse
- EmptyState redesigned with press-grid illustration, backward-compatible API
- CompaniesPage uses mock data (no public API endpoint)
- Pricing page in `_public` layout for public accessibility
- Theme system verified: Zustand persist + flash prevention + system detection + accessible toggle

**Technical debt removed:**
- Build-blocking popover/tooltip TS errors resolved (named import pattern)
- `&#9632;` HTML entities replaced with Hugeicons across public pages
- `tsc --noEmit` passes with 0 errors
- `biome check` passes on all 25 public files with 0 errors

**Known issues:**
- Companies Directory uses mock data (no public backend endpoint)
- Job Marketplace 2-column grid mismatch (out of scope)
- About team photos are placeholders
- Terms TOC lacks IntersectionObserver active state
- Breadcrumbs/back navigation not yet implemented
- Responsive and accessibility verification not yet performed

**Recommended next:**
1. Implement Breadcrumbs component with back navigation
2. Run responsive verification across all breakpoints
3. Run accessibility verification (ARIA, keyboard nav, contrast)
4. Final validation: build, typecheck, lint

### Phase 11A — Production Acceptance Audit (2026-06-28)

**Audit Scope:**
Complete production readiness audit across 8 dimensions: Routes & Navigation, Accessibility, Security, Performance, Code Quality, Design Compliance, User Journey Validation, and Regression Testing.

**Key Findings:**

| Category | Score | Status |
|----------|-------|--------|
| TypeScript Compilation | 100/100 | ✅ PASS |
| Test Coverage | 100/100 | ✅ PASS (26/26) |
| Design Compliance | 78/100 | ⚠️ GOOD |
| Accessibility (WCAG AA) | 72/100 | ⚠️ NEEDS WORK |
| Security | 65/100 | 🔴 CRITICAL |
| Performance | 60/100 | ⚠️ NEEDS WORK |
| Code Quality | 70/100 | ⚠️ TECHNICAL DEBT |

**3 Critical Blockers (PRODUCTION BLOCKING):**
1. **CRITICAL-1:** Backend `.env` file committed to git with hardcoded secrets (JWT keys, DB password, Cloudinary keys, Resend API key, SuperAdmin password)
2. **CRITICAL-2:** No CSRF protection on any state-changing operations
3. **CRITICAL-3:** XSS via `dangerouslySetInnerHTML` on job descriptions, company descriptions, team roles

**6 High Priority Issues:**
1. No Content Security Policy (CSP) headers configured
2. `role` stored in localStorage (tamperable for UI-level RBAC bypass)
3. useJobs polls every 30s via refetchInterval (excessive network usage)
4. No route-level lazy loading (large initial bundle)
5. Dialog missing `aria-describedby`/`aria-labelledby` wiring
6. SearchInput missing accessible label

**Design Compliance Assessment:**
- Core tokens correctly implemented: zero radius, DM Sans, Playfair Display, JetBrains Mono
- Minor color variances (orange vs amber accent) — acceptable for brand flexibility
- Component compliance: Sidebar 90%, Topbar 85%, Cards 88%, Forms 85%, Tables 92%, Dialogs 90%, Badges 95%
- Landing page fully design-compliant: masthead, press-grid, mono-labels, stats section, CTAs
- Auth page fully design-compliant: brand panel, form labels, focus ring, error states, footer metadata

**Accessibility Assessment (72/100):**
- PASS: Skip-to-content link, focus-visible on all interactive elements, ARIA labels on theme toggle, aria-current on active sidebar links
- FAIL: Dialog ARIA wiring, search input label, color-only error states, table filter keyboard navigation, non-interactive tabIndex usage

**Security Assessment (6.5/10):**
- PASS: Token storage in memory (Zustand), httpOnly refresh cookie, route guards functional, RBAC enforced, Zod validation on all forms
- FAIL: Secrets committed to git, no CSRF, XSS vectors via dangerouslySetInnerHTML, no CSP headers, role in localStorage

**Performance Assessment (6/10):**
- PASS: Vite build with tree-shaking, React 19, TanStack Router code splitting possible, DEV-only DevTools
- FAIL: No route-level lazy loading, useJobs 30s polling, no memoization on heavy lists, hero images not lazy-loaded

**Files Modified:**
- `PRODUCTION_ACCEPTANCE_REPORT.md` — comprehensive audit report (created)
- `IMPLEMENTATION_LOG.md` — Phase 11A entry appended
- `MASTER_BACKLOG.md` — Appendix C: remediation items added

**Verification:** ✅ tsc (0 errors), ✅ vitest (26/26)

**Recommended Next Phase:** Phase 12A — Critical Blocker Remediation (resolve 3 critical security vulnerabilities). Estimated 2-3 days for critical fixes, 1-2 weeks for comprehensive remediation.

### Phase 11B — Production Hardening (2026-06-28)

**Summary:** Verified every Phase 11A audit claim against source code. 8 of 9 claims were false positives or already resolved. Fixed 4 genuine issues and removed 11 dead code files.

**Actual Issues Found and Fixed:**
1. **Accessibility:** SearchInput missing aria-label (fixed), ErrorState color-only (added icon), LoadingState missing aria-busy (added)
2. **Performance:** Notification polling 30s interval (replaced with refetchOnWindowFocus)
3. **Dead Code (11 files removed):** 4 SA duplicate components, 5 shared dead components, ErrorBoundary, auth.ts module
4. **Type Safety:** `mapPaginated` `any` → `unknown`

**False Positives Corrected:**
- `.env` committed to git — file exists but NOT tracked
- `role` in localStorage — auth stores use in-memory only
- `dangerouslySetInnerHTML` — absent from all source files
- `console.log` (24+) — zero found
- TODO/FIXME (7) — zero found
- useJobs 30s polling — actually notifications had it (useJobs was clean)
- DevTools in production — conditional on `import.meta.env.DEV`
- Dialog ARIA — Radix primitives handle this automatically

**Current Maturity Update:**
- Production Readiness: **PRODUCTION READY with Minor Known Limitations**
- Dead code: 0 files (all removed)
- Surface area: 11 files deleted, 4 modified

**Verification:** ✅ tsc (0 errors), ✅ vitest (26/26)

### Phase 12 — Production Readiness, Release Validation & Deployment Preparation (2026-06-28)

**Summary:** Final production readiness phase. Read all 10 mandatory documents. 4 parallel subagent audits. Fixed 7 critical/high issues: pinned TanStack packages, moved devtools to devDependencies, fixed Prisma schema default (SHORTLISTED→PENDING), added prisma generate to Dockerfiles, conditional devtools plugin, conditional Bull Board, npm ci in Docker. Created RELEASE_READINESS_REPORT.md with final verdict.

**Key Findings:**
- All production configuration hardened (package.json, Dockerfiles, vite.config.ts, app.ts, Prisma schema)
- All remaining false positives from Phase 11A confirmed: no committed secrets, no dangerouslySetInnerHTML, no console.log, no TODOs
- TanStack packages pinned to specific versions — `"latest"` forbidden in production
- npm audit: frontend 0 vulns, backend 1 High (nodemailer — unused) + 25 Moderate (transitive)

**Current Maturity Update:**
- Production Readiness: **🟢 READY FOR PRODUCTION**
- Security Score: 8.5/10
- TypeScript errors: 0 (frontend + backend)
- Tests: 26/26 passing
- Dead code: 0 files
- npm audit: frontend clean, backend 1 High (nodemailer unused)

**Verification:** ✅ tsc (0 errors), ✅ vitest (26/26), ✅ npm run build (passes)

**Deliverables:**
- `RELEASE_READINESS_REPORT.md`

### Phase 12 — Independent Certification (2026-06-28)

**Summary:** Independent certification audit. Re-verified all prior claims by reading source code. Ran 4 parallel design compliance audits, 2 verification agents, 2 engineering/quality agents. Found 0 Critical production blockers. 4/4 end-to-end user journeys complete. Engineering scores: Architecture 9/10, Code Quality 9/10, Security 9/10, Performance 8/10, Accessibility 8/10. Discovered CandidateLayout.tsx and RecruiterLayout.tsx are dead code (never imported) — refuted the "double sidebar" finding. Confirmed SuperAdmin Audit Logs is a stub and Talent Pool feature is missing.

**Key Findings:**
- All 4 user journeys verified end-to-end: Visitor→Candidate, Candidate apply, Recruiter manage, Admin manage
- CandidateLayout.tsx and RecruiterLayout.tsx are dead code (never imported) — no double sidebar issue
- SuperAdmin Audit Logs page is a 21-line stub (functional gap)
- Talent Pool feature entirely missing (0% implemented)
- Recruiter Analytics has zero charts/visualizations
- Background color #131313 vs #080808 — design files inconsistent, visually negligible
- 47 pages verified across all 5 personas

**Current Maturity Update:**
- Certification Status: **🟢 CONDITIONALLY CERTIFIED**
- Critical Production Blockers: 0
- Required Before Launch: 3 items (audit logs, admin route, dead code removal)
- Security Score: 9/10 (independent verification)
- Architecture Score: 9/10

**Verification:** ✅ tsc (0 errors), ✅ vitest (26/26), ✅ npm run build (passes)

**Deliverables:**
- `RELEASE_CERTIFICATION.md` — Independent certification report

### Phase 11.5 — White-Box Security Assessment (2026-06-28)
