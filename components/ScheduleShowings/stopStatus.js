// Tour stop status — constants and display helpers.
//
// `tailwindKey` is the suffix used with the `tour-stop-*` Tailwind color
// namespace we added in 3b-1. It differs from `value` only for
// `not_available` (Tailwind class naming doesn't allow underscores in
// the class name; we use `not-available` as the CSS identifier).

export const STOP_STATUSES = [
    { value: 'pending', label: 'Pending', tailwindKey: 'pending' },
    { value: 'requested', label: 'Requested', tailwindKey: 'requested' },
    { value: 'confirmed', label: 'Confirmed', tailwindKey: 'confirmed' },
    { value: 'not_available', label: 'Not Available', tailwindKey: 'not-available' },
    { value: 'showed', label: 'Showed', tailwindKey: 'showed' },
    { value: 'skipped', label: 'Skipped', tailwindKey: 'skipped' },
];

// Fallback "pending" entry used when a stop has a missing or unknown
// status value. Keeps UI resilient to pre-3b-1 saved tours and any
// future enum additions the client doesn't recognize yet.
const FALLBACK = STOP_STATUSES[0];

export const getStatusMeta = (statusValue) => {
    if (!statusValue) return FALLBACK;
    return STOP_STATUSES.find((s) => s.value === statusValue) || FALLBACK;
};

// Resolve a tour-stop color CSS variable to a runtime-usable color string
// for SVG markers. Returns an hsl() string that Google Maps happily
// consumes as a fill/stroke value — no manual HSL→HEX conversion needed.
//
// SSR-safe: returns the status-trash hex fallback when `window` is
// unavailable so marker construction never throws during any server
// pre-render path.
const cssVarToColor = (varName) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return '#444444';
    }
    const hsl = window.getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
    if (!hsl) return '#444444';
    return `hsl(${hsl})`;
};

export const getStatusHex = (statusValue) => {
    const meta = getStatusMeta(statusValue);
    return cssVarToColor(`--tour-stop-${meta.tailwindKey}`);
};

// Short display string for a stop's scheduled time, e.g. "2:30 PM".
// We intentionally ignore the date portion of the stored Date per the
// Phase 3a discovery — the date is carried at the tour level only.
export const formatStopTime = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};
