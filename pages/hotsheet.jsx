// React
import { useEffect, useCallback } from 'react';
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

    // Default parameters
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
    const { county, city, neighborhood, zipcode, daysBack, limit, initialHomes } =
        useSelector((state) => state.hotsheet);
    const irgAreas = useSelector((state) => state.irgAreas);

    // _____________________Hooks_____________________\\
    const dispatch = useDispatch();



    // Fetch homes with current parameters
    const fetchHomes = useCallback(
        (params) => {
            console.log('Fetching homes with params:', params) // eslint-disable-line
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
        return Number(value) || defaultValue; // Ensure numeric value
    };

    // Event handlers
    const onCityChange = useCallback(
        (e) => {
            const value = e.value?.name || '';
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
            fetchHomes(params);
        },
        [dispatch, fetchHomes, county, neighborhood, zipcode, daysBack, limit],
    );

    const onZipChange = useCallback(
        (e) => {
            const value = e.value?.name || '';
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
            fetchHomes(params);
        },
        [dispatch, fetchHomes, county, city, neighborhood, daysBack, limit],
    );

    const onHoodChange = useCallback(
        (e) => {
            const value = e.value?.name || '';
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
            fetchHomes(params);
        },
        [dispatch, fetchHomes, county, city, zipcode, daysBack, limit],
    );

    const onDaysChange = useCallback(
        (e) => {
            const value = e.value?.name ?? defaultParams.days; // Use ?? to handle null/undefined
            dispatch(changeDaysBack(value));
            const params = {
                ...defaultParams,
                county: formatStringParam(county, defaultParams.county),
                city: formatStringParam(city),
                hood: formatStringParam(neighborhood),
                zip: formatStringParam(zipcode),
                days: formatNumericParam(value, defaultParams.days),
                limit: formatNumericParam(limit, defaultParams.limit),
            };
            fetchHomes(params);
        },
        [dispatch, fetchHomes, county, city, neighborhood, zipcode, limit],
    );

    const onLimitChange = useCallback(
        (e) => {
            const value = e.value?.name ?? defaultParams.limit; // Use ?? to handle null/undefined
            dispatch(changeLimit(value));
            const params = {
                ...defaultParams,
                county: formatStringParam(county, defaultParams.county),
                city: formatStringParam(city),
                hood: formatStringParam(neighborhood),
                zip: formatStringParam(zipcode),
                days: formatNumericParam(daysBack, defaultParams.days),
                limit: formatNumericParam(value, defaultParams.limit),
            };
            fetchHomes(params);
        },
        [dispatch, fetchHomes, county, city, neighborhood, zipcode, daysBack],
    );

    const onCountyChange = useCallback(
        (e) => {
            const value = e.value?.name || '';
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
            fetchHomes(params);
        },
        [dispatch, fetchHomes, city, neighborhood, zipcode, daysBack, limit],
    );

    // Fetch homes on mount
    useEffect(() => {
        // Only fetch if initialHomes is empty to avoid redundant requests
        if (!initialHomes.length && !fetchingHomes) {
            fetchHomes(defaultParams);
        }
    }, [fetchHomes, initialHomes.length, fetchingHomes]);

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
                    <div className="hotsheet__homes">
                        {initialHomes.length > 0 &&
                            initialHomes.map((home) => (
                                <PrpCard key={home._id} property={home} />
                            ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Hotsheet;
