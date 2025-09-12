// React
import { useState } from 'react';
import PropTypes from 'prop-types';

// Redux
import { useSelector, useDispatch } from 'react-redux';

// Third Party Components
import { Button } from 'primereact/button';

import ConfirmOffMarketDialog from './ConfirmOffMarketDialog';
import PropertyCoordinatesDialog from './PropertyCoordinatesDialog';
import EditDialog from './EditDialog';

// IRG API - HOOKS - INFO - UTILS
import IrgApi from '../../../assets/irgApi';
import { fetchNewProperties, removeNewProperty, updateNewProperty } from '../../../store/actions';

const btnStyle = { fontSize: '1.2rem', fontWeight: '400', margin: '.5rem' };

const AdminBar = (props) => {
    const { property, setProperty, handleToastMessage } = props;

    // __________________Redux State______________________\\
    const isLoggedIn = useSelector((state) => state.isLoggedIn);

    // _____________________Hooks_____________________\\
    const dispatch = useDispatch();

    // __________________Component State________________________\\
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showGeoDialog, setShowGeoDialog] = useState(false);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [address, setAddress] = useState('');
    const [selectedHome, setSelectedHome] = useState(null);
    const [unitNum, setUnitNum] = useState('');
    const [city, setCity] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [fullAddress, setFullAddress] = useState('');
    const [propertyUrl, setPropertyUrl] = useState('');
    const [isDuplicate, setIsDuplicate] = useState(true);

    const handleCoordsClick = () => setShowGeoDialog(true);
    const handleOffMarket = () => setShowConfirmDialog(true);
    const handleLatChange = (e) => setLatitude(e.target.value);
    const handleLngChange = (e) => setLongitude(e.target.value);

    const handleEditClick = () => {
        setSelectedHome(property);
        setAddress(property.address);
        setUnitNum(property.unit_number);
        setCity(property.city);
        setZipcode(property.zip_code);
        // setFullAddress(property.full_address);
        setPropertyUrl(property.property_url);
        if (property.is_duplicate_property) {
            setIsDuplicate(true);
        } else {
            setIsDuplicate(false);
        }
        setShowDialog(true);
    };

    const handleDialogClose = () => {
        setSelectedHome(null);
        setAddress('');
        setUnitNum('');
        setCity('');
        setZipcode('');
        setFullAddress('');
        setPropertyUrl('');
        setIsDuplicate(false);
        setShowDialog(false);
    };

    const handleChange = (e) => {
        if (e.target.id === 'address') {
            setAddress(e.target.value);
        }

        if (e.target.id === 'unitNum') {
            setUnitNum(e.target.value);
        }

        if (e.target.id === 'city') {
            setCity(e.target.value);
        }

        if (e.target.id === 'zipcode') {
            setZipcode(e.target.value);
        }

        if (e.target.id === 'fullAddress') {
            setFullAddress(e.target.value);
        }

        if (e.target.id === 'propertyUrl') {
            setPropertyUrl(e.target.value);
        }
    };

    const handleCheck = (e) => {
        setIsDuplicate(e.checked);
    };

    const handlePropertyEdit = async (e) => {
        e.preventDefault();

        try {
            const res = await IrgApi.post(
                '/mlsproperties/edit-new-property',
                {
                    address,
                    unitNum,
                    city,
                    zipcode,
                    fullAddress,
                    propertyUrl,
                    mlsId: selectedHome.mls_number,
                    isDuplicate,
                },
                {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (res.data.status === 'success') {
                handleToastMessage('success', 'Home Edited!', `${address} has been edited!`, 3000);
                dispatch(updateNewProperty(res.data.data));
                setProperty(res.data.data);
                handleDialogClose();
            }
        } catch (err) {
            if (err.message === 'Request failed with status code 418') {
                handleToastMessage('error', 'Duplicate', 'Duplicate Property', 3000);
            }
        }
    };

    const handleApproveClick = async (mlsNum, homeAddress) => {
        try {
            const res = await IrgApi.get(`/mlsproperties/approve-new-property/${mlsNum}`, {
                headers: { Authorization: `Bearer ${isLoggedIn}` },
            });

            if (res.data.status === 'success') {
                handleToastMessage(
                    'success',
                    'Home Saved!',
                    `${homeAddress} has been approved!`,
                    3000
                );
                setProperty(res.data.data);
                dispatch(removeNewProperty(mlsNum));
            }
        } catch (error) {
            handleToastMessage('error', 'Error', 'Sorry, something went wrong', 3000);
            console.log(error.message); // eslint-disable-line
        }
    };

    const handleGeoSubmit = async () => {
        try {
            const res = await IrgApi.post(
                `/mlsproperties/update-coordinates/${property.property_url}`,
                JSON.stringify({ latitude, longitude }),
                {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (res.data.status === 'success') {
                handleToastMessage(
                    'success',
                    'Home Coordinates Updated',
                    `${property.address} coordinates updated!`,
                    3000
                );
                dispatch(fetchNewProperties(isLoggedIn));
                setProperty(res.data.data);
                setLongitude('');
                setLatitude('');
                setShowGeoDialog(false);
            }
        } catch (error) {
            handleToastMessage('error', 'Error', 'Sorry, something went wrong', 3000);
            console.log(error); // eslint-disable-line
        }
    };

    const handleOffMarketSubmit = async () => {
        try {
            // send request to api
            const res = await IrgApi.get(
                `/mlsproperties/change-to-off-market/${property.property_url}`,
                {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                }
            );

            if (res.data.status === 'success') {
                handleToastMessage(
                    'warn',
                    'Home Status Changed',
                    `${property.address} has been changed to Off Market`,
                    3000
                );
                setShowConfirmDialog(false);
            }
        } catch (error) {
            handleToastMessage('error', 'Error', 'Sorry, something went wrong', 3000);
            console.log(error); // eslint-disable-line
        }
    };

    const handleDisplayClick = async () => {
        try {
            const res = await IrgApi.get(
                `/mlsproperties/un-approve-new-property/${property.mls_number}`,
                {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                }
            );

            if (res.data.status === 'success') {
                handleToastMessage(
                    'warn',
                    'Home UN-Approved!',
                    `${property.address} has been un-approved!`,
                    3000
                );
                setProperty(res.data.data);
                dispatch(fetchNewProperties(isLoggedIn));
            }
        } catch (error) {
            handleToastMessage('error', 'Error', 'Sorry, something went wrong', 3000);
            console.log(error); // eslint-disable-line
        }
    };

    return (
        <div className="admin_bar">
            <ConfirmOffMarketDialog
                showConfirmDialog={showConfirmDialog}
                setShowConfirmDialog={setShowConfirmDialog}
                handleOffMarketSubmit={handleOffMarketSubmit}
            />
            <PropertyCoordinatesDialog
                showGeoDialog={showGeoDialog}
                setShowGeoDialog={setShowGeoDialog}
                latitude={latitude}
                longitude={longitude}
                handleLatChange={handleLatChange}
                handleLngChange={handleLngChange}
                handleGeoSubmit={handleGeoSubmit}
            />
            <EditDialog
                showDialog={showDialog}
                handleDialogClose={handleDialogClose}
                handlePropertyEdit={handlePropertyEdit}
                address={address}
                handleChange={handleChange}
                unitNum={unitNum}
                city={city}
                zipcode={zipcode}
                fullAddress={fullAddress}
                propertyUrl={propertyUrl}
                handleCheck={handleCheck}
                isDuplicate={isDuplicate}
            />
            {!property.ready_to_display && (
                <Button
                    label="Approve Property"
                    className="p-button-lg p-button-success"
                    onClick={() => handleApproveClick(property.mls_number, property.address)}
                    style={btnStyle}
                />
            )}
            <Button
                label="Edit Address & Url"
                className="p-button-lg p-button-primary"
                onClick={handleEditClick}
                style={btnStyle}
            />

            <Button
                label="Edit Coordinates"
                className="p-button-lg p-button-help"
                onClick={handleCoordsClick}
                style={btnStyle}
            />
            {property.ready_to_display === true && (
                <Button
                    label="Change Display Back"
                    className="p-button-lg p-button-warning"
                    onClick={handleDisplayClick}
                    style={btnStyle}
                />
            )}
            <Button
                label="Change To Off Market"
                icon="pi pi-trash"
                className="p-button-lg p-button-danger"
                onClick={handleOffMarket}
                style={btnStyle}
            />
        </div>
    );
};

AdminBar.propTypes = {
    property: PropTypes.shape({
        address: PropTypes.string.isRequired,
        unit_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        city: PropTypes.string.isRequired,
        zip_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        status: PropTypes.string.isRequired,
        ready_to_display: PropTypes.bool.isRequired,
        mls_number: PropTypes.string.isRequired,
        // full_address: PropTypes.string.isRequired,
        property_url: PropTypes.string.isRequired,
        is_duplicate_property: PropTypes.bool.isRequired,
    }).isRequired,
    setProperty: PropTypes.func.isRequired,
    handleToastMessage: PropTypes.func.isRequired,
};

export default AdminBar;
