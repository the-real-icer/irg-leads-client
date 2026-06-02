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

## Lesson addendum: Tailwind `group` / `group-hover:` also unreliable in the CRM
Date: 2026-04-16
Context: SavedToursList delete X button used `group` + `group-hover:opacity-100` to show on hover. Console diagnostic confirmed opacity stayed at 0 even while hovering — the group-hover chain doesn't trigger. Likely another class-name collision (PrimeReact or PrimeFlex defines `.group`).
Rule: In the CRM client, do NOT rely on Tailwind's `group` / `group-hover:` / `group-focus:` utilities. They're structurally the same kind of global-class-name dependency as `.grid` and `.flex-1`. If hover-to-reveal behavior is genuinely needed, use React state (`onMouseEnter`/`onMouseLeave` + `useState`) rather than CSS-only hover chains. Prefer always-visible controls where possible — they're more consistent with the rest of the CRM and better UX for destructive actions anyway.

## Lesson: print-verification harness must load PrimeFlex
Date: 2026-06-01
Context: The schedule-showings print packet (`components/Print/*`) is rendered inside the Pages Router (`pages/schedule-showings`), where `pages/_app.jsx` globally loads PrimeFlex. PrimeFlex overrides `.grid` (`display:flex; margin:-0.5rem`). A dev verification harness was built as an **App-Router** route (`app/dev-print-preview`) because App Router bypasses `_app.jsx` auth/persist gating — but App-Router routes also DON'T load PrimeFlex. So the harness rendered the print components with real CSS grids while the production packet rendered them as broken flexboxes. The harness passed clean (12px gap between the bd/ba/sqft line and the stat boxes), but a real Chrome print-to-PDF showed an 8px overlap and full-page photo blowout (a 3-stop tour ballooned 8→14 pages). The fixture's "different renderer" silently hid every `.grid`-collision bug.
Rule: Any harness/preview used to verify CRM print or grid-heavy work MUST import `primeflex/primeflex.css` AFTER Tailwind, so it reproduces the real Pages-Router cascade. App-Router previews without it give false confidence. After adding the import, the harness reproduced both bugs exactly, and the fixes (drop hijacked `grid` class, set `display:grid` inline + bounded photo heights) verified correctly. General principle: verify in the same CSS environment the code actually ships in — when in doubt, confirm with `getComputedStyle` (`display` should be `grid`, not `flex`; `margin-top` should be your Tailwind value, not `-8px`).
