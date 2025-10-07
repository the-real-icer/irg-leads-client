import {
    FETCH_HOTSHEET_HOMES,
    FETCH_HOTSHEET_HOMES_ERROR,
    CHANGE_COUNTY,
    CHANGE_CITY,
    CHANGE_ZIPCODE,
    CHANGE_NEIGHBORHOOD,
    CHANGE_DAYS_BACK,
    CHANGE_LIMIT,
    FETCHING_HOMES,
} from './types';

import IrgApi from '../../assets/irgApi';

// Fetch HotSheet Homes
export function fetchHotsheetHomes({ days, city, hood, zip, limit, county }) {
    const params = `days=${days}&city=${city}&hood=${hood}&zip=${zip}&limit=${limit}&county=${county}`;

    return async function fetchHotsheetHomesThunk(dispatch) {
        try {
            dispatch(fetchingHomes(true)); // Set loading state
            const response = await IrgApi.get(
                `/mlsproperties/hotsheet?${params}`
            );
            // Ensure payload is an array
            const homes = Array.isArray(response.data.data.properties) ? response.data.data.properties : [];
            dispatch({ type: FETCH_HOTSHEET_HOMES, payload: homes });
        } catch (error) {
            console.error('Fetch homes error:', error.message); // eslint-disable-line
            dispatch({ type: FETCH_HOTSHEET_HOMES_ERROR, payload: error.message });
        } finally {
            dispatch(fetchingHomes(false)); // Reset loading state
        }
    };
}

// Change County
export function changeCounty(county) {
    return {
        type: CHANGE_COUNTY,
        payload: county,
    };
}

// Change City
export function changeCity(city) {
    return {
        type: CHANGE_CITY,
        payload: city,
    };
}

// Change Neighborhood
export function changeNeighborhood(neighborhood) {
    return {
        type: CHANGE_NEIGHBORHOOD,
        payload: neighborhood,
    };
}

// Change Zipcode
export function changeZipcode(zipcode) {
    return {
        type: CHANGE_ZIPCODE,
        payload: zipcode,
    };
}

// Change Days Back
export function changeDaysBack(days) {
    return {
        type: CHANGE_DAYS_BACK,
        payload: days,
    };
}

// Change Num of Days
export function changeLimit(limit) {
    return {
        type: CHANGE_LIMIT,
        payload: limit,
    };
}

// Change Fetching Homes
export function fetchingHomes(bool) {
    return {
        type: FETCHING_HOMES,
        payload: bool,
    };
}
