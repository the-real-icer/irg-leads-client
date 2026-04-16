# Lessons — CRM Client

Append new entries at the bottom. Each lesson documents a specific mistake or surprising behavior and the rule that prevents it from happening again.

---

## Lesson: Tailwind flex-1 is unreliable in the CRM
Date: 2026-04-16
Context: Schedule Showings two-column layout broke — right column got `flex: 0 1 auto` (Tailwind flex-1 value not applied) despite the class being in the source. Likely a CSS load-order or specificity conflict with PrimeFlex/PrimeReact global styles.
Rule: For two-column layouts in the CRM client, default to CSS Grid with explicit track widths (`grid-cols-[420px_1fr]`). Avoid relying on Tailwind's `flex-1` for width distribution. If flex MUST be used, set explicit widths or percentages on children rather than using flex-grow.

**Update 2026-04-16 (same day):** root cause confirmed — see next entry. The "CSS Grid with explicit track widths" rule above ALSO fails for the same reason. Use CSS Modules or arbitrary-named classes instead.

## Lesson: PrimeFlex hijacks Tailwind class names
Date: 2026-04-16
Context: CRM client imports PrimeFlex (via PrimeReact's theme chain). PrimeFlex defines `.grid`, `.flex-1`, `.col-*`, and other classes that collide with Tailwind utilities. Because PrimeFlex loads AFTER Tailwind in the CSS cascade, PrimeFlex wins on identical-specificity rules.

Symptoms: `.grid` becomes `display: flex` (PrimeFlex sets `.grid { display: flex; flex-wrap: wrap; margin: -.5rem; }`). `.flex-1` silently non-functional. Arbitrary grid-template-columns values (`grid-cols-[...]`) have no effect because the parent isn't actually a grid. The 1fr track collapses to 2px because there is no grid, just a flexbox with negative margins.

Confirmed PrimeFlex-owned classes (from `node_modules/primeflex/primeflex.css`):
- `.grid`
- `.flex`, `.flex-1`, `.flex-auto`, `.flex-column`, `.flex-row`, `.flex-wrap`, `.flex-nowrap`, `.flex-shrink-0`, `.flex-shrink-1`, `.flex-grow-0`, `.flex-grow-1`, `.flex-none`, `.flex-initial`, `.flex-order-0..6`, `.flex-row-reverse`, `.flex-column-reverse`, `.flex-wrap-reverse`
- `.col-1` through `.col-12`, `.col-offset-0` through `.col-offset-12`
- `.align-content-*`, `.align-items-*`, `.align-self-*` (Tailwind uses shorter `.content-*`, `.items-*`, `.self-*` so these are less likely to collide, but still worth knowing)
- `.h-*rem`, `.w-*rem`, `.p-*`, `.m-*` scale differs from Tailwind's rem system

Rule: For new CRM components, AVOID raw Tailwind `grid`, `flex-1`, `flex`, `flex-row`, `flex-wrap`, `col-1..col-12`, and any class name PrimeFlex might own. Safe options for layout:
1. **CSS Modules** (`*.module.css`) — hashed class names can't be targeted by PrimeFlex. Preferred for anything non-trivial.
2. **Inline `style={{...}}`** — highest specificity, always wins. Fine for one-offs.
3. **Arbitrary-value Tailwind classes with unique names** — `grid-cols-[...]`, `flex-col` (PrimeFlex uses `flex-column`, not `flex-col`), `items-*`, `self-*` — these are Tailwind-only and safe.
4. **Check getComputedStyle** when a Tailwind class isn't taking effect — PrimeFlex is the usual culprit.

Long-term remediation: strip PrimeFlex from the global chain once all PrimeReact components are migrated off it. That's a separate large project.
