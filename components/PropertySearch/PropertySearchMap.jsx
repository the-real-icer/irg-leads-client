import { memo, useCallback, useRef, useEffect, useMemo } from 'react';
import { GoogleMap, DrawingManager, Polygon } from '@react-google-maps/api';
import PriceMarker from './PriceMarker';
import { darkMapStyle, lightMapStyle } from '../../utils/mapStyles';

const containerStyle = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 32.82, lng: -117.15 };
const DEFAULT_ZOOM = 11;
const MAX_MARKERS = 120;

const POLYGON_OPTIONS = {
    fillColor: '#163D5C',
    fillOpacity: 0.15,
    strokeColor: '#163D5C',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    clickable: false,
    draggable: false,
    editable: false,
    zIndex: 2,
};

const AREA_POLYGON_OPTIONS = {
    fillColor: '#163D5C',
    fillOpacity: 0.08,
    strokeColor: '#163D5C',
    strokeOpacity: 0.5,
    strokeWeight: 1.5,
    clickable: false,
    draggable: false,
    editable: false,
    zIndex: 1,
};

const DRAWING_MANAGER_OPTIONS = {
    drawingControl: false,
    polygonOptions: {
        fillColor: '#163D5C',
        fillOpacity: 0.15,
        strokeColor: '#163D5C',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        editable: false,
        draggable: false,
    },
};

const PropertySearchMap = memo(({
    properties,
    highlightedId,
    onBoundsChange,
    onMarkerClick,
    onMarkerHover,
    onMarkerLeave,
    initialCenter,
    initialZoom,
    fitBoundsCoords,
    isDark,
    isDrawing,
    drawnPolygon,
    onPolygonComplete,
    activeAreas = [],
}) => {
    const mapRef = useRef(null);
    const hasFitBounds = useRef(false);
    const isDragging = useRef(false);

    const center = initialCenter || DEFAULT_CENTER;
    const zoom = initialZoom || DEFAULT_ZOOM;

    const mapOptions = useMemo(
        () => ({
            styles: isDark ? darkMapStyle : lightMapStyle,
            gestureHandling: 'greedy',
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            draggableCursor: isDrawing ? 'crosshair' : undefined,
        }),
        [isDark, isDrawing]
    );

    const onLoad = useCallback(
        (map) => {
            mapRef.current = map;
            // If we have area boundary, fit to it
            if (fitBoundsCoords && fitBoundsCoords.length > 0 && !hasFitBounds.current) {
                const bounds = new window.google.maps.LatLngBounds();
                fitBoundsCoords.forEach((coord) => bounds.extend(coord));
                map.fitBounds(bounds);
                hasFitBounds.current = true;
            }
        },
        [fitBoundsCoords]
    );

    // If fitBoundsCoords changes (new area selected), re-fit
    useEffect(() => {
        if (mapRef.current && fitBoundsCoords && fitBoundsCoords.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            fitBoundsCoords.forEach((coord) => bounds.extend(coord));
            mapRef.current.fitBounds(bounds);
            hasFitBounds.current = true;
        } else if (mapRef.current && !fitBoundsCoords) {
            // Area cleared — reset to default
            mapRef.current.panTo(DEFAULT_CENTER);
            mapRef.current.setZoom(DEFAULT_ZOOM);
            hasFitBounds.current = false;
        }
    }, [fitBoundsCoords]);

    const onDragStart = useCallback(() => {
        isDragging.current = true;
    }, []);

    const onDragEnd = useCallback(() => {
        isDragging.current = false;
    }, []);

    const onIdle = useCallback(() => {
        if (!mapRef.current || isDragging.current) return;
        if (isDrawing || drawnPolygon || activeAreas.length > 0) return;
        const bounds = mapRef.current.getBounds();
        if (!bounds) return;
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        onBoundsChange({
            south: sw.lat(),
            west: sw.lng(),
            north: ne.lat(),
            east: ne.lng(),
        });
    }, [onBoundsChange, isDrawing, drawnPolygon, activeAreas]);

    const visibleProperties = properties.slice(0, MAX_MARKERS);
    const showHint = properties.length > MAX_MARKERS;

    return (
        <>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
                options={mapOptions}
                onLoad={onLoad}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onIdle={onIdle}
            >
                {visibleProperties.map((p) => (
                    <PriceMarker
                        key={p._id}
                        property={p}
                        isActive={highlightedId === p._id}
                        onClick={onMarkerClick}
                        onMouseEnter={onMarkerHover}
                        onMouseLeave={onMarkerLeave}
                    />
                ))}

                {/* Drawing manager — active only during drawing mode */}
                {isDrawing && (
                    <DrawingManager
                        drawingMode={window.google.maps.drawing.OverlayType.POLYGON}
                        options={DRAWING_MANAGER_OPTIONS}
                        onPolygonComplete={onPolygonComplete}
                    />
                )}

                {/* Completed polygon overlay */}
                {drawnPolygon && !isDrawing && (
                    <Polygon paths={drawnPolygon} options={POLYGON_OPTIONS} />
                )}

                {/* Area boundary overlays */}
                {activeAreas.map((area) => {
                    if (!area.boundary?.[0]) return null;
                    const paths = area.boundary[0].map((pair) => ({ lat: pair[1], lng: pair[0] }));
                    return (
                        <Polygon
                            key={area.search_name}
                            paths={paths}
                            options={AREA_POLYGON_OPTIONS}
                        />
                    );
                })}
            </GoogleMap>

            {/* Drawing hint */}
            {isDrawing && (
                <div className="property-search__map-hint">
                    Click to place points, click the first point to close the shape
                </div>
            )}

            {/* Zoom hint */}
            {!isDrawing && showHint && (
                <div className="property-search__map-hint">
                    Zoom in to see all {properties.length} properties
                </div>
            )}
        </>
    );
});

PropertySearchMap.displayName = 'PropertySearchMap';

export default PropertySearchMap;
