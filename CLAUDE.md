# CLAUDE.md — POSTBOARD Engineering Context

> Read this file before making any changes to the codebase.  
> It encodes critical decisions and enforces the design system contract.

---

## Project Overview

**POSTBOARD** is an industrial-broadsheet job marketplace with two user portals:
- **Candidate Portal** — browse jobs, track applications, manage saved roles
- **Recruiter Portal** — post roles, manage applicant pipeline (Kanban), view analytics

---

## Tech Stack

| Layer            | Choice                                   |
|------------------|------------------------------------------|
| Framework        | React 19 + TypeScript 5                  |
| Routing          | TanStack Router v1 (file-based)          |
| Server State     | TanStack Query v5                        |
| Forms            | React Hook Form v7 + Zod validation      |
| Drag & Drop      | dnd-kit/core + dnd-kit/sortable          |
| Styling          | Tailwind CSS v4 (CSS-first config)       |
| Charts           | Recharts (AreaChart)                     |
| Icons            | Material Symbols Outlined (Google Fonts) |
| Auth State       | Zustand v5 (in-memory only)              |
| Build            | Vite 6 + @tailwindcss/vite               |

---

## Design System Contract

### The Law of Zero Radius
**All elements use `border-radius: 0px`.**  
Only two exceptions are permitted — never add others:
1. **Badge pill** — `border-radius: 2px` (inline `style={{ borderRadius: 2 }}`)
2. **Filter pill** — `border-radius: 9999px` (inline `style={{ borderRadius: 999 }}`)

**Never add `rounded-*` Tailwind classes.** Use `rounded-none` explicitly when
overriding third-party defaults.

### Color Tokens (Tailwind class → CSS var)
```
bg-background           → #131313   (page canvas)
bg-ink                  → #0F0F0F   (surface/card bg)
bg-surface-container-lowest → #0e0e0e
border-rule             → #1A1A1A   (all borders)
bg-muted                → #2A2A2A
text-dim                → #666666
text-body               → #B8B8B8
text-on-surface         → #e5e2e1
text-press-amber        → #E8610A   (primary accent)
bg-primary-container    → #f06613   (CTA buttons)
text-live               → #22C55A
bg-live-dim             → #14532D
text-destructive        → #EF4444
```

### Typography Rules
```
font-masthead-4xl    → "Playfair Display"  — hero mastheads only
font-headline-2xl    → "Playfair Display"  — section headings
font-mono-label      → "JetBrains Mono"    — labels, badges, captions, nav
font-ui-sm/lg/xl     → "DM Sans"           — body copy, form text, descriptions
```

Labels always use: `font-mono-label text-mono-label uppercase tracking-widest`  
Body copy always uses: `font-ui-sm text-ui-sm text-body`  
Section eyebrows always use: `// PREFIX` format (the two forward-slashes are intentional)

### Spacing System
```
px-gutter   → 24px   (page horizontal gutters)
px-margin   → 32px   (outer section margins)
py-section-v-pad → 48px (vertical section padding)
```

### Sidebar Width
Fixed at `220px`. Applied as `md:pl-[220px]` on the main content wrapper.

---

## API Layer Rules

### ❌ NEVER use Axios
All HTTP calls go through `src/lib/api.ts` which uses native `fetch`.

```ts
import { api } from '@/lib/api'

// Correct
const data = await api.get<Job>('/jobs/123')
const result = await api.post<AuthResponse>('/auth/login', payload)
const updated = await api.patch<Job>('/jobs/123', { status: 'CLOSED' })
await api.delete('/jobs/123')
```

### Auth Token
- **Never** store the JWT in `localStorage` or `sessionStorage`
- Token lives only in Zustand store (`src/store/auth.ts`)
- `api.ts` reads it from the store on every request
- On 401 → store is cleared → user redirected to `/login`

---

## Route Architecture

