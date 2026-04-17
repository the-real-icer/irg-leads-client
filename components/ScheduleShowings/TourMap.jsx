import { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { GoogleMap, Marker } from '@react-google-maps/api';

import useGoogleMaps from '../../utils/useGoogleMaps';
import { hasValidCoords } from './tourHelpers';
import { getStatusHex } from './stopStatus';

// Build a data-URI SVG pin colored by the stop's status, with the order
// number baked in as a label. Returns null before Google Maps is ready
// so callers can safely pass it through to <Marker icon={...} /> — the
// library falls back to the default pin for a frame, then re-renders
// with our custom icon once `window.google` exists.
const buildMarkerIcon = (statusValue, orderNumber) => {
    if (typeof window === 'undefined' || !window.google) return null;
    const color = getStatusHex(statusValue);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">`
        + `<path d="M16 0 C24 0 32 7 32 16 C32 24 16 40 16 40 C16 40 0 24 0 16 C0 7 8 0 16 0 Z" `
        + `fill="${color}" stroke="#FFFFFF" stroke-width="2"/>`
        + `<text x="16" y="21" text-anchor="middle" font-family="Lato, sans-serif" `
        + `font-size="14" font-weight="700" fill="#FFFFFF">${orderNumber}</text>`
        + `</svg>`;
    return {
        url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
        anchor: new window.google.maps.Point(16, 40),
        scaledSize: new window.google.maps.Size(32, 40),
    };
};

const DEFAULT_CENTER = { lat: 32.7157, lng: -117.1611 }; // San Diego
const DEFAULT_ZOOM = 11;
const MAX_ZOOM_AFTER_FIT = 15;

const MAP_OPTIONS = {
    disableDefaultUI: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: true,
    clickableIcons: false,
};

const TourMap = ({ stops }) => {
    const { isLoaded, loadError } = useGoogleMaps();
    const mapRef = useRef(null);

    const onLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
    }, []);

    // Re-fit bounds whenever the stops list changes.
    // Uses the `idle` event to clamp max zoom after fitBounds settles.
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !isLoaded || typeof window === 'undefined' || !window.google) return undefined;

        const valid = stops.filter(hasValidCoords);

        if (valid.length === 0) {
            map.setCenter(DEFAULT_CENTER);
            map.setZoom(DEFAULT_ZOOM);
            return undefined;
        }

        const bounds = new window.google.maps.LatLngBounds();
        valid.forEach((stop) => {
            bounds.extend({
                lat: stop.coordinates.lat,
                lng: stop.coordinates.lng,
            });
        });
        map.fitBounds(bounds);

        const listener = window.google.maps.event.addListenerOnce(map, 'idle', () => {
            if (map.getZoom() > MAX_ZOOM_AFTER_FIT) {
                map.setZoom(MAX_ZOOM_AFTER_FIT);
            }
        });

        return () => {
            if (listener) {
                window.google.maps.event.removeListener(listener);
            }
        };
    }, [stops, isLoaded]);

    if (loadError) {
        return (
            <div
                className={
                    'bg-surface rounded-[16px] border border-border '
                    + 'shadow-sm p-[24px] md:p-[32px] '
                    + 'h-[400px] min-[900px]:h-[600px] '
                    + 'flex flex-col items-center justify-center gap-[8px]'
                }
            >
                <p className="m-0 text-[14px] font-medium text-danger">
                    Map failed to load
                </p>
                <p className="m-0 text-[12px] text-foreground/60">
                    {loadError.message}
                </p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div
                className={
                    'bg-surface rounded-[16px] border border-border '
                    + 'shadow-sm p-[24px] md:p-[32px] '
                    + 'h-[400px] min-[900px]:h-[600px] '
                    + 'flex items-center justify-center'
                }
            >
                <p className="m-0 text-[14px] text-foreground/70">Loading map…</p>
            </div>
        );
    }

    return (
        <div
            className={
                'rounded-[16px] overflow-hidden border border-border '
                + 'shadow-sm bg-surface'
            }
        >
            <GoogleMap
                mapContainerClassName="w-full h-[400px] min-[900px]:h-[600px]"
                mapContainerStyle={{ width: '100%' }}
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={MAP_OPTIONS}
            >
                {stops.filter(hasValidCoords).map((stop, idx) => (
                    <Marker
                        key={stop.mls_number}
                        position={{
                            lat: stop.coordinates.lat,
                            lng: stop.coordinates.lng,
                        }}
                        icon={buildMarkerIcon(stop.status, idx + 1)}
                    />
                ))}
            </GoogleMap>
        </div>
    );
};

TourMap.propTypes = {
    stops: PropTypes.array.isRequired,
};

export default TourMap;
