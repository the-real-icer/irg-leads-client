import { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { GoogleMap, Marker } from '@react-google-maps/api';
import useGoogleMaps from '../../utils/useGoogleMaps';
import { darkMapStyle, lightMapStyle } from '../../utils/mapStyles';

const containerStyle = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 33, lng: -117 };

const MapDialog = ({ showMapDialog, handleCloseMapDialog, property }) => {
    const { isLoaded } = useGoogleMaps();
    const [isDark, setIsDark] = useState(false);

    // Detect dark mode when dialog opens
    useEffect(() => {
        if (showMapDialog) {
            setIsDark(document.documentElement.classList.contains('dark'));
        }
    }, [showMapDialog]);

    const center = useMemo(() => {
        if (property?.coordinates?.lat && property?.coordinates?.lng) {
            return { lat: property.coordinates.lat, lng: property.coordinates.lng };
        }
        return DEFAULT_CENTER;
    }, [property?.coordinates?.lat, property?.coordinates?.lng]);

    const mapOptions = useMemo(
        () => ({
            styles: isDark ? darkMapStyle : lightMapStyle,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        }),
        [isDark],
    );

    const address = property?.address || '';
    const unitNum = property?.unit_number ? ` #${property.unit_number}` : '';
    const city = property?.city || '';
    const state = property?.state || 'CA';
    const zip = property?.zip_code || '';
    const location = city ? `${city}, ${state} ${zip}`.trim() : '';

    const dialogHeader = (
        <div className="map-dialog__header">
            <span className="map-dialog__header-title">Property Location</span>
            <button
                className="map-dialog__header-close"
                onClick={handleCloseMapDialog}
                type="button"
                aria-label="Close"
            >
                <i className="pi pi-times" />
            </button>
        </div>
    );

    return (
        <Dialog
            header={dialogHeader}
            visible={showMapDialog}
            onHide={handleCloseMapDialog}
            className="map-dialog"
            style={{ width: '600px', maxWidth: '95vw' }}
            modal
            closable={false}
            draggable={false}
            blockScroll
        >
            <div className="map-dialog__content">
                {(address || location) && (
                    <div className="map-dialog__address-bar">
                        {address && (
                            <div className="map-dialog__address">
                                {address}
                                {unitNum}
                            </div>
                        )}
                        {location && <div className="map-dialog__location">{location}</div>}
                    </div>
                )}

                <div className="map-dialog__map-container">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={center}
                            zoom={18}
                            options={mapOptions}
                        >
                            <Marker position={center} icon="/home-icon-small.png" />
                        </GoogleMap>
                    ) : (
                        <div className="map-dialog__skeleton">
                            <i className="pi pi-map-marker map-dialog__skeleton-icon" />
                            <span className="map-dialog__skeleton-text">Loading map...</span>
                        </div>
                    )}
                </div>

                <div className="map-dialog__footer">
                    <Button
                        label="Close"
                        icon="pi pi-times"
                        className="map-dialog__btn-close"
                        onClick={handleCloseMapDialog}
                    />
                </div>
            </div>
        </Dialog>
    );
};

MapDialog.propTypes = {
    showMapDialog: PropTypes.bool.isRequired,
    handleCloseMapDialog: PropTypes.func.isRequired,
    property: PropTypes.shape({
        address: PropTypes.string,
        unit_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        city: PropTypes.string,
        state: PropTypes.string,
        zip_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        coordinates: PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
        }),
    }),
};

export default MapDialog;
