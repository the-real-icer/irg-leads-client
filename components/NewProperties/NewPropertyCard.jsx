// React & NextJS
import Link from 'next/link';
import PropTypes from 'prop-types';

import { usePropertyFallbackImage } from '../../utils/propertyImageFallback';
import ikUrl from '../../utils/imageKit';

const BTN_BASE =
    'inline-flex items-center justify-center gap-2 px-4 h-[36px] rounded text-sm font-semibold'
    + ' border-none cursor-pointer transition-colors duration-150 flex-1 min-w-0 whitespace-nowrap';

const BTN_PRIMARY = `${BTN_BASE} bg-[#2196F3] text-white hover:bg-[#1e88e5]`;
const BTN_SECONDARY = `${BTN_BASE} bg-[#607D8B] text-white hover:bg-[#56717d]`;
const BTN_INFO = `${BTN_BASE} bg-[#0288D1] text-white hover:bg-[#027ab8]`;
const BTN_HELP = `${BTN_BASE} bg-[#9C27B0] text-white hover:bg-[#8c239e]`;
const BTN_SUCCESS = `${BTN_BASE} bg-[#689F38] text-white hover:bg-[#5d8f32]`;
const BTN_WARNING = `${BTN_BASE} bg-[#FBC02D] text-[#212529] hover:bg-[#f9b825]`;
const BTN_DANGER = `${BTN_BASE} bg-[#D32F2F] text-white hover:bg-[#c62828]`;

const NewPropertyCard = ({
    property,
    handleApproveClick,
    handleEditClick,
    handleCopyMLS,
    handleSearch,
    handleUnDuplicate,
    handleCopyAddress,
    handleOffMarketSubmit,
    handleOpenMapDialog
}) => {
    const fallbackImage = usePropertyFallbackImage();
    let goodImage = '';

    if (property?.listing_pictures?.length > 0) {
        goodImage = ikUrl(property.listing_pictures[0].media_url.replace(/http:/, 'https:'));
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
                        {property.is_duplicate_property && (
                            <span className="new_property_card_duplicate_badge">
                                Duplicate Property
                            </span>
                        )}
                        <img
                            src={goodImage || fallbackImage}
                            alt={property.address}
                            className="new_property_card_img"
                            onError={(e) => {
                                if (e.currentTarget.src !== fallbackImage) {
                                    e.currentTarget.src = fallbackImage;
                                }
                            }}
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
                            <span
                                className={
                                    `status-value status-value--${property.status?.toLowerCase().replace(/\s+/g, '-')}`
                                }
                            >
                                {property.status}
                            </span>
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
                            </div>
                            <span>{property.property_url}</span>
                        </div>
                    </Link>
                </div>

                {/* Action Buttons */}
                <div className="new_property_card_actions">
                    <div className="new_property_card_btns">
                        <button
                            type="button"
                            className={BTN_SECONDARY}
                            onClick={() => handleOpenMapDialog(property)}
                        >
                            Show Map
                        </button>
                        <button
                            type="button"
                            className={BTN_INFO}
                            onClick={() => handleCopyAddress(property)}
                        >
                            Copy Address
                        </button>
                    </div>

                    <div className="new_property_card_btns">
                        <button
                            type="button"
                            className={BTN_HELP}
                            onClick={() => handleCopyMLS(property.mls_number)}
                        >
                            Copy MLS #
                        </button>
                        <button
                            type="button"
                            className={BTN_DANGER}
                            onClick={() => handleOffMarketSubmit(properUrl)}
                        >
                            Off Market
                        </button>
                    </div>

                    <div className="new_property_card_btns">
                        <button
                            type="button"
                            className={BTN_WARNING}
                            onClick={() => handleSearch(properUrl)}
                        >
                            Check Status
                        </button>
                        <button
                            type="button"
                            className={BTN_SUCCESS}
                            onClick={() => handleUnDuplicate({ property, newAddress: properUrl })}
                        >
                            Un-Duplicate
                        </button>
                    </div>

                    <div className="new_property_card_btns">
                        <button
                            type="button"
                            className={BTN_PRIMARY}
                            onClick={() => handleApproveClick(property.mls_number, property.address)}
                        >
                            <i className="pi pi-check" />
                            Approve
                        </button>
                        <button
                            type="button"
                            className={BTN_SECONDARY}
                            onClick={() => handleEditClick(property)}
                        >
                            Edit
                        </button>
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
    handleOffMarketSubmit: PropTypes.func.isRequired,
    handleOpenMapDialog: PropTypes.func.isRequired,
};

export default NewPropertyCard;
