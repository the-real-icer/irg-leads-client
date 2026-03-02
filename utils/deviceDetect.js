/**
 * Detect if user is on a mobile device.
 * Used to switch Google auth from popup to redirect mode
 * (iOS WebKit blocks cross-origin postMessage from the Google popup).
 */
const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export default isMobile;
