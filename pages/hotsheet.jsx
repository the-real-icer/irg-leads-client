// React
import { useEffect, useCallback } from 'react';
// import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
// Redux
import { useSelector, useDispatch } from 'react-redux';

// IRG Components
import MainLayout from '../components/layout/MainLayout';
import PrpCard from '../components/prpCard/PrpCard';
const HotsheetDropdown = dynamic(() => import('../components/Hotsheet/HotsheetDropdown'), {
    ssr: false,
});

// IRG API - HOOKS - INFO - UTILS
import {
    fetchHotsheetHomes,
    changeCounty,
    changeCity,
    changeNeighborhood,
    changeZipcode,
    changeDaysBack,
    changeLimit,
    fetchingHomes,
} from '../store/actions/hotsheet';

const Hotsheet = () => {
    // __________________Redux State______________________\\
    const hotsheet = useSelector((state) => state.hotsheet);
    const irgAreas = useSelector((state) => state.irgAreas);

    // _____________________Hooks_____________________\\
    const dispatch = useDispatch();

    // Default parameters
    const defaultParams = {
        days: 3,
        limit: 100,
        county: 'san-diego',
        city: '',
        hood: '',
        zip: '',
    };

    // Fetch homes with current parameters
    const fetchHomes = useCallback(
        (params) => {
            dispatch(fetchHotsheetHomes(params));
        },
        [dispatch],
    );

    // Event handlers
    const onCityChange = useCallback(
        (e) => {
            const value = e.value?.name || 'Select A City';
            dispatch(changeCity(value));
            dispatch(fetchingHomes(true));
        },
        [dispatch],
    );

    const onZipChange = useCallback(
        (e) => {
            const value = e.value?.name || 'Select A Zipcode';
            dispatch(changeZipcode(value));
            dispatch(fetchingHomes(true));
        },
        [dispatch],
    );

    const onHoodChange = useCallback(
        (e) => {
            const value = e.value?.name || 'Select A Neighborhood';
            dispatch(changeNeighborhood(value));
            dispatch(fetchingHomes(true));
        },
        [dispatch],
    );

    const onDaysChange = useCallback(
        (e) => {
            const value = e.value?.name || '# of Days Back';
            dispatch(changeDaysBack(value));
            dispatch(fetchingHomes(true));
        },
        [dispatch],
    );

    const onLimitChange = useCallback(
        (e) => {
            const value = e.value?.name || '# of Homes';
            dispatch(changeLimit(value));
            dispatch(fetchingHomes(true));
        },
        [dispatch],
    );

    const onCountyChange = useCallback(
        (e) => {
            const value = e.value?.name || 'Select A County';
            dispatch(changeCounty(value));
            dispatch(fetchingHomes(true));
        },
        [dispatch],
    );

    // Fetch homes on mount and when parameters change
    useEffect(() => {
        const params = {
            days: hotsheet.daysBack !== '# of Days Back' ? hotsheet.daysBack : defaultParams.days,
            limit: hotsheet.limit !== '# of Homes' ? hotsheet.limit : defaultParams.limit,
            county:
                hotsheet.county !== 'Select A County'
                    ? hotsheet.county.toLowerCase().replace(/\s/g, '-')
                    : defaultParams.county,
            city:
                hotsheet.city !== 'Select A City'
                    ? hotsheet.city.toLowerCase().replace(/\s/g, '-')
                    : '',
            hood:
                hotsheet.neighborhood !== 'Select A Neighborhood'
                    ? hotsheet.neighborhood.toLowerCase().replace(/\s/g, '-')
                    : '',
            zip: hotsheet.zipcode !== 'Select A Zipcode' ? hotsheet.zipcode : '',
        };

        if (hotsheet.fetchingHomes || !hotsheet.initialHomes.length) {
            fetchHomes(params);
        }
    }, [hotsheet, fetchHomes, defaultParams.limit, defaultParams.days, defaultParams.county]);

    const numDaysBack = [
        { name: 1 },
        { name: 2 },
        { name: 3 },
        { name: 4 },
        { name: 5 },
        { name: 6 },
        { name: 7 },
    ];
    const limitOfHomes = [
        { name: 50 },
        { name: 100 },
        { name: 150 },
        { name: 200 },
        { name: 250 },
        { name: 300 },
        { name: 500 },
    ];
    const countyOptions = [
        { name: 'San Diego' },
        { name: 'Orange' },
        { name: 'Riverside' },
        { name: 'Los Angeles' },
    ];

    return (
        <MainLayout>
            <div className="hotsheet">
                <div className="hotsheet__container">
                    <div className="hotsheet__filters">
                        <HotsheetDropdown
                            value={hotsheet.county}
                            options={countyOptions}
                            onChange={onCountyChange}
                        />
                        <HotsheetDropdown
                            value={hotsheet.city}
                            options={irgAreas.City}
                            onChange={onCityChange}
                        />
                        <HotsheetDropdown
                            value={hotsheet.zipcode}
                            options={irgAreas.Zip}
                            onChange={onZipChange}
                        />
                        <HotsheetDropdown
                            value={hotsheet.neighborhood}
                            options={irgAreas.Neighborhood}
                            onChange={onHoodChange}
                        />
                        <HotsheetDropdown
                            value={hotsheet.daysBack}
                            options={numDaysBack}
                            onChange={onDaysChange}
                        />
                        <HotsheetDropdown
                            value={hotsheet.limit}
                            options={limitOfHomes}
                            onChange={onLimitChange}
                        />
                        <h3 style={{ marginTop: '.8rem', marginLeft: '2.5rem' }}>
                            {hotsheet.initialHomes.length} Homes On Market
                        </h3>
                    </div>
                    <div className="hotsheet__homes">
                        {hotsheet.initialHomes.length === 0 ? (
                            <p>{hotsheet.fetchingHomes ? 'Loading...' : 'No homes found'}</p>
                        ) : (
                            hotsheet.initialHomes.map((home) => (
                                <PrpCard key={home._id} property={home} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Hotsheet;
