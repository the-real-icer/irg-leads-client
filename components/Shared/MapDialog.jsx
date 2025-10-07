// import React from 'react';
import PropTypes from 'prop-types';

// Third Party Components
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const MapDialog = ({ showMapDialog, handleCloseMapDialog, property }) => {
    // _________________________________Constants__________________________\\
    const containerStyle = {
        width: '100%',
        height: '100%',
    };

    let center = {
        lat: 33,
        lng: -117,
    };

    if (property && property.coordinates && property.coordinates.lat && property.coordinates.lng) {
        center = {
            lat: property.coordinates.lat,
            lng: property.coordinates.lng,
        };
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
    });

    const renderMap = () => (
                <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={18}>
                    <Marker position={center} icon="/home-icon-small.png" />
                </GoogleMap>
    );



    return (
        <Dialog
        visible={showMapDialog}
        style={{ width: '40rem', height: '40rem', paddding: '.25rem', background: '#fff',  }}
        onHide={handleCloseMapDialog}
        >
        <div>
            <div style={{width: '37rem', height: '34rem'}}>
                {isLoaded ? renderMap() : <div></div>}
            </div>
            <Button 
                onClick={() => handleCloseMapDialog()}
                label="Close"
                className="p-button-danger"
                style={{ marginTop: '1rem', fontSize: '1.2rem'}}
            />
        </div>
        </Dialog>
    )
}

MapDialog.PropTypes = {
    showMapDialog: PropTypes.bool.isRequired,
    handleCloseMapDialog: PropTypes.func.isRequired,
    property: PropTypes.shape({
        coordinates: PropTypes.shape({
            lat: PropTypes.number.isRequired,
            lng: PropTypes.number.isRequired,
        }).isRequired,
    }).isRequired
}

export default MapDialog;
