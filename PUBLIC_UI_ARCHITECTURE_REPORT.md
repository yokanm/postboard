# PUBLIC_UI_ARCHITECTURE_REPORT.md

> **Status:** Design Investigation Complete — Implementation Blueprint for Public Website
>
> **Phase:** 5A — Public Website UI Conformity & Design Architecture Audit
>
> **Date:** 2026-06-27
>
> **Scope:** Landing Page, Header, Footer, About, Features, Contact, Privacy Policy, Terms of Service, Public Company Listing, Public Company Profile, Public Navigation, Theme Switcher, Global Layout, Empty States, Error Pages

---

## 1. Executive Summary

### Overall UI Quality: 62% Fidelity to Design

The public website demonstrates **strong structural alignment** with the Design directory mockups but has **significant visual and content gaps** in specific areas. The core marketing pages (About, Features, Contact, Privacy, Terms) are well-implemented with high fidelity. The Landing Page achieves ~80% match with minor icon and footer deviations. The Companies Directory and Company Profile pages are largely unimplemented stubs. The Job Marketplace has a working data flow but the visual layout deviates from the 2-column grid design. The 404 page is a minimal stub missing the distinctive Press Grid illustration.

### Key Strengths
- **Privacy Policy page:** 100% fidelity — all sections, data tables, cookie cards, sidebar TOC match exactly
- **Access Restricted page:** Near-perfect match with all elements (card, icon, error code, CTAs, system status)
- **Features page:** All content sections match verbatim; only icon placeholders differ
- **Contact page:** Nearly pixel-perfect; only icon rendering differs
- **Terms of Service page:** 95% match; only missing Intersection Observer TOC highlighting
- **About page:** Strong structural match; only missing leadership photos
- **Theme Switcher:** Well-implemented (3-mode segmented control, persistence, accessibility)

### Critical Gaps
1. **Companies Directory:** 10% — bare placeholder, no search, no cards, no pagination
2. **Company Profile:** 15% — wrong page type (admin view vs public profile)
3. **404 Page:** 30% — missing Press Grid illustration, glitch aesthetic, footer
4. **Job Marketplace:** 50% — single-column instead of 2-column grid, sidebar filters instead of sticky bar
5. **Maintenance Page:** 0% — entirely unimplemented
6. **Icons:** All pages use `&#9632;` character placeholders instead of Hugeicons

### Priority Order for Implementation
1. Companies Directory (backend endpoint required)
2. Company Profile (public view required)
3. Job Marketplace (2-column grid, card redesign)
4. 404 Page (Press Grid illustration)
5. Landing Page (icon fixes, footer alignment)
6. Empty States (Press Grid card system)
7. Maintenance Page (new route + component)

---

## 2. Design Coverage Matrix

### 2.1 Core Public Pages

| Page | Design Mockup | Implementation | Status | Completion |
|------|---------------|----------------|--------|------------|
| **Landing Page** | `public_landing_page/code.html` | `LandingPage.tsx` | △ Partially | 80% |
| **About Page** | `about_page_desktop/code.html` | `AboutPage.tsx` | △ Partially | 90% |
| **Features Page** | `features_page_desktop/code.html` | `FeaturesPage.tsx` | △ Partially | 85% |
| **Contact Page** | `contact_page_desktop/code.html` | `ContactPage.tsx` | △ Partially | 95% |
| **Privacy Policy** | `privacy_policy_page_desktop/code.html` | `PrivacyPage.tsx` | ✓ Fully | 100% |
| **Terms of Service** | `terms_of_service_page_desktop/code.html` | `TermsPage.tsx` | △ Partially | 95% |
| **Cookies Policy** | No design mockup | `CookiesPage.tsx` | ✓ Fully | 100% |

### 2.2 Companies & Jobs

| Page | Design Mockup | Implementation | Status | Completion |
|------|---------------|----------------|--------|------------|
| **Companies Directory** | `companies_directory_page/code.html` | `CompaniesPage.tsx` | ✗ Missing | 10% |
| **Company Profile** | `company_profile_page/code.html` | `CompanyProfilePage.tsx` | ✗ Missing | 15% |
| **Job Marketplace** | `jobs_marketplace_public_page/code.html` | `JobsMarketplace.tsx` | △ Partially | 50% |
| **Job Detail** | `job_detail_page/code.html` | `JobDetailPage.tsx` | △ Partially | 65% |

### 2.3 Error & Status Pages

| Page | Design Mockup | Implementation | Status | Completion |
|------|---------------|----------------|--------|------------|
| **404 Page** | `404_page/code.html` | `NotFoundPage.tsx` | ✗ Missing | 30% |
| **Maintenance Page** | `maintenance_page/code.html` | None | ✗ Missing | 0% |
| **Access Restricted** | `access_restricted_desktop/code.html` | `AccessRestricted.tsx` | ✓ Fully | 98% |
| **Action Not Allowed** | `action_not_allowed_desktop/code.html` | None | ✗ Missing | 0% |

