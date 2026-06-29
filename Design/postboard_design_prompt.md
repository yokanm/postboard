# POSTBOARD — Multi-Tenant Job Board
## Complete Design System & Surface Prompt

---

## 01 · Project Intent

POSTBOARD is a multi-tenant job board platform with four distinct role contexts:
public visitors, candidates, recruiters, and super admins. The visual language must
make each context feel like a natural escalation of the same typographic system —
not a role-switch with a different theme. Think of it as a newspaper that also
runs its own printing press and classifieds desk.

**Primary reference synthesis:**
- From Langbase: the `//section-label` convention as structural wayfinding; iridescent
  gradient chips/tiles as data objects rather than decorative fills; pure black ground.
- From Mastra.ai: organic 3D accent forms used exactly once (hero only); green neon
  for active/live state; modular feature grid at medium density.
- From HydraDB: amber-orange as the primary brand accent; pixel/bitmap textures as
  micro-surface detail; stat callouts with oversized numerals and tight labels; the
  "brain" metaphor replaced here with "the press."

---

## 02 · Design Tokens

### Color

```
--black:        #080808   // page ground
--ink:          #0F0F0F   // card/surface ground
--rule:         #1A1A1A   // hairline dividers, borders
--muted:        #2A2A2A   // disabled states, ghost inputs
--dim:          #666666   // tertiary labels, metadata
--body:         #B8B8B8   // body copy
--headline:     #F0EDE6   // headlines, high-contrast labels  (warm off-white, not pure)
--accent:       #E8610A   // primary brand — amber press ink  (ref: HydraDB orange)
--accent-dim:   #7A3205   // hover state, pressed fills
--live:         #22C55A   // active/live badge — "press running"  (ref: Mastra green)
--live-dim:     #14532D   // live state backgrounds
--gradient-a:   #C084FC   // iridescent chip gradient stop A  (ref: Langbase)
--gradient-b:   #60A5FA   // iridescent chip gradient stop B
--gradient-c:   #34D399   // iridescent chip gradient stop C
--gradient-d:   #F59E0B   // iridescent chip gradient stop D
--destructive:  #EF4444   // error, reject actions
```

### Typography

**Display face:** `"Playfair Display"` (serif, variable weight 700–900)
→ Used exclusively for page-level headlines, hero counts, and section openers.
  Never body. Never UI labels. Feels like broadsheet masthead type.

**Editorial face:** `"DM Sans"` (geometric sans, 300–700)
→ All UI body copy, card text, metadata, form labels, nav items. The workhorse.

**Monospace:** `"JetBrains Mono"` (or `"IBM Plex Mono"`)
→ Job IDs, audit log entries, timestamps, code-adjacent data, section labels
  in `//slug` format. This typeface is the editorial voice of the system layer.

**Type Scale:**
```
--text-xs:    11px / 1.4  / JetBrains Mono  — metadata, timestamps, log entries
--text-sm:    13px / 1.5  / DM Sans         — secondary labels, nav, badges
--text-base:  15px / 1.6  / DM Sans         — body copy
--text-lg:    18px / 1.5  / DM Sans 600     — card titles, section intros
--text-xl:    24px / 1.3  / DM Sans 600     — subheadings
--text-2xl:   32px / 1.2  / Playfair 700    — section headlines
--text-3xl:   48px / 1.1  / Playfair 800    — hero sub-line
--text-4xl:   64-96px     / Playfair 900    — masthead, stat callouts
```

### Spacing System
4px base unit. All spacing in multiples: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

### Border Radius
```
--radius-none:  0px     // primary card language — zero radius everywhere
--radius-sm:    2px     // only for badges and inline chips
--radius-pill:  999px   // only for tag/category pills
```
The design is **zero-radius dominant**. This is intentional and enforced.

### Grid
- Max-width container: 1280px
- Public/marketing surfaces: 12-col at desktop, 4-col at mobile
- Dashboard surfaces: sidebar (220px fixed) + 12-col main
- Column gap: 24px

---

## 03 · Signature Element

