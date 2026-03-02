import { FALLBACK_IMAGE_LIGHT, FALLBACK_IMAGE_DARK } from './propertyImageFallback';

const IMAGEKIT_BASE = 'https://ik.imagekit.io/jwx2v3mb8ae';

const FALLBACK_URLS = [FALLBACK_IMAGE_LIGHT, FALLBACK_IMAGE_DARK];

/**
 * Prepend ImageKit CDN URL to a property image src.
 *
 * Returns the original URL unchanged if:
 * - URL is null/undefined/empty
 * - URL is already an ImageKit URL
 * - URL is one of the fallback images
 * - URL is a local/relative path (starts with /)
 * - URL is a data: or blob: URI
 */
const ikUrl = (url) => {
    if (!url) return url;

    const str = String(url).trim();

    if (str.includes('ik.imagekit.io')) return str;
    if (FALLBACK_URLS.includes(str)) return str;
    if (str.startsWith('/') || str.startsWith('./')) return str;
    if (str.startsWith('data:')) return str;
    if (str.startsWith('blob:')) return str;

    return `${IMAGEKIT_BASE}/${str}`;
};

export default ikUrl;
