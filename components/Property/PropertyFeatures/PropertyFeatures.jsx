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
            <div style={{ alignSelf: 'flex-start' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    marginBottom: '12px',
                    background: 'hsl(var(--muted))',
                    border: '1px solid hsl(var(--border))',
                    borderLeft: '3px solid hsl(var(--primary))',
                    borderRadius: 'var(--radius)',
                }}>
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
                    <p style={{
                        fontSize: '13px',
                        color: 'hsl(var(--muted-foreground))',
                        margin: 0,
                        lineHeight: 1.5,
                    }}>
                        Data Updated Manually — Double Check MLS to Confirm
                    </p>
                </div>
                <AgentInfo property={property} />
            </div>
        </div>
    </div>
);

PropertyFeatures.propTypes = {
    property: PropTypes.object.isRequired,
};

export default PropertyFeatures;
