# DESIGN.md

# PostBoard Frontend Architecture & Design System

## Product Vision

PostBoard is a multi-tenant recruitment platform combining:

* Public Job Marketplace
* Candidate Portal
* Recruiter Workspace
* Platform Administration

The platform is designed for elite recruitment, technical hiring pipelines, talent operations, and workforce intelligence.

The UI should feel closer to:

* Linear
* Vercel
* Notion
* Financial terminals
* Bloomberg-style operational dashboards

than traditional job boards.

The experience prioritizes:

* Information density
* Operational efficiency
* Technical clarity
* Fast navigation
* Enterprise scalability

---

# Design Language

## Industrial Broadsheet

The official PostBoard design system is called **Industrial Broadsheet**.

It is a high-density, technical aesthetic that blends the authority of editorial print with the precision of developer tooling.

Core traits:

* Editorial
* Technical
* High-density
* Minimalist
* Brutalist
* Enterprise-focused
* Data-centric

Avoid:

* excessive whitespace
* oversized cards
* playful consumer UI
* glassmorphism
* neumorphism
* soft gradients
* oversized shadows
* rounded SaaS aesthetics

### Key Attributes

* Zero-Radius Geometry
* Editorial Hierarchy
* System Transparency
* Technical Metadata Visibility
* Monochromatic Structure
* Iridescent Data Visualization

---

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

# Typography

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

# Layout & Spacing

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

# Visual Rules

## Radius

Default radius:

```css
border-radius: 0px;
```

### Exceptions

Status badges:

```css
border-radius: 2px;
```

Category pills:

```css
border-radius: 999px;
```

---

## Shadows

Do not use shadows.

Depth comes from:

* borders
* tonal layering
* contrast
* interaction states

---

## Elevation & Depth

This system is intentionally flat.

Depth is created through:

### Tonal Layering

Background:

```css
#131313
```

Containers:

```css
#1c1b1b
#201f1f
#2a2a2a
```

### Borders

```css
1px solid #1A1A1A
```

### Hover States

Hover states should emphasize:

* border changes
* color inversion
* accent highlighting

Never use elevation jumps.

### Overlays

```css
rgba(0,0,0,0.8)
```

No backdrop blur.

---

# Component Standards

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

# Frontend Folder Structure

```text
src/
├── app/
├── routes/
├── layouts/
├── components/
├── features/
├── hooks/
├── lib/
├── store/
├── types/
└── assets/
```

---

# Feature Structure

```text
features/
├── auth/
├── jobs/
├── candidate/
├── recruiter/
├── admin/
├── notifications/
└── analytics/
```

Each feature contains:

```text
api/
components/
hooks/
schemas/
types/
pages/
```

---

# Application Layouts

## Public Layout

Pages:

* Landing
* Job Search
* Job Detail
* Login
* Register
* Forgot Password
* Reset Password

---

## Candidate Layout

Pages:

* Dashboard
* Profile
* Resume
* Applications
* Saved Jobs
* Notifications

---

## Recruiter Layout

Pages:

* Dashboard
* Company Profile
* Job Management
* Applicant Pipeline
* Analytics

---

## Admin Layout

Pages:

* Platform Dashboard
* User Management
* Company Management
* Moderation
* Reporting

---

# Routing Architecture

TanStack Router

Route Groups:

```text
public/
candidate/
recruiter/
admin/
```

Protection Levels:

* guest
* authenticated
* role-based

---

# API Architecture

All API communication must use the native Fetch API.

```text
lib/api/
├── client.ts
├── request.ts
├── endpoints.ts
├── errors.ts
└── auth.ts
```

Responsibilities:

* Centralized API configuration
* Request abstraction using Fetch API
* Authentication token handling
* Request and response normalization
* Error transformation
* Retry and timeout strategies

Features consume APIs through feature-level hooks.

Components must never call `fetch()` directly.

Recommended pattern:

```text
Feature Hook
→ API Function
→ Fetch Client
→ Backend API
```

---

# Authentication Flow

Supported Screens

* Login
* Register
* Forgot Password
* Reset Password

Flow

```text
User
→ Login
→ Token Storage
→ Current User Query
→ Role Redirect
```

Roles

* Candidate
* Recruiter
* Admin

---

# State Management

## TanStack Query

Server State:

* user
* jobs
* companies
* applications
* analytics

## Zustand

Client State:

* sidebar
* theme
* modal
* filters

Never duplicate query data in Zustand.

---

# Forms

React Hook Form + Zod

Pattern:

```text
Schema
→ Form
→ Mutation
→ Toast
→ Query Invalidation
```

---

# Analytics

Recharts

Candidate:

* application trends

Recruiter:

* hiring funnel
* conversion rates

Admin:

* platform metrics
* tenant growth

---

# Dashboard Design Standards

All dashboards must provide:

* KPIs
* activity feed
* recent actions
* searchable tables
* audit visibility
* operational metrics

Density is preferred over oversized cards.

Technical metadata should remain visible.

---

# Error Handling

Every page must support:

* loading
* empty
* error
* success

Error boundaries:

* global
* layout
* route

API errors should be standardized through the Fetch API layer and surfaced consistently across the application.

---

# Responsive Strategy

Desktop First

Breakpoints:

* Desktop
* Tablet
* Mobile

### Desktop

* Fixed sidebar
* Full dashboard density

### Tablet

* Reduced columns
* Adaptive navigation

### Mobile

* Single-column layout
* Drawer navigation
* Bottom navigation support

Gutters reduce:

```text
24px → 16px
```

---

# Accessibility Standards

Every feature must support:

* Keyboard navigation
* Focus visibility
* Screen readers
* Semantic HTML
* ARIA labels
* WCAG-compliant contrast ratios

Accessibility is a release requirement.

---

# Future Expansion

Architecture must support:

* subscriptions
* billing
* team members
* audit logs
* notifications
* feature flags
* websocket events
* AI matching
* multi-company recruiters
* tenant isolation
* enterprise permissions
* workflow automation

---

# Definition of Done

A feature is complete when:

✓ Typed

✓ Accessible

✓ Responsive

✓ Loading State

✓ Empty State

✓ Error State

✓ Success State

✓ Query Integration

✓ Role Protected

✓ Design System Compliant

✓ Tested

✓ Production Ready