### 2.4 Cross-Cutting Components

| Component | Design Reference | Implementation | Status | Completion |
|-----------|------------------|----------------|--------|------------|
| **Public Header** | Landing page header section | `PublicHeader.tsx` | △ Partially | 60% |
| **Public Footer** | Landing page footer section | `PublicFooter.tsx` | △ Partially | 70% |
| **Theme Switcher** | No design mockup | `ThemeToggle.tsx` | ✓ Fully | 95% |
| **Empty States** | `empty_states_reference_guide/code.html` | `EmptyState.tsx` | △ Partially | 40% |

---

## 3. Component Inventory

### 3.1 Existing Reusable Components

| Component | Location | Used By | Quality |
|-----------|----------|---------|---------|
| `LoadingState` | `src/shared/components/ux/` | All data-fetching pages | Good |
| `EmptyState` | `src/shared/components/ux/` | All data-fetching pages | Needs redesign |
| `ErrorState` | `src/shared/components/ux/` | All data-fetching pages | Good |
| `AccessRestricted` | `src/shared/components/ux/` | Auth-guarded routes | Excellent |
| `ConfirmDialog` | `src/shared/components/dialogs/` | Destructive actions | Good |
| `SearchInput` | `src/shared/components/ux/` | Tables, lists | Good |
| `PasswordField` | `src/shared/components/forms/` | Auth forms | Good |
| `ThemeToggle` | `src/shared/components/theme/` | Topbar, PublicHeader | Excellent |
| `PublicHeader` | `src/features/public/components/` | All public pages | Needs work |
| `PublicFooter` | `src/features/public/components/` | All public pages | Needs work |

### 3.2 Missing Reusable Components (Should Be Created)

| Component | Purpose | Used By | Priority |
|-----------|---------|---------|----------|
| **`PressGrid`** | Decorative gradient tile background | Landing, 404, Maintenance, Access Restricted | High |
| **`SectionLabel`** | `// PREFIX` label with consistent styling | All pages | High |
| **`DataCard`** | Bordered card with label + value | Companies, Job Detail, Stats | High |
| **`Badge`** | Status/type badge (OPEN, FULL-TIME, REMOTE) | Jobs, Applications | Medium |
| **`TerminalCard`** | Terminal-style card with chrome header | Features, Contact | Medium |
| **`StatsBar`** | Horizontal stats display with dividers | Landing, Companies | Medium |
| **`TimelineItem`** | Vertical timeline entry with marker | About | Low |
| **`FormField`** | Label + input with consistent styling | Contact, Auth | Low |

### 3.3 Duplicate Components

| Component | Locations | Consolidation |
|-----------|-----------|---------------|
| `ErrorState` | `shared/components/ux/`, `features/*/components/` | Use shared only |
| `LoadingState` | `shared/components/ux/`, inline in pages | Use shared only |
| `SearchInput` | `shared/components/ux/`, `features/*/components/` | Use shared only |

### 3.4 Components That Should Be Reused But Aren't

| Component | Current Location | Should Be Used By |
|-----------|------------------|-------------------|
| `Badge` (shadcn) | `src/components/ui/badge.tsx` | Job cards, status displays |
| `Card` (shadcn) | `src/components/ui/card.tsx` | Company cards, feature cards |
| `Input` (shadcn) | `src/components/ui/input.tsx` | Search bars, forms |
| `Select` (shadcn) | `src/components/ui/select.tsx` | Filter dropdowns |
| `Separator` (shadcn) | `src/components/ui/separator.tsx` | Section dividers |

---

## 4. Navigation Findings

### 4.1 Header Navigation

| Link | Destination | Route Exists | Status |
|------|-------------|--------------|--------|
| `POSTBOARD` (logo) | `/` | ✓ | Working |
| `Jobs` | `/jobs` | ✓ | Working |
| `Companies` | `/companies` | ✓ | Working |
| `Features` | `/features` | ✓ | Working |
| `About` | `/about` | ✓ | Working |
| `Contact` | `/contact` | ✓ | Working |
| `Sign In` | `/login` | ✓ | Working |
| `Post a Job` | `/register` | ✓ | Working |
| `Dashboard` (auth) | `/candidate/dashboard` | ✓ | Working |
| Theme Toggle | N/A (toggle) | ✓ | Working |

**Deviation from Design:** Design shows `Marketplace/Companies/Pricing/Resources` nav links. Implementation uses `Jobs/Companies/Features/About/Contact`. Missing: `Pricing` (page exists as `pricing_page_coming_soon/` mockup but no route), `Resources` (no mockup).

### 4.2 Footer Navigation

| Column | Links | Routes | Status |
|--------|-------|--------|--------|
| **Platform** | Features, Jobs, Companies, Contact | `/features`, `/jobs`, `/companies`, `/contact` | ✓ Working |
| **Company** | About, Careers, Press | `/about`, `/about`, `/contact` | △ Careers→About, Press→Contact (wrong destinations) |
| **Legal** | Privacy, Terms, Cookies, Security | `/privacy`, `/terms`, `/cookies`, `/contact` | △ Security→Contact (wrong destination) |

