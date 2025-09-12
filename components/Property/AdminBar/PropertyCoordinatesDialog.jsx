// import React from 'react';
import PropTypes from 'prop-types';

// Third Party Components
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

const PropertyCoordinatesDialog = (props) => {
    const {
        showGeoDialog,
        setShowGeoDialog,
        latitude,
        longitude,
        handleLatChange,
        handleLngChange,
        handleGeoSubmit,
    } = props;
    return (
        <Dialog
            header="Edit Property Coordinates"
            visible={showGeoDialog}
            style={{ width: '40rem', background: '#fff', fontSize: '1.4rem' }}
            onHide={() => setShowGeoDialog(false)}
        >
            <div className="p-fluid">
                <div className="p-field">
                    <label htmlFor="latitude">Latitude</label>
                    <InputText
                        id="latitude"
                        type="text"
                        placeholder="Latitude"
                        value={latitude}
                        onChange={handleLatChange}
                        style={{ fontSize: '1.5rem' }}
                    />
                </div>
                <div className="p-field">
                    <label htmlFor="longitude">Longitude</label>
                    <InputText
                        id="longitude"
                        type="text"
                        placeholder="Longitude"
                        value={longitude}
                        onChange={handleLngChange}
                        style={{ fontSize: '1.5rem' }}
                    />
                </div>
                <Button
                    label="Send"
                    icon="pi pi-check"
                    onClick={handleGeoSubmit}
                    style={{ fontSize: '1.7rem', marginBottom: '1.5rem' }}
                />
                <Button
                    label="Cancel"
                    icon="pi pi-times"
                    className="p-button-danger"
                    onClick={() => setShowGeoDialog(false)}
                    style={{ fontSize: '1.7rem', marginBottom: '1.5rem' }}
                />
            </div>
        </Dialog>
    );
};

PropertyCoordinatesDialog.propTypes = {
    showGeoDialog: PropTypes.func.isRequired,
    setShowGeoDialog: PropTypes.func.isRequired,
    handleLatChange: PropTypes.func.isRequired,
    handleLngChange: PropTypes.func.isRequired,
    handleGeoSubmit: PropTypes.func.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
};

export default PropertyCoordinatesDialog;
