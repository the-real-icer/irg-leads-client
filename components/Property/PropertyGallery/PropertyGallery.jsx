import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { usePropertyFallbackImage } from '../../../utils/propertyImageFallback';

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
    const fallbackImage = usePropertyFallbackImage();
    const [activeSlide, setActiveSlide] = useState(0);
    const carouselRef = useRef(null);
    const fancyboxRef = useRef(null);

    // Build full image list
    const images = useMemo(() => buildImages(property), [property]);

    // Pick random side images for the grid
    const gridSideImages = useMemo(() => {
        if (images.length <= 1) return [];
        const rest = images.slice(1);
        return shuffle(rest);
    }, [images]);

    const statusInfo = getStatusInfo(property.status);

    // ── Load Fancybox dynamically (SSR-safe) ──
    useEffect(() => {
        import('@fancyapps/ui').then(({ Fancybox }) => {
            fancyboxRef.current = Fancybox;
        });
        return () => {
            if (fancyboxRef.current) fancyboxRef.current.close();
        };
    }, []);

    // ── Fancybox: open gallery programmatically ──
    const openGallery = useCallback(async (startIndex = 0) => {
        const Fancybox = fancyboxRef.current || (await import('@fancyapps/ui')).Fancybox;
        Fancybox.show(
            images.map((img) => ({
                src: img.original,
                thumb: img.thumbnail || img.original,
                type: 'image',
            })),
            {
                startIndex,
                animated: true,
                showClass: 'f-fadeSlowIn',
                hideClass: 'f-fadeSlowOut',
                Carousel: { transition: 'fade', friction: 0.88, preload: 2 },
                Toolbar: {
                    display: {
                        left: ['infobar'],
                        middle: [],
                        right: ['zoom', 'fullscreen', 'close'],
                    },
                },
                Images: { zoom: true, Panzoom: { maxScale: 2 } },
                Thumbs: { type: 'classic', minCount: 2 },
                closeButton: false,
                backdropClick: 'close',
                keyboard: {
                    Escape: 'close', Delete: 'close', Backspace: 'close',
                    PageUp: 'next', PageDown: 'prev',
                    ArrowUp: 'next', ArrowDown: 'prev',
                    ArrowRight: 'next', ArrowLeft: 'prev',
                },
                touch: true,
                dragToClose: true,
                on: {
                    ready: (fancybox) => {
                        const container = fancybox.container;
                        if (!container) return;
                        // Fix Panzoom inline styles that cap images at natural pixel dimensions
                        container.querySelectorAll('.f-panzoom__wrapper').forEach((el) => {
                            el.style.maxWidth = '100%';
                            el.style.maxHeight = '100%';
                        });
                        container.querySelectorAll('.f-panzoom__viewport').forEach((el) => {
                            el.style.width = '100%';
                            el.style.height = '100%';
                        });
                        // Watch for Panzoom re-applying pixel dimension caps on render frames
                        const observer = new MutationObserver((mutations) => {
                            for (const mutation of mutations) {
                                if (mutation.attributeName !== 'style') continue;
                                const el = mutation.target;
                                if (el.classList.contains('f-panzoom__wrapper') && el.style.maxWidth !== '100%') {
                                    el.style.maxWidth = '100%';
                                    el.style.maxHeight = '100%';
                                }
                                if (el.classList.contains('f-panzoom__viewport')) {
                                    const w = parseFloat(el.style.width);
                                    if (w > 0 && w < container.offsetWidth * 0.8) {
                                        el.style.width = '100%';
                                        el.style.height = '100%';
                                    }
                                }
                            }
                        });
                        observer.observe(container, {
                            attributes: true,
                            attributeFilter: ['style'],
                            subtree: true,
                        });
                        fancybox.__styleObserver = observer;
                    },
                    close: (fancybox) => {
                        fancybox.__styleObserver?.disconnect();
                    },
                },
            }
        );
    }, [images]);

    // ── Mobile carousel: track visible slide via IntersectionObserver ──
    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const idx = Number(entry.target.dataset.index);
                        if (!Number.isNaN(idx)) setActiveSlide(idx);
                    }
                }
            },
            { root: carousel, threshold: 0.5 }
        );

        const slideEls = carousel.querySelectorAll('.property-gallery__carousel__slide');
        slideEls.forEach((slide) => observer.observe(slide));

        return () => observer.disconnect();
    }, [images]);

    // ── No photos fallback ──
    if (images.length === 0) {
        return (
            <div className="property-gallery__placeholder">
                <img
                    src={fallbackImage}
                    alt="No photos available"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
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
                        onClick={() => openGallery(0)}
                    >
                        <img
                            src={images[0].original}
                            alt={images[0].originalAlt}
                            onError={(e) => {
                                if (e.currentTarget.src !== fallbackImage) {
                                    e.currentTarget.src = fallbackImage;
                                }
                            }}
                        />
                    </div>

                    {desktopSide.map((img) => (
                        <div
                            key={img.original}
                            className="property-gallery__cell"
                            onClick={() => openGallery(findImageIndex(img))}
                        >
                            <img
                                src={img.original}
                                alt={img.originalAlt}
                                onError={(e) => {
                                    if (e.currentTarget.src !== fallbackImage) {
                                        e.currentTarget.src = fallbackImage;
                                    }
                                }}
                            />
                        </div>
                    ))}

                    {images.length > 1 && (
                        <button
                            className="property-gallery__view-all"
                            onClick={() => openGallery(0)}
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
                        onClick={() => openGallery(0)}
                    >
                        <img
                            src={images[0].original}
                            alt={images[0].originalAlt}
                            onError={(e) => {
                                if (e.currentTarget.src !== fallbackImage) {
                                    e.currentTarget.src = fallbackImage;
                                }
                            }}
                        />
                    </div>

                    {laptopSide.map((img) => (
                        <div
                            key={img.original}
                            className="property-gallery__cell"
                            onClick={() => openGallery(findImageIndex(img))}
                        >
                            <img
                                src={img.original}
                                alt={img.originalAlt}
                                onError={(e) => {
                                    if (e.currentTarget.src !== fallbackImage) {
                                        e.currentTarget.src = fallbackImage;
                                    }
                                }}
                            />
                        </div>
                    ))}

                    {images.length > 1 && (
                        <button
                            className="property-gallery__view-all"
                            onClick={() => openGallery(0)}
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
                <div className="property-gallery__carousel" ref={carouselRef}>
                    {images.map((img, i) => (
                        <div
                            key={img.original}
                            className="property-gallery__carousel__slide"
                            data-index={i}
                        >
                            <img
                                src={img.original}
                                alt={img.originalAlt}
                                onClick={() => openGallery(i)}
                                onError={(e) => {
                                    if (e.currentTarget.src !== fallbackImage) {
                                        e.currentTarget.src = fallbackImage;
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>
                {images.length > 1 && (
                    <div className="property-gallery__carousel__counter">
                        {activeSlide + 1} / {images.length}
                    </div>
                )}
            </div>
        </>
    );
};

export default PropertyGallery;
