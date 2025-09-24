// React & NextJS
import PropTypes from 'prop-types';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';

const NewPropertyEditDialog = (props) => {
    const {
        showDialog,
        handleDialogClose,
        handlePropertyEdit,
        address,
        handleChange,
        unitNumber,
        city,
        zipcode,
        latitude,
        longitude,
        propertyUrl,
        handleDupCheck,
        handleGeoCheck,
        handleAttrCheck,
        isDuplicate,
        badGeoCode,
        checkAttributes,
    } = props;

    // Create what the property_url should be
    const propUrl = `${address} ${unitNumber} ${city} ca ${zipcode}`;
    const properUrl = propUrl.toLowerCase().replace(/\s/g, '-').replace(/--/g, '-');

    return (
        <Dialog
            style={{ width: '38rem', height: '63rem', fontSize: '1.2rem', background: '#fff' }}
            header="Edit This Property"
            visible={showDialog}
            onHide={handleDialogClose}
        >
            <form className="p-fluid" onSubmit={handlePropertyEdit}>
                <div className="p-field">
                    <label style={{ fontSize: '.9rem' }} htmlFor="address">
                        Address
                    </label>
                    <InputText
                        id="address"
                        type="text"
                        placeholder="Address"
                        value={address}
                        onChange={handleChange}
                        style={{ fontSize: '1.05rem' }}
                    />
                </div>
                <div className="p-field">
                    <label style={{ fontSize: '.9rem' }} htmlFor="unitNum">
                        Unit #
                    </label>
                    <InputText
                        id="unitNum"
                        type="text"
                        placeholder="Unit #"
                        value={unitNumber}
                        onChange={handleChange}
                        style={{ fontSize: '1.05rem' }}
                    />
                </div>
                <div className="p-field">
                    <label style={{ fontSize: '.9rem' }} htmlFor="city">
                        City
                    </label>
                    <InputText
                        id="city"
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={handleChange}
                        style={{ fontSize: '1.05rem' }}
                    />
                </div>
                <div className="p-field">
                    <label style={{ fontSize: '.9rem' }} htmlFor="zipcode">
                        Zipcode
                    </label>
                    <InputText
                        id="zipcode"
                        type="text"
                        placeholder="Zipcode"
                        value={zipcode}
                        onChange={handleChange}
                        style={{ fontSize: '1.05rem' }}
                    />
                </div>
                <div className="p-field">
                    <label style={{ fontSize: '.9rem' }} htmlFor="propertyUrl">
                        Property Url
                    </label>
                    <InputText
                        id="propertyUrl"
                        type="text"
                        placeholder="Property Url"
                        value={propertyUrl}
                        onChange={handleChange}
                        style={{ fontSize: '1.05rem' }}
                    />
                </div>
                {properUrl}
                <div className="p-field">
                    <label style={{ fontSize: '.9rem' }} htmlFor="latitude">
                        Latitude
                    </label>
                    <InputText
                        id="latitude"
                        type="text"
                        placeholder="Latitude"
                        value={latitude}
                        onChange={handleChange}
                        style={{ fontSize: '1.05rem' }}
                    />
                </div>
                <div className="p-field">
                    <label style={{ fontSize: '.9rem' }} htmlFor="longitude">
                        Longitude
                    </label>
                    <InputText
                        id="longitude"
                        type="text"
                        placeholder="Longitude"
                        value={longitude}
                        onChange={handleChange}
                        style={{ fontSize: '1.05rem' }}
                    />
                </div>
                <div className="p-field">
                    <Checkbox inputId="cb1" onChange={handleDupCheck} checked={isDuplicate} />
                    <label
                        style={{ fontSize: '1.1rem' }}
                        htmlFor="cb1"
                        className="p-checkbox-label"
                    >
                        Is Duplicate Property
                    </label>
                </div>
                <div className="p-field">
                    <Checkbox inputId="cb2" onChange={handleGeoCheck} checked={badGeoCode} />
                    <label
                        style={{ fontSize: '1.1rem' }}
                        htmlFor="cb2"
                        className="p-checkbox-label"
                    >
                        Bad GeoCode
                    </label>
                </div>
                <div className="p-field">
                    <Checkbox inputId="cb3" onChange={handleAttrCheck} checked={checkAttributes} />
                    <label
                        style={{ fontSize: '1.1rem' }}
                        htmlFor="cb3"
                        className="p-checkbox-label"
                    >
                        Check Attributes
                    </label>
                </div>
                <Button
                    label="Submit"
                    icon="pi pi-check"
                    type="submit"
                    style={{ fontSize: '1.05rem', marginTop: '1.5rem' }}
                />
                <Button
                    label="Cancel"
                    className="p-button-danger"
                    onClick={() => handleDialogClose()}
                    style={{ fontSize: '1.05rem', marginTop: '1.5rem' }}
                />
            </form>
        </Dialog>
    );
};

NewPropertyEditDialog.propTypes = {
    address: PropTypes.string.isRequired,
    unitNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    city: PropTypes.string.isRequired,
    propertyUrl: PropTypes.string.isRequired,
    latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    checkAttributes: PropTypes.bool.isRequired,
    badGeoCode: PropTypes.bool.isRequired,
    isDuplicate: PropTypes.bool.isRequired,
    zipcode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    showDialog: PropTypes.bool.isRequired,
    handleDialogClose: PropTypes.func.isRequired,
    handlePropertyEdit: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleDupCheck: PropTypes.func.isRequired,
    handleGeoCheck: PropTypes.func.isRequired,
    handleAttrCheck: PropTypes.func.isRequired,
};

export default NewPropertyEditDialog;