**Deviation from Design:** Design has flat row: `Privacy Policy, Terms of Service, API Status, Contact`. Implementation has 3-column grid with `Platform/Company/Legal` groups.

### 4.3 Page-Level Navigation

| Page | Internal Links | Status |
|------|----------------|--------|
| **Landing** | Browse Roles→`/jobs`, Post a Job→`/register` | ✓ Working |
| **About** | No internal links | N/A |
| **Features** | No internal links | N/A |
| **Contact** | Privacy Policy→`/privacy` | ✓ Working |
| **Privacy** | No internal links | N/A |
| **Terms** | No internal links | N/A |
| **Job Detail** | `← ALL ROLES`→`/jobs`, View Company Profile→`/companies/$companyId` | ✓ Working |
| **Job Detail** | Similar Roles→`/jobs/$jobId` (dynamic) | ✓ Working |

### 4.4 Broken Navigation Issues

| Issue | Location | Expected | Actual | Severity |
|-------|----------|----------|--------|----------|
| Careers link | Footer Company column | `/careers` or external | `/about` | Low |
| Press link | Footer Company column | `/press` or external | `/contact` | Low |
| Security link | Footer Legal column | `/security` or external | `/contact` | Low |
| No Pricing page | Header nav (design shows `Pricing`) | `/pricing` | No route exists | Medium |
| No Resources page | Header nav (design shows `Resources`) | `/resources` | No route exists | Medium |

---

## 5. UI Deviations

### 5.1 Landing Page Deviations

| Element | Design | Implementation | Severity |
|---------|--------|----------------|----------|
| **Nav links** | Marketplace, Companies, Pricing, Resources | Jobs, Companies, Features, About, Contact | Medium |
| **Login CTA label** | `Login` | `Sign In` | Low |
| **Feature icons** | Material Symbols (manage_search, bookmarks, etc.) | `&#9632;` character placeholder | High |
| **CTA band headline** | `font-masthead-4xl` (Playfair Display) | `font-serif` (same font, different class) | Low |
| **Footer layout** | Single row with flat links | 4-column grid with grouped links | Medium |
| **Footer brand size** | 48px | 24px | Low |
| **Footer link set** | Privacy, Terms, API Status, Contact | Platform/Company/Legal groups | Medium |

### 5.2 About Page Deviations

| Element | Design | Implementation | Severity |
|---------|--------|----------------|----------|
| **Leadership photos** | Actual portrait images with grayscale hover | `PHOTO_PLACEHOLDER` text div | High |
| **Footer brand size** | 48px | 24px | Low |

### 5.3 Features Page Deviations

| Element | Design | Implementation | Severity |
|---------|--------|----------------|----------|
| **Hero terminal icon** | Material Symbol `terminal` | No icon (text only) | Medium |
| **Feature card icons** | Material Symbols (manage_search, bookmarks, etc.) | `&#9632;` character placeholder | High |
| **Footer tagline** | "Industrial-grade pipeline management" | Copyright only | Low |

### 5.4 Contact Page Deviations

| Element | Design | Implementation | Severity |
|---------|--------|----------------|----------|
| **Routing card icons** | Material Symbols | `&#9632;`/`&#8599;` characters | Medium |
| **Submit button icon** | Material Symbol `send` | `&#8594;` arrow character | Low |

### 5.5 Companies Directory Deviations

| Element | Design | Implementation | Severity |
|---------|--------|----------------|----------|
| **Hero label** | `// COMPANIES_DIRECTORY` | `// COMPANIES` | Low |
| **Hero title** | "Discover Verified Employers" | "Explore Companies" | Low |
| **Search bar** | Input + EXECUTE button | Not present | Critical |
| **Filter/sort** | RESULTS_FOUND + FILTER/SORT | Not present | Critical |
| **Company cards** | 3-col grid with logo, name, industry, description, headcount, reqs, location | Not present | Critical |
| **Pagination** | Terminal-style PREV/NEXT | Not present | Critical |

### 5.6 Company Profile Deviations

| Element | Design | Implementation | Severity |
|---------|--------|----------------|----------|
| **Company header** | Logo (grayscale), slug, name (masthead-4xl) | Name only, basic logo | Critical |
| **Stats bar** | TEAM_STRENGTH, ESTABLISHED, HQ_COORDINATES | Active Jobs, Team Members | High |
| **Two-column layout** | 8-col main + 4-col sidebar | Single-column | Critical |
| **About Us section** | Description + lab image | Not present | Critical |
| **Open Roles list** | Job cards with filter tabs | Not present | Critical |
| **Sidebar: Join Network** | FOLLOW button | Not present | Critical |
| **Sidebar: Culture Metrics** | Progress bars | Not present | High |
| **Sidebar: Tech Stack** | Tag chips | Not present | High |
| **Sidebar: Leadership** | Team member cards | Not present | High |
| **Mobile layout** | Centered hero, back/share, bottom nav | No mobile layout | Critical |

