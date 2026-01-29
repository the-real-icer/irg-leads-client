// React & NextJS
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

// Dynamically import PrimeReact components
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), {
    ssr: false,
});
const InputText = dynamic(() => import('primereact/inputtext').then((mod) => mod.InputText), {
    ssr: false,
});
const Checkbox = dynamic(() => import('primereact/checkbox').then((mod) => mod.Checkbox), {
    ssr: false,
});

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
            header="Edit Property"
            visible={showDialog}
            onHide={handleDialogClose}
            style={{ width: '600px', maxWidth: '90vw' }}
            contentStyle={{
                padding: '1.5rem',
                background: '#ffffff',
                borderRadius: '8px',
            }}
        >
            <form onSubmit={handlePropertyEdit}>
                {/* Address Field */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label
                        htmlFor="address"
                        style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#495057',
                            fontSize: '0.95rem',
                        }}
                    >
                        Address
                    </label>
                    <InputText
                        id="address"
                        type="text"
                        placeholder="Enter address"
                        value={address}
                        onChange={handleChange}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Unit Number Field */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label
                        htmlFor="unitNumber"
                        style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#495057',
                            fontSize: '0.95rem',
                        }}
                    >
                        Unit Number
                    </label>
                    <InputText
                        id="unitNumber"
                        type="text"
                        placeholder="Enter unit number"
                        value={unitNumber}
                        onChange={handleChange}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* City and Zipcode Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label
                            htmlFor="city"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: '#495057',
                                fontSize: '0.95rem',
                            }}
                        >
                            City
                        </label>
                        <InputText
                            id="city"
                            type="text"
                            placeholder="Enter city"
                            value={city}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="zipcode"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: '#495057',
                                fontSize: '0.95rem',
                            }}
                        >
                            Zipcode
                        </label>
                        <InputText
                            id="zipcode"
                            type="text"
                            placeholder="Enter zipcode"
                            value={zipcode}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                {/* Property URL Field */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label
                        htmlFor="propertyUrl"
                        style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#495057',
                            fontSize: '0.95rem',
                        }}
                    >
                        Property URL
                    </label>
                    <InputText
                        id="propertyUrl"
                        type="text"
                        placeholder="Enter property URL"
                        value={propertyUrl}
                        onChange={handleChange}
                        style={{ width: '100%' }}
                    />
                    <small
                        style={{
                            display: 'block',
                            marginTop: '0.5rem',
                            color: '#667eea',
                            fontWeight: '500',
                            fontSize: '0.85rem',
                        }}
                    >
                        Generated URL: {properUrl}
                    </small>
                </div>

                {/* Latitude and Longitude Row */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                    }}
                >
                    <div>
                        <label
                            htmlFor="latitude"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: '#495057',
                                fontSize: '0.95rem',
                            }}
                        >
                            Latitude
                        </label>
                        <InputText
                            id="latitude"
                            type="text"
                            placeholder="Enter latitude"
                            value={latitude}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="longitude"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: '#495057',
                                fontSize: '0.95rem',
                            }}
                        >
                            Longitude
                        </label>
                        <InputText
                            id="longitude"
                            type="text"
                            placeholder="Enter longitude"
                            value={longitude}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                {/* Checkboxes Section */}
                <div
                    style={{
                        padding: '1.25rem',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                    }}
                >
                    <div
                        style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#495057',
                            marginBottom: '1rem',
                        }}
                    >
                        Property Flags
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Is Duplicate Property */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Checkbox inputId="cb1" onChange={handleDupCheck} checked={isDuplicate} />
                            <label
                                htmlFor="cb1"
                                style={{
                                    fontWeight: '500',
                                    color: '#495057',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                }}
                            >
                                Mark as Duplicate Property
                            </label>
                        </div>

                        {/* Bad GeoCode */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Checkbox inputId="cb2" onChange={handleGeoCheck} checked={badGeoCode} />
                            <label
                                htmlFor="cb2"
                                style={{
                                    fontWeight: '500',
                                    color: '#495057',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                }}
                            >
                                Bad Geocode
                            </label>
                        </div>

                        {/* Check Attributes */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Checkbox
                                inputId="cb3"
                                onChange={handleAttrCheck}
                                checked={checkAttributes}
                            />
                            <label
                                htmlFor="cb3"
                                style={{
                                    fontWeight: '500',
                                    color: '#495057',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                }}
                            >
                                Check Attributes
                            </label>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <Button
                        label="Cancel"
                        className="p-button-secondary"
                        onClick={handleDialogClose}
                        type="button"
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontWeight: '600',
                        }}
                    />
                    <Button
                        label="Save Changes"
                        icon="pi pi-check"
                        type="submit"
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                        }}
                    />
                </div>
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
