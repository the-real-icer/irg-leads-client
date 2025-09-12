// React
// import React from 'react';
import PropTypes from 'prop-types';

// Third Party Components
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const PropertyMap = ({ property }) => {
    // _________________________________Constants__________________________\\
    const containerStyle = {
        width: '100%',
        height: '100%',
    };

    let center = {
        lat: null,
        lng: null,
    };

    if (property.coordinates && property.coordinates.lat && property.coordinates.lng) {
        center = {
            lat: property.coordinates.lat,
            lng: property.coordinates.lng,
        };
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
    });

    const renderMap = () => (
        <div className="property__page__container">
            <div className="property__map">
                <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={18}>
                    <Marker position={center} icon="/home-icon-small.png" />
                </GoogleMap>
            </div>
        </div>
    );

    if (loadError) {
        return <div>Map cannot be loaded right now, sorry.</div>;
    }

    return isLoaded ? (
        renderMap()
    ) : (
        <div className="property__page__container">
            <div className="property__map" />
        </div>
    );
};

PropertyMap.propTypes = {
    property: PropTypes.shape({
        coordinates: PropTypes.shape({
            lat: PropTypes.number.isRequired,
            lng: PropTypes.number.isRequired,
        }).isRequired,
    }).isRequired,
};

export default PropertyMap;
