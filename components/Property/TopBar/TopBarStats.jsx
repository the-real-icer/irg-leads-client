// React
// import React from 'react';
import PropTypes from 'prop-types';

// IRG API - HOOKS - INFO - UTILS
import getEstimatedPayment from '../../../utils/getEstimatedPayment';

const TopBarStats = ({ property }) => {
    // _________________________________Constants__________________________\\
    const estimatedPayment = getEstimatedPayment(property.price_raw, 0.035);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    });

    return (
        <div className="property__topbar__stats">
            <div className="property__topbar__items">
                <div className="property__topbar__items__item">
                    <div className="property__topbar__detail">{property.price}</div>
                    <span className="property__topbar__label">Est. Pmt: {estimatedPayment}</span>
                </div>
                <div className="property__topbar__items__item">
                    <div className="property__topbar__detail">{property.bedrooms}</div>
                    <span className="property__topbar__label">Beds</span>
                </div>
                <div className="property__topbar__items__item">
                    <div className="property__topbar__detail">{property.bathrooms}</div>
                    <span className="property__topbar__label">Baths</span>
                </div>
                <div className="property__topbar__items__item">
                    <div className="property__topbar__detail">{property.sqft} SqFt</div>
                    <span className="property__topbar__label">
                        {formatter.format(property.price_per_ft_raw)} / SqFt
                    </span>
                </div>
            </div>
            <div className="property__topbar__time">
                {property.days_on_market} {property.days_on_market === 1 ? 'Day' : 'Days'} On Market
            </div>
        </div>
    );
};

TopBarStats.propTypes = {
    property: PropTypes.shape({
        price: PropTypes.string.isRequired,
        price_raw: PropTypes.number.isRequired,
        bathrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        bedrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        sqft: PropTypes.string.isRequired,
        price_per_ft_raw: PropTypes.number.isRequired,
        days_on_market: PropTypes.number.isRequired,
    }).isRequired,
};

export default TopBarStats;
