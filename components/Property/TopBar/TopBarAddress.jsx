// React
// import React from 'react';
import PropTypes from 'prop-types';

const TopBarAddress = ({ property }) => (
    <div className="property__topbar__address">
        <div className="property__topbar__address__address">
            {property.address} {property.unit_number && `#${property.unit_number.trim()}`}{' '}
        </div>
        <div className="property__topbar__address__city">
            {property.city}, CA {property.zip_code}
        </div>
        <div className="property__topbar__status">
            <div className="property__topbar__status__status">
                Status:{' '}
                {property.status === 'Active' && (
                    <span className="property__topbar__status__status__active">Active</span>
                )}
                {property.status === 'Coming Soon' && (
                    <span className="property__topbar__status__status__comingsoon">
                        Coming Soon
                    </span>
                )}
                {property.status === 'Active Under Contract' && (
                    <span className="property__topbar__status__status__contingent">Contingent</span>
                )}
                {property.status === 'Pending' && (
                    <span className="property__topbar__status__status__pending">Pending</span>
                )}
                {property.status === 'Closed' && (
                    <span className="property__topbar__status__status__closed">Recently Sold</span>
                )}
                {property.status === 'Off Market' && (
                    <span className="property__topbar__status__status__off">Off Market</span>
                )}
            </div>
        </div>
    </div>
);

TopBarAddress.propTypes = {
    property: PropTypes.shape({
        address: PropTypes.string.isRequired,
        unit_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        city: PropTypes.string.isRequired,
        zip_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        status: PropTypes.string.isRequired,
    }).isRequired,
};

export default TopBarAddress;