**The Press Grid** — used only on the public landing hero and empty states.

A 6×4 grid of small rectangular tiles (each ~80×48px), tightly packed with zero
gap between them. Each tile is filled with a short, random-looking iridescent
gradient (cycling through `--gradient-a` through `--gradient-d`), simulating a
composited newspaper print plate. On hover, individual tiles briefly invert to
`--ink` revealing a single character of a hidden word in `JetBrains Mono`.

This single interaction gesture is the one memorable animation in the system.
It appears on: the public landing hero background (full-width bleed, below the
masthead), and the empty state for a recruiter's unpublished job board.
Nowhere else.

---

## 04 · Global UI Patterns

### Section Labels
All major content sections open with a label line in `JetBrains Mono --text-xs
--dim uppercase tracking-widest`:
```
// open_roles        // your_applications       // audit_log
// company_roster    // pipeline                // platform_health
```
These appear flush-left, above every `<h2>` on the page. No decorative marks
other than the `//` prefix. This is the Langbase `//command` convention adapted
to POSTBOARD's domain.

### Cards
All cards: `background: --ink`, `border: 1px solid --rule`, `border-radius: 0`.
No shadows. Hover state: `border-color: --accent`. Active/selected:
`border-left: 3px solid --accent` (left rail highlight only, no full border change).

### Badges / Status Pills
`border-radius: --radius-pill`, `font: --text-xs JetBrains Mono uppercase`.
Status vocabulary:
```
OPEN       → --live background --live-dim, text --headline
CLOSED     → --muted background, text --dim
DRAFT      → --rule background, text --dim  (dashed border)
APPLIED    → --accent-dim background, text --accent
REVIEWING  → purple tint (#3B1F6E bg, #A78BFA text)
REJECTED   → --destructive-dim bg, --destructive text
HIRED      → --live bg, --black text
```

### Dividers
`border-top: 1px solid --rule` only. Never decorative dividers. Horizontal rules
between table rows and card stacks are `--rule`. Section dividers inside
dashboards use a full-bleed hairline with `padding: 48px 0` above and below.

### Notification Bell (Global)
Fixed top-right. Filled amber dot indicator when unread count > 0.
Polling interval: 30 seconds, via `setInterval` + REST fetch.
On new notification arrival: the bell icon subtly scales (1 → 1.15 → 1) once,
no bounce, no sound. Dropdown reveals notifications in a `--ink` panel,
`border: 1px solid --rule`, scrollable list, each item with:
- `//type` label in mono (e.g. `// new_applicant`, `// job_expired`)
- Headline in `--text-sm DM Sans`
- Timestamp in `--text-xs --dim`
- Unread items get `border-left: 2px solid --accent`

---

## 05 · Public Surfaces

### 05-A · Landing Page

**Masthead / Hero (full viewport height)**
- Background: `--black` with The Press Grid at 30% opacity behind content.
- Centered layout, max-width 680px.
- Eyebrow label: `// find_your_next_role` in mono, `--dim`.
- Headline: `"The Board."` in Playfair 900, `--headline`, ~96px. Single word.
  Below it on a new line: `"Where serious companies post."` in Playfair 400
  italic, ~32px, `--body`.
- CTA row: Primary button `[Browse Roles]` in `--accent` bg, `--black` text,
  0 radius, 48px height, DM Sans 600. Secondary ghost button `[Post a Job]`
  with `border: 1px solid --rule`, `--body` text. 16px gap between them.
- Below CTAs: A single row of 6 grayscale company logo lockups (`--dim` filtered),
  labeled with `// trusted_by` in mono above them.
- Sticky on scroll: minimal header bar — POSTBOARD wordmark (Playfair 700, 16px)
  left, `[Sign In]` + `[Post a Job]` right. Background `--black` at 90% opacity,
  `border-bottom: 1px solid --rule`. No blur/frosted glass.

**Stats Bar**
Full-bleed band, `--ink` background, `border-top/bottom: 1px solid --rule`.
3 stats laid out in equal thirds:
```
  8,400+          142             72hrs
  Open Roles      Companies       Avg. Time to Hire
```
Numbers in Playfair 800 `--accent` ~48px. Labels in mono `--dim` --text-xs.
Dividers between columns: `1px solid --rule`.

