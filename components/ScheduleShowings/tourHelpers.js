// Helpers for the Schedule Showings feature.

import ikUrl from '../../utils/imageKit';

export const formatBedsBaths = (stop) => {
    if (!stop) return '';
    const beds = Number.isFinite(stop.bedrooms) ? `${stop.bedrooms} bd` : '';
    const baths = Number.isFinite(stop.bathrooms) ? `${stop.bathrooms} ba` : '';
    if (beds && baths) return `${beds} · ${baths}`;
    return beds || baths;
};

export const formatSqft = (sqftRaw) => {
    if (!Number.isFinite(sqftRaw) || sqftRaw <= 0) return '';
    return `${sqftRaw.toLocaleString()} sqft`;
};

export const hasValidCoords = (stop) => {
    const lat = stop?.coordinates?.lat;
    const lng = stop?.coordinates?.lng;
    return Number.isFinite(lat) && Number.isFinite(lng);
};

export const isAlreadyInTour = (stops, mlsNumber) => {
    if (!Array.isArray(stops) || !mlsNumber) return false;
    return stops.some((s) => s.mls_number === mlsNumber);
};

// Format a scheduled date for inline display in metadata lines.
// Returns short month + day, e.g. "Apr 18". Current year omitted
// when the date is in the current year.
export const formatScheduledDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const now = new Date();
    const opts = d.getFullYear() === now.getFullYear()
        ? { month: 'short', day: 'numeric' }
        : { month: 'short', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString(undefined, opts);
};

// Short relative-time formatter. Deliberately tiny — we don't pull in
// date-fns just for this. Inputs: Date | ISO string | null/undefined.
export const formatRelativeTime = (input) => {
    if (!input) return '';
    const then = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(then.getTime())) return '';
    const diffMs = Date.now() - then.getTime();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 10) return 'just now';
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 30) return `${day}d ago`;
    return then.toLocaleDateString();
};

// Build a normalized dirty-tracking snapshot — used by the page to
// decide if the current editor state differs from the last saved state.
// Keep this stable and deterministic (same inputs → same string).
export const buildTourSnapshot = ({ name, client, scheduledDate, stops }) => JSON.stringify({
    name: (name || '').trim(),
    client: client?._id || null,
    scheduled_date: scheduledDate
        ? (scheduledDate instanceof Date ? scheduledDate.toISOString() : scheduledDate)
        : null,
    stops: Array.isArray(stops)
        ? stops.map((s, idx) => ({
            mls_number: s.mls_number,
            order: idx,
            note: s.note || '',
            scheduled_time: s.scheduled_time || null,
        }))
        : [],
});

// Filter the Redux leads list by a case-insensitive substring match
// against first_name, last_name, full-name, and email.
export const filterLeadsByQuery = (leads, query) => {
    if (!Array.isArray(leads)) return [];
    const q = (query || '').trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((lead) => {
        const first = (lead?.first_name || '').toLowerCase();
        const last = (lead?.last_name || '').toLowerCase();
        const email = (lead?.email || '').toLowerCase();
        const full = `${first} ${last}`.trim();
        return first.includes(q) || last.includes(q) || email.includes(q) || full.includes(q);
    });
};

// Normalize a raw /suggest result into the local `stop` shape the
// page state holds. Uses the canonical CRM pattern: prefer `media_url`
// (always populated at ingestion), fall back to `thumb_webp` (the one
// other field ingestion reliably writes), proxy through ImageKit via
// ikUrl(). ?preset=Small gives us a thumbnail-sized optimized image.
// Matches components/Property/PropertyGallery/PropertyGallery.jsx:11.
export const stopFromSuggestResult = (result) => {
    const pic = Array.isArray(result?.listing_pictures)
        && result.listing_pictures.length > 0
        ? result.listing_pictures[0]
        : null;
    const sourceUrl = pic?.media_url || pic?.thumb_webp || null;
    const thumbnail = sourceUrl
        ? ikUrl(sourceUrl.replace(/http:/, 'https:').concat('?preset=Small'))
        : undefined;

    return {
        mls_number: result.mls_number,
        address: result.address,
        unit_number: result.unit_number,
        city: result.city,
        state: result.state,
        zip_code: result.zip_code,
        price: result.price,
        price_raw: result.price_raw,
        bedrooms: result.bedrooms,
        bathrooms: result.bathrooms,
        sqft_raw: result.sqft_raw,
        status: result.status,
        coordinates: {
            lat: result?.coordinates?.lat,
            lng: result?.coordinates?.lng,
        },
        thumbnail,
    };
};
