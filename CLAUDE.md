# CLAUDE.md

# POSTBOARD Frontend Engineering Rules

## Project Context

POSTBOARD is a frontend-only application.

Backend already exists and is maintained separately.

Frontend Responsibilities:
- UI Rendering
- Routing
- Authentication Experience
- API Consumption
- State Management
- Dashboard Experiences
- Data Visualization
- Multi-Tenant User Experience

The frontend must never implement backend business logic.

---

## Architecture Principles

1. **Feature-based** — Every feature owns its API, hooks, components, pages, types, and utils in one directory under `src/features/`
2. **Single source of truth** — Server state flows through TanStack Query; client state through Zustand; never mix
3. **Route as orchestration** — Route files only import pages; no business logic in route files
4. **No direct HTTP outside apiFetch** — Every request goes through `src/shared/api/client.ts`
5. **Symmetric error handling** — All errors flow through `ApiError` type; no ad-hoc error formats

---

## Coding Standards

### Naming Conventions
- Files: `kebab-case.ts` for utilities, `PascalCase.tsx` for components, `camelCase.ts` for API/hooks
- Exports: named exports only (no default exports)
- Components: `PascalCase`
- Functions: `camelCase`
- Types/Interfaces: `PascalCase`
- Hooks: `use*` prefix
- Query keys: factory pattern (`queryKeys.job.detail(id)`)
- Stores: `use*Store` pattern

### Folder Conventions
```
features/{name}/
├── api/index.ts        — feature API functions
├── components/         — feature components
├── hooks/index.ts      — TanStack Query hooks
├── pages/              — page-level components
├── types/index.ts      — TypeScript types
├── schemas/index.ts    — Zod schemas
├── utils/              — utilities
└── layout/             — layout components
```

### Imports
- Use `@/` alias for all source imports (e.g., `@/features/auth/hooks`)
- Use `#/` alias for deep imports from src root (e.g., `#/shared/api/client`)
- Feature imports from other features: `@/features/{name}/...`
- Never import from `../../` relative paths (use aliases)
- Barrel files (`index.ts`) at each directory level

---

## React Best Practices

- Components are functions (no classes except ErrorBoundary)
- Props are typed with interfaces
- Destructure props in function signature
- Use `useMemo` / `useCallback` intentionally (not prophylactically)
- No `dangerouslySetInnerHTML`
- No inline styles (use Tailwind classes)
- Event handlers use `useCallback` when passed as props
- Prefer composition over inheritance
- Every data-fetching component handles loading, empty, and error states

---

## TanStack Query Patterns

### Query Keys
Always use the factory from `src/lib/api/query-keys.ts`:
```typescript
// ✅ Correct
queryKeys.job.detail(id)
queryKeys.job.list(params)

// ❌ Wrong
["jobs", id]
```

### Mutations
```typescript
// ✅ Pattern
export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateCompanyInput) => updateCompany(input),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.company.current() })
    },
  })
}
```

### Infinite Queries
Use cursor-based pagination with `useInfiniteQuery`:
```typescript
export function useJobs(params?: ListJobsParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.job.list(params as Record<string, unknown>),
    queryFn: ({ pageParam }) =>
      listJobs({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  })
}
```

### Cache Invalidation
- Invalidate only affected keys
- Use factory (`queryKeys.*`), not literal arrays
- Invalidate list + detail for mutations

### Stale Time
- Default: 0ms (refetch on mount)
- Auth user: 5 minutes
- Tags: 10 minutes
- Dashboard stats: 60 seconds
- List queries: 30 seconds minimum

---

## Fetch Client Usage

### apiFetch
- Single entry point: `src/shared/api/client.ts`
- All HTTP goes through this file
- Auto-injects `Authorization: Bearer` from Zustand
- Auto-unwraps `{ data: T }` envelope
- 30-second timeout via AbortController
- Auto-refresh on 401 with queue pattern

### Legacy http object
- Backward-compatible wrapper: `src/lib/api/request.ts`
- Still used by all feature API files
- Delegates to `apiFetch` internally
- New code should import from `#/shared/api/client` directly

### mapPaginated
- Helper to rename `data` to feature-specific key
- Usage: `mapPaginated<JobsListResponse>(response, "jobs")`

---

## State Management

### Zustand — Client State Only
```
auth-store.ts               → access token (memory only)
superadmin-auth-store.ts    → superadmin access token (memory only)
theme-store.ts              → theme preference (persisted)
sidebar-store.ts            → sidebar toggle (transient)
saved-jobs-store.ts         → saved job IDs (persisted, client-only)
```

### TanStack Query — Server State
- All API data
- Auth user profile
- Jobs, applications, companies
- Notifications, analytics
- Admin/superadmin data

### Never
- Store API responses in Zustand
- Store tokens in localStorage/sessionStorage
- Use React Context for global state

---

## Error Handling

### ApiError Shape
```typescript
{
  message: string
  status: number
  code: ErrorCode
  details: Array<{ field: string; message: string }>
}
```

### Error Handling Pattern
```typescript
try {
  await someApiFunction()
} catch (error) {
  if (isApiRequestError(error)) {
    toast.error(error.message)
  }
}
```

### Error States
- **ErrorState component**: used for inline errors with retry
- **ErrorBoundary**: class component wrapping route trees
- **Route errorComponent**: route-level error handling
- **Toast**: used for mutation errors

---

## Testing Rules

- New API functions need test coverage
- New hooks need test coverage
- Tests use MSW for API mocking
- Test files go in `tests/unit/`
- MSW handlers in `tests/fixtures/handlers.ts`
- Run: `npm test` (vitest)
- All 26 tests must pass before committing

---

## Performance Expectations

- Route-level code splitting (TanStack Router auto)
- Recharts lazy-loaded with `React.lazy()` + Suspense
- List staleTime >= 30s to avoid refetch on navigation
- No unnecessary re-renders (use selectors in Zustand)
- Infinite scroll with cursor pagination (no offset-based)
- Devtools stripped in production builds

---

## Refactoring Rules

- DRY: Deduplicated code must be centralized in `shared/` or the owning feature
- Dead code: Remove unused exports, parameters, and files
- Feature boundaries: Role-specific code stays in the feature; shared code goes to `shared/`
- Consistency: Follow existing patterns (same file structure, same import style)
- TypeScript: No `any` without justification; prefer `unknown` + type guards

---

## Do/Don't Examples

### DO
- Import from `@/features/applications/hooks` for application hooks
- Use `queryKeys.*` factory for all query key references
- Handle loading/empty/error states in every data component
- Use `mapPaginated` for paginated API responses
- Type all props with interfaces

### DON'T
- Import application hooks from `@/features/jobs/hooks` (duplicated — use applications feature)
- Use literal arrays for query key invalidation
- Use `any` casts (use `unknown` + type guards instead)
- Store API data in Zustand
- Import from relative paths crossing feature boundaries (use `@/` alias)
- Write page components in `components/` directories — use `pages/`

---

## Project Commands
- `npm run dev` — Start dev server (port 3000)
- `npm run build` — Production build
- `npm test` — Run test suite
- `npm run generate-routes` — Regenerate route tree after adding route files
- `npm run check` — Biome lint + format check
- `npx tsc --noEmit` — TypeScript type check
