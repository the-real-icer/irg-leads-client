// React
import { useRef } from 'react';
import PropTypes from 'prop-types';

// Redux
import { useSelector } from 'react-redux';

import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';

import PropertyTypeFilter from '../PropertyTypeFilter/PropertyTypeFilter';
import SearchFilter from '../SearchFilter';

// IRG API - HOOKS - INFO - UTILS
import { priceFilterValues } from '../filterValues/priceFilterValues';
import { bedFilterValues } from '../filterValues/bedFilterValues';
import { sqftFilterValues } from '../filterValues/sqftFilterValues';
import { lotSizeFilterValues } from '../filterValues/lotSizeFilterValues';
import { yearFilterValues } from '../filterValues/yearFilterValues';
import { garageFilterValues } from '../filterValues/garageFilterValues';
import { bathFilterValues } from '../filterValues/bathFilterValues';
import {
    addMaxPrice,
    addMinPrice,
    addMinBeds,
    addMinSqFt,
    addMaxSqFt,
    addMinAcres,
    addMaxAcres,
    addMinYear,
    addMaxYear,
    addMinGarage,
    addMinBaths,
    singleStory,
    hasPool,
    ageRestrict,
} from '../../../../store/actions/searchFilters';

const MoreFilters = ({ width }) => {
    // const { theme, width } = props;
    // __________________Redux State______________________\\
    const searchFilter = useSelector((state) => state.searchFilter);
    const theme = 'light';

    const filterOverlay = useRef(null);

    const handleClick = (e) => {
        filterOverlay.current.show(e.target);
    };

    return (
        <div>
            {width > 900 ? (
                <Button
                    type="button"
                    aria-haspopup
                    aria-controls="overlay_panel"
                    label="More Filters"
                    onClick={handleClick}
                    className="p-button-outlined p-button-secondary  search__filters__btn"
                />
            ) : (
                <Button
                    type="button"
                    aria-haspopup
                    aria-controls="overlay_panel"
                    label="Filters"
                    onClick={handleClick}
                    className="p-button-outlined p-button-secondary  search__filters__btn"
                />
            )}
            <OverlayPanel ref={filterOverlay} showCloseIcon id="overlay_panel">
                <div
                    className={`search__more__filters__panel search__more__filters__panel-${theme}`}
                >
                    {width < 900 && (
                        <div className="search__more__filters__panel__row">
                            <p className="search__more__filters__panel__text">Price</p>
                            <div className="search__more__filters__panel__row__filters">
                                <SearchFilter
                                    options={{
                                        theme,
                                        placeholder: 'Min Price',
                                        defaultValueforFilter: 0,
                                        reduxFunction: addMinPrice,
                                        values: priceFilterValues,
                                        searchFilter: searchFilter.minPriceFilter,
                                        reducerFunction: () =>
                                            priceFilterValues.filter(
                                                (option) =>
                                                    option.value < searchFilter.maxPriceFilter
                                            ),
                                    }}
                                />
                                <SearchFilter
                                    options={{
                                        theme,
                                        placeholder: 'Max Price',
                                        defaultValueforFilter: 200000000,
                                        reduxFunction: addMaxPrice,
                                        values: priceFilterValues,
                                        searchFilter: searchFilter.maxPriceFilter,
                                        reducerFunction: () =>
                                            priceFilterValues.filter(
                                                (option) =>
                                                    option.value > searchFilter.minPriceFilter
                                            ),
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    {width < 1300 && (
                        <div className="search__more__filters__panel__row">
                            <p className="search__more__filters__panel__text">Bedrooms</p>
                            <div className="search__more__filters__panel__row__filters">
                                <SearchFilter
                                    options={{
                                        theme,
                                        placeholder: 'Min Beds',
                                        defaultValueforFilter: 0,
                                        reduxFunction: addMinBeds,
                                        values: bedFilterValues,
                                        searchFilter: searchFilter.minBedsFilter,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    {width < 1600 && (
                        <div className="search__more__filters__panel__row">
                            <p className="search__more__filters__panel__text">Square Feet</p>
                            <div className="search__more__filters__panel__row__filters">
                                <SearchFilter
                                    options={{
                                        theme,
                                        placeholder: 'Min SqFt',
                                        defaultValueforFilter: 0,
                                        reduxFunction: addMinSqFt,
                                        values: sqftFilterValues,
                                        searchFilter: searchFilter.minSqFtFilter,
                                        reducerFunction: () =>
                                            sqftFilterValues.filter(
                                                (option) =>
                                                    option.value < searchFilter.maxSqFtFilter
                                            ),
                                    }}
                                />
                                <SearchFilter
                                    options={{
                                        theme,
                                        placeholder: 'Max SqFt',
                                        defaultValueforFilter: 100000,
                                        reduxFunction: addMaxSqFt,
                                        values: sqftFilterValues,
                                        searchFilter: searchFilter.maxSqFtFilter,
                                        reducerFunction: () =>
                                            sqftFilterValues.filter(
                                                (option) =>
                                                    option.value > searchFilter.minSqFtFilter
                                            ),
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    <div className="search__more__filters__panel__row">
                        <p className="search__more__filters__panel__text">Property Types</p>
                        <div className="search__more__filters__panel__row__filters">
                            <PropertyTypeFilter />
                        </div>
                    </div>
                    <div className="search__more__filters__panel__row">
                        <p className="search__more__filters__panel__text">Lot Size</p>
                        <div className="search__more__filters__panel__row__filters">
                            {/* <MinLotFilter />
                            <MaxLotFilter /> */}
                            <SearchFilter
                                options={{
                                    theme,
                                    placeholder: 'Min Lot Size',
                                    defaultValueforFilter: 0,
                                    reduxFunction: addMinAcres,
                                    values: sqftFilterValues,
                                    searchFilter: searchFilter.minAcresFilter,
                                    reducerFunction: () =>
                                        lotSizeFilterValues.filter(
                                            (option) => option.value < searchFilter.maxAcresFilter
                                        ),
                                }}
                            />
                            <SearchFilter
                                options={{
                                    theme,
                                    placeholder: 'Max Lot Size',
                                    defaultValueforFilter: 10000,
                                    reduxFunction: addMaxAcres,
                                    values: sqftFilterValues,
                                    searchFilter: searchFilter.maxAcresFilter,
                                    reducerFunction: () =>
                                        lotSizeFilterValues.filter(
                                            (option) => option.value > searchFilter.minAcresFilter
                                        ),
                                }}
                            />
                        </div>
                    </div>
                    <div className="search__more__filters__panel__row">
                        <p className="search__more__filters__panel__text">Year Built</p>
                        <div className="search__more__filters__panel__row__filters">
                            {/* <MinYearFilter />
                            <MaxYearFilter /> */}
                            <SearchFilter
                                options={{
                                    theme,
                                    placeholder: 'Min Year',
                                    defaultValueforFilter: 0,
                                    reduxFunction: addMinYear,
                                    values: yearFilterValues,
                                    searchFilter: searchFilter.minYearFilter,
                                    reducerFunction: () =>
                                        yearFilterValues.filter(
                                            (option) => option.value < searchFilter.maxYearFilter
                                        ),
                                }}
                            />
                            <SearchFilter
                                options={{
                                    theme,
                                    placeholder: 'Max Year',
                                    defaultValueforFilter: 2100,
                                    reduxFunction: addMaxYear,
                                    values: yearFilterValues,
                                    searchFilter: searchFilter.maxYearFilter,
                                    reducerFunction: () =>
                                        yearFilterValues.filter(
                                            (option) => option.value > searchFilter.minYearFilter
                                        ),
                                }}
                            />
                        </div>
                    </div>
                    <div className="search__more__filters__panel__row">
                        <p className="search__more__filters__panel__text">Garage & Baths</p>
                        <div className="search__more__filters__panel__row__filters">
                            <SearchFilter
                                options={{
                                    theme,
                                    placeholder: 'Min Cars',
                                    defaultValueforFilter: 0,
                                    reduxFunction: addMinGarage,
                                    values: garageFilterValues,
                                    searchFilter: searchFilter.minGarageFilter,
                                }}
                            />
                            <SearchFilter
                                options={{
                                    theme,
                                    placeholder: 'Min Baths',
                                    defaultValueforFilter: 0,
                                    reduxFunction: addMinBaths,
                                    values: bathFilterValues,
                                    searchFilter: searchFilter.minBathsFilter,
                                }}
                            />
                        </div>
                    </div>
                    <div className="search__more__filters__panel__row">
                        <p className="search__more__filters__panel__text">Single Story Only</p>
                        <div className="search__more__filters__panel__row__filters">
                            <SearchFilter
                                options={{
                                    theme,
                                    placeholder: 'No',
                                    defaultValueforFilter: 'No',
                                    reduxFunction: singleStory,
                                    values: [{ value: 'Yes', label: 'Yes' }],
                                    searchFilter: searchFilter.singleStoryFilter,
                                }}
                            />
                        </div>
                    </div>
                    <div className="search__more__filters__panel__row">
                        <p className="search__more__filters__panel__text">Must Have Pool</p>
                        <div className="search__more__filters__panel__row__filters">
                            <SearchFilter
                                options={{
                                    theme,
                                    placeholder: 'No',
                                    defaultValueforFilter: false,
                                    reduxFunction: hasPool,
                                    values: [{ value: true, label: 'Yes' }],
                                    searchFilter: searchFilter.poolFilter,
                                }}
                            />
                        </div>
                    </div>
                    <div className="search__more__filters__panel__row">
                        <p className="search__more__filters__panel__text">Senior Communities?</p>
                        <div className="search__more__filters__panel__row__filters">
                            <SearchFilter
                                options={{
                                    theme,
                                    placeholder: 'No',
                                    defaultValueforFilter: false,
                                    reduxFunction: ageRestrict,
                                    values: [{ value: true, label: 'Yes' }],
                                    searchFilter: searchFilter.ageRestrictFilter,
                                }}
                            />
                        </div>
                    </div>
                    {/* <div className="search__more__filters__panel__row">
                        <p className="search__more__filters__panel__text">Reset Filters</p>
                        <div className="search__more__filters__panel__row__filters"></div>
                    </div> */}
                    <div className="search__more__filters__panel__row" />
                </div>
            </OverlayPanel>
        </div>
    );
};

MoreFilters.propTypes = {
    width: PropTypes.number.isRequired,
};

export default MoreFilters;