**Feature Sections** (3 sections, alternating text-left / text-right)
Each section:
- `//section_label` opener in mono
- `<h2>` in Playfair 700 ~32px
- 2–3 sentence description in DM Sans `--body`
- Right or left: a composited UI preview panel (dark mockup screenshot or
  illustrated UI, inside a `border: 1px solid --rule` frame, 0 radius)

Section 1: `// for_candidates` — smart applications, status tracking
Section 2: `// for_recruiters` — pipeline, kanban, applicant management
Section 3: `// for_teams`     — multi-seat, audit trail, role permissions

**CTA Footer Band**
Black ground. Centered.
Playfair 900 italic: `"Ready to hire?"` ~64px.
Subline in DM Sans: "Post your first role in under 3 minutes."
`[Get Started]` button. Accent filled.

---

### 05-B · Jobs Marketplace (`/jobs`)

**Page Header**
`// open_roles` label. `<h1>` in Playfair 700: `"All Roles"`.
Right-aligned: total count badge `[8,412 roles]` in mono pill, `--muted` bg.

**Filter Bar** (sticky, below header, full-width)
Horizontal scrollable pill row: Role Type, Location, Experience, Salary Range,
Remote Only toggle. All pills in `border: 1px solid --rule`, 0 radius on desktop
(pill radius on mobile). Active filter: `--accent` border + amber text.
Right side: `[Sort: Newest ↓]` dropdown in mono.

**Job Card Grid** (2-col desktop, 1-col mobile)
Each card:
```
┌──────────────────────────────────────┐
│ [Company Logo 32px]  Company Name    │
│                      // location     │
│                                      │
│ Role Title (DM Sans 600, --headline) │
│                                      │
│ [FULL-TIME] [REMOTE] [REACT]         │
│                                      │
│ $80k–$110k              3 days ago   │
└──────────────────────────────────────┘
```
Cards in `--ink`, `border: 1px solid --rule`. Hover: left-rail amber accent.
Click navigates to Job Detail. No modal previews.

**Pagination**
Simple: `← Prev  Page 2 of 47  Next →` in mono, centered, `--dim`.

---

### 05-C · Job Detail (`/jobs/[slug]`)

**Two-column layout** (desktop): 8-col main + 4-col sidebar.

**Main (left)**
- Back link: `← All Roles` in mono `--dim --text-xs`.
- Role title: Playfair 700 ~40px.
- Company + location row: DM Sans, company name in `--accent`.
- Badge row: status, type, location, salary.
- Horizontal rule.
- Body sections with `//` label openers:
  `// about_the_role`, `// responsibilities`, `// requirements`, `// nice_to_have`
  Each in DM Sans `--body` 15px. Max-width 640px for readability.

**Sidebar (right)**
Sticky card (`--ink`, `border: 1px solid --rule`):
- `[Apply Now]` button — full-width, `--accent` bg, 0 radius, 48px.
- If already applied: status chip `APPLIED` replacing button.
- Divider then: Company card — logo, name, size, industry, `[View Company]` link.
- Below: `// similar_roles` — 3 compact role links in mono.

---

## 06 · Candidate Surfaces

### 06-A · Auth (`/login`, `/register`)

**Split layout**: left 50% brand panel, right 50% form panel.

Left panel: `--black` bg. The Press Grid at 20% opacity. Centered:
POSTBOARD wordmark in Playfair 800 ~48px. Tagline below: `"Work, printed daily."`

Right panel: `--ink` bg, `border-left: 1px solid --rule`.
Form fields: `--black` bg inputs, `border: 1px solid --rule`, 0 radius, 44px height,
`--body` text, `--dim` placeholder. Focus: `border-color: --accent`.
Error state: `border-color: --destructive` + inline error below in `--text-xs --destructive`.

Register: Name, Email, Password, Role selector (Candidate / Recruiter as two
toggle cards — selecting one highlights it with `border: 2px solid --accent`).

