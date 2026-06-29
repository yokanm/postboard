# DESIGN.md

# POSTBOARD Design System — Industrial Broadsheet

Version: 3.0

---

## 1. Design Identity

**Industrial Broadsheet** is a high-density, typography-first design language inspired by:
- Financial terminals (Bloomberg Terminal)
- Print broadsheet newspapers (The Guardian, The New York Times)
- Modern operational software (Linear, Notion, Vercel)

### Rejects
- ❌ Rounded SaaS UI
- ❌ Glassmorphism
- ❌ Neumorphism
- ❌ Shadow-heavy interfaces
- ❌ Gradient overload
- ❌ Decorative illustrations

### Prioritizes
- ✅ Information density
- ✅ Typographic hierarchy
- ✅ Monochrome + single accent
- ✅ Zero border-radius
- ✅ Border-based delineation
- ✅ High contrast
- ✅ Fast scanability

---

## 2. Typography

### Primary — DM Sans
Used for UI text, navigation, labels, body copy.
- Weights: 400 (Regular), 500 (Medium), 600 (Semibold)
- Sizing: 11px–16px for UI, larger for headings

### Display — Playfair Display
Used for large headings, hero text, masthead elements.
- Weights: 400 (Regular), 700 (Bold)
- Reserved for prominent text only

### Monospace — JetBrains Mono
Used for code, system labels, data values, terminal-style UI.
- Weights: 400 (Regular), 500 (Medium)
- Used for `mono-label` class (uppercase, tracked-out)

### Type Scale
```
--font-sans: DM Sans, system-ui, sans-serif
--font-serif: Playfair Display, Georgia, serif
--font-mono: JetBrains Mono, Fira Code, monospace
--font-masthead: Playfair Display (hero headings)

font-ui-sm:   11px  (secondary labels, metadata)
font-ui:      12px  (small UI, table cells)
font-ui-base: 13px  (body text, default)
font-ui-md:   14px  (section headers, nav)
font-ui-lg:   16px  (card titles)
font-heading: 24px  (page headings)
font-masthead: 64px (hero, landing)
```

---

## 3. Color Palette

### Light Mode
```
--background:           #FAFAF8
--on-surface:           #1C1C1A
--body:                 #1C1C1A
--dim:                  #6B6B68
--muted:                #9C9C98
--rule:                 #D4D4D0
--ink:                  #FFFFFF
--surface-container:     #F0F0EC
--surface-container-low: #F5F5F2
--surface-container-high:#E8E8E4
--primary-container:    #A68B3C
--destructive:          #B33A3A
--error:                #B33A3A
--error-container:      #FDEDED
--live:                 #2A7A4A
--live-dim:             #E8F5EC
--press-amber:          #C8A84E
--gradient-a:           #8B7355
--gradient-b:           #5B7B9A
```

### Dark Mode
```
--background:           #0F0F0D
--on-surface:           #E8E8E4
--body:                 #D4D4D0
--dim:                  #8A8A86
--muted:                #5C5C58
--rule:                 #2A2A28
--ink:                  #1A1A18
--surface-container:     #1C1C1A
--surface-container-low: #161614
--surface-container-high:#242422
--primary-container:    #C8A84E
--destructive:          #DC5A5A
--error:                #DC5A5A
--error-container:      #3D1A1A
--live:                 #4ADE80
--live-dim:             #1A3D2A
--press-amber:          #C8A84E
--gradient-a:           #8B7355
--gradient-b:           #5B7B9A
```

### Accent Behavior
- Primary action color: `--primary-container` (amber/gold)
- No blue primary (differentiates from generic SaaS)
- Red only for destructive/errors
- Green only for success/live states
- Text colors limited to 3 levels: `--on-surface` (primary), `--body` (secondary), `--dim` (tertiary)

---

## 4. Spacing System

```
--margin:       24px  (page margins)
--section-v-pad: 64px (section vertical padding)
--gap-sm:       4px
--gap-md:       8px
--gap-lg:       12px
--gap-xl:       16px
--gap-2xl:      24px
```

Based on 4px grid. All spacing uses multiples of 4.

### Card Padding
- Cards: `p-4` (16px)
- Data-dense cards: `p-3` (12px)
- Compact table cells: `px-3 py-2` (12px horizontal, 8px vertical)

---

## 5. Breakpoints

```
sm:  640px   (mobile landscape)
md:  768px   (tablet, sidebar appears)
lg:  1024px  (desktop)
xl:  1280px  (wide desktop)
2xl: 1536px  (ultra-wide)
```

### Layout Behavior
- Below `md`: Mobile single-column, bottom tab nav or top scrollable tabs
- `md`-`lg`: Sidebar appears, content expands
- Above `xl`: Max-width constraint, centered content

