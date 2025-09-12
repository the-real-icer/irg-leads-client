// React
// import React from 'react';

// Redux
import { useSelector } from 'react-redux';

// Third Party Hooks
import { useWindowSize } from 'react-use';

// Third Party Components
import { Button } from 'primereact/button';

// IRG Components
import MoreFilters from './MoreFilters/MoreFilters';
import SearchFilter from './SearchFilter';

// IRG API - HOOKS - INFO - UTILS
import { priceFilterValues } from './filterValues/priceFilterValues';
import { bedFilterValues } from './filterValues/bedFilterValues';
import { sqftFilterValues } from './filterValues/sqftFilterValues';
import {
    addMaxPrice,
    addMinPrice,
    addMinBeds,
    addMinSqFt,
    addMaxSqFt,
} from '../../../store/actions/searchFilters';

const SearchFilters = () => {
    // const { handleToast, theme } = props;
    // __________________Redux State______________________\\
    const searchFilter = useSelector((state) => state.searchFilter);

    // _____________________Hooks_____________________\\
    const { width } = useWindowSize();
    // const dispatch = useDispatch();

    const theme = 'light';
    // const onResetButtonClick = () => {
    //     props.resetFilters(true);

    //     const content = (
    //         <div className="p-flex p-flex-column" style={{ flex: '1' }}>
    //             <div className="p-text-center">
    //                 <h2 className="p-mt-4 p-mb-4">Filters Reset!</h2>
    //             </div>
    //         </div>
    //     );
    //     handleToast({ severity: 'success', content, life: 3000 });
    // };

    // const onButtonClick = () => {
    //     if (props.isLoggedIn) {
    //         props.saveSearchClick();
    //     } else {
    //         const content = (
    //             <div className="p-flex p-flex-column" style={{ flex: '1' }}>
    //                 <div className="p-text-center">
    //    <i className="pi pi-exclamation-triangle" style={{ fontSize: '3rem' }}></i>
    //                     <h2 className="p-mt-4 p-mb-4">Please Login or Create An Account</h2>
    //                 </div>
    //             </div>
    //         );

    //         handleToast({ severity: 'warn', content, life: 3000 });
    //     }
    // };

    return (
        <div className={`Search__Filters Search__Filters-${theme}`}>
            {width > 900 && (
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
                                (option) => option.value < searchFilter.maxPriceFilter
                            ),
                    }}
                />
            )}
            {width > 900 && (
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
                                (option) => option.value > searchFilter.minPriceFilter
                            ),
                    }}
                />
            )}
            {width > 1300 && (
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
            )}
            {width > 1600 && (
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
                                (option) => option.value < searchFilter.maxSqFtFilter
                            ),
                    }}
                />
            )}
            {width > 1600 && (
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
                                (option) => option.value > searchFilter.minSqFtFilter
                            ),
                    }}
                />
            )}
            {width > 900 ? (
                <Button
                    type="button"
                    label="Reset Filters"
                    className="p-button-outlined p-button-secondary search__filters__btn"
                    // onClick={onResetButtonClick}
                />
            ) : (
                <MoreFilters width={width} />
            )}
            {width < 900 ? (
                <Button
                    type="button"
                    label="Reset Filters"
                    className="p-button-outlined p-button-secondary search__filters__btn"
                    // onClick={onResetButtonClick}
                />
            ) : (
                <MoreFilters width={width} />
            )}
            <Button
                type="button"
                label="Save Search"
                className="p-button-outlined p-button-primary search__filters__btn"
                // onClick={onButtonClick}
            />
        </div>
    );
};

export default SearchFilters;
