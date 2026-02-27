// React
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import PrpCard from '../../prpCard/PrpCard';

const HomeList = (props) => {
    const { homes, searchPage } = props;
    const [homesToRender, setHomesRender] = useState([]);

    useEffect(() => {
        if (homes.length > 0) {
            setHomesRender(homes);
        }

        return () => setHomesRender([]);
    }, [homes, searchPage.loadingHomes]);

    const renderHomes = () =>
        homesToRender.map((property) => <PrpCard key={property.mls_number} property={property} />);

    if (homes.length === 0 && !searchPage.loadingHomes) {
        return null;
    }

    return <>{renderHomes()}</>;
};

HomeList.propTypes = {
    homes: PropTypes.array.isRequired,
    searchPage: PropTypes.shape({
        loadingHomes: PropTypes.bool.isRequired,
    }).isRequired,
};

export default HomeList;