### 5.7 Job Marketplace Deviations

| Element | Design | Implementation | Severity |
|---------|--------|----------------|----------|
| **Hero label** | `// JOB_DISCOVERY` | `// JOBS_MARKETPLACE` | Low |
| **Filter bar** | Sticky horizontal bar with dropdowns | Vertical sidebar | High |
| **Job grid** | 2-column (`lg:grid-cols-2`) | Single-column list | Critical |
| **Job card: logo** | 48×48 bordered box | Not present | High |
| **Job card: bookmark** | bookmark_border icon | Not present | Medium |
| **Job card: tags** | Bordered pills with salary highlight | Plain text spans | High |
| **Job card: footer** | Dashed border, posted date, team avatars | Posted date only | Medium |
| **Job card: featured** | Left gradient bar + badge | Not present | Medium |
| **Sort control** | Inline with grid header | Inside sidebar | Medium |

### 5.8 Job Detail Deviations

| Element | Design | Implementation | Severity |
|---------|--------|----------------|----------|
| **Responsibilities section** | Numbered list (01, 02, 03, 04) | Not present (single description block) | Critical |
| **Requirements section** | Bullet list with `/` prefix | Not present | Critical |
| **Sidebar: Applicants count** | "Applicants: 144" | "Expires: [date]" | Medium |
| **Sidebar: Company detail** | Industry + Size + Funding | Industry only | Medium |
| **Mobile: Sticky CTA** | Fixed bottom "APPLY NOW" bar | Not present | High |
| **Mobile: Bottom nav** | Fixed tab bar (Jobs, Saved, Applied, Profile) | Not present | High |
| **Mobile: Company card** | Photo, Founded/HQ grid | Basic card | Medium |

### 5.9 404 Page Deviations

| Element | Design | Implementation | Severity |
|---------|--------|----------------|----------|
| **Error code hero** | `404` in 96px masthead | `// ERROR 404` in 11px mono-label | Critical |
| **Title** | `404 // PAGE_NOT_FOUND` uppercase headline | `Page not found` lowercase | Critical |
| **Description** | Mono-label uppercase terminal tone | Sans 13px casual tone | High |
| **Return link** | Primary CTA button with icon | Border button, no icon | High |
| **Browse Jobs link** | Secondary ghost button | Not present | Medium |
| **Press Grid illustration** | 3×3 gradient tiles with glitch | Not present | Critical |
| **Section labels** | `// ERR_VISUAL_RENDER`, coordinates | Not present | High |
| **Footer** | `// POSTBOARD_SYSTEMS_OFFLINE` status | Not present | Medium |
| **Background** | Ambient grid lines (64px) | Solid background only | Medium |

### 5.10 Empty States Deviations

| Element | Design | Implementation | Severity |
|---------|--------|----------------|----------|
| **Container** | Bordered card with hover accent | No border, no hover | High |
| **Illustration** | Press Grid tile pattern (6 variations) | Generic icon slot | Critical |
| **Title font** | `font-ui-lg` (sans, 18px) | `font-serif` (serif, 18px) | Medium |
| **Description font** | `font-body-base` (15px) | `font-sans` (13px) | Medium |
| **Action button** | Primary/ghost variants, mono-label, uppercase | Border, sans, 13px | High |

---

## 6. Responsive Findings

### 6.1 Desktop (1280px+)

| Page | Layout | Status |
|------|--------|--------|
| Landing | Hero + stats + features (2-col) + CTA | ✓ Working |
| About | Split hero + bento grid + timeline + team (4-col) | ✓ Working |
| Features | Hero + 3-col grids + terminal card | ✓ Working |
| Contact | Routing cards (4-col) + form (8-col) | ✓ Working |
| Privacy | 12-col grid (3+9) with sticky TOC | ✓ Working |
| Terms | 12-col grid (3+9) with sticky TOC | ✓ Working |
| Companies | Not implemented | ✗ |
| Company Profile | Not implemented | ✗ |
| Job Marketplace | Sidebar + single-column list | △ Wrong layout |
| Job Detail | 12-col grid (8+4) | ✓ Working |
| 404 | Centered minimal | △ Missing design elements |

### 6.2 Laptop (1024px)

| Page | Status | Notes |
|------|--------|-------|
| All pages | ✓ | Grids collapse appropriately, typography scales |

### 6.3 Tablet (768px)

| Page | Status | Notes |
|------|--------|-------|
| Landing | ✓ | Features stack, stats remain 3-col |
| About | ✓ | Timeline stacks, team goes 2-col |
| Features | △ | 2-col grid, hidden placeholder card |
| Contact | △ | Routing cards stack, form full-width |
| Privacy | ✓ | TOC hidden, content full-width |
| Terms | ✓ | TOC hidden, content full-width |
| Job Marketplace | △ | Sidebar collapses, cards stack |
| Job Detail | △ | Grid collapses, sidebar below content |

