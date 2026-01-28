// React
import { useState, useMemo, useCallback } from 'react';

// Redux
import { useSelector, useDispatch } from 'react-redux';

// Third Party Components
import showToast from '../utils/showToast';
import { Button } from 'primereact/button';;

// IRG Components
import MainLayout from '../components/layout/MainLayout';
import NewPropertyCard from '../components/NewProperties/NewPropertyCard';
import NewPropertyEditDialog from '../components/NewProperties/NewPropertyEditDialog';
import ConfirmOffMarketDialog from '../components/NewProperties/ConfirmOffMarketDialog';
import MapDialog from '@/components/Shared/MapDialog';

// IRG API - HOOKS - INFO - UTILS
import IrgApi from '../assets/irgApi';
import { removeNewProperty, updateNewProperty } from '../store/actions';

// Centralized error handler
const handleApiError = (err, defaultMessage = 'An error occurred') => {
    if (err.message === 'Request failed with status code 418') {
        showToast('error', 'Duplicate Property', 'Error');
    } else if (err.message) {
        showToast('error', err.message, 'Error');
        if (process.env.NODE_ENV !== 'production') {
            console.error(err); // eslint-disable-line
        }
    } else {
        showToast('error', defaultMessage, 'Error');
        if (process.env.NODE_ENV !== 'production') {
            console.error(err); // eslint-disable-line
        }
    }
};