---

## 6. Component Design

### Sidebar
- Width: 224px (`w-56`)
- Background: `--surface-container-low`
- Border-right: `--rule`
- Active item: `--primary-container` text + 10% bg
- Hover item: `--surface-container` bg
- Mono label header with `// SECTION_NAME`

### Navbar (Topbar)
- Height: 64px
- Background: `--background`
- Border-bottom: `--rule`
- User menu: dropdown with avatar, role badge, logout
- Theme toggle: 3-button (light/dark/system)

### Cards
- Background: `--ink` (white in light, dark gray in dark)
- Border: `--rule` (1px solid)
- Padding: `p-4`
- Zero border-radius
- No shadows
- Hover: border color change to `--primary-container`

### Forms
- Input background: transparent or `--surface-container-low`
- Border: `--rule`
- Focus ring: 2px `--primary-container` outline
- Label: `font-ui-sm` uppercase, `--dim` color
- Error: `--destructive` border + message
- Input height: `h-9` (36px) for standard, `h-10` (40px) for primary

### Tables
- Header: `--surface-container-low` bg, `--dim` text, `font-sans text-[12px] uppercase tracking-wider`
- Rows: alternating `--ink` and `--surface-container-low`
- Hover row: `--surface-container` bg
- Border: `--rule` for cell dividers
- Compact cell padding: `px-3 py-2`
- Cursor pagination: "Load More" button or prev/next

### Dialogs
- Overlay: `bg-black/50` (50% black overlay)
- Content: `--ink` bg, `--rule` border
- Zero border-radius
- Width: `max-w-md` (448px) default, `max-w-lg` (640px) for large
- Header: title + close button
- Footer: action buttons (cancel + confirm)

### Badges
- `font-sans text-[11px] uppercase tracking-wider`
- Padding: `px-2 py-0.5`
- Color variants: status-based (pending/reviewed/shortlisted/rejected/accepted)
- Zero border-radius

### Notifications
- Bell icon in topbar with unread count badge
- Drawer: slides from right, `Sheet` component
- Notification item: icon + message + timestamp
- Read: `--dim` text, unread: `--on-surface` text + left border accent

### Skeletons
- Background: `--surface-container-high`
- Animated pulse via Tailwind `animate-pulse`
- Zero border-radius
- Width/height match content being loaded

### Loading States
- **Spinner variant**: Centered spinning icon + message
- **Skeleton variant**: Row of skeleton blocks matching content shape
- **Page variant**: Full-page centered spinner for route transitions

---

## 7. Animations

No decorative animations. Only functional:
- Dialog open/close (fade + scale, fast: 150ms)
- Sheet slide (150ms ease-out)
- Hover state transitions (150ms)
- Spinner rotation (1s linear infinite)
- Skeleton pulse (2s ease-in-out infinite)
- Route transitions: instant (no page transition animation)

---

## 8. Icons

- Single library: **Hugeicons** (core-free-icons)
- Size: 14px (small), 16px (default), 20px (large), 24px (x-large)
- Stroke width: 2 (default), 1.5 (detailed icons)
- Use `aria-hidden="true"` on all decorative icons
- Use `sr-only` text for icon-only buttons

---

## 9. Accessibility

- Focus indicators: 2px solid `--primary-container` outline with 2px offset
- Color contrast: all text meets WCAG AA (minimum 4.5:1 ratio)
- Interactive elements: minimum 44x44px touch target
- Form errors: linked to input via `aria-describedby`
- Dynamic content: uses `role="status"` or `role="alert"` for screen readers
- Skip-to-content link available

---

## 10. Responsive Behavior

### Mobile (< md: 768px)
- Sidebar hidden, replaced by top scrollable tab bar
- Tables collapse to card list
- Dialogs become full-screen
- Font sizes remain the same (no mobile scaling)
- Bottom padding for mobile nav

### Tablet (md-lg: 768-1024px)
- Sidebar visible but narrower
- Multi-column layouts collapse to 2 columns
- Tables remain horizontal with horizontal scroll

### Desktop (> lg: 1024px)
- Full layout with sidebar
- Multi-column grids (3-4 columns)
- Side-by-side detail panels

---

## 11. Future Design Tokens

Tokens reserved for future expansion:
- `--font-ui-xs`: 10px (for extreme density)
- `--radius-sm`: If radius is ever needed (not currently used)
- `--shadow-sm`, `--shadow-md`: If shadows are ever needed (not currently used)
- `--transition-fast`: 100ms
- `--transition-normal`: 200ms
- `--z-dropdown`, `--z-sticky`, `--z-modal`, `--z-toast`: z-index layers