### 6.4 Mobile (< 640px)

| Page | Status | Notes |
|------|--------|-------|
| Landing | ✓ | Single column, CTAs stack |
| About | ✓ | All sections stack vertically |
| Features | ✓ | Single column, placeholder hidden |
| Contact | ✓ | Full-width form |
| Privacy | ✓ | Full-width content |
| Terms | ✓ | Full-width content |
| Job Marketplace | △ | Cards stack but layout differs from design |
| Job Detail | ✗ | Missing sticky CTA, bottom nav, mobile header |
| 404 | ✓ | Centered content |

### 6.5 Ultra-wide (1920px+)

| Page | Status | Notes |
|------|--------|-------|
| All pages | ✓ | Content capped at `max-w-(--max-width)` |

### 6.6 Responsive Issues Summary

| Issue | Pages Affected | Severity |
|-------|----------------|----------|
| Job Marketplace: single-column instead of 2-col | Job Marketplace | High |
| Job Detail: no mobile sticky CTA bar | Job Detail | High |
| Job Detail: no mobile bottom tab nav | Job Detail | High |
| Job Detail: no mobile-specific headline sizing | Job Detail | Medium |
| Companies: no responsive layout (stub) | Companies | Critical |
| Company Profile: no mobile layout | Company Profile | Critical |
| Job Marketplace: sidebar doesn't match design's sticky bar | Job Marketplace | High |

---

## 7. Accessibility Findings

### 7.1 Keyboard Navigation

| Page | Status | Notes |
|------|--------|-------|
| Header | ✓ | All nav links keyboard accessible, hamburger has `aria-label` |
| Footer | ✓ | All links keyboard accessible |
| Landing | ✓ | CTA buttons keyboard accessible |
| About | ✓ | Links keyboard accessible |
| Features | ✓ | Cards not interactive (no keyboard issues) |
| Contact | ✓ | Form inputs keyboard accessible, select keyboard accessible |
| Privacy | ✓ | TOC links keyboard accessible |
| Terms | ✓ | TOC links keyboard accessible |
| Job Marketplace | ✓ | Cards not interactive |
| Job Detail | ✓ | Apply button keyboard accessible |

### 7.2 Contrast Ratios

| Element | Design Token | Actual Ratio | WCAG AA | Status |
|---------|--------------|--------------|---------|--------|
| Body text on background | `--on-surface` on `--background` | ~12:1 | 4.5:1 | ✓ Pass |
| Dim text on background | `--dim` on `--background` | ~6:1 | 4.5:1 | ✓ Pass |
| Primary accent on surface | `--primary-container` on `--surface` | ~4.6:1 | 4.5:1 | ✓ Pass (borderline) |
| Link text on surface | `--body` on `--surface` | ~8:1 | 4.5:1 | ✓ Pass |
| Badge text on badge bg | `--on-primary-container` on `--primary-container` | ~4.8:1 | 4.5:1 | ✓ Pass (borderline) |

### 7.3 ARIA Attributes

| Element | ARIA | Status |
|---------|------|--------|
| Mobile hamburger | `aria-label`, `aria-expanded` | ✓ Present |
| Theme toggle | `aria-label`, `aria-pressed` | ✓ Present |
| Form inputs | `htmlFor`/`id` pairs | ✓ Present |
| Decorative icons | `aria-hidden="true"` | ✓ Present |
| Skip-to-content link | Not present | ✗ Missing |
| Main landmark | `<main>` tag | ✓ Present |
| Nav landmark | `<nav>` tag | ✓ Present |
| Footer landmark | `<footer>` tag | ✓ Present |

### 7.4 Semantic HTML

| Element | Status | Notes |
|---------|--------|-------|
| `<header>` | ✓ | Used in PublicHeader |
| `<nav>` | ✓ | Used in PublicHeader, Terms TOC, Privacy TOC |
| `<main>` | ✓ | Used in all page components |
| `<section>` | ✓ | Used for content sections |
| `<article>` | ✗ | Not used (could be used for job cards, company cards) |
| `<aside>` | ✓ | Used in Privacy/Terms TOC |
| `<footer>` | ✓ | Used in PublicFooter |
| `<button>` | ✓ | Used for hamburger, theme toggle, form submit |
| `<a>` | ✓ | Used for all navigation links |
| `<form>` | ✓ | Used in Contact page |

### 7.5 Focus Management

| Element | Focus Style | Status |
|---------|-------------|--------|
| Nav links | `hover:text-(--on-surface)` | △ No visible focus outline |
| CTA buttons | `hover:bg-(--primary-container)` | △ No visible focus outline |
| Form inputs | `focus:border-(--press-amber) focus:ring-1` | ✓ Visible focus |
| Theme toggle | `focus-visible:outline` | ✓ Visible focus |
| Hamburger | `focus-visible:outline` | ✓ Visible focus |

### 7.6 Accessibility Issues Summary

