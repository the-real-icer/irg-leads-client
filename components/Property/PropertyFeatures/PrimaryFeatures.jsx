import React from 'react';
import PropTypes from 'prop-types';

const PrimaryFeatures = ({ property }) => {
    let lotSizeAcresClean = '';
    if (property) {
        const lotSizeAcres = property.lot_size_acres * 1;
        lotSizeAcresClean = Math.round((lotSizeAcres + Number.EPSILON) * 100) / 100;
    }
    return (
        <React.Fragment>
            <div className="property__features__primary__title">Property Details</div>
            <div className="property__features__primary">
                <div className="property__features__primary__column">
                    <div className="property__features__feature">
                        <span className="property__features__feature__label">Year Built:</span>
                        <span className="property__features__feature__item">
                            {property.year_built}
                        </span>
                    </div>
                    {property.garage_spaces !== 0 && (
                        <div className="property__features__feature">
                            <span className="property__features__feature__label">
                                Garage Spaces:
                            </span>
                            <span className="property__features__feature__item">
                                {property.garage_spaces}{' '}
                                {property.garage_spaces === 1 ? 'Car' : 'Cars'}
                            </span>
                        </div>
                    )}
                    {property.mls_number && (
                        <div className="property__features__feature">
                            <span className="property__features__feature__label">MLS Number:</span>
                            <span className="property__features__feature__item">
                                {property.mls_number}
                            </span>
                        </div>
                    )}
                    {property.lot_size_acres &&
                    property.property_sub_type === 'Single Family Residence' ? (
                        <div className="property__features__feature">
                            <span className="property__features__feature__label">Lot Size:</span>
                            <span className="property__features__feature__item">
                                {lotSizeAcresClean} Acres
                            </span>
                        </div>
                    ) : null}
                </div>
                <div className="property__features__primary__column">
                    {property.property_sub_type && (
                        <div className="property__features__feature">
                            <span className="property__features__feature__label">
                                Property Type:
                            </span>
                            <span className="property__features__feature__item">
                                {property.property_sub_type === 'Single Family Residence'
                                    ? 'Single Family'
                                    : property.property_sub_type}
                            </span>
                        </div>
                    )}
                    {property.pool_private && (
                        <div className="property__features__feature">
                            <span className="property__features__feature__label">Pool:</span>
                            <span className="property__features__feature__item">Private</span>
                        </div>
                    )}
                    {property.senior_community_y_n && (
                        <div className="property__features__feature">
                            <span className="property__features__feature__label">
                                Senior Community:
                            </span>
                            <span className="property__features__feature__item">Yes</span>
                        </div>
                    )}
                    {property.cooling_y_n && property.cooling.includes('CA') && (
                        <div className="property__features__feature">
                            <span className="property__features__feature__label">
                                Air Conditioning:
                            </span>
                            <span className="property__features__feature__item">Central</span>
                        </div>
                    )}
                    {property.association_y_n && property.association_fee && (
                        <div className="property__features__feature">
                            <span className="property__features__feature__label">HOA Fee:</span>
                            <span className="property__features__feature__item">
                                ${property.association_fee}
                            </span>
                        </div>
                    )}
                    {property.levels === 'A' && (
                        <div className="property__features__feature">
                            <span className="property__features__feature__label">Stories:</span>
                            <span className="property__features__feature__item">Single Story</span>
                        </div>
                    )}
                    {property.levels === 'U' && (
                        <div className="property__features__feature">
                            <span className="property__features__feature__label">Stories:</span>
                            <span className="property__features__feature__item">2 Story</span>
                        </div>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
};

PrimaryFeatures.propTypes = {
    property: PropTypes.shape({
        lot_size_acres: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        year_built: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        garage_spaces: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        mls_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        property_sub_type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        pool_private: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        senior_community_y_n: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        cooling_y_n: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        cooling: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        association_y_n: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        association_fee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        levels: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
};

export default PrimaryFeatures;
