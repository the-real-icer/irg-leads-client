import PropTypes from 'prop-types';

import TopBarStats from './TopBarStats';
import TopBarAddress from './TopBarAddress';

const TopBar = ({ property }) => (
    <header className="property__page__container">
        <div className="property__topbar">
            <TopBarAddress property={property} />
            <TopBarStats property={property} />
        </div>
    </header>
);

TopBar.propTypes = {
    property: PropTypes.shape({
        address: PropTypes.string.isRequired,
        unit_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        city: PropTypes.string.isRequired,
        zip_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        status: PropTypes.string.isRequired,
        days_on_market: PropTypes.number.isRequired,
        bedrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        bathrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        sqft: PropTypes.string.isRequired,
        price: PropTypes.string.isRequired,
        price_raw: PropTypes.number.isRequired,
        price_per_ft_raw: PropTypes.number.isRequired,
        mls_number: PropTypes.string.isRequired,
    }).isRequired,
};

export default TopBar;