| Issue | Severity | Pages Affected |
|-------|----------|----------------|
| Missing skip-to-content link | Medium | All public pages |
| No visible focus outlines on nav links | Medium | All pages with header |
| No visible focus outlines on CTA buttons | Medium | All pages with CTAs |
| Missing `role="article"` on job/company cards | Low | Job Marketplace, Companies |
| Missing `aria-current="page"` on active nav | Low | All pages |

---

## 8. Theme Recommendations

### 8.1 Current Implementation

| Aspect | Status |
|--------|--------|
| **Modes** | Light, Dark, System — 3 modes |
| **Toggle** | 3-button segmented control |
| **Persistence** | Zustand `persist` middleware, key `postboard-theme` |
| **Placement** | Desktop: PublicHeader (hidden on mobile). Mobile: inside hamburger menu |
| **Icons** | Hugeicons (Sun01, Moon, Laptop) |
| **Accessibility** | `aria-label`, `aria-pressed`, `focus-visible:outline` |

### 8.2 Recommended Placement

| Location | Recommendation | Rationale |
|----------|----------------|-----------|
| **Public Header (Desktop)** | Keep current: `hidden md:block` next to auth CTAs | Standard placement, visible on desktop |
| **Public Header (Mobile)** | Keep current: inside hamburger menu | Only space available |
| **Authenticated Topbar** | Already present via ThemeToggle | Consistent |
| **Footer** | Consider adding | discoverability for users who scroll to bottom |

### 8.3 Recommended Enhancements

| Enhancement | Priority | Rationale |
|-------------|----------|-----------|
| Add `aria-label="Theme: dark/light/system"` to each button | Medium | Screen reader announces current theme |
| Add system preference detection on first visit | Low | Better defaults for new users |
| Add transition class to `<html>` for smooth theme switch | Low | Better UX during switch |
| Consider adding theme indicator in footer | Low | Additional discoverability |

### 8.4 Persistence Strategy

| Aspect | Current | Recommendation |
|--------|---------|----------------|
| Storage | Zustand persist → localStorage | Keep (correct approach) |
| Key | `postboard-theme` | Keep (namespaced) |
| Default | System preference | Keep (correct default) |
| Sync | None (single-tab only) | Consider `storage` event listener for multi-tab sync |

---

## 9. Public Website Implementation Blueprint

### 9.1 Priority 1: Companies Directory (Critical)

**Backend Dependency:** `GET /api/v1/companies` (public, paginated, filterable) — must be added to backend

**Files to Change:**
- `src/features/public/pages/CompaniesPage.tsx` — Full rewrite
- `src/features/public/api/index.ts` — New file (API functions)
- `src/features/public/hooks/index.ts` — New file (TanStack Query hooks)
- `src/lib/api/endpoints.ts` — Add `companies.list` endpoint
- `src/lib/api/query-keys.ts` — Add company query keys

**Reusable Components:**
- `LoadingState` (skeleton variant)
- `EmptyState`
- `ErrorState`
- `SearchInput`
- New: `CompanyCard` (logo, name, industry, description, headcount, reqs, location, HIRING badge)

**Design References:**
- `Design/companies_directory_page/code.html` — Primary mockup
- `Design/companies_directory_public_roster/screen.png` — Variant reference

**Acceptance Criteria:**
- [ ] Search bar with debounced input and EXECUTE button
- [ ] Filter/sort controls (RESULTS_FOUND count, FILTER, SORT)
- [ ] 3-column responsive card grid (1→2→3 cols)
- [ ] Company cards: logo, name, industry tag, description (3-line clamp), headcount, open reqs, location, HIRING badge
- [ ] Terminal-style pagination (PREV/NEXT)
- [ ] Loading skeleton, empty state, error state
- [ ] Mobile responsive layout

---

### 9.2 Priority 2: Company Profile (Critical)

**Backend Dependency:** `GET /api/v1/company/:companyId` (public, no auth required) — current endpoint requires auth

**Files to Change:**
- `src/features/company/pages/CompanyProfilePage.tsx` — Full rewrite (or new `PublicCompanyProfilePage.tsx`)
- `src/routes/_public/companies.$companyId.tsx` — Update route component
- `src/features/company/api/index.ts` — Add public endpoint

**Reusable Components:**
- `LoadingState`
- `EmptyState`
- `ErrorState`
- New: `StatsBar` (TEAM_STRENGTH, ESTABLISHED, HQ_COORDINATES)
- New: `JobCard` (for open positions)
- New: `CultureMetrics` (progress bars)
- New: `TechStack` (tag chips)
- New: `TeamMember` (photo, name, title)

**Design References:**
- `Design/company_profile_page/code.html` — Desktop mockup
- `Design/company_profile_page_mobile_view/code.html` — Mobile mockup
- `Design/company_profile_page_refined_action/code.html` — Variant
- `Design/company_profile_page_mobile_refined_action/code.html` — Mobile variant

