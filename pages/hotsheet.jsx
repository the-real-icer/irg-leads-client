import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSelector, useDispatch } from 'react-redux';
import { useInterval } from 'react-use';

import MainLayout from '../components/layout/MainLayout';
import PrpCard from '../components/prpCard/PrpCard';
import MapDialog from '../components/Shared/MapDialog';

const HotsheetDropdown = dynamic(() => import('../components/Hotsheet/HotsheetDropdown'), {
    ssr: false,
});
const AutoComplete = dynamic(
    () => import('primereact/autocomplete').then((mod) => mod.AutoComplete || mod.default),
    { ssr: false },
);

import { fetchHotsheetHomes, changeCounty } from '../store/actions/hotsheet';

const countyOptions = [
    { name: 'San Diego' },
    { name: 'Orange' },
    { name: 'Riverside' },
    { name: 'Los Angeles' },
    { name: 'San Bernardino' },
];

const numDaysBack = [
    { name: 1 },
    { name: 2 },
    { name: 3 },
    { name: 5 },
    { name: 7 },
    { name: 14 },
    { name: 30 },
];

const limitOfHomes = [
    { name: 10 },
    { name: 15 },
    { name: 20 },
    { name: 25 },
    { name: 50 },
    { name: 100 },
    { name: 200 },
];

