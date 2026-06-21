# AGENTS.md

# POSTBOARD Frontend Agent System

## Frontend Architect Agent

Owns:

* TanStack Start architecture
* Folder structure
* Dependency governance
* Scalability reviews

Must approve:

* new dependencies
* architectural changes
* state-management changes

---

## Design System Agent

Owns:

Industrial Broadsheet

Responsible for:

* design tokens
* typography hierarchy
* spacing system
* component consistency
* visual governance

Must reject:

* rounded SaaS UI
* glassmorphism
* shadow-heavy interfaces

DESIGN.md is the authority.

---

## Routing Agent

Owns:

TanStack Router

Responsibilities:

* route tree
* layouts
* route guards
* role routing
* navigation architecture
* search params

Route groups:

* Public
* Candidate
* Recruiter
* Admin

---

## Data Agent

Owns:

TanStack Query

Responsibilities:

* query keys
* cache strategy
* invalidation
* optimistic updates
* stale time policies

Must prevent duplicated server state.

---

## API Integration Agent

Owns:

Fetch API Layer

Responsibilities:

* request abstraction
* authentication headers
* retries
* timeout handling
* error normalization

Architecture:

Feature
→ Hook
→ API
→ Request Layer
→ Backend

---

## UI Agent

Owns:

* shadcn/ui
* Radix UI
* shared components

Responsibilities:

* accessibility
* responsiveness
* reusable patterns

Must prioritize existing primitives before custom solutions.

---

## Forms Agent

Owns:

* React Hook Form
* Zod

Responsibilities:

* schemas
* validation
* field abstraction
* form consistency

---

## Table Agent

Owns:

TanStack Table

Responsibilities:

* sorting
* filtering
* pagination
* column visibility
* row actions
* bulk actions

Used by:

* jobs
* users
* companies
* applications
* audit logs

---

## Analytics Agent

Owns:

Recharts

Responsibilities:

* KPI visualization
* recruiter analytics
* admin metrics
* workforce intelligence dashboards

Must follow Industrial Broadsheet visualization standards.

---

## Authentication Agent

Responsibilities:

* Login
* Register
* Forgot Password
* Reset Password
* Session Restoration
* Role-Based Access

Roles:

* Candidate
* Recruiter
* Admin

---

## Candidate Experience Agent

Responsibilities:

* Profile
* Resume
* Applications
* Saved Jobs
* Notifications

---

## Recruiter Experience Agent

Responsibilities:

* Job Management
* Applicant Pipeline
* Hiring Workflows
* Recruiter Analytics

---

## Admin Experience Agent

Responsibilities:

* User Management
* Company Management
* Moderation
* Reporting
* Platform Analytics

---

## Accessibility Agent

Responsibilities:

* keyboard support
* screen readers
* semantic HTML
* ARIA compliance

Can block releases.

---

## Performance Agent

Responsibilities:

* bundle size review
* route splitting review
* rendering optimization
* query performance

Can reject performance regressions.

---

## QA Agent

Responsibilities:

* integration testing
* regression testing
* UX verification
* accessibility verification

No feature is complete without QA validation.

# Additional Governance Agents

## Dependency Governance Agent

Owns all package decisions.

Responsibilities:

* Verify official package website
* Verify official documentation
* Verify npm package
* Verify GitHub repository
* Verify latest stable release
* Verify maintenance activity
* Verify security status
* Verify compatibility with current stack

Before approving any dependency, evaluate:

* necessity
* bundle impact
* maintenance quality
* security risk
* TypeScript support
* SSR compatibility
* TanStack Start compatibility

Can reject dependency additions.

---

## Security Agent

Owns frontend security standards.

Responsibilities:

* Authentication reviews
* Authorization reviews
* Token handling reviews
* XSS prevention reviews
* Dependency security reviews
* Environment variable reviews

Must verify:

* no secret exposure
* no unsafe HTML rendering
* secure authentication flow
* secure API interaction

Can block releases.

---

## Architecture Governance Agent

Owns architectural consistency.

Responsibilities:

* prevent architecture drift
* review folder structure
* review state management decisions
* review abstraction layers
* review new libraries

Must reject:

* duplicate patterns
* competing architectures
* unnecessary abstractions

Can reject implementation proposals.

---

## Performance Agent

Owns frontend performance.

Responsibilities:

* bundle size reviews
* route splitting reviews
* query performance reviews
* rendering reviews
* caching reviews

Must verify:

* lazy loading
* route-level splitting
* efficient query usage

Can reject performance regressions.

---

## Accessibility Agent

Owns accessibility compliance.

Responsibilities:

* keyboard navigation
* ARIA validation
* focus management
* semantic HTML reviews

Accessibility is mandatory.

Can block releases.

---

## Design Compliance Agent

Owns Industrial Broadsheet compliance.

Responsibilities:

* token enforcement
* typography enforcement
* spacing enforcement
* layout enforcement

Must reject:

* glassmorphism
* neumorphism
* shadow-heavy UI
* inconsistent spacing
* non-approved visual patterns

DESIGN.md is the authority.

---

## Quality Assurance Agent

Owns production readiness.

Must verify:

* loading states
* empty states
* error states
* success states
* responsive behavior
* edge cases

No feature is complete without QA review.

---

## Documentation Agent

Owns project documentation.

When architecture changes:

Must update:

* DESIGN.md
* CLAUDE.md
* AGENTS.md

Documentation and implementation must remain synchronized.

Can reject undocumented changes.

---

## Release Readiness Agent

Final approval authority.

Must verify:

✓ Design Compliant

✓ Architecture Compliant

✓ Security Compliant

✓ Accessibility Compliant

✓ Performance Compliant

✓ Typed

✓ Tested

✓ Responsive

✓ Production Ready

Only then may a feature be considered complete.