---

### 06-B · Candidate Dashboard (`/dashboard`)

**Shell**
Left sidebar 220px, fixed:
- POSTBOARD wordmark top.
- Nav items: Overview, My Applications, Saved Roles, My Profile.
- Active item: `background: --muted`, `border-left: 2px solid --accent`.
- Bottom: user avatar + name + `[Sign Out]`.

**Overview page**
`// your_overview` label, first name greeting in Playfair 700.

Stat row (4 tiles, `--ink`, `border: 1px solid --rule`):
```
  12          3           1           87%
  Applied    Reviewing   Interview   Profile complete
```
Numbers in Playfair 800 `--accent`. Labels mono `--dim`.

Below: `// recent_activity` — vertical timeline of application events:
`● Applied to Senior Frontend Eng @ Stripe  –  2 days ago`
Timeline connector: `1px solid --rule` vertical line, dots in `--accent`.

---

### 06-C · Applications (`/dashboard/applications`)

`// my_applications` label. Filter tabs: All · Active · Archived.

**Application list** (single column)
Each row card:
```
┌──────────────────────────────────────────────────┐
│ Role Title               [REVIEWING]             │
│ Company · Location                               │
│ Applied Jan 14 · 2025          [Withdraw] [View] │
└──────────────────────────────────────────────────┘
```
Status badge color per vocabulary above.
`[Withdraw]` is ghost destructive. `[View]` navigates to job detail.

---

### 06-D · Profile (`/dashboard/profile`)

Two-panel form layout. Left: avatar upload + display name + contact info.
Right: `// skills`, `// experience`, `// portfolio_links`.

Skills: free-entry tag input. Tags render as `border: 1px solid --rule` pill chips
in mono `--text-xs`. Remove on ×.

Profile completeness bar: `background: --muted`, filled `--accent`, 4px height,
0 radius. Percentage label in mono above right.

---

## 07 · Recruiter Surfaces

### 07-A · Recruiter Dashboard (`/recruiter`)

Same sidebar shell, recruiter nav:
Overview, Post a Job, My Jobs, Pipeline, Company Profile.

**Overview stat tiles (6 tiles):**
```
  Active Jobs    Total Applicants    New This Week
  Avg. Time      Hired (30d)         Pipeline Health
```
"Pipeline Health" tile uses a small inline horizontal bar chart (pure CSS,
`--accent` fill) to show pipeline stage distribution. No chart libraries on
this tile — it's decorative at this scale.

**Quick actions bar:**
`[+ Post New Role]` — accent filled button.
`[View All Applicants]` — ghost button.

---

### 07-B · Job Management (`/recruiter/jobs`)

`// my_jobs` label. Filter tabs: Active · Draft · Closed · Archived.

**Job table** (full-width, no card wrapper — table directly on `--black`):
```
  Role Title         Status      Applicants    Views    Posted       Actions
  ──────────────────────────────────────────────────────────────────────────
  Sr. Frontend Dev   [OPEN]      42            1.2k     Jan 10       ⋯
  Product Designer   [DRAFT]     —             —        —            ⋯
```
Table rows: `border-bottom: 1px solid --rule`. Hover: `background: --ink`.
Actions `⋯` opens a context menu: Edit, Close, Duplicate, Delete.

**Post / Edit Job Form** (`/recruiter/jobs/new` or `/recruiter/jobs/[id]/edit`)
Single-column, max-width 720px, centered.
Sections with `//` labels: `// basics`, `// description`, `// requirements`,
`// compensation`, `// visibility`.
Compensation: dual input (min/max salary) with a toggle `[Show salary publicly]`.
Visibility: `[Public]` / `[Unlisted]` / `[Draft]` as three horizontal toggle cards.
Bottom: `[Save Draft]` ghost + `[Publish Role]` accent filled. Publish triggers
a confirmation modal (see modal spec below).

---

### 07-C · Applicant Pipeline — List View (`/recruiter/pipeline`)

