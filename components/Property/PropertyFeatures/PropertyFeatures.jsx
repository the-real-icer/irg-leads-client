// React
// import React from 'react';
import PropTypes from 'prop-types';

import PrimaryFeatures from './PrimaryFeatures';
import PropertyDescription from './PropertyDescription';
import AgentInfo from '../AgentInfo/AgentInfo';

const PropertyFeatures = ({ property }) => (
    <div className="property__page__container">
        <div className="property__page__features__question">
            <div className="property__features">
                <PropertyDescription property={property} />
                <PrimaryFeatures property={property} />
            </div>
            <AgentInfo property={property} />
        </div>
    </div>
);

PropertyFeatures.propTypes = {
    property: PropTypes.object.isRequired,
};

export default PropertyFeatures;