const NewProperties = () => {
    // __________________Redux State______________________\\
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const newProperties = useSelector((state) => state.newProperties);

    // ________________Component State_________________\\
    const [formData, setFormData] = useState({
        address: '',
        unitNumber: '',
        city: '',
        zipcode: '',
        propertyUrl: '',
        latitude: '',
        longitude: '',
        isDuplicate: false,
        badGeoCode: false,
        checkAttributes: false,
    });

    const [showDialog, setShowDialog] = useState(false);
    const [selectedHome, setSelectedHome] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [hideDuplicates, setHideDuplicates] = useState(false);
    const [showMapDialog, setShowMapDialog] = useState(false);
    const [processingDuplicates, setProcessingDuplicates] = useState(false);

    // _____________________Hooks_____________________\\
    const dispatch = useDispatch();

    // Toggle functions for filters
    const toggleHideDuplicates = () => {
        setHideDuplicates((prev) => !prev);
    };

    // Open Map Dialog
    const handleOpenMapDialog = (property) => {
        setShowMapDialog(true);
        setSelectedHome(property)
    }

    // Close Map Dialog
    const handleCloseMapDialog = () => {
        setShowMapDialog(false);
        setSelectedHome(null)
    }

    const handleEditClick = (property) => {
        setSelectedHome(property);
        setFormData({
            address: property.address,
            unitNumber: property.unit_number,
            city: property.city,
            zipcode: property.zip_code,
            propertyUrl: property.property_url,
            latitude: property.coordinates.lat,
            longitude: property.coordinates.lng,
            isDuplicate: property.is_duplicate_property,
            badGeoCode: property.is_bad_geocode,
            checkAttributes: property.check_attributes,
        });
        setShowDialog(true);
    };

    const handleDialogClose = () => {
        setSelectedHome(null);
        setFormData({
            address: '',
            unitNumber: '',
            city: '',
            zipcode: '',
            propertyUrl: '',
            latitude: '',
            longitude: '',
            isDuplicate: false,
            badGeoCode: false,
            checkAttributes: false,
        });
        setShowDialog(false);
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleCheckboxChange = (field, e) => {
        setFormData((prev) => ({ ...prev, [field]: e.checked }));
    };

    const handleApproveClick = useCallback(
        async (mlsNum, homeAddress) => {
            try {
                const res = await IrgApi.get(`/mlsproperties/approve-new-property/${mlsNum}`, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });

                if (res.data.status === 'success') {
                    showToast('success', `${homeAddress} has been approved!`, 'Home Approved!');
                    dispatch(removeNewProperty(mlsNum));
                }
            } catch (error) {
                handleApiError(error);
            }
        },
        [isLoggedIn, dispatch], // Dependencies
    );

    const handlePropertyEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await IrgApi.post(
                '/mlsproperties/edit-new-property',
                {
                    address: formData.address,
                    unitNumber: formData.unitNumber,
                    city: formData.city,
                    zipcode: formData.zipcode,
                    propertyUrl: formData.propertyUrl,
                    mlsId: selectedHome.mls_number,
                    isDuplicate: formData.isDuplicate,
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    badGeoCode: formData.badGeoCode,
                    checkAttributes: formData.checkAttributes,
                },
                {
                    headers: {
                        Authorization: `Bearer ${isLoggedIn}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (res.data.status === 'success') {
                showToast('success', `${formData.address} has been edited!`, 'Home Edited!');
                dispatch(updateNewProperty(res.data.data));
                handleDialogClose();
            }
        } catch (err) {
            handleApiError(err, 'No error message set');
        }
    };

    const handleUnDuplicate = useCallback(
        async ({ property, newAddress }) => {
            try {
                const res = await IrgApi.post(
                    '/mlsproperties/unduplicate-property',
                    {
                        propertyUrl: newAddress,
                        mlsId: property.mls_number,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${isLoggedIn}`,
                            'Content-Type': 'application/json',
                        },
                    },
                );

                if (res.data.status === 'success') {
                    showToast(
                        'success',
                        `${property.address} has been unduplicated!`,
                        'Home Un Duplicated!',
                    );
                    dispatch(updateNewProperty(res.data.data));
                }
            } catch (err) {
                handleApiError(err, 'No error message set');
            }
        },
        [isLoggedIn, dispatch],
    );

    const handleSearch = useCallback(
        async (searchAddress) => {
            try {
                const res = await IrgApi.get(`/mlsproperties/address/${searchAddress}`, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });

                if (res.data.data.result) {
                    showToast('warn', `Status: ${res.data.data.result.status}`, 'Home Found');
                } else if (res.data.data.result === null) {
                    showToast('success', 'No homes with that url', 'None Found!');
                }
            } catch (error) {
                handleApiError(error);
            }
        },
        [isLoggedIn], // Dependencies
    );

    const handleCopyMLS = (text) => {
        navigator.clipboard
            .writeText(text)
            .then(() => showToast('info', text, 'Text Copied!', 'bottom-left'));
    };

    const handleCopyAddress = (property) => {
        const { address, city, state, zip_code } = property;        
        const txt = `${address}, ${city}, ${state} ${zip_code}`
        navigator.clipboard
            .writeText(txt)
            .then(() => showToast('info', txt, 'Text Copied!', 'bottom-left'));

    }

    const handleOffMarketSubmit = useCallback(
        async (url) => {
            try {
                const res = await IrgApi.get(`/mlsproperties/change-to-off-market/${url}`, {
                    headers: { Authorization: `Bearer ${isLoggedIn}` },
                });
                if (res.data.status === 'success') {
                    showToast(
                        'success',
                        `${url} has been changed to Off Market`,
                        'Home Status Changed',
                    );
                    setShowConfirmDialog(false);
                }
            } catch (error) {
                handleApiError(error);
            }
        },
        [isLoggedIn, setShowConfirmDialog], // Dependencies
    );

    const handleTryDuplicates = useCallback(async () => {
        setProcessingDuplicates(true);
        showToast('info', 'Starting duplicate processing...', 'Processing', 'top-right');

        let successCount = 0;
        let failureCount = 0;
        const totalProperties = newProperties.length;

        // Process properties sequentially
        for (const property of newProperties) {
            try {
                // eslint-disable-next-line no-await-in-loop
                const res = await IrgApi.post(
                    '/mlsproperties/unduplicate-property',
                    {
                        propertyUrl: property.property_url,
                        mlsId: property.mls_number,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${isLoggedIn}`,
                            'Content-Type': 'application/json',
                        },
                    },
                );

                if (res.data.status === 'success') {
                    successCount++;
                    dispatch(updateNewProperty(res.data.data));
                } else {
                    failureCount++;
                }
            } catch {
                failureCount++;
                // Continue to next property on error
            }
        }

        setProcessingDuplicates(false);
        showToast(
            'success',
            `Processed ${totalProperties} properties. Success: ${successCount}, Failed: ${failureCount}`,
            'Batch Complete',
            'top-right',
        );
    }, [newProperties, isLoggedIn, dispatch]);

    // Function to render the property cards
    const renderedCards = useMemo(
        () =>
            newProperties
                .filter((property) => !hideDuplicates || !property.is_duplicate_property)
                .map((property) => (
                    <NewPropertyCard
                        key={property._id}
                        property={property}
                        handleEditClick={handleEditClick}
                        handleApproveClick={handleApproveClick}
                        handleCopyMLS={handleCopyMLS}
                        handleCopyAddress={handleCopyAddress}
                        handleUnDuplicate={handleUnDuplicate}
                        handleSearch={handleSearch}
                        setShowConfirmDialog={setShowConfirmDialog}
                        handleOffMarketSubmit={handleOffMarketSubmit}
                        handleOpenMapDialog={handleOpenMapDialog}
                    />
                )),
        [
            newProperties,
            hideDuplicates,
            handleApproveClick,
            handleSearch,
            handleOffMarketSubmit,
            handleUnDuplicate,
        ], 
    );

    //Function to update the count of properties based on if "Hide Duplicates" is clicked
    const visiblePropertiesCount = useMemo(
        () => newProperties.filter((p) => !hideDuplicates || !p.is_duplicate_property).length,
        [newProperties, hideDuplicates],
    );

    return (
        <MainLayout>
            <MapDialog 
                showMapDialog={showMapDialog}
                handleCloseMapDialog={handleCloseMapDialog}
                property={selectedHome}
            />
            <ConfirmOffMarketDialog
                showConfirmDialog={showConfirmDialog}
                setShowConfirmDialog={setShowConfirmDialog}
                handleOffMarketSubmit={handleOffMarketSubmit}
            />
            <NewPropertyEditDialog
                showDialog={showDialog}
                handleDialogClose={handleDialogClose}
                handlePropertyEdit={handlePropertyEdit}
                handleChange={handleChange}
                address={formData.address}
                unitNumber={formData.unitNumber}
                city={formData.city}
                zipcode={formData.zipcode}
                propertyUrl={formData.propertyUrl}
                handleDupCheck={(e) => handleCheckboxChange('isDuplicate', e)}
                handleGeoCheck={(e) => handleCheckboxChange('badGeoCode', e)}
                handleAttrCheck={(e) => handleCheckboxChange('checkAttributes', e)}
                isDuplicate={formData.isDuplicate}
                latitude={formData.latitude}
                longitude={formData.longitude}
                badGeoCode={formData.badGeoCode}
            />
            <div className="new__properties">
                <div className='new__properties__header'>
<h1 style={{ marginLeft: '1rem' }}>New Properties</h1>
                    <h3 style={{ marginLeft: '1rem', marginBottom: '.25rem' }}>
                        {visiblePropertiesCount} homes to approve
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', marginLeft: '1rem' }}>
                        <Button
                            label={hideDuplicates ? 'Show Duplicates' : 'Hide Duplicates'}
                            className="p-button-danger new__properties__duplicates__button"
                            onClick={toggleHideDuplicates}
                            style={{ backgroundColor: hideDuplicates ? '#4CAF50' : '#f44336' }}
                        />
                        <Button
                            label="Try Duplicates"
                            icon={processingDuplicates ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'}
                            className="p-button-warning"
                            onClick={handleTryDuplicates}
                            disabled={processingDuplicates || newProperties.length === 0}
                        />
                    </div>
                </div>
                <div className="new__properties__container">
                    {newProperties.length === 0 ? (
                        <p>No new properties to review.</p>
                    ) : (
                        renderedCards
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default NewProperties;
