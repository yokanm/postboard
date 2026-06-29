# ARCHITECTURE.md

# Postboard Frontend — System Architecture

---

## 1. System Overview

Postboard is a multi-tenant recruitment platform frontend built with TanStack Start (React 19 + SSR). It serves five user personas through a single-page application with file-based routing, server-side rendering, and a strict feature-based architecture.

The frontend consumes a frozen backend API and handles all user-facing concerns: authentication, routing, state management, UI rendering, and data visualization. The backend is maintained separately and is considered immutable.

---

## 2. Frontend Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        tanstack-start                        │
│               (SSR + Client Hydration)                       │
├──────────────────────────────────────────────────────────────┤
│           TanStack Router (file-based routing)                │
│  ┌──────────┬──────────┬──────────┬──────────────────┐       │
│  │ Public   │ Auth     │ Authenticated │ SuperAdmin  │       │
│  │ (no      │ (login,  │ (candidate,   │ (separate   │       │
│  │  guard)  │ register)│  recruiter,   │  auth flow) │       │
│  │          │          │  admin, co.)  │             │       │
│  └──────────┴──────────┴──────────┴──────────────────┘       │
├──────────────────────────────────────────────────────────────┤
│                    Guards Layer                               │
│  requireAuth() | requireRole() | requireSuperAdmin()          │
├──────────────────────────────────────────────────────────────┤
│                    Features Layer                             │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐          │
│  │ Auth │Jobs  │Cand. │Recr. │Comp. │Admin │Super │          │
│  │      │      │      │      │      │      │Admin │          │
│  └──────┴──────┴──────┴──────┴──────┴──────┴──────┘          │
│  Each feature: API → Hooks → Components → Pages              │
├──────────────────────────────────────────────────────────────┤
│                    TanStack Query (server state)              │
├──────────────────────────────────────────────────────────────┤
│                    Zustand (client state)                     │
│  auth-store | theme-store | sidebar-store | saved-jobs-store  │
├──────────────────────────────────────────────────────────────┤
│                    apiFetch (single HTTP entry point)          │
│          fetch() + AbortController + auto-refresh             │
├──────────────────────────────────────────────────────────────┤
│                    Backend API (frozen)                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Feature Boundaries

Each feature is self-contained. No feature directly accesses another feature's internals.

### Feature Dependency Graph

```
auth ──────────► (no deps on other features)
jobs ──────────► auth (for authentication)
applications ──► auth, jobs
candidate ─────► auth, applications, jobs, notifications, profile
recruiter ─────► auth, applications, jobs, company
company ───────► auth
admin ─────────► auth
superadmin ────► (no deps on other features — separate auth)
profile ───────► auth
notifications ─► auth
public ────────► (no deps)
```

Cross-feature imports use the `@/features/{name}/...` alias.

---

## 4. Authentication Flow

### User Auth
1. User submits credentials → `POST /auth/login`
2. Backend returns `{ accessToken, user }` and sets `refreshToken` as httpOnly cookie
3. `accessToken` stored in Zustand `useAuthStore` (memory only)
4. On 401 response → `POST /auth/refresh-token` (cookie) → new `accessToken`
5. Concurrent 401s are queued (only one refresh at a time)
6. Refresh failure → clear store → redirect `/login`

### SuperAdmin Auth
1. Separate login page at `/superadmin/login`
2. Uses `useSuperAdminAuthStore` (separate state)
3. Separate refresh endpoint: `POST /superadmin/refresh`
4. Guard: `requireSuperAdmin()` checks SuperAdmin store

### Session Restoration
- `AuthInitializer` component mounts in `AppProvider`
- Attempts refresh on page load
- `isInitialized` flag prevents flash of unauthenticated UI

---

## 5. Request Lifecycle

```
User Action → Component → Hook (useMutation/useQuery) → 
  API Function → http helper (src/lib/api/request.ts) →
    apiFetch (src/shared/api/client.ts) → 
      Inject Authorization header → 
      AbortController timeout (30s) →
      fetch() → Backend →
      Parse response → Unwrap { data: T } →
      Return typed T →

  On 401: Queue refresh → Wait → Retry with new token →
    On refresh fail: Clear store → Redirect login

  Hook: Update cache → Invalidate related queries →
    Re-render dependent components
```

---

## 6. State Management Strategy

### Server State (TanStack Query)
- All API data
- Cache invalidation on mutations
- Background refetching with staleTime
- Infinite queries for cursor-based pagination
- Select transforms for data reshaping

### Client State (Zustand)
- Access tokens (in-memory only, never persisted)
- Theme preference (persisted to localStorage)
- Sidebar collapsed state (transient)
- Saved job IDs (persisted — client-only feature)

### Never Stored
- API responses in Zustand
- Tokens in localStorage/sessionStorage
- Authentication state in React Context

---

## 7. Routing Architecture

