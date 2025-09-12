// React
import { useEffect } from 'react';

// Redux
import { useSelector, useDispatch } from 'react-redux';

// IRG Components
import MainLayout from '../components/layout/MainLayout';
import PrpCard from '../components/prpCard/PrpCard';
import HotsheetDropdown from '../components/Hotsheet/HotsheetDropdown';

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

    // Get Homes based on Updated Parameters
    useEffect(() => {
        let days = 3;
        let limit = 100;
        const city = hotsheet.city.toLowerCase().replace(/\s/g, '-');
        const neighborhood = hotsheet.neighborhood.toLowerCase().replace(/\s/g, '-');
        const county = hotsheet.county.toLowerCase().replace(/\s/g, '-');

        // check if Days Back is seletected
        if (hotsheet.daysBack !== '# of Days Back') {
            days = hotsheet.daysBack;
        }

        // Check if limit is selected
        if (hotsheet.limit !== '# of Homes') {
            limit = hotsheet.limit;
        }

        // Check if city is selected
        if (hotsheet.city !== 'Select A City' && hotsheet.fetchingHomes) {
            dispatch(fetchHotsheetHomes({ days, limit, city, county: '', hood: '', zip: '' }));
        }

        // Check if County is Selected
        if (hotsheet.county !== 'Select A County' && hotsheet.fetchingHomes) {
            dispatch(fetchHotsheetHomes({ days, limit, county, city: '', hood: '', zip: '' }));
        }

        // Check if Neighborhood is selected
        if (hotsheet.neighborhood !== 'Select A Neighborhood' && hotsheet.fetchingHomes) {
            dispatch(
                fetchHotsheetHomes({
                    days,
                    limit,
                    city: '',
                    county: '',
                    hood: neighborhood,
                    zip: '',
                })
            );
        }

        // Check if Zipcode is Selected
        if (hotsheet.zipcode !== 'Select A Zipcode' && hotsheet.fetchingHomes) {
            dispatch(
                fetchHotsheetHomes({
                    days,
                    limit,
                    city: '',
                    county: '',
                    hood: '',
                    zip: hotsheet.zipcode,
                })
            );
        }
    }, [hotsheet, dispatch]);

    // UseEffect to handle edge case of filter reset
    useEffect(() => {
        let days = 3;
        let limit = 100;

        // check if Days Back is seletected
        if (hotsheet.daysBack !== '# of Days Back') {
            days = hotsheet.daysBack;
        }

        // Check if limit is selected
        if (hotsheet.limit !== '# of Homes') {
            limit = hotsheet.limit;
        }

        if (
            hotsheet.city === 'Select A City' &&
            hotsheet.county === 'Select A County' &&
            hotsheet.neighborhood === 'Select A Neighborhood' &&
            hotsheet.zipcode === 'Select A Zipcode' &&
            hotsheet.fetchingHomes
        ) {
            dispatch(
                fetchHotsheetHomes({
                    days,
                    limit,
                    city: '',
                    county: 'san-diego',
                    hood: '',
                    zip: '',
                })
            );
        }
    }, [hotsheet, dispatch]);

    const onCityChange = (e) => {
        if (e.value) {
            dispatch(changeCity(e.value.name));
            dispatch(fetchingHomes(true));
        } else {
            dispatch(changeCity('Select A City'));
            dispatch(fetchingHomes(true));
        }
    };

    const onZipChange = (e) => {
        if (e.value) {
            dispatch(changeZipcode(e.value.name));
            dispatch(fetchingHomes(true));
        } else {
            dispatch(changeZipcode('Select A Zipcode'));
            dispatch(fetchingHomes(true));
        }
    };

    const onHoodChange = (e) => {
        if (e.value) {
            dispatch(changeNeighborhood(e.value.name));
            dispatch(fetchingHomes(true));
        } else {
            dispatch(changeNeighborhood('Select A Neighborhood'));
            dispatch(fetchingHomes(true));
        }
    };

    const onDaysChange = (e) => {
        if (e.value) {
            dispatch(changeDaysBack(e.value.name));
            dispatch(fetchingHomes(true));
        } else {
            dispatch(changeDaysBack('# of Days Back'));
            dispatch(fetchingHomes(true));
        }
    };

    const onLimitChange = (e) => {
        if (e.value) {
            dispatch(changeLimit(e.value.name));
            dispatch(fetchingHomes(true));
        } else {
            dispatch(changeLimit('# of Homes'));
            dispatch(fetchingHomes(true));
        }
    };

    const onCountyChange = (e) => {
        if (e.value) {
            dispatch(changeCounty(e.value.name));
            dispatch(fetchingHomes(true));
        } else {
            dispatch(changeCounty('Select A County'));
            dispatch(fetchingHomes(true));
        }
    };

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
                        {hotsheet.initialHomes.length > 0 &&
                            hotsheet.initialHomes.map((home) => (
                                <PrpCard key={home._id} property={home} />
                            ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Hotsheet;