**Acceptance Criteria:**
- [ ] 12-column grid (8+4)
- [ ] Company header: grayscale logo, slug, name (masthead-4xl), industry tag
- [ ] Stats bar: TEAM_STRENGTH, ESTABLISHED, HQ_COORDINATES
- [ ] About Us section with description and lab image
- [ ] Open Roles list with filter tabs
- [ ] Sidebar: Join Network card, Culture Metrics, Tech Stack, Leadership
- [ ] FOLLOW VOLT_TECH button
- [ ] Mobile: centered hero, back/share buttons, bottom nav
- [ ] Responsive across all breakpoints

---

### 9.3 Priority 3: Job Marketplace (High)

**Files to Change:**
- `src/features/jobs/components/JobsMarketplace.tsx` — Layout rewrite
- `src/features/jobs/components/` — New job card component

**Reusable Components:**
- `LoadingState`
- `EmptyState`
- `ErrorState`
- `SearchInput`
- New: `JobCard` (logo, company, title, bookmark, tags, salary, posted date, avatars)
- New: `FilterBar` (sticky horizontal bar with dropdowns)

**Design References:**
- `Design/jobs_marketplace_public_page/code.html` — Primary mockup
- `Design/jobs_marketplace_grid/code.html` — Grid variant
- `Design/jobs_marketplace_mobile_view/code.html` — Mobile mockup

**Acceptance Criteria:**
- [ ] Hero with `// JOB_DISCOVERY` label
- [ ] Sticky horizontal filter bar with search + dropdown selects
- [ ] 2-column job card grid (`lg:grid-cols-2`)
- [ ] Job cards: 48×48 logo, company name, job title, bookmark, tags (bordered pills), salary (primary color), posted date (dashed footer), team avatars
- [ ] Featured card variant (left gradient bar + badge)
- [ ] Sort control inline with grid header
- [ ] Load More / infinite scroll
- [ ] Mobile responsive (single column)

---

### 9.4 Priority 4: Job Detail Enhancements (High)

**Files to Change:**
- `src/features/jobs/components/JobDetailPage.tsx` — Add Responsibilities/Requirements sections
- `src/features/jobs/types/index.ts` — May need extended types

**Reusable Components:**
- Existing: Badge, CompanyCard
- New: `NumberedList` (01, 02, 03 items)
- New: `BulletList` (/ prefix items)
- New: `MobileStickyCTA` (fixed bottom bar)

**Design References:**
- `Design/job_detail_page/code.html` — Desktop mockup
- `Design/job_detail_page_mobile_view/code.html` — Mobile mockup

**Acceptance Criteria:**
- [ ] Separate `// RESPONSIBILITIES` section with numbered list (01, 02, 03, 04)
- [ ] Separate `// REQUIREMENTS` section with bullet list (/ prefix)
- [ ] Sidebar: "Applicants: X" count (currently shows "Expires")
- [ ] Sidebar: Company detail rows (Industry, Size, Funding)
- [ ] Mobile: Sticky "APPLY NOW" bottom bar
- [ ] Mobile: Bottom tab navigation (Jobs, Saved, Applied, Profile)
- [ ] Mobile: Company card with photo, Founded/HQ grid

---

### 9.5 Priority 5: Landing Page Fixes (Medium)

**Files to Change:**
- `src/features/public/pages/LandingPage.tsx` — Icon fixes, footer alignment
- `src/features/public/components/PublicHeader.tsx` — Nav link alignment
- `src/features/public/components/PublicFooter.tsx` — Layout alignment

**Reusable Components:**
- New: `PressGrid` (decorative gradient tile background)
- New: `SectionLabel` (`// PREFIX` label)

**Design References:**
- `Design/public_landing_page/code.html` — Primary mockup
- `Design/landing_page_desktop/code.html` — Internal variant

**Acceptance Criteria:**
- [ ] Replace all `&#9632;` placeholders with Hugeicons
- [ ] Align nav links with design (or document intentional deviation)
- [ ] Footer layout: consider single-row vs 4-column decision
- [ ] Add Press Grid as reusable component
- [ ] Feature icons: use Hugeicons instead of character placeholders

---

### 9.6 Priority 6: 404 Page (Medium)

**Files to Change:**
- `src/components/NotFoundPage.tsx` — Full rewrite

**Reusable Components:**
- `PressGrid` (from Priority 5)
- New: `ErrorHero` (large error code with glitch aesthetic)

**Design References:**
- `Design/404_page/code.html` — Desktop mockup

**Acceptance Criteria:**
- [ ] Large `404` error code as hero (96px masthead)
- [ ] `// PAGE_NOT_FOUND` label
- [ ] Terminal-tone description
- [ ] Press Grid illustration (3×3 tiles with glitch)
- [ ] Primary CTA: "Return to Dashboard" with icon
- [ ] Secondary CTA: "Browse Jobs"
- [ ] Section labels: `// ERR_VISUAL_RENDER`, coordinates
- [ ] Footer: `// POSTBOARD_SYSTEMS_OFFLINE` status
- [ ] Background: ambient grid lines (64px)