### Route Groups
```
__root (/)          — Shell, SEO, theme script, error/pending boundaries
├── Public          — /, /jobs, /jobs/$jobId (no guard)
├── Auth Pages      — /login, /register, /forgot-password, /verify-email (redirectIfAuthenticated)
├── _authenticated  — requireAuth layout
│   ├── /candidate/*    — requireRole(["CANDIDATE"])
│   ├── /recruiter/*    — requireRole(["RECRUITER"])
│   ├── /admin/*        — requireRole(["ADMIN","SUPERADMIN"])
│   ├── /company/*      — requireRole(["RECRUITER","ADMIN"]) on layout
│   └── /notifications  — requireAuth (cross-role)
├── _superadmin     — requireSuperAdmin layout
│   └── /superadmin/*   — 7 pages
└── /superadmin/login   — outside _superadmin (no guard needed)
```

### Guard Chain
1. Layout route's `beforeLoad` runs first
2. `requireAuth()` → redirect `/login` if not authenticated
3. `requireRole(roles[])` → calls `requireAuth()` + checks role
4. `requireSuperAdmin()` → redirect `/superadmin/login` if not SA

---

## 8. API Communication

### apiFetch Contract
```typescript
// Request
apiFetch<T>(url, {
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: BodyInit,
  superadmin?: boolean,    // flag for SuperAdmin auth
  timeout?: number,        // default 30,000ms
})

// Response (auto-unwrapped)
T  // { data: T } becomes T

// Paginated Response (auto-flattened)
{ data: T[], nextCursor: string | null, hasNextPage: boolean }

// Error
ApiError extends Error {
  message: string
  status: number
  code: ErrorCode
  details: ApiErrorDetail[]
}
```

### mapPaginated Helper
```typescript
// Backend sends: { data: JobSummary[], meta: { nextCursor, hasNextPage } }
// apiFetch flattens to: { data: JobSummary[], nextCursor, hasNextPage }
// mapPaginated renames: { jobs: JobSummary[], nextCursor, hasNextPage }
const response = await http.get<{ data: JobSummary[]; nextCursor; hasNextPage }>(url)
return mapPaginated<JobsListResponse>(response, "jobs")
```

---

## 9. Security Model

### Token Strategy
- **Access token**: Memory only (Zustand store, no persistence)
- **Refresh token**: httpOnly cookie (inaccessible to JavaScript)
- **SuperAdmin token**: Separate store, same pattern

### Route Guards
| Guard | Effect |
|-------|--------|
| `requireAuth()` | Redirects unauthenticated to `/login` |
| `requireRole([...])` | Redirects to role dashboard if wrong role |
| `requireSuperAdmin()` | Redirects to `/superadmin/login` |
| `redirectIfAuthenticated()` | Redirects logged-in users from auth pages |

### XSS Prevention
- React's automatic escaping
- No `dangerouslySetInnerHTML`
- `encodeURIComponent` for URL interpolation
- Type-checked file uploads

---

## 10. Performance Strategy

### Code Splitting
- Automatic route-level splitting via TanStack Router
- Recharts lazy-loaded with `React.lazy()` + `Suspense`
- Devtools excluded in production

### Data Fetching
- Cursor-based pagination (no offset pagination)
- Infinite scroll with `useInfiniteQuery`
- `staleTime` prevents refetch on every navigation
- `prefetchQuery` in route loaders for critical data

### Rendering
- SSR for initial page load (TanStack Start)
- Client-side hydration for interactivity
- No unnecessary re-renders with Zustand selectors
- `useCallback` for stable callback props

---

## 11. Deployment Considerations

### Build Output
- Client bundle: `dist/client/`
- Server bundle: `dist/server/`
- Single SSR entry: `dist/server/server.js`

### Environment Variables
- `VITE_API_URL`: Backend API base URL
- `VITE_APP_URL`: Application public URL (for SEO)

### SSR Notes
- Route guards skip during SSR (`typeof window === "undefined"`)
- Backend is the source of truth for authorization
- No sensitive data rendered server-side for unauthenticated users

---

## 12. Future Extensibility

### Adding a New Feature
1. Create `src/features/{name}/` with `api/`, `components/`, `hooks/`, `pages/`, `types/`
2. Add API functions using `http.get/post/etc` from `@/lib/api/client`
3. Add TanStack Query hooks using the `queryKeys` factory
4. Add page components
5. Create route file in `src/routes/_authenticated/` with proper guard
6. Run `npm run generate-routes`
7. Add tests in `tests/unit/`

### Adding a New Role
1. Add role to `UserRole` union in `src/shared/types/api.ts`
2. Add dashboard route to `getDefaultDashboardByRole()` in guards
3. Create feature module + routes
4. Add `requireRole(["NEW_ROLE"])` to route files

### Backend Contract Change
- Update types in `src/shared/types/api.ts` and feature types
- Update API functions in feature `api/` directories
- Update hooks if query key structure changes
- Update tests in `tests/fixtures/handlers.ts`
