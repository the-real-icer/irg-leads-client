import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';

import { removeSelectedHome, clearSelectedHomes } from '../../store/actions';
import showToast from '../../utils/showToast';
import { usePropertyFallbackImage } from '../../utils/propertyImageFallback';

const Dialog = dynamic(() => import('primereact/dialog').then((mod) => mod.Dialog), { ssr: false });
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });

const PropertyQueueDialog = ({ visible, onHide, onSendClick }) => {
    const selectedHomes = useSelector((state) => state.selectedHomes);
    const dispatch = useDispatch();
    const fallbackImage = usePropertyFallbackImage();

    const handleRemove = useCallback((property) => {
        dispatch(removeSelectedHome(property));
        const unitNum = property?.unit_number ? ` #${property.unit_number}` : '';
        showToast('info', `${property.address}${unitNum} removed from queue`, 'Removed');
    }, [dispatch]);

    const handleClearAll = useCallback(() => {
        dispatch(clearSelectedHomes());
        showToast('info', 'All properties removed from queue', 'Queue Cleared');
    }, [dispatch]);

    const getImage = (property) => {
        if (!property?.listing_pics) return fallbackImage;
        return property.listing_pics.replace(/http:/, 'https:');
    };

    const footer = selectedHomes.length > 0 ? (
        <div className="property-queue__footer">
            <Button
                label="Clear All"
                icon="pi pi-trash"
                className="p-button-outlined p-button-danger p-button-sm"
                onClick={handleClearAll}
            />
            <Button
                label="Send to Lead"
                icon="pi pi-send"
                className="p-button-primary p-button-sm"
                onClick={onSendClick}
            />
        </div>
    ) : null;

    return (
        <Dialog
            header={`Property Queue (${selectedHomes.length})`}
            visible={visible}
            onHide={onHide}
            style={{ width: '40rem' }}
            className="property-queue__dialog"
            footer={footer}
            draggable={false}
        >
            {selectedHomes.length === 0 ? (
                <div className="property-queue__empty">
                    <i className="pi pi-inbox" />
                    <p>Your queue is empty.</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        Add properties from the Hotsheet or property pages using the + button.
                    </p>
                </div>
            ) : (
                <div className="property-queue__list">
                    {selectedHomes.map((property) => (
                        <div key={property.mls_number} className="property-queue__item">
                            <img
                                src={getImage(property)}
                                alt={property.address}
                                className="property-queue__thumbnail"
                                onError={(e) => {
                                    if (e.currentTarget.src !== fallbackImage) {
                                        e.currentTarget.src = fallbackImage;
                                    }
                                }}
                            />
                            <div className="property-queue__item-info">
                                <div className="property-queue__item-address">
                                    {property.address}
                                    {property.unit_number && ` #${property.unit_number}`}
                                </div>
                                <div className="property-queue__item-details">
                                    {property.city}, CA {property.zip_code}
                                    {property.bedrooms && ` | ${property.bedrooms} Bed`}
                                    {property.bathrooms && ` | ${property.bathrooms} Bath`}
                                    {property.sqft && ` | ${property.sqft} SqFt`}
                                </div>
                                <div className="property-queue__item-price">
                                    {property.price}
                                </div>
                            </div>
                            <button
                                className="property-queue__item-remove"
                                onClick={() => handleRemove(property)}
                                title="Remove from queue"
                            >
                                <i className="pi pi-times" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </Dialog>
    );
};

export default PropertyQueueDialog;
