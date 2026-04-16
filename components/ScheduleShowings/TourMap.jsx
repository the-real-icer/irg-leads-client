import { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { GoogleMap, Marker } from '@react-google-maps/api';

import useGoogleMaps from '../../utils/useGoogleMaps';
import { hasValidCoords } from './tourHelpers';

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
                        label={{
                            text: String(idx + 1),
                            color: '#FFFFFF',
                            fontWeight: '600',
                        }}
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
