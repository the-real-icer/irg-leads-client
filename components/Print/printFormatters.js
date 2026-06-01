import ikUrl from '../../utils/imageKit';
import { FALLBACK_IMAGE_LIGHT } from '../../utils/propertyImageFallback';

// Print resolution. The hero is rendered large (~4.5in wide on Letter) so it needs
// real pixels, not a thumbnail preset — request an explicit width transform. The
// smaller secondary tiles keep the named X-Large preset.
const HERO_IMAGE_PARAMS = 'tr=w-1600,q-80,f-auto';
const TILE_IMAGE_PARAMS = 'preset=X-Large';

// Append an ImageKit query (transform/preset) to a source URL, then route through
// ikUrl(). Hardened so a source that already carries a query string (`?…`) gets `&`
// instead of a second `?` (which would be a malformed double-query URL).
const ikImage = (sourceUrl, params) => {
    const normalized = String(sourceUrl).replace(/http:/, 'https:');
    if (!params) return ikUrl(normalized);
    const separator = normalized.includes('?') ? '&' : '?';
    return ikUrl(`${normalized}${separator}${params}`);
};

export const formatPrintDate = (value) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
};

export const formatGeneratedDate = (value) => {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

export const formatClientName = (client) => {
    if (!client) return '';
    const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
    return fullName || client.name || client.email || '';
};

export const formatAddressLine = (property) => {
    if (!property) return 'Address not available';
    const street = `${property.address || ''}${property.unit_number ? ` #${property.unit_number}` : ''}`.trim();
    return street || (property.mls_number ? `MLS #${property.mls_number}` : 'Address not available');
};

export const formatCityStateZip = (property) => {
    if (!property) return '';
    const cityState = [property.city, property.state].filter(Boolean).join(', ');
    return [cityState, property.zip_code].filter(Boolean).join(' ');
};

export const formatNumber = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return '';
    return numeric.toLocaleString();
};

export const formatPrice = (property) => {
    if (!property) return '';
    if (property.price) return property.price;
    const raw = Number(property.price_raw);
    if (!Number.isFinite(raw) || raw <= 0) return '';
    return raw.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    });
};

export const formatBedsBathsSqft = (property) => {
    if (!property) return '';
    const bedsValue = Number(property.bedrooms);
    const bathsValue = Number(property.bathrooms);
    const beds = Number.isFinite(bedsValue) && bedsValue > 0 ? `${property.bedrooms} bd` : '';
    const baths = Number.isFinite(bathsValue) && bathsValue > 0 ? `${property.bathrooms} ba` : '';
    const sqft = formatNumber(property.sqft_raw || property.sqft);
    return [beds, baths, sqft ? `${sqft} sqft` : ''].filter(Boolean).join(' / ');
};

export const formatLotSize = (property) => {
    if (!property) return '';
    const lotSize = property.lot_size_acres || property.lot_size || property.lot_sqft;
    const numeric = Number(lotSize);
    if (!Number.isFinite(numeric) || numeric <= 0) return '';
    if (property.lot_sqft) return `${numeric.toLocaleString()} sqft lot`;
    return `${numeric.toLocaleString(undefined, { maximumFractionDigits: 2 })} acres`;
};

export const formatStories = (property) => {
    const value = property?.levels || property?.stories || property?.stories_total;
    if (!value) return '';
    if (value === 'A') return 'Single Story';
    if (value === 'U') return '2 Story';
    return String(value);
};

export const formatHoaFee = (property) => {
    const value = property?.association_fee || property?.hoa_fee || property?.hoa;
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return '';
    return numeric.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    });
};

export const getListingStatus = (property) => (
    property?.mls_status
    || property?.listing_status
    || property?.property_status
    || property?.standard_status
    || ''
);

export const hasPrintableCoords = (property) => {
    const lat = property?.coordinates?.lat;
    const lng = property?.coordinates?.lng;
    return Number.isFinite(lat) && Number.isFinite(lng);
};

export const getPrimaryPropertyImage = (property) => {
    if (!property) return FALLBACK_IMAGE_LIGHT;
    if (property.primaryImage) return property.primaryImage;
    if (property.thumbnail) return property.thumbnail;

    const pictures = Array.isArray(property.listing_pictures) ? property.listing_pictures : [];
    const firstPicture = pictures.length > 0 ? pictures[0] : null;
    const sourceUrl = firstPicture?.media_url || firstPicture?.large_url || firstPicture?.thumb_webp;
    if (sourceUrl) {
        return ikImage(sourceUrl, TILE_IMAGE_PARAMS);
    }

    if (Array.isArray(property.listing_pics) && property.listing_pics.length > 0) {
        return ikImage(property.listing_pics[0], '');
    }

    return FALLBACK_IMAGE_LIGHT;
};

export const getPrintablePropertyImages = (property) => {
    if (!property) return [];
    const images = [];

    if (property.primaryImage) images.push(property.primaryImage);
    if (property.thumbnail) images.push(property.thumbnail);

    const pictures = Array.isArray(property.listing_pictures) ? property.listing_pictures : [];
    pictures.forEach((picture, index) => {
        const sourceUrl = picture?.media_url || picture?.large_url || picture?.thumb_webp;
        if (sourceUrl) {
            // First photo is the hero tile (rendered large) → high-res transform.
            // Remaining photos fill the smaller secondary tiles → keep the preset.
            images.push(ikImage(sourceUrl, index === 0 ? HERO_IMAGE_PARAMS : TILE_IMAGE_PARAMS));
        }
    });

    if (Array.isArray(property.listing_pics)) {
        property.listing_pics.forEach((url) => {
            if (url) images.push(ikImage(url, ''));
        });
    } else if (property.listing_pics) {
        const cleanUrl = String(property.listing_pics)
            .replace(/\/120\/90\//g, '/2048/2048/')
            .replace(/preset=thumb/g, 'preset=X-Large')
            .replace(/http:/, 'https:');
        images.push(ikUrl(cleanUrl));

        const count = Number(property.pic_count);
        if (Number.isFinite(count) && count > 0) {
            for (let i = 1; i <= count; i++) {
                images.push(ikUrl(cleanUrl.replace(/\/0\//, `/${i}/`).replace(/.JPG/, `-${i}.JPG`)));
            }
        }
    }

    return [...new Set(images.filter(Boolean))];
};
