# DESIGN.md

# Postboard

## Frontend Architecture & Design System

Version: 2.0

---

# 1. Product Vision

## Platform Overview

PostBoard is a multi-tenant recruitment platform combining:

* Public Job Marketplace
* Candidate Portal
* Recruiter Workspace
* Platform Administration

The platform is designed for:

* Technical hiring
* Enterprise recruitment
* Talent operations
* Workforce intelligence
* Multi-company hiring workflows

---

## Experience Principles

The experience should feel closer to:

* Linear
* Vercel
* Notion
* Bloomberg Terminal
* Modern operational software

Than:

* Traditional job boards
* Generic SaaS dashboards
* Consumer-focused marketplaces

Priorities:

1. Information Density
2. Operational Efficiency
3. Technical Transparency
4. Fast Navigation
5. Enterprise Scalability

---

# 2. Technology Stack

## Core Framework

* TanStack Start
* React
* TypeScript

---

## Routing

* TanStack Router

---

## Server State

* TanStack Query

---

## Tables

* TanStack Table

---

## UI

* Radix UI
* shadcn/ui

---

## Styling

* Tailwind CSS

---

## Forms

* React Hook Form
* Zod

---

## Charts

* Recharts

---

## Client State

* Zustand

---

## API

* Native Fetch API

---

# 3. Architectural Constraints

## Forbidden Technologies

Do not introduce:

* Axios
* Lucide Icons
* Redux
* MobX
* Chakra UI
* Material UI
* Styled Components

Without architectural approval.

---

## Backend Ownership

Backend already exists.

Frontend acts only as:

* Consumer
* Presenter
* Orchestrator

Frontend must never duplicate backend business logic.

---

# 4. Design Language

## Industrial Broadsheet

The official design system.

Core Traits:

* Editorial
* Technical
* Brutalist
* Enterprise
* High Density
* Data-Centric

Avoid:

* Glassmorphism
* Neumorphism
* Soft Shadows
* Oversized Cards
* Excessive White Space
* Rounded SaaS Aesthetics

---

## Key Attributes

* Zero Radius Geometry
* Editorial Hierarchy
* Technical Metadata Visibility
* Monochromatic Structure
* System Transparency
* Operational Density

---

# 5. Design Tokens

[KEEP ALL COLOR TOKENS FROM CURRENT DESIGN]

* Surface System
* Text System
* Primary System
* Secondary System
* Tertiary System
* Error System
* Fixed Colors
* Structural Colors
* Status Colors
* Data Gradient Palette

No modifications.
# Design Tokens

## Colors

### Surface System

| Token                     | Value   |
| ------------------------- | ------- |
| surface                   | #131313 |
| surface-dim               | #131313 |
| surface-bright            | #3a3939 |
| surface-container-lowest  | #0e0e0e |
| surface-container-low     | #1c1b1b |
| surface-container         | #201f1f |
| surface-container-high    | #2a2a2a |
| surface-container-highest | #353534 |

### Text System

| Token              | Value   |
| ------------------ | ------- |
| on-surface         | #e5e2e1 |
| on-surface-variant | #e1c0b2 |
| on-background      | #e5e2e1 |
| body               | #B8B8B8 |
| dim                | #666666 |

### Primary System

| Token                | Value   |
| -------------------- | ------- |
| primary              | #ffb694 |
| on-primary           | #571f00 |
| primary-container    | #f06613 |
| on-primary-container | #4c1a00 |
| inverse-primary      | #a14000 |
| surface-tint         | #ffb694 |

### Secondary System

| Token                  | Value   |
| ---------------------- | ------- |
| secondary              | #c9c6c0 |
| on-secondary           | #31312c |
| secondary-container    | #474742 |
| on-secondary-container | #b7b5af |

### Tertiary System

| Token                 | Value   |
| --------------------- | ------- |
| tertiary              | #c8c6c5 |
| on-tertiary           | #313030 |
| tertiary-container    | #929090 |
| on-tertiary-container | #2a2a29 |

### Error System

| Token              | Value   |
| ------------------ | ------- |
| error              | #ffb4ab |
| on-error           | #690005 |
| error-container    | #93000a |
| on-error-container | #ffdad6 |

### Fixed Colors

| Token                      | Value   |
| -------------------------- | ------- |
| primary-fixed              | #ffdbcc |
| primary-fixed-dim          | #ffb694 |
| on-primary-fixed           | #351000 |
| on-primary-fixed-variant   | #7b2f00 |
| secondary-fixed            | #e5e2db |
| secondary-fixed-dim        | #c9c6c0 |
| on-secondary-fixed         | #1c1c18 |
| on-secondary-fixed-variant | #474742 |
| tertiary-fixed             | #e5e2e1 |
| tertiary-fixed-dim         | #c8c6c5 |
| on-tertiary-fixed          | #1c1b1b |
| on-tertiary-fixed-variant  | #474646 |