const Hotsheet = () => {
    const { county, initialHomes, fetchingHomes, error } = useSelector((state) => state.hotsheet);
    const dispatch = useDispatch();
    const hasFetchedInitial = useRef(false);

    // Local filter state (frontend-only, no API calls)
    const [daysBack, setDaysBack] = useState(7);
    const [limit, setLimit] = useState(100);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    // Map dialog
    const [showMapDialog, setShowMapDialog] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState({});

    const handleOpenMapDialog = (property) => {
        setShowMapDialog(true);
        setSelectedProperty(property);
    };
    const handleCloseMapDialog = () => {
        setShowMapDialog(false);
        setSelectedProperty({});
    };

    // _______________API Fetch (on mount + county change + every 3 min)_______________
    useEffect(() => {
        if (!hasFetchedInitial.current) {
            dispatch(fetchHotsheetHomes(county));
            hasFetchedInitial.current = true;
        }
    }, []); // eslint-disable-line

    // Auto-refresh every 3 minutes
    useInterval(() => {
        dispatch(fetchHotsheetHomes(county));
    }, 3 * 60 * 1000);

    // Clear frontend filters only when county changes (not on auto-refresh)
    useEffect(() => {
        setSelectedFilters([]);
    }, [county]);

    // _______________Dropdown Handlers_______________
    const onCountyChange = useCallback(
        (e) => {
            const value = e.value?.name || '';
            if (value && value !== county) {
                dispatch(changeCounty(value));
                dispatch(fetchHotsheetHomes(value));
            }
        },
        [dispatch, county],
    );

    const onDaysChange = useCallback((e) => {
        const value = Number(e.value?.name);
        if (value) setDaysBack(value);
    }, []);

    const onLimitChange = useCallback((e) => {
        const value = Number(e.value?.name);
        if (value) setLimit(value);
    }, []);

    // _______________Autocomplete: Build suggestions from loaded properties_______________
    const allFilterOptions = useMemo(() => {
        if (!initialHomes.length) return [];
        const citySet = new Set();
        const zipSet = new Set();

        initialHomes.forEach((home) => {
            if (home.city) citySet.add(home.city);
            if (home.zip_code) zipSet.add(home.zip_code);
        });

        const options = [];
        [...citySet].sort().forEach((c) =>
            options.push({ label: `City: ${c}`, type: 'city', value: c }),
        );
        [...zipSet].sort((a, b) => a - b).forEach((z) =>
            options.push({ label: `Zip: ${z}`, type: 'zip', value: z }),
        );
        return options;
    }, [initialHomes]);

    const searchFilters = useCallback(
        (event) => {
            const query = (event.query || '').toLowerCase().trim();
            if (!query) {
                setSuggestions(allFilterOptions);
                return;
            }
            const selectedLabels = new Set(selectedFilters.map((f) => f.label));
            const filtered = allFilterOptions.filter(
                (opt) => opt.label.toLowerCase().includes(query) && !selectedLabels.has(opt.label),
            );
            setSuggestions(filtered);
        },
        [allFilterOptions, selectedFilters],
    );

    const filterItemTemplate = (item) => (
        <div className="hotsheet__suggestion">
            <span className="hotsheet__suggestion-label">{item.label}</span>
        </div>
    );

    // _______________Frontend Filtering (days + city/zip + limit)_______________
    const displayedHomes = useMemo(() => {
        const now = Date.now();
        const cutoff = now - daysBack * 24 * 60 * 60 * 1000;

        const selectedCities = selectedFilters.filter((f) => f.type === 'city').map((f) => f.value);
        const selectedZips = selectedFilters.filter((f) => f.type === 'zip').map((f) => f.value);

        const filtered = initialHomes.filter((home) => {
            // Filter by days back
            const created = new Date(home.date_created).getTime();
            if (created < cutoff) return false;

            // Filter by city/zip autocomplete
            const matchesCity = !selectedCities.length || selectedCities.includes(home.city);
            const matchesZip = !selectedZips.length || selectedZips.includes(home.zip_code);
            return matchesCity && matchesZip;
        });

        return filtered.slice(0, limit);
    }, [initialHomes, daysBack, limit, selectedFilters]);

    // Total matching (before limit) for display
    const totalMatching = useMemo(() => {
        const now = Date.now();
        const cutoff = now - daysBack * 24 * 60 * 60 * 1000;

        const selectedCities = selectedFilters.filter((f) => f.type === 'city').map((f) => f.value);
        const selectedZips = selectedFilters.filter((f) => f.type === 'zip').map((f) => f.value);

        return initialHomes.filter((home) => {
            const created = new Date(home.date_created).getTime();
            if (created < cutoff) return false;
            const matchesCity = !selectedCities.length || selectedCities.includes(home.city);
            const matchesZip = !selectedZips.length || selectedZips.includes(home.zip_code);
            return matchesCity && matchesZip;
        }).length;
    }, [initialHomes, daysBack, selectedFilters]);

    return (
        <MainLayout title="Hotsheet">
            <MapDialog
                showMapDialog={showMapDialog}
                handleCloseMapDialog={handleCloseMapDialog}
                property={selectedProperty}
            />
            <div className="hotsheet">
                <div className="hotsheet__container">
                    <div className="hotsheet__filters">
                        <AutoComplete
                            value={selectedFilters}
                            suggestions={suggestions}
                            completeMethod={searchFilters}
                            onChange={(e) => setSelectedFilters(e.value)}
                            itemTemplate={filterItemTemplate}
                            field="label"
                            placeholder={selectedFilters.length ? '' : 'Filter by city or zipcode...'}
                            multiple
                            className="hotsheet__search"
                            panelClassName="hotsheet__search-panel"
                            delay={100}
                            minLength={0}
                        />

                        <HotsheetDropdown
                            value={county}
                            options={countyOptions}
                            onChange={onCountyChange}
                        />
                        <HotsheetDropdown
                            value={String(daysBack)}
                            options={numDaysBack}
                            onChange={onDaysChange}
                        />
                        <HotsheetDropdown
                            value={String(limit)}
                            options={limitOfHomes}
                            onChange={onLimitChange}
                        />
                        <span className="hotsheet__home-count">
                            {displayedHomes.length}{totalMatching > limit ? ` of ${totalMatching}` : ''} Homes
                        </span>
                    </div>

                    <div className="hotsheet__homes">
                        {fetchingHomes ? (
                            <p>Loading homes...</p>
                        ) : error ? (
                            <p>Error fetching homes: {error}</p>
                        ) : displayedHomes.length > 0 ? (
                            displayedHomes.map((home) => (
                                <PrpCard key={home._id} property={home} handleOpenMapDialog={handleOpenMapDialog} />
                            ))
                        ) : (
                            <p>{initialHomes.length ? 'No homes match your filters.' : 'No homes found.'}</p>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Hotsheet;
