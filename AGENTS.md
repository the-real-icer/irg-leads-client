# AGENTS.md

## Scope
This repo is the internal CRM frontend.

## Design system
Follow the ICE Realty Group design system in `../../Website/client/design-system/Master.md` when applicable.

### Required rules
- Always use semantic design tokens for UI colors.
- Never use raw palette classes like `navy-*`, `green-*`, `bg-white`, or `text-gray-*` for normal UI.
- Prefer `bg-surface`, `text-foreground`, `border-border`, `bg-primary`, `bg-secondary`, and related semantic tokens.
- Dark mode should work through semantic tokens automatically; do not add unnecessary `dark:` variants.
- Use Lato for all UI typography.
- Preserve the existing type scale and heading patterns.
- Match the standard card pattern:
  - `bg-surface`
  - `rounded-[16px]`
  - `border border-border`
  - `shadow-sm`
  - `p-[24px] md:p-[32px]`
- Use named shadow tokens only.
- Use named z-index tokens only.
- For content + sidebar layouts, use the custom `min-[900px]:` breakpoint pattern instead of default `md:` when matching existing layout behavior.
- Reuse existing button, badge, form, modal, and card patterns before creating new UI.
- Keep responsive behavior consistent across 375px, 768px, 900px, and 1280px breakpoints.

## UI behavior rules
- Preserve the existing visual identity across CRM screens.
- Do not invent new admin patterns if an existing table, card, modal, badge, or form pattern already exists.
- Prioritize consistency, density, and readability for internal workflows.
- Be careful with lead statuses, badges, tables, and form-heavy screens.

## Implementation notes
- Check existing status badge styling before adding new lead/property status UI.
- When editing a component, match surrounding spacing, typography, and state styles exactly.
