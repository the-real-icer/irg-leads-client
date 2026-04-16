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
