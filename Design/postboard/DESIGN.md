---
name: Postboard
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e1c0b2'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a88a7e'
  outline-variant: '#594237'
  surface-tint: '#ffb694'
  primary: '#ffb694'
  on-primary: '#571f00'
  primary-container: '#f06613'
  on-primary-container: '#4c1a00'
  inverse-primary: '#a14000'
  secondary: '#c9c6c0'
  on-secondary: '#31312c'
  secondary-container: '#474742'
  on-secondary-container: '#b7b5af'
  tertiary: '#c8c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#929090'
  on-tertiary-container: '#2a2a29'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb694'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7b2f00'
  secondary-fixed: '#e5e2db'
  secondary-fixed-dim: '#c9c6c0'
  on-secondary-fixed: '#1c1c18'
  on-secondary-fixed-variant: '#474742'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474646'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  rule: '#1A1A1A'
  muted: '#2A2A2A'
  dim: '#666666'
  body: '#B8B8B8'
  live: '#22C55A'
  live-dim: '#14532D'
  destructive: '#EF4444'
  gradient-a: '#C084FC'
  gradient-b: '#60A5FA'
  gradient-c: '#34D399'
  gradient-d: '#F59E0B'
typography:
  masthead-4xl:
    fontFamily: Playfair Display
    fontSize: 96px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-2xl:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-2xl-mobile:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  ui-xl:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  ui-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.5'
  body-base:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
  ui-sm:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.05em
spacing:
  unit: 4px
  gutter: 24px
  margin: 32px
  section-v-pad: 48px
  sidebar-width: 220px
  max-width: 1280px
---

## Brand & Style

This design system, titled the **Industrial Broadsheet**, is a high-density, technical aesthetic that blends the authoritative weight of editorial print with the precision of a developer terminal. It is designed for elite recruitment and technical pipeline management, where clarity, speed, and information density are paramount.

The visual language is characterized by **Brutalism** and **Minimalism**. It intentionally rejects modern SaaS "softness"—there are no rounded corners, no soft shadows, and no pastel gradients. Instead, it utilizes high-contrast typography, hairline monochromatic rules, and a strict "pure black" ground. The primary emotional response is one of serious, professional utility, punctuated by a singular, vibrant amber accent that mimics the "press ink" of a physical broadsheet.

### Key Attributes
- **Zero-Radius Geometry:** A strict 0px border radius policy for all containers, inputs, and buttons.
- **Editorial Hierarchy:** Massive serif mastheads contrasted against utilitarian sans-serif UI and technical monospace labels.
- **System Transparency:** Technical metadata and section wayfinding are elevated using `//` monospace prefixes.
- **Iridescent Data:** Decorative elements and complex data objects use high-saturation gradients to denote "live" intelligence within a static grid.

## Colors

The color palette is strictly dark and high-contrast. The ground is a pure black (`#080808`), providing a void-like backdrop for structural elements. 

- **Primary Accent:** Amber (`#E8610A`) is used exclusively for primary actions, active states, and critical path indicators.
- **Surface & Rules:** Surfaces use a slightly lighter "ink" black (`#0F0F0F`). Borders and dividers use a hairline "rule" grey (`#1A1A1A`) to maintain a dense, grid-like structure without adding visual bulk.
- **Typography:** Headlines use an off-white "paper" tint (`#F0EDE6`) for maximum legibility, while body text is pulled back to a softer grey (`#B8B8B8`) to reduce eye strain in dense environments.
- **Status Vocabulary:** "Live" success states use a vibrant green, while destructive actions use a sharp red.
- **Data Iridescence:** A specific four-stop gradient palette is reserved for "The Press Grid" and complex data chips, providing a "digital oil slick" effect that distinguishes data-rich objects from the structural UI.

## Typography

The typographic system is a tripartite strategy that defines the "Editorial Voice" of the system:

1.  **Serif (Playfair Display):** Reserved for page-level mastheads, hero statistics, and editorial section titles. It should never be used for functional UI components like buttons or inputs.
2.  **Sans (DM Sans):** The workhorse for all standard UI elements, body copy, and form fields. It provides a neutral, modern balance to the dramatic serif.
3.  **Mono (JetBrains Mono):** Used for technical metadata, audit logs, job IDs, and structural section wayfinding. All section labels must use the `//` prefix (e.g., `// PIPELINE_STATUS`).

**Scalability:** Mastheads should scale down aggressively on mobile, while body copy remains at a legible 15px across all breakpoints.

## Layout & Spacing

This design system uses a **Fixed-Fluid Hybrid Grid**. The primary dashboard contains a fixed 220px sidebar with a fluid 12-column main content area. Public-facing landing pages utilize a standard 12-column fixed grid capped at 1280px.

### Principles
- **Density:** Spacing is tight, modeled after Linear.app and Vercel. 
- **Rhythm:** All spacing must be a multiple of the 4px base unit. 
- **Monochromatic Rules:** Vertical and horizontal dividers (`1px solid #1A1A1A`) are used extensively to define grid cells.
- **Mobile Reflow:** On mobile devices, the 12-column grid collapses to a single column, and the sidebar transitions to a bottom-docked navigation bar or a full-screen drawer. Gutters reduce from 24px to 16px.

## Elevation & Depth

This system is **flat by design**. It rejects the use of drop shadows and elevation-based lighting. Depth is instead conveyed through:

- **Tonal Layering:** The primary page ground is `#080808`. Surface containers (cards, sidebars) use `#0F0F0F`. This subtle shift creates a "stacked" effect without the need for shadows.
- **Monochromatic Outlines:** Boundaries are defined by `#1A1A1A` hairline borders. 
- **Interaction States:** Depth "change" is shown through color inversion rather than height. For example, a hovered card may change its border from `#1A1A1A` to the primary amber accent (`#E8610A`).
- **Overlays:** Modals and drawers use a `rgba(0,0,0,0.8)` dimming effect. Critically, **no backdrop blur** is applied, maintaining the crisp, pixel-perfect aesthetic of a technical tool.

## Shapes

The shape language is the most strictly enforced rule in the design system. All primary UI containers—including buttons, input fields, cards, and modals—must have a **0px border radius**.

**Exceptions:**
- **Status Badges:** Small inline chips and badges may use a `2px` radius (`--radius-sm`) to distinguish them as discrete interactive tokens.
- **Category Pills:** Only used for tags or categories, these may use a full pill-shape (`999px`). 
- **The Press Grid:** Individual tiles within the decorative grid are sharp 0px squares.

## Components

### Buttons
- **Primary:** Solid `#E8610A` fill with `#080808` text. 0px radius.
- **Secondary:** Transparent fill with `1px solid #1A1A1A` border and `#F0EDE6` text.
- **Ghost:** No border, `#B8B8B8` text. Inverts to white text on hover.

### Section Labels
- **Format:** All section headers in technical contexts must be prefixed with `//`. 
- **Style:** `JetBrains Mono`, XS, Uppercase, prefixed with double slash. Example: `// AUDIT_LOG`.

### Cards & Tables
- **Grid:** All cards must be 0px radius with `#1A1A1A` borders.
- **Data Density:** Tables should use monochromatic rules between every row. Cell padding should be minimal (8px - 12px vertical).
- **Audit Logs:** Modeled after Vercel deployment logs; monospace text, timestamped, using `#666666` for metadata and `#B8B8B8` for content.

### Inputs
- **Style:** 0px radius, `#080808` background, `1px solid #1A1A1A` border.
- **Active State:** Border changes to `#E8610A`.

### The Press Grid
- A signature decorative component featuring a grid of squares.
- Uses iridescent gradients (`--gradient-a` through `--gradient-d`) with a "stipple" or grain texture.
- Interactive behavior: Individual tiles invert colors or scale slightly on hover.

### Status Badges
- **OPEN:** Green background (`#14532D`) with `#22C55A` text.
- **DRAFT:** Dashed `#1A1A1A` border with `#666666` text.
- **REJECTED:** Red background with `#EF4444` text.