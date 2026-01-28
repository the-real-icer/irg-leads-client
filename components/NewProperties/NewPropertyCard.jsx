// React & NextJS
import Link from 'next/link';
import PropTypes from 'prop-types';

import { Button } from 'primereact/button';

const NewPropertyCard = ({
    property,
    handleApproveClick,
    handleEditClick,
    handleCopyMLS,
    handleSearch,
    handleUnDuplicate,
    handleCopyAddress,
    // setShowConfirmDialog,
    handleOffMarketSubmit,
    handleOpenMapDialog
}) => {
    let goodImage = '';

    if (property?.listing_pictures?.length > 0) {
        goodImage = property.listing_pictures[0].media_url.replace(/http:/, 'https:');
    }

    // Create what the property_url should be
    const propUrl = `${property.address} ${property.unit_number} ${property.city} ca ${property.zip_code}`;
    const properUrl = propUrl
        .toLowerCase()
        .replace(/\s/g, '-')
        .replace(/--/g, '-')
        .replace(/í/g, 'i');

    return (
        <div className="new_property_card">
            <div className="new_property_card_container">
                {/* Image Section */}
                <Link href={`/property/${property.property_url}`} passHref>
                    <div className="new_property_card_img_wrapper">
                        <img
                            src={goodImage || '/No-Photo-Light-Large.jpg'}
                            alt={property.address}
                            className="new_property_card_img"
                        />
                    </div>
                </Link>

                {/* Property Information */}
                <div className="new_property_card_info_section">
                    <Link href={`/property/${property.property_url}`} passHref>
                        <div className="new_property_card_address">
                            <span>
                                {property.address}
                                {property.unit_number && ` #${property.unit_number}`}
                            </span>
                            <span>
                                {property.city}, {property.state} {property.zip_code}
                            </span>
                            <span>{property.mls_number}</span>
                        </div>
                    </Link>

                    <Link href={`/property/${property.property_url}`} passHref>
                        <div className="new_property_card_status">
                            <span>Status</span>
                            <span>{property.status}</span>
                            <span>{property.price}</span>
                        </div>
                    </Link>

                    <Link href={`/property/${property.property_url}`} passHref>
                        <div className="new_property_card_url">
                            <div className="new_property_card_flags">
                                {property.check_attributes && (
                                    <span className="new_property_card_flag new_property_card_flag--warning">
                                        Check Attributes
                                    </span>
                                )}
                                {property.is_bad_geocode && (
                                    <span className="new_property_card_flag new_property_card_flag--error">
                                        Bad Geocode
                                    </span>
                                )}
                                {property.is_duplicate_property && (
                                    <span className="new_property_card_flag new_property_card_flag--info">
                                        Duplicate Property
                                    </span>
                                )}
                            </div>
                            <span>{property.property_url}</span>
                        </div>
                    </Link>
                </div>

                {/* Action Buttons */}
                <div className="new_property_card_actions">
                    <div className="new_property_card_btns">
                        <Button
                            label="Show Map"
                            className="p-button-secondary"
                            onClick={() => handleOpenMapDialog(property)}
                        />
                        <Button
                            label="Copy Address"
                            className="p-button-info"
                            onClick={() => handleCopyAddress(property)}
                        />
                    </div>

                    <div className="new_property_card_btns">
                        <Button
                            label="Copy MLS #"
                            onClick={() => handleCopyMLS(property.mls_number)}
                            className="p-button-help"
                        />
                        <Button
                            label="Off Market"
                            className="p-button-danger"
                            onClick={() => handleOffMarketSubmit(properUrl)}
                        />
                    </div>

                    <div className="new_property_card_btns">
                        <Button
                            label="Check Status"
                            onClick={() => handleSearch(properUrl)}
                            className="p-button-warning"
                        />
                        <Button
                            label="Un-Duplicate"
                            className="p-button-success"
                            onClick={() => handleUnDuplicate({ property, newAddress: properUrl })}
                        />
                    </div>

                    <div className="new_property_card_btns">
                        <Button
                            label="Approve"
                            icon="pi pi-check"
                            onClick={() => handleApproveClick(property.mls_number, property.address)}
                        />
                        <Button
                            label="Edit"
                            onClick={() => handleEditClick(property)}
                            className="p-button-secondary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

NewPropertyCard.propTypes = {
    property: PropTypes.shape({
        address: PropTypes.string.isRequired,
        unit_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        city: PropTypes.string.isRequired,
        state: PropTypes.string.isRequired,
        mls_number: PropTypes.string.isRequired,
        // full_address: PropTypes.string.isRequired,
        listing_pics: PropTypes.string.isRequired,
        property_url: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        days_on_market: PropTypes.number.isRequired,
        check_attributes: PropTypes.bool.isRequired,
        is_bad_geocode: PropTypes.bool.isRequired,
        is_duplicate_property: PropTypes.bool.isRequired,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        zip_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        listing_pictures: PropTypes.array.isRequired,
    }).isRequired,
    handleApproveClick: PropTypes.func.isRequired,
    handleEditClick: PropTypes.func.isRequired,
    handleCopyMLS: PropTypes.func.isRequired,
    handleSearch: PropTypes.func.isRequired,
    handleUnDuplicate: PropTypes.func.isRequired,
    handleCopyAddress: PropTypes.func.isRequired,
    // setShowConfirmDialog: PropTypes.func.isRequired,
    handleOffMarketSubmit: PropTypes.func.isRequired,
    handleOpenMapDialog: PropTypes.func.isRequired,
};

export default NewPropertyCard;
