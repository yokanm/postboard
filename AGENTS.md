# AGENTS.md

# POSTBOARD Frontend — Onboarding Guide

## Project Overview

Postboard is a multi-tenant recruitment platform with **five user personas**: Public visitors, Candidates, Recruiters, Company Admins, and SuperAdmins. The frontend is a TanStack Start application with SSR, file-based routing, and a strict feature-based architecture.

### Product Vision

Connect job seekers with employers through a high-density, enterprise-grade recruitment platform. The design language is **Industrial Broadsheet** — zero-radius, information-dense, monochrome with amber accents, inspired by Bloomberg Terminal, Linear, and print broadsheets.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start (React 19, SSR) |
| Routing | TanStack Router (file-based) |
| Server State | TanStack Query |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS v4 |
| UI Primitives | shadcn/ui + Radix UI |
| Icons | Hugeicons |
| Charts | Recharts (lazy-loaded) |
| HTTP | Native Fetch (no Axios) |
| Validation | Zod schemas |
| Testing | Vitest + MSW |

### Multi-Tenant Model

```
Public (/)          → Landing, job search, company profiles
Candidate            → Job discovery, applications, profile
Recruiter            → Job management, applicant pipeline, analytics
Company Admin        → Team, settings, audit logs, analytics
SuperAdmin           → Platform oversight, users, companies, security
```

### Backend Assumptions

- Backend is complete and frozen at `jobboard/API_CONTRACT.md`
- All API responses wrap in `{ data: T }` envelope via `sendSuccess()`
- Pagination uses cursor-based model: `{ data: T[], nextCursor, hasNextPage }`
- Auth uses access token (in memory) + refresh token (httpOnly cookie)
- Backend auto-unwraps paginated `data` to root level via `mapPaginated()`

---

## Folder Structure

```
src/
├── app/                    # (reserved — not in use)
├── components/             # Shared UI primitives
│   ├── devtools/           # TanStack devtools
│   ├── layout/             # AppShell, Sidebar, Topbar, MobileNav, UserMenu
│   └── ui/                 # shadcn/ui primitives (button, input, dialog, etc.)
├── features/               # Feature modules (single responsibility)
│   ├── admin/              # Company-level admin
│   ├── applications/       # Application state, status machine, hooks
│   ├── auth/               # Authentication pages, hooks, API
│   ├── candidate/          # Candidate layout & dashboard
│   ├── company/            # Company admin (profile, team, settings)
│   ├── jobs/               # Job CRUD, marketplace, hooks, API
│   ├── notifications/      # Cross-role notification system
│   ├── profile/            # User profile (candidate + recruiter)
│   ├── public/             # Landing page components
│   ├── recruiter/          # Recruiter workspace
│   └── superadmin/         # Platform-level administration
├── guards/                 # Route guards (auth, role, superadmin)
├── integrations/           # Third-party integration configs (TanStack Query)
├── lib/                    # Infrastructure layer
│   ├── api/                # Backward-compat API client, endpoints, query keys
│   ├── env.ts              # Environment variables
│   └── utils.ts            # General utilities
├── providers/              # React context providers
├── routes/                 # TanStack Router route files
│   ├── __root.tsx          # App root (SEO, theme script)
│   ├── _authenticated/     # Authenticated user routes
│   │   ├── admin/          # Company admin
│   │   ├── candidate/      # Candidate portal
│   │   ├── company/        # Company settings (layout + children)
│   │   └── recruiter/      # Recruiter workspace
│   ├── _superadmin/        # SuperAdmin routes
│   │   └── superadmin/     # Dashboard, companies, users, jobs, etc.
│   ├── index.tsx           # Public landing page
│   ├── jobs.tsx            # Public job marketplace
│   ├── jobs.$jobId.tsx     # Public job detail
│   ├── login.tsx           # Auth pages
│   ├── register.tsx
│   ├── forgot-password.tsx
│   ├── reset-password.tsx
│   ├── verify-email.tsx
│   └── superadmin/login.tsx
├── shared/                 # Shared components, types, utilities
│   ├── api/client.ts       # Core apiFetch (single HTTP entry point)
│   ├── components/         # Reusable UI (dialogs, forms, tables, UX)
│   ├── hooks/              # Shared hooks (useMediaQuery)
│   ├── types/api.ts        # DTOs, error types, response envelopes
│   └── utils/              # cn(), password utilities
├── stores/                 # Zustand stores
│   ├── auth-store.ts       # User auth (in-memory only)
│   ├── superadmin-auth-store.ts
│   ├── theme-store.ts      # Theme preference (persisted)
│   ├── sidebar-store.ts    # Sidebar toggle state
│   └── saved-jobs-store.ts # Client-side saved jobs (persisted)
└── tests/                  # Test setup
```

### Feature Module Structure

Each feature follows the same internal structure:

```
features/{name}/
├── api/index.ts         # API functions (apiFetch calls)
├── components/          # Feature-specific components
├── hooks/index.ts       # TanStack Query hooks
├── pages/               # Page-level components (consumed by routes)
├── types/index.ts       # TypeScript types
├── schemas/index.ts     # Zod schemas (if forms)
├── utils/               # Feature-specific utilities
└── layout/              # Layout components (if applicable)
```

---

## Feature Architecture

### Auth (features/auth/)
- Login, Register, Forgot/Reset Password, Verify Email, Change Password
- Uses `http.get/post` with `endpoints.auth.*`
- Hooks: `useLogin`, `useRegister`, `useLogout`, `useCurrentUser`, etc.
- Auth layout has brand panel + form panel
- Access token stored in Zustand memory ONLY (no localStorage)

### Candidate (features/candidate/)
- Dashboard with profile completion %, application breakdown stats
- Uses CandidateLayout with sidebar + mobile tabs
- Hooks into jobs, applications, profile, and notifications features

### Recruiter (features/recruiter/)
- Dashboard, analytics, notifications, job detail, application detail
- Uses RecruiterLayout with sidebar navigation
- Shared recruiter components in `src/shared/components/recruiter/`

### Company Admin (features/company/)
- Dashboard, profile editing, team management, analytics, audit logs
- Uses CompanyLayout with sidebar nav + mobile tab navigation
- Team management with invite/promote/remove/transfer ownership

### SuperAdmin (features/superadmin/)
- Separate auth flow (login page, separate store, separate guard)
- Dashboard, companies CRUD, users management, jobs oversight
- Security events, ownerless companies, platform settings
- Lazy-loaded Recharts for analytics

### Shared (src/shared/)
- `api/client.ts`: Core `apiFetch<T>()` — single HTTP entry point
- `components/ux/`: LoadingState (spinner/skeleton/page variants), EmptyState, ErrorState
- `components/table/`: DataTable (TanStack Table wrapper), TablePagination, TableToolbar
- `components/dialogs/`: ConfirmDialog
- `components/forms/`: PasswordField (with strength meter)
- `components/theme/`: ThemeToggle
- `types/api.ts`: All shared DTOs, error types, pagination types
- `utils/`: cn(), password utilities

---

## API Standards

### apiFetch() — `src/shared/api/client.ts`
- **Single entry point** for all HTTP requests
- Auto-injects `Authorization: Bearer` from Zustand stores
- Auto-detects Content-Type (JSON or FormData)
- 30-second timeout via AbortController
- Auto-refresh on 401 (queue pattern prevents token stampede)
- Auto-unwraps `{ data: T }` backend envelopes
- Pagination helper: `mapPaginated<T>(response, "key")` renames `data` to feature-specific key

### Fetch Only
All HTTP uses native `fetch()`. No Axios. No direct fetch() outside apiFetch.

### Error Format
Standardized via `ApiError` (extends Error):
- `message`: string
- `status`: number (HTTP status)
- `code`: ErrorCode (VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | RATE_LIMITED | GONE | INTERNAL_ERROR | UNKNOWN_ERROR)
- `details`: ApiErrorDetail[] (field-level errors)

### Response Format
- Non-paginated: `{ data: T }` → apiFetch unwraps to `T`
- Paginated: `{ data: T[], meta: { nextCursor, hasNextPage } }` → flattened to `{ data: T[], nextCursor, hasNextPage }`

### Refresh Flow
1. Request returns 401 while token exists in store
2. Single refresh call to `/auth/refresh-token` (or `/superadmin/refresh`)
3. Concurrent requests during refresh are queued (not duplicate calls)
4. Original request retried with new token
5. On failure: store cleared, redirect to `/login`

---

## TanStack Query Standards

### Query Keys
Centralized factory in `src/lib/api/query-keys.ts` using `as const` for type safety:

```
auth      → ["auth"], ["auth", "user"]
profile   → ["profile"], ["profile", "detail"]
job       → ["jobs"], ["jobs", "list", params], ["jobs", "detail", id]
company   → ["companies"], ["companies", "current"], ["companies", "team"]
notification → ["notifications"], ["notifications", "list"]
admin     → ["admin"], ["admin", "stats"], ["admin", "users", ...]
superadmin → ["superadmin"], ["superadmin", "stats"], ["superadmin", "companies", ...]
```

### Mutations
- Use `useMutation` from TanStack Query
- Call `queryClient.invalidateQueries()` on success with precise keys
- Avoid overly broad invalidation (e.g., `queryKeys.job.all` for a single job update)

### Cache Invalidation
- Invalidate only the affected query keys
- Use the factory (`queryKeys.*`) not hardcoded arrays
- After mutations, invalidate list + detail keys for the affected entity

### Optimistic Updates
- Used where user experience benefits (e.g., status toggles)
- Always provide `onError` rollback

---

## Zustand Standards