**Stage tabs** (horizontal, full-width):
```
  Applied (24) | Reviewing (11) | Interview (5) | Offer (2) | Hired (1) | Rejected (8)
```
Active tab: amber underline `border-bottom: 2px solid --accent`, `--headline` text.

**Applicant row card:**
```
┌────────────────────────────────────────────────────────────────────┐
│ [Avatar]  Candidate Name         Applied Role                      │
│           Location · Portfolio ↗  Applied Jan 12                  │
│                                  [Move to Reviewing ↓] [Reject]   │
└────────────────────────────────────────────────────────────────────┘
```
`[Move to ...]` is a dropdown select. `[Reject]` is ghost destructive.
Click row body → opens candidate detail side drawer.

**Candidate Detail Drawer**
Slides in from right, 480px width. Overlay dims main at `rgba(0,0,0,0.6)`.
Content: name, contact, skills chips, resume link, application note textarea,
stage selector, `[Send to Offer]` + `[Reject]` actions at bottom.

---

### 07-D · Applicant Pipeline — Kanban View (`/recruiter/pipeline?view=kanban`)

View toggle: `[≡ List]` `[⊞ Kanban]` — mono labels, toggle button group,
active state filled `--muted`.

**Kanban board:**
5 columns (Applied, Reviewing, Interview, Offer, Hired).
Horizontal scroll on desktop overflow. Each column:
- Column header: `//stage_name` mono label + count badge.
- Cards: `--ink` bg, 280px width, `border: 1px solid --rule`.
  Drag-and-drop via pointer events (no library required — native HTML5 DnD or
  custom `onDragStart`/`onDrop`). Drop target column: `border: 1px dashed --accent`.
  Card content: avatar + name + role + applied date.
- Column footer: `[+ Add Candidate]` ghost button in mono `--dim`.

Rejected column hidden by default. Toggle: `[Show Rejected]` text link in mono.

---

## 08 · Super Admin Surfaces

Admin shell: slightly different sidebar skin — `--ink` sidebar bg replaces
transparent sidebar, red/amber accent label at top reads `// admin_mode` in mono.

### 08-A · Admin Dashboard (`/admin`)

Platform-wide stat grid (8 tiles). Top-4 use large Playfair numerals + mono labels.
Bottom-4 use small bar/line sparklines (pure CSS or an SVG path — no chart libs).

Stats: Total Users, Total Companies, Active Jobs, Applications (30d),
Revenue (if billing is in scope), Avg. Jobs/Company, Flagged Content, Uptime.

**System health row:**
Horizontal band, `--ink`, `border: 1px solid --rule`.
`// system_status` label. Green dot for each service: API, DB, Email, Jobs Queue.
Dot: 8px circle, `--live` bg. Offline: `--destructive`.

---

### 08-B · Users (`/admin/users`)

**Search + filter bar**: text search input + Role filter (All / Candidate /
Recruiter / Admin) + Status filter (Active / Suspended).

**Users table:**
```
  Name          Email               Role         Status      Joined       Actions
  ─────────────────────────────────────────────────────────────────────────────
  Ada Okonkwo   ada@stripe.com      Recruiter    [ACTIVE]    Jan 3, 25    ⋯
  Yemi Adeyemi  yemi@dev.io         Candidate    [ACTIVE]    Jan 5, 25    ⋯
```
Actions `⋯` context menu: View Profile, Suspend, Delete.
Suspend action: shows inline confirmation toast. No modal for destructive
actions at row level (low risk). Delete does require modal confirmation.

---

### 08-C · Companies (`/admin/companies`)

Same table pattern. Columns: Company Name, Plan, Job Count, Users, Joined, Status.
Row expand (chevron) reveals company quick stats inline below row — no separate page.
Actions: View, Suspend, Delete.

Filter bar adds: Plan tier filter (Free / Pro / Enterprise).

---

### 08-D · Audit Logs (`/admin/audit-logs`)

`// audit_log` label. Full-width, dense, monospace-dominant table.

