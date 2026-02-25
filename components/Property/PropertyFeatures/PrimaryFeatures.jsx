import PropTypes from 'prop-types';

const PrimaryFeatures = ({ property }) => {
    let lotSizeAcresClean = '';
    if (property.lot_size_acres) {
        const lotSizeAcres = property.lot_size_acres * 1;
        lotSizeAcresClean = Math.round((lotSizeAcres + Number.EPSILON) * 100) / 100;
    }

    const details = [];

    details.push({ label: 'Year Built', value: property.year_built });

    if (property.property_sub_type) {
        details.push({
            label: 'Property Type',
            value:
                property.property_sub_type === 'Single Family Residence'
                    ? 'Single Family'
                    : property.property_sub_type,
        });
    }

    if (property.garage_spaces !== 0) {
        details.push({
            label: 'Garage Spaces',
            value: `${property.garage_spaces} ${property.garage_spaces === 1 ? 'Car' : 'Cars'}`,
        });
    }

    if (property.mls_number) {
        details.push({ label: 'MLS Number', value: property.mls_number });
    }

    if (property.lot_size_acres && property.property_sub_type === 'Single Family Residence') {
        details.push({ label: 'Lot Size', value: `${lotSizeAcresClean} Acres` });
    }

    if (property.pool_private) {
        details.push({ label: 'Pool', value: 'Private' });
    }

    if (
        property.cooling_y_n &&
        property.cooling &&
        property.cooling.length > 0 &&
        property.cooling.includes('CA')
    ) {
        details.push({ label: 'Air Conditioning', value: 'Central' });
    }

    if (property.association_y_n && property.association_fee) {
        details.push({ label: 'HOA Fee', value: `$${property.association_fee}` });
    }

    if (property.senior_community_y_n) {
        details.push({ label: 'Senior Community', value: 'Yes' });
    }

    if (property.levels === 'A') {
        details.push({ label: 'Stories', value: 'Single Story' });
    } else if (property.levels === 'U') {
        details.push({ label: 'Stories', value: '2 Story' });
    }

    return (
        <div className="property-details">
            <h3 className="property-details__title">Property Details</h3>
            <div className="property-details__grid">
                {details.map((detail) => (
                    <div key={detail.label} className="property-details__item">
                        <span className="property-details__label">{detail.label}</span>
                        <span className="property-details__value">{detail.value}</span>
                    </div>
                ))}
            </div>
        </div>
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