```
/                       → Landing page (public)
/login                  → Two-panel auth
/register               → Two-panel auth
/onboarding             → Role selector
/forgot-password
/reset-password?token=
/jobs/                  → Public jobs marketplace (grid + side detail)

/_candidate             → Layout guard (JOBSEEKER role only)
  /dashboard/           → Overview + pipeline tracker
  /applications/        → My applications with status filter
  /saved/               → Bookmarked roles

/_recruiter             → Layout guard (EMPLOYER role only)
  /recruiter/           → Overview dashboard
  /recruiter/jobs/      → Listings table (CRUD)
  /recruiter/jobs/new   → Job posting form
  /recruiter/jobs/$jobId/edit
  /recruiter/jobs/$jobId/pipeline  → Kanban board
  /recruiter/analytics/
  /recruiter/talent-pool/
  /recruiter/company/new
  /recruiter/company/$companyId
```

---

## TanStack Router Notes

### Route Tree
`src/routeTree.gen.ts` is **auto-generated** by the Vite plugin.  
On `npm run dev`, the plugin watches `src/routes/` and regenerates it.  
The file committed here is a valid stub; dev server overwrites it.

### Auth Guards
Layout routes (`_candidate.tsx`, `_recruiter.tsx`) use `beforeLoad` with
`redirect()` — not middleware. Never add guards inside individual pages.

### Pathless Layout Routes
`_candidate` and `_recruiter` are pathless (no URL segment). Their children
define the full paths. This is TanStack Router v1 convention.

---

## Query Keys

All keys are defined in `src/lib/queryKeys.ts`.  
Never hardcode query key strings in components.

```ts
import { queryKeys } from '@/lib/queryKeys'

useQuery({ queryKey: queryKeys.jobs.list(params) })
useQuery({ queryKey: queryKeys.jobs.detail(jobId) })
useQuery({ queryKey: queryKeys.applications.mine })
```

---

## Component Conventions

### Icons
Use `MaterialIcon` component, not Lucide React:
```tsx
import { MaterialIcon } from '@/components/ui/MaterialIcon'
<MaterialIcon icon="arrow_forward" size={18} />
<MaterialIcon icon="check_circle" size={20} filled />
```
Icon names from: https://fonts.google.com/icons

### Section Labels (eyebrows)
```tsx
<span className="font-mono-label text-mono-label text-press-amber uppercase tracking-widest block mb-2">
  // SECTION_NAME
</span>
```

### Empty States
Always use the `EmptyState` component from `@/components/ui/Primitives`.
Never write custom empty states.

### Toasts
```tsx
const { addToast } = useToast()
addToast('Message here', 'success')  // 'success' | 'error' | 'info' | 'warning'
```

---

## File Structure

```
src/
  components/
    layout/       CandidateSidebar, RecruiterSidebar, DashboardShell, etc.
    ui/           Button, Badge, Card, FormControls, Modal, Drawer, MaterialIcon, Primitives
  features/
    auth/         AuthForms (LoginForm, RegisterForm, OnboardingRoleSelect)
    jobs/         JobComponents (JobCard, JobFilters, ApplyModal)
    pipeline/     KanbanBoard (full dnd-kit board)
    company/      CompanyComponents (CompanyCard, CompanyCreationForm)
    recruiter/    RecruiterComponents (StatTile, AnalyticsFunnel, AnalyticsLineChart, JobPostingForm)
  lib/            api.ts, queryClient.ts, queryKeys.ts
  routes/         File-based TanStack Router routes
  store/          auth.ts (Zustand)
  styles/         globals.css (Tailwind v4 @theme tokens)
  types/          index.ts (all TypeScript types)
```

---

## Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

Create a `.env.local` file at the project root. The app will not crash without
it — `api.ts` falls back to `http://localhost:3000/api`.

---

## Common Pitfalls

1. **Don't add `rounded-*` classes** — zero radius is a hard design law
2. **Don't use Axios** — native fetch only via `src/lib/api.ts`
3. **Don't store JWT in localStorage** — Zustand in-memory only
4. **Don't invent new color values** — use Tailwind tokens from `globals.css`
5. **Don't use Lucide React** — Material Symbols Outlined only
6. **Don't hardcode `font-family` inline** — use `font-mono-label`, `font-headline-2xl`, etc.
7. **Don't modify `routeTree.gen.ts`** — it is overwritten by the Vite plugin
