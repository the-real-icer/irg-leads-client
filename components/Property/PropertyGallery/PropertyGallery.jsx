import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/image-gallery.css';

// ── Build image array from property data ──
const buildImages = (property) => {
    if (property.listing_pictures && property.listing_pictures.length > 0) {
        return property.listing_pictures.map((pic) => ({
            original: pic.media_url.replace(/http:/, 'https:').concat('?preset=X-Large'),
            thumbnail: pic.media_url.replace(/http:/, 'https:').concat('?preset=Small'),
            originalAlt: property.address,
        }));
    }

    if (property.listing_pics && property.listing_pics.length > 0) {
        const cleanURL = property.listing_pics
            .replace(/\/120\/90\//g, '/2048/2048/')
            .replace(/preset=thumb/g, 'preset=X-Large')
            .replace(/http:/, 'https:');

        const thumbURL = property.listing_pics
            .replace(/http:/, 'https:');

        const images = [
            { original: cleanURL, thumbnail: thumbURL, originalAlt: property.address },
        ];

        for (let i = 0; i < (property.pic_count || 0); i++) {
            const j = i + 1;
            images.push({
                original: cleanURL.replace(/\/0\//, `/${j}/`).replace(/.JPG/, `-${j}.JPG`),
                thumbnail: thumbURL.replace(/\/0\//, `/${j}/`).replace(/.JPG/, `-${j}.JPG`),
                originalAlt: `${property.address} - ${j + 1}`,
            });
        }
        return images;
    }

    return [];
};

// ── Shuffle helper (Fisher-Yates) ──
const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// ── Status text & class ──
const getStatusInfo = (status) => {
    const map = {
        Active: { text: 'Active', cls: 'active' },
        'Active Under Contract': { text: 'Contingent', cls: 'active_under_contract' },
        Pending: { text: 'Pending', cls: 'pending' },
        'Coming Soon': { text: 'Coming Soon', cls: 'coming_soon' },
        Closed: { text: 'Off Market', cls: 'off_market' },
        'Off Market': { text: 'Off Market', cls: 'off_market' },
        Withdrawn: { text: 'Off Market', cls: 'off_market' },
        Canceled: { text: 'Off Market', cls: 'off_market' },
        Hold: { text: 'Off Market', cls: 'off_market' },
        Expired: { text: 'Off Market', cls: 'off_market' },
    };
    return map[status] || { text: status, cls: 'off_market' };
};

const PropertyGallery = ({ property }) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const galleryRef = useRef(null);

    // Build full image list
    const images = useMemo(() => buildImages(property), [property]);

    // Pick random side images for the grid
    const gridSideImages = useMemo(() => {
        if (images.length <= 1) return [];
        const rest = images.slice(1);
        return shuffle(rest);
    }, [images]);

    const statusInfo = getStatusInfo(property.status);

    // ── Fullscreen open/close ──
    const openLightbox = useCallback((index) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    }, []);

    const closeLightbox = useCallback(() => {
        setLightboxOpen(false);
    }, []);

    // ── Keyboard navigation in fullscreen ──
    useEffect(() => {
        if (!lightboxOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [lightboxOpen, closeLightbox]);

    // ── No photos fallback ──
    if (images.length === 0) {
        return (
            <div className="property-gallery__placeholder">
                <i className="pi pi-image" style={{ fontSize: '2rem', marginRight: '0.75rem' }} />
                No photos available
            </div>
        );
    }

    // Find the index of a grid side image in the full images array
    const findImageIndex = (sideImg) => {
        const idx = images.findIndex((img) => img.original === sideImg.original);
        return idx >= 0 ? idx : 0;
    };

    // ── Desktop grid: hero + 4 side images (1280px+) ──
    // ── Laptop grid: hero + 2 side images (1024–1280px) ──
    // ── Mobile: single carousel (<1024px) ──
    // We render ALL variants and use CSS to show/hide based on breakpoint.

    const desktopSide = gridSideImages.slice(0, 4); // up to 4
    const laptopSide = gridSideImages.slice(0, 2);  // up to 2

    return (
        <>
            {/* ── Desktop Grid (1280px+) ── */}
            <div className="property-gallery property-gallery--desktop">
                <div className={`property-gallery__status property-gallery__status--${statusInfo.cls}`}>
                    {statusInfo.text}
                </div>

                <div className={`property-gallery__grid property-gallery__grid--desktop${desktopSide.length < 4 ? ` property-gallery__grid--cols-${desktopSide.length}` : ''}`}>
                    <div
                        className="property-gallery__hero"
                        onClick={() => openLightbox(0)}
                    >
                        <img src={images[0].original} alt={images[0].originalAlt} />
                    </div>

                    {desktopSide.map((img) => (
                        <div
                            key={img.original}
                            className="property-gallery__cell"
                            onClick={() => openLightbox(findImageIndex(img))}
                        >
                            <img src={img.original} alt={img.originalAlt} />
                        </div>
                    ))}

                    {images.length > 1 && (
                        <button
                            className="property-gallery__view-all"
                            onClick={() => openLightbox(0)}
                            type="button"
                        >
                            <i className="pi pi-images" />
                            View all {images.length} photos
                        </button>
                    )}
                </div>
            </div>

            {/* ── Laptop Grid (1024–1280px) ── */}
            <div className="property-gallery property-gallery--laptop">
                <div className={`property-gallery__status property-gallery__status--${statusInfo.cls}`}>
                    {statusInfo.text}
                </div>

                <div className={`property-gallery__grid property-gallery__grid--laptop${laptopSide.length < 2 ? ' property-gallery__grid--laptop-1' : ''}`}>
                    <div
                        className="property-gallery__hero"
                        onClick={() => openLightbox(0)}
                    >
                        <img src={images[0].original} alt={images[0].originalAlt} />
                    </div>

                    {laptopSide.map((img) => (
                        <div
                            key={img.original}
                            className="property-gallery__cell"
                            onClick={() => openLightbox(findImageIndex(img))}
                        >
                            <img src={img.original} alt={img.originalAlt} />
                        </div>
                    ))}

                    {images.length > 1 && (
                        <button
                            className="property-gallery__view-all"
                            onClick={() => openLightbox(0)}
                            type="button"
                        >
                            <i className="pi pi-images" />
                            View all {images.length} photos
                        </button>
                    )}
                </div>
            </div>

            {/* ── Mobile Carousel (<1024px) ── */}
            <div className="property-gallery property-gallery--mobile">
                <div className={`property-gallery__status property-gallery__status--${statusInfo.cls}`}>
                    {statusInfo.text}
                </div>
                <ImageGallery
                    ref={galleryRef}
                    items={images}
                    showPlayButton={false}
                    showThumbnails={false}
                    showIndex={true}
                    showFullscreenButton={false}
                    onClick={() => openLightbox(galleryRef.current?.getCurrentIndex() || 0)}
                />
            </div>

            {/* ── Fullscreen Lightbox ── */}
            {lightboxOpen && (
                <div className="property-gallery__lightbox" onClick={closeLightbox}>
                    <div
                        className="property-gallery__lightbox__inner"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="property-gallery__lightbox__close"
                            onClick={closeLightbox}
                            type="button"
                            aria-label="Close gallery"
                        >
                            &times;
                        </button>
                        <ImageGallery
                            items={images}
                            showPlayButton={false}
                            showThumbnails={true}
                            showIndex={true}
                            startIndex={lightboxIndex}
                            useBrowserFullscreen={false}
                            showFullscreenButton={false}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default PropertyGallery;