---

### 9.7 Priority 7: Empty States Redesign (Medium)

**Files to Change:**
- `src/shared/components/ux/EmptyState.tsx` — Redesign

**Reusable Components:**
- `PressGrid` (from Priority 5)

**Design References:**
- `Design/empty_states_reference_guide/code.html` — Reference mockup

**Acceptance Criteria:**
- [ ] Bordered card container with hover accent
- [ ] Press Grid tile illustration (6 variations)
- [ ] Title: `font-ui-lg` (sans, 18px)
- [ ] Description: `font-body-base` (15px)
- [ ] Action button: primary/ghost variants, mono-label, uppercase
- [ ] Grid layout support (1→2→3 cols)

---

### 9.8 Priority 8: Maintenance Page (Low)

**Files to Change:**
- `src/routes/maintenance.tsx` — New route
- `src/features/public/pages/MaintenancePage.tsx` — New component

**Reusable Components:**
- `PressGrid`
- `SectionLabel`

**Design References:**
- `Design/maintenance_page/code.html` — Desktop mockup

**Acceptance Criteria:**
- [ ] Press-grid background with scanlines
- [ ] `// SYSTEM_MAINTENANCE` label with wrench icon
- [ ] "The Press is Resting." headline
- [ ] Description with expected return time
- [ ] Status indicators (API/DB/CDN dots)
- [ ] Footer: `PostBoard // Infrastructure` + `Status: Offline`

---

## 10. Backend Dependencies Summary

| Feature | Endpoint | Auth | Status |
|---------|----------|------|--------|
| Companies Directory | `GET /api/v1/companies` | None | **Not implemented** |
| Company Profile (public) | `GET /api/v1/company/:companyId` | None (currently requires auth) | **Needs auth change** |
| Company Follow | `POST /api/v1/company/:companyId/follow` | Token | **Not implemented** |
| Job Listings (public) | `GET /api/v1/job` | None | ✓ Implemented |
| Job Detail (public) | `GET /api/v1/job/:id` | None | ✓ Implemented |

---

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Backend doesn't add public companies endpoint | High | Companies page cannot function | Document dependency, proceed with other pages |
| Company profile requires auth change | Medium | Public profile inaccessible | Work with backend to add public route |
| Press Grid animation causes performance issues | Low | Mobile performance degradation | Use CSS-only animations, test on low-end devices |
| Icon library doesn't have all Material Symbols | Medium | Some icons won't match design exactly | Use closest Hugeicons equivalent, document deviations |

---

## 12. Appendix: Design Mockup Inventory

### Public Website Mockups with code.html

| # | Directory | Page | Variant |
|---|-----------|------|---------|
| 1 | `public_landing_page/` | Landing | Desktop |
| 2 | `public_landing_page_mobile_view/` | Landing | Mobile |
| 3 | `landing_page_desktop/` | Landing | Internal variant |
| 4 | `landing_page_mobile_view/` | Landing | Internal mobile |
| 5 | `about_page_desktop/` | About | Desktop |
| 6 | `features_page_desktop/` | Features | Desktop |
| 7 | `contact_page_desktop/` | Contact | Desktop |
| 8 | `privacy_policy_page_desktop/` | Privacy | Desktop |
| 9 | `terms_of_service_page_desktop/` | Terms | Desktop |
| 10 | `pricing_page_coming_soon/` | Pricing | Coming soon |
| 11 | `companies_directory_page/` | Companies | Directory |
| 12 | `company_profile_page/` | Company | Profile |
| 13 | `company_profile_page_refined_action/` | Company | Profile variant |
| 14 | `company_profile_page_mobile_view/` | Company | Mobile |
| 15 | `company_profile_page_mobile_refined_action/` | Company | Mobile variant |
| 16 | `jobs_marketplace_public_page/` | Jobs | Marketplace |
| 17 | `jobs_marketplace_grid/` | Jobs | Grid variant |
| 18 | `jobs_marketplace_mobile_view/` | Jobs | Mobile |
| 19 | `job_detail_page/` | Jobs | Detail |
| 20 | `job_detail_page_mobile_view/` | Jobs | Detail mobile |
| 21 | `404_page/` | Error | 404 |
| 22 | `maintenance_page/` | Status | Maintenance |
| 23 | `access_restricted_desktop/` | Error | Access restricted |
| 24 | `access_restricted_mobile_view/` | Error | Access restricted mobile |
| 25 | `action_not_allowed_desktop/` | Error | Action not allowed |
| 26 | `action_not_allowed_mobile_view/` | Error | Action not allowed mobile |
| 27 | `empty_states_reference_guide/` | Reference | Empty states |

### Mockups Without code.html (screen.png only)

| # | Directory | Notes |
|---|-----------|-------|
| 1 | `companies_directory_public_roster/` | Variant reference |
| 2 | `maintenance_page_platform_service/` | Variant reference |
| 3 | `access_restricted_action_not_allowed/` | Variant reference |

---

**End of Report**
