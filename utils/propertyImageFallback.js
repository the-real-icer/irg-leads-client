import { useState, useEffect } from 'react';

export const FALLBACK_IMAGE_LIGHT =
    'https://ice-realty-group.s3.us-west-1.amazonaws.com/No-Photo-Light.jpg';

export const FALLBACK_IMAGE_DARK =
    'https://ice-realty-group.s3.us-west-1.amazonaws.com/No-Photo-Dark.jpg';

/**
 * Returns the correct fallback image URL for the current theme.
 * Reactively updates when the theme changes (watches the `dark` class on <html>).
 */
export function usePropertyFallbackImage() {
    const [isDark, setIsDark] = useState(
        () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
    );

    useEffect(() => {
        const html = document.documentElement;
        setIsDark(html.classList.contains('dark'));

        const observer = new MutationObserver(() => {
            setIsDark(html.classList.contains('dark'));
        });
        observer.observe(html, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isDark ? FALLBACK_IMAGE_DARK : FALLBACK_IMAGE_LIGHT;
}

/**
 * Non-hook version for class components — pass the theme string directly.
 */
export function getPropertyFallbackImage(theme) {
    return theme === 'dark' ? FALLBACK_IMAGE_DARK : FALLBACK_IMAGE_LIGHT;
}
