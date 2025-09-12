// React
// import React from 'react';
import PropTypes from 'prop-types';

// Third Party Components
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';

const EditDialog = (props) => {
    const {
        showDialog,
        handleDialogClose,
        handlePropertyEdit,
        handleCheck,
        handleChange,
        address,
        unitNum,
        city,
        zipcode,
        fullAddress,
        propertyUrl,
        isDuplicate,
    } = props;

    return (
        <Dialog
            style={{ width: '38rem', height: '60rem', fontSize: '1.4rem', background: '#fff' }}
            header="Edit This Property"
            visible={showDialog}
            onHide={handleDialogClose}
        >
            <form className="p-fluid" onSubmit={handlePropertyEdit}>
                <div className="p-field">
                    <label htmlFor="address">Address</label>
                    <InputText
                        id="address"
                        type="text"
                        placeholder="Address"
                        value={address}
                        onChange={handleChange}
                        style={{ fontSize: '1.5rem' }}
                    />
                </div>
                <div className="p-field">
                    <label htmlFor="unitNum">Unit #</label>
                    <InputText
                        id="unitNum"
                        type="text"
                        placeholder="Unit #"
                        value={unitNum}
                        onChange={handleChange}
                        style={{ fontSize: '1.5rem' }}
                    />
                </div>
                <div className="p-field">
                    <label htmlFor="city">City</label>
                    <InputText
                        id="city"
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={handleChange}
                        style={{ fontSize: '1.5rem' }}
                    />
                </div>
                <div className="p-field">
                    <label htmlFor="zipcode">Zipcode</label>
                    <InputText
                        id="zipcode"
                        type="text"
                        placeholder="Zipcode"
                        value={zipcode}
                        onChange={handleChange}
                        style={{ fontSize: '1.5rem' }}
                    />
                </div>
                <div className="p-field">
                    <label htmlFor="fullAddress">Full Address</label>
                    <InputText
                        id="fullAddress"
                        type="text"
                        placeholder="Full Address"
                        value={fullAddress}
                        onChange={handleChange}
                        style={{ fontSize: '1.5rem' }}
                    />
                </div>
                <div className="p-field">
                    <label htmlFor="propertyUrl">Property Url</label>
                    <InputText
                        id="propertyUrl"
                        type="text"
                        placeholder="Property Url"
                        value={propertyUrl}
                        onChange={handleChange}
                        style={{ fontSize: '1.5rem' }}
                    />
                </div>
                <div className="p-field">
                    <Checkbox inputId="cb1" onChange={handleCheck} checked={isDuplicate} />
                    <label htmlFor="cb1" className="p-checkbox-label">
                        Is Duplicate Property
                    </label>
                </div>
                <Button
                    label="Submit"
                    icon="pi pi-check"
                    type="submit"
                    style={{ fontSize: '1.5rem' }}
                />
            </form>
        </Dialog>
    );
};

EditDialog.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    handleDialogClose: PropTypes.func.isRequired,
    handlePropertyEdit: PropTypes.func.isRequired,
    handleCheck: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    address: PropTypes.string.isRequired,
    unitNum: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    zipcode: PropTypes.string.isRequired,
    fullAddress: PropTypes.string.isRequired,
    propertyUrl: PropTypes.string.isRequired,
    isDuplicate: PropTypes.bool.isRequired,
};

export default EditDialog;