### Structural Colors

| Token           | Value   |
| --------------- | ------- |
| background      | #131313 |
| surface-variant | #353534 |
| rule            | #1A1A1A |
| muted           | #2A2A2A |
| outline         | #a88a7e |
| outline-variant | #594237 |

### Status Colors

| Token       | Value   |
| ----------- | ------- |
| live        | #22C55A |
| live-dim    | #14532D |
| destructive | #EF4444 |

### Data Gradient Palette

| Token      | Value   |
| ---------- | ------- |
| gradient-a | #C084FC |
| gradient-b | #60A5FA |
| gradient-c | #34D399 |
| gradient-d | #F59E0B |

---

# 6. Typography System

## Font Families

### Primary Serif

Playfair Display

Used for:

* Landing page mastheads
* Hero statistics
* Editorial section titles
* Marketing content

### Primary Sans

DM Sans

Used for:

* Application UI
* Forms
* Tables
* Navigation
* Buttons

### Technical Mono

JetBrains Mono

Used for:

* Metadata
* IDs
* Audit logs
* Timestamps
* Technical labels
* Section wayfinding

All technical section labels must use:

```text
// SECTION_NAME
```

Examples:

```text
// PIPELINE_STATUS
// AUDIT_LOG
// APPLICATION_QUEUE
```

---

## Typography Scale

### Masthead 4XL

* Font: Playfair Display
* Size: 96px
* Weight: 900
* Line Height: 1.1
* Letter Spacing: -0.04em

### Headline 2XL

* Font: Playfair Display
* Size: 32px
* Weight: 700
* Line Height: 1.2

### Headline 2XL Mobile

* Font: Playfair Display
* Size: 24px
* Weight: 700
* Line Height: 1.2

### UI XL

* Font: DM Sans
* Size: 24px
* Weight: 600
* Line Height: 1.3

### UI LG

* Font: DM Sans
* Size: 18px
* Weight: 600
* Line Height: 1.5

### Body Base

* Font: DM Sans
* Size: 15px
* Weight: 400
* Line Height: 1.6

### UI SM

* Font: DM Sans
* Size: 13px
* Weight: 400
* Line Height: 1.5

### Mono Label

* Font: JetBrains Mono
* Size: 11px
* Weight: 400
* Line Height: 1.4
* Letter Spacing: 0.05em

---


# 7. Layout & Grid System

## Spacing Tokens

| Token         | Value  |
| ------------- | ------ |
| unit          | 4px    |
| gutter        | 24px   |
| margin        | 32px   |
| section-v-pad | 48px   |
| sidebar-width | 220px  |
| max-width     | 1280px |

---

## Layout Principles

### Density

Spacing should remain tight and efficient.

Inspired by:

* Linear
* Vercel
* GitHub
* Financial dashboards

### Rhythm

All spacing must be based on the 4px grid.

### Structural Rules

Use monochromatic rules extensively.

```css
border: 1px solid #1A1A1A;
```

These rules define hierarchy and layout instead of shadows.

---

## Grid System

### Dashboard Layout

Fixed-Fluid Hybrid Grid

* Sidebar: 220px fixed width
* Main Content: Fluid 12-column grid

### Marketing Pages

* 12-column grid
* Max width: 1280px

---

# 8. Visual Rules

## Radius

Default:

0px

Exceptions:

* Status Badge → 2px
* Pills → Full Radius

---

## Shadows

Not allowed.

Use:

* Borders
* Contrast
* Tonal Layering

---

## Structural Rules

Primary Layout Border:

1px solid #1A1A1A

Borders establish hierarchy.

Not shadows.

---

# 9. TanStack Start Architecture

## Root Structure

src/
├── app/
├── routes/
├── layouts/
├── components/
├── features/
├── hooks/
├── stores/
├── lib/
├── types/
├── assets/
└── styles/

---

# 10. App Layer

app/
├── providers/
├── router/
├── guards/
└── config/

Responsibilities:

* Bootstrapping
* Global Providers
* Configuration
* Route Guards

---

# 11. Route Architecture

routes/
├── __root.tsx
├── index.tsx

├── (public)/
├── (candidate)/
├── (recruiter)/
├── (admin)/

└── api/

---

## Route Groups

Public

* Landing
* Jobs
* Companies
* Login
* Register

Candidate

* Dashboard
* Applications
* Saved Jobs
* Profile

Recruiter

* Dashboard
* Jobs
* Applicants
* Analytics

Admin

* Dashboard
* Users
* Companies
* Reports

---

# 12. Layout Architecture

layouts/
├── public-layout.tsx
├── candidate-layout.tsx
├── recruiter-layout.tsx
└── admin-layout.tsx

Each layout owns:

* Navigation
* Sidebar
* Breadcrumbs
* Access Control

---

# 13. Feature Architecture

features/
├── auth/
├── jobs/
├── candidate/
├── recruiter/
├── admin/
├── analytics/
└── notifications/

Feature Structure:

feature/
├── api/
├── components/
├── hooks/
├── schemas/
├── services/
├── types/
└── utils/

---

# 14. API Architecture

Use Native Fetch API.

lib/api/
├── client.ts
├── request.ts
├── auth.ts
├── endpoints.ts
├── errors.ts
└── query-keys.ts

Required Flow:

Component
→ Feature Hook
→ Feature API
→ Request Layer
→ Backend

Components never call fetch directly.

---

# 15. Authentication

Supported:

* Login
* Register
* Forgot Password
* Reset Password

Roles:

* Candidate
* Recruiter
* Admin

Flow:

User
→ Login
→ Token Storage
→ Current User Query
→ Role Redirect

---

# 16. State Management

## TanStack Query

Server State Only

Examples:

* Users
* Jobs
* Companies
* Applications
* Analytics

---

## Zustand

Client State Only

Examples:

* Sidebar
* Theme
* Modal
* UI Preferences

Never duplicate query data.

---

# 17. UI Architecture

Priority:

Radix UI
→ shadcn/ui
→ Shared Components
→ Feature Components

Do not create custom primitives when existing primitives exist.

---

# 18. Component Standards

Keep all existing:

* Buttons
* Inputs
* Cards
* Tables
* Status Badges
* Audit Logs
* Press Grid

## Buttons

### Primary

* Background: Primary
* Text: On Primary
* Radius: 0px

### Secondary

* Transparent background
* Rule border
* Surface text

### Ghost

* No border
* Muted text
* Brightens on hover

---

## Inputs

### Default

* Surface background
* Rule border
* Radius: 0px

### Focus

Border changes to primary accent.

---

## Cards

Requirements:

* 0px radius
* Rule border
* Dense spacing
* No shadows

---

## Tables

Requirements:

* TanStack Table
* Dense rows
* Row separators
* Search
* Filtering
* Sorting
* Pagination

Cell padding:

```css
8px - 12px
```

---

## Audit Logs

Inspired by:

* Vercel Deployments
* CI/CD Logs
* Terminal Output

Typography:

* JetBrains Mono

Metadata:

```css
#666666
```

Content:

```css
#B8B8B8
```

---

## Status Badges

### OPEN

Background:

```css
#14532D
```

Text:

```css
#22C55A
```

### DRAFT

Border:

```css
1px dashed #1A1A1A
```

Text:

```css
#666666
```

### REJECTED

Background:

```css
#93000a
```

Text:

```css
#EF4444
```

---

## The Press Grid

Signature decorative component.

Characteristics:

* Sharp square tiles
* Iridescent gradients
* Grain texture
* Data visualization aesthetic

Uses:

* Landing pages
* Analytics dashboards
* Empty states
* Hero sections

Interactive behavior:

* subtle scaling
* color inversion
* gradient transitions

---

# 19. Data Tables

Mandatory:

TanStack Table

Features:

* Search
* Filter
* Sort
* Pagination
* Column Visibility

Used by:

* Jobs
* Users
* Companies
* Applications
* Audit Logs

---

# 20. Analytics

Recharts

Candidate:

* Application Metrics

Recruiter:

* Hiring Funnel
* Conversion Metrics

Admin:

* Platform KPIs
* Tenant Growth

Follow Industrial Broadsheet visualization styling.

---

# 21. Error Handling

Every experience must support:

* Loading
* Empty
* Error
* Success

Required Boundaries:

* Global
* Layout
* Route
* Feature

---

# 22. Accessibility

Release Requirements:

* Keyboard Navigation
* ARIA Labels
* Semantic HTML
* Screen Readers
* WCAG Compliance

Accessibility failures block release.

---

# 23. Responsive Strategy

Desktop First

Desktop

* Fixed Sidebar

Tablet

* Adaptive Layout

Mobile

* Drawer Navigation
* Single Column Layout

---

# 24. Multi-Tenant Requirements

Every feature must support:

* Tenant Isolation
* Company Ownership
* Recruiter Ownership
* Platform Administration

Never assume a single company.

---

# 25. Future Scalability

Architecture must support:

* Subscription Plans
* Billing
* Recruiter Teams
* Audit Logs
* Notifications
* Feature Flags
* WebSockets
* AI Matching
* Enterprise Permissions

Without major refactoring.

---

# 26. Definition Of Done

✓ Typed

✓ Accessible

✓ Responsive

✓ Loading State

✓ Empty State

✓ Error State

✓ Success State

✓ Query Integrated

✓ Role Protected

✓ Design System Compliant

✓ Tested

✓ Production Ready