```
  TIMESTAMP          ACTOR               ACTION                  RESOURCE
  ────────────────────────────────────────────────────────────────────────
  2025-01-14 09:34   admin@postboard.io  job.status.updated      JOB#48291
  2025-01-14 09:12   ada@stripe.com      applicant.stage.moved   APP#91022
  2025-01-14 08:55   yemi@dev.io         profile.updated         USR#30012
```
All four columns in `JetBrains Mono --text-xs`. Row height: 40px.
`border-bottom: 1px solid --rule`. No hover fill — only cursor change.
Resource column: `--accent` colored link.

Filter bar: Date range picker + Actor search + Action type multi-select.
Pagination: `← Prev  Showing 1–50 of 2,841  Next →`.

---

## 09 · Modals

All modals:
- Centered, `--ink` bg, `border: 1px solid --rule`, `0` border-radius, max-width 480px.
- Backdrop: `rgba(0,0,0,0.7)`.
- Header: `//action_name` mono label + `×` dismiss.
- Destructive confirmation: red text `"This cannot be undone."` in `--text-xs --destructive`.
- Action row: `[Cancel]` ghost + `[Confirm]` filled (accent or destructive per context).
- No animation on open. Simple opacity fade-in 120ms.

---

## 10 · Empty States

Each empty state uses a miniature Press Grid (3×2 tiles, ~200px wide, centered)
above a two-line message:
- Line 1: DM Sans 600 `--body` — what's missing.
- Line 2: DM Sans `--dim` — what to do.
- CTA if applicable: ghost button below.

Examples:
```
  No roles posted yet.
  Press your first listing to reach candidates.
  [Post a Role]

  No applications yet.
  Roles you apply to will appear here.
  [Browse Open Roles]
```

---

## 11 · Notification Polling Spec

- **Interval**: 30 seconds via `setInterval`.
- **Endpoint**: `GET /api/notifications?since={lastFetchTimestamp}` returning
  `{ count: number, items: Notification[] }`.
- **Behavior on new items**: Bell icon scale pulse (1 × 120ms). Unread dot appears.
  No toast. No alert. No sound.
- **Dropdown fetch**: Triggered on bell click, separate from polling.
  Loading state: skeleton rows (3 rows, `--muted` bg animated shimmer).
- **Mark all read**: `[Mark all read]` link in mono above list.
  Optimistic UI: unread dots clear immediately, API call fires async.
- **Error state**: Bell dot stays amber, no crash. Silent retry on next poll.

---

## 12 · Motion Constraints

One rule: **motion must encode meaning, not decorate.**

Permitted animations:
- Press Grid hover (tile invert): 80ms ease-out per tile
- Notification bell scale pulse: 120ms ease
- Sidebar active item: `background` transition 80ms
- Drawer slide-in: `transform: translateX` 200ms ease-out
- Modal backdrop + content: `opacity` 120ms ease

Not permitted:
- Page transition animations
- Entrance animations on list items (no staggered fade-ins)
- Parallax on landing
- Lottie or video backgrounds
- Skeleton shimmer on anything except notification dropdown

`prefers-reduced-motion`: All animations disabled. Instant state changes only.

---

## 13 · Responsive Behavior

**Breakpoints**: sm 640px · md 768px · lg 1024px · xl 1280px

- Sidebar collapses to bottom nav (5 icons, labeled) below 768px.
- Job card grid: 2-col → 1-col at 640px.
- Kanban board: horizontal scroll on touch, snap to column.
- Stats tiles: 4-col → 2-col → 1-col at sm.
- Tables: horizontal scroll wrapper below 768px, sticky first column.
- Job detail: sidebar stacks below main on mobile; sticky CTA becomes
  fixed bottom bar with `[Apply Now]`.

---

## 14 · What This Design Is Not

- Not a Tailwind UI starter. Zero template components.
- Not SaaS blue. The accent is amber press ink, not trust blue.
- Not rounded-corner card soup. Border-radius is 0 everywhere except pills.
- Not Framer-animated. Motion is sparse and purposeful.
- Not a dark mode toggle. The product is dark-only. There is no light mode.

---

*POSTBOARD — "Work, printed daily."*
