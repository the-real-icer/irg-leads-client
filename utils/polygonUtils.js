/**
 * Extract a path array from a Google Maps Polygon object (from DrawingManager).
 * @param {google.maps.Polygon} gmPolygon
 * @returns {Array<{lat: number, lng: number}>}
 */
export function extractPathFromGMPolygon(gmPolygon) {
    const path = gmPolygon.getPath();
    const result = [];
    for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        result.push({ lat: point.lat(), lng: point.lng() });
    }
    return result;
}

/**
 * Convert a Google Maps path [{lat, lng}, ...] to GeoJSON polygon coordinates.
 * GeoJSON format: [[[lng, lat], ...]] — ring must be closed (first === last).
 * @param {Array<{lat: number, lng: number}>} path
 * @returns {Array<Array<Array<number>>>}
 */
export function pathToGeoJSON(path) {
    const coords = path.map((p) => [p.lng, p.lat]);
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
        coords.push([...first]);
    }
    return [coords];
}
