# ICE Realty Group — Design System Master

This file is the single source of truth for UI work across `website/client` and `backend/client`.
Claude reads this at the start of any UI session.

---

## Brand Identity

**Primary brand:** Navy `#163D5C` — authority, trust, professionalism
**Secondary brand:** Green `#8EDD65` — energy, action, San Diego lifestyle
**Personality:** Clean, modern, professional real estate — not corporate-sterile, not flashy

---

## Color System

### How It Works
Colors are **semantic CSS variables** defined in `design-tokens.css`, consumed via Tailwind tokens.
**Always use semantic tokens** — never use raw `navy-800` or `green-500` for UI elements.
Raw palette scales (`navy-*`, `green-*`) are for brand illustrations and one-off accents only.

### Usage Pattern
```
Tailwind:   bg-primary, text-foreground, border-border
CSS/SCSS:   color: hsl(var(--foreground));
Opacity:    bg-primary/50, hsl(var(--primary) / 0.5)
```

### Semantic Token Reference

| Token | Light Value | Dark Value | Use |
|---|---|---|---|
| `background` | warm off-white `#FAFAF8` | deep navy `#0B1520` | Page background |
| `surface` | pure white | navy surface `#132231` | Cards, panels |
| `surface-elevated` | pure white (shadow-diff) | lighter navy `#1C2E40` | Modals, dropdowns |
| `foreground` | brand-tinted near-black | near-white w/ green hint | Body text |
| `foreground-muted` | medium gray, navy undertone | muted slate | Secondary text, labels |
| `primary` | brand navy `#163D5C` | lifted navy (for contrast) | Primary buttons, headings, links |
| `primary-foreground` | white | white | Text on primary |
| `primary-hover` | lighter navy | lighter still | Button hover states |
| `secondary` | vibrant green `#8EDD65` | slightly lifted green | CTAs, badges, highlights |
| `secondary-foreground` | navy | deep navy | Text on green |
| `secondary-hover` | deeper green | brighter green | CTA hover |
| `accent` | whisper-teal surface | dark teal | Hover surfaces, subtle highlights |
| `accent-foreground` | navy | near-white | Text on accent |
| `muted` | subtle gray bg | dark navy | Muted backgrounds |
| `muted-foreground` | de-emphasized text | muted slate | Placeholder, helper text |
| `border` | `#E5E7EB` | dark navy border | Default borders |
| `border-subtle` | lighter | darker | Dividers |
| `ring` | brand navy | lifted navy | Focus rings |
| `success` | emerald | brighter emerald | Success states |
| `warning` | amber | brighter amber | Warning states |
| `danger` | red | brighter red | Error states |

### Sidebar Tokens
Sidebar always uses brand navy regardless of mode — use `sidebar`, `sidebar-foreground`, `sidebar-border`, `sidebar-accent`.

### Lead Status Badge Colors
These are mode-invariant — same in light and dark:
`status-watch` (amber), `status-hot` (orange-red), `status-qualify` (olive), `status-new` (yellow),
`status-nurture` (blue), `status-trash` (dark gray), `status-archive` (purple),
`status-pending` (pink), `status-closed` (teal)

### Raw Brand Palette (accent/illustration use only)
```
navy-800: #163D5C  ← brand anchor
green-500: #8EDD65 ← vibrant brand green
green-400: #9ACF87 ← soft green (used in "Responds Quickly" indicator)
green-300: #AACE8A ← muted green
```

---

## Typography

**Font:** Lato for everything — headings and body. No mixing fonts.
`font-sans` and `font-heading` both resolve to Lato.
`font-mono` → JetBrains Mono (code/data only)

### Type Scale
| Token | Size | Line Height | Use |
|---|---|---|---|
| `text-xs` | 0.75rem | 1rem | Labels, badges, meta |
| `text-sm` | 0.875rem | 1.25rem | Secondary body, table cells |
| `text-base` | 1rem | 1.5rem | Primary body copy |
| `text-lg` | 1.125rem | 1.75rem | Lead text, card headers |
| `text-xl` | 1.25rem | 1.75rem | Section subheadings |
| `text-2xl` | 1.5rem | 2rem | Section headings |
| `text-3xl` | 1.875rem | 2.25rem | Page headings |
| `text-4xl` | 2.25rem | 2.5rem | Hero headings |

### Font Weights
`font-normal` (400), `font-medium` (500), `font-semibold` (600), `font-bold` (700)

### Common Heading Patterns (from codebase)
```jsx
// Section heading
<h2 className="text-[22px] font-bold text-primary">

// Page/card heading
<h3 className="text-xl font-semibold text-foreground">

// Label / eyebrow
<span className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
```

---

## Spacing & Layout

### Standard Card Pattern
This is the dominant layout pattern across the property page and CRM:
```jsx
<div className="bg-surface rounded-[16px] border border-border shadow-sm p-[24px] md:p-[32px]">
```
- Background: `bg-surface`
- Radius: `rounded-[16px]` (2xl = 20px for hero cards, 16px for standard)
- Border: `border border-border`
- Shadow: `shadow-sm` (default), `shadow-card-hover` on hover
- Padding: `p-[24px]` mobile, `md:p-[32px]` desktop

### Grid Layout (content + sidebar)
```jsx
<div className="grid grid-cols-1 min-[900px]:grid-cols-[minmax(0,1fr)_300px] gap-[24px] items-start">
```
Custom breakpoint at 900px — not standard Tailwind `md:` (768px).
Sidebar: `sticky top-[145px]` (accounts for topbar + section nav height).

