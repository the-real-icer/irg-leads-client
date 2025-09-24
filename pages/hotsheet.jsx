// React
import { useEffect, useCallback, useRef } from 'react';
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

// Define default parameters outside the component
const defaultParams = {
    days: 3,
    limit: 100,
    county: 'san-diego',
    city: '',
    hood: '',
    zip: '',
};

const Hotsheet = () => {
    // __________________Redux State______________________\\
    const { county, city, neighborhood, zipcode, daysBack, limit, initialHomes, fetchingHomes, error } =
        useSelector((state) => state.hotsheet);
    const irgAreas = useSelector((state) => state.irgAreas);

    // _____________________Hooks_____________________\\
    const dispatch = useDispatch();
    const hasFetchedInitial = useRef(false); // Track initial fetch

    // Fetch homes with current parameters
    const fetchHomes = useCallback(
        (params, source) => {
            console.log(`Fetching homes from ${source} with params:`, params);
            dispatch(fetchHotsheetHomes(params));
        },
        [dispatch],
    );

    // Helper to format string parameters
    const formatStringParam = (value, defaultValue = '') => {
        if (!value || value.startsWith('Select') || value === '# of Days Back' || value === '# of Homes') {
            return defaultValue;
        }
        return value.toLowerCase().replace(/\s/g, '-');
    };

    // Helper to format numeric parameters
    const formatNumericParam = (value, defaultValue) => {
        if (!value || value === '# of Days Back' || value === '# of Homes') {
            return defaultValue;
        }
        return Number(value) || defaultValue;
    };

    // Event handlers with change check to prevent unnecessary fetches
    const onCityChange = useCallback(
        (e) => {
            const value = e.value?.name || '';
            if (value !== city) {
                dispatch(changeCity(value));
                const params = {
                    ...defaultParams,
                    county: formatStringParam(county, defaultParams.county),
                    city: formatStringParam(value),
                    hood: formatStringParam(neighborhood),
                    zip: formatStringParam(zipcode),
                    days: formatNumericParam(daysBack, defaultParams.days),
                    limit: formatNumericParam(limit, defaultParams.limit),
                };
                fetchHomes(params, 'onCityChange');
            }
        },
        [dispatch, fetchHomes, county, neighborhood, zipcode, daysBack, limit, city],
    );

    const onZipChange = useCallback(
        (e) => {
            const value = e.value?.name || '';
            if (value !== zipcode) {
                dispatch(changeZipcode(value));
                const params = {
                    ...defaultParams,
                    county: formatStringParam(county, defaultParams.county),
                    city: formatStringParam(city),
                    hood: formatStringParam(neighborhood),
                    zip: formatStringParam(value),
                    days: formatNumericParam(daysBack, defaultParams.days),
                    limit: formatNumericParam(limit, defaultParams.limit),
                };
                fetchHomes(params, 'onZipChange');
            }
        },
        [dispatch, fetchHomes, county, city, neighborhood, daysBack, limit, zipcode],
    );

    const onHoodChange = useCallback(
        (e) => {
            const value = e.value?.name || '';
            if (value !== neighborhood) {
                dispatch(changeNeighborhood(value));
                const params = {
                    ...defaultParams,
                    county: formatStringParam(county, defaultParams.county),
                    city: formatStringParam(city),
                    hood: formatStringParam(value),
                    zip: formatStringParam(zipcode),
                    days: formatNumericParam(daysBack, defaultParams.days),
                    limit: formatNumericParam(limit, defaultParams.limit),
                };
                fetchHomes(params, 'onHoodChange');
            }
        },
        [dispatch, fetchHomes, county, city, zipcode, daysBack, limit, neighborhood],
    );

    const onDaysChange = useCallback(
        (e) => {
            const value = String(e.value?.name ?? defaultParams.days);
            if (value !== String(daysBack)) {
                dispatch(changeDaysBack(Number(value) || defaultParams.days));
                const params = {
                    ...defaultParams,
                    county: formatStringParam(county, defaultParams.county),
                    city: formatStringParam(city),
                    hood: formatStringParam(neighborhood),
                    zip: formatStringParam(zipcode),
                    days: formatNumericParam(value, defaultParams.days),
                    limit: formatNumericParam(limit, defaultParams.limit),
                };
                fetchHomes(params, 'onDaysChange');
            }
        },
        [dispatch, fetchHomes, county, city, neighborhood, zipcode, limit, daysBack],
    );

    const onLimitChange = useCallback(
        (e) => {
            const value = String(e.value?.name ?? defaultParams.limit);
            if (value !== String(limit)) {
                dispatch(changeLimit(Number(value) || defaultParams.limit));
                const params = {
                    ...defaultParams,
                    county: formatStringParam(county, defaultParams.county),
                    city: formatStringParam(city),
                    hood: formatStringParam(neighborhood),
                    zip: formatStringParam(zipcode),
                    days: formatNumericParam(daysBack, defaultParams.days),
                    limit: formatNumericParam(value, defaultParams.limit),
                };
                fetchHomes(params, 'onLimitChange');
            }
        },
        [dispatch, fetchHomes, county, city, neighborhood, zipcode, daysBack, limit],
    );

    const onCountyChange = useCallback(
        (e) => {
            const value = e.value?.name || '';
            if (value !== county) {
                dispatch(changeCounty(value));
                const params = {
                    ...defaultParams,
                    county: formatStringParam(value, defaultParams.county),
                    city: formatStringParam(city),
                    hood: formatStringParam(neighborhood),
                    zip: formatStringParam(zipcode),
                    days: formatNumericParam(daysBack, defaultParams.days),
                    limit: formatNumericParam(limit, defaultParams.limit),
                };
                fetchHomes(params, 'onCountyChange');
            }
        },
        [dispatch, fetchHomes, city, neighborhood, zipcode, daysBack, limit, county],
    );

    // Fetch homes on mount
    useEffect(() => {
        if (!hasFetchedInitial.current && !initialHomes.length && !fetchingHomes) {
            console.log('Initial fetch triggered');
            fetchHomes(defaultParams, 'initial');
            hasFetchedInitial.current = true;
        }
    }, [fetchHomes, initialHomes.length, fetchingHomes]);

    // Debug state changes
    useEffect(() => {
        console.log('initialHomes:', initialHomes);
        console.log('fetchingHomes:', fetchingHomes);
        console.log('error:', error);
    }, [initialHomes, fetchingHomes, error]);

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
                            value={county}
                            options={countyOptions}
                            onChange={onCountyChange}
                        />
                        <HotsheetDropdown
                            value={city}
                            options={irgAreas.City}
                            onChange={onCityChange}
                        />
                        <HotsheetDropdown
                            value={zipcode}
                            options={irgAreas.Zip}
                            onChange={onZipChange}
                        />
                        <HotsheetDropdown
                            value={neighborhood}
                            options={irgAreas.Neighborhood}
                            onChange={onHoodChange}
                        />
                        <HotsheetDropdown
                            value={daysBack}
                            options={numDaysBack}
                            onChange={onDaysChange}
                        />
                        <HotsheetDropdown
                            value={limit}
                            options={limitOfHomes}
                            onChange={onLimitChange}
                        />
                        <h3 style={{ marginTop: '.8rem', marginLeft: '2.5rem' }}>
                            {initialHomes.length} Homes On Market
                        </h3>
                    </div>
                    <div className="hotsheet__homes" style={{ minHeight: '200px' }}>
                        {fetchingHomes ? (
                            <p>Loading homes...</p>
                        ) : error ? (
                            <p>Error fetching homes: {error}</p>
                        ) : initialHomes.length > 0 ? (
                            initialHomes.map((home) => (
                                <PrpCard key={home._id} property={home} />
                            ))
                        ) : (
                            <p>No homes found.</p>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Hotsheet;