### Store Boundaries
- Auth tokens → `auth-store.ts` / `superadmin-auth-store.ts` (in-memory)
- Theme preference → `theme-store.ts` (persisted)
- UI state → `sidebar-store.ts` (transient)
- Local-only data → `saved-jobs-store.ts` (persisted for offline-like UX)

### Key Rule
**Never store server state in Zustand.** All server-originating data flows through TanStack Query.

### Persistence
- Only `theme-store` and `saved-jobs-store` use Zustand `persist` middleware
- Auth stores explicitly do NOT persist (access token in memory only)

### Derived State
- `isAuthenticated` is derived from `accessToken` presence
- `role` is derived from `user.role`
- Both are updated atomically in store actions

---

## UI Standards

### shadcn/ui Components
Located in `src/components/ui/`. Customized for Industrial Broadsheet:
- Zero border-radius on all components
- High contrast borders (`border-(--rule)`)
- Monochrome + amber accent palette
- Form primitives use `react-hook-form` + Zod integration

### Tailwind CSS
- Primary styling system
- CSS variables for design tokens (`--background`, `--on-surface`, etc.)
- Dark mode via `dark:` class on `<html>` element
- No custom CSS classes except for design tokens and global animations

### Radix UI
- Used through shadcn/ui primitives
- Properly configured for accessibility (ARIA, keyboard nav, focus management)

### Hugeicons
- Single icon library for consistency
- Use `<HugeiconsIcon icon={...} />` pattern
- Prefer outline variants for UI, filled for active states

---

## Component Rules

### Reusable
- Components in `shared/` must be truly shared across features
- Role-specific components go in the feature's `components/` directory

### Composable
- Prefer composition over abstraction
- Do not create wrappers around native elements unless accessibility or reuse is improved

### Accessible
- Semantic HTML (nav, main, section, button)
- ARIA labels and roles
- Keyboard navigation (focus-visible outlines)
- Screen reader support (sr-only, aria-current, aria-hidden)
- Focus management in dialogs and drawers

### Loading/Empty/Error States
Every data-fetching component must handle:
- Loading → `<LoadingState variant="spinner|skeleton|page" />`
- Empty → `<EmptyState title={...} description={...} />`
- Error → `<ErrorState message={...} onRetry={...} />`

---

## Security Rules

### Token Storage
- **Access token:** Zustand in-memory only. Never in localStorage or sessionStorage.
- **Refresh token:** httpOnly cookie only. Never accessible from JavaScript.

### XSS Safety
- React's built-in escaping handles most cases
- No `dangerouslySetInnerHTML`
- No direct URL interpolation without `encodeURIComponent`
- File uploads type-checked before display

### Role Guards
- `requireAuth()` — redirects to `/login` if not authenticated
- `requireRole(roles[])` — checks auth + role match, redirects to role dashboard if unauthorized
- `requireSuperAdmin()` — separate guard for superadmin routes
- `redirectIfAuthenticated()` — for login/register pages

### Route Guards
- Applied in `beforeLoad` of route definitions
- `_authenticated` layout enforces `requireAuth` for all children
- Each role group has explicit `requireRole` guards
- SuperAdmin routes use separate `_superadmin` layout with `requireSuperAdmin`

---

## Performance Rules

### Lazy Loading
- Route-level code splitting via TanStack Router (automatic)
- Recharts lazy-loaded with `React.lazy()` + `Suspense`
- Devtools only in development

### Memoization
- Use `useMemo` for expensive computations
- Use `useCallback` for stable function references passed to child components
- Avoid premature optimization — profile first

### Virtualization
- Consider `@tanstack/virtual` for large lists (>500 items)
- Current implementation uses infinite scroll with cursor pagination

### Prefetch
- Use TanStack Query `prefetchQuery` in route loaders for critical data
- `queryClient.ensureQueryData` for data the user will likely navigate to

---

## Accessibility (WCAG AA)

- All interactive elements keyboard accessible
- Focus indicators visible (focus-visible outlines)
- ARIA landmarks (nav, main, banner)
- Form inputs have associated labels
- Error messages linked to inputs via aria-describedby
- Color contrast meets WCAG AA (minimum 4.5:1 for normal text)
- Dark and light modes both tested for contrast
- Screen reader announcements for dynamic content changes

---

## Testing

### Stack
- **Vitest** — test runner
- **MSW** — API mocking (handlers in `tests/fixtures/`)
- **React Testing Library** — component tests

### Structure
```
tests/
├── fixtures/
│   ├── handlers.ts    # MSW request handlers
│   ├── server.ts      # MSW server setup
│   └── test-utils.tsx # Test utilities
└── unit/
    ├── auth.test.ts
    ├── jobs.test.ts
    ├── profile.test.ts
    ├── company.test.ts
    ├── admin.test.ts
    └── superadmin.test.ts
```

### Coverage Expectations
- API layer: all endpoints tested (happy + error paths)
- Hooks: query/mutation behavior tested
- Components: render, interaction, edge cases
- Current: 26 tests across 6 files, all passing