### Sidebar & Topbar Dimensions
```
--sidebar width:  280px  (spacing-sidebar)
--topbar height:  60px   (spacing-topbar)
```

### Layout Utility Classes
```
propPage_container   — max-width content wrapper with horizontal padding
propPage_desktopOnly — hidden on mobile, visible desktop
propPage_mobileOnly  — visible mobile, hidden desktop
propPage_section     — full-width section wrapper
```

### Spacing Extras
Custom tokens: `4.5` (1.125rem), `13`, `15`, `18`, `22`, `30`

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| `rounded-sm` | 4px | Inputs, small badges |
| `rounded` | 6px (var) | Standard — buttons, inputs |
| `rounded-md` | 8px | Form controls |
| `rounded-lg` | 12px | Larger cards, panels |
| `rounded-xl` | 16px | Standard cards (matches `rounded-[16px]`) |
| `rounded-2xl` | 20px | Hero cards, featured sections |
| `rounded-full` | 9999px | Avatars, pills |

---

## Shadows

Always use named shadow tokens — never raw `shadow-*` values:

| Token | Use |
|---|---|
| `shadow-xs` | Subtle depth, barely-there |
| `shadow-sm` | Default card shadow |
| `shadow-card` | Card resting state |
| `shadow-card-hover` | Card hover — apply with `hover:shadow-card-hover` |
| `shadow-dropdown` | Dropdowns, popovers |
| `shadow-modal` | Modals, dialogs |
| `shadow-xl` | Hero sections, large panels |

All shadows use `--shadow-color` which is navy-tinted light mode, near-black dark mode — they auto-adapt.

---

## Animations & Transitions

**Default transition:** 150ms — already the Tailwind default in this config.

| Animation | Token | Use |
|---|---|---|
| Dropdown open | `animate-slide-down` | Menus, tooltips appearing |
| Panel dismiss | `animate-slide-up` | Panels closing upward |
| Fade in | `animate-fade-in` | Modals, overlays |
| Fade + slide | `animate-fade-slide-in` | Cards, content entering |
| Progress bar | `animate-progress-indeterminate` | Loading states |

Transition durations: `duration-[100ms]` fast, `duration-[150ms]` default, `duration-[200ms]` normal, `duration-[300ms]` slow.

---

## Z-Index Scale

Always use named z-index tokens, never raw numbers:
```
z-dropdown:       1000
z-sticky:         1020
z-fixed:          1030
z-modal-backdrop: 1040
z-modal:          1050
z-popover:        1060
z-tooltip:        1070
z-toast:          1080
```

---

## Dark Mode Rules

**Implementation:** Class-based — `dark` class on `<html>` or `<body>`.
**Rule:** Every semantic token (`bg-surface`, `text-foreground`, `border-border`, etc.) auto-switches.
**You do NOT need `dark:` variants** when using semantic tokens correctly.
`dark:` variants are only needed when:
1. Using raw Tailwind colors (`dark:bg-gray-800`)
2. Using hardcoded values
3. Applying structural differences in dark mode (e.g. different shadows, opacity)

**Common mistake to avoid:**
```jsx
// ❌ Wrong — hardcoded, breaks dark mode
<div className="bg-white text-gray-900 border-gray-200">

// ✅ Correct — semantic, auto-switches
<div className="bg-surface text-foreground border-border">
```

---

## Component Patterns

### Interactive Elements
```jsx
// Primary button
<button className="bg-primary text-primary-foreground hover:bg-primary-hover
                   rounded px-4 py-2 font-medium transition-colors cursor-pointer">

// Secondary / CTA button (green)
<button className="bg-secondary text-secondary-foreground hover:bg-secondary-hover
                   rounded px-4 py-2 font-medium transition-colors cursor-pointer">

// Ghost / outline button
<button className="border border-border text-foreground hover:bg-accent
                   rounded px-4 py-2 font-medium transition-colors cursor-pointer">
```

### Status Badges
```jsx
<span className="bg-status-hot/15 text-status-hot text-xs font-semibold
                 px-2 py-0.5 rounded-full">
  Hot
</span>
```
Pattern: `bg-status-[name]/15` background, `text-status-[name]` text.

### "Responds Quickly" Indicator Style
Uses `green-400` (#9ACF87) as the dot fill — this is an intentional raw color use, not a semantic token.

### Skeleton Loading
Uses `react-loading-skeleton` — always pass `style={{ borderRadius: '16px' }}` to match card radius.

### Images
All property images via ImageKit CDN — use `getAgentImageUrl(image, size)` utility for agent photos.
Never use local `/public/` paths for property or agent images.

---

## Responsive Breakpoints

Standard Tailwind breakpoints plus one custom:
```
sm:   640px
md:   768px  
lg:   1024px
xl:   1280px
900px custom: min-[900px]: — used for content+sidebar grid switch
```
Mobile-first always. Test at 375px, 768px, 900px, 1280px.

---

## What Claude Should Do With This

1. **Always use semantic tokens** — `bg-surface` not `bg-white`, `text-foreground` not `text-gray-900`
2. **Dark mode is free** when tokens are used correctly — no extra `dark:` classes needed
3. **Match existing card pattern** — `bg-surface rounded-[16px] border border-border shadow-sm`
4. **Use the 900px breakpoint** for content/sidebar layouts, not `md:`
5. **Lato everywhere** — don't introduce other fonts
6. **Named shadows only** — `shadow-card`, `shadow-modal`, not `shadow-[0_4px_...]`
7. **Named z-index only** — `z-modal`, `z-dropdown`, not `z-[1050]`
8. **Check status badge pattern** before building any lead/property status indicator
