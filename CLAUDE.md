# CLAUDE.md

# POSTBOARD Frontend Engineering Rules

## Project Context

POSTBOARD is a frontend-only application.

Backend already exists and is maintained separately.

Frontend Responsibilities:

* UI Rendering
* Routing
* Authentication Experience
* API Consumption
* State Management
* Dashboard Experiences
* Data Visualization
* Multi-Tenant User Experience

The frontend must never implement backend business logic.

---

# Core Technology Stack

## Application Framework

TanStack Start

Required:

* File-based routing
* SSR-ready architecture
* Route-based code splitting
* Modern React patterns

---

## Data Layer

TanStack Query

Used for:

* API caching
* mutations
* optimistic updates
* invalidation
* background refetching

TanStack Query is the source of truth for all server state.

---

## Routing

TanStack Router

Used for:

* route protection
* layouts
* search params
* role-based navigation
* data loading

Do not introduce alternative routing solutions.

---

## Tables

TanStack Table

Required for:

* Jobs
* Applicants
* Companies
* Users
* Audit Logs

---

## UI Layer

shadcn/ui

Built on:

* Radix UI

Use existing shadcn primitives first.

Custom components must extend design-system patterns.

---

## Styling

Tailwind CSS

Required:

* utility-first styling
* design token usage
* responsive layouts

Avoid custom CSS files unless absolutely necessary.

---

## Forms

React Hook Form
+
Zod

All forms must use:

* schema validation
* typed form values
* reusable field patterns

---

## Charts

Recharts

Only approved charting solution.

---

# Forbidden Technologies

Do not introduce:

* Axios
* Lucide Icons
* Redux
* MobX
* Context-based server state
* Styled Components
* Material UI
* Chakra UI

Without explicit architectural approval.

---

# API Rules

All API communication must use:

Fetch API

Architecture:

Feature Hook
→ API Function
→ Request Layer
→ Backend

Never call fetch() directly inside components.

Required structure:

lib/api/

client.ts
request.ts
auth.ts
errors.ts
endpoints.ts

---

# Design System Compliance

The official design language is:

Industrial Broadsheet

Required characteristics:

* Zero-radius geometry
* Dense information layouts
* Editorial hierarchy
* Visible structural borders
* Technical metadata visibility
* Flat visual hierarchy

Avoid:

* glassmorphism
* neumorphism
* floating cards
* oversized spacing
* excessive shadows

DESIGN.md is the visual source of truth.

---

# State Management

## Server State

TanStack Query only.

Examples:

* User
* Jobs
* Applications
* Companies
* Analytics

---

## Client State

Zustand only.

Examples:

* Sidebar
* Theme
* Modal
* Filters

Never duplicate server state in Zustand.

---

# Component Rules

Shared UI:

src/components

Feature Components:

src/features/*/components

Never place business logic inside reusable UI components.

---

# Accessibility

Required:

* Keyboard navigation
* Semantic HTML
* Focus states
* ARIA attributes
* WCAG-compliant contrast

Accessibility failures block release.

---

# Performance Standards

Required:

* Route-level splitting
* Lazy loading
* Query caching
* Bundle awareness

Avoid premature memoization.

Profile first.

---

# Multi-Tenant Awareness

Every feature must consider:

* Tenant isolation
* Recruiter ownership
* Candidate ownership
* Platform administration

Never assume a single company environment.

---
# Dependency Governance

## Package Verification Policy

Before recommending, installing, upgrading, or using ANY package, framework, library, plugin, SDK, or tooling dependency, Claude must verify:

1. Official Website
2. Official Documentation
3. Official NPM Package
4. Official GitHub Repository
5. Current Stable Version
6. Maintenance Activity
7. Security Status
8. Community Adoption
9. Compatibility With Existing Stack
10. Long-Term Viability

Verification is mandatory.

Never assume package versions.

Always check the latest stable release before suggesting installation.

---

## Package Selection Criteria

A package may only be introduced when:

* Actively maintained
* Production-ready
* Well documented
* Compatible with React and TanStack Start
* Compatible with TypeScript
* Compatible with SSR
* Compatible with current architecture

Prefer fewer dependencies.

Avoid introducing packages that solve problems already covered by:

* React
* TanStack
* Tailwind
* shadcn/ui
* Radix UI
* Existing internal utilities

---

## Dependency Review Process

Before adding a dependency, document:

Purpose:
Why is the package needed?

Alternative:
Can existing tools solve the problem?

Bundle Impact:
Expected bundle increase.

Maintenance:
Last active release date.

Security:
Known vulnerabilities.

Decision:
Approved or Rejected.

---

## Version Policy

Always use:

* Latest stable version

Avoid:

* Alpha releases
* Experimental releases
* Release candidates
* Unmaintained packages

Unless explicitly approved.

---

## Package Replacement Policy

If a package becomes:

* Deprecated
* Unmaintained
* Security Risk

It must be reviewed for replacement.

Technical debt should not accumulate indefinitely.

---

# Frontend Engineering Standards

## Component Design

Prefer:

Small focused components.

Target:

* Single responsibility
* Reusable
* Composable

Avoid:

* Massive components
* God components
* Deep prop chains

---

## Composition Over Inheritance

Always prefer:

Composition

Over:

Inheritance

Build reusable primitives.

---

## Feature Isolation

Business logic belongs inside features.

Never place feature-specific business logic in:

src/components

Shared components must remain generic.

---

## TypeScript Standards

Forbidden:

any

ts-ignore

ts-nocheck

unsafe casting

Required:

* Strict typing
* Explicit interfaces
* Explicit return types for public functions
* Type-safe APIs

---

## Error Handling

Every API interaction must support:

* Loading
* Error
* Retry
* Success

Never silently swallow errors.

---

## Code Quality

Required:

* Readable code
* Self-documenting code
* Small functions
* Clear naming

Optimize for maintainability.

---

## Performance Standards

Measure before optimizing.

Required:

* Route splitting
* Query caching
* Lazy loading
* Bundle awareness

Avoid premature optimization.

---

## Accessibility Standards

Required:

* Keyboard support
* Semantic HTML
* ARIA labels
* Focus management
* Screen reader support

Accessibility is a release blocker.

---

# Security Standards

## Authentication

Never trust frontend state.

Authentication state must always be validated against backend responses.

Frontend authorization is UX only.

Backend remains the source of truth.

---

## Token Security

Never:

* Log tokens
* Expose tokens in UI
* Store secrets in source code
* Commit secrets to repositories

Use environment variables appropriately.

---

## API Security

All requests must:

* Validate input
* Handle unauthorized responses
* Handle expired sessions

Sensitive endpoints must be protected by backend authorization.

---

## XSS Protection

Never use:

dangerouslySetInnerHTML

Unless explicitly reviewed and sanitized.

All user-generated content must be treated as untrusted.

---

## Injection Protection

Never build URLs, queries, or HTML using unsanitized user input.

Validate all user input.

---

## File Upload Security

Validate:

* File type
* File size
* Upload status

Never trust client-side validation alone.

---

## Sensitive Data Handling

Never expose:

* Tokens
* Internal IDs
* Secrets
* Environment Variables
* Security Configuration

To end users.

---

## Security Headers Awareness

Frontend must be compatible with:

* CSP
* CORS
* X-Frame-Options
* HSTS
* Referrer Policy

Do not introduce features that break security headers.

---

## Dependency Security

Regularly review:

* npm audit
* package advisories
* GitHub security advisories

Security vulnerabilities must be addressed promptly.

---

# Architecture Protection Rules

## No Architectural Drift

New features must follow existing patterns.

Do not introduce:

* New state management solutions
* New form libraries
* New routing libraries
* New UI frameworks

Without architecture approval.

---

## Design System Enforcement

All UI must follow:

Industrial Broadsheet

No exceptions.

Design consistency is more important than individual screen creativity.

---

## Documentation Requirement

Major changes must update:

* DESIGN.md
* CLAUDE.md
* AGENTS.md

Documentation must remain synchronized with implementation.

---

## Production Mindset

Every implementation decision should assume:

* Thousands of users
* Large datasets
* Multi-tenant operation
* Long-term maintenance

Build for scalability from the beginning.


# Definition Of Done

A feature is complete only when:

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
